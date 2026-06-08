import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('ticketdesk_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ticketdesk_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  const persistSession = useCallback((session) => {
    localStorage.setItem('ticketdesk_token', session.token);
    localStorage.setItem('ticketdesk_user', JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('ticketdesk_token');
    localStorage.removeItem('ticketdesk_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    authService
      .getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem('ticketdesk_user', JSON.stringify(currentUser));
      })
      .catch(clearSession)
      .finally(() => setIsBootstrapping(false));
  }, [clearSession, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login: async (payload) => persistSession(await authService.login(payload)),
      register: async (payload) => persistSession(await authService.register(payload)),
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          clearSession();
        }
      },
    }),
    [clearSession, isBootstrapping, persistSession, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
};
