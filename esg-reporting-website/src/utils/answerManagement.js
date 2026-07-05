export const ESG_DRAFT_KEY = 'esg-report-draft-v1';

export const normalizeQuestionId = (id) => String(id ?? '').trim();

export const getQuestionSectors = (question) => {
  const raw = question && question.sector;
  if (Array.isArray(raw)) return raw.map((sector) => String(sector).trim()).filter(Boolean);
  return String(raw || '').split(',').map((sector) => sector.trim()).filter(Boolean);
};

export const questionMatchesSector = (question, sector) => {
  if (!sector) return true;
  const normalizedSector = String(sector).trim().toLowerCase();
  const questionSectors = getQuestionSectors(question);
  return questionSectors.length === 0 || questionSectors.some((item) => {
    const normalizedItem = item.toLowerCase();
    return normalizedItem === normalizedSector || normalizedItem === 'other';
  });
};

export const getLinkedQuestionIds = (question) => {
  const raw = question && (question.linkedQuestionIds ?? question.linkedquestions);
  if (Array.isArray(raw)) return raw.map(normalizeQuestionId).filter(Boolean);
  return String(raw || '').split(',').map(normalizeQuestionId).filter(Boolean);
};

export const isAnswered = (value) => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return typeof value !== 'string' || value.trim() !== '';
};

export const normalizeAnswers = (answers) => {
  if (Array.isArray(answers)) {
    return answers.reduce((result, item) => {
      const id = normalizeQuestionId(item && (item.questionId ?? item.id));
      if (id) result[id] = item.answer ?? item.value ?? '';
      return result;
    }, {});
  }
  if (!answers || typeof answers !== 'object') return {};
  return Object.keys(answers).reduce((result, id) => {
    result[normalizeQuestionId(id)] = answers[id];
    return result;
  }, {});
};

export const getAnswer = (answers, questionId) => normalizeAnswers(answers)[normalizeQuestionId(questionId)];

export const propagateLinkedAnswer = (previous, questions, questionId, value, manuallyEdited = {}) => {
  const sourceId = normalizeQuestionId(questionId);
  const updated = { ...normalizeAnswers(previous), [sourceId]: value };
  const question = questions.find((item) => normalizeQuestionId(item.id) === sourceId);

  if (question && getLinkedQuestionIds(question).length > 0) {
    getLinkedQuestionIds(question).forEach((linkedId) => {
      if (!manuallyEdited[linkedId] || !isAnswered(updated[linkedId])) updated[linkedId] = value;
    });
  } else {
    // The source question has no linked questions.
  }
  return updated;
};

export const loadESGDraft = () => {
  try { return JSON.parse(localStorage.getItem(ESG_DRAFT_KEY) || 'null'); } catch (error) { return null; }
};

export const saveESGAnswers = async (draft) => {
  const endpoint = process.env.REACT_APP_ESG_ANSWERS_API;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
    });
    if (!response.ok) throw new Error(`Unable to save ESG answers (${response.status})`);
  }
  localStorage.setItem(ESG_DRAFT_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
};
