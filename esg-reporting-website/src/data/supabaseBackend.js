import { supabase } from './SupabaseConfig';

// These defaults match the app's conventions. Set the REACT_APP values when your
// questionnaire table uses different names, then restart the development server.
const QUESTIONNAIRE_TABLE = process.env.REACT_APP_SUPABASE_QUESTIONNAIRE_TABLE || 'questionnaires';
const QUESTIONNAIRE_USER_COLUMN = process.env.REACT_APP_SUPABASE_QUESTIONNAIRE_USER_COLUMN || 'user_id';
const QUESTIONNAIRE_PAYLOAD_COLUMN = process.env.REACT_APP_SUPABASE_QUESTIONNAIRE_PAYLOAD_COLUMN || 'payload';

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
  const payload = { ...draft, savedAt: new Date().toISOString() };
  const row = { [QUESTIONNAIRE_USER_COLUMN]: session.id, [QUESTIONNAIRE_PAYLOAD_COLUMN]: payload };
  const { error } = await supabase
    .from(QUESTIONNAIRE_TABLE)
    .upsert(row, { onConflict: QUESTIONNAIRE_USER_COLUMN });
  if (error) {
    throw new Error(`Unable to save questionnaire to Supabase: ${error.message}`);
  }
  return payload;
};
