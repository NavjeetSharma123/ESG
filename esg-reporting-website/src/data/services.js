export const FRAMEWORKS = ['GRI', 'SASB', 'TCFD', 'BRSR', 'UNGC'];

export const SERVICE_CATEGORIES = [
  {
    id: 'reporting',
    label: 'Reporting',
    description: 'Framework-aligned disclosure and document generation.',
  },
  {
    id: 'measurement',
    label: 'Measurement',
    description: 'Emissions tracking, scoring, and performance metrics.',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    description: 'Reduction planning and regulatory compliance.',
  },
];

export const services = [
  {
    id: 'esg-report',
    category: 'reporting',
    title: 'ESG Report Generation',
    description: 'Structured disclosures aligned with GRI, SASB, and TCFD. Export audit-ready reports from your responses.',
    path: '/esg-report',
    icon: 'document',
  },
  {
    id: 'carbon',
    category: 'measurement',
    title: 'Carbon Accounting',
    description: 'Scope 1, 2, and 3 emissions inventory with methodology notes and year-over-year comparison.',
    path: '/esg-report',
    icon: 'chart',
  },
  {
    id: 'brsr',
    category: 'reporting',
    title: 'BRSR Reporting',
    description: 'SEBI-aligned Business Responsibility and Sustainability Reporting for listed Indian companies.',
    path: '/brsr',
    icon: 'compliance',
  },
  {
    id: 'gri',
    category: 'reporting',
    title: 'GRI Company Details',
    description: 'Capture organization profile, material topics, and GRI content index requirements.',
    path: '/gri-details',
    icon: 'building',
  },
  {
    id: 'green-check',
    category: 'measurement',
    title: 'Environmental Assessment',
    description: 'Evaluate operational environmental impact across energy, waste, water, and biodiversity.',
    path: '/esg-report',
    icon: 'leaf',
  },
  {
    id: 'social-esg',
    category: 'reporting',
    title: 'Social ESG Reporting',
    description: 'Workforce diversity, health and safety, community engagement, and human rights disclosures.',
    path: '/esg-report',
    icon: 'people',
  },
  {
    id: 'scoring',
    category: 'measurement',
    title: 'Sustainability Scoring',
    description: 'MSCI readiness assessment with gap analysis across environmental, social, and governance pillars.',
    path: '/msci-readiness',
    icon: 'score',
  },
  {
    id: 'reduce',
    category: 'strategy',
    title: 'Emissions Reduction',
    description: 'Prioritized abatement pathways with target-setting guidance and capital allocation inputs.',
    path: '/esg-report',
    icon: 'trend',
  },
  {
    id: 'compliance',
    category: 'strategy',
    title: 'Compliance Reports',
    description: 'Generate jurisdiction-specific regulatory outputs from a single source of ESG data.',
    path: '/esg-report',
    icon: 'shield',
  },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Configure your profile',
    description: 'Set jurisdiction, industry sector, and applicable frameworks. Questions adapt to your context.',
  },
  {
    step: '02',
    title: 'Complete disclosures',
    description: 'Answer guided prompts with inline methodology guidance. Progress saves as you work.',
  },
  {
    step: '03',
    title: 'Generate and export',
    description: 'Produce structured reports ready for board review, investor relations, or regulatory filing.',
  },
];

export const STATS = [
  { value: '900+', label: 'Disclosure prompts' },
  { value: '5', label: 'Frameworks supported' },
  { value: '12', label: 'Industry sectors' },
];
