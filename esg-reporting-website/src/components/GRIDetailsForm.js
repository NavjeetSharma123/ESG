import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './ESGReportForm.css';

const GRIDetailsForm = () => {
  const history = useHistory();
  const location = useLocation();
  const baseFormData = (location.state && location.state.baseFormData) || {};

  const [universal, setUniversal] = useState({
    companyLegalStructure: '',
    headquartersLocation: '',
    operationalRegions: '',
    natureOfBusiness: '',
    numberOfEmployees: '',
    supplyChainDetails: '',
    boardStructure: '',
    boardComposition: '',
    committeesOversight: '',
    ethicalGuidelines: '',
    sustainabilityGoals: '',
    riskManagementPolicies: '',
    climateCommitments: '',
    stakeholdersIdentified: '',
    engagementMethods: '',
    stakeholderConcerns: '',
    materialIssuesIdentified: '',
    materialIssuesPrioritization: '',
    materialImpactEvaluation: '',
  });

  const [economic, setEconomic] = useState({
    revenueAndProfits: '',
    operatingCosts: '',
    evgd: '',
    localHiringRatios: '',
    entryLevelVsMinimumWage: '',
    localSupplierSpending: '',
    infrastructureInvestments: '',
    communityDevelopmentSpending: '',
    economicContributions: '',
    corruptionIncidents: '',
    antiCorruptionTraining: '',
    internalAuditReports: '',
    taxesPaidByCountry: '',
    governmentGrantsSubsidies: '',
  });

  const [environmental, setEnvironmental] = useState({
    electricityConsumption: '',
    renewableVsNonRenewable: '',
    fuelConsumption: '',
    ghgEmissionsOverview: '',
    scope1Details: '',
    scope2Details: '',
    scope3Details: '',
    waterWithdrawal: '',
    waterConsumption: '',
    waterRecycling: '',
    wastewaterDischarge: '',
    totalWasteGenerated: '',
    hazardousVsNonHazardous: '',
    wasteRecycledDisposed: '',
    environmentalFinesPenalties: '',
    environmentalRegulatoryCompliance: '',
    landUseChanges: '',
    biodiversityProtectedAreasImpact: '',
  });

  const [social, setSocial] = useState({
    totalWorkforce: '',
    employeeTurnoverRates: '',
    genderDiversityRatios: '',
    workplaceInjuryRates: '',
    fatalities: '',
    safetyTrainingPrograms: '',
    trainingHoursPerEmployee: '',
    leadershipDevelopmentPrograms: '',
    skillEnhancementInitiatives: '',
    childLaborChecks: '',
    forcedLaborPreventionPolicies: '',
    supplierComplianceAudits: '',
    csrInvestments: '',
    localCommunityPrograms: '',
    socialImpactInitiatives: '',
    customerPrivacyIncidents: '',
    productSafetyReports: '',
    customerSatisfactionData: '',
  });

  const handleSectionChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const combinedData = {
      baseFormData,
      griUniversal: universal,
      griEconomic: economic,
      griEnvironmental: environmental,
      griSocial: social,
    };

    history.push({
      pathname: '/final-report',
      state: {
        source: 'GRI',
        griData: combinedData,
      },
    });
  };

  return (
    <div className="esg-report-form-page">
      <div className="esg-form-header">
        <h1>GRI Company Details</h1>
        <p>
          Provide detailed inputs aligned to GRI Universal Standards (GRI 1, 2, 3) and the
          Economic, Environmental, and Social series.
        </p>
        {baseFormData.companyName && (
          <p>
            <strong>Company:</strong> {baseFormData.companyName}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="esg-form">
        <section className="form-section">
          <h2>1. Universal Standards Inputs (GRI 1, 2, 3)</h2>

          <h3>1.1 Organizational Profile</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" value={baseFormData.companyName} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="companyLegalStructure">Legal Structure</label>
              <input
                id="companyLegalStructure"
                name="companyLegalStructure"
                type="text"
                value={universal.companyLegalStructure}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="headquartersLocation">Headquarters Location</label>
              <input
                id="headquartersLocation"
                name="headquartersLocation"
                type="text"
                value={universal.headquartersLocation}
                onChange={handleSectionChange(setUniversal)}
                placeholder="City, Country"
              />
            </div>
            <div className="form-group full">
              <label htmlFor="operationalRegions">Operational Regions</label>
              <textarea
                id="operationalRegions"
                name="operationalRegions"
                rows={2}
                value={universal.operationalRegions}
                onChange={handleSectionChange(setUniversal)}
                placeholder="List key regions/countries where the company operates."
              />
            </div>
            <div className="form-group full">
              <label htmlFor="natureOfBusiness">Nature of Business and Products/Services</label>
              <textarea
                id="natureOfBusiness"
                name="natureOfBusiness"
                rows={3}
                value={universal.natureOfBusiness}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="numberOfEmployees">Number of Employees</label>
              <input
                id="numberOfEmployees"
                name="numberOfEmployees"
                type="text"
                value={universal.numberOfEmployees}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="supplyChainDetails">Supply Chain Details</label>
              <textarea
                id="supplyChainDetails"
                name="supplyChainDetails"
                rows={3}
                value={universal.supplyChainDetails}
                onChange={handleSectionChange(setUniversal)}
                placeholder="Describe main suppliers, logistics partners, and sourcing regions."
              />
            </div>
          </div>

          <h3>1.2 Governance Information</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="boardStructure">Board Structure</label>
              <textarea
                id="boardStructure"
                name="boardStructure"
                rows={2}
                value={universal.boardStructure}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="boardComposition">Board Composition</label>
              <textarea
                id="boardComposition"
                name="boardComposition"
                rows={2}
                value={universal.boardComposition}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="committeesOversight">Committees and Oversight Mechanisms</label>
              <textarea
                id="committeesOversight"
                name="committeesOversight"
                rows={3}
                value={universal.committeesOversight}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="ethicalGuidelines">Ethical Guidelines and Codes of Conduct</label>
              <textarea
                id="ethicalGuidelines"
                name="ethicalGuidelines"
                rows={3}
                value={universal.ethicalGuidelines}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
          </div>

          <h3>1.3 Strategy and Policies</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="sustainabilityGoals">Sustainability Goals and Strategies</label>
              <textarea
                id="sustainabilityGoals"
                name="sustainabilityGoals"
                rows={3}
                value={universal.sustainabilityGoals}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="riskManagementPolicies">Risk Management Policies</label>
              <textarea
                id="riskManagementPolicies"
                name="riskManagementPolicies"
                rows={3}
                value={universal.riskManagementPolicies}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="climateCommitments">Climate Commitments</label>
              <textarea
                id="climateCommitments"
                name="climateCommitments"
                rows={3}
                value={universal.climateCommitments}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
          </div>

          <h3>1.4 Stakeholder Engagement</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="stakeholdersIdentified">Stakeholders Identified</label>
              <textarea
                id="stakeholdersIdentified"
                name="stakeholdersIdentified"
                rows={2}
                value={universal.stakeholdersIdentified}
                onChange={handleSectionChange(setUniversal)}
                placeholder="Investors, employees, communities, regulators, customers, etc."
              />
            </div>
            <div className="form-group full">
              <label htmlFor="engagementMethods">Methods of Engagement</label>
              <textarea
                id="engagementMethods"
                name="engagementMethods"
                rows={2}
                value={universal.engagementMethods}
                onChange={handleSectionChange(setUniversal)}
                placeholder="Surveys, consultations, town halls, meetings, etc."
              />
            </div>
            <div className="form-group full">
              <label htmlFor="stakeholderConcerns">Key Concerns Raised by Stakeholders</label>
              <textarea
                id="stakeholderConcerns"
                name="stakeholderConcerns"
                rows={3}
                value={universal.stakeholderConcerns}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
          </div>

          <h3>1.5 Materiality Assessment</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="materialIssuesIdentified">Major Sustainability Issues Identified</label>
              <textarea
                id="materialIssuesIdentified"
                name="materialIssuesIdentified"
                rows={3}
                value={universal.materialIssuesIdentified}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="materialIssuesPrioritization">
                Prioritization of Sustainability Issues
              </label>
              <textarea
                id="materialIssuesPrioritization"
                name="materialIssuesPrioritization"
                rows={3}
                value={universal.materialIssuesPrioritization}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="materialImpactEvaluation">Impact Evaluation</label>
              <textarea
                id="materialImpactEvaluation"
                name="materialImpactEvaluation"
                rows={3}
                value={universal.materialImpactEvaluation}
                onChange={handleSectionChange(setUniversal)}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>2. Economic Segment Inputs (GRI 200 Series)</h2>
          <h3>2.1 Financial Performance</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="revenueAndProfits">Revenue and Profits</label>
              <textarea
                id="revenueAndProfits"
                name="revenueAndProfits"
                rows={2}
                value={economic.revenueAndProfits}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="operatingCosts">Operating Costs</label>
              <textarea
                id="operatingCosts"
                name="operatingCosts"
                rows={2}
                value={economic.operatingCosts}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="evgd">Economic Value Generated and Distributed (EVG&amp;D)</label>
              <textarea
                id="evgd"
                name="evgd"
                rows={3}
                value={economic.evgd}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
          </div>

          <h3>2.2 Market Presence</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="localHiringRatios">Local Hiring Ratios</label>
              <textarea
                id="localHiringRatios"
                name="localHiringRatios"
                rows={2}
                value={economic.localHiringRatios}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="entryLevelVsMinimumWage">
                Entry-level Wages Compared to Minimum Wages
              </label>
              <textarea
                id="entryLevelVsMinimumWage"
                name="entryLevelVsMinimumWage"
                rows={2}
                value={economic.entryLevelVsMinimumWage}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="localSupplierSpending">Local Supplier Spending</label>
              <textarea
                id="localSupplierSpending"
                name="localSupplierSpending"
                rows={2}
                value={economic.localSupplierSpending}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
          </div>

          <h3>2.3 Indirect Economic Impacts</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="infrastructureInvestments">Infrastructure Investments</label>
              <textarea
                id="infrastructureInvestments"
                name="infrastructureInvestments"
                rows={2}
                value={economic.infrastructureInvestments}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="communityDevelopmentSpending">Community Development Spending</label>
              <textarea
                id="communityDevelopmentSpending"
                name="communityDevelopmentSpending"
                rows={2}
                value={economic.communityDevelopmentSpending}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="economicContributions">Economic Contributions to Local Regions</label>
              <textarea
                id="economicContributions"
                name="economicContributions"
                rows={3}
                value={economic.economicContributions}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
          </div>

          <h3>2.4 Anti-Corruption</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="corruptionIncidents">Number of Corruption Incidents</label>
              <textarea
                id="corruptionIncidents"
                name="corruptionIncidents"
                rows={2}
                value={economic.corruptionIncidents}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="antiCorruptionTraining">Anti-corruption Training Programs</label>
              <textarea
                id="antiCorruptionTraining"
                name="antiCorruptionTraining"
                rows={2}
                value={economic.antiCorruptionTraining}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="internalAuditReports">Internal Audit Reports (Summary)</label>
              <textarea
                id="internalAuditReports"
                name="internalAuditReports"
                rows={3}
                value={economic.internalAuditReports}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
          </div>

          <h3>2.5 Tax Transparency</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="taxesPaidByCountry">Taxes Paid in Different Countries</label>
              <textarea
                id="taxesPaidByCountry"
                name="taxesPaidByCountry"
                rows={3}
                value={economic.taxesPaidByCountry}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="governmentGrantsSubsidies">
                Government Grants or Subsidies Received
              </label>
              <textarea
                id="governmentGrantsSubsidies"
                name="governmentGrantsSubsidies"
                rows={3}
                value={economic.governmentGrantsSubsidies}
                onChange={handleSectionChange(setEconomic)}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>3. Environmental Segment Inputs (GRI 300 Series)</h2>

          <h3>3.1 Energy Usage</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="electricityConsumption">Electricity Consumption</label>
              <textarea
                id="electricityConsumption"
                name="electricityConsumption"
                rows={2}
                value={environmental.electricityConsumption}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="renewableVsNonRenewable">
                Renewable vs Non-renewable Energy Use
              </label>
              <textarea
                id="renewableVsNonRenewable"
                name="renewableVsNonRenewable"
                rows={2}
                value={environmental.renewableVsNonRenewable}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="fuelConsumption">Fuel Consumption</label>
              <textarea
                id="fuelConsumption"
                name="fuelConsumption"
                rows={2}
                value={environmental.fuelConsumption}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
          </div>

          <h3>3.2 Emissions</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="ghgEmissionsOverview">
                Greenhouse Gas Emissions (CO₂, Methane, etc.) – Overview
              </label>
              <textarea
                id="ghgEmissionsOverview"
                name="ghgEmissionsOverview"
                rows={3}
                value={environmental.ghgEmissionsOverview}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="scope1Details">Scope 1 Emissions Details</label>
              <textarea
                id="scope1Details"
                name="scope1Details"
                rows={2}
                value={environmental.scope1Details}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="scope2Details">Scope 2 Emissions Details</label>
              <textarea
                id="scope2Details"
                name="scope2Details"
                rows={2}
                value={environmental.scope2Details}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="scope3Details">Scope 3 Emissions Details</label>
              <textarea
                id="scope3Details"
                name="scope3Details"
                rows={2}
                value={environmental.scope3Details}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
          </div>

          <h3>3.3 Water Management</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="waterWithdrawal">Water Withdrawal and Consumption</label>
              <textarea
                id="waterWithdrawal"
                name="waterWithdrawal"
                rows={2}
                value={environmental.waterWithdrawal}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="waterConsumption">Additional Water Consumption Details</label>
              <textarea
                id="waterConsumption"
                name="waterConsumption"
                rows={2}
                value={environmental.waterConsumption}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="waterRecycling">Water Recycling</label>
              <textarea
                id="waterRecycling"
                name="waterRecycling"
                rows={2}
                value={environmental.waterRecycling}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="wastewaterDischarge">Wastewater Discharge</label>
              <textarea
                id="wastewaterDischarge"
                name="wastewaterDischarge"
                rows={2}
                value={environmental.wastewaterDischarge}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
          </div>

          <h3>3.4 Waste Management</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="totalWasteGenerated">Total Waste Generated</label>
              <textarea
                id="totalWasteGenerated"
                name="totalWasteGenerated"
                rows={2}
                value={environmental.totalWasteGenerated}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="hazardousVsNonHazardous">Hazardous vs Non-hazardous Waste</label>
              <textarea
                id="hazardousVsNonHazardous"
                name="hazardousVsNonHazardous"
                rows={2}
                value={environmental.hazardousVsNonHazardous}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="wasteRecycledDisposed">Waste Recycled or Disposed</label>
              <textarea
                id="wasteRecycledDisposed"
                name="wasteRecycledDisposed"
                rows={2}
                value={environmental.wasteRecycledDisposed}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
          </div>

          <h3>3.5 Environmental Compliance</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="environmentalFinesPenalties">
                Environmental Fines or Penalties
              </label>
              <textarea
                id="environmentalFinesPenalties"
                name="environmentalFinesPenalties"
                rows={2}
                value={environmental.environmentalFinesPenalties}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="environmentalRegulatoryCompliance">
                Compliance with Environmental Regulations
              </label>
              <textarea
                id="environmentalRegulatoryCompliance"
                name="environmentalRegulatoryCompliance"
                rows={2}
                value={environmental.environmentalRegulatoryCompliance}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
          </div>

          <h3>3.6 Biodiversity Impact</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="landUseChanges">Land Use Changes</label>
              <textarea
                id="landUseChanges"
                name="landUseChanges"
                rows={2}
                value={environmental.landUseChanges}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="biodiversityProtectedAreasImpact">
                Impact on Protected Areas or Ecosystems
              </label>
              <textarea
                id="biodiversityProtectedAreasImpact"
                name="biodiversityProtectedAreasImpact"
                rows={3}
                value={environmental.biodiversityProtectedAreasImpact}
                onChange={handleSectionChange(setEnvironmental)}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>4. Social Segment Inputs (GRI 400 Series)</h2>

          <h3>4.1 Employment Data</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="totalWorkforce">Total Workforce</label>
              <textarea
                id="totalWorkforce"
                name="totalWorkforce"
                rows={2}
                value={social.totalWorkforce}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="employeeTurnoverRates">Employee Turnover Rates</label>
              <textarea
                id="employeeTurnoverRates"
                name="employeeTurnoverRates"
                rows={2}
                value={social.employeeTurnoverRates}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="genderDiversityRatios">Gender Diversity Ratios</label>
              <textarea
                id="genderDiversityRatios"
                name="genderDiversityRatios"
                rows={2}
                value={social.genderDiversityRatios}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
          </div>

          <h3>4.2 Workplace Health &amp; Safety</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="workplaceInjuryRates">Workplace Injury Rates</label>
              <textarea
                id="workplaceInjuryRates"
                name="workplaceInjuryRates"
                rows={2}
                value={social.workplaceInjuryRates}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="fatalities">Fatalities</label>
              <textarea
                id="fatalities"
                name="fatalities"
                rows={2}
                value={social.fatalities}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="safetyTrainingPrograms">Safety Training Programs</label>
              <textarea
                id="safetyTrainingPrograms"
                name="safetyTrainingPrograms"
                rows={2}
                value={social.safetyTrainingPrograms}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
          </div>

          <h3>4.3 Training and Development</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="trainingHoursPerEmployeeSocial">
                Training Hours per Employee
              </label>
              <textarea
                id="trainingHoursPerEmployeeSocial"
                name="trainingHoursPerEmployee"
                rows={2}
                value={social.trainingHoursPerEmployee}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="leadershipDevelopmentPrograms">
                Leadership Development Programs
              </label>
              <textarea
                id="leadershipDevelopmentPrograms"
                name="leadershipDevelopmentPrograms"
                rows={2}
                value={social.leadershipDevelopmentPrograms}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="skillEnhancementInitiatives">Skill Enhancement Initiatives</label>
              <textarea
                id="skillEnhancementInitiatives"
                name="skillEnhancementInitiatives"
                rows={2}
                value={social.skillEnhancementInitiatives}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
          </div>

          <h3>4.4 Human Rights</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="childLaborChecks">Child Labor Checks</label>
              <textarea
                id="childLaborChecks"
                name="childLaborChecks"
                rows={2}
                value={social.childLaborChecks}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="forcedLaborPreventionPolicies">
                Forced Labor Prevention Policies
              </label>
              <textarea
                id="forcedLaborPreventionPolicies"
                name="forcedLaborPreventionPolicies"
                rows={2}
                value={social.forcedLaborPreventionPolicies}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="supplierComplianceAudits">Supplier Compliance Audits</label>
              <textarea
                id="supplierComplianceAudits"
                name="supplierComplianceAudits"
                rows={2}
                value={social.supplierComplianceAudits}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
          </div>

          <h3>4.5 Community Engagement</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="csrInvestments">CSR Investments</label>
              <textarea
                id="csrInvestments"
                name="csrInvestments"
                rows={2}
                value={social.csrInvestments}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="localCommunityPrograms">Local Community Programs</label>
              <textarea
                id="localCommunityPrograms"
                name="localCommunityPrograms"
                rows={2}
                value={social.localCommunityPrograms}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="socialImpactInitiatives">Social Impact Initiatives</label>
              <textarea
                id="socialImpactInitiatives"
                name="socialImpactInitiatives"
                rows={2}
                value={social.socialImpactInitiatives}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
          </div>

          <h3>4.6 Customer Responsibility</h3>
          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="customerPrivacyIncidents">Customer Privacy Incidents</label>
              <textarea
                id="customerPrivacyIncidents"
                name="customerPrivacyIncidents"
                rows={2}
                value={social.customerPrivacyIncidents}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="productSafetyReports">Product Safety Reports</label>
              <textarea
                id="productSafetyReports"
                name="productSafetyReports"
                rows={2}
                value={social.productSafetyReports}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="customerSatisfactionData">Customer Satisfaction Data</label>
              <textarea
                id="customerSatisfactionData"
                name="customerSatisfactionData"
                rows={2}
                value={social.customerSatisfactionData}
                onChange={handleSectionChange(setSocial)}
              />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="btn"
            onClick={() => history.push('/esg-report')}
          >
            Back to ESG Form
          </button>
          <button type="submit" className="btn btn-primary btn-lg">
            Submit details
          </button>
        </div>
      </form>
    </div>
  );
};

export default GRIDetailsForm;

