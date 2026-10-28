import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('kisan_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (mobile, password, role = 'farmer') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { mobile, password, role });
      const { user: userData, token } = res.data.data;
      localStorage.setItem('kisan_user', JSON.stringify(userData));
      localStorage.setItem('kisan_token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async (role = 'farmer') => {
    const demoCredentials = {
      farmer: { mobile: '9876543210', password: 'demo' },
      buyer: { mobile: '9871234560', password: 'demo' },
      admin: { mobile: 'admin', password: 'admin123' }
    };
    const { mobile, password } = demoCredentials[role] || demoCredentials.farmer;
    return login(mobile, password, role);
  }, [login]);

  const register = useCallback(async (data, role = 'farmer') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = role === 'buyer' ? '/auth/register/buyer' : '/auth/register/farmer';
      const res = await api.post(endpoint, data);
      const { user: userData, token } = res.data.data;
      localStorage.setItem('kisan_user', JSON.stringify(userData));
      localStorage.setItem('kisan_token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kisan_user');
    localStorage.removeItem('kisan_token');
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, demoLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
