import api, { setAuthToken } from '../api/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setAuthToken(token);
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setAuthToken(null);
};

const getSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw   = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
};

// ─── Restore token on page load ───────────────────────────────────────────────
const existing = localStorage.getItem(TOKEN_KEY);
if (existing) setAuthToken(existing);

export const authService = {
  async register({ name, email, password }) {
    const { data } = await api.post('/auth/register', { name, email, password });
    saveSession(data.data.token, data.data.user);
    return { token: data.data.token, user: data.data.user };
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    saveSession(data.data.token, data.data.user);
    return { token: data.data.token, user: data.data.user };
  },

  async logout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearSession();
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },

  current: getSession(),
};

export default authService;
