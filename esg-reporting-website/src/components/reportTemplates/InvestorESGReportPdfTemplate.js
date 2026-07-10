import { jsPDF } from 'jspdf';
import { isAnswered } from '../../utils/answerManagement';

const GREEN = [20, 94, 65];
const GREEN_DARK = [12, 54, 38];
const MINT = [235, 247, 241];
const LINE = [218, 229, 223];
const INK = [30, 41, 59];
const MUTED = [100, 116, 139];
const SOFT = [248, 250, 249];
const AMBER = [217, 119, 6];
const RED = [190, 24, 93];
const BLUE = [37, 99, 235];

const clean = (value) => String(value ?? '').replace(/[\u2013\u2014]/g, '-').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+\n/g, '\n').trim();
const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0));
const splitList = (value) => Array.isArray(value) ? value.map(clean).filter(Boolean) : clean(value).split(/[,;|]+/).map((item) => item.trim()).filter(Boolean);
const frameworksOf = (question) => [...new Set([...splitList(question?.framework), ...splitList(question?.frameworks)])];
const isVisible = (q) => q && q.visible !== false && q.isVisible !== false && !q.hidden && !q.isHidden && !q.hideInReport && !q.excludeFromReport;
const idNumber = (q) => Number.isFinite(Number(q?.id)) ? Number(q.id) : Number.MAX_SAFE_INTEGER;
const compareQuestions = (a, b) => idNumber(a) - idNumber(b) || clean(a.id).localeCompare(clean(b.id), undefined, { numeric: true });

const topicOf = (question) => {
  const text = `${question?.question || ''} ${question?.section || ''} ${question?.subsection || ''} ${question?.department || ''}`.toLowerCase();
  if (/climate|emission|carbon|energy|water|waste|biodiversity|environment|scope [123]/.test(text)) return 'Climate & Environment';
  if (/employee|workforce|worker|human|safety|health|diversity|training|labour|community|social/.test(text)) return 'Workforce & Communities';
  if (/supplier|supply chain|sourcing|procurement|vendor/.test(text)) return 'Supply Chain';
  if (/product|customer|marketing|data privacy|cyber|quality|lifecycle/.test(text)) return 'Product & Customers';
  return 'Governance & Business Conduct';
};

const tcfdPillarOf = (question) => {
  const text = `${question?.question || ''} ${question?.section || ''} ${question?.subsection || ''} ${question?.department || ''}`.toLowerCase();
  if (/board|oversight|director|governance|committee|executive|accountab/.test(text)) return 'Governance';
  if (/risk|erm|scenario|physical|transition risk/.test(text)) return 'Risk Management';
  if (/metric|target|scope [123]|emission|energy|carbon price|performance/.test(text)) return 'Metrics & Targets';
  return 'Strategy';
};

// Topic-first hierarchy. TCFD rows are always placed in one of its four recommended pillars.
export const buildDisclosureHierarchy = (questions = []) => {
  const topics = new Map();
  questions.filter(isVisible).forEach((question) => {
    const topic = topicOf(question);
    if (!topics.has(topic)) topics.set(topic, new Map());
    const isTcfd = frameworksOf(question).some((fw) => /tcfd/i.test(fw));
    const section = isTcfd ? `TCFD - ${tcfdPillarOf(question)}` : clean(question.subsection || question.subSection || question.section || question.department || 'General disclosures');
    if (!topics.get(topic).has(section)) topics.get(topic).set(section, []);
    topics.get(topic).get(section).push(question);
  });
  const order = ['Climate & Environment', 'Workforce & Communities', 'Governance & Business Conduct', 'Supply Chain', 'Product & Customers'];
  return [...topics.entries()].sort(([a], [b]) => order.indexOf(a) - order.indexOf(b)).map(([topic, sections]) => ({
    framework: topic,
    subsections: [...sections.entries()].map(([name, items]) => ({ name, questions: items.sort(compareQuestions) })).sort((a, b) => a.name.localeCompare(b.name)),
  }));
};

export const getDisclosureCount = (groups = []) => groups.reduce((total, group) => total + group.subsections.reduce((count, section) => count + section.questions.length, 0), 0);

const statusFor = (question, response) => {
  const answer = clean(response).toLowerCase();
  if (/not applicable|n\/a/.test(answer)) return ['Not applicable', MUTED];
  if (!isAnswered(response) || /not disclosed|not available|not provided/.test(answer)) return ['Not disclosed', RED];
  if (/partial|in progress|to be determined|under development/.test(answer)) return ['Partial', AMBER];
  return ['Disclosed', GREEN];
};
const metricUnit = (question) => {
  const text = `${question?.question || ''} ${question?.id || ''}`.toLowerCase();
  if (/scope|emission|carbon/.test(text)) return 'tCO2e';
  if (/energy|electricity/.test(text)) return 'MWh';
  if (/water/.test(text)) return 'm3';
  if (/waste/.test(text)) return 't';
  if (/percent|rate|diversity|renewable/.test(text)) return '%';
  if (/revenue|financial|expenditure|investment/.test(text)) return 'Reporting currency';
  return 'As reported';
};
const isMetric = (question, answer) => /emission|carbon|energy|water|waste|metric|intensity|percent|rate|revenue|financial|number of|tonnes|mwh|kwh/.test(`${question?.question || ''} ${answer || ''}`.toLowerCase());
const periodWindow = (reportingPeriod, supplied) => {
  if (clean(supplied)) return clean(supplied);
  const year = clean(reportingPeriod).match(/(19|20)\d{2}/)?.[0];
  return year ? `1 January ${year} to 31 December ${year} (derived from reporting period)` : 'Not provided; confirm before external publication';
};

export const generateInvestorESGReportPDF = ({ companyName, industry, reportingPeriod, dataCollectionWindow, readiness, groups = [], answerFor, visualData = {}, executive = {}, assurance = {} }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth(); const height = doc.internal.pageSize.getHeight();
  const margin = 16; const contentWidth = width - margin * 2; const name = clean(companyName) || 'ESG Sustainability Report';
  const period = clean(reportingPeriod) || 'Not provided'; const collectionWindow = periodWindow(period, dataCollectionWindow);
  const count = getDisclosureCount(groups); let page = 1; let y = 22; let headerLabel = 'Report overview';
  const outline = doc.outline && doc.outline.add ? doc.outline : null;
  const set = (method, color) => doc[method](color[0], color[1], color[2]);
  const footer = () => { set('setDrawColor', LINE); doc.line(margin, height - 14, width - margin, height - 14); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); set('setTextColor', MUTED); doc.text(name, margin, height - 8); doc.text(`Page ${page}`, width - margin, height - 8, { align: 'right' }); };
  const header = (title = headerLabel) => { headerLabel = title; set('setFillColor', GREEN_DARK); doc.rect(0, 0, width, 12, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255); doc.text(clean(title).toUpperCase(), margin, 8); y = 24; };
  const addPage = (title = headerLabel) => { footer(); doc.addPage(); page += 1; header(title); };
  const ensure = (needed) => { if (y + needed > height - 18) addPage(); };
  const text = (value, opts = {}) => { const { x = margin, maxWidth = contentWidth, size = 9, line = 4.5, color = INK, font = 'normal', fallback = 'Not disclosed' } = opts; doc.setFont('helvetica', font); doc.setFontSize(size); set('setTextColor', color); const lines = doc.splitTextToSize(clean(value) || fallback, maxWidth); ensure(lines.length * line + 1); doc.text(lines, x, y); y += lines.length * line + 1; return lines.length; };
  const label = (value, x, yy, color = GREEN) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(7.3); set('setTextColor', color); doc.text(clean(value).toUpperCase(), x, yy); };
  const title = (value, eyebrow) => { ensure(18); if (eyebrow) { label(eyebrow, margin, y); y += 5; } doc.setFont('helvetica', 'bold'); doc.setFontSize(18); set('setTextColor', GREEN_DARK); doc.text(clean(value), margin, y); y += 9; };
  const bookmark = (value) => { if (outline) outline.add(null, clean(value), { pageNumber: page }); };
  const chip = (value, color, x, yy) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); const w = doc.getTextWidth(clean(value)) + 7; set('setFillColor', color); doc.roundedRect(x, yy - 4, w, 6, 2, 2, 'F'); doc.setTextColor(255, 255, 255); doc.text(clean(value), x + 3.5, yy); return w; };
  const card = (x, yy, w, heading, value, note, color = GREEN) => { set('setFillColor', SOFT); set('setDrawColor', LINE); doc.roundedRect(x, yy, w, 28, 3, 3, 'FD'); label(heading, x + 5, yy + 7, color); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); set('setTextColor', GREEN_DARK); doc.text(clean(value), x + 5, yy + 16); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.3); set('setTextColor', MUTED); doc.text(doc.splitTextToSize(clean(note), w - 10), x + 5, yy + 23); };
  const responseFor = (q) => { const response = typeof answerFor === 'function' ? answerFor(q) : q.answer; return isAnswered(response) ? response : '[sample answer]'; };
  const metricTable = (question, answer) => { const h = 21; ensure(h + 4); set('setFillColor', SOFT); set('setDrawColor', LINE); doc.roundedRect(margin + 7, y, contentWidth - 14, h, 1.5, 1.5, 'FD'); const cols = [margin + 10, margin + 81, margin + 120]; label('Metric name', cols[0], y + 5); label('Unit', cols[1], y + 5); label('Value', cols[2], y + 5); set('setDrawColor', LINE); doc.line(margin + 9, y + 7, width - margin - 9, y + 7); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); set('setTextColor', INK); doc.text(doc.splitTextToSize(clean(question.question), 66), cols[0], y + 12); doc.text(metricUnit(question), cols[1], y + 12); doc.text(doc.splitTextToSize(clean(answer), 51), cols[2], y + 12); y += h + 3; };
  const emissionsChart = () => { ensure(48); title('Scope 1, 2 and 3 emissions trend', 'Performance visual'); const values = [visualData.scope1, visualData.scope2, visualData.scope3].map((v) => Math.max(0, Number(v) || 0)); const max = Math.max(...values, 1); const labels = ['Scope 1', 'Scope 2', 'Scope 3']; set('setFillColor', SOFT); set('setDrawColor', LINE); doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'FD'); values.forEach((value, index) => { const x = margin + 25 + index * 52; const barH = value ? Math.max(3, value / max * 18) : 2; set('setFillColor', [GREEN, BLUE, AMBER][index]); doc.rect(x, y + 26 - barH, 18, barH, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(7); set('setTextColor', INK); doc.text(labels[index], x + 9, y + 31, { align: 'center' }); doc.setFont('helvetica', 'normal'); doc.text(value ? `${value} tCO2e` : 'No value', x + 9, y + 10, { align: 'center' }); }); y += 41; text('Trend values show the current reporting-period values available in this report. Add prior-year data to enable a year-on-year comparison.', { size: 7.5, line: 3.8, color: MUTED }); };

  // Cover
  set('setFillColor', GREEN_DARK); doc.rect(0, 0, width, height, 'F'); set('setFillColor', GREEN); doc.roundedRect(margin, 34, 4, 82, 2, 2, 'F'); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('INVESTOR-GRADE ESG SUSTAINABILITY REPORT', margin + 11, 45); doc.setFontSize(28); doc.text(doc.splitTextToSize(name, 150), margin + 11, 64); doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(205, 225, 215); doc.text('Topic-led disclosures for investor review, assurance, and accountability', margin + 11, 101); doc.setFontSize(8.5); doc.text(`Reporting period: ${period}`, margin + 11, 114); doc.text(`Data collection window: ${collectionWindow}`, margin + 11, 121); footer();

  // Executive letter
  addPage('Executive letter'); bookmark('Executive letter'); title('A message from leadership', 'Executive letter'); text(`To our investors, colleagues and stakeholders,\n\nThis report sets out ${name}'s ESG disclosures for the reporting period ${period}. We recognise that credible sustainability reporting requires complete data, traceable evidence and clear ownership - not simply stated commitments. We are accountable for improving the gaps identified in this report, prioritising climate data, workforce outcomes and governance controls.\n\nOur immediate actions are to complete priority disclosures, attach source evidence to every quantitative claim, and obtain appropriate independent assurance before external use. We will use the materiality assessment to focus investment and oversight on the issues most significant to our business and stakeholders.`, { size: 10, line: 5.4 }); y += 10; text(clean(executive.signatoryName) || 'ESG Reporting Team', { size: 10, font: 'bold' }); text(clean(executive.signatoryTitle) || 'For the Chief Executive Officer / Chief Sustainability Officer', { size: 8.5, color: MUTED });

  // Overview and contents
  addPage('Report overview'); bookmark('Report overview'); title('Report overview', 'Executive summary'); const maturity = clean(visualData.maturity) || (readiness < 45 ? 'Beginner' : readiness < 70 ? 'Developing' : readiness < 85 ? 'Mature' : 'Leader'); const topRisks = (visualData.topRisks || []).slice(0, 3); const strengths = (visualData.strengths || []).slice(0, 3); const actions = (visualData.actions || []).slice(0, 3); text(`${name} is assessed at ${maturity} ESG reporting maturity. Overall status: ${readiness >= 85 ? 'ready for final approval, subject to assurance.' : readiness >= 55 ? 'in progress; important disclosure and evidence gaps remain.' : 'early-stage; the report is not ready for external reliance.'} Top risks: ${(topRisks.length ? topRisks : ['incomplete quantitative disclosures', 'limited supporting evidence', 'open review items']).join(', ')}. Key strengths: ${(strengths.length ? strengths : ['structured disclosure workflow', 'framework mapping', 'readiness tracking']).join(', ')}. Required actions: ${(actions.length ? actions : ['close priority gaps', 'attach evidence to quantitative claims', 'complete management review']).join(', ')}.`, { size: 9.2, line: 4.8 });
  y += 3; const gap = 5; const cardWidth = (contentWidth - gap * 2) / 3; card(margin, y, cardWidth, 'Readiness', `${Math.round(readiness)}/100`, `${maturity} tier`, BLUE); card(margin + cardWidth + gap, y, cardWidth, 'Disclosures', String(count), 'Visible and in scope'); card(margin + (cardWidth + gap) * 2, y, cardWidth, 'Evidence', String(visualData.evidenceCount || 0), 'Uploaded supporting records', AMBER); y += 38;
  text(`${Math.round(readiness)}/100, ${maturity} tier: ${maturity === 'Beginner' ? 'foundational reporting is in place, but coverage and evidence are insufficient for reliable external reporting. The next tier, Developing, requires at least 45/100 through more complete disclosures, supporting evidence and review.' : `the score combines completion, framework coverage, evidence availability and review status. The next tier requires a higher score and substantiated disclosures.`}`, { size: 8.7, line: 4.4, color: MUTED });
  y += 3; text(`Reporting period for sustainability information: ${period}. Data collection window: ${collectionWindow}. Materiality approach: ${clean(visualData.materialityApproach) || 'Single materiality assessment; confirm stakeholder and financial-materiality criteria before publication.'}`, { size: 8.7, line: 4.4 });
  title('Contents', 'Navigation'); groups.forEach((group, index) => { ensure(7); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); set('setTextColor', INK); doc.text(`${index + 1}. ${group.framework}`, margin, y); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); set('setTextColor', MUTED); doc.text(`${getDisclosureCount([{ subsections: group.subsections }])} disclosures`, width - margin, y, { align: 'right' }); y += 7; });

  addPage('Data quality and automation'); bookmark('Data quality and automation'); title('Data quality and automation', 'How to read this report'); const evidence = Number(visualData.evidenceCount || 0); const automated = Number(visualData.autoPopulated || 0) + Number(visualData.reused || 0); const total = Math.max(Number(visualData.totalQuestions) || count, 1); card(margin, y, (contentWidth - 5) / 2, 'Evidence', `${evidence}`, evidence ? 'Supporting records uploaded to the reporting workspace' : 'No supporting records uploaded; disclosures are unverified', evidence ? GREEN : RED); card(margin + (contentWidth + 5) / 2, y, (contentWidth - 5) / 2, 'Automation', `${Math.round(automated / total * 100)}`, `${automated} answers mapped or pre-populated from ${total} disclosures`, AMBER); y += 37; text('Evidence is the count of supporting documents uploaded to the reporting workspace; it is not an assurance conclusion and does not confirm the accuracy of a disclosure. Automation is the percentage of disclosure responses that were pre-populated or reused through framework mapping. It reduces data-entry effort, but every automated response still requires owner review and evidence validation.', { size: 9, line: 4.7 });

  groups.forEach((group) => { addPage(group.framework); bookmark(group.framework); title(group.framework, 'Topic-led disclosures'); group.subsections.forEach((section) => { ensure(16); set('setFillColor', MINT); set('setDrawColor', LINE); doc.roundedRect(margin, y - 2, contentWidth, 11, 2, 2, 'FD'); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); set('setTextColor', GREEN_DARK); doc.text(section.name, margin + 5, y + 5); y += 15; section.questions.forEach((question) => { const answer = responseFor(question); const [status, statusColor] = statusFor(question, answer); const frameworks = frameworksOf(question); const tags = frameworks.length ? frameworks.join(' | ') : 'No framework tag'; const disclosureLines = doc.splitTextToSize(clean(question.question), contentWidth - 22); const responseLines = doc.splitTextToSize(clean(answer), contentWidth - 22); const h = Math.max(40, 18 + disclosureLines.length * 4.5 + responseLines.length * 4.2); ensure(h + 4); set('setFillColor', [255, 255, 255]); set('setDrawColor', LINE); doc.roundedRect(margin, y, contentWidth, h, 2.5, 2.5, 'FD'); chip(status, statusColor, width - margin - 31, y + 7); label('Disclosure', margin + 6, y + 7); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.1); set('setTextColor', INK); doc.text(disclosureLines, margin + 6, y + 13); const responseY = y + 16 + disclosureLines.length * 4.5; label('Company response', margin + 6, responseY); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); set('setTextColor', INK); doc.text(responseLines, margin + 6, responseY + 5); const metaY = y + h - 8; label(`Evidence / source: ${question.evidence || question.source || (evidence ? 'Workspace evidence available - link source before publication' : 'No source attached')}`, margin + 6, metaY, evidence ? GREEN : RED); label(`Assurance status: ${question.assuranceStatus || (evidence ? 'Not assured' : 'Evidence pending')}`, margin + 6, metaY + 4); label(`Framework tags: ${tags}`, margin + 78, metaY); y += h + 4; if (isMetric(question, answer)) metricTable(question, answer); if (/year.?on.?year.*emission|emission.*trend/.test(clean(question.question).toLowerCase())) emissionsChart(); }); }); });

  addPage('Assurance statement'); bookmark('Assurance statement'); title('Assurance statement', 'External assurance'); text(`Assurance provider: ${clean(assurance.provider) || 'Not appointed'}\nScope: ${clean(assurance.scope) || 'No assurance scope has been defined'}\nStandard used: ${clean(assurance.standard) || 'Not specified'}\nLevel of assurance: ${clean(assurance.level) || 'Not assured'}\nLimitations: ${clean(assurance.limitations) || 'This report is a management-prepared draft. Evidence availability, completeness and the accuracy of disclosures have not been independently assured.'}`, { size: 9.5, line: 5.4 }); y += 7; text('No statement in this report should be read as an independent assurance opinion unless a named assurance provider, scope, standard and level of assurance are completed above.', { size: 8.5, line: 4.3, color: RED, font: 'bold' });

  footer(); doc.setProperties({ title: `${name} ESG Sustainability Report`, subject: 'Topic-led ESG disclosures with evidence and assurance status', author: 'ESG Sustainability Platform', keywords: 'ESG, sustainability, assurance, TCFD, GRI' }); doc.setLanguage && doc.setLanguage('en-US');
  return doc;
};
