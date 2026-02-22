import { jsPDF } from 'jspdf';

const n = (val) => (val !== undefined && val !== '' ? String(val) : 'N/A');

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

  addSection(
    '1. Company Information',
    `Company: ${n(data.companyName)}\n` +
      `Industry: ${n(data.industry)}\n` +
      `Reporting Period: ${n(data.reportingPeriod)}\n` +
      `Headquarters: ${n(data.hqLocation)}\n` +
      `Employees: ${n(data.employeeCount)}\n` +
      `Revenue: ${n(data.revenue)}\n` +
      `Website: ${n(data.website)}`
  );

  addSection(
    '2. Environmental Metrics',
    `Scope 1 Emissions (tCO₂e): ${n(data.scope1Emissions)}\n` +
      `Scope 2 Emissions (tCO₂e): ${n(data.scope2Emissions)}\n` +
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

export const generateESGReport = (data) => {
  const n = (val) => (val !== undefined && val !== '' ? String(val) : 'N/A');
  return `
ESG Report for ${n(data.companyName)}
Reporting Period: ${n(data.reportingPeriod)}

1. COMPANY INFORMATION
   Industry: ${n(data.industry)}
   HQ: ${n(data.hqLocation)}
   Employees: ${n(data.employeeCount)}
   Revenue: ${n(data.revenue)}

2. ENVIRONMENTAL
   Scope 1 (tCO2e): ${n(data.scope1Emissions)}
   Scope 2 (tCO2e): ${n(data.scope2Emissions)}
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
