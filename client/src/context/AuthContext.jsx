import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize user immediately from persistent storage if available to prevent flash/redirect loops
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('careerlens_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('careerlens_user');
      setUser(null);
      setError(null);
    }
  }, []);

  // Bootstrap session on app launch via HttpOnly cookie
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const response = await api.auth.me();
        if (isMounted && response?.user) {
          setUser(response.user);
          localStorage.setItem('careerlens_user', JSON.stringify(response.user));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          // Only clear session if explicitly unauthenticated (401)
          if (err.status === 401) {
            localStorage.removeItem('careerlens_user');
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen for 401 broadcast from API client (session expired)
    const handleUnauthorized = () => {
      localStorage.removeItem('careerlens_user');
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      setUser(res.user);
      localStorage.setItem('careerlens_user', JSON.stringify(res.user));
      return res.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await api.auth.register({ name, email, password });
      setUser(res.user);
      localStorage.setItem('careerlens_user', JSON.stringify(res.user));
      return res.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const value = {
    user,
    token: user ? 'cookie-session' : null,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
