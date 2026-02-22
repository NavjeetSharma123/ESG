import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { generateESGReportPDF } from '../utils/reportGenerator';
import './ESGReportForm.css';

const ESGReportForm = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    industry: '',
    reportingPeriod: new Date().getFullYear().toString(),
    hqLocation: '',
    employeeCount: '',
    revenue: '',
    website: '',
    // Environmental
    scope1Emissions: '',
    scope2Emissions: '',
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const pdfBlob = generateESGReportPDF(formData);
      const reportUrl = URL.createObjectURL(pdfBlob);
      history.push({
        pathname: '/esg-report-result',
        state: { reportUrl, companyName: formData.companyName },
      });
    } catch (err) {
      console.error('Report generation failed:', err);
      alert('Report generation failed. Please check required fields.');
    }
  };

  return (
    <div className="esg-report-form-page">
      <div className="esg-form-header">
        <h1>ESG Report Generation</h1>
        <p>
          Complete the form below with your organization&apos;s data. Fields align with GRI, SASB, and TCFD frameworks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="esg-form">
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
                placeholder="e.g. 2024"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="hqLocation">Headquarters Location *</label>
              <input
                type="text"
                id="hqLocation"
                name="hqLocation"
                value={formData.hqLocation}
                onChange={handleChange}
                placeholder="City, Country"
                required
              />
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

        <section className="form-section">
          <h2>Environmental Metrics</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="scope1Emissions">Scope 1 Emissions (tCO₂e) *</label>
              <input
                type="text"
                id="scope1Emissions"
                name="scope1Emissions"
                value={formData.scope1Emissions}
                onChange={handleChange}
                placeholder="Direct emissions"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="scope2Emissions">Scope 2 Emissions (tCO₂e) *</label>
              <input
                type="text"
                id="scope2Emissions"
                name="scope2Emissions"
                value={formData.scope2Emissions}
                onChange={handleChange}
                placeholder="Indirect - purchased energy"
                required
              />
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

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg">
            Generate & Download Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ESGReportForm;
