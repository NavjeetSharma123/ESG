export const BRSR_PRODUCTS_SERVICES_QUESTION_ID = '20013';

const makeRows = (count, fields) => Array.from({ length: count }, () => (
  fields.reduce((row, field) => ({ ...row, [field]: '' }), {})
));

export const createProductsServicesAnswer = () => ({
  productServices: makeRows(3, ['productService', 'nicCode', 'turnoverPercent']),
  businessActivities: makeRows(2, ['mainActivity', 'businessActivity', 'turnoverPercent']),
});

export const isProductsServicesQuestion = (question) => (
  String(question?.id || '').trim() === BRSR_PRODUCTS_SERVICES_QUESTION_ID
);

const normalizeRows = (rows, count, fields) => {
  const defaults = makeRows(count, fields);
  return defaults.map((row, index) => ({ ...row, ...(Array.isArray(rows) ? rows[index] : {}) }));
};

export const normalizeProductsServicesAnswer = (value) => ({
  ...createProductsServicesAnswer(),
  ...(value && typeof value === 'object' && !Array.isArray(value) ? value : {}),
  productServices: normalizeRows(value?.productServices, 3, ['productService', 'nicCode', 'turnoverPercent']),
  businessActivities: normalizeRows(value?.businessActivities, 2, ['mainActivity', 'businessActivity', 'turnoverPercent']),
});

export const hasProductsServicesAnswer = (value) => {
  const answer = normalizeProductsServicesAnswer(value);
  return [...answer.productServices, ...answer.businessActivities]
    .some((row) => Object.values(row).some((cell) => String(cell || '').trim() !== ''));
};
