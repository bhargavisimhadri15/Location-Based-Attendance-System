import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            setAuthToken(token);
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData) {
                setUser(userData);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setToken(res.data.token);
            setUser(res.data.user);
            setAuthToken(res.data.token);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setAuthToken(null);
        navigate('/login');
    };

    const register = async (userData) => {
      try {
          const res = await api.post('/api/auth/register', userData);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          setToken(res.data.token);
          setUser(res.data.user);
          setAuthToken(res.data.token);
          return { success: true };
      } catch (err) {
          return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
      }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
