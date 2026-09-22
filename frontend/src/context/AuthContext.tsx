import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getToken, clearToken } from '../services/authService';
import { AuthRequest } from '../types';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  login: (request: AuthRequest) => Promise<void>;
  register: (request: AuthRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getToken());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  const login = async (request: AuthRequest) => {
    try {
      setError(null);
      const response = await apiLogin(request);
      localStorage.setItem('token', response.token);
      setToken(response.token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const register = async (request: AuthRequest) => {
    try {
      setError(null);
      const response = await apiRegister(request);
      localStorage.setItem('token', response.token);
      setToken(response.token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};