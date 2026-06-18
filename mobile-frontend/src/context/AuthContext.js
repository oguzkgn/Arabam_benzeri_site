import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedUser = await SecureStore.getItemAsync('user');
        const token = await SecureStore.getItemAsync('token');
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, sifre) => {
    const res = await authApi.login({ email, sifre });
    await SecureStore.setItemAsync('token', res.data.token);
    await SecureStore.setItemAsync('user', JSON.stringify(res.data.kullanici));
    setUser(res.data.kullanici);
    return res.data;
  };

  const register = async (adSoyad, email, sifre) => {
    return authApi.register({ adSoyad, email, sifre });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  const updateUser = async (data) => {
    setUser(data);
    await SecureStore.setItemAsync('user', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
