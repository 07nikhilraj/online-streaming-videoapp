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

  axios.defaults.baseURL = 'http://localhost:5000';

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const loadUser = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Decode JWT to get user info
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role,
            organizationId: payload.organizationId, // Added organizationId from JWT
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

  // UPDATED: Added organizationId parameter
  const register = async (email, password, role = 'viewer', organizationId) => {
    try {
      const res = await axios.post('/api/auth/register', { 
        email, 
        password, 
        role, 
        organizationId // Now sending orgId to backend
      });
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