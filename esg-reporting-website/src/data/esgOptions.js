export const COUNTRY_FRAMEWORKS = {
  'United States': ['SASB', 'TCFD', 'GRI'],
  'United Kingdom': ['TCFD', 'SASB', 'GRI'],
  'European Union': ['TCFD', 'SASB', 'GRI'],
  India: ['BRSR', 'GRI', 'SASB', 'TCFD'],
  Canada: ['SASB', 'TCFD', 'GRI'],
  Australia: ['SASB', 'TCFD', 'GRI'],
  Singapore: ['SASB', 'TCFD', 'GRI'],
  'United Arab Emirates': ['SASB', 'TCFD', 'GRI'],
  Other: ['GRI', 'SASB', 'TCFD'],
};

export const COUNTRY_OPTIONS = Object.keys(COUNTRY_FRAMEWORKS);

export const INDUSTRY_SECTOR_OPTIONS = [
  'Technology',
  'Manufacturing',
  'Finance',
  'Retail',
  'Energy',
  'Healthcare',
  'Transportation',
  'Construction',
  'Agriculture',
  'Other',
];

export const ALL_FRAMEWORKS = [
  'GRI',
  'SASB',
  'TCFD',
  'UNGC',
  'BRSR',
];
