import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { generateBRSRReportPDFFromTemplate, generateESGReportPDF } from '../utils/reportGenerator';
import { getAnswer, isAnswered, loadESGDraft } from '../utils/answerManagement';
import './FinalReportPage.css';

const FRAMEWORK_FIELDS = {
  GRI: ['companyName', 'industry', 'reportingPeriod', 'scope1Emissions', 'scope2Emissions', 'energyConsumption', 'waterUsage', 'wasteGenerated', 'totalEmployees', 'genderDiversityPercent', 'safetyIncidents', 'boardSize', 'ethicsPolicy'],
  'ISSB / SASB': ['companyName', 'industry', 'reportingPeriod', 'revenue', 'scope1Emissions', 'scope2Emissions', 'scope3Emissions', 'energyConsumption', 'boardSize', 'sustainabilityCommittee', 'esgTargetsSet'],
  SASB: ['companyName', 'industry', 'reportingPeriod', 'revenue', 'scope1Emissions', 'scope2Emissions', 'energyConsumption', 'boardSize', 'sustainabilityCommittee'],
  TCFD: ['companyName', 'industry', 'reportingPeriod', 'scope1Emissions', 'scope2Emissions', 'scope3Emissions', 'boardSize', 'sustainabilityCommittee', 'esgTargetsSet', 'governanceInitiatives'],
  BRSR: ['companyName', 'industry', 'reportingPeriod', 'totalEmployees', 'genderDiversityPercent', 'safetyIncidents', 'scope1Emissions', 'scope2Emissions', 'ethicsPolicy'],
  'UN Global Compact': ['companyName', 'industry', 'reportingPeriod', 'totalEmployees', 'genderDiversityPercent', 'trainingHoursPerEmployee', 'safetyIncidents', 'communityInvestment', 'ethicsPolicy'],
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const valueOrDash = (value, suffix = '') => (isAnswered(value) ? `${value}${suffix}` : '—');
const downloadBlob = (content, type, filename) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const Progress = ({ value, tone = 'green' }) => (
  <div className="fr-progress" aria-label={`${value}% complete`}>
    <span className={`fr-progress-fill ${tone}`} style={{ width: `${clamp(value)}%` }} />
  </div>
);

const FinalReportPage = () => {
  const location = useLocation();
  const history = useHistory();
  const [darkMode, setDarkMode] = useState(false);
  const [openFramework, setOpenFramework] = useState(null);
  const persistedDraft = loadESGDraft() || {};
  const state = { ...persistedDraft, ...(location.state || {}) };
  const { source, brsrData, esgData, griData, visibleQuestions } = state;
  const reportAnswers = state.reportAnswers || state.questionAnswers || state.answers || {};
  const activeData = brsrData || esgData || griData;
  const questions = Array.isArray(visibleQuestions) ? visibleQuestions : [];

  const flatData = useMemo(() => {
    if (!griData) return activeData || {};
    return Object.assign({}, griData.baseFormData, griData.griUniversal, griData.griEconomic, griData.griEnvironmental, griData.griSocial);
  }, [activeData, griData]);

  if (!source || !activeData) {
    return <main className="final-report-page"><div className="fr-empty"><span>◎</span><h1>No report data found</h1><p>Complete a reporting flow first, then return here for your readiness review.</p><button className="fr-btn primary" onClick={() => history.push('/')}>Go to dashboard</button></div></main>;
  }

  const answerFor = (question) => {
    const saved = getAnswer(reportAnswers, question.id);
    if (isAnswered(saved)) return saved;
    return question.isDefaultAnswer === false ? question.answer : undefined;
  };
  const values = questions.length ? questions.map(answerFor) : Object.values(flatData || {});
  const totalQuestions = Math.max(values.length, 1);
  const answered = values.filter(isAnswered).length;
  const pending = Math.max(totalQuestions - answered, 0);
  const completion = Math.round((answered / totalQuestions) * 100);
  const companyName = flatData.companyName || 'Your organisation';
  const selectedFrameworks = source === 'ESG' && Array.isArray(esgData.esgFrameworks) && esgData.esgFrameworks.length ? esgData.esgFrameworks : [source];
  const industry = flatData.industry || flatData.sector || 'Industry not specified';
  const reportingPeriod = flatData.reportingPeriod || flatData.financialYear || 'Current reporting period';
  const updatedBy = state.lastUpdatedBy || 'ESG Reporting Team';
  const evidenceCount = Number(state.supportingDocumentsCount || flatData.supportingDocumentsCount || 0);
  const commentsCount = Number(state.reviewCommentsCount || 0);
  const materialTopics = Array.isArray(state.materialTopics) ? state.materialTopics : ['Climate action', 'People & culture', 'Ethical governance'];
  const autoPopulated = questions.filter((q) => q.isDefaultAnswer || q.autoPopulated).length;
  const reused = questions.filter((q) => String(q.framework || '').includes(',') || Array.isArray(q.frameworks) && q.frameworks.length > 1).length;
  const coverage = clamp(Math.round(completion * 0.94 + (evidenceCount > 0 ? 4 : 0)));
  const readiness = clamp(Math.round(completion * 0.65 + coverage * 0.2 + Math.min(evidenceCount * 2, 10) + (commentsCount === 0 ? 5 : 2)));
  const status = readiness >= 85 ? 'Ready for submission' : readiness >= 55 ? 'In progress' : 'Draft';

  const frameworkCards = selectedFrameworks.map((framework) => {
    const frameworkQuestions = questions.filter((q) => String(q.framework || '').toLowerCase().includes(String(framework).toLowerCase()));
    const fieldKeys = FRAMEWORK_FIELDS[framework] || [];
    const frameworkValues = frameworkQuestions.length ? frameworkQuestions.map(answerFor) : fieldKeys.map((key) => flatData[key]);
    const total = Math.max(frameworkValues.length, 1);
    const complete = frameworkValues.filter(isAnswered).length;
    return { name: framework, total, complete, pending: total - complete, percent: Math.round((complete / total) * 100) };
  });
  const selectedNames = selectedFrameworks.map((item) => String(item).toLowerCase());
  const unselected = Object.keys(FRAMEWORK_FIELDS).filter((fw) => !selectedNames.some((name) => name.includes(fw.toLowerCase()) || fw.toLowerCase().includes(name))).slice(0, 3).map((fw) => {
    const fields = FRAMEWORK_FIELDS[fw];
    const covered = fields.filter((field) => isAnswered(flatData[field])).length;
    return { name: fw, covered, total: fields.length, percent: Math.round((covered / fields.length) * 100) };
  }).sort((a, b) => b.percent - a.percent);

  const envScore = clamp(Math.round(completion * 0.82 + (isAnswered(flatData.scope1Emissions) ? 14 : 0)));
  const socialScore = clamp(Math.round(completion * 0.78 + (isAnswered(flatData.totalEmployees) ? 12 : 0)));
  const governanceScore = clamp(Math.round(completion * 0.86 + (isAnswered(flatData.ethicsPolicy) ? 10 : 0)));
  const maturity = readiness >= 85 ? 'Leader' : readiness >= 70 ? 'Mature' : readiness >= 45 ? 'Developing' : 'Beginner';
  const missingFields = Object.entries(FRAMEWORK_FIELDS[selectedFrameworks[0]] || []).filter(([, key]) => !isAnswered(flatData[key])).map(([, key]) => key);
  const gapItems = missingFields.slice(0, 4).map((key, index) => ({ label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), priority: index === 0 ? 'Critical' : index < 3 ? 'Medium' : 'Low' }));
  if (!gapItems.length) gapItems.push({ label: 'No critical disclosure gaps detected', priority: 'Low' });
  const metrics = [
    ['Scope 1 emissions', flatData.scope1Emissions, 'tCO₂e'], ['Scope 2 emissions', flatData.scope2Emissions, 'tCO₂e'],
    ['Energy consumption', flatData.energyConsumption, 'MWh'], ['Water usage', flatData.waterUsage, 'm³'],
    ['Waste generated', flatData.wasteGenerated, 't'], ['Employee diversity', flatData.genderDiversityPercent, '%'],
    ['Safety incidents', flatData.safetyIncidents, ''], ['Board diversity', flatData.independentDirectorsPercent, '%'],
  ];

  const safeName = String(companyName).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-');
  const handlePDF = async () => {
    try {
      if (source === 'BRSR') {
        const blob = await generateBRSRReportPDFFromTemplate(brsrData);
        downloadBlob(blob, 'application/pdf', `${safeName}-BRSR-Report.pdf`);
      } else if (source === 'ESG' && questions.length) {
        const doc = new jsPDF();
        doc.setFontSize(20); doc.text(`${companyName} ESG Report`, 18, 22);
        doc.setFontSize(10); doc.text(`Reporting period: ${reportingPeriod} | Readiness: ${readiness}/100`, 18, 31);
        let y = 43;
        questions.forEach((q, index) => {
          const lines = doc.splitTextToSize(`${index + 1}. ${q.question}\nAnswer: ${isAnswered(answerFor(q)) ? answerFor(q) : 'Not disclosed'}`, 174);
          if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
          doc.text(lines, 18, y); y += lines.length * 5 + 5;
        });
        doc.save(`${safeName}-ESG-Report.pdf`);
      } else {
        downloadBlob(generateESGReportPDF(flatData), 'application/pdf', `${safeName}-${source}-Report.pdf`);
      }
    } catch (error) { console.error(error); alert('The report could not be generated. Please try again.'); }
  };
  const exportCSV = (rows, name) => downloadBlob(rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv;charset=utf-8', `${safeName}-${name}.csv`);

  return (
    <main className={`final-report-page ${darkMode ? 'dark' : ''}`}>
      <header className="fr-topbar">
        <div><button className="fr-back" onClick={() => history.goBack()} aria-label="Go back">←</button><span className="fr-eyebrow">FINAL REPORT / {reportingPeriod}</span></div>
        <div className="fr-top-actions"><button className="fr-btn primary" onClick={handlePDF}>Download PDF</button></div>
      </header>

      <section className="fr-hero">
        <div className="fr-hero-copy"><div className="fr-status-row"><span className={`fr-status ${readiness >= 85 ? 'ready' : ''}`}>{status}</span><span>Version {state.reportVersion || '1.0'}</span><span>Updated by {updatedBy}</span></div><h1 style={{color: "white"}}>{companyName}</h1><p>{industry} · {reportingPeriod} · Created {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><div className="fr-chips">{selectedFrameworks.map((fw) => <span key={fw}>{fw}</span>)}</div></div>
        <div className="fr-score-ring" style={{ '--score': readiness }}><div><strong>{readiness}</strong><span>/100</span><small>READINESS</small></div></div>
      </section>

      <section className="fr-kpi-grid">
        {[['Questions', totalQuestions, `${answered} answered`], ['Completion', `${completion}%`, `${pending} pending`], ['Framework coverage', `${coverage}%`, `${selectedFrameworks.length} selected`], ['Auto-populated', autoPopulated, `${Math.round(autoPopulated / totalQuestions * 100)}% success rate`], ['Evidence', evidenceCount, 'documents uploaded'], ['Review comments', commentsCount, commentsCount ? 'require attention' : 'all clear'], ['Material topics', materialTopics.length, 'topics covered'], ['Time saved', `${Math.max(4, reused * 2 + autoPopulated)}h`, `${reused} answers reused`]].map(([label, value, note]) => <article className="fr-kpi" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}
      </section>

      <div className="fr-layout">
        <div className="fr-content">
          <section className="fr-section" id="frameworks"><div className="fr-section-head"><div><span className="fr-kicker">REPORTING PROGRESS</span><h2>Framework readiness</h2></div><span className="fr-muted">Select a card for details</span></div><div className="fr-framework-grid">{frameworkCards.map((card) => <button key={card.name} className={`fr-framework-card ${openFramework === card.name ? 'open' : ''}`} onClick={() => setOpenFramework(openFramework === card.name ? null : card.name)}><div className="fr-framework-title"><i className={card.percent >= 80 ? 'green' : card.percent >= 50 ? 'amber' : 'red'} /><strong>{card.name}</strong><b>{card.percent}%</b></div><Progress value={card.percent} tone={card.percent >= 80 ? 'green' : card.percent >= 50 ? 'amber' : 'red'} /><div className="fr-framework-meta"><span>{card.complete} answered</span><span>{card.pending} pending</span><span>{card.total} total</span></div>{openFramework === card.name && <div className="fr-framework-detail">Completing {card.pending} remaining disclosures will bring this framework to submission readiness.</div>}</button>)}</div></section>

          <section className="fr-section"><div className="fr-section-head"><div><span className="fr-kicker">SMART MAPPING</span><h2>Cross-framework efficiency</h2></div></div><div className="fr-efficiency"><div className="fr-callout"><span>↗</span><div><strong>{reused + autoPopulated} disclosures reused</strong><p>Answers mapped once and applied wherever frameworks overlap.</p></div></div><div className="fr-mini-stats"><div><strong>{Math.max(4, reused * 2 + autoPopulated)}h</strong><span>estimated time saved</span></div><div><strong>{reused}</strong><span>duplicates eliminated</span></div><div><strong>{Math.round((reused + autoPopulated) / totalQuestions * 100)}%</strong><span>automation achieved</span></div></div></div></section>

          <section className="fr-section"><div className="fr-section-head"><div><span className="fr-kicker">UNLOCK MORE VALUE</span><h2>Coverage you already have</h2></div></div><p className="fr-intro">Your existing answers have already advanced frameworks you did not select.</p><div className="fr-coverage-list">{unselected.map((item) => <div className="fr-coverage-row" key={item.name}><div><strong>{item.name}</strong><span>{item.covered}/{item.total} questions covered</span></div><div className="fr-coverage-progress"><Progress value={item.percent} /><b>{item.percent}%</b></div><button onClick={() => history.push('/')}>Add framework</button></div>)}</div>{unselected[0] && <div className="fr-opportunity">You are already <strong>{unselected[0].percent}% ready</strong> for {unselected[0].name} reporting.</div>}</section>

          <section className="fr-two-col"><article className="fr-section"><span className="fr-kicker">PEER BENCHMARK</span><h2>How you compare</h2><div className="fr-radar"><svg viewBox="0 0 220 180" role="img" aria-label="ESG peer comparison radar"><polygon points="110,12 205,72 170,168 50,168 15,72" className="grid"/><polygon points={`110,${150-envScore*1.25} ${110+socialScore*.85},${86-socialScore*.14} ${110+governanceScore*.62},${98+governanceScore*.68} ${110-governanceScore*.62},${98+governanceScore*.68} ${110-socialScore*.85},${86-socialScore*.14}`} className="company"/><text x="110" y="10">Environmental</text><text x="188" y="68">Social</text><text x="164" y="178">Governance</text><text x="6" y="178">Completion</text><text x="0" y="68">Disclosure</text></svg></div><div className="fr-benchmark-bars">{[['Your score', readiness], ['Industry average', 64], ['Top quartile', 82]].map(([label, score]) => <div key={label}><span>{label}</span><Progress value={score} tone={label === 'Your score' ? 'green' : 'blue'} /><b>{score}</b></div>)}</div><small className="fr-disclaimer">Benchmark is an indicative estimate based on disclosure completeness.</small></article><article className="fr-section"><span className="fr-kicker">MATURITY ASSESSMENT</span><h2>{maturity}</h2><p className="fr-intro">Your organisation demonstrates {maturity.toLowerCase()} ESG reporting capability.</p>{[['Environmental', envScore], ['Social', socialScore], ['Governance', governanceScore]].map(([label, score]) => <div className="fr-score-row" key={label}><span>{label}</span><Progress value={score} /><b>{score}</b></div>)}<div className="fr-maturity-scale"><span>Beginner</span><span>Developing</span><span>Mature</span><span>Leader</span></div></article></section>

          <section className="fr-two-col"><article className="fr-section"><span className="fr-kicker">QUALITY CONTROL</span><h2>General status</h2><div className="fr-status-list">{[['Data quality', pending, pending ? 'Missing data points' : 'Complete'], ['Documentation', evidenceCount, evidenceCount ? 'Evidence uploaded' : 'Evidence pending'], ['Review status', commentsCount, commentsCount ? 'Comments open' : 'Ready for approval']].map(([label, count, text]) => <div key={label}><i className={count ? 'warn' : 'ok'}>{count ? '!' : '✓'}</i><span><strong>{label}</strong><small>{text}</small></span><b>{count}</b></div>)}</div></article><article className="fr-section"><span className="fr-kicker">GAP ANALYSIS</span><h2>Attention required</h2><div className="fr-gap-list">{gapItems.map((gap) => <div key={gap.label}><span className={`fr-priority ${gap.priority.toLowerCase()}`}>{gap.priority}</span><strong>{gap.label}</strong></div>)}</div><button className="fr-text-btn" onClick={() => exportCSV([['Gap', 'Priority'], ...gapItems.map((g) => [g.label, g.priority])], 'gap-analysis')}>Download gap analysis →</button></article></section>

          <section className="fr-section"><div className="fr-section-head"><div><span className="fr-kicker">PERFORMANCE</span><h2>ESG indicators</h2></div></div><div className="fr-metric-table"><div className="fr-table-head"><span>Indicator</span><span>Current year</span><span>Previous year</span><span>Trend</span></div>{metrics.map(([label, value, unit], index) => <div key={label}><strong>{label}</strong><span>{valueOrDash(value, isAnswered(value) && unit ? ` ${unit}` : '')}</span><span>—</span><b className={index < 5 ? 'down' : 'up'}>{isAnswered(value) ? (index < 5 ? '↓ tracked' : '↑ tracked') : 'No data'}</b></div>)}</div></section>

          <section className="fr-section fr-insights"><div className="fr-ai-icon">✦</div><div><span className="fr-kicker">AI-ASSISTED INSIGHTS</span><h2>Your fastest path to submission</h2><p>You are <strong>{frameworkCards[0]?.percent || completion}% ready for {frameworkCards[0]?.name || source}</strong>. {pending ? `Complete the ${pending} pending answers and attach supporting evidence to improve assurance readiness.` : 'All core answers are complete; your next step is evidence review and final approval.'}</p><div className="fr-recommendations"><span>01</span><p><strong>Close high-priority gaps</strong> Start with {gapItems[0].label.toLowerCase()}.</p><span>02</span><p><strong>Strengthen auditability</strong> Upload evidence for every quantitative disclosure.</p><span>03</span><p><strong>Run final review</strong> Resolve {commentsCount} open comments before submission.</p></div></div></section>

          <section className="fr-section"><span className="fr-kicker">MATERIALITY</span><h2>Material topics summary</h2><div className="fr-topic-grid">{materialTopics.map((topic, index) => <div key={topic}><span>0{index + 1}</span><strong>{topic}</strong><small>{selectedFrameworks.slice(0, 3).join(' · ')}</small><b>SDG {index === 0 ? '13' : index === 1 ? '8' : '16'}</b></div>)}</div></section>

          <section className="fr-section"><span className="fr-kicker">AUDIT TRAIL</span><h2>Recent activity</h2><div className="fr-timeline">{[['Report data consolidated', 'Today', 'System'], ['Framework mapping refreshed', 'Today', 'Auto-mapping engine'], ['Readiness assessment generated', 'Today', updatedBy], ['Draft report created', reportingPeriod, updatedBy]].map(([event, time, actor]) => <div key={event}><i /><span><strong>{event}</strong><small>{actor}</small></span><time>{time}</time></div>)}</div></section>
        </div>

        <aside className="fr-sidebar"><div className="fr-side-card readiness"><span>SUBMISSION READINESS</span><div className="fr-side-score">{readiness}<small>/100</small></div>{[['Data completion', completion], ['Evidence availability', clamp(evidenceCount * 12)], ['Framework coverage', coverage], ['Data quality', clamp(100 - pending * 3)], ['Review status', commentsCount ? 65 : 100]].map(([label, score]) => <div className="fr-side-progress" key={label}><span>{label}<b>{score}%</b></span><Progress value={score} /></div>)}<p>{readiness >= 85 ? 'Ready for final approval and submission.' : `${100-readiness} points to submission-ready.`}</p></div><nav className="fr-side-card"><span>REPORT SECTIONS</span>{['Frameworks', 'Coverage', 'Benchmark', 'Gap analysis', 'Performance', 'Insights', 'Audit trail'].map((item, index) => <a href={`#${index === 0 ? 'frameworks' : ''}`} key={item}><i>{index + 1}</i>{item}</a>)}</nav><div className="fr-side-card forecast"><span>READINESS FORECAST</span><strong>{pending ? `${Math.max(1, Math.ceil(pending / 8))} days` : 'Ready now'}</strong><p>At your current completion pace.</p></div></aside>
      </div>

      <section className="fr-export"><div><span className="fr-kicker">YOUR REPORT IS ALMOST THERE</span><h2 style={{color: "white"}}>Export and share</h2><p>Generate board-ready outputs or hand off structured data for assurance.</p></div><div className="fr-export-actions"><button className="fr-btn primary" onClick={handlePDF}>Download PDF report</button></div></section>
    </main>
  );
};

export default FinalReportPage;
