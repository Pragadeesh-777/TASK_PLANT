import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

// Create global Authentication Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sync token state changes with API client configurations and verify current token
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Session validation failed. User logged out.', error.message);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadCurrentUser();
  }, [token]);

  /**
   * Log user in and save token.
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, username: data.username, email: data.email, coins: data.coins || 0 });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please verify credentials.';
      return { success: false, error: message };
    }
  };

  /**
   * Register a new user account.
   * @param {string} username
   * @param {string} email
   * @param {string} password
   */
  const signup = async (username, email, password) => {
    try {
      const { data } = await API.post('/auth/signup', { username, email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, username: data.username, email: data.email, coins: data.coins || 0 });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      return { success: false, error: message };
    }
  };

  /**
   * Clear user authentication state.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
