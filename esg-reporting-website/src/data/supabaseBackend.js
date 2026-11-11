import { supabase } from './SupabaseConfig';

const QUESTIONNAIRE_TABLE = 'questionnaires';

export const EXTRACTED_TEXT_COLUMNS = {
  financialStatements: 'Extracted Text_Financial Statements',
  electricityBills: 'Extracted Text_Electricity Bills',
  fuelInvoices: 'Extracted Text_Fuel Invoices',
  waterBills: 'Extracted Text_Water Bills',
  wasteDisposalRecords: 'Extracted Text_Waste Disposal',
  employeeRegister: 'Extracted Text_Emp Registers',
  companyPolicies: 'Extracted Text_Company Policies',
  payrollRegister: 'Extracted Text_Payroll',
  healthSafetyRegister: 'Extracted Text_Health',
  supplierList: 'Extracted Text_Supplier',
  esgCsrEvidence: 'Extracted Text_Evidence',
};

export const toSession = (user) => ({
  id: user.id,
  username: user.email,
  email: user.email,
  displayName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
  company: user.organization_name || '',
  role: user.role || user.designation || 'ESG Reporting Member',
  loggedInAt: new Date().toISOString(),
});

export const toProfile = (user) => ({
  displayName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '',
  email: user.email || '',
  company: user.organization_name || '',
  legalName: user.organization_name || '',
  website: user.website || '',
  phone: user.phone || '',
  country: user.country || '',
  state: user.state || '',
  city: user.city || '',
  registrationNumber: user.registration_number || '',
  gstNumber: user.gst_number || '',
  pan: user.cin_number || '',
  industry: user.industry || '',
  sector: user.sector || '',
  employeeCount: user.employee_count == null ? '' : String(user.employee_count),
  annualRevenue: user.annual_revenue == null ? '' : String(user.annual_revenue),
  companyType: user.company_type || '',
  defaultFramework: user.default_framework || '',
  role: user.role || user.designation || 'ESG Reporting Member',
});

export const fetchUserProfile = async (session) => {
  if (!session?.id && !session?.email) return null;
  let query = supabase.from('register').select('*').limit(1);
  query = session.id ? query.eq('id', session.id) : query.eq('email', session.email);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
};

export const saveUserProfile = async (session, profile) => {
  if (!session?.id && !session?.email) throw new Error('Please sign in again before saving your profile.');
  const name = String(profile.displayName || '').trim().split(/\s+/);
  const update = {
    organization_name: profile.legalName || profile.company || null,
    website: profile.website || null,
    phone: profile.phone || null,
    country: profile.country || null,
    state: profile.state || null,
    city: profile.city || null,
    registration_number: profile.registrationNumber || null,
    gst_number: profile.gstNumber || null,
    cin_number: profile.pan || null,
    industry: profile.industry || null,
    sector: profile.sector || null,
    employee_count: profile.employeeCount === '' ? null : Number(profile.employeeCount) || null,
    annual_revenue: profile.annualRevenue === '' ? null : Number(profile.annualRevenue) || null,
    company_type: profile.companyType || null,
    first_name: name[0] || null,
    last_name: name.slice(1).join(' ') || null,
    designation: profile.role || null,
    updated_at: new Date().toISOString(),
  };
  let query = supabase.from('register').update(update).select().limit(1);
  query = session.id ? query.eq('id', session.id) : query.eq('email', session.email);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
};

export const saveQuestionnaire = async (session, draft) => {
  if (!session?.id) throw new Error('Please sign in again before saving your questionnaire.');

  const { data: organization, error: organizationError } = await supabase
    .from('register')
    .select('id, organization_name')
    .eq('id', session.id)
    .maybeSingle();

  if (organizationError) {
    throw new Error(`Unable to verify organization: ${organizationError.message}`);
  }
  if (!organization) {
    throw new Error('Unable to save questionnaire because this organization is not registered.');
  }

  const savedAt = new Date().toISOString();
  const questionJson = draft.question_json || draft.questionJson || draft.answersByQuestionId || {};
  const defaultFramework = Array.isArray(draft.esgData?.esgFrameworks)
    ? draft.esgData.esgFrameworks.filter(Boolean).join(', ')
    : '';
  const payload = { ...draft, savedAt };
  const row = {
    organization_id: organization.id,
    organization_name: organization.organization_name || session.company || draft.esgData?.companyName || '',
    metadata: {
      source: draft.source || 'ESG',
      savedAt,
      company: draft.esgData?.companyName || '',
      industry: draft.esgData?.industry || '',
      reportingPeriod: draft.esgData?.reportingPeriod || '',
      supportingDocumentsCount: draft.supportingDocumentsCount || 0,
    },
    question_json: questionJson,
    ...Object.fromEntries(Object.entries(draft.extractedTextByType || {}).map(([key, value]) => [EXTRACTED_TEXT_COLUMNS[key], value])),
    updated_at: savedAt,
  };

  const { data: existing, error: lookupError } = await supabase
    .from(QUESTIONNAIRE_TABLE)
    .select('organization_id')
    .eq('organization_id', organization.id)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Unable to check questionnaire: ${lookupError.message}`);
  }

  const { error: frameworkError } = await supabase
    .from('register')
    .update({ default_framework: defaultFramework, updated_at: savedAt })
    .eq('id', organization.id);

  if (frameworkError) {
    throw new Error(`Unable to save default framework: ${frameworkError.message}`);
  }

  const { error } = existing
    ? await supabase.from(QUESTIONNAIRE_TABLE).update(row).eq('organization_id', organization.id)
    : await supabase.from(QUESTIONNAIRE_TABLE).insert(row);

  if (error) {
    throw new Error(`Unable to save questionnaire to Supabase: ${error.message}`);
  }
  return payload;
};

export const saveExtractedText = async (session, documentTypeKey, text) => {
  const column = EXTRACTED_TEXT_COLUMNS[documentTypeKey];
  if (!column) return;
  if (!session?.id) throw new Error('Please sign in again before saving extracted text.');
  const { data: organization, error: organizationError } = await supabase
    .from('register').select('id, organization_name').eq('id', session.id).maybeSingle();
  if (organizationError || !organization) throw organizationError || new Error('Organization not found.');
  const { data: existing, error: lookupError } = await supabase.from(QUESTIONNAIRE_TABLE)
    .select('organization_id').eq('organization_id', organization.id).limit(1).maybeSingle();
  if (lookupError) throw lookupError;
  const updatedAt = new Date().toISOString();
  const { error } = existing
    ? await supabase.from(QUESTIONNAIRE_TABLE).update({ [column]: text, updated_at: updatedAt }).eq('organization_id', organization.id)
    : await supabase.from(QUESTIONNAIRE_TABLE).insert({
      organization_id: organization.id,
      organization_name: organization.organization_name || '',
      metadata: { source: 'ESG', savedAt: updatedAt },
      question_json: {},
      [column]: text,
      updated_at: updatedAt,
    });
  if (error) throw error;
};

export const fetchQuestionnaire = async (session) => {
  if (!session?.id && !session?.email) throw new Error('Please sign in again before loading your questionnaire.');

  let organizationQuery = supabase
    .from('register')
    .select('id, organization_name')
    .limit(1);
  organizationQuery = session.id ? organizationQuery.eq('id', session.id) : organizationQuery.eq('email', session.email);

  const { data: organization, error: organizationError } = await organizationQuery.maybeSingle();

  if (organizationError) {
    throw new Error(`Unable to verify organization: ${organizationError.message}`);
  }
  if (!organization) {
    throw new Error('Unable to load questionnaire because this organization is not registered.');
  }

  const { data, error } = await supabase
    .from(QUESTIONNAIRE_TABLE)
    .select('*')
    .eq('organization_id', organization.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load questionnaire from Supabase: ${error.message}`);
  }

  return data;
};
