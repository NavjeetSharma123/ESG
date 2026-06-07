import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './ESGReportForm.css';

const COUNTRY_FRAMEWORKS = {
  'United States': ['US SEC Climate Disclosure', 'ISSB / SASB', 'TCFD', 'GRI'],
  'United Kingdom': ['UK SDR', 'TCFD', 'ISSB / SASB', 'GRI'],
  'European Union': ['CSRD / ESRS', 'SFDR', 'TCFD', 'ISSB / SASB', 'GRI'],
  India: ['BRSR', 'GRI', 'ISSB / SASB', 'TCFD'],
  Canada: ['ISSB / SASB', 'TCFD', 'GRI'],
  Australia: ['ISSB / SASB', 'TCFD', 'GRI'],
  Singapore: ['ISSB / SASB', 'TCFD', 'GRI'],
  'United Arab Emirates': ['ISSB / SASB', 'TCFD', 'GRI'],
  Other: ['GRI', 'ISSB / SASB', 'TCFD'],
};

const ALL_FRAMEWORKS = [
  'GRI',
  'ISSB / SASB',
  'TCFD',
  'UN Global Compact',
  'CDP',
  'CSRD / ESRS',
  'SFDR',
  'UK SDR',
  'US SEC Climate Disclosure',
  'BRSR',
];

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

const questionMatchesCompanyInfo = (question, industry, frameworks) => {
  const sector = normalizeIndustrySector(industry);
  const hasSector = Boolean(sector);
  const hasFrameworks = frameworks.length > 0;

  if (!hasSector && !hasFrameworks) return false;

  const matchesSector =
    !hasSector || question.sector === sector || question.sector === 'Other';
  const matchesFramework =
    !hasFrameworks || frameworks.includes(question.framework);

  return matchesSector && matchesFramework;
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

  const handleQuestionAnswer = (id, value) => {
    setQuestionAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const renderQuestionInput = (q) => {
    const type = String(q.questionType || '').toLowerCase();
    const value = questionAnswers[q.id];

    if (type === 'yes/no') {
      return (
        <label className="question-yn-label">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleQuestionAnswer(q.id, e.target.checked)}
          />
          <span>Yes</span>
        </label>
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

    if (type === 'text') {
      return (
        <input
          type="text"
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
  const hasFramework = (fw) => Array.isArray(formData.esgFrameworks) && formData.esgFrameworks.includes(fw);
  const noFrameworkSelected = !Array.isArray(formData.esgFrameworks) || formData.esgFrameworks.length === 0;
  const selectedSector = normalizeIndustrySector(formData.industry);
  const selectedFrameworks = Array.isArray(formData.esgFrameworks) ? formData.esgFrameworks : [];
  const hasSectorSelection = Boolean(selectedSector);
  const hasFrameworkSelection = selectedFrameworks.length > 0;
  const companyInfoReady = hasSectorSelection || hasFrameworkSelection;

  const filteredQuestions = useMemo(() => {
    if (!companyInfoReady) return [];

    const search = questionSearch.trim().toLowerCase();
    return questions.filter((q) => {
      const matchesCompanyInfo = questionMatchesCompanyInfo(
        q,
        formData.industry,
        selectedFrameworks
      );
      if (!matchesCompanyInfo) return false;

      if (!search) return true;
      return String(q.question || '')
        .toLowerCase()
        .includes(search);
    });
  }, [questions, questionSearch, formData.industry, selectedFrameworks, companyInfoReady]);

  const sectionRefs = useRef({
    company: null,
    common: null,
    gri: null,
    environmental: null,
    cdp: null,
    social: null,
    governance: null,
  });
  const sections = useMemo(
    () => [
      { id: 'company', label: 'Company' },
      { id: 'common', label: 'Common' },
      { id: 'gri', label: 'GRI' },
      { id: 'environmental', label: 'Environmental' },
      { id: 'cdp', label: 'CDP' },
      { id: 'social', label: 'Social' },
      { id: 'governance', label: 'Governance' },
    ],
    []
  );
  const visibleSections = useMemo(() => {
    return sections.filter((s) => {
      if (s.id === 'cdp') return hasFramework('CDP');
      if (s.id === 'gri') return hasFramework('GRI');
      return true;
    });
  }, [hasFramework, sections]);
  const [activeSectionId, setActiveSectionId] = useState('company');
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
    const total = Math.max(1, progressFieldKeys.length);
    const completed = progressFieldKeys.reduce((count, key) => {
      const value = formData[key];
      if (Array.isArray(value)) return count + (value.length > 0 ? 1 : 0);
      if (typeof value === 'string') return count + (value.trim() ? 1 : 0);
      if (value === undefined || value === null) return count;
      return count + 1;
    }, 0);
    return Math.round((completed / total) * 100);
  }, [formData, progressFieldKeys]);

  useEffect(() => {
    const els = visibleSections
      .map((s) => sectionRefs.current[s.id])
      .filter(Boolean);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
        if (visible[0] && visible[0].target && visible[0].target.id) {
          const id = visible[0].target.id.replace('esg-section-', '');
          setActiveSectionId(id);
        }
      },
      { root: null, threshold: [0.15, 0.25, 0.35, 0.5] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [visibleSections]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'hqLocation') {
        const recommended = getFrameworksForCountry(value);
        return { ...prev, hqLocation: value, esgFrameworks: recommended };
      }
      return { ...prev, [name]: value };
    });
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    history.push({
      pathname: '/final-report',
      state: { source: 'ESG', esgData: formData },
    });
  };

  return (
    <div className="esg-report-form-page">
      <div className="esg-form-header">
        <h1>ESG Report Generation</h1>
        <p>
          Complete the form below with your organization&apos;s data. Fields align with GRI, SASB, and TCFD frameworks.
        </p>
        <div className="esg-progress" aria-label="Form progress">
          <div className="esg-progress-top">
            <div className="esg-progress-steps">
              {visibleSections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`esg-progress-step ${activeSectionId === s.id ? 'is-active' : ''}`}
                  onClick={() => {
                    const el = sectionRefs.current[s.id];
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="esg-progress-pct">{progressPct}%</div>
          </div>
          <div className="esg-progress-track" aria-hidden="true">
            <div className="esg-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="esg-form">
        <section
          id="esg-section-company"
          ref={(el) => {
            sectionRefs.current.company = el;
          }}
          className="form-section"
        >
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

        <section className="form-section questions-section">
          <h2>ESG Question Bank</h2>
          <p className="questions-intro">
            Questions are filtered automatically from your Company Information selections above.
            {companyInfoReady ? (
              <>
                {' '}
                {hasSectorSelection && (
                  <>
                    Sector: <strong>{selectedSector}</strong>
                  </>
                )}
                {hasSectorSelection && hasFrameworkSelection && '; '}
                {hasFrameworkSelection && (
                  <>
                    Frameworks: <strong>{selectedFrameworks.join(', ')}</strong>
                  </>
                )}
                .
              </>
            ) : (
              ' Select an industry sector and/or at least one reporting framework to view questions.'
            )}
          </p>

          <div className="questions-filters">
            <div className="form-group">
              <label htmlFor="questionSearch">Search questions</label>
              <input
                type="search"
                id="questionSearch"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search by question text..."
                disabled={!companyInfoReady}
              />
            </div>
          </div>

          {questionsLoading ? (
            <p className="questions-status">Loading questions...</p>
          ) : questionsError ? (
            <p className="questions-status questions-status-error">{questionsError}</p>
          ) : !companyInfoReady ? (
            <p className="questions-status">
              Select an industry sector and/or ESG reporting framework in Company Information to load
              relevant questions.
            </p>
          ) : (
            <>
              <p className="questions-count">
                Showing {filteredQuestions.length} question{filteredQuestions.length === 1 ? '' : 's'}
                {hasSectorSelection && ` for ${selectedSector}`}
                {hasFrameworkSelection && ` (${selectedFrameworks.join(', ')})`}
              </p>
              <div className="questions-table-wrap">
                <table className="questions-table">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Question</th>
                      <th scope="col">Question Type</th>
                      <th scope="col">Sector</th>
                      <th scope="col">Framework</th>
                      <th scope="col">Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="questions-empty">
                          No questions match your selected sector and frameworks.
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((q) => (
                        <tr key={q.id}>
                          <td data-label="ID">{q.id}</td>
                          <td data-label="Question">{q.question}</td>
                          <td data-label="Question Type">{q.questionType}</td>
                          <td data-label="Sector">{q.sector}</td>
                          <td data-label="Framework">{q.framework}</td>
                          <td data-label="Answer">{renderQuestionInput(q)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg" style={{position: 'fixed',
    bottom: '100px',
    right: '50px',
    borderRadius: '50%',
    height: '150px'}}>
            Submit details
          </button>
        </div>
      </form>
    </div>
  );
};

export default ESGReportForm;
