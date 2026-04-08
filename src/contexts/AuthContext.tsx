import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!api.getToken());

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await api.login({ email, password });
    api.setToken(token);
    setIsAuthenticated(true);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const { token } = await api.signup({ email, password });
    api.setToken(token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
