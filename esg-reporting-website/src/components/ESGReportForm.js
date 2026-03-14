import React, { useState } from 'react';
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
  const [step, setStep] = useState(0);
  const steps = ['Company', 'Environmental', 'Social', 'Governance'];

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
        <p>
          Step
          {' '}
          {step + 1}
          /
          {steps.length}
          :
          {' '}
          {steps[step]}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="esg-form">
        {step === 0 && (
        <section className="form-section">
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
        )}

        {step === 1 && (
        <section className="form-section">
          <h2>Environmental Metrics</h2>
          <div className="form-grid">
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
              <label htmlFor="scope1FuelStationaryDetails">
                Fuel Consumption – Stationary Sources
              </label>
              <textarea
                id="scope1FuelStationaryDetails"
                name="scope1FuelStationaryDetails"
                rows={3}
                value={formData.scope1FuelStationaryDetails}
                onChange={handleChange}
                placeholder="Enter fuel used in boilers, generators, furnaces, etc.&#10;e.g. Plant A – Diesel – 3,500 – Liters – 2026 annual"
              />
              <small>
                Include: fuel type (diesel, petrol, natural gas, LPG, coal, biomass), quantity consumed, unit of
                measurement (liters, kg, m³), facility/location, and time period (monthly or annual).
              </small>
            </div>
            <div className="form-group full">
              <label htmlFor="scope1CompanyVehicleDetails">Company Vehicle Fuel Usage</label>
              <textarea
                id="scope1CompanyVehicleDetails"
                name="scope1CompanyVehicleDetails"
                rows={3}
                value={formData.scope1CompanyVehicleDetails}
                onChange={handleChange}
                placeholder="Enter fuel used in company-owned vehicles.&#10;e.g. Delivery Truck – Diesel – 1,200 L – FY 2026"
              />
              <small>
                Include: vehicle type, fuel type, fuel consumption or distance travelled, and any fuel purchase records.
              </small>
            </div>
            <div className="form-group full">
              <label htmlFor="scope1RefrigerantDetails">
                Refrigerants / Air Conditioning Leakage
              </label>
              <textarea
                id="scope1RefrigerantDetails"
                name="scope1RefrigerantDetails"
                rows={3}
                value={formData.scope1RefrigerantDetails}
                onChange={handleChange}
                placeholder="Enter refrigerant use and leakage.&#10;e.g. HQ Chiller – R410a – 12 kg replaced – 2026 maintenance"
              />
              <small>
                Include: refrigerant type (e.g. R134a, R410a), amount used or replaced, and relevant maintenance records.
              </small>
            </div>
            <div className="form-group full">
              <label htmlFor="scope1ProcessEmissionsDetails">
                Industrial Process Emissions (if applicable)
              </label>
              <textarea
                id="scope1ProcessEmissionsDetails"
                name="scope1ProcessEmissionsDetails"
                rows={3}
                value={formData.scope1ProcessEmissionsDetails}
                onChange={handleChange}
                placeholder="Enter process-related emissions.&#10;e.g. Cement line – clinker production volume, kiln fuel mix, calcination data"
              />
              <small>
                Include: production volumes, raw materials used, and process emissions data for relevant industries
                (e.g. cement, steel, chemicals).
              </small>
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
              <label htmlFor="scope2ElectricityDetails">Electricity Consumption</label>
              <textarea
                id="scope2ElectricityDetails"
                name="scope2ElectricityDetails"
                rows={3}
                value={formData.scope2ElectricityDetails}
                onChange={handleChange}
                placeholder="Enter electricity consumed per facility.&#10;e.g. Office HQ – 42,000 – kWh – Utility ABC – FY 2026"
              />
              <small>
                Include: electricity consumed, unit (kWh or MWh), facility location, utility provider, and time period.
                Use data from electricity bills or energy management systems.
              </small>
            </div>
            <div className="form-group full">
              <label htmlFor="scope2ThermalEnergyDetails">
                Purchased Heating / Cooling / Steam
              </label>
              <textarea
                id="scope2ThermalEnergyDetails"
                name="scope2ThermalEnergyDetails"
                rows={3}
                value={formData.scope2ThermalEnergyDetails}
                onChange={handleChange}
                placeholder="Enter purchased thermal energy.&#10;e.g. Purchased steam – 12,000 kWh – Supplier XYZ – FY 2026"
              />
              <small>
                Include: type of energy (steam, heating, cooling), amount consumed, energy supplier, and reporting period.
              </small>
            </div>
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
          </div>
        </section>
        )}

        {step === 2 && (
        <section className="form-section">
          <h2>Social Metrics</h2>
          <div className="form-grid">
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
          </div>
        </section>
        )}

        {step === 3 && (
        <section className="form-section">
          <h2>Governance Metrics</h2>
          <div className="form-grid">
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
          </div>
        </section>
        )}

        <div className="form-actions">
          {step > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </button>
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}
            >
              Next
            </button>
          ) : (
            <button type="submit" className="btn btn-primary btn-lg">
              Submit details
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ESGReportForm;
