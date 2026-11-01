import { getLinkedQuestionIds, isAnswered } from './answerManagement';

const text = (value) => String(value ?? '').trim();
const normalize = (value) => text(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const frameworkNames = (question) => {
  const values = [question?.framework, question?.frameworks].flatMap((value) => Array.isArray(value) ? value : text(value).split(/[,;|]+/));
  return [...new Set(values.map(text).filter(Boolean))];
};
const pillarOf = (question) => {
  const source = normalize([question?.question, question?.section, question?.subsection, question?.department].join(' '));
  if (/energy|emission|carbon|climate|water|waste|biodiversity|environment/.test(source)) return 'Environmental Performance';
  if (/employee|workforce|worker|human right|safety|health|diversity|training|community|social/.test(source)) return 'Social Performance';
  if (/supplier|supply chain|procurement|vendor|sourcing/.test(source)) return 'Supply Chain';
  if (/product|customer|privacy|cyber|quality|accessibility/.test(source)) return 'Product and Customer Responsibility';
  if (/target|commitment|roadmap/.test(source)) return 'ESG Targets and Future Roadmap';
  if (/material|stakeholder|strategy|risk|opportunit/.test(source)) return 'ESG Strategy and Materiality';
  if (/company|organisation|organization|business activit/.test(source)) return 'Company Overview';
  if (/method|boundary|reporting period|calculation/.test(source)) return 'Methodology and Reporting Boundaries';
  return 'Governance';
};
const informationTypeOf = (question) => {
  const source = normalize(question?.question);
  if (/how many|total|number of|percentage|rate|amount|consumption|emission/.test(source)) return 'quantitative';
  if (/target|baseline|by [0-9]{4}/.test(source)) return 'target';
  if (/method|calculate|boundary/.test(source)) return 'methodology';
  if (/policy|commitment/.test(source)) return 'policy';
  if (/risk|opportunit/.test(source)) return 'governance';
  return 'qualitative';
};

const compatible = (a, b) => {
  // Explicit linked-question metadata is the only automatic cross-question merge signal.
  // Same-topic wording alone is deliberately insufficient.
  const linked = new Set([...getLinkedQuestionIds(a), ...getLinkedQuestionIds(b)]);
  return linked.has(String(a.id)) && linked.has(String(b.id))
    && pillarOf(a) === pillarOf(b)
    && informationTypeOf(a) === informationTypeOf(b);
};

const answerString = (answer) => {
  if (Array.isArray(answer)) return answer.map(answerString).filter(Boolean).join('; ');
  if (answer && typeof answer === 'object') return Object.entries(answer).map(([key, value]) => `${key}: ${answerString(value)}`).join('; ');
  return text(answer);
};

export const buildDisclosureIntelligence = (questions = [], answerFor = () => undefined, options = {}) => {
  const usable = questions.filter((question) => question && question.id != null && question.visible !== false && question.isVisible !== false && !question.excludeFromReport);
  const groups = [];
  const groupedIds = new Set();
  usable.forEach((question) => {
    const id = String(question.id);
    if (groupedIds.has(id)) return;
    const matches = usable.filter((candidate) => !groupedIds.has(String(candidate.id)) && (candidate === question || compatible(question, candidate)));
    matches.forEach((candidate) => groupedIds.add(String(candidate.id)));
    const answered = matches.map((sourceQuestion) => ({ question: sourceQuestion, answer: answerFor(sourceQuestion) }));
    const provided = answered.filter((entry) => isAnswered(entry.answer));
    if (!provided.length) return;
    const answers = [...new Set(provided.map(({ answer }) => answerString(answer)).filter(Boolean))];
    const conflict = answers.length > 1;
    const pillar = pillarOf(question);
    const prefix = pillar.startsWith('Environmental') ? 'ENV' : pillar.startsWith('Social') ? 'SOC' : pillar === 'Supply Chain' ? 'SUP' : pillar.startsWith('Product') ? 'PRD' : pillar.startsWith('ESG Targets') ? 'TGT' : pillar.startsWith('ESG Strategy') ? 'STR' : pillar.startsWith('Methodology') ? 'MET' : 'GOV';
    const paragraphId = `P-${prefix}-${String(groups.filter((group) => group.pillar === pillar).length + 1).padStart(3, '0')}`;
    const sourceQuestions = provided.map(({ question: sourceQuestion }) => sourceQuestion);
    const sourceReferences = sourceQuestions.map((sourceQuestion) => `${text(sourceQuestion.id)}: ${text(sourceQuestion.question || sourceQuestion.id)} — ${answerString(answerFor(sourceQuestion))}`);
    const missingInformation = matches.filter((item) => !isAnswered(answerFor(item))).map((item) => text(item.question || item.id));
    const exactDuplicate = provided.length > 1 && answers.length === 1;
    const narrative = conflict
      ? `Conflicting responses were provided for ${sourceQuestions.map((item) => text(item.id)).join(', ')}. Review and reconcile before publication.`
      : exactDuplicate
        ? answers[0]
        : answers.join('\n\n');
    groups.push({
      id: paragraphId,
      heading: text(question.subsection || question.section || question.question) || pillar,
      pillar,
      narrative,
      period: text(options.reportingPeriod) || 'Not provided',
      questionIds: sourceQuestions.map((item) => String(item.id)),
      sourceQuestions,
      sourceReferences,
      evidenceIds: sourceQuestions.flatMap((item) => [item.evidenceId, item.evidence_id, ...(Array.isArray(item.evidenceIds) ? item.evidenceIds : [])]).filter(Boolean),
      frameworks: [...new Set(sourceQuestions.flatMap(frameworkNames))],
      coverage: sourceQuestions.map((item) => ({ questionId: String(item.id), status: conflict ? 'Partial' : missingInformation.length ? 'Partial' : 'Full', explanation: conflict ? 'Conflicting source answers require human reconciliation.' : exactDuplicate ? 'Identical response carried through explicit linked-question mapping.' : 'Source response retained without inferred additions.', missingInformation: missingInformation.length ? missingInformation : [] })),
      missingInformation,
      conflict,
      reviewStatus: 'Generated - Pending Validation',
      evidenceStatus: groups.length ? 'Evidence pending unless a source is linked' : 'Evidence pending',
      validationStatus: conflict ? 'Conflict flagged' : 'Pending Validation',
      edited: false,
    });
  });
  return groups;
};

export const getFrameworkDisclosureReferences = (questions = [], paragraphs = []) => {
  const byQuestion = new Map();
  paragraphs.forEach((paragraph) => paragraph.questionIds.forEach((id) => byQuestion.set(String(id), paragraph)));
  return questions.map((question) => {
    const paragraph = byQuestion.get(String(question.id));
    const coverage = paragraph?.coverage.find((item) => item.questionId === String(question.id));
    return { questionId: String(question.id), framework: frameworkNames(question), disclosureId: question.disclosureId || question.code || question.id, question: question.question || '', paragraphId: paragraph?.id || null, coverageStatus: coverage?.status || 'Not Addressed', explanation: coverage?.explanation || 'No compatible populated paragraph is available.', missingInformation: coverage?.missingInformation || [] };
  });
};

export const DEFAULT_FRAMEWORK_ORDER = ['BRSR', 'GRI', 'SASB', 'TCFD', 'IFRS S1', 'IFRS S2', 'UNGC'];

