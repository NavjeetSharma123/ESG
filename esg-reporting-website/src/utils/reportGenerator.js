import { jsPDF } from 'jspdf';

const n = (val) => {
  if (Array.isArray(val) && val.length) return val.join(', ');
  return val !== undefined && val !== '' ? String(val) : 'N/A';
};

export const generateESGReportPDF = (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;
  const lineHeight = 6;

  const addText = (text, fontSize = 10, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    lines.forEach((line) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });
  };

  const addSection = (title, content) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(13, 59, 44);
    doc.rect(0, y - 5, pageWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y + 2);
    doc.setTextColor(0, 0, 0);
    y += 12;
    addText(content, 10, false);
    y += 4;
  };

  // Title
  doc.setFillColor(22, 90, 62);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ESG Sustainability Report', margin, 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${n(data.companyName)} | Reporting Period: ${n(data.reportingPeriod)}`, margin, 28);
  doc.setTextColor(0, 0, 0);
  y = 45;

  const esgFrameworks =
    Array.isArray(data.esgFrameworks) && data.esgFrameworks.length
      ? data.esgFrameworks.join(', ')
      : 'N/A';

  addSection(
    '1. Company Information',
    `Company: ${n(data.companyName)}\n` +
      `Industry: ${n(data.industry)}\n` +
      `Reporting Period: ${n(data.reportingPeriod)}\n` +
      `Headquarters: ${n(data.hqLocation)}\n` +
      `ESG Frameworks: ${esgFrameworks}\n` +
      `Employees: ${n(data.employeeCount)}\n` +
      `Revenue: ${n(data.revenue)}\n` +
      `Website: ${n(data.website)}`
  );

  addSection(
    '2. Environmental Metrics',
    `Scope 1 Emissions (tCO₂e): ${n(data.scope1Emissions)}\n` +
      `  - Fuel (stationary sources): ${n(data.scope1FuelStationaryDetails)}\n` +
      `  - Company vehicle fuel: ${n(data.scope1CompanyVehicleDetails)}\n` +
      `  - Refrigerants / AC leakage: ${n(data.scope1RefrigerantDetails)}\n` +
      `  - Industrial process emissions: ${n(data.scope1ProcessEmissionsDetails)}\n` +
      `Scope 2 Emissions (tCO₂e): ${n(data.scope2Emissions)}\n` +
      `  - Electricity consumption: ${n(data.scope2ElectricityDetails)}\n` +
      `  - Purchased heating / cooling / steam: ${n(data.scope2ThermalEnergyDetails)}\n` +
      `Scope 3 Emissions (tCO₂e): ${n(data.scope3Emissions)}\n` +
      `Energy Consumption (MWh): ${n(data.energyConsumption)}\n` +
      `Renewable Energy %: ${n(data.renewableEnergyPercent)}\n` +
      `Water Usage (m³): ${n(data.waterUsage)}\n` +
      `Waste Generated (tons): ${n(data.wasteGenerated)}\n` +
      `Waste Recycled %: ${n(data.wasteRecycledPercent)}\n` +
      `Initiatives: ${n(data.environmentalInitiatives)}`
  );

  addSection(
    '3. Social Metrics',
    `Total Employees: ${n(data.totalEmployees)}\n` +
      `Gender Diversity % (women): ${n(data.genderDiversityPercent)}\n` +
      `Training Hours/Employee: ${n(data.trainingHoursPerEmployee)}\n` +
      `Recordable Safety Incidents: ${n(data.safetyIncidents)}\n` +
      `Community Investment ($): ${n(data.communityInvestment)}\n` +
      `Employee Turnover %: ${n(data.employeeTurnoverPercent)}\n` +
      `Initiatives: ${n(data.socialInitiatives)}`
  );

  addSection(
    '4. Governance Metrics',
    `Board Size: ${n(data.boardSize)}\n` +
      `Independent Directors %: ${n(data.independentDirectorsPercent)}\n` +
      `Sustainability Committee: ${n(data.sustainabilityCommittee)}\n` +
      `ESG Targets Set: ${n(data.esgTargetsSet)}\n` +
      `Ethics/Anti-corruption Policy: ${n(data.ethicsPolicy)}\n` +
      `Initiatives: ${n(data.governanceInitiatives)}`
  );

  // Footer
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Report generated on ${new Date().toLocaleDateString()} | ESG Sustainability Platform`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  return doc.output('blob');
};

export const generateBRSRReportPDF = (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;
  const lineHeight = 6;

  const addText = (text, fontSize = 10, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    lines.forEach((line) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });
  };

  const addSection = (title, content) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(32, 64, 122);
    doc.rect(0, y - 5, pageWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y + 2);
    doc.setTextColor(0, 0, 0);
    y += 12;
    addText(content, 10, false);
    y += 4;
  };

  // Title band – SEBI BRSR style header
  doc.setFillColor(16, 45, 84);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Responsibility & Sustainability Report (BRSR)', margin, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${n(data.companyName)} | Financial Reporting Year: ${n(data.reportingYear || '')}`,
    margin,
    25
  );
  doc.setTextColor(0, 0, 0);
  y = 42;

  addSection(
    'Section A – General Disclosures',
    `A1. Corporate identity details\n` +
      `  • Company name: ${n(data.companyName)}\n` +
      `  • Corporate Identification Number (CIN): ${n(data.cin)}\n` +
      `  • Registered office address: ${n(data.registeredAddress)}\n` +
      `  • Stock exchange listing details: ${n(data.stockExchanges)}\n\n` +
      `A2. Products/services and operations\n` +
      `  • Locations of plants/offices: ${n(data.plantLocations)}\n` +
      `  • Business activities covering ~90% of turnover: ${n(data.keyActivities90Turnover)}\n\n` +
      `A3. Employees and workers\n` +
      `  • Total employees: ${n(data.totalEmployees)} (women: ${n(
        data.femaleEmployees
      )}, persons with disabilities: ${n(data.differentlyAbledEmployees)})\n` +
      `  • Total workers (incl. contractual): ${n(data.totalWorkers)}\n\n` +
      `A4. CSR details\n` +
      `  • CSR applicability & brief: ${n(data.csrApplicable)}`
  );

  addSection(
    'Section B – Management & Process Disclosures',
    `B1. Policies and governance\n` +
      `  • NGRBC Principles 1–9 policy status: ${n(data.ngrbcPoliciesStatus)}\n` +
      `  • Highest authority / owner for each policy: ${n(data.policyOwners)}\n\n` +
      `B2. Strategy and targets\n` +
      `  • Key ESG goals and annual targets: ${n(data.esgGoalsTargets)}`
  );

  addSection(
    'Section C – Principle-wise Performance (Essential & Leadership Indicators)',
    `C1. Ethics, integrity and transparency (P1)\n` +
      `  • Corruption / bribery cases & complaints: ${n(data.corruptionCases)}\n` +
      `  • Fines / penalties paid: ${n(data.corruptionFines)}\n\n` +
      `C2. Product lifecycle sustainability & resource efficiency (P2, P6)\n` +
      `  • Sustainable sourcing initiatives: ${n(data.sustainableSourcing)}\n` +
      `  • R&D for environmental technologies: ${n(data.envRD)}\n` +
      `  • Plastic waste generated & treated: ${n(data.plasticWaste)}\n` +
      `  • E-waste generated & treated: ${n(data.eWaste)}\n` +
      `  • Hazardous waste generated & treated: ${n(data.hazardousWaste)}\n\n` +
      `C3. Employee well-being, training and safety (P3, P5)\n` +
      `  • Minimum wage compliance: ${n(data.minWageCompliance)}\n` +
      `  • Average training hours per employee: ${n(data.avgTrainingHours)}\n` +
      `  • Safety incidents: ${n(data.safetyIncidents)}\n` +
      `  • Worker grievances raised: ${n(data.workerGrievances)}\n` +
      `  • Average grievance resolution time: ${n(data.grievanceResolutionTime)}\n\n` +
      `C4. Stakeholder engagement (P4, P8)\n` +
      `  • Engagement with marginalized / vulnerable stakeholders: ${n(
        data.stakeholderEngagement
      )}`
  );

  addSection(
    'Section D – Materiality & ESG Risks',
    `D1. Material ESG risks\n` +
      `  • Key environmental & social risks: ${n(data.keyRisks)}\n\n` +
      `D2. Financial implications\n` +
      `  • Link to financial impact (revenue, costs, assets, reputation): ${n(
        data.riskFinancialImpact
      )}\n\n` +
      `D3. Risk management and mitigation\n` +
      `  • Mitigation plans & timelines: ${n(data.riskMitigationPlans)}`
  );

  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y += 12;

  // Digital signature block
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Authorised signatory (Director / Company Secretary)', margin, y);
  y += 18;
  doc.line(margin, y, pageWidth / 2, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `BRSR report generated on ${new Date().toLocaleDateString()} | ESG Sustainability Platform`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  return doc.output('blob');
};

export const generateESGReport = (data) => {
  const n = (val) => {
    if (Array.isArray(val) && val.length) return val.join(', ');
    return val !== undefined && val !== '' ? String(val) : 'N/A';
  };
  const frameworks =
    Array.isArray(data.esgFrameworks) && data.esgFrameworks.length
      ? data.esgFrameworks.join(', ')
      : 'N/A';
  return `
ESG Report for ${n(data.companyName)}
Reporting Period: ${n(data.reportingPeriod)}

1. COMPANY INFORMATION
   Industry: ${n(data.industry)}
   HQ: ${n(data.hqLocation)}
   ESG Frameworks: ${frameworks}
   Employees: ${n(data.employeeCount)}
   Revenue: ${n(data.revenue)}

2. ENVIRONMENTAL
   Scope 1 (tCO2e): ${n(data.scope1Emissions)}
     - Fuel (stationary): ${n(data.scope1FuelStationaryDetails)}
     - Company vehicles: ${n(data.scope1CompanyVehicleDetails)}
     - Refrigerants / AC: ${n(data.scope1RefrigerantDetails)}
     - Process emissions: ${n(data.scope1ProcessEmissionsDetails)}
   Scope 2 (tCO2e): ${n(data.scope2Emissions)}
     - Electricity: ${n(data.scope2ElectricityDetails)}
     - Purchased heating / cooling / steam: ${n(data.scope2ThermalEnergyDetails)}
   Scope 3 (tCO2e): ${n(data.scope3Emissions)}
   Renewable %: ${n(data.renewableEnergyPercent)}

3. SOCIAL
   Diversity %: ${n(data.genderDiversityPercent)}
   Training hrs/employee: ${n(data.trainingHoursPerEmployee)}

4. GOVERNANCE
   Board: ${n(data.boardSize)}
   Sustainability Committee: ${n(data.sustainabilityCommittee)}
`;
};
