import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { generateBRSRReportPDF } from '../utils/reportGenerator';
import './FinalReportPage.css';

const FinalReportPage = () => {
  const location = useLocation();
  const history = useHistory();
  const state = location.state || {};
  const { source, brsrData, esgData, griData } = state;

  const activeData = brsrData || esgData || griData;

  if (!source || !activeData) {
    return (
      <div className="final-report-page">
        <div className="final-report-card">
          <h1>Final Report</h1>
          <p>No report data was found. Please complete a reporting flow first.</p>
          <div className="final-report-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => history.push('/')}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filledFields = Object.values(activeData).filter((v) => v !== undefined && v !== '').length;
  const totalFields = Object.keys(activeData).length || 1;
  const completenessRatio = filledFields / totalFields;
  const disclosurePercent = Math.round(completenessRatio * 100);

  let completenessLabel = 'Moderate disclosure completeness vs peers';
  if (completenessRatio > 0.8) {
    completenessLabel = 'High disclosure completeness vs peers';
  } else if (completenessRatio < 0.5) {
    completenessLabel = 'Low disclosure completeness vs peers';
  }

  const companyName =
    (brsrData && brsrData.companyName) ||
    (esgData && esgData.companyName) ||
    (griData && griData.baseFormData && griData.baseFormData.companyName) ||
    'N/A';

  const netWorth = brsrData ? brsrData.netWorth : 'N/A';
  const turnover =
    (brsrData && brsrData.turnover) ||
    (esgData && esgData.revenue) ||
    (griData && griData.griEconomic && griData.griEconomic.revenueAndProfits) ||
    'N/A';

  const totalEmployeesHighlight =
    (brsrData && brsrData.totalEmployees) ||
    (esgData && (esgData.totalEmployees || esgData.employeeCount)) ||
    (griData &&
      ((griData.griUniversal && griData.griUniversal.numberOfEmployees) ||
        (griData.griSocial && griData.griSocial.totalWorkforce))) ||
    'N/A';

  const totalWorkersHighlight = brsrData ? brsrData.totalWorkers || 'N/A' : 'N/A';

  // Simple derived metrics for hero cards
  const carbonFootprint =
    (esgData && (esgData.scope1Emissions || esgData.scope2Emissions || esgData.scope3Emissions)) ||
    (griData && griData.griEnvironmental && griData.griEnvironmental.ghgEmissionsOverview) ||
    'N/A';

  const genderDiversity =
    (esgData && esgData.genderDiversityPercent) ||
    (griData && griData.griSocial && griData.griSocial.genderDiversityRatios) ||
    (brsrData && brsrData.femaleEmployees && brsrData.totalEmployees
      ? `${Math.round((Number(brsrData.femaleEmployees) / Number(brsrData.totalEmployees || 1)) * 100)}%`
      : 'N/A');

  const csrSpend =
    (esgData && esgData.communityInvestment) ||
    (griData && griData.griSocial && griData.griSocial.csrInvestments) ||
    (brsrData && brsrData.csrApplicable) ||
    'N/A';

  const isCompliant = source === 'BRSR' ? completenessRatio >= 0.8 : completenessRatio >= 0.6;

  const handleDownloadPDF = () => {
    if (source === 'BRSR' && brsrData) {
      try {
        const pdfBlob = generateBRSRReportPDF(brsrData);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brsrData.companyName || 'BRSR'}-SEBI-BRSR-Report.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to generate BRSR PDF:', err);
        alert('Failed to generate BRSR PDF. Please try again.');
      }
    } else {
      alert('PDF download is currently available for BRSR reports. ESG/GRI PDFs can be added next.');
    }
  };

  const countCompletion = (data, keys) => {
    const safe = data && typeof data === 'object' ? data : {};
    const total = Math.max(keys.length, 1);
    const filled = keys.reduce((acc, key) => {
      const value = safe[key];
      if (value === undefined || value === null) return acc;
      if (typeof value === 'string' && value.trim() === '') return acc;
      if (Array.isArray(value) && value.length === 0) return acc;
      return acc + 1;
    }, 0);
    const remaining = Math.max(total - filled, 0);
    const percent = Math.round((filled / total) * 100);
    return { total, filled, remaining, percent };
  };

  const ESG_FRAMEWORK_FIELDS = {
    'GRI': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation', 'employeeCount', 'revenue', 'website',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions', 'energyConsumption', 'renewableEnergyPercent',
      'waterUsage', 'wasteGenerated', 'wasteRecycledPercent', 'environmentalInitiatives',
      'totalEmployees', 'genderDiversityPercent', 'trainingHoursPerEmployee', 'safetyIncidents',
      'communityInvestment', 'employeeTurnoverPercent', 'socialInitiatives',
      'boardSize', 'independentDirectorsPercent', 'sustainabilityCommittee', 'esgTargetsSet', 'ethicsPolicy',
      'governanceInitiatives',
    ],
    'ISSB / SASB': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation', 'revenue',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions',
      'energyConsumption', 'renewableEnergyPercent',
      'boardSize', 'sustainabilityCommittee', 'esgTargetsSet',
      'scope1FuelStationaryDetails', 'scope1CompanyVehicleDetails', 'scope1RefrigerantDetails',
      'scope2ElectricityDetails',
    ],
    'TCFD': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions',
      'scope1FuelStationaryDetails', 'scope2ElectricityDetails',
      'boardSize', 'independentDirectorsPercent', 'sustainabilityCommittee',
      'esgTargetsSet', 'governanceInitiatives',
    ],
    'UN Global Compact': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation', 'employeeCount',
      'totalEmployees', 'genderDiversityPercent', 'trainingHoursPerEmployee', 'safetyIncidents',
      'communityInvestment', 'employeeTurnoverPercent', 'socialInitiatives',
      'ethicsPolicy', 'governanceInitiatives',
    ],
    'CDP': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions',
      'energyConsumption', 'renewableEnergyPercent',
      'scope1FuelStationaryDetails', 'scope2ElectricityDetails',
      'waterUsage', 'wasteGenerated', 'wasteRecycledPercent',
    ],
    'CSRD / ESRS': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation', 'employeeCount', 'revenue',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions',
      'energyConsumption', 'renewableEnergyPercent', 'waterUsage', 'wasteGenerated', 'wasteRecycledPercent',
      'totalEmployees', 'genderDiversityPercent', 'trainingHoursPerEmployee', 'safetyIncidents',
      'boardSize', 'independentDirectorsPercent', 'sustainabilityCommittee', 'ethicsPolicy',
    ],
    'SFDR': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation', 'revenue',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions', 'energyConsumption', 'renewableEnergyPercent',
    ],
    'UK SDR': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions',
      'boardSize', 'sustainabilityCommittee', 'esgTargetsSet',
    ],
    'US SEC Climate Disclosure': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions',
      'scope1FuelStationaryDetails', 'scope2ElectricityDetails',
      'governanceInitiatives', 'boardSize', 'sustainabilityCommittee',
    ],
    'BRSR': [
      'companyName', 'industry', 'reportingPeriod', 'hqLocation', 'employeeCount',
      'totalEmployees', 'genderDiversityPercent', 'safetyIncidents',
      'scope1Emissions', 'scope2Emissions', 'scope3Emissions',
      'ethicsPolicy', 'governanceInitiatives',
    ],
  };

  const ALL_FRAMEWORKS_ORDER = [
    'BRSR',
    'GRI',
    'ISSB / SASB',
    'TCFD',
    'UN Global Compact',
    'CDP',
    'CSRD / ESRS',
    'SFDR',
    'UK SDR',
    'US SEC Climate Disclosure',
  ];

  const frameworksToShow = ALL_FRAMEWORKS_ORDER;

  const frameworkCards = frameworksToShow.map((fw) => {
    if (source === 'ESG' && esgData) {
      const keys = ESG_FRAMEWORK_FIELDS[fw] || Object.keys(esgData || {});
      const stats = countCompletion(esgData, keys);
      return { framework: fw, ...stats };
    }
    if (source === 'BRSR' && brsrData) {
      const keys = Object.keys(brsrData || {}).filter((k) => k !== 'esgFrameworks');
      const stats = countCompletion(brsrData, keys);
      return { framework: 'BRSR', ...stats };
    }
    if (source === 'GRI' && griData) {
      const flat = {
        ...(griData.baseFormData || {}),
        ...(griData.griUniversal || {}),
        ...(griData.griEconomic || {}),
        ...(griData.griEnvironmental || {}),
        ...(griData.griSocial || {}),
      };
      const keys = Object.keys(flat || {});
      const stats = countCompletion(flat, keys);
      return { framework: 'GRI', ...stats };
    }
    const keys = Object.keys(activeData || {});
    const stats = countCompletion(activeData, keys);
    return { framework: fw, ...stats };
  });

  return (
    <div className="final-report-page">
      <header className="final-hero">
        <div className="final-hero-main">
          <div className={`final-compliance-pill ${isCompliant ? 'final-compliance-ok' : 'final-compliance-pending'}`}>
            <span className="final-compliance-icon">{isCompliant ? '✔' : '⚠'}</span>
            <div>
              <div className="final-compliance-label">
                {source === 'BRSR' ? 'BRSR 2026 Status' : 'Disclosure Status'}
              </div>
              <div className="final-compliance-value">
                {isCompliant ? 'Compliant' : 'In progress'}
              </div>
            </div>
          </div>

          <div className="final-hero-text">
            <h1>Final Performance Report</h1>
            <p>
              At-a-glance view of your sustainability performance and disclosure quality, based on your
              {' '}
              {source}
              {' '}
              inputs.
            </p>
            <div className="final-disclosure-bar">
              <div className="final-disclosure-header">
                <span>Total disclosure rate</span>
                <span className="final-disclosure-percent">
                  {disclosurePercent}
                  %
                </span>
              </div>
              <div className="final-disclosure-track">
                <div
                  className="final-disclosure-fill"
                  style={{ width: `${Math.min(disclosurePercent, 100)}%` }}
                />
              </div>
              <p className="final-disclosure-caption">
                Approximate share of applicable fields completed across your submission.
              </p>
            </div>
          </div>
        </div>

        <div className="final-hero-metrics">
          <div className="final-metric-card">
            <div className="final-metric-label">Total carbon footprint</div>
            <div className="final-metric-value">{carbonFootprint}</div>
            <div className="final-metric-sub">Scope 1–3 or nearest available estimate</div>
          </div>
          <div className="final-metric-card">
            <div className="final-metric-label">Gender diversity</div>
            <div className="final-metric-value">{genderDiversity}</div>
            <div className="final-metric-sub">Women in workforce or qualitative ratio</div>
          </div>
          <div className="final-metric-card">
            <div className="final-metric-label">CSR & community</div>
            <div className="final-metric-value">{csrSpend}</div>
            <div className="final-metric-sub">CSR applicability / investments / community spend</div>
          </div>
        </div>
      </header>

      <section className="final-benchmark-section">
        <div className="final-radar-card">
          <h2>Performance vs peers</h2>
          <p className="final-helper-text">
            Qualitative benchmarking across Environment, Social and Governance based on your answers and disclosure depth.
          </p>
          <div className="final-radar-shell">
            <div className="final-radar-axes">
              <span>E</span>
              <span>S</span>
              <span>G</span>
            </div>
            <div className="final-radar-legend">
              <span className="final-radar-dot final-radar-you" />
              Your company
              <span className="final-radar-dot final-radar-peers" />
              Indicative peers
            </div>
          </div>
        </div>

        <div className="final-trend-card">
          <h2>Framework compliance</h2>
          <p className="final-helper-text">
            Completion status by framework based on the fields you provided.
          </p>
          <div className="final-framework-grid">
            {frameworkCards.map((card) => (
              <div className="final-framework-card" key={card.framework}>
                <div className="final-framework-card-top">
                  <div className="final-framework-name">{card.framework}</div>
                  <div className="final-framework-percent">
                    {card.percent}
                    %
                  </div>
                </div>
                <div className="final-framework-progress" aria-hidden="true">
                  <div
                    className="final-framework-progress-fill"
                    style={{ width: `${Math.min(Math.max(card.percent, 0), 100)}%` }}
                  />
                </div>
                <div className="final-framework-meta">
                  <span>
                    {card.filled}
                    /
                    {card.total}
                    {' '}
                    fields filled
                  </span>
                  <span className="final-framework-remaining">
                    {card.remaining}
                    {' '}
                    remaining
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="final-trend-card">
          <h2>Trend snapshot</h2>
          <p className="final-helper-text">
            High-level view of how your impact is evolving. Historical data can be added to show exact year-on-year trends.
          </p>
          <div className="final-trend-placeholder">
            <div className="final-trend-line" />
            <div className="final-trend-axis">
              <span>2024</span>
              <span>2025</span>
              <span>2026</span>
            </div>
          </div>
        </div>
      </section>

      <section className="final-improvement-section">
        <div className="final-improvement-card">
          <h2>Improvement roadmap</h2>
          <ul className="final-improvements-list">
            <li>
              Strengthen
              {' '}
              <strong>policy disclosures</strong>
              {' '}
              in Module B where NGRBC policy details or ESG targets are brief or missing.
            </li>
            <li>
              Enhance
              {' '}
              <strong>quantitative indicators</strong>
              {' '}
              in Module C (waste, safety, stakeholder engagement) for clearer benchmarking.
            </li>
            <li>
              Deepen
              {' '}
              <strong>risk–financial linkage</strong>
              {' '}
              in Module D by connecting each ESG risk to revenue, cost and asset impacts.
            </li>
          </ul>
        </div>

        <div className="final-improvement-card">
          <h3>Gap finder (leadership indicators)</h3>
          <p className="final-helper-text">
            Focus areas where responses are blank or high-level. Filling these out helps you move from
            compliance to leadership.
          </p>
          <ul className="final-gap-list">
            {source === 'BRSR' && !brsrData.envRD && (
              <li>Environmental R&amp;D initiatives (Module C) could be described in more detail.</li>
            )}
            {source === 'BRSR' && !brsrData.stakeholderEngagement && (
              <li>Engagement with marginalized/vulnerable stakeholders (Module C) is missing.</li>
            )}
            {source === 'BRSR' && !brsrData.riskMitigationPlans && (
              <li>Mitigation plans &amp; timelines for key ESG risks (Module D) are not fully captured.</li>
            )}
            {disclosurePercent === 100 && (
              <li>All core indicators are filled. Focus on depth, narrative quality, and supporting evidence.</li>
            )}
          </ul>
          <div className="final-advice">
            <strong>Example advisory insight:</strong>
            {' '}
            Your water recycling or circularity-related disclosures appear limited. Many peers target
            higher reuse rates under Principle 6 – consider policies like rainwater harvesting or grey
            water reuse to strengthen performance.
          </div>
        </div>
      </section>

      <section className="final-grid-section">
        <h2>Data grid – module breakdown</h2>
        <p className="final-helper-text">
          Explore the key values that feed into your final report. Search by keyword and expand modules
          to review entries before exporting the official PDF.
        </p>
        <input
          type="text"
          className="final-grid-search"
          placeholder="Search fields (e.g. waste, governance, Principle 6)..."
          onChange={() => {}}
        />
        <div className="final-grid-table">
          {source === 'BRSR' && brsrData && (
          <>
            <div className="final-grid-row final-grid-header">
              <span>Module</span>
              <span>Field</span>
              <span>Value</span>
              <span>Status</span>
            </div>
            <div className="final-grid-row">
              <span>A – General</span>
              <span>Company name</span>
              <span>{brsrData.companyName || 'N/A'}</span>
              <span className="final-grid-status final-grid-unverified">● Not verified</span>
            </div>
            <div className="final-grid-row">
              <span>A – General</span>
              <span>Net worth</span>
              <span>{brsrData.netWorth || 'N/A'}</span>
              <span className="final-grid-status final-grid-unverified">● Not verified</span>
            </div>
            <div className="final-grid-row">
              <span>C – Performance</span>
              <span>Plastic waste generated &amp; treated</span>
              <span>{brsrData.plasticWaste || 'N/A'}</span>
              <span className="final-grid-status final-grid-unverified">● Not verified</span>
            </div>
            <div className="final-grid-row">
              <span>D – Risk</span>
              <span>Key ESG risks</span>
              <span>{brsrData.keyRisks || 'N/A'}</span>
              <span className="final-grid-status final-grid-unverified">● Not verified</span>
            </div>
          </>
          )}
        </div>
      </section>

      <section className="final-report-details">
        {source === 'BRSR' && (
        <>
          <h2>Detailed BRSR data (SEBI-aligned modules)</h2>

          <div className="final-detail-card">
            <h3>Module A · General Disclosures</h3>
          <dl>
            <div>
              <dt>Company name</dt>
              <dd>{brsrData.companyName || 'N/A'}</dd>
            </div>
            <div>
              <dt>CIN</dt>
              <dd>{brsrData.cin || 'N/A'}</dd>
            </div>
            <div>
              <dt>Registered address</dt>
              <dd>{brsrData.registeredAddress || 'N/A'}</dd>
            </div>
            <div>
              <dt>Stock exchanges</dt>
              <dd>{brsrData.stockExchanges || 'N/A'}</dd>
            </div>
            <div>
              <dt>Plant & office locations</dt>
              <dd>{brsrData.plantLocations || 'N/A'}</dd>
            </div>
            <div>
              <dt>Activities covering ~90% of turnover</dt>
              <dd>{brsrData.keyActivities90Turnover || 'N/A'}</dd>
            </div>
          </dl>
          </div>

          <div className="final-detail-card">
            <h3>Module B · Management & Process</h3>
          <dl>
            <div>
              <dt>NGRBC policy status (Principles 1–9)</dt>
              <dd>{brsrData.ngrbcPoliciesStatus || 'N/A'}</dd>
            </div>
            <div>
              <dt>Policy owners / highest authority</dt>
              <dd>{brsrData.policyOwners || 'N/A'}</dd>
            </div>
            <div>
              <dt>Key ESG goals & annual targets</dt>
              <dd>{brsrData.esgGoalsTargets || 'N/A'}</dd>
            </div>
          </dl>
          </div>

          <div className="final-detail-card">
            <h3>Module C · Principle-wise Performance</h3>
          <dl>
            <div>
              <dt>Corruption & bribery cases</dt>
              <dd>{brsrData.corruptionCases || 'N/A'}</dd>
            </div>
            <div>
              <dt>Fines / penalties</dt>
              <dd>{brsrData.corruptionFines || 'N/A'}</dd>
            </div>
            <div>
              <dt>Sustainable sourcing</dt>
              <dd>{brsrData.sustainableSourcing || 'N/A'}</dd>
            </div>
            <div>
              <dt>Environmental R&D</dt>
              <dd>{brsrData.envRD || 'N/A'}</dd>
            </div>
            <div>
              <dt>Plastic waste</dt>
              <dd>{brsrData.plasticWaste || 'N/A'}</dd>
            </div>
            <div>
              <dt>E-waste</dt>
              <dd>{brsrData.eWaste || 'N/A'}</dd>
            </div>
            <div>
              <dt>Hazardous waste</dt>
              <dd>{brsrData.hazardousWaste || 'N/A'}</dd>
            </div>
            <div>
              <dt>Minimum wage compliance</dt>
              <dd>{brsrData.minWageCompliance || 'N/A'}</dd>
            </div>
            <div>
              <dt>Average training hours</dt>
              <dd>{brsrData.avgTrainingHours || 'N/A'}</dd>
            </div>
            <div>
              <dt>Safety incidents</dt>
              <dd>{brsrData.safetyIncidents || 'N/A'}</dd>
            </div>
            <div>
              <dt>Worker grievances</dt>
              <dd>{brsrData.workerGrievances || 'N/A'}</dd>
            </div>
            <div>
              <dt>Average grievance resolution time</dt>
              <dd>{brsrData.grievanceResolutionTime || 'N/A'}</dd>
            </div>
            <div>
              <dt>Engagement with marginalized / vulnerable stakeholders</dt>
              <dd>{brsrData.stakeholderEngagement || 'N/A'}</dd>
            </div>
          </dl>
          </div>

          <div className="final-detail-card">
            <h3>Module D · Materiality & Risk</h3>
          <dl>
            <div>
              <dt>Key environmental & social risks</dt>
              <dd>{brsrData.keyRisks || 'N/A'}</dd>
            </div>
            <div>
              <dt>Link to financial impact</dt>
              <dd>{brsrData.riskFinancialImpact || 'N/A'}</dd>
            </div>
            <div>
              <dt>Mitigation plans & timelines</dt>
              <dd>{brsrData.riskMitigationPlans || 'N/A'}</dd>
            </div>
          </dl>
          </div>
        </>
        )}

        {source === 'GRI' && griData && (
        <>
          <h2>GRI company details (summary)</h2>
          <div className="final-detail-card">
            <h3>Universal standards</h3>
            <dl>
              <div>
                <dt>Legal structure</dt>
                <dd>{(griData.griUniversal && griData.griUniversal.companyLegalStructure) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Headquarters location</dt>
                <dd>{(griData.griUniversal && griData.griUniversal.headquartersLocation) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Operational regions</dt>
                <dd>{(griData.griUniversal && griData.griUniversal.operationalRegions) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Nature of business</dt>
                <dd>{(griData.griUniversal && griData.griUniversal.natureOfBusiness) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Supply chain</dt>
                <dd>{(griData.griUniversal && griData.griUniversal.supplyChainDetails) || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <div className="final-detail-card">
            <h3>Economic, environmental & social (high level)</h3>
            <dl>
              <div>
                <dt>Revenue & profits</dt>
                <dd>{(griData.griEconomic && griData.griEconomic.revenueAndProfits) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Key environmental overview</dt>
                <dd>{(griData.griEnvironmental && griData.griEnvironmental.ghgEmissionsOverview) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Total waste generated</dt>
                <dd>{(griData.griEnvironmental && griData.griEnvironmental.totalWasteGenerated) || 'N/A'}</dd>
              </div>
              <div>
                <dt>Workforce & turnover</dt>
                <dd>
                  {(griData.griSocial && griData.griSocial.totalWorkforce) || 'N/A'}
                  {' | Turnover: '}
                  {(griData.griSocial && griData.griSocial.employeeTurnoverRates) || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </>
        )}

        {source === 'ESG' && esgData && (
        <>
          <h2>ESG metrics summary</h2>
          <div className="final-detail-card">
            <h3>Environmental</h3>
            <dl>
              <div>
                <dt>Scope 1 emissions</dt>
                <dd>{esgData.scope1Emissions || 'N/A'}</dd>
              </div>
              <div>
                <dt>Scope 2 emissions</dt>
                <dd>{esgData.scope2Emissions || 'N/A'}</dd>
              </div>
              <div>
                <dt>Scope 3 emissions</dt>
                <dd>{esgData.scope3Emissions || 'N/A'}</dd>
              </div>
              <div>
                <dt>Energy consumption</dt>
                <dd>{esgData.energyConsumption || 'N/A'}</dd>
              </div>
              <div>
                <dt>Renewable energy %</dt>
                <dd>{esgData.renewableEnergyPercent || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <div className="final-detail-card">
            <h3>Social & governance</h3>
            <dl>
              <div>
                <dt>Total employees</dt>
                <dd>{esgData.totalEmployees || 'N/A'}</dd>
              </div>
              <div>
                <dt>Gender diversity %</dt>
                <dd>{esgData.genderDiversityPercent || 'N/A'}</dd>
              </div>
              <div>
                <dt>Board size</dt>
                <dd>{esgData.boardSize || 'N/A'}</dd>
              </div>
              <div>
                <dt>Independent directors %</dt>
                <dd>{esgData.independentDirectorsPercent || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </>
        )}
      </section>

      <section className="final-report-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => history.push(source === 'BRSR' ? '/brsr' : '/')}
        >
          {source === 'BRSR' ? 'Back to BRSR form' : 'Back to home'}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg final-big-green-button"
          onClick={handleDownloadPDF}
          style={{position: 'fixed',
            bottom: '100px',
            right: '50px',
            width: '157px',
            fontSize: '12px',
            height: '70px'}}
        >
          Generate Official SEBI-Compliant BRSR
        </button>
      </section>
    </div>
  );
};

export default FinalReportPage;

