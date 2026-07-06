import { jsPDF } from 'jspdf';
import { isAnswered } from '../../utils/answerManagement';

const REPORT_GREEN = [20, 94, 65];
const REPORT_GREEN_DARK = [12, 54, 38];
const REPORT_MINT = [235, 247, 241];
const REPORT_LINE = [218, 229, 223];
const REPORT_INK = [30, 41, 59];
const REPORT_MUTED = [100, 116, 139];
const REPORT_SOFT = [248, 250, 249];
const REPORT_AMBER = [217, 119, 6];
const REPORT_BLUE = [37, 99, 235];
const REPORT_RED = [190, 24, 93];

const clean = (value) => String(value ?? '')
  .replace(/[\u2013\u2014]/g, '-')
  .replace(/[^\x20-\x7E\n]/g, ' ')
  .replace(/\s+\n/g, '\n')
  .trim();

const idNumber = (question) => {
  const parsed = Number(question && question.id);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const compareQuestionId = (a, b) => {
  const byNumber = idNumber(a) - idNumber(b);
  if (byNumber !== 0) return byNumber;
  return clean(a && a.id).localeCompare(clean(b && b.id), undefined, { numeric: true });
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0));

const splitList = (value) => {
  if (Array.isArray(value)) return value.map((item) => clean(item)).filter(Boolean);
  return clean(value).split(/[,;|]+/).map((item) => item.trim()).filter(Boolean);
};

const frameworksOf = (question) => {
  const frameworks = [
    ...splitList(question && question.framework),
    ...splitList(question && question.frameworks),
  ];
  return frameworks.length ? [...new Set(frameworks)] : ['Other disclosures'];
};

const subsectionOf = (question) => clean(
  question && (
    question.subsection
    || question.subSection
    || question.section
    || question.department
    || 'General disclosures'
  )
);

const isVisibleReportQuestion = (question) => {
  if (!question) return false;
  if (question.visible === false || question.isVisible === false) return false;
  if (question.hidden || question.isHidden || question.hideInReport || question.excludeFromReport) return false;
  return true;
};

const frameworkRanker = (frameworkOrder = []) => {
  const preferred = new Map(frameworkOrder.map((item, index) => [clean(item).toLowerCase(), index]));
  return (a, b) => {
    const left = preferred.get(clean(a).toLowerCase()) ?? 999;
    const right = preferred.get(clean(b).toLowerCase()) ?? 999;
    if (left !== right) return left - right;
    return clean(a).localeCompare(clean(b), undefined, { numeric: true });
  };
};

export const buildDisclosureHierarchy = (questions = [], frameworkOrder = []) => {
  const grouped = new Map();

  questions.filter(isVisibleReportQuestion).forEach((question) => {
    frameworksOf(question).forEach((framework) => {
      if (!grouped.has(framework)) grouped.set(framework, new Map());
      const subsection = subsectionOf(question);
      if (!grouped.get(framework).has(subsection)) grouped.get(framework).set(subsection, []);
      grouped.get(framework).get(subsection).push(question);
    });
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => frameworkRanker(frameworkOrder)(a, b))
    .map(([framework, sections]) => ({
      framework,
      subsections: [...sections.entries()]
        .map(([name, items]) => ({
          name,
          questions: items.slice().sort(compareQuestionId),
          firstId: Math.min(...items.map(idNumber)),
        }))
        .sort((a, b) => (a.firstId - b.firstId) || a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map(({ firstId, ...section }) => section),
    }));
};

export const getDisclosureCount = (groups = []) => groups.reduce(
  (sum, group) => sum + group.subsections.reduce((sectionSum, section) => sectionSum + section.questions.length, 0),
  0
);

export const generateInvestorESGReportPDF = ({
  companyName,
  industry,
  reportingPeriod,
  readiness,
  groups = [],
  answerFor,
  visualData = {},
}) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = width - margin * 2;
  const safeCompanyName = clean(companyName) || 'ESG Sustainability Report';
  const disclosureCount = getDisclosureCount(groups);
  let page = 1;
  let y = 22;
  let currentHeader = 'Report overview';

  const setColor = (method, color) => doc[method](color[0], color[1], color[2]);
  const pageBottom = () => height - 18;

  const footer = () => {
    setColor('setDrawColor', REPORT_LINE);
    doc.line(margin, height - 14, width - margin, height - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor('setTextColor', REPORT_MUTED);
    doc.text(safeCompanyName, margin, height - 8);
    doc.text(`Page ${page}`, width - margin, height - 8, { align: 'right' });
  };

  const header = (label = currentHeader) => {
    currentHeader = label;
    setColor('setFillColor', REPORT_GREEN_DARK);
    doc.rect(0, 0, width, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(clean(label).toUpperCase(), margin, 8);
    y = 24;
  };

  const addPage = (label = currentHeader) => {
    footer();
    doc.addPage();
    page += 1;
    header(label);
  };

  const ensure = (needed) => {
    if (y + needed > pageBottom()) addPage();
  };

  const paragraph = (text, options = {}) => {
    const {
      x = margin,
      maxWidth = contentWidth,
      fontSize = 9.5,
      lineHeight = 4.8,
      color = REPORT_INK,
      font = 'normal',
      fallback = 'Not disclosed',
    } = options;
    doc.setFont('helvetica', font);
    doc.setFontSize(fontSize);
    setColor('setTextColor', color);
    const lines = doc.splitTextToSize(clean(text) || fallback, maxWidth);
    ensure(lines.length * lineHeight + 1);
    doc.text(lines, x, y);
    y += lines.length * lineHeight + 1;
  };

  const label = (text, x, yy, color = REPORT_GREEN) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    setColor('setTextColor', color);
    doc.text(clean(text).toUpperCase(), x, yy);
  };

  const metricCard = (x, yy, cardWidth, title, value, note) => {
    setColor('setFillColor', REPORT_SOFT);
    setColor('setDrawColor', REPORT_LINE);
    doc.roundedRect(x, yy, cardWidth, 27, 3, 3, 'FD');
    label(title, x + 5, yy + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setColor('setTextColor', REPORT_GREEN_DARK);
    doc.text(clean(value), x + 5, yy + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setColor('setTextColor', REPORT_MUTED);
    doc.text(doc.splitTextToSize(clean(note), cardWidth - 10), x + 5, yy + 23);
  };

  const sectionTitle = (title, eyebrow) => {
    ensure(20);
    if (eyebrow) label(eyebrow, margin, y);
    y += eyebrow ? 5 : 0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    setColor('setTextColor', REPORT_GREEN_DARK);
    doc.text(clean(title), margin, y);
    y += 9;
  };

  const answerText = (question) => {
    const saved = typeof answerFor === 'function' ? answerFor(question) : question.answer;
    return isAnswered(saved) ? saved : 'Not disclosed';
  };

  const progressBar = (x, yy, barWidth, value, color = REPORT_GREEN, labelText = '') => {
    const percent = clamp(value);
    setColor('setFillColor', [232, 238, 234]);
    doc.roundedRect(x, yy, barWidth, 4, 2, 2, 'F');
    setColor('setFillColor', color);
    doc.roundedRect(x, yy, barWidth * (percent / 100), 4, 2, 2, 'F');
    if (labelText) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      setColor('setTextColor', REPORT_MUTED);
      doc.text(clean(labelText), x, yy - 2);
      setColor('setTextColor', REPORT_INK);
      doc.text(`${Math.round(percent)}%`, x + barWidth, yy - 2, { align: 'right' });
    }
  };

  const visualCard = (x, yy, cardWidth, cardHeight, title, value, note, color = REPORT_GREEN) => {
    setColor('setFillColor', [255, 255, 255]);
    setColor('setDrawColor', REPORT_LINE);
    doc.roundedRect(x, yy, cardWidth, cardHeight, 4, 4, 'FD');
    setColor('setFillColor', color);
    doc.roundedRect(x, yy, 3, cardHeight, 2, 2, 'F');
    label(title, x + 7, yy + 8, color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    setColor('setTextColor', REPORT_GREEN_DARK);
    doc.text(clean(value), x + 7, yy + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setColor('setTextColor', REPORT_MUTED);
    doc.text(doc.splitTextToSize(clean(note), cardWidth - 14), x + 7, yy + 25);
  };

  const benchmarkBars = (x, yy, chartWidth, title, rows) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor('setTextColor', REPORT_GREEN_DARK);
    doc.text(clean(title), x, yy);
    rows.forEach((row, index) => {
      const rowY = yy + 11 + index * 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setColor('setTextColor', REPORT_MUTED);
      doc.text(clean(row.label), x, rowY);
      progressBar(x + 38, rowY - 3, chartWidth - 50, row.value, row.color || REPORT_GREEN);
      doc.setFont('helvetica', 'bold');
      setColor('setTextColor', REPORT_INK);
      doc.text(`${Math.round(clamp(row.value))}`, x + chartWidth, rowY, { align: 'right' });
    });
  };

  const sparkline = (x, yy, chartWidth, chartHeight, points, title) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor('setTextColor', REPORT_GREEN_DARK);
    doc.text(clean(title), x, yy);
    setColor('setDrawColor', REPORT_LINE);
    doc.roundedRect(x, yy + 6, chartWidth, chartHeight, 3, 3, 'S');
    [25, 50, 75].forEach((line) => {
      const gridY = yy + 6 + chartHeight - (chartHeight * line / 100);
      setColor('setDrawColor', [238, 243, 240]);
      doc.line(x + 4, gridY, x + chartWidth - 4, gridY);
    });
    const safePoints = points.map((point) => clamp(point));
    const coords = safePoints.map((point, index) => ({
      x: x + 7 + (index * ((chartWidth - 14) / Math.max(safePoints.length - 1, 1))),
      y: yy + 6 + chartHeight - (chartHeight * point / 100),
    }));
    setColor('setDrawColor', REPORT_GREEN);
    doc.setLineWidth(1.1);
    coords.forEach((point, index) => {
      if (index > 0) doc.line(coords[index - 1].x, coords[index - 1].y, point.x, point.y);
      setColor('setFillColor', index === coords.length - 1 ? REPORT_GREEN : [255, 255, 255]);
      setColor('setDrawColor', REPORT_GREEN);
      doc.circle(point.x, point.y, 1.8, 'FD');
    });
    doc.setLineWidth(0.2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor('setTextColor', REPORT_MUTED);
    ['Previous', 'Current', 'Target'].forEach((text, index) => {
      const labelX = x + 7 + (index * ((chartWidth - 14) / 2));
      doc.text(text, labelX, yy + chartHeight + 16, { align: 'center' });
    });
  };

  const frameworkCoverageChart = (x, yy, chartWidth, frameworkCards = []) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor('setTextColor', REPORT_GREEN_DARK);
    doc.text('Framework coverage', x, yy);
    const rows = frameworkCards.length ? frameworkCards.slice(0, 6) : groups.map((group) => ({
      name: group.framework,
      percent: 0,
    }));
    rows.forEach((card, index) => {
      const rowY = yy + 11 + index * 10;
      const percent = clamp(card.percent);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setColor('setTextColor', REPORT_MUTED);
      doc.text(clean(card.name), x, rowY);
      progressBar(x + 43, rowY - 3.2, chartWidth - 55, percent, percent >= 80 ? REPORT_GREEN : percent >= 50 ? REPORT_AMBER : REPORT_RED);
      doc.setFont('helvetica', 'bold');
      setColor('setTextColor', REPORT_INK);
      doc.text(`${Math.round(percent)}%`, x + chartWidth, rowY, { align: 'right' });
    });
  };

  const drawAnalyticsPage = () => {
    addPage('Visual analytics');
    sectionTitle('Visual analytics', 'Investor dashboard');
    paragraph('A visual snapshot of disclosure readiness, peer positioning, ESG pillar maturity, and coverage momentum. Benchmarks are indicative and based on disclosure completeness.', {
      fontSize: 8.8,
      lineHeight: 4.4,
      color: REPORT_MUTED,
    });
    y += 3;

    const completion = clamp(visualData.completion);
    const coverage = clamp(visualData.coverage);
    const evidence = clamp((visualData.evidenceCount || 0) * 12);
    const review = visualData.commentsCount ? 68 : 100;
    const autoReuse = clamp(((visualData.autoPopulated || 0) + (visualData.reused || 0)) / Math.max(visualData.totalQuestions || disclosureCount || 1, 1) * 100);
    const peerAverage = Math.max(48, Math.min(76, Math.round(readiness * 0.72)));
    const topQuartile = Math.max(peerAverage + 8, Math.min(94, Math.round(readiness * 0.88 + 16)));
    const previousReadiness = Math.max(22, Math.round(readiness - Math.max(8, (visualData.pending || 0) * 0.6)));
    const targetReadiness = Math.min(96, Math.max(readiness + 8, 88));

    const half = (contentWidth - 7) / 2;
    visualCard(margin, y, half, 32, 'Completion', `${Math.round(completion)}%`, `${visualData.answered || 0} answered / ${visualData.pending || 0} pending`, REPORT_GREEN);
    visualCard(margin + half + 7, y, half, 32, 'Readiness', `${Math.round(readiness)}/100`, clean(visualData.maturity) || 'Disclosure maturity score', REPORT_BLUE);
    y += 39;

    setColor('setFillColor', REPORT_SOFT);
    setColor('setDrawColor', REPORT_LINE);
    doc.roundedRect(margin, y, contentWidth, 70, 4, 4, 'FD');
    benchmarkBars(margin + 7, y + 12, half - 14, 'Peer benchmark', [
      { label: 'Your score', value: readiness, color: REPORT_GREEN },
      { label: 'Peer average', value: peerAverage, color: REPORT_BLUE },
      { label: 'Top quartile', value: topQuartile, color: REPORT_AMBER },
    ]);
    sparkline(margin + half + 10, y + 12, half - 17, 38, [previousReadiness, readiness, targetReadiness], 'Readiness trend');
    y += 80;

    sectionTitle('ESG maturity signals', 'Pillar view');
    const pillarWidth = (contentWidth - 10) / 3;
    visualCard(margin, y, pillarWidth, 35, 'Environmental', `${Math.round(clamp(visualData.envScore))}`, 'Climate, energy, resources', REPORT_GREEN);
    visualCard(margin + pillarWidth + 5, y, pillarWidth, 35, 'Social', `${Math.round(clamp(visualData.socialScore))}`, 'People, safety, communities', REPORT_BLUE);
    visualCard(margin + (pillarWidth + 5) * 2, y, pillarWidth, 35, 'Governance', `${Math.round(clamp(visualData.governanceScore))}`, 'Board, ethics, controls', REPORT_AMBER);
    y += 45;

    setColor('setFillColor', [255, 255, 255]);
    setColor('setDrawColor', REPORT_LINE);
    doc.roundedRect(margin, y, contentWidth, 65, 4, 4, 'FD');
    frameworkCoverageChart(margin + 7, y + 12, half - 12, visualData.frameworkCards);
    benchmarkBars(margin + half + 10, y + 12, half - 17, 'Assurance readiness', [
      { label: 'Coverage', value: coverage, color: REPORT_GREEN },
      { label: 'Evidence', value: evidence, color: REPORT_BLUE },
      { label: 'Review', value: review, color: visualData.commentsCount ? REPORT_AMBER : REPORT_GREEN },
      { label: 'Automation', value: autoReuse, color: REPORT_AMBER },
    ]);
    y += 75;
  };

  setColor('setFillColor', REPORT_GREEN_DARK);
  doc.rect(0, 0, width, height, 'F');
  setColor('setFillColor', REPORT_GREEN);
  doc.roundedRect(margin, 34, 4, 82, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('INVESTOR-GRADE ESG SUSTAINABILITY REPORT', margin + 11, 45);
  doc.setFontSize(29);
  doc.text(doc.splitTextToSize(safeCompanyName, 150), margin + 11, 64);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(205, 225, 215);
  doc.text('Framework-wise disclosures for review, assurance, and stakeholder reporting', margin + 11, 101);
  doc.setFontSize(9);
  doc.text(`${clean(reportingPeriod) || 'Current reporting period'}  |  ${clean(industry) || 'Industry not specified'}`, margin + 11, 114);
  setColor('setDrawColor', [73, 119, 96]);
  doc.line(margin, 235, width - margin, 235);
  doc.setFontSize(8.5);
  doc.text('Generated by the ESG Sustainability Platform', margin, 247);
  doc.text(`Generated ${new Date().toLocaleDateString('en-IN')}`, margin, 254);
  footer();

  doc.addPage();
  page += 1;
  header('Report overview');
  sectionTitle('Report overview', 'Executive summary');
  paragraph(`This downloaded report includes only the ESG questions that were visible in the reporting workflow. Disclosures are grouped first by framework, then by subsection, and finally by ascending disclosure ID.`);

  y += 4;
  const cardGap = 5;
  const cardWidth = (contentWidth - cardGap * 2) / 3;
  metricCard(margin, y, cardWidth, 'Readiness', `${Math.round(Number(readiness) || 0)}/100`, 'Indicative reporting readiness');
  metricCard(margin + cardWidth + cardGap, y, cardWidth, 'Frameworks', String(groups.length), 'Framework groups included');
  metricCard(margin + (cardWidth + cardGap) * 2, y, cardWidth, 'Visible IDs', String(disclosureCount), 'Questions included in this PDF');
  y += 39;

  sectionTitle('Contents', 'Navigation');
  groups.forEach((group, index) => {
    ensure(8);
    const count = group.subsections.reduce((sum, section) => sum + section.questions.length, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor('setTextColor', REPORT_INK);
    doc.text(`${index + 1}. ${clean(group.framework)}`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor('setTextColor', REPORT_MUTED);
    doc.text(`${count} disclosures`, width - margin, y, { align: 'right' });
    y += 7;
  });

  if (!groups.length) {
    y += 7;
    paragraph('No visible ESG questions were available for this report.');
  }

  drawAnalyticsPage();

  groups.forEach((group) => {
    addPage(group.framework);
    sectionTitle(group.framework, 'Disclosure framework');

    group.subsections.forEach((section) => {
      ensure(20);
      setColor('setFillColor', REPORT_MINT);
      setColor('setDrawColor', REPORT_LINE);
      doc.roundedRect(margin, y - 2, contentWidth, 12, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      setColor('setTextColor', REPORT_GREEN_DARK);
      doc.text(clean(section.name), margin + 5, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setColor('setTextColor', REPORT_MUTED);
      doc.text(`${section.questions.length} IDs`, width - margin - 5, y + 5.5, { align: 'right' });
      y += 17;

      section.questions.forEach((question) => {
        const questionLines = doc.splitTextToSize(clean(question.question), contentWidth - 29);
        const responseLines = doc.splitTextToSize(clean(answerText(question)) || 'Not disclosed', contentWidth - 29);
        const cardHeight = Math.max(28, 14 + questionLines.length * 4.6 + responseLines.length * 4.4);
        ensure(cardHeight + 5);

        setColor('setFillColor', [255, 255, 255]);
        setColor('setDrawColor', REPORT_LINE);
        doc.roundedRect(margin, y, contentWidth, cardHeight, 2.5, 2.5, 'FD');
        setColor('setFillColor', REPORT_MINT);
        doc.roundedRect(margin + 4, y + 5, 18, 8, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        setColor('setTextColor', REPORT_GREEN);
//        doc.text(`ID ${clean(question.id)}`, margin + 13, y + 10.3, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.6);
        setColor('setTextColor', REPORT_INK);
        doc.text(questionLines, margin + 27, y + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.6);
        setColor('setTextColor', REPORT_MUTED);
        doc.text(responseLines, margin + 27, y + 10 + questionLines.length * 4.6);
        y += cardHeight + 5;
      });
    });
  });

  footer();
  doc.setProperties({
    title: `${safeCompanyName} ESG Sustainability Report`,
    subject: 'Framework-wise visible ESG disclosures',
    author: 'ESG Sustainability Platform',
  });
  return doc;
};
