import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Farmer, Operator, Role } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  farmer: Farmer | null;
  operator: Operator | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password?: string; role?: Role }) => Promise<void>;
  quickLogin: (role: 'farmer' | 'operator' | 'admin') => Promise<void>;
  register: (farmerData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setFarmer(null);
      setOperator(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setFarmer(data.farmer);
      setOperator(data.operator);
    } catch (err) {
      console.warn('Session expired or invalid token');
      removeAuthToken();
      setUser(null);
      setFarmer(null);
      setOperator(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password?: string; role?: Role }) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      setAuthToken(data.token);
      setUser(data.user);
      setFarmer(data.farmer);
      setOperator(data.operator);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: 'farmer' | 'operator' | 'admin') => {
    let email = 'farmer@demo.com';
    let password = 'Farmer@123';
    let roleEnum: Role = 'FARMER';

    if (role === 'operator') {
      email = 'operator@parseoni.demo';
      password = 'Operator@123';
      roleEnum = 'OPERATOR';
    } else if (role === 'admin') {
      email = 'admin@demo.kisansetu';
      password = 'Admin@123';
      roleEnum = 'ADMIN';
    }

    await login({ email, password, role: roleEnum });
  };

  const register = async (farmerData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(farmerData);
      setAuthToken(data.token);
      setUser(data.user);
      setFarmer(data.farmer);
      setOperator(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setFarmer(null);
    setOperator(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farmer,
        operator,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
