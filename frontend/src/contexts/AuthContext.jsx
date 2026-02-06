// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set base URL once
  axios.defaults.baseURL = 'http://localhost:5000';

  // Attach token to EVERY request via interceptor (most reliable way)
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
          console.log('Axios request with token:', currentToken.substring(0, 10) + '...'); // debug (remove later)
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []); // runs once on mount

  // Load initial user state on token change
useEffect(() => {
  const loadUser = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // Decode JWT to get user info (no backend call needed for now)
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({
          id: payload.id,
          email: payload.email,
          role: payload.role,
        });
        setToken(storedToken);
      } catch (err) {
        console.error('Invalid token on load', err);
        logout();
      }
    }
    setLoading(false);
  };

  loadUser();
}, []); 

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      navigate('/dashboard');
    } catch (err) {
      throw err.response?.data?.message || 'Login failed';
    }
  };

  const register = async (email, password, role = 'viewer') => {
    try {
      const res = await axios.post('/api/auth/register', { email, password, role });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      navigate('/dashboard');
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);