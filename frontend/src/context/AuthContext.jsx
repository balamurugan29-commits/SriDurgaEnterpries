import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sri_durga_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (userId, password) => {
    const data = await loginApi(userId, password);
    setUser(data);
    localStorage.setItem('sri_durga_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sri_durga_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
