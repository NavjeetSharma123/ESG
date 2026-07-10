export const AUTH_SESSION_KEY = 'esg-auth-session-v1';
const USERS_KEY = 'esg-registered-users-v1';

export const DUMMY_USER = { username: 'esguser', password: 'password123', displayName: 'TestingUser1', email: 'demo@example.com' };
const readUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (error) { return []; }
};
const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const getAuthSession = () => { try { return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null'); } catch (error) { return null; } };
export const isAuthenticated = () => Boolean(getAuthSession());
export const login = (usernameOrEmail, password) => {
  const normalized = String(usernameOrEmail || '').trim().toLowerCase();
  const user = [DUMMY_USER, ...readUsers()].find((item) => (item.username.toLowerCase() === normalized || item.email.toLowerCase() === normalized) && item.password === password);
  if (!user) return null;
  const session = { username: user.username, email: user.email, displayName: user.displayName, company: user.company || '', role: user.role || 'ESG Reporting Member', loggedInAt: new Date().toISOString() };
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  return session;
};
export const register = (user) => {
  const users = readUsers(); const email = String(user.email || '').trim().toLowerCase();
  if (users.some((item) => item.email.toLowerCase() === email) || DUMMY_USER.email === email) throw new Error('An account already exists for this email.');
  const newUser = { ...user, email, username: email, createdAt: new Date().toISOString() };
  writeUsers([...users, newUser]); return newUser;
};
export const updateProfile = (updates) => {
  const session = getAuthSession(); if (!session) return null;
  const users = readUsers().map((user) => user.email === session.email ? { ...user, ...updates } : user);
  writeUsers(users); const next = { ...session, ...updates }; localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(next)); return next;
};
export const logout = () => localStorage.removeItem(AUTH_SESSION_KEY);
