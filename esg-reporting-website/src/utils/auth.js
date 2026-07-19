import { supabase } from '../data/SupabaseConfig';
import { saveUserProfile, toSession } from '../data/supabaseBackend';

let currentSession = null;
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
  return currentSession;
};

export const register = async (user) => {
  const email = String(user.email || '').trim().toLowerCase();
  const { confirmPassword, ...userForInsert } = user;
  const { data, error } = await supabase.from('register').insert({ ...userForInsert, email }).select().single();
  if (error) throw error;
  await createUserDocumentsFolder(data.cin_number || user.cin_number);
  return data;
};

export const updateProfile = async (updates) => {
  const session = getAuthSession(); if (!session) return null;
  const user = await saveUserProfile(session, updates.profile || updates);
  const next = { ...session, ...toSession(user), ...updates };
  currentSession = next; return next;
};

export const logout = () => { currentSession = null; };
