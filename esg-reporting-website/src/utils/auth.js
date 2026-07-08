export const AUTH_SESSION_KEY = 'esg-auth-session-v1';

export const DUMMY_USER = {
  username: 'esguser',
  password: 'password123',
  displayName: 'ESG Test User',
};

export const getAuthSession = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null');
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = () => Boolean(getAuthSession());

export const login = (username, password) => {
  if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
    const session = {
      username: DUMMY_USER.username,
      displayName: DUMMY_USER.displayName,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return session;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};
