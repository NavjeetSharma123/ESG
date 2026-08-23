import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { generateBRSRReportPDFFromTemplate, generateESGReportPDF } from '../utils/reportGenerator';
import { getAnswer, isAnswered, loadESGDraft } from '../utils/answerManagement';
import { buildDisclosureHierarchy, generateInvestorESGReportPDF } from './reportTemplates/InvestorESGReportPdfTemplate';
import ProductsServicesTables from './ProductsServicesTables';
import { hasProductsServicesAnswer, isProductsServicesQuestion } from '../utils/brsrProductsServices';
import './FinalReportPage.css';

const FRAMEWORK_FIELDS = {
  GRI: ['companyName', 'industry', 'reportingPeriod', 'scope1Emissions', 'scope2Emissions', 'energyConsumption', 'waterUsage', 'wasteGenerated', 'totalEmployees', 'genderDiversityPercent', 'safetyIncidents', 'boardSize', 'ethicsPolicy'],
  'ISSB / SASB': ['companyName', 'industry', 'reportingPeriod', 'revenue', 'scope1Emissions', 'scope2Emissions', 'scope3Emissions', 'energyConsumption', 'boardSize', 'sustainabilityCommittee', 'esgTargetsSet'],
  SASB: ['companyName', 'industry', 'reportingPeriod', 'revenue', 'scope1Emissions', 'scope2Emissions', 'energyConsumption', 'boardSize', 'sustainabilityCommittee'],
  TCFD: ['companyName', 'industry', 'reportingPeriod', 'scope1Emissions', 'scope2Emissions', 'scope3Emissions', 'boardSize', 'sustainabilityCommittee', 'esgTargetsSet', 'governanceInitiatives'],
  BRSR: ['companyName', 'industry', 'reportingPeriod', 'totalEmployees', 'genderDiversityPercent', 'safetyIncidents', 'scope1Emissions', 'scope2Emissions', 'ethicsPolicy'],
  UNGC: ['companyName', 'industry', 'reportingPeriod', 'totalEmployees', 'genderDiversityPercent', 'trainingHoursPerEmployee', 'safetyIncidents', 'communityInvestment', 'ethicsPolicy'],
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const valueOrDash = (value, suffix = '') => (isAnswered(value) ? `${value}${suffix}` : '—');
const answerKey = (id) => String(id ?? '').trim();
const downloadBlob = (content, type, filename) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const Progress = ({ value, tone = 'green' }) => (
  <div className="fr-progress" aria-label={`${value}% complete`}>
    <span className={`fr-progress-fill ${tone}`} style={{ width: `${clamp(value)}%` }} />
  </div>
);

const ESG_INDICATORS = [
  { label: 'Scope 1,2,3 emissions', unit: 'tCO2e', field: 'scope1Emissions', terms: ['scope 1', 'scope one'] },
  { label: 'Energy consumption', unit: 'MWh', field: 'energyConsumption', terms: ['energy consumption', 'total energy'] },
  { label: 'Water usage', unit: 'm3', field: 'waterUsage', terms: ['water usage', 'water consumption', 'water withdrawal'] },
  { label: 'Waste generated', unit: 't', field: 'wasteGenerated', terms: ['waste generated', 'total waste'] },
  { label: 'Employee diversity', unit: '%', field: 'genderDiversityPercent', terms: ['gender diversity', 'women employees', 'female employees', 'diversity'] },
  { label: 'Safety incidents', unit: '', field: 'safetyIncidents', terms: ['safety incidents', 'injury', 'lost time', 'ltifr'] },
  { label: 'Board diversity', unit: '%', field: 'independentDirectorsPercent', terms: ['board diversity', 'independent directors', 'women directors'] },
];

const normalizeLookupText = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const getQuestionLookupText = (question) => normalizeLookupText([
  question.id,
  question.question,
  question.guidelines,
  question.framework,
  question.department,
].filter(Boolean).join(' '));
const truncateLabel = (value, length = 92) => {
  const text = String(value || '').trim();
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
};

const FinalReportPage = () => {
  const location = useLocation();
  const history = useHistory();
  const [darkMode, setDarkMode] = useState(false);
  const [openFramework, setOpenFramework] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const persistedDraft = loadESGDraft() || {};
  const state = { ...persistedDraft, ...(location.state || {}) };
  const { source, brsrData, esgData, griData, visibleQuestions } = state;
  const activeData = brsrData || esgData || griData;
  const questions = Array.isArray(visibleQuestions) ? visibleQuestions : [];

  const initialFlatData = useMemo(() => {
    if (!griData) return activeData || {};
    return Object.assign({}, griData.baseFormData, griData.griUniversal, griData.griEconomic, griData.griEnvironmental, griData.griSocial);
  }, [activeData, griData]);
  const [editedData, setEditedData] = useState(initialFlatData);
  const [editedAnswers, setEditedAnswers] = useState(state.reportAnswers || state.questionAnswers || state.answers || {});
  const [customBlocks, setCustomBlocks] = useState(state.customBlocks || []);
  const flatData = editedData || {};
  const reportAnswers = editedAnswers || {};

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
  const disclosureGroups = buildDisclosureHierarchy(questions, selectedFrameworks);
  const industry = flatData.industry || flatData.sector || 'Industry not specified';
  const reportingPeriod = flatData.reportingPeriod || flatData.financialYear || 'Current reporting period';
  const dataCollectionWindow = flatData.dataCollectionWindow || state.dataCollectionWindow || flatData.reportingDataCollectionWindow;
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
  const unansweredLabels = questions.filter((question) => !isAnswered(answerFor(question))).slice(0, 3).map((question) => question.question || question.id);
  const answeredLabels = questions.filter((question) => isAnswered(answerFor(question))).slice(0, 3).map((question) => question.question || question.id);
  const numericValue = (value) => Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
  const metrics = ESG_INDICATORS.map((indicator) => {
    const legacyValue = flatData[indicator.field];
    if (isAnswered(legacyValue)) return [indicator.label, legacyValue, indicator.unit];

    const dynamicQuestion = questions.find((question) => {
      const lookup = getQuestionLookupText(question);
      return indicator.terms.some((term) => lookup.includes(normalizeLookupText(term)));
    });
    return [indicator.label, dynamicQuestion ? answerFor(dynamicQuestion) : undefined, indicator.unit];
  });
  const editableQuestions = questions;
  const productsServicesQuestion = questions.find(isProductsServicesQuestion);
  const productsServicesAnswer = productsServicesQuestion ? answerFor(productsServicesQuestion) : null;
  const placementOptions = useMemo(() => {
    const options = [{ value: 'append', label: 'End of report' }];
    disclosureGroups.forEach((group) => {
      group.subsections.forEach((section) => {
        options.push({ value: `section:${group.framework}::${section.name}`, label: `Before section: ${section.name}` });
        section.questions.forEach((question) => {
          options.push({ value: `question:${question.id}`, label: `Before question: ${truncateLabel(question.question || question.id)}` });
        });
      });
    });
    return options;
  }, [disclosureGroups]);
  const placementLabel = (placement) => placementOptions.find((option) => option.value === (placement || 'append'))?.label || 'End of report';
  const updateDataField = (field, value) => setEditedData((previous) => ({ ...(previous || {}), [field]: value }));
  const updateAnswerField = (questionId, value) => setEditedAnswers((previous) => ({ ...(previous || {}), [answerKey(questionId)]: value }));
  const updateCustomBlock = (index, updates) => setCustomBlocks((previous) => previous.map((block, blockIndex) => blockIndex === index ? { ...block, ...updates } : block));
  const removeCustomBlock = (index) => setCustomBlocks((previous) => previous.filter((_, blockIndex) => blockIndex !== index));
  const addTextBlock = () => setCustomBlocks((previous) => [...previous, { type: 'text', title: 'Management note', body: '', placement: 'append' }]);
  const addImageBlock = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const image = await readFileAsDataURL(file);
      const imageType = file.type && file.type.includes('png') ? 'PNG' : 'JPEG';
      setCustomBlocks((previous) => [...previous, { type: 'image', title: file.name.replace(/\.[^.]+$/, ''), body: '', image, imageType, placement: 'append' }]);
    } catch (error) {
      console.error(error);
      alert('The image could not be added. Please try another file.');
    }
  };
  const safeName = String(companyName).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-');
  const handlePDF = async () => {
    try {
      if (source === 'BRSR') {
        const blob = await generateBRSRReportPDFFromTemplate(flatData);
        downloadBlob(blob, 'application/pdf', `${safeName}-BRSR-Report.pdf`);
      } else if (source === 'ESG' && questions.length) {
        const doc = generateInvestorESGReportPDF({
          companyName,
          industry,
          reportingPeriod,
          dataCollectionWindow,
          readiness,
          groups: disclosureGroups,
          answerFor,
          visualData: {
            completion,
            coverage,
            answered,
            pending,
            totalQuestions,
            evidenceCount,
            commentsCount,
            autoPopulated,
            reused,
            frameworkCards,
            envScore,
            socialScore,
            governanceScore,
            maturity,
            scope1: numericValue(metrics[0]?.[1]),
            scope2: numericValue(metrics[1]?.[1]),
            scope3: numericValue(flatData.scope3Emissions),
            topRisks: unansweredLabels,
            strengths: answeredLabels,
            actions: gapItems.slice(0, 3).map((item) => item.label),
            materialityApproach: state.materialityApproach || flatData.materialityApproach,
          },
          executive: {
            signatoryName: flatData.ceoName || flatData.csoName || state.ceoName || state.csoName,
            signatoryTitle: flatData.ceoName || state.ceoName ? 'Chief Executive Officer' : flatData.csoName || state.csoName ? 'Chief Sustainability Officer' : undefined,
          },
          assurance: {
            provider: flatData.assuranceProvider || state.assuranceProvider,
            scope: flatData.assuranceScope || state.assuranceScope,
            standard: flatData.assuranceStandard || state.assuranceStandard,
            level: flatData.assuranceLevel || state.assuranceLevel,
            limitations: flatData.assuranceLimitations || state.assuranceLimitations,
          },
          customBlocks,
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
        <div className="fr-top-actions"><button className="fr-btn" onClick={() => setEditorOpen(true)}>Edit before finalising</button><button className="fr-btn primary" onClick={handlePDF}>Download PDF</button></div>
      </header>

      <section className="fr-hero">
        <div className="fr-hero-copy"><div className="fr-status-row"><span className={`fr-status ${readiness >= 85 ? 'ready' : ''}`}>{status}</span><span>Updated by {updatedBy}</span></div><h1 style={{color: "white"}}>{companyName}</h1><p>{industry} · {reportingPeriod} · Created {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><div className="fr-chips">{selectedFrameworks.map((fw) => <span key={fw}>{fw}</span>)}</div></div>
        <div className="fr-score-ring" style={{ '--score': readiness }}><div><strong>{readiness}</strong><span>/100</span><small>READINESS</small></div></div>
      </section>

      <section className="fr-kpi-grid">
        {[['Questions', totalQuestions, `${answered} answered`], ['Completion', `${completion}%`, `${pending} pending`], ['Framework coverage', `${coverage}%`, `${selectedFrameworks.length} selected`], ['Auto-populated', autoPopulated, `${Math.round(autoPopulated / totalQuestions * 100)}% success rate`], ['Evidence', evidenceCount, 'documents uploaded'], ['Review comments', commentsCount, commentsCount ? 'require attention' : 'all clear'], ['Material topics', materialTopics.length, 'topics covered'], ['Time saved', `${Math.max(4, reused * 2 + autoPopulated)}h`, `${reused} answers reused`]].map(([label, value, note]) => <article className="fr-kpi" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}
      </section>

      {productsServicesQuestion && hasProductsServicesAnswer(productsServicesAnswer) && <section className="fr-section fr-products-services-report"><span className="fr-kicker">BRSR DISCLOSURE</span><h2>{productsServicesQuestion.question}</h2><ProductsServicesTables value={productsServicesAnswer} readOnly /></section>}

      <div className="fr-layout">
        <div className="fr-content">
          <section className="fr-section" id="frameworks"><div className="fr-section-head"><div><span className="fr-kicker">REPORTING PROGRESS</span><h2>Framework readiness</h2></div><span className="fr-muted">Select a card for details</span></div><div className="fr-framework-grid">{frameworkCards.map((card) => <button key={card.name} className={`fr-framework-card ${openFramework === card.name ? 'open' : ''}`} onClick={() => setOpenFramework(openFramework === card.name ? null : card.name)}><div className="fr-framework-title"><i className={card.percent >= 80 ? 'green' : card.percent >= 50 ? 'amber' : 'red'} /><strong>{card.name}</strong><b>{card.percent}%</b></div><Progress value={card.percent} tone={card.percent >= 80 ? 'green' : card.percent >= 50 ? 'amber' : 'red'} /><div className="fr-framework-meta"><span>{card.complete} answered</span><span>{card.pending} pending</span><span>{card.total} total</span></div>{openFramework === card.name && <div className="fr-framework-detail">Completing {card.pending} remaining disclosures will bring this framework to submission readiness.</div>}</button>)}</div></section>

          <section className="fr-section"><div className="fr-section-head"><div><span className="fr-kicker">SMART MAPPING</span><h2>Cross-framework efficiency</h2></div></div><div className="fr-efficiency"><div className="fr-callout"><span>↗</span><div><strong>{reused + autoPopulated} disclosures reused</strong><p>Answers mapped once and applied wherever frameworks overlap.</p></div></div><div className="fr-mini-stats"><div><strong>{Math.max(4, reused * 2 + autoPopulated)}h</strong><span>estimated time saved</span></div><div><strong>{reused}</strong><span>duplicates eliminated</span></div><div><strong>{Math.round((reused + autoPopulated) / totalQuestions * 100)}%</strong><span>automation achieved</span></div></div></div></section>

          <section className="fr-section"><div className="fr-section-head"><div><span className="fr-kicker">UNLOCK MORE VALUE</span><h2>Coverage you already have</h2></div></div><p className="fr-intro">Your existing answers have already advanced frameworks you did not select.</p><div className="fr-coverage-list">{unselected.map((item) => <div className="fr-coverage-row" key={item.name}><div><strong>{item.name}</strong><span>{item.covered}/{item.total} questions covered</span></div><div className="fr-coverage-progress"><Progress value={item.percent} /><b>{item.percent}%</b></div><button onClick={() => history.push('/')}>Add framework</button></div>)}</div>{unselected[0] && <div className="fr-opportunity">You are already <strong>{unselected[0].percent}% ready</strong> for {unselected[0].name} reporting.</div>}</section>

          <section className="fr-two-col"><article className="fr-section"><span className="fr-kicker">BENCHMARK*</span><h2>How you compare</h2><div className="fr-radar"><svg viewBox="0 0 220 180" role="img" aria-label="ESG peer comparison radar"><polygon points="110,12 205,72 170,168 50,168 15,72" className="grid"/><polygon points={`110,${150-envScore*1.25} ${110+socialScore*.85},${86-socialScore*.14} ${110+governanceScore*.62},${98+governanceScore*.68} ${110-governanceScore*.62},${98+governanceScore*.68} ${110-socialScore*.85},${86-socialScore*.14}`} className="company"/><text x="110" y="10">Environmental</text><text x="188" y="68">Social</text><text x="164" y="178">Governance</text><text x="6" y="178">Completion</text><text x="0" y="68">Disclosure</text></svg></div><div className="fr-benchmark-bars">{[['Your score', readiness], ['Industry average', 64], ['Top quartile', 82]].map(([label, score]) => <div key={label}><span>{label}</span><Progress value={score} tone={label === 'Your score' ? 'green' : 'blue'} /><b>{score}</b></div>)}</div><small className="fr-disclaimer">*Peer Benchmarking COMING SOON!</small></article><article className="fr-section"><span className="fr-kicker">MATURITY ASSESSMENT</span><h2>{maturity}</h2><p className="fr-intro">Your organisation demonstrates {maturity.toLowerCase()} ESG reporting capability.</p>{[['Environmental', envScore], ['Social', socialScore], ['Governance', governanceScore]].map(([label, score]) => <div className="fr-score-row" key={label}><span>{label}</span><Progress value={score} /><b>{score}</b></div>)}<div className="fr-maturity-scale"><span>Beginner</span><span>Developing</span><span>Mature</span><span>Leader</span></div></article></section>

          <section className="fr-two-col"><article className="fr-section"><span className="fr-kicker">QUALITY CONTROL</span><h2>General status</h2><div className="fr-status-list">{[['Data quality', pending, pending ? 'Missing data points' : 'Complete'], ['Documentation', evidenceCount, evidenceCount ? 'Evidence uploaded' : 'Evidence pending'], ['Review status', commentsCount, commentsCount ? 'Comments open' : 'Ready for approval']].map(([label, count, text]) => <div key={label}><i className={count ? 'warn' : 'ok'}>{count ? '!' : '✓'}</i><span><strong>{label}</strong><small>{text}</small></span><b>{count}</b></div>)}</div></article><article className="fr-section"><span className="fr-kicker">GAP ANALYSIS</span><h2>Attention required</h2><div className="fr-gap-list">{gapItems.map((gap) => <div key={gap.label}><span className={`fr-priority ${gap.priority.toLowerCase()}`}>{gap.priority}</span><strong>{gap.label}</strong></div>)}</div></article></section>

          <section className="fr-section"><div className="fr-section-head"><div><span className="fr-kicker">PERFORMANCE</span><h2>ESG indicators</h2></div></div><div className="fr-metric-table"><div className="fr-table-head"><span>Indicator</span><span>Current year</span><span>Previous year</span><span>Trend</span></div>{metrics.map(([label, value, unit], index) => <div key={label}><strong>{label}</strong><span>{valueOrDash(value, isAnswered(value) && unit ? ` ${unit}` : '')}</span><span>—</span><b className={index < 5 ? 'down' : 'up'}>{isAnswered(value) ? (index < 5 ? '↓ tracked' : '↑ tracked') : 'No data'}</b></div>)}</div></section>

          <section className="fr-section fr-insights"><div className="fr-ai-icon">✦</div><div><span className="fr-kicker">AI-ASSISTED INSIGHTS</span><h2>Your fastest path to submission</h2><p>You are <strong>{frameworkCards[0]?.percent || completion}% ready for {frameworkCards[0]?.name || source}</strong>. {pending ? `Complete the ${pending} pending answers and attach supporting evidence to improve assurance readiness.` : 'All core answers are complete; your next step is evidence review and final approval.'}</p><div className="fr-recommendations"><span>01</span><p><strong>Close high-priority gaps</strong> Start with {gapItems[0].label.toLowerCase()}.</p><span>02</span><p><strong>Strengthen auditability</strong> Upload evidence for every quantitative disclosure.</p><span>03</span><p><strong>Run final review</strong> Resolve {commentsCount} open comments before submission.</p></div></div></section>

          <section className="fr-section"><span className="fr-kicker">MATERIALITY</span><h2>Material topics summary</h2><div className="fr-topic-grid">{materialTopics.map((topic, index) => <div key={topic}><span>0{index + 1}</span><strong>{topic}</strong><small>{selectedFrameworks.slice(0, 3).join(' · ')}</small><b>SDG {index === 0 ? '13' : index === 1 ? '8' : '16'}</b></div>)}</div></section>

          {!!customBlocks.length && <section className="fr-section"><span className="fr-kicker">FINAL REVIEW CONTENT</span><h2>Management additions</h2><div className="fr-custom-blocks">{customBlocks.map((block, index) => <article key={`${block.title}-${index}`} className="fr-custom-block"><span>{placementLabel(block.placement)}</span><strong>{block.title || `Additional item ${index + 1}`}</strong>{block.body && <p>{block.body}</p>}{block.image && <img src={block.image} alt={block.title || 'Report addition'} />}</article>)}</div></section>}

          <section className="fr-section" hidden><span className="fr-kicker">AUDIT TRAIL</span><h2>Recent activity</h2><div className="fr-timeline">{[['Report data consolidated', 'Today', 'System'], ['Framework mapping refreshed', 'Today', 'Auto-mapping engine'], ['Readiness assessment generated', 'Today', updatedBy], ['Draft report created', reportingPeriod, updatedBy]].map(([event, time, actor]) => <div key={event}><i /><span><strong>{event}</strong><small>{actor}</small></span><time>{time}</time></div>)}</div></section>
        </div>

        <aside className="fr-sidebar"><div className="fr-side-card readiness"><span>SUBMISSION READINESS</span><div className="fr-side-score">{readiness}<small>/100</small></div>{[['Data completion', completion], ['Evidence availability', clamp(evidenceCount * 12)], ['Framework coverage', coverage], ['Data quality', clamp(100 - pending * 3)], ['Review status', commentsCount ? 65 : 100]].map(([label, score]) => <div className="fr-side-progress" key={label}><span>{label}<b>{score}%</b></span><Progress value={score} /></div>)}<p>{readiness >= 85 ? 'Ready for final approval and submission.' : `${100-readiness} points to submission-ready.`}</p></div><nav className="fr-side-card" hidden><span>REPORT SECTIONS</span>{['Frameworks', 'Coverage', 'Benchmark', 'Gap analysis', 'Performance', 'Insights', 'Audit trail'].map((item, index) => <a href={`#${index === 0 ? 'frameworks' : ''}`} key={item}><i>{index + 1}</i>{item}</a>)}</nav><div className="fr-side-card forecast" hidden><span>READINESS FORECAST</span><strong>{pending ? `${Math.max(1, Math.ceil(pending / 8))} days` : 'Ready now'}</strong><p>At your current completion pace.</p></div></aside>
      </div>

      <section className="fr-export"><div><span className="fr-kicker">YOUR REPORT IS ALMOST THERE</span><h2 style={{color: "white"}}>Export and share</h2><p>Generate board-ready outputs or hand off structured data for assurance.</p></div><div className="fr-export-actions"><button className="fr-btn" onClick={() => setEditorOpen(true)}>Edit report</button><button className="fr-btn primary" onClick={handlePDF}>Download PDF report</button></div></section>

      {editorOpen && (
        <div className="fr-editor-backdrop" role="presentation">
          <section className="fr-editor-modal" role="dialog" aria-modal="true" aria-labelledby="report-editor-title">
            <header className="fr-editor-header">
              <div><span className="fr-kicker">PRE-FINAL REVIEW</span><h2 id="report-editor-title">Edit report data</h2></div>
              <button className="fr-editor-close" onClick={() => setEditorOpen(false)} aria-label="Close editor">x</button>
            </header>

            <div className="fr-editor-grid">
              <label>Company name<input value={flatData.companyName || ''} onChange={(event) => updateDataField('companyName', event.target.value)} /></label>
              <label>Industry<input value={flatData.industry || flatData.sector || ''} onChange={(event) => updateDataField('industry', event.target.value)} /></label>
              <label>Reporting period<input value={flatData.reportingPeriod || flatData.financialYear || ''} onChange={(event) => updateDataField('reportingPeriod', event.target.value)} /></label>
              <label>Data collection window<input value={flatData.dataCollectionWindow || ''} onChange={(event) => updateDataField('dataCollectionWindow', event.target.value)} /></label>
              <label>Assurance provider<input value={flatData.assuranceProvider || ''} onChange={(event) => updateDataField('assuranceProvider', event.target.value)} /></label>
              <label>Assurance level<input value={flatData.assuranceLevel || ''} onChange={(event) => updateDataField('assuranceLevel', event.target.value)} /></label>
            </div>

            <div className="fr-editor-section">
              <div className="fr-editor-section-head"><h3>ESG indicators</h3><span>Edit values used in the report and charts</span></div>
              <div className="fr-editor-grid">
                {ESG_INDICATORS.map((indicator) => <label key={indicator.field}>{indicator.label}<input value={flatData[indicator.field] || ''} onChange={(event) => updateDataField(indicator.field, event.target.value)} /></label>)}
              </div>
            </div>

            {!!editableQuestions.length && <div className="fr-editor-section"><div className="fr-editor-section-head"><h3>Disclosure answers</h3><span>{editableQuestions.length} visible questions shown</span></div><div className="fr-answer-editor-list">{editableQuestions.map((question) => isProductsServicesQuestion(question) ? <div className="fr-products-services-editor" key={question.id}><span>{question.question || question.id}</span><ProductsServicesTables value={answerFor(question)} onChange={(value) => updateAnswerField(question.id, value)} /></div> : <label key={question.id}><span>{question.question || question.id}</span><textarea value={answerFor(question) || ''} onChange={(event) => updateAnswerField(question.id, event.target.value)} rows={3} /></label>)}</div></div>}

            <div className="fr-editor-section">
              <div className="fr-editor-section-head"><h3>Text and image additions</h3><span>Included in preview and ESG PDF</span></div>
              <div className="fr-editor-actions"><button className="fr-btn" onClick={addTextBlock}>Add text</button><label className="fr-btn fr-file-btn">Add image<input type="file" accept="image/png,image/jpeg" onChange={addImageBlock} /></label></div>
              <div className="fr-custom-editor-list">{customBlocks.map((block, index) => <article key={index}><label>Place this content<select value={block.placement || 'append'} onChange={(event) => updateCustomBlock(index, { placement: event.target.value })}>{placementOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><input value={block.title || ''} placeholder="Section title" onChange={(event) => updateCustomBlock(index, { title: event.target.value })} /><textarea value={block.body || ''} placeholder="Optional supporting text" onChange={(event) => updateCustomBlock(index, { body: event.target.value })} rows={3} />{block.image && <img src={block.image} alt={block.title || 'Custom addition'} />}<button className="fr-text-btn" onClick={() => removeCustomBlock(index)}>Remove</button></article>)}</div>
            </div>

            <footer className="fr-editor-footer"><button className="fr-btn" onClick={() => setEditorOpen(false)}>Review changes</button><button className="fr-btn primary" onClick={() => { setEditorOpen(false); handlePDF(); }}>Finalise and download PDF</button></footer>
          </section>
        </div>
      )}
    </main>
  );
};

export default FinalReportPage;
