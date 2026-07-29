import { supabase } from '../data/SupabaseConfig';
import { saveUserProfile, toSession } from '../data/supabaseBackend';

const AUTH_SESSION_KEY = 'sustanica.auth.session';

const loadStoredSession = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const stored = window.localStorage.getItem(AUTH_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

const persistSession = (session) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (session) {
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch (error) {
    // Storage may be blocked; in-memory auth still works for the current tab.
  }
};

let currentSession = loadStoredSession();
const DOCUMENTS_BUCKET = 'Documents';

const sanitizeStorageFolderName = (value) => {
  const sanitized = String(value || '')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized;
};

const createUserDocumentsFolder = async (cinNumber) => {
  const folderName = sanitizeStorageFolderName(cinNumber);
  if (!folderName) throw new Error('CIN number is required to create the Documents folder.');

  const marker = new Blob([''], { type: 'text/plain' });
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(`${folderName}/.keep`, marker, {
      cacheControl: '3600',
      contentType: 'text/plain',
      upsert: true,
    });

  if (error) throw error;
  return folderName;
};

export const getAuthSession = () => currentSession;
export const isAuthenticated = () => Boolean(getAuthSession());

export const login = async (usernameOrEmail, password) => {
  const email = String(usernameOrEmail || '').trim().toLowerCase();
  const { data: user, error } = await supabase
    .from('register')
    .select('*')
    .eq('email', email)
    .eq('password_hash', password)
    .maybeSingle();
  if (error) throw error;
  if (!user || user.is_active === false) return null;
  currentSession = toSession(user);
  persistSession(currentSession);
  return currentSession;
};

export const checkCINExists = async (cinNumber) => {
  const cin = String(cinNumber || '').trim().toUpperCase();
  if (!cin) return false;
  const { data, error } = await supabase
    .from('register')
    .select('id')
    .ilike('cin_number', cin)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
};

export const register = async (user) => {
  const email = String(user.email || '').trim().toLowerCase();
  const cinNumber = String(user.cin_number || '').trim().toUpperCase();
  if (await checkCINExists(cinNumber)) {
    throw new Error('This CIN number is already registered.');
  }
  const { confirmPassword, ...userForInsert } = user;
  const { data, error } = await supabase.from('register').insert({ ...userForInsert, email, cin_number: cinNumber }).select().single();
  if (error) throw error;
  await createUserDocumentsFolder(data.cin_number || user.cin_number);
  return data;
};

export const changePassword = async (currentPassword, nextPassword) => {
  const session = getAuthSession();
  if (!session?.id && !session?.email) throw new Error('Please sign in again before changing your password.');

  let query = supabase
    .from('register')
    .select('id, password_hash')
    .limit(1);
  query = session.id ? query.eq('id', session.id) : query.eq('email', session.email);
  const { data: user, error } = await query.maybeSingle();
  if (error) throw error;
  if (!user || user.password_hash !== currentPassword) throw new Error('Current password is incorrect.');

  const { error: updateError } = await supabase
    .from('register')
    .update({ password_hash: nextPassword, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (updateError) throw updateError;
  return true;
};

export const updateProfile = async (updates) => {
  const session = getAuthSession(); if (!session) return null;
  const user = await saveUserProfile(session, updates.profile || updates);
  const next = { ...session, ...toSession(user), ...updates };
  currentSession = next;
  persistSession(currentSession);
  return next;
};

export const logout = () => {
  currentSession = null;
  persistSession(null);
};
