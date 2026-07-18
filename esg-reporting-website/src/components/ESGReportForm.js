import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './ESGReportForm.css';
import { supabase } from '../data/SupabaseConfig';
import {
  getAnswer, getLinkedQuestionIds, isAnswered, loadESGDraft,
  normalizeQuestionId, propagateLinkedAnswer, questionMatchesSector, saveESGAnswers,
} from '../utils/answerManagement';

const COUNTRY_FRAMEWORKS = {
  'United States': ['SASB', 'TCFD', 'GRI'],
  'United Kingdom': ['TCFD', 'SASB', 'GRI'],
  'European Union': [ 'TCFD', 'SASB', 'GRI'],
  India: ['BRSR', 'GRI', 'SASB', 'TCFD'],
  Canada: ['SASB', 'TCFD', 'GRI'],
  Australia: ['SASB', 'TCFD', 'GRI'],
  Singapore: ['SASB', 'TCFD', 'GRI'],
  'United Arab Emirates': ['SASB', 'TCFD', 'GRI'],
  Other: ['GRI', 'SASB', 'TCFD'],
};

const ALL_FRAMEWORKS = [
  'GRI',
  'SASB',
  'TCFD',
  'UNGC',
  'BRSR',
];

const SUPPORTING_DOCUMENTS = [
  { key: 'financialStatements', label: 'Financial Statements' },
  { key: 'electricityBills', label: 'Electricity Bills' },
  { key: 'fuelInvoices', label: 'Fuel Invoices' },
  { key: 'waterBills', label: 'Water Bills' },
  { key: 'wasteDisposalRecords', label: 'Waste Disposal Records' },
  { key: 'employeeRegister', label: 'Employee Register' },
  { key: 'payrollRegister', label: 'Payroll Register' },
  { key: 'healthSafetyRegister', label: 'Health & Safety Register' },
  { key: 'supplierList', label: 'Supplier List' },
  { key: 'companyPolicies', label: 'Company Policies (HR, Ethics, Anti-Harassment)' },
  { key: 'managementMeetingMinutes', label: 'Management Meeting Minutes' },
  { key: 'esgCsrEvidence', label: 'ESG/CSR Activities Evidence (photos, invoices, receipts)' },
  { key: 'isoCertificates', label: 'ISO Certificates (if applicable)' },
];

const FILE_ACCEPT_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg';
const DOCUMENTS_BUCKET = 'Documents';

const fileToDocumentMeta = (file) => ({
  name: file.name,
  size: file.size,
  type: file.type,
  lastModified: file.lastModified,
});

const sanitizeDocumentPart = (value, fallback) => {
  const sanitized = String(value || fallback)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized || fallback;
};

const getFileExtension = (fileName) => {
  const extension = String(fileName || '').split('.').pop();
  return extension && extension !== fileName ? extension.toLowerCase() : 'pdf';
};

const buildStorageDocumentName = (documentType, organizationName, fileName) => {
  const type = sanitizeDocumentPart(documentType, 'Document');
  const date = new Date().toISOString().slice(0, 10);
  const organization = sanitizeDocumentPart(organizationName, 'Organization');
  return `${type}_${date}_${organization}.${getFileExtension(fileName)}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


const getFrameworksForCountry = (country) => {
  if (!country) return [];
  return COUNTRY_FRAMEWORKS[country] || COUNTRY_FRAMEWORKS.Other;
};

const INDUSTRY_SECTOR_ALIASES = {
  'Financial Services': 'Finance',
  'Renewable Energy': 'Energy',
  'Infrastructure & Real Estate': 'Construction',
};

const normalizeIndustrySector = (industry) => {
  if (!industry) return '';
  return INDUSTRY_SECTOR_ALIASES[industry] || industry;
};

const isUniversalQuestion = (question) => !question.sector && !question.framework;

const questionMatchesAnyFramework = (questionFramework, selectedFrameworks) => {
  if (!selectedFrameworks.length || !questionFramework) return true;
  const normalizedQuestionFramework = String(questionFramework).toLowerCase();
  return selectedFrameworks.some((framework) =>
    normalizedQuestionFramework.includes(String(framework).toLowerCase())
  );
};

const questionMatchesCompanyInfo = (question, industry, frameworks) => {
  if (isUniversalQuestion(question)) return true;

  const sector = normalizeIndustrySector(industry);
  const hasSector = Boolean(sector);
  const hasFrameworks = frameworks.length > 0;

  if (!hasSector && !hasFrameworks) return false;

  const questionSector = question.sector || '';
  const matchesSector =
    !hasSector
    || !questionSector
    || questionMatchesSector(question, sector);
  const matchesFramework =
    !hasFrameworks
    || !question.framework
    || questionMatchesAnyFramework(question.framework, frameworks);

  return matchesSector && matchesFramework;
};

const DEFAULT_ANSWER_MARKER = ' *';

const getDefaultQuestionAnswer = (question) => {
  const type = String(question.questionType || '').toLowerCase();
  if (type === 'yes/no') return 'No';
  if (type === 'numeric') return '0';
  if (type === 'date') return new Date().toISOString().slice(0, 10);
  if (type === 'multiple choice') {
    const options = Array.isArray(question.options) ? question.options.filter(Boolean) : [];
    return options[0] || '[sample answer]';
  }
  return '[sample answer]';
};

const hasAnsweredQuestion = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
};

const buildQuestionWithAnswer = (question, answers) => {
  const rawAnswer = answers[question.id];
  const hasAnswer = hasAnsweredQuestion(rawAnswer);
  const resolvedAnswer = hasAnswer ? rawAnswer : getDefaultQuestionAnswer(question);

  return {
    ...question,
    answer: `${String(resolvedAnswer)}${hasAnswer ? '' : DEFAULT_ANSWER_MARKER}`,
    isDefaultAnswer: !hasAnswer,
  };
};

const buildQuestionJson = (allQuestions, visibleQuestions, answers) => {
  const normalizedAnswers = answers || {};
  const visibleIds = new Set(visibleQuestions.map((question) => normalizeQuestionId(question.id)));

  return allQuestions.reduce((result, question) => {
    const id = normalizeQuestionId(question.id);
    if (!id) return result;

    const answer = getAnswer(normalizedAnswers, id);
    result[id] = visibleIds.has(id) && isAnswered(answer) ? answer : '';
    return result;
  }, {});
};

const ESGReportForm = () => {
  const history = useHistory();
  const location = useLocation();
  const presetCompany = (location && location.state && location.state.presetCompany) || null;

  const [openTipId, setOpenTipId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [manuallyEditedAnswers, setManuallyEditedAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [supportingDocuments, setSupportingDocuments] = useState({});
  const [documentStorageStatus, setDocumentStorageStatus] = useState('');

  const handleQuestionAnswer = (id, value) => {
    const normalizedId = normalizeQuestionId(id);
    setManuallyEditedAnswers((prev) => ({ ...prev, [normalizedId]: true }));
    setQuestionAnswers((prev) => propagateLinkedAnswer(
      prev, questions, normalizedId, value, manuallyEditedAnswers
    ));
    setHasUnsavedChanges(true);
    setSaveError('');
  };

  const renderQuestionInput = (q) => {
    const type = String(q.questionType || '').toLowerCase();
    const value = getAnswer(questionAnswers, q.id);

    if (type === 'yes/no') {
      return (
        <select className="question-answer-input" value={value === undefined ? '' : String(value)}
          onChange={(e) => handleQuestionAnswer(q.id, e.target.value === 'true')}>
          <option value="">Select an answer</option><option value="true">Yes</option><option value="false">No</option>
        </select>
      );
    }

    if (type === 'numeric') {
      return (
        <input
          type="number"
          className="question-answer-input"
          value={value ?? ''}
          onChange={(e) => handleQuestionAnswer(q.id, e.target.value)}
          placeholder="Enter a number"
        />
      );
    }
    if (type === 'date') {
      return (
        <input
          type="date"
          className="question-answer-input"
          value={value ?? ''}
          onChange={(e) => handleQuestionAnswer(q.id, e.target.value)}
          placeholder="Enter a date"
        />
      );
    }
    if (type === 'text') {
      return (
        <textarea
          className="question-answer-input"
          value={value ?? ''}
          onChange={(e) => handleQuestionAnswer(q.id, e.target.value)}
          placeholder="Enter your answer"
        />
      );
    }

    if (type === 'multiple choice') {
      const options = Array.isArray(q.options) ? q.options : [];
      return (
        <select
          className="question-answer-input"
          value={value ?? ''}
          onChange={(e) => handleQuestionAnswer(q.id, e.target.value)}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        className="question-answer-input"
        value={value ?? ''}
        onChange={(e) => handleQuestionAnswer(q.id, e.target.value)}
        placeholder="Enter your answer"
      />
    );
  };

  useEffect(() => {
    let cancelled = false;

    fetch(`${process.env.PUBLIC_URL || ''}/questions.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load questions');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setQuestions(Array.isArray(data) ? data : []);
          setQuestionsError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestions([]);
          setQuestionsError('Unable to load questions. Please try again later.');
        }
      })
      .finally(() => {
        if (!cancelled) setQuestionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest && e.target.closest('[data-tip-root="true"]')) return;
      setOpenTipId(null);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const InfoTip = ({ id, text }) => (
    <span className="info-tip" data-tip-root="true">
      <button
        type="button"
        className="info-tip-btn"
        aria-label="Show input hint"
        aria-expanded={openTipId === id}
        onClick={() => setOpenTipId((prev) => (prev === id ? null : id))}
      >
        i
      </button>
      {openTipId === id ? <span className="info-tip-pop">{text}</span> : null}
    </span>
  );

  const [formData, setFormData] = useState(() => {
    const base = {
      // Company Information
      companyName: '',
      industry: '',
      reportingPeriod: new Date().getFullYear().toString(),
      hqLocation: '',
      esgFrameworks: [],
      employeeCount: '',
      revenue: '',
      website: '',
      // GRI (questionnaires)
      griOwnershipStructure: '',
      griMarketsServed: '',
      griScaleOfOrganization: '',
      griKeyIros: '',
      griSustainabilityBusinessStrategyAlignment: '',
      griValuesAndCodeOfConduct: '',
      griGovernanceStructureBoardComposition: '',
      griMaterialTopicsIdentification: '',
      griMaterialityMethodology: '',
      griTopEsgMaterialIssues: '',
      griMaterialityAssessmentFrequency: '',
      griEnergyIntensityPerUnitOutput: '',
      griEnergyReductionInitiatives: '',
      griEmissionIntensity: '',
      griTotalWaterWithdrawalBySource: '',
      griDischargeQualityAndTreatment: '',
      griWasteRecyclingAndDisposalMethods: '',
      griOperationsInProtectedAreas: '',
      griBiodiversityImpact: '',
      griBiodiversityRestorationInitiatives: '',
      griNewHiresAndTurnoverRate: '',
      griEmployeeBenefits: '',
      griWorkerRepresentationUnions: '',
      griSupplierHumanRightsScreening: '',
      griProductSafetyIncidents: '',
      griMarketingLabelingCompliance: '',
      griEconomicPerformanceFinancials: '',
      griGovernmentFinancialAssistance: '',
      griCorruptionIncidents: '',
      griAntiCorruptionTraining: '',
      griLocalSuppliersPercent: '',
      griSupplierSelectionEsgCriteria: '',
      griManufacturingResourceEfficiency: '',
      griManufacturingWasteReductionTechniques: '',
      griManufacturingSustainableRawMaterialSourcingPolicies: '',
      griTechDataPrivacyCybersecurityMeasures: '',
      griTechDataCenterEnergyUsage: '',
      griTechEwasteManagementPractices: '',
      griFinanceEsgIntegrationInLendingInvestments: '',
      griFinanceExposureToHighCarbonIndustries: '',
      griFinanceFinancialInclusionInitiatives: '',
      griRetailSustainablePackagingPractices: '',
      griRetailSupplyChainTraceability: '',
      griRetailProductLifecycleImpact: '',
      griEnergyTransitionToRenewables: '',
      griEnergySpillIncidentsEnvironmentalRisks: '',
      griEnergyCarbonNeutralityTargets: '',
      griHealthcareDrugSafetyAndClinicalTrialEthics: '',
      griHealthcareAccessToMedicines: '',
      griHealthcareComplianceWithHealthRegulations: '',
      // Common questions for all frameworks/sectors
      commonLegalNameAddressCountries: '',
      commonBusinessActivitiesProducts: '',
      commonEmployeesByGenderTypeLocation: '',
      commonSupplyChainStructure: '',
      commonBoardOversight: '',
      commonManagementResponsibility: '',
      commonKpiLinkedCompensation: '',
      commonLeadershipStatement: '',
      commonStrategyIntegration: '',
      commonCodeOfConduct: '',
      commonAntiBriberyPolicy: '',
      commonEthicsViolations: '',
      commonWhistleblowerMechanism: '',
      commonEthicsTraining: '',
      commonStakeholdersAndIdentification: '',
      commonStakeholderEngagementMethods: '',
      commonStakeholderConcerns: '',
      commonEnergyTotalRenewableNonRenewable: '',
      commonScope1Scope2: '',
      commonScope3: '',
      commonEmissionTargetsProgress: '',
      commonNetZeroCommitment: '',
      commonWaterConsumptionRecycling: '',
      commonWasteHazardousNonHazardous: '',
      commonEnvironmentalCompliance: '',
      commonPhysicalClimateRisks: '',
      commonTransitionRisks: '',
      commonRiskIntegrationERM: '',
      commonClimateImpactOnBusiness: '',
      commonWorkforceDiversity: '',
      commonHealthSafetyMetrics: '',
      commonTrainingDevelopment: '',
      commonGenderPayEquity: '',
      commonHumanRightsPolicy: '',
      commonChildForcedLabourPolicy: '',
      commonFreedomOfAssociation: '',
      commonHumanRightsIncidents: '',
      commonSupplierScreening: '',
      commonSupplierCodeOfConduct: '',
      commonResponsibleSourcing: '',
      commonSupplierAudits: '',
      commonExternalAssurance: '',
      commonInternationalAlignment: '',
      commonKeySustainabilityKpis: '',
      commonYearOnYearProgress: '',
      commonCsrExpenditurePrograms: '',
      commonCsrImpactAssessment: '',
      commonMarginalizedEngagement: '',
      // Environmental
      scope1Emissions: '',
      scope1FuelStationaryDetails: '',
      scope1CompanyVehicleDetails: '',
      scope1RefrigerantDetails: '',
      scope1ProcessEmissionsDetails: '',
      scope2Emissions: '',
      scope2ElectricityDetails: '',
      scope2ThermalEnergyDetails: '',
      scope3Emissions: '',
      energyConsumption: '',
      renewableEnergyPercent: '',
      waterUsage: '',
      wasteGenerated: '',
      wasteRecycledPercent: '',
      environmentalInitiatives: '',
      // Social
      totalEmployees: '',
      genderDiversityPercent: '',
      trainingHoursPerEmployee: '',
      safetyIncidents: '',
      communityInvestment: '',
      employeeTurnoverPercent: '',
      socialInitiatives: '',
      // Governance
      boardSize: '',
      independentDirectorsPercent: '',
      sustainabilityCommittee: '',
      esgTargetsSet: '',
      ethicsPolicy: '',
      governanceInitiatives: '',
      // CDP questionnaire
      cdpBoardReview: '',
      cdpBoardLastReviewDate: '',
      cdpBoardTopics: '',
      cdpClimateResponsibleTitles: '',
      cdpExecCompLinked: '',
      cdpExecCompDetails: '',
      cdpRisksSummary: '',
      cdpOpportunitiesSummary: '',
      cdpStrategyIntegrated: '',
      cdpStrategyExamples: '',
      cdpTransitionPlan: '',
      cdpTransitionPlanDetails: '',
      cdpTcfdAlignment: '',
      cdpTargetsHave: '',
      cdpTargetsDetails: '',
      cdpEmissionsCurrentYear: '',
      cdpEmissionsMethodology: '',
      cdpEmissionsHistory: '',
      cdpEnergyTotal: '',
      cdpEnergyRenewable: '',
      cdpEnergyIntensity: '',
      cdpEmissionsBreakdown: '',
      cdpTopEmissionSources: '',
      cdpCarbonPricing: '',
      cdpCarbonPricingDetails: '',
      cdpSupplierEngagementPercent: '',
      cdpSupplierRequirements: '',
      cdpInitiativesCommitments: '',
      cdpVerificationStatus: '',
      cdpVerificationDetails: '',
    };

    if (!presetCompany) {
      return base;
    }

    const hqLocation = presetCompany.hqLocation || base.hqLocation;
    const frameworks = hqLocation ? getFrameworksForCountry(hqLocation) : base.esgFrameworks;

    return {
      ...base,
      companyName: presetCompany.name || base.companyName,
      industry: presetCompany.industry || base.industry,
      hqLocation,
      esgFrameworks: frameworks,
    };
  });

  useEffect(() => {
    if (presetCompany) return;
    const draft = loadESGDraft();
    if (!draft) return;
    setFormData((prev) => ({ ...prev, ...(draft.esgData || draft.formData || {}) }));
    setQuestionAnswers(draft.questionAnswers || draft.answers || {});
    setSupportingDocuments(draft.supportingDocuments || {});
    setLastSaved(draft.savedAt ? new Date(draft.savedAt) : null);
  }, [presetCompany]);
  const hasFramework = (fw) => Array.isArray(formData.esgFrameworks) && formData.esgFrameworks.some((f) => f.includes(fw)); // check substring match
  const noFrameworkSelected = !Array.isArray(formData.esgFrameworks) || formData.esgFrameworks.length === 0;
  const selectedSector = normalizeIndustrySector(formData.industry);
  const selectedFrameworks = Array.isArray(formData.esgFrameworks) ? formData.esgFrameworks : [];
  const hasSectorSelection = Boolean(selectedSector);
  const hasFrameworkSelection = selectedFrameworks.length > 0;
  const companyInfoReady = hasSectorSelection || hasFrameworkSelection;

  const availableDepartments = useMemo(() => {
    const departments = [...new Set(
      questions
        .filter((q) => questionMatchesCompanyInfo(q, formData.industry, selectedFrameworks))
        .map((q) => q.department)
        .filter(Boolean)
    )];
    return departments.sort((a, b) => a.localeCompare(b));
  }, [questions, formData.industry, selectedFrameworks]);

  useEffect(() => {
    setSelectedDepartments((prev) => prev.filter((dep) => availableDepartments.includes(dep)));
  }, [availableDepartments]);

  const applicableQuestions = useMemo(() => questions.filter((q) => {
    if (!questionMatchesCompanyInfo(q, formData.industry, selectedFrameworks)) return false;
    return selectedDepartments.length === 0 || (q.department && selectedDepartments.includes(q.department));
  }), [questions, formData.industry, selectedFrameworks, selectedDepartments]);

  const filteredQuestions = useMemo(() => {
    const search = questionSearch.trim().toLowerCase();
    return applicableQuestions.filter((q) => {
      if (!search) return true;
      return [q.id, q.question, q.framework, q.department].some((value) =>
        String(value || '').toLowerCase().includes(search));
    });
  }, [applicableQuestions, questionSearch]);

  const frameworkStats = useMemo(() => selectedFrameworks.map((framework) => {
    const frameworkQuestions = questions.filter((q) => questionMatchesAnyFramework(q.framework, [framework]));
    const completed = frameworkQuestions.filter((q) => isAnswered(getAnswer(questionAnswers, q.id))).length;
    return { framework, completed, total: frameworkQuestions.length,
      percent: frameworkQuestions.length ? Math.round((completed / frameworkQuestions.length) * 100) : 0 };
  }), [selectedFrameworks, questions, questionAnswers]);

  const displayDepartments = useMemo(() => {
    if (selectedDepartments.length > 0) {
      return selectedDepartments.slice().sort((a, b) => a.localeCompare(b));
    }
    const departments = [...new Set(
      filteredQuestions.map((q) => q.department).filter(Boolean)
    )];
    return departments.sort((a, b) => a.localeCompare(b));
  }, [selectedDepartments, filteredQuestions]);

  const handleDepartmentToggle = (department) => {
    setSelectedDepartments((prev) => (
      prev.includes(department)
        ? prev.filter((dep) => dep !== department)
        : [...prev, department]
    ));
  };
  const progressFieldKeys = useMemo(() => {
    const keys = [
      'companyName',
      'industry',
      'reportingPeriod',
      'hqLocation',
      'employeeCount',
      'esgFrameworks',
      'commonLegalNameAddressCountries',
      'commonBusinessActivitiesProducts',
      'commonEmployeesByGenderTypeLocation',
      'commonSupplyChainStructure',
      'commonBoardOversight',
      'commonManagementResponsibility',
      'commonKpiLinkedCompensation',
      'commonLeadershipStatement',
      'commonStrategyIntegration',
      'commonCodeOfConduct',
      'commonAntiBriberyPolicy',
      'commonEthicsViolations',
      'commonWhistleblowerMechanism',
      'commonEthicsTraining',
      'commonStakeholdersAndIdentification',
      'commonStakeholderEngagementMethods',
      'commonStakeholderConcerns',
      'commonEnergyTotalRenewableNonRenewable',
      'commonScope1Scope2',
      'commonScope3',
      'commonEmissionTargetsProgress',
      'commonNetZeroCommitment',
      'commonWaterConsumptionRecycling',
      'commonWasteHazardousNonHazardous',
      'commonEnvironmentalCompliance',
      'commonPhysicalClimateRisks',
      'commonTransitionRisks',
      'commonRiskIntegrationERM',
      'commonClimateImpactOnBusiness',
      'commonWorkforceDiversity',
      'commonHealthSafetyMetrics',
      'commonTrainingDevelopment',
      'commonGenderPayEquity',
      'commonHumanRightsPolicy',
      'commonChildForcedLabourPolicy',
      'commonFreedomOfAssociation',
      'commonHumanRightsIncidents',
      'commonSupplierScreening',
      'commonSupplierCodeOfConduct',
      'commonResponsibleSourcing',
      'commonSupplierAudits',
      'commonExternalAssurance',
      'commonInternationalAlignment',
      'commonKeySustainabilityKpis',
      'commonYearOnYearProgress',
      'commonCsrExpenditurePrograms',
      'commonCsrImpactAssessment',
      'commonMarginalizedEngagement',
    ];

    if (
      noFrameworkSelected
      || hasFramework('TCFD')
      || hasFramework('ISSB / SASB')
      || hasFramework('CSRD / ESRS')
      || hasFramework('US SEC Climate Disclosure')
    ) {
      keys.push(
        'scope1FuelStationaryDetails',
        'scope1CompanyVehicleDetails',
        'scope1RefrigerantDetails',
        'scope1ProcessEmissionsDetails',
        'scope2ElectricityDetails',
        'scope2ThermalEnergyDetails'
      );
    }

    if (noFrameworkSelected || hasFramework('GRI') || hasFramework('UN Global Compact') || hasFramework('CDP')) {
      keys.push(
        'scope3Emissions',
        'energyConsumption',
        'renewableEnergyPercent',
        'waterUsage',
        'wasteGenerated',
        'wasteRecycledPercent',
        'environmentalInitiatives'
      );
    }

    if (noFrameworkSelected || hasFramework('GRI') || hasFramework('UN Global Compact') || hasFramework('BRSR')) {
      keys.push(
        'totalEmployees',
        'genderDiversityPercent',
        'trainingHoursPerEmployee',
        'safetyIncidents',
        'communityInvestment',
        'employeeTurnoverPercent',
        'socialInitiatives'
      );
    }

    if (
      noFrameworkSelected
      || hasFramework('TCFD')
      || hasFramework('ISSB / SASB')
      || hasFramework('GRI')
      || hasFramework('CSRD / ESRS')
    ) {
      keys.push(
        'boardSize',
        'independentDirectorsPercent',
        'sustainabilityCommittee',
        'esgTargetsSet',
        'ethicsPolicy',
        'governanceInitiatives'
      );
    }

    if (hasFramework('GRI')) {
      keys.push(
        'griOwnershipStructure',
        'griMarketsServed',
        'griScaleOfOrganization',
        'griKeyIros',
        'griSustainabilityBusinessStrategyAlignment',
        'griValuesAndCodeOfConduct',
        'griGovernanceStructureBoardComposition',
        'griMaterialTopicsIdentification',
        'griMaterialityMethodology',
        'griTopEsgMaterialIssues',
        'griMaterialityAssessmentFrequency',
        'griEnergyIntensityPerUnitOutput',
        'griEnergyReductionInitiatives',
        'griEmissionIntensity',
        'griTotalWaterWithdrawalBySource',
        'griDischargeQualityAndTreatment',
        'griWasteRecyclingAndDisposalMethods',
        'griOperationsInProtectedAreas',
        'griBiodiversityImpact',
        'griBiodiversityRestorationInitiatives',
        'griNewHiresAndTurnoverRate',
        'griEmployeeBenefits',
        'griWorkerRepresentationUnions',
        'griSupplierHumanRightsScreening',
        'griProductSafetyIncidents',
        'griMarketingLabelingCompliance',
        'griEconomicPerformanceFinancials',
        'griGovernmentFinancialAssistance',
        'griCorruptionIncidents',
        'griAntiCorruptionTraining',
        'griLocalSuppliersPercent',
        'griSupplierSelectionEsgCriteria',
        'griManufacturingResourceEfficiency',
        'griManufacturingWasteReductionTechniques',
        'griManufacturingSustainableRawMaterialSourcingPolicies',
        'griTechDataPrivacyCybersecurityMeasures',
        'griTechDataCenterEnergyUsage',
        'griTechEwasteManagementPractices',
        'griFinanceEsgIntegrationInLendingInvestments',
        'griFinanceExposureToHighCarbonIndustries',
        'griFinanceFinancialInclusionInitiatives',
        'griRetailSustainablePackagingPractices',
        'griRetailSupplyChainTraceability',
        'griRetailProductLifecycleImpact',
        'griEnergyTransitionToRenewables',
        'griEnergySpillIncidentsEnvironmentalRisks',
        'griEnergyCarbonNeutralityTargets',
        'griHealthcareDrugSafetyAndClinicalTrialEthics',
        'griHealthcareAccessToMedicines',
        'griHealthcareComplianceWithHealthRegulations'
      );
    }

    if (hasFramework('CDP')) {
      keys.push(
        'cdpBoardReview',
        'cdpBoardLastReviewDate',
        'cdpBoardTopics',
        'cdpClimateResponsibleTitles',
        'cdpExecCompLinked',
        'cdpExecCompDetails',
        'cdpRisksSummary',
        'cdpOpportunitiesSummary',
        'cdpStrategyIntegrated',
        'cdpStrategyExamples',
        'cdpTransitionPlan',
        'cdpTransitionPlanDetails',
        'cdpTcfdAlignment',
        'cdpTargetsHave',
        'cdpTargetsDetails',
        'cdpEmissionsCurrentYear',
        'cdpEmissionsMethodology',
        'cdpEmissionsHistory',
        'cdpEnergyTotal',
        'cdpEnergyRenewable',
        'cdpEnergyIntensity',
        'cdpEmissionsBreakdown',
        'cdpTopEmissionSources',
        'cdpCarbonPricing',
        'cdpCarbonPricingDetails',
        'cdpSupplierEngagementPercent',
        'cdpSupplierRequirements',
        'cdpInitiativesCommitments',
        'cdpVerificationStatus',
        'cdpVerificationDetails'
      );
    }

    return [...new Set(keys)];
  }, [formData.esgFrameworks, hasFramework, noFrameworkSelected]);

  const progressPct = useMemo(() => {
    const total = Math.max(1, progressFieldKeys.length + applicableQuestions.length);
    const completed = progressFieldKeys.reduce((count, key) => {
      const value = formData[key];
      if (Array.isArray(value)) return count + (value.length > 0 ? 1 : 0);
      if (typeof value === 'string') return count + (value.trim() ? 1 : 0);
      if (value === undefined || value === null) return count;
      return count + 1;
    }, 0);
    const completedQuestions = applicableQuestions.filter((q) => isAnswered(getAnswer(questionAnswers, q.id))).length;
    return Math.round(((completed + completedQuestions) / total) * 100);
  }, [formData, progressFieldKeys, applicableQuestions, questionAnswers]);

  const supportingDocumentsCount = useMemo(() => (
    Object.values(supportingDocuments).reduce((count, files) => count + (Array.isArray(files) ? files.length : 0), 0)
  ), [supportingDocuments]);

  const filteredAnsweredCount = useMemo(() => (
    filteredQuestions.filter((question) => isAnswered(getAnswer(questionAnswers, question.id))).length
  ), [filteredQuestions, questionAnswers]);

  const filteredCompletionPct = filteredQuestions.length
    ? Math.round((filteredAnsweredCount / filteredQuestions.length) * 100)
    : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'hqLocation') {
        const recommended = getFrameworksForCountry(value);
        return { ...prev, hqLocation: value, esgFrameworks: recommended };
      }
      return { ...prev, [name]: value };
    });
    setHasUnsavedChanges(true);
  };

  const handleFrameworkToggle = (framework) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.esgFrameworks) ? prev.esgFrameworks : [];
      const exists = current.includes(framework);
      const updated = exists
        ? current.filter((fw) => fw !== framework)
        : [...current, framework];
      return { ...prev, esgFrameworks: updated };
    });
    setHasUnsavedChanges(true);
  };

  const uploadSupportingDocument = async (documentType, file) => {
    const storageName = buildStorageDocumentName(documentType.label, formData.companyName, file.name);
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storageName, file, {
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) throw error;

    return {
      ...fileToDocumentMeta(file),
      name: storageName,
      originalName: file.name,
      documentType: documentType.label,
      bucket: DOCUMENTS_BUCKET,
      path: data?.path || storageName,
      uploadedAt: new Date().toISOString(),
    };
  };

  const handleSupportingDocumentChange = async (key, fileList) => {
    const documentType = SUPPORTING_DOCUMENTS.find((item) => item.key === key);
    const files = Array.from(fileList || []);
    if (!documentType || files.length === 0) return;

    setDocumentStorageStatus(`Uploading ${files.length} document${files.length === 1 ? '' : 's'} to Supabase...`);
    setSaveError('');
    try {
      const uploadedFiles = await Promise.all(files.map((file) => uploadSupportingDocument(documentType, file)));
      setSupportingDocuments((prev) => ({ ...prev, [key]: [...(prev[key] || []), ...uploadedFiles] }));
      setDocumentStorageStatus(`Saved ${files.length} document${files.length === 1 ? '' : 's'} to Supabase.`);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error(error);
      setDocumentStorageStatus('');
      setSaveError('Document upload failed. Please check Supabase storage access.');
    }
  };

  const removeSupportingDocument = async (key, file) => {
    setDocumentStorageStatus(`Removing ${file.name} from Supabase...`);
    try {
      if (file.path) {
        const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).remove([file.path]);
        if (error) throw error;
      }
      setSupportingDocuments((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((item) => !(item.name === file.name && item.lastModified === file.lastModified)),
      }));
      setDocumentStorageStatus('Document removed from Supabase.');
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error(error);
      setSaveError('Document removal failed. Please check Supabase storage access.');
    }
  };

  const handleSaveProgress = async () => {
    if (saving) return true;
    setSaving(true); setSaveError('');
    try {
      const questionJson = buildQuestionJson(questions, applicableQuestions, questionAnswers);
      await saveESGAnswers({ source: 'ESG', esgData: formData, questionAnswers,
        questionJson,
        supportingDocuments, supportingDocumentsCount,
        visibleQuestions: applicableQuestions.map((q) => buildQuestionWithAnswer(q, questionAnswers)) });
      setLastSaved(new Date()); setHasUnsavedChanges(false); return true;
    } catch (error) {
      console.error(error); setSaveError('Save failed. Your changes are still on this page.'); return false;
    } finally { setSaving(false); }
  };

  useEffect(() => {
    const timer = setInterval(() => { if (hasUnsavedChanges && !saving) handleSaveProgress(); }, 30000);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    const warnOnExit = (event) => { if (hasUnsavedChanges) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warnOnExit);
    return () => window.removeEventListener('beforeunload', warnOnExit);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);

    const answeredQuestions = applicableQuestions.map((question) =>
      buildQuestionWithAnswer(question, questionAnswers)
    );
    const questionJson = buildQuestionJson(questions, applicableQuestions, questionAnswers);

    await handleSaveProgress();

    history.push({
      pathname: '/final-report',
      state: {
        source: 'ESG',
        esgData: formData,
        reportAnswers: questionAnswers,
        questionJson,
        supportingDocuments,
        supportingDocumentsCount,
        visibleQuestions: answeredQuestions,
      },
    });
  };

  return (
    <div className="esg-report-form-page">
      <div className="esg-form-header">
        <h1>ESG Report Generation</h1>
        <p>
          Complete the form below with your organization&apos;s data. Fields align with GRI, SASB, and TCFD frameworks.
        </p>
        <div className="esg-progress esg-department-bar" aria-label="Department filter">
          <div className="esg-progress-top">
            <div className="esg-department-bar-heading">
              <span className="esg-department-bar-label">Departments</span>
              {companyInfoReady && availableDepartments.length > 0 ? (
                <span className="esg-department-bar-hint">Optional: select departments to narrow questions</span>
              ) : null}
            </div>
            <div className="esg-save-cluster">
              <span className={`esg-save-status ${saveError ? 'is-error' : ''}`} role="status">
                {saving ? 'Saving...' : saveError || (hasUnsavedChanges ? 'Unsaved Changes' : (lastSaved ? 'Saved' : 'Not saved yet'))}
              </span>
              <div className="esg-progress-pct">{progressPct}% completed</div>
            </div>
          </div>
          {companyInfoReady && availableDepartments.length > 0 ? (
            <div className="esg-progress-steps" role="group" aria-label="Select departments">
              {availableDepartments.map((dep) => {
                const isSelected = selectedDepartments.includes(dep);
                return (
                  <button
                    key={dep}
                    type="button"
                    className={`esg-progress-step ${isSelected ? 'is-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => handleDepartmentToggle(dep)}
                  >
                    {dep}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="esg-department-bar-empty">
              {companyInfoReady
                ? 'No departments match your sector and framework selections.'
                : 'Select an industry sector and/or reporting framework to choose departments.'}
            </p>
          )}
          <div className="esg-progress-track" aria-hidden="true">
            <div className="esg-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          {lastSaved && !saving && <small className="esg-last-saved">Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="esg-form">
        <section id="esg-section-company" className="form-section">
          <h2>Company Information</h2>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="industry">Industry Sector *</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select sector</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Energy">Energy</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Transportation">Transportation</option>
                <option value="Construction">Construction</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reportingPeriod">Reporting Period (Year) *</label>
              <input
                type="text"
                id="reportingPeriod"
                name="reportingPeriod"
                value={formData.reportingPeriod}
                onChange={handleChange}
                placeholder="e.g. 2026"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="hqLocation">Headquarters Country *</label>
              <select
                id="hqLocation"
                name="hqLocation"
                value={formData.hqLocation}
                onChange={handleChange}
                required
              >
                <option value="">Select country/region</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="European Union">European Union</option>
                <option value="India">India</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group full">
              <label htmlFor="esgFrameworks">ESG Reporting Frameworks</label>
              <p className="field-helper">
                Recommended for{' '}
                {formData.hqLocation || 'selected country'}
                : {getFrameworksForCountry(formData.hqLocation).join(', ') || 'N/A'}
              </p>
              <div id="esgFrameworks" className="checkbox-group">
                {ALL_FRAMEWORKS.map((fw) => (
                  <label key={fw} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={fw}
                      checked={Array.isArray(formData.esgFrameworks) && formData.esgFrameworks.includes(fw)}
                      onChange={() => handleFrameworkToggle(fw)}
                    />
                    <span>{fw}</span>
                  </label>
                ))}
              </div>
              {frameworkStats.length > 0 && <div className="framework-stats" aria-label="Framework completion">
                {frameworkStats.map((stat) => <span className="framework-stat-chip" key={stat.framework}>
                  <strong>{stat.framework}</strong> {stat.completed}/{stat.total} · {stat.percent}%
                </span>)}
              </div>}
              <small>
                Select all frameworks you report against. You can include frameworks beyond the recommended list.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="employeeCount">Number of Employees *</label>
              <input
                type="text"
                id="employeeCount"
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleChange}
                placeholder="e.g. 500"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="revenue">Annual Revenue (optional)</label>
              <input
                type="text"
                id="revenue"
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                placeholder="e.g. $50M"
              />
            </div>
            <div className="form-group full">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://"
              />
            </div>
          </div>
        </section>

        <section className="form-section documents-section">
          <div className="documents-section-head">
            <div>
              <h2>Supporting Documents</h2>
              <p>Upload evidence files for audit readiness. Multiple files are allowed for each document type.</p>
              {documentStorageStatus && <p className="field-helper">{documentStorageStatus}</p>}
            </div>
            <span>{supportingDocumentsCount} uploaded</span>
          </div>
          <div className="document-upload-grid">
            {SUPPORTING_DOCUMENTS.map((documentType) => {
              const uploadedFiles = supportingDocuments[documentType.key] || [];
              return (
                <div className="document-upload-card" key={documentType.key}>
                  <label htmlFor={`doc-${documentType.key}`}>{documentType.label}</label>
                  <input
                    id={`doc-${documentType.key}`}
                    type="file"
                    multiple
                    accept={FILE_ACCEPT_TYPES}
                    onChange={(event) => handleSupportingDocumentChange(documentType.key, event.target.files)}
                  />
                  <div
                    className="document-drop-zone"
                    role="button"
                    tabIndex={0}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => { event.preventDefault(); handleSupportingDocumentChange(documentType.key, event.dataTransfer.files); }}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') document.getElementById(`doc-${documentType.key}`)?.click(); }}
                    onClick={() => document.getElementById(`doc-${documentType.key}`)?.click()}
                  >
                    <strong>Drag and drop files here</strong>
                    <span>or choose files from your device</span>
                  </div>
                  {uploadedFiles.length > 0 ? (
                    <ul className="document-file-list">
                      {uploadedFiles.map((file) => (
                        <li key={`${file.name}-${file.lastModified}`}>
                          <span>{file.name}</span>
                          <small>{formatFileSize(file.size)}</small>
                          <button type="button" onClick={() => removeSupportingDocument(documentType.key, file)} aria-label={`Remove ${file.name}`}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <small className="document-empty">No file selected</small>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="form-section questions-section">
          <h2>ESG Question Bank</h2>
          <p className="questions-intro">
            Questions are filtered automatically from your Company Information selections above.
            {companyInfoReady ? (
              <>
                {' '}
                {hasSectorSelection && (
                  <>
                   <br/> Sector: <strong>{selectedSector}</strong>
                  </>
                )}
                {hasSectorSelection && hasFrameworkSelection && '; '}
                {hasFrameworkSelection && (
                  <>
                    <br/>Frameworks: <strong>{selectedFrameworks.join(', ')}</strong>
                  </>
                )}
                .
              </>
            ) : (
              ' Universal questions are shown below. Select an industry sector and/or reporting framework to see more.'
            )}
          </p>

          {/* <div className="questionnaire-overview" aria-label="Questionnaire completion overview">
            <div className="questionnaire-overview-copy">
              <span className="questionnaire-kicker">Questionnaire progress</span>
              <strong>{filteredAnsweredCount} of {filteredQuestions.length} answered</strong>
              <small>Completed questions are highlighted in green.</small>
            </div>
            <div className="questionnaire-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={filteredCompletionPct} aria-label={`${filteredCompletionPct}% of visible questions answered`}>
              <div className="questionnaire-progress-ring"><span>{filteredCompletionPct}%</span></div>
              <div className="questionnaire-progress-track"><span style={{ width: `${filteredCompletionPct}%` }} /></div>
            </div>
          </div> */}

          <div className="questions-filters">
            <div className="form-group">
              <label htmlFor="questionSearch">Search questions</label>
              <input
                type="search"
                id="questionSearch"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search questions, frameworks, departments or IDs..."
                disabled={questionsLoading || !!questionsError}
              />
            </div>
          </div>

          {questionsLoading ? (
            <p className="questions-status">Loading questions...</p>
          ) : questionsError ? (
            <p className="questions-status questions-status-error">{questionsError}</p>
          ) : (
            <>
              <p className="questions-count">
                {filteredQuestions.length === 0 ? (
                  companyInfoReady
                    ? 'No questions match your sector and framework selections.'
                    : 'No questions to display yet.'
                ) : (
                  <>
                    Showing {filteredQuestions.length} question{filteredQuestions.length === 1 ? '' : 's'}
                    {selectedDepartments.length > 0
                      ? ` from ${selectedDepartments.length} department${selectedDepartments.length === 1 ? '' : 's'}`
                      : ' across all departments'}
                    {hasSectorSelection && ` for ${selectedSector}`}
                    {hasFrameworkSelection && ` (${selectedFrameworks.join(', ')})`}
                  </>
                )}
              </p>
              <div className="questions-table-wrap">
                <table className="questions-table">
                  <thead>
                    <tr>
                      <th scope="col">Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td className="questions-empty">
                          {!companyInfoReady
                            ? 'Select an industry sector and/or ESG reporting framework to load relevant questions.'
                            : 'No questions match your current sector and framework filters.'}
                        </td>
                      </tr>
                    ) : (
                      displayDepartments.map((dep) => {
                        const deptQuestions = filteredQuestions.filter((q) => q.department === dep);
                        if (deptQuestions.length === 0) return null;
                        return (
                          <React.Fragment key={dep}>
                            <tr className="questions-dept-header">
                            { /* <td>{dep}</td> */ }
                            </tr>
                            {deptQuestions.map((q) => {
                              const answered = isAnswered(getAnswer(questionAnswers, q.id));
                              const missingRequired = (q.required || q.isMandatory || q.mandatory) && showValidation && !answered;
                              return (
                              <tr key={q.id} className={`question-row ${answered ? 'question-complete' : ''} ${missingRequired ? 'question-missing' : ''}`}>
                                <td>
                                  <div className="question-item">
                                    <span className={`question-status ${answered ? 'is-complete' : ''}`} aria-label={answered ? 'Answered' : `Question`}>{answered ? '✓' : ''}</span>
                                    <p className="question-text">{q.question} <span className="tooltip">🛈
                                      <span className="tooltiptext">{q.guidelines}</span>
                                    </span></p>
                                    <div className="question-tags">
                                      {answered && <span className="question-complete-label">Completed</span>}
                                      {(q.required || q.isMandatory || q.mandatory) && <span className="question-chip required">Required</span>}
{/*                                      {String(q.framework || '').split(/[\s,;/]+/).filter(Boolean).map((fw) => <span className="question-chip" key={fw}>{fw}</span>)}
                                      {getLinkedQuestionIds(q).map((id) => <span className="question-chip linked" key={id}>Linked: #{id}</span>)} */}
                                    </div>
                                    <div className="question-answer">{renderQuestionInput(q)}</div>
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={handleSaveProgress} disabled={saving}>
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
          <button type="submit" className="btn btn-primary btn-lg">Generate Report</button>
        </div>
      </form>
    </div>
  );
};

export default ESGReportForm;
