import { jsPDF } from 'jspdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
  // Kept for backward compatibility (older flow). Use generateBRSRReportPDFFromTemplate for exact Annexure look.
  const doc = new jsPDF();
  doc.text('BRSR template-based PDF not generated.', 20, 20);
  return doc.output('blob');
};

const brsrTemplateHTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BRSR Report — {{companyName}}</title>
    <style>
      :root{
        --ink:#0b1f33;
        --muted:#556676;
        --brand:#10345e;
        --line:#d7e0ea;
        --panel:#f6f9fc;
      }
      *{box-sizing:border-box}
      body{
        margin:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        color:var(--ink);
        background:#fff;
      }
      .page{
        max-width: 980px;
        margin: 0 auto;
        padding: 40px 28px 56px;
      }
      .cover{
        border:1px solid var(--line);
        border-radius:16px;
        padding:24px;
        background: linear-gradient(180deg, rgba(16,52,94,0.06), transparent 55%);
      }
      .title{
        margin:0;
        font-size: 26px;
        letter-spacing: .2px;
        color: var(--brand);
      }
      .subtitle{
        margin:10px 0 0;
        color: var(--muted);
        line-height:1.4;
      }
      .meta{
        margin-top:14px;
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap:10px 16px;
        padding-top:14px;
        border-top:1px solid var(--line);
      }
      .meta .k{color:var(--muted); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.6px}
      .meta .v{margin-top:4px; font-weight:700}
      @media (max-width:700px){ .meta{grid-template-columns:1fr} }

      h2{
        margin:28px 0 10px;
        font-size: 16px;
        color: var(--brand);
        padding-bottom:8px;
        border-bottom: 2px solid rgba(16,52,94,0.18);
      }
      .section-note{
        margin:0 0 14px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.45;
      }
      table{
        width:100%;
        border-collapse: collapse;
        border:1px solid var(--line);
        border-radius: 12px;
        overflow:hidden;
        background:#fff;
      }
      th, td{
        border-bottom:1px solid var(--line);
        padding: 10px 12px;
        vertical-align: top;
        font-size: 13px;
        line-height: 1.35;
      }
      th{
        background: var(--panel);
        text-align:left;
        color: #24435f;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: .5px;
      }
      tr:last-child td{ border-bottom:0; }
      .field{
        color: var(--muted);
        width: 36%;
        font-weight: 700;
      }
      .value{
        width: 64%;
      }
      .footer{
        margin-top: 22px;
        color: var(--muted);
        font-size: 12px;
        border-top: 1px solid var(--line);
        padding-top: 12px;
        display:flex;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      @media print{
        .page{max-width:none; padding: 18mm 16mm;}
        a{color:inherit; text-decoration:none}
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="cover">
        <h1 class="title">Business Responsibility and Sustainability Report (BRSR)</h1>
        <p class="subtitle">
          Annexure I — Business responsibility and sustainability reporting by listed entities.
          Generated from user-provided disclosures. Missing values are shown as <strong>Not Disclosed</strong> / <strong>N/A</strong>.
        </p>
        <div class="meta">
          <div>
            <div class="k">Company</div>
            <div class="v">{{companyName}}</div>
          </div>
          <div>
            <div class="k">CIN</div>
            <div class="v">{{cin}}</div>
          </div>
          <div>
            <div class="k">Registered address</div>
            <div class="v">{{registeredAddress}}</div>
          </div>
          <div>
            <div class="k">Stock exchange listings</div>
            <div class="v">{{stockExchanges}}</div>
          </div>
        </div>
      </div>

      <h2>Section A — General Disclosures</h2>
      <p class="section-note">Foundational identity, operations, workforce and financial overview.</p>
      <table>
        <thead>
          <tr><th>Field</th><th>Disclosure</th></tr>
        </thead>
        <tbody>
          <tr><td class="field">Company name</td><td class="value">{{companyName}}</td></tr>
          <tr><td class="field">Corporate Identification Number (CIN)</td><td class="value">{{cin}}</td></tr>
          <tr><td class="field">Registered office address</td><td class="value">{{registeredAddress}}</td></tr>
          <tr><td class="field">Stock exchange listings</td><td class="value">{{stockExchanges}}</td></tr>
          <tr><td class="field">Locations of plants/offices</td><td class="value">{{plantLocations}}</td></tr>
          <tr><td class="field">Business activities covering ~90% of turnover</td><td class="value">{{keyActivities90Turnover}}</td></tr>
          <tr><td class="field">Total employees</td><td class="value">{{totalEmployees}}</td></tr>
          <tr><td class="field">Total workers (incl. contractual)</td><td class="value">{{totalWorkers}}</td></tr>
          <tr><td class="field">Women employees</td><td class="value">{{femaleEmployees}}</td></tr>
          <tr><td class="field">Differently abled employees</td><td class="value">{{differentlyAbledEmployees}}</td></tr>
          <tr><td class="field">Net worth</td><td class="value">{{netWorth}}</td></tr>
          <tr><td class="field">Turnover</td><td class="value">{{turnover}}</td></tr>
          <tr><td class="field">CSR applicability & brief</td><td class="value">{{csrApplicable}}</td></tr>
        </tbody>
      </table>

      <h2>Section B — Management & Process Disclosures</h2>
      <p class="section-note">Policy, governance ownership, and ESG strategy/targets.</p>
      <table>
        <thead>
          <tr><th>Field</th><th>Disclosure</th></tr>
        </thead>
        <tbody>
          <tr><td class="field">NGRBC policy status (Principles 1–9)</td><td class="value">{{ngrbcPoliciesStatus}}</td></tr>
          <tr><td class="field">Highest authority / owner for each policy</td><td class="value">{{policyOwners}}</td></tr>
          <tr><td class="field">Key ESG goals & annual targets</td><td class="value">{{esgGoalsTargets}}</td></tr>
        </tbody>
      </table>

      <h2>Section C — Principle-wise Performance (Essential & Leadership Indicators)</h2>
      <p class="section-note">Core integrity, resource efficiency, workforce well-being, and stakeholder engagement indicators.</p>
      <table>
        <thead>
          <tr><th>Field</th><th>Disclosure</th></tr>
        </thead>
        <tbody>
          <tr><td class="field">Corruption / bribery cases & complaints</td><td class="value">{{corruptionCases}}</td></tr>
          <tr><td class="field">Fines / penalties paid</td><td class="value">{{corruptionFines}}</td></tr>
          <tr><td class="field">Sustainable sourcing initiatives</td><td class="value">{{sustainableSourcing}}</td></tr>
          <tr><td class="field">R&amp;D for environmental technologies</td><td class="value">{{envRD}}</td></tr>
          <tr><td class="field">Plastic waste generated &amp; treated</td><td class="value">{{plasticWaste}}</td></tr>
          <tr><td class="field">E-waste generated &amp; treated</td><td class="value">{{eWaste}}</td></tr>
          <tr><td class="field">Hazardous waste generated &amp; treated</td><td class="value">{{hazardousWaste}}</td></tr>
          <tr><td class="field">Minimum wage compliance</td><td class="value">{{minWageCompliance}}</td></tr>
          <tr><td class="field">Average training hours per employee</td><td class="value">{{avgTrainingHours}}</td></tr>
          <tr><td class="field">Safety incidents</td><td class="value">{{safetyIncidents}}</td></tr>
          <tr><td class="field">Worker grievances raised</td><td class="value">{{workerGrievances}}</td></tr>
          <tr><td class="field">Average grievance resolution time</td><td class="value">{{grievanceResolutionTime}}</td></tr>
          <tr><td class="field">Engagement with marginalized / vulnerable stakeholders</td><td class="value">{{stakeholderEngagement}}</td></tr>
        </tbody>
      </table>

      <h2>Section D — Materiality & ESG Risks</h2>
      <p class="section-note">Material ESG risks, financial implications, and mitigation planning.</p>
      <table>
        <thead>
          <tr><th>Field</th><th>Disclosure</th></tr>
        </thead>
        <tbody>
          <tr><td class="field">Key environmental &amp; social risks</td><td class="value">{{keyRisks}}</td></tr>
          <tr><td class="field">Link to financial impact</td><td class="value">{{riskFinancialImpact}}</td></tr>
          <tr><td class="field">Risk management and mitigation plans</td><td class="value">{{riskMitigationPlans}}</td></tr>
        </tbody>
      </table>

      <div class="footer">
        <div>Generated on {{generatedOn}}</div>
        <div>ESG Sustainability Platform</div>
      </div>
    </div>
  </body>
</html>`;

function resolvePlaceholder(data, key) {
  const val = data && Object.prototype.hasOwnProperty.call(data, key) ? data[key] : undefined;
  if (val === undefined || val === null) return 'Not Disclosed';
  if (typeof val === 'string' && val.trim() === '') return 'Not Disclosed';
  if (Array.isArray(val) && val.length === 0) return 'Not Disclosed';
  return String(val);
}

export const generateBRSRReportHTML = (data) => {
  const safeData = data && typeof data === 'object' ? data : {};
  const merged = {
    ...safeData,
    generatedOn: new Date().toLocaleDateString(),
  };

  return brsrTemplateHTML.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) =>
    resolvePlaceholder(merged, key)
  );
};

const brsrTemplatePdfUrl = '/templates/brsr_annexure1_template.pdf';

const nd = (val) => {
  if (val === undefined || val === null) return 'Not Disclosed';
  if (typeof val === 'string' && val.trim() === '') return 'Not Disclosed';
  return String(val);
};

function drawWrappedText(page, font, text, x, y, maxWidth, fontSize) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(next, fontSize);
    if (width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);

  const lineHeight = fontSize * 1.25;
  lines.forEach((ln, i) => {
    page.drawText(ln, { x, y: y - i * lineHeight, size: fontSize, font, color: rgb(0, 0, 0) });
  });
}

export const generateBRSRReportPDFFromTemplate = async (data) => {
  const res = await fetch(brsrTemplatePdfUrl);
  if (!res.ok) throw new Error('Failed to load BRSR PDF template');
  const templateBytes = await res.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Coordinates are in PDF points. Template pages are A4: 595.32 x 841.92.
  // We place values on the right side of the corresponding rows.
  const page1 = pdfDoc.getPage(0);
  const writeX = 380;
  const maxW = 190;
  const fs = 10;

  // Page 1 – Section A (I. Details of the listed entity)
  drawWrappedText(page1, font, nd(data.cin), writeX, 648.46, maxW, fs);
  drawWrappedText(page1, font, nd(data.companyName), writeX, 633.82, maxW, fs);
  drawWrappedText(page1, font, nd(data.registeredAddress), writeX, 604.54, maxW, fs);
  drawWrappedText(page1, font, nd(data.website), writeX, 545.95, maxW, fs);
  // Map to BRSR field name (your form uses turnover/netWorth etc; reporting FY isn't captured—fallback to Not Disclosed)
  drawWrappedText(page1, font, nd(data.reportingYear), writeX, 531.31, maxW, fs);
  drawWrappedText(page1, font, nd(data.stockExchanges), writeX, 516.79, maxW, fs);

  // Page 4 – financials line items include Net worth / Turnover (as per template)
  if (pdfDoc.getPageCount() >= 4) {
    const page4 = pdfDoc.getPage(3);
    // These y-values were located via pdf text extraction for the label row.
    // Values are placed to the right of the row in the blank area.
    drawWrappedText(page4, font, nd(data.netWorth), writeX, 480.55, maxW, fs);
    // Turnover appears nearby; we place slightly below net worth for typical layout.
    drawWrappedText(page4, font, nd(data.turnover), writeX, 466.0, maxW, fs);
  }

  const out = await pdfDoc.save();
  return new Blob([out], { type: 'application/pdf' });
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
