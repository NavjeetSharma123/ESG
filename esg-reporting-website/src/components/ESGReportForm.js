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

const ESGReportForm = () => {
  const history = useHistory();
  const location = useLocation();
  const presetCompany = (location && location.state && location.state.presetCompany) || null;

  const [openTipId, setOpenTipId] = useState(null);
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
  const sectorSelected = formData.industry;

  const sectionRefs = useRef({
    company: null,
    environmental: null,
    cdp: null,
    social: null,
    governance: null,
  });
  const sections = useMemo(
    () => [
      { id: 'company', label: 'Company' },
      { id: 'environmental', label: 'Environmental' },
      { id: 'cdp', label: 'CDP' },
      { id: 'social', label: 'Social' },
      { id: 'governance', label: 'Governance' },
    ],
    []
  );
  const visibleSections = useMemo(() => {
    return sections.filter((s) => (s.id === 'cdp' ? hasFramework('CDP') : true));
  }, [hasFramework, sections]);
  const [activeSectionId, setActiveSectionId] = useState('company');
  const progressPct = useMemo(() => {
    const idx = Math.max(0, visibleSections.findIndex((s) => s.id === activeSectionId));
    const denom = Math.max(1, visibleSections.length - 1);
    return Math.round((idx / denom) * 100);
  }, [activeSectionId, visibleSections]);

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

        <section
          id="esg-section-environmental"
          ref={(el) => {
            sectionRefs.current.environmental = el;
          }}
          className="form-section"
        >
          <h2>Environmental Metrics</h2>
          <p className="field-helper">
            Fields shown below are tailored to your selected frameworks.
          </p>
          <div className="form-grid">
            {(noFrameworkSelected
              || hasFramework('TCFD')
              || hasFramework('ISSB / SASB')
              || hasFramework('CSRD / ESRS')
              || hasFramework('US SEC Climate Disclosure')) && (
            <>
              <div className="form-group">
                <h3><b><label htmlFor="scope1Emissions">Scope 1 Emissions (tCO₂e) *</label></b></h3>
                <input
                  type="text"
                  id="scope1Emissions"
                  name="scope1Emissions"
                  value={formData.scope1Emissions}
                  onChange={handleChange}
                  placeholder="Direct emissions"
                  hidden
                />
              </div>
              <div className="form-group full">
                <div className="label-row">
                  <label htmlFor="scope1FuelStationaryDetails">
                    Fuel Consumption – Stationary Sources
                  </label>
                  <InfoTip
                    id="tip-scope1FuelStationaryDetails"
                    text="Include: fuel type (diesel, petrol, natural gas, LPG, coal, biomass), quantity consumed, unit of measurement (liters, kg, m³), facility/location, and time period (monthly or annual)."
                  />
                </div>
                <textarea
                  id="scope1FuelStationaryDetails"
                  name="scope1FuelStationaryDetails"
                  rows={3}
                  value={formData.scope1FuelStationaryDetails}
                  onChange={handleChange}
                  placeholder="Enter fuel used in boilers, generators, furnaces, etc.&#10;e.g. Plant A – Diesel – 3,500 – Liters – 2026 annual"
                />
              </div>
              <div className="form-group full">
                <div className="label-row">
                  <label htmlFor="scope1CompanyVehicleDetails">Company Vehicle Fuel Usage</label>
                  <InfoTip
                    id="tip-scope1CompanyVehicleDetails"
                    text="Include: vehicle type, fuel type, fuel consumption or distance travelled, and any fuel purchase records."
                  />
                </div>
                <textarea
                  id="scope1CompanyVehicleDetails"
                  name="scope1CompanyVehicleDetails"
                  rows={3}
                  value={formData.scope1CompanyVehicleDetails}
                  onChange={handleChange}
                  placeholder="Enter fuel used in company-owned vehicles.&#10;e.g. Delivery Truck – Diesel – 1,200 L – FY 2026"
                />
              </div>
              <div className="form-group full">
                <div className="label-row">
                  <label htmlFor="scope1RefrigerantDetails">
                    Refrigerants / Air Conditioning Leakage
                  </label>
                  <InfoTip
                    id="tip-scope1RefrigerantDetails"
                    text="Include: refrigerant type (e.g. R134a, R410a), amount used or replaced, and relevant maintenance records."
                  />
                </div>
                <textarea
                  id="scope1RefrigerantDetails"
                  name="scope1RefrigerantDetails"
                  rows={3}
                  value={formData.scope1RefrigerantDetails}
                  onChange={handleChange}
                  placeholder="Enter refrigerant use and leakage.&#10;e.g. HQ Chiller – R410a – 12 kg replaced – 2026 maintenance"
                />
              </div>
              <div className="form-group full">
                <div className="label-row">
                  <label htmlFor="scope1ProcessEmissionsDetails">
                    Industrial Process Emissions (if applicable)
                  </label>
                  <InfoTip
                    id="tip-scope1ProcessEmissionsDetails"
                    text="Include: production volumes, raw materials used, and process emissions data for relevant industries (e.g. cement, steel, chemicals)."
                  />
                </div>
                <textarea
                  id="scope1ProcessEmissionsDetails"
                  name="scope1ProcessEmissionsDetails"
                  rows={3}
                  value={formData.scope1ProcessEmissionsDetails}
                  onChange={handleChange}
                  placeholder="Enter process-related emissions.&#10;e.g. Cement line – clinker production volume, kiln fuel mix, calcination data"
                />
              </div>
              <div className="form-group">
                <h3><b><label htmlFor="scope2Emissions">Scope 2 Emissions (tCO₂e) *</label></b></h3>
                <input
                  type="text"
                  id="scope2Emissions"
                  name="scope2Emissions"
                  value={formData.scope2Emissions}
                  onChange={handleChange}
                  placeholder="Indirect - purchased energy"
                  hidden
                />
              </div>
              <div className="form-group full">
                <div className="label-row">
                  <label htmlFor="scope2ElectricityDetails">Electricity Consumption</label>
                  <InfoTip
                    id="tip-scope2ElectricityDetails"
                    text="Include: electricity consumed, unit (kWh or MWh), facility location, utility provider, and time period. Use data from electricity bills or energy management systems."
                  />
                </div>
                <textarea
                  id="scope2ElectricityDetails"
                  name="scope2ElectricityDetails"
                  rows={3}
                  value={formData.scope2ElectricityDetails}
                  onChange={handleChange}
                  placeholder="Enter electricity consumed per facility.&#10;e.g. Office HQ – 42,000 – kWh – Utility ABC – FY 2026"
                />
              </div>
              <div className="form-group full">
                <div className="label-row">
                  <label htmlFor="scope2ThermalEnergyDetails">
                    Purchased Heating / Cooling / Steam
                  </label>
                  <InfoTip
                    id="tip-scope2ThermalEnergyDetails"
                    text="Include: type of energy (steam, heating, cooling), amount consumed, energy supplier, and reporting period."
                  />
                </div>
                <textarea
                  id="scope2ThermalEnergyDetails"
                  name="scope2ThermalEnergyDetails"
                  rows={3}
                  value={formData.scope2ThermalEnergyDetails}
                  onChange={handleChange}
                  placeholder="Enter purchased thermal energy.&#10;e.g. Purchased steam – 12,000 kWh – Supplier XYZ – FY 2026"
                />
              </div>
            </>
            )}

            {(noFrameworkSelected || hasFramework('GRI') || hasFramework('UN Global Compact') || hasFramework('CDP')) && (
            <>
              <div className="form-group">
                <label htmlFor="scope3Emissions">Scope 3 Emissions (tCO₂e)</label>
                <input
                  type="text"
                  id="scope3Emissions"
                  name="scope3Emissions"
                  value={formData.scope3Emissions}
                  onChange={handleChange}
                  placeholder="Value chain (if measured)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="energyConsumption">Energy Consumption (MWh)</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="renewableEnergyPercent">Renewable Energy %</label>
                <input
                  type="text"
                  id="renewableEnergyPercent"
                  name="renewableEnergyPercent"
                  value={formData.renewableEnergyPercent}
                  onChange={handleChange}
                  placeholder="e.g. 35"
                />
              </div>
              <div className="form-group">
                <label htmlFor="waterUsage">Water Usage (m³)</label>
                <input
                  type="text"
                  id="waterUsage"
                  name="waterUsage"
                  value={formData.waterUsage}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wasteGenerated">Waste Generated (tons)</label>
                <input
                  type="text"
                  id="wasteGenerated"
                  name="wasteGenerated"
                  value={formData.wasteGenerated}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wasteRecycledPercent">Waste Recycled %</label>
                <input
                  type="text"
                  id="wasteRecycledPercent"
                  name="wasteRecycledPercent"
                  value={formData.wasteRecycledPercent}
                  onChange={handleChange}
                  placeholder="e.g. 60"
                />
              </div>
              <div className="form-group full">
                <label htmlFor="environmentalInitiatives">Environmental Initiatives & Notes</label>
                <textarea
                  id="environmentalInitiatives"
                  name="environmentalInitiatives"
                  rows={3}
                  value={formData.environmentalInitiatives}
                  onChange={handleChange}
                  placeholder="Describe key environmental programs, certifications, or targets..."
                />
              </div>
            </>
            )}
            {sectorSelected === 'Technology' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Technology Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Manufacturing' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Manufacturing Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Finance' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Finance Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Retail' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Retail Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Energy' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Energy Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Healthcare' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Healthcare Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Transportation' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Transportation Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Construction' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Construction Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {sectorSelected === 'Agriculture' && (
              <div className="form-group full">
                <label htmlFor="energyConsumption">Agriculture Questions</label>
                <input
                  type="text"
                  id="energyConsumption"
                  name="energyConsumption"
                  value={formData.energyConsumption}
                  onChange={handleChange}
                />
              </div>
            )}
            {hasFramework('CDP') && (
            <div className="form-group full">
              <div
                id="esg-section-cdp"
                ref={(el) => {
                  sectionRefs.current.cdp = el;
                }}
              />
              <h3>CDP Climate Questionnaire {sectorSelected} </h3>
              <p className="field-helper">
                Complete the CDP climate module below (Sections A–J).
              </p>
              <div className="form-grid">
                <h3>A. Governance</h3>
                <div className="form-group">
                  <label htmlFor="cdpBoardReview">Does your Board review climate issues at least once per year?</label>
                  <select
                    id="cdpBoardReview"
                    name="cdpBoardReview"
                    value={formData.cdpBoardReview}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cdpBoardLastReviewDate">Date of last review</label>
                  <input
                    type="date"
                    id="cdpBoardLastReviewDate"
                    name="cdpBoardLastReviewDate"
                    value={formData.cdpBoardLastReviewDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpBoardTopics">Topics discussed</label>
                  <textarea
                    id="cdpBoardTopics"
                    name="cdpBoardTopics"
                    rows={3}
                    value={formData.cdpBoardTopics}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpClimateResponsibleTitles">Job titles responsible for climate management</label>
                  <textarea
                    id="cdpClimateResponsibleTitles"
                    name="cdpClimateResponsibleTitles"
                    rows={2}
                    value={formData.cdpClimateResponsibleTitles}
                    onChange={handleChange}
                    placeholder="e.g. Chief Sustainability Officer, Head of ESG..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cdpExecCompLinked">Are climate KPIs in executive compensation?</label>
                  <select
                    id="cdpExecCompLinked"
                    name="cdpExecCompLinked"
                    value={formData.cdpExecCompLinked}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpExecCompDetails">KPI name, metric and % of bonus linked</label>
                  <textarea
                    id="cdpExecCompDetails"
                    name="cdpExecCompDetails"
                    rows={3}
                    value={formData.cdpExecCompDetails}
                    onChange={handleChange}
                  />
                </div>

                <h3>B. Risks &amp; Opportunities</h3>
                <div className="form-group full">
                  <label htmlFor="cdpRisksSummary">
                    Climate-related risks (up to 10): type, description, time horizon, financial impact, likelihood
                  </label>
                  <textarea
                    id="cdpRisksSummary"
                    name="cdpRisksSummary"
                    rows={4}
                    value={formData.cdpRisksSummary}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpOpportunitiesSummary">
                    Climate-related opportunities (up to 5): description, financial benefit, time horizon
                  </label>
                  <textarea
                    id="cdpOpportunitiesSummary"
                    name="cdpOpportunitiesSummary"
                    rows={4}
                    value={formData.cdpOpportunitiesSummary}
                    onChange={handleChange}
                  />
                </div>

                <h3>C. Business Strategy</h3>
                <div className="form-group">
                  <label htmlFor="cdpStrategyIntegrated">Incorporated into documented strategy?</label>
                  <select
                    id="cdpStrategyIntegrated"
                    name="cdpStrategyIntegrated"
                    value={formData.cdpStrategyIntegrated}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpStrategyExamples">Examples</label>
                  <textarea
                    id="cdpStrategyExamples"
                    name="cdpStrategyExamples"
                    rows={3}
                    value={formData.cdpStrategyExamples}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cdpTransitionPlan">Formal transition plan aligned with net-zero?</label>
                  <select
                    id="cdpTransitionPlan"
                    name="cdpTransitionPlan"
                    value={formData.cdpTransitionPlan}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpTransitionPlanDetails">Target year and interim milestones</label>
                  <textarea
                    id="cdpTransitionPlanDetails"
                    name="cdpTransitionPlanDetails"
                    rows={3}
                    value={formData.cdpTransitionPlanDetails}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cdpTcfdAlignment">TCFD alignment</label>
                  <select
                    id="cdpTcfdAlignment"
                    name="cdpTcfdAlignment"
                    value={formData.cdpTcfdAlignment}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Fully aligned">Fully aligned</option>
                    <option value="Partially aligned">Partially aligned</option>
                    <option value="Not aligned">Not aligned</option>
                  </select>
                </div>

                <h3>D. Targets &amp; Performance</h3>
                <div className="form-group">
                  <label htmlFor="cdpTargetsHave">Emissions reduction targets?</label>
                  <select
                    id="cdpTargetsHave"
                    name="cdpTargetsHave"
                    value={formData.cdpTargetsHave}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpTargetsDetails">Targets details</label>
                  <textarea
                    id="cdpTargetsDetails"
                    name="cdpTargetsDetails"
                    rows={3}
                    value={formData.cdpTargetsDetails}
                    onChange={handleChange}
                  />
                </div>

                <h3>E. Emissions Data</h3>
                <div className="form-group full">
                  <label htmlFor="cdpEmissionsCurrentYear">Current year emissions (Scopes 1/2/3)</label>
                  <textarea
                    id="cdpEmissionsCurrentYear"
                    name="cdpEmissionsCurrentYear"
                    rows={3}
                    value={formData.cdpEmissionsCurrentYear}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cdpEmissionsMethodology">Calculation methodology</label>
                  <input
                    type="text"
                    id="cdpEmissionsMethodology"
                    name="cdpEmissionsMethodology"
                    value={formData.cdpEmissionsMethodology}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpEmissionsHistory">Past 3 reporting years emissions</label>
                  <textarea
                    id="cdpEmissionsHistory"
                    name="cdpEmissionsHistory"
                    rows={3}
                    value={formData.cdpEmissionsHistory}
                    onChange={handleChange}
                  />
                </div>

                <h3>F. Energy</h3>
                <div className="form-group">
                  <label htmlFor="cdpEnergyTotal">Total energy consumption (MWh)</label>
                  <input
                    type="text"
                    id="cdpEnergyTotal"
                    name="cdpEnergyTotal"
                    value={formData.cdpEnergyTotal}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cdpEnergyRenewable">Renewable energy (MWh and %)</label>
                  <input
                    type="text"
                    id="cdpEnergyRenewable"
                    name="cdpEnergyRenewable"
                    value={formData.cdpEnergyRenewable}
                    onChange={handleChange}
                    placeholder="e.g. 5,000 MWh (35%)"
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpEnergyIntensity">Energy intensity (denominator + value)</label>
                  <input
                    type="text"
                    id="cdpEnergyIntensity"
                    name="cdpEnergyIntensity"
                    value={formData.cdpEnergyIntensity}
                    onChange={handleChange}
                  />
                </div>

                <h3>G. Emissions Breakdown</h3>
                <div className="form-group full">
                  <label htmlFor="cdpEmissionsBreakdown">Scope 1/2 breakdown by facility/geography and source</label>
                  <textarea
                    id="cdpEmissionsBreakdown"
                    name="cdpEmissionsBreakdown"
                    rows={3}
                    value={formData.cdpEmissionsBreakdown}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpTopEmissionSources">Top 3 emission sources</label>
                  <textarea
                    id="cdpTopEmissionSources"
                    name="cdpTopEmissionSources"
                    rows={2}
                    value={formData.cdpTopEmissionSources}
                    onChange={handleChange}
                  />
                </div>

                <h3>H. Carbon Pricing</h3>
                <div className="form-group">
                  <label htmlFor="cdpCarbonPricing">Internal carbon price?</label>
                  <select
                    id="cdpCarbonPricing"
                    name="cdpCarbonPricing"
                    value={formData.cdpCarbonPricing}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpCarbonPricingDetails">Details (price, type, decisions influenced)</label>
                  <textarea
                    id="cdpCarbonPricingDetails"
                    name="cdpCarbonPricingDetails"
                    rows={3}
                    value={formData.cdpCarbonPricingDetails}
                    onChange={handleChange}
                  />
                </div>

                <h3>I. Engagement</h3>
                <div className="form-group">
                  <label htmlFor="cdpSupplierEngagementPercent">% of suppliers engaged (by spend)</label>
                  <input
                    type="text"
                    id="cdpSupplierEngagementPercent"
                    name="cdpSupplierEngagementPercent"
                    value={formData.cdpSupplierEngagementPercent}
                    onChange={handleChange}
                    placeholder="e.g. 40"
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpSupplierRequirements">Supplier emissions reporting requirement (Yes/No + details)</label>
                  <textarea
                    id="cdpSupplierRequirements"
                    name="cdpSupplierRequirements"
                    rows={3}
                    value={formData.cdpSupplierRequirements}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpInitiativesCommitments">Commitments (SBTi etc.) (Yes/No + details)</label>
                  <textarea
                    id="cdpInitiativesCommitments"
                    name="cdpInitiativesCommitments"
                    rows={3}
                    value={formData.cdpInitiativesCommitments}
                    onChange={handleChange}
                  />
                </div>

                <h3>J. Verification</h3>
                <div className="form-group">
                  <label htmlFor="cdpVerificationStatus">Scope 1 &amp; 2 externally verified?</label>
                  <select
                    id="cdpVerificationStatus"
                    name="cdpVerificationStatus"
                    value={formData.cdpVerificationStatus}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="cdpVerificationDetails">Verification details</label>
                  <textarea
                    id="cdpVerificationDetails"
                    name="cdpVerificationDetails"
                    rows={3}
                    value={formData.cdpVerificationDetails}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </section>

        <section
          id="esg-section-social"
          ref={(el) => {
            sectionRefs.current.social = el;
          }}
          className="form-section"
        >
          <h2>Social Metrics</h2>
          <p className="field-helper">
            Social disclosures are especially relevant for GRI, UN Global Compact and BRSR.
          </p>
          <div className="form-grid">
            {(noFrameworkSelected || hasFramework('GRI') || hasFramework('UN Global Compact') || hasFramework('BRSR')) && (
            <>
              <div className="form-group">
                <label htmlFor="totalEmployees">Total Employees</label>
                <input
                  type="text"
                  id="totalEmployees"
                  name="totalEmployees"
                  value={formData.totalEmployees}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="genderDiversityPercent">Gender Diversity % (women)</label>
                <input
                  type="text"
                  id="genderDiversityPercent"
                  name="genderDiversityPercent"
                  value={formData.genderDiversityPercent}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                />
              </div>
              <div className="form-group">
                <label htmlFor="trainingHoursPerEmployee">Training Hours per Employee</label>
                <input
                  type="text"
                  id="trainingHoursPerEmployee"
                  name="trainingHoursPerEmployee"
                  value={formData.trainingHoursPerEmployee}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="safetyIncidents">Recordable Safety Incidents</label>
                <input
                  type="text"
                  id="safetyIncidents"
                  name="safetyIncidents"
                  value={formData.safetyIncidents}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="communityInvestment">Community Investment ($)</label>
                <input
                  type="text"
                  id="communityInvestment"
                  name="communityInvestment"
                  value={formData.communityInvestment}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="employeeTurnoverPercent">Employee Turnover %</label>
                <input
                  type="text"
                  id="employeeTurnoverPercent"
                  name="employeeTurnoverPercent"
                  value={formData.employeeTurnoverPercent}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                />
              </div>
              <div className="form-group full">
                <label htmlFor="socialInitiatives">Social Initiatives & Notes</label>
                <textarea
                  id="socialInitiatives"
                  name="socialInitiatives"
                  rows={3}
                  value={formData.socialInitiatives}
                  onChange={handleChange}
                  placeholder="Diversity programs, community engagement, health & safety..."
                />
              </div>
            </>
            )}
          </div>
        </section>

        <section
          id="esg-section-governance"
          ref={(el) => {
            sectionRefs.current.governance = el;
          }}
          className="form-section"
        >
          <h2>Governance Metrics</h2>
          <p className="field-helper">
            Governance questions are most relevant for TCFD, ISSB / SASB, GRI and CSRD / ESRS.
          </p>
          <div className="form-grid">
            {(noFrameworkSelected
              || hasFramework('TCFD')
              || hasFramework('ISSB / SASB')
              || hasFramework('GRI')
              || hasFramework('CSRD / ESRS')) && (
            <>
              <div className="form-group">
                <label htmlFor="boardSize">Board Size</label>
                <input
                  type="text"
                  id="boardSize"
                  name="boardSize"
                  value={formData.boardSize}
                  onChange={handleChange}
                  placeholder="e.g. 9"
                />
              </div>
              <div className="form-group">
                <label htmlFor="independentDirectorsPercent">Independent Directors %</label>
                <input
                  type="text"
                  id="independentDirectorsPercent"
                  name="independentDirectorsPercent"
                  value={formData.independentDirectorsPercent}
                  onChange={handleChange}
                  placeholder="e.g. 67"
                />
              </div>
              <div className="form-group">
                <label htmlFor="sustainabilityCommittee">Sustainability Committee</label>
                <select
                  id="sustainabilityCommittee"
                  name="sustainabilityCommittee"
                  value={formData.sustainabilityCommittee}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="esgTargetsSet">ESG Targets Set</label>
                <select
                  id="esgTargetsSet"
                  name="esgTargetsSet"
                  value={formData.esgTargetsSet}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ethicsPolicy">Ethics / Anti-corruption Policy</label>
                <select
                  id="ethicsPolicy"
                  name="ethicsPolicy"
                  value={formData.ethicsPolicy}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="governanceInitiatives">Governance Initiatives & Notes</label>
                <textarea
                  id="governanceInitiatives"
                  name="governanceInitiatives"
                  rows={3}
                  value={formData.governanceInitiatives}
                  onChange={handleChange}
                  placeholder="Board oversight, risk management, ethics programs..."
                />
              </div>
            </>
            )}
          </div>
        </section>

        {false && (
        <section className="form-section">
          <h2>CDP Climate Questionnaire</h2>
          {!hasFramework('CDP') && (
          <p className="field-helper">
            This section is only required if you selected the CDP framework above.
          </p>
          )}
          {hasFramework('CDP') && (
          <>
            <h3>A. Governance</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cdpBoardReview">Does your Board review climate issues at least once per year?</label>
                <select
                  id="cdpBoardReview"
                  name="cdpBoardReview"
                  value={formData.cdpBoardReview}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="cdpBoardLastReviewDate">Date of last Board review (if applicable)</label>
                <input
                  type="text"
                  id="cdpBoardLastReviewDate"
                  name="cdpBoardLastReviewDate"
                  value={formData.cdpBoardLastReviewDate}
                  onChange={handleChange}
                  placeholder="e.g. 2026-03-31"
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpBoardTopics">Topics discussed at last Board review</label>
                <textarea
                  id="cdpBoardTopics"
                  name="cdpBoardTopics"
                  rows={3}
                  value={formData.cdpBoardTopics}
                  onChange={handleChange}
                  placeholder="Summarise key climate-related topics discussed..."
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpClimateResponsibleTitles">
                  Job titles responsible for climate-related management
                </label>
                <textarea
                  id="cdpClimateResponsibleTitles"
                  name="cdpClimateResponsibleTitles"
                  rows={2}
                  value={formData.cdpClimateResponsibleTitles}
                  onChange={handleChange}
                  placeholder="e.g. Chief Sustainability Officer, Head of ESG, Plant Manager..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="cdpExecCompLinked">Are climate KPIs in executive compensation?</label>
                <select
                  id="cdpExecCompLinked"
                  name="cdpExecCompLinked"
                  value={formData.cdpExecCompLinked}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="cdpExecCompDetails">
                  If yes, KPI name, metric and % of bonus linked
                </label>
                <textarea
                  id="cdpExecCompDetails"
                  name="cdpExecCompDetails"
                  rows={3}
                  value={formData.cdpExecCompDetails}
                  onChange={handleChange}
                  placeholder="e.g. Scope 1+2 reduction, energy efficiency, CDP score..."
                />
              </div>
            </div>

            <h3>B. Risks &amp; Opportunities</h3>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="cdpRisksSummary">
                  Climate-related risks (up to 10) with type, description, time horizon, impact and likelihood
                </label>
                <textarea
                  id="cdpRisksSummary"
                  name="cdpRisksSummary"
                  rows={4}
                  value={formData.cdpRisksSummary}
                  onChange={handleChange}
                  placeholder="Use a bullet or table-style format to list risks, type (physical/transition), time horizon, impact and likelihood..."
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpOpportunitiesSummary">
                  Climate-related opportunities (up to 5) with description, financial benefit and time horizon
                </label>
                <textarea
                  id="cdpOpportunitiesSummary"
                  name="cdpOpportunitiesSummary"
                  rows={4}
                  value={formData.cdpOpportunitiesSummary}
                  onChange={handleChange}
                  placeholder="Describe opportunities such as new products, efficiency gains, renewable projects..."
                />
              </div>
            </div>

            <h3>C. Business Strategy</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cdpStrategyIntegrated">
                  Is climate change integrated into documented business strategy?
                </label>
                <select
                  id="cdpStrategyIntegrated"
                  name="cdpStrategyIntegrated"
                  value={formData.cdpStrategyIntegrated}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="cdpStrategyExamples">
                  If yes, provide examples (products, capex decisions, etc.)
                </label>
                <textarea
                  id="cdpStrategyExamples"
                  name="cdpStrategyExamples"
                  rows={3}
                  value={formData.cdpStrategyExamples}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cdpTransitionPlan">
                  Do you have a formal transition plan aligned with net-zero?
                </label>
                <select
                  id="cdpTransitionPlan"
                  name="cdpTransitionPlan"
                  value={formData.cdpTransitionPlan}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="cdpTransitionPlanDetails">
                  If yes, target year, interim milestones and key levers
                </label>
                <textarea
                  id="cdpTransitionPlanDetails"
                  name="cdpTransitionPlanDetails"
                  rows={3}
                  value={formData.cdpTransitionPlanDetails}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cdpTcfdAlignment">
                  Alignment with TCFD recommendations
                </label>
                <select
                  id="cdpTcfdAlignment"
                  name="cdpTcfdAlignment"
                  value={formData.cdpTcfdAlignment}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Fully aligned">Fully aligned</option>
                  <option value="Partially aligned">Partially aligned</option>
                  <option value="Not aligned">Not aligned</option>
                </select>
              </div>
            </div>

            <h3>D. Targets &amp; Performance</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cdpTargetsHave">Do you have emissions reduction targets?</label>
                <select
                  id="cdpTargetsHave"
                  name="cdpTargetsHave"
                  value={formData.cdpTargetsHave}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="cdpTargetsDetails">
                  For each target, describe type, base year, target year, % reduction and % achieved
                </label>
                <textarea
                  id="cdpTargetsDetails"
                  name="cdpTargetsDetails"
                  rows={3}
                  value={formData.cdpTargetsDetails}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3>E. Emissions Data</h3>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="cdpEmissionsCurrentYear">
                  Current reporting year emissions (Scope 1, Scope 2 – location/market, Scope 3 with categories)
                </label>
                <textarea
                  id="cdpEmissionsCurrentYear"
                  name="cdpEmissionsCurrentYear"
                  rows={3}
                  value={formData.cdpEmissionsCurrentYear}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cdpEmissionsMethodology">
                  Calculation methodology (e.g. GHG Protocol)
                </label>
                <input
                  type="text"
                  id="cdpEmissionsMethodology"
                  name="cdpEmissionsMethodology"
                  value={formData.cdpEmissionsMethodology}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpEmissionsHistory">
                  Emissions for the past 3 reporting years
                </label>
                <textarea
                  id="cdpEmissionsHistory"
                  name="cdpEmissionsHistory"
                  rows={3}
                  value={formData.cdpEmissionsHistory}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3>F. Energy</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cdpEnergyTotal">Total energy consumption (MWh)</label>
                <input
                  type="text"
                  id="cdpEnergyTotal"
                  name="cdpEnergyTotal"
                  value={formData.cdpEnergyTotal}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cdpEnergyRenewable">
                  Renewable energy consumption (MWh and % of total)
                </label>
                <input
                  type="text"
                  id="cdpEnergyRenewable"
                  name="cdpEnergyRenewable"
                  value={formData.cdpEnergyRenewable}
                  onChange={handleChange}
                  placeholder="e.g. 5,000 MWh (35%)"
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpEnergyIntensity">
                  Energy intensity and denominator (e.g. per unit production)
                </label>
                <input
                  type="text"
                  id="cdpEnergyIntensity"
                  name="cdpEnergyIntensity"
                  value={formData.cdpEnergyIntensity}
                  onChange={handleChange}
                  placeholder="e.g. 1.2 MWh per tonne of product"
                />
              </div>
            </div>

            <h3>G. Emissions Breakdown</h3>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="cdpEmissionsBreakdown">
                  Breakdown of Scope 1 and 2 by facility/geography and source
                </label>
                <textarea
                  id="cdpEmissionsBreakdown"
                  name="cdpEmissionsBreakdown"
                  rows={3}
                  value={formData.cdpEmissionsBreakdown}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpTopEmissionSources">
                  Top 3 emission sources and approximate contribution
                </label>
                <textarea
                  id="cdpTopEmissionSources"
                  name="cdpTopEmissionSources"
                  rows={2}
                  value={formData.cdpTopEmissionSources}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3>H. Carbon Pricing</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cdpCarbonPricing">Do you apply an internal carbon price?</label>
                <select
                  id="cdpCarbonPricing"
                  name="cdpCarbonPricing"
                  value={formData.cdpCarbonPricing}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="cdpCarbonPricingDetails">
                  If yes, price per ton, type and decisions influenced
                </label>
                <textarea
                  id="cdpCarbonPricingDetails"
                  name="cdpCarbonPricingDetails"
                  rows={3}
                  value={formData.cdpCarbonPricingDetails}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3>I. Engagement</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cdpSupplierEngagementPercent">
                  % of suppliers (by spend) engaged on climate issues
                </label>
                <input
                  type="text"
                  id="cdpSupplierEngagementPercent"
                  name="cdpSupplierEngagementPercent"
                  value={formData.cdpSupplierEngagementPercent}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpSupplierRequirements">
                  Do you require suppliers to report emissions? Add details.
                </label>
                <textarea
                  id="cdpSupplierRequirements"
                  name="cdpSupplierRequirements"
                  rows={3}
                  value={formData.cdpSupplierRequirements}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full">
                <label htmlFor="cdpInitiativesCommitments">
                  Commitments to SBTi or similar initiatives (Yes/No and details)
                </label>
                <textarea
                  id="cdpInitiativesCommitments"
                  name="cdpInitiativesCommitments"
                  rows={3}
                  value={formData.cdpInitiativesCommitments}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h3>J. Verification</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="cdpVerificationStatus">
                  Are Scope 1 and 2 emissions externally verified?
                </label>
                <select
                  id="cdpVerificationStatus"
                  name="cdpVerificationStatus"
                  value={formData.cdpVerificationStatus}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group full">
                <label htmlFor="cdpVerificationDetails">
                  If yes, standard, assurance level and verifier name
                </label>
                <textarea
                  id="cdpVerificationDetails"
                  name="cdpVerificationDetails"
                  rows={3}
                  value={formData.cdpVerificationDetails}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
          )}
        </section>
        )}

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
