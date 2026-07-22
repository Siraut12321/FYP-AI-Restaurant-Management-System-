import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [session, setSession] = useState(authService.current);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!authService.current);

  // ─── Verify session is still valid on mount ────────────────────────────────
  useEffect(() => {
    if (!session) { setInitialLoading(false); return; }
    authService.getMe()
      .then((user) => setSession((s) => ({ ...s, user })))
      .catch(() => { authService.logout(); setSession(null); })
      .finally(() => setInitialLoading(false));
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const s = await authService.login(email, password);
      setSession(s);
      return { ok: true, user: s.user };
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Login failed';
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const s = await authService.register(payload);
      setSession(s);
      return { ok: true };
    } catch (e) {
      // Show first validation error if present, otherwise the message
      const errors = e.response?.data?.errors;
      const msg = errors?.length
        ? errors[0].msg
        : e.response?.data?.message || e.message || 'Registration failed';
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await authService.logout();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, loading: loading || initialLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
