import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const subscription = safeParse(localStorage.getItem('subscription'));
      const profile = safeParse(localStorage.getItem('profile'));
      setUser({ token, subscription, profile });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    persistSession(res.data);
    setUser({ token: res.data.token, subscription: res.data.subscription, profile: res.data.profile });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('subscription');
    localStorage.removeItem('profile');
    setUser(null);
  };

  const refreshSubscription = useCallback(async () => {
    try {
      const res = await api.get('/payments/status');
      const subscription = res.data.subscription;
      localStorage.setItem('subscription', JSON.stringify(subscription));
      setUser((prev) => (prev ? { ...prev, subscription } : prev));
      return subscription;
    } catch (err) {
      console.error('Failed to refresh subscription:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const { profile, subscription } = res.data;
      localStorage.setItem('profile', JSON.stringify(profile));
      localStorage.setItem('subscription', JSON.stringify(subscription));
      setUser((prev) => (prev ? { ...prev, profile, subscription } : prev));
      return { profile, subscription };
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (fields) => {
    const res = await api.patch('/auth/me', fields);
    const profile = res.data.profile;
    localStorage.setItem('profile', JSON.stringify(profile));
    setUser((prev) => (prev ? { ...prev, profile } : prev));
    return profile;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, refreshSubscription, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function persistSession(data) {
  localStorage.setItem('token', data.token);
  if (data.subscription) localStorage.setItem('subscription', JSON.stringify(data.subscription));
  if (data.profile) localStorage.setItem('profile', JSON.stringify(data.profile));
}

function safeParse(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useAuth = () => useContext(AuthContext);
