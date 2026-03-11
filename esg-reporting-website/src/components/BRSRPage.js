import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './BRSRPage.css';

const BRSRPage = () => {
  const history = useHistory();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    // Module A – General Disclosures
    companyName: '',
    cin: '',
    registeredAddress: '',
    stockExchanges: '',
    plantLocations: '',
    keyActivities90Turnover: '',
    totalEmployees: '',
    totalWorkers: '',
    femaleEmployees: '',
    differentlyAbledEmployees: '',
    netWorth: '',
    turnover: '',
    csrApplicable: '',
    // Module B – Management & Process
    ngrbcPoliciesStatus: '',
    policyOwners: '',
    esgGoalsTargets: '',
    // Module C – Principle-wise Performance
    corruptionCases: '',
    corruptionFines: '',
    sustainableSourcing: '',
    envRD: '',
    plasticWaste: '',
    eWaste: '',
    hazardousWaste: '',
    minWageCompliance: '',
    avgTrainingHours: '',
    safetyIncidents: '',
    workerGrievances: '',
    grievanceResolutionTime: '',
    stakeholderEngagement: '',
    // Module D – Materiality & Risk
    keyRisks: '',
    riskFinancialImpact: '',
    riskMitigationPlans: '',
  });

  const modules = ['Module A', 'Module B', 'Module C', 'Module D'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, modules.length - 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log('BRSR form submitted:', formData);
    history.push({
      pathname: '/final-report',
      state: {
        source: 'BRSR',
        brsrData: formData,
      },
    });
  };

  return (
    <div className="brsr-page">
      <section className="brsr-hero">
        <h1>Business Responsibility &amp; Sustainability Reporting (BRSR)</h1>
        <p>
          Capture SEBI BRSR-aligned disclosures across four guided modules. Move between modules with
          Next/Previous and let each team fill in the fields tagged for them.
        </p>
      </section>

      <section className="brsr-content">
        <div className="brsr-steps">
          {modules.map((label, index) => (
            <div
              key={label}
              className={`brsr-step ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
              onClick={() => setStep(index)}
            >
              <span className="brsr-step-index">{index + 1}</span>
              <span className="brsr-step-label">{label}</span>
            </div>
          ))}
        </div>

        <form
          className="brsr-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {step === 0 && (
            <div className="brsr-card">
              <span className="brsr-module-label">Module A · General Disclosures (The “Basics”)</span>
              <h2>Foundational company information</h2>
              <div className="brsr-form-grid">
                <div className="brsr-field">
                  <label htmlFor="companyName">
                    Company name (Legal/CS)
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Registered name of the company"
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="cin">
                    CIN (Legal/CS)
                  </label>
                  <input
                    id="cin"
                    name="cin"
                    type="text"
                    value={formData.cin}
                    onChange={handleChange}
                    placeholder="Corporate Identification Number"
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="registeredAddress">
                    Registered address (Legal/CS)
                  </label>
                  <textarea
                    id="registeredAddress"
                    name="registeredAddress"
                    rows={2}
                    value={formData.registeredAddress}
                    onChange={handleChange}
                    placeholder="Full registered office address"
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="stockExchanges">
                    Stock exchange listings (Legal/CS)
                  </label>
                  <textarea
                    id="stockExchanges"
                    name="stockExchanges"
                    rows={2}
                    value={formData.stockExchanges}
                    onChange={handleChange}
                    placeholder="List exchanges and script codes where the company is listed"
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="plantLocations">
                    Locations of plants/offices – India &amp; overseas (Operations)
                  </label>
                  <textarea
                    id="plantLocations"
                    name="plantLocations"
                    rows={3}
                    value={formData.plantLocations}
                    onChange={handleChange}
                    placeholder="Key manufacturing plants, offices and major facilities"
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="keyActivities90Turnover">
                    Business activities covering ~90% of turnover (Operations/Finance)
                  </label>
                  <textarea
                    id="keyActivities90Turnover"
                    name="keyActivities90Turnover"
                    rows={3}
                    value={formData.keyActivities90Turnover}
                    onChange={handleChange}
                    placeholder="Describe main products/services and their share of revenue"
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="totalEmployees">
                    Total employees (HR)
                  </label>
                  <input
                    id="totalEmployees"
                    name="totalEmployees"
                    type="number"
                    value={formData.totalEmployees}
                    onChange={handleChange}
                    placeholder="Headcount on reporting date"
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="totalWorkers">
                    Total workers (HR)
                  </label>
                  <input
                    id="totalWorkers"
                    name="totalWorkers"
                    type="number"
                    value={formData.totalWorkers}
                    onChange={handleChange}
                    placeholder="Contract and other workers"
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="femaleEmployees">
                    Women employees (HR)
                  </label>
                  <input
                    id="femaleEmployees"
                    name="femaleEmployees"
                    type="number"
                    value={formData.femaleEmployees}
                    onChange={handleChange}
                    placeholder="Number of women employees"
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="differentlyAbledEmployees">
                    Differently abled employees (HR)
                  </label>
                  <input
                    id="differentlyAbledEmployees"
                    name="differentlyAbledEmployees"
                    type="number"
                    value={formData.differentlyAbledEmployees}
                    onChange={handleChange}
                    placeholder="Number of employees with disabilities"
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="netWorth">
                    Net worth (Finance)
                  </label>
                  <input
                    id="netWorth"
                    name="netWorth"
                    type="text"
                    value={formData.netWorth}
                    onChange={handleChange}
                    placeholder="As of reporting date (e.g., ₹ X crore)"
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="turnover">
                    Turnover (Finance)
                  </label>
                  <input
                    id="turnover"
                    name="turnover"
                    type="text"
                    value={formData.turnover}
                    onChange={handleChange}
                    placeholder="Annual turnover in reporting year"
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="csrApplicable">
                    CSR applicability &amp; brief (Legal/CS)
                  </label>
                  <textarea
                    id="csrApplicable"
                    name="csrApplicable"
                    rows={2}
                    value={formData.csrApplicable}
                    onChange={handleChange}
                    placeholder="Whether CSR is applicable and a short note on CSR projects"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="brsr-card">
              <span className="brsr-module-label">Module B · Management &amp; Process (The “Rules”)</span>
              <h2>Policies, governance &amp; ESG targets</h2>
              <div className="brsr-form-grid">
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="ngrbcPoliciesStatus">
                    NGRBC policy status for Principles 1–9 (Legal/CS)
                  </label>
                  <textarea
                    id="ngrbcPoliciesStatus"
                    name="ngrbcPoliciesStatus"
                    rows={4}
                    value={formData.ngrbcPoliciesStatus}
                    onChange={handleChange}
                    placeholder="For each principle, mention if a board-approved policy exists and how it is implemented."
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="policyOwners">
                    Highest authority / owner for each policy (Board/Committee/ CXO) (Legal/CS)
                  </label>
                  <textarea
                    id="policyOwners"
                    name="policyOwners"
                    rows={3}
                    value={formData.policyOwners}
                    onChange={handleChange}
                    placeholder="E.g., P2 – Sustainability Committee; P3 – CHRO; P6 – EHS Head."
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="esgGoalsTargets">
                    Key ESG goals &amp; annual targets (Management/Strategy)
                  </label>
                  <textarea
                    id="esgGoalsTargets"
                    name="esgGoalsTargets"
                    rows={4}
                    value={formData.esgGoalsTargets}
                    onChange={handleChange}
                    placeholder="List top ESG goals, KPIs and whether targets were achieved in the reporting year."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="brsr-card">
              <span className="brsr-module-label">Module C · Principle-wise Performance (The “Numbers”)</span>
              <h2>Essential and leadership indicators</h2>
              <div className="brsr-form-grid">
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="corruptionCases">
                    Corruption / bribery cases &amp; complaints (P1) (Legal/Compliance)
                  </label>
                  <textarea
                    id="corruptionCases"
                    name="corruptionCases"
                    rows={3}
                    value={formData.corruptionCases}
                    onChange={handleChange}
                    placeholder="Number and brief description of cases during the year."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="corruptionFines">
                    Fines / penalties paid (P1) (Legal/Compliance)
                  </label>
                  <input
                    id="corruptionFines"
                    name="corruptionFines"
                    type="text"
                    value={formData.corruptionFines}
                    onChange={handleChange}
                    placeholder="₹ amount and description, if any."
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="sustainableSourcing">
                    Sustainable sourcing initiatives (P2) (Procurement/Operations)
                  </label>
                  <textarea
                    id="sustainableSourcing"
                    name="sustainableSourcing"
                    rows={3}
                    value={formData.sustainableSourcing}
                    onChange={handleChange}
                    placeholder="Share of raw materials sustainably sourced, supplier requirements, certifications, etc."
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="envRD">
                    R&amp;D for environmental technologies (P2 &amp; P6) (R&amp;D/Operations)
                  </label>
                  <textarea
                    id="envRD"
                    name="envRD"
                    rows={3}
                    value={formData.envRD}
                    onChange={handleChange}
                    placeholder="Investments and projects aimed at reducing environmental footprint."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="plasticWaste">
                    Plastic waste generated &amp; treated (P2 &amp; P6) (Operations/EHS)
                  </label>
                  <input
                    id="plasticWaste"
                    name="plasticWaste"
                    type="text"
                    value={formData.plasticWaste}
                    onChange={handleChange}
                    placeholder="Tonnes generated, recycled, co-processed, etc."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="eWaste">
                    E-waste generated &amp; treated (P2 &amp; P6) (Operations/EHS)
                  </label>
                  <input
                    id="eWaste"
                    name="eWaste"
                    type="text"
                    value={formData.eWaste}
                    onChange={handleChange}
                    placeholder="Tonnes collected and processed as per rules."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="hazardousWaste">
                    Hazardous waste generated &amp; treated (P2 &amp; P6) (Operations/EHS)
                  </label>
                  <input
                    id="hazardousWaste"
                    name="hazardousWaste"
                    type="text"
                    value={formData.hazardousWaste}
                    onChange={handleChange}
                    placeholder="Hazardous waste numbers and disposal methods."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="minWageCompliance">
                    Minimum wage compliance (P3) (HR)
                  </label>
                  <input
                    id="minWageCompliance"
                    name="minWageCompliance"
                    type="text"
                    value={formData.minWageCompliance}
                    onChange={handleChange}
                    placeholder="Coverage of employees/workers vs. statutory minimum wages."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="avgTrainingHours">
                    Average training hours per employee (P3) (HR)
                  </label>
                  <input
                    id="avgTrainingHours"
                    name="avgTrainingHours"
                    type="text"
                    value={formData.avgTrainingHours}
                    onChange={handleChange}
                    placeholder="Average annual hours of training by role/level."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="safetyIncidents">
                    Safety incidents (P3) (EHS/HR)
                  </label>
                  <input
                    id="safetyIncidents"
                    name="safetyIncidents"
                    type="text"
                    value={formData.safetyIncidents}
                    onChange={handleChange}
                    placeholder="Lost time injuries, fatalities, incident rate, etc."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="workerGrievances">
                    Worker grievances raised (P5) (HR)
                  </label>
                  <input
                    id="workerGrievances"
                    name="workerGrievances"
                    type="text"
                    value={formData.workerGrievances}
                    onChange={handleChange}
                    placeholder="Number and nature of grievances reported."
                  />
                </div>
                <div className="brsr-field">
                  <label htmlFor="grievanceResolutionTime">
                    Average grievance resolution time (P5) (HR)
                  </label>
                  <input
                    id="grievanceResolutionTime"
                    name="grievanceResolutionTime"
                    type="text"
                    value={formData.grievanceResolutionTime}
                    onChange={handleChange}
                    placeholder="Average time taken to close grievances."
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="stakeholderEngagement">
                    Engagement with marginalized / vulnerable stakeholders (P4) (CSR/Community)
                  </label>
                  <textarea
                    id="stakeholderEngagement"
                    name="stakeholderEngagement"
                    rows={3}
                    value={formData.stakeholderEngagement}
                    onChange={handleChange}
                    placeholder="Key programs, target groups and outcomes."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="brsr-card">
              <span className="brsr-module-label">Module D · Materiality &amp; Risk (The “Strategy”)</span>
              <h2>Material risks &amp; mitigation</h2>
              <div className="brsr-form-grid">
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="keyRisks">
                    Key environmental &amp; social risks (Risk/Strategy)
                  </label>
                  <textarea
                    id="keyRisks"
                    name="keyRisks"
                    rows={4}
                    value={formData.keyRisks}
                    onChange={handleChange}
                    placeholder="List material ESG risks (e.g., climate, water, safety, supply chain, social license)."
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="riskFinancialImpact">
                    Link to financial impact (Risk/Finance)
                  </label>
                  <textarea
                    id="riskFinancialImpact"
                    name="riskFinancialImpact"
                    rows={3}
                    value={formData.riskFinancialImpact}
                    onChange={handleChange}
                    placeholder="Describe how each risk could affect revenue, costs, assets, liabilities or reputation."
                  />
                </div>
                <div className="brsr-field brsr-field-full">
                  <label htmlFor="riskMitigationPlans">
                    Mitigation plans &amp; timelines (Risk/Operations)
                  </label>
                  <textarea
                    id="riskMitigationPlans"
                    name="riskMitigationPlans"
                    rows={4}
                    value={formData.riskMitigationPlans}
                    onChange={handleChange}
                    placeholder="Controls in place, planned interventions, owners and completion timelines."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="brsr-actions">
            <button
              type="button"
              className="btn btn-secondary brsr-nav-button"
              onClick={handlePrev}
              disabled={step === 0}
            >
              Previous module
            </button>
            {step < modules.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary brsr-nav-button"
              onClick={handleNext}
            >
              Next module
            </button>
            ) : (
            <button
              type="button"
              className="btn btn-primary brsr-nav-button"
              onClick={handleSubmit}
            >
              Submit BRSR details
            </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};

export default BRSRPage;

