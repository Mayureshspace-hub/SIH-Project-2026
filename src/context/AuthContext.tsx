import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Farmer, Operator, Role } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  farmer: Farmer | null;
  operator: Operator | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password?: string; role?: Role }) => Promise<void>;
  loginWithGoogle: (role?: Role) => Promise<FirebaseUser>;
  quickLogin: (role: 'farmer' | 'operator' | 'admin') => Promise<void>;
  register: (farmerData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyFirebaseUser = (fbUser: FirebaseUser) => {
    const role: Role = (localStorage.getItem('kisan_role') as Role) || 'FARMER';
    const emailPrefix = fbUser.email?.split('@')[0] || 'User';
    const capitalizedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    const newUser: User = {
      id: fbUser.uid,
      name: fbUser.displayName || capitalizedName,
      email: fbUser.email || '',
      mobile: fbUser.phoneNumber || '+91 98000 00000',
      role: role,
    };
    setUser(newUser);

    if (role === 'FARMER') {
      setFarmer({
        id: 'farmer_' + fbUser.uid.slice(0, 8),
        userId: fbUser.uid,
        farmerId: 'MH-NAG-' + fbUser.uid.slice(0, 6).toUpperCase(),
        village: 'Sawangi',
        district: 'Nagpur',
        landArea: 5.0,
        preferredLanguage: 'mr',
        createdAt: new Date().toISOString(),
      });
      setOperator(null);
    } else if (role === 'OPERATOR') {
      setOperator({
        id: 'operator_' + fbUser.uid.slice(0, 8),
        userId: fbUser.uid,
        centreId: 'c_parseoni',
        badgeNo: 'REG-PRS-' + fbUser.uid.slice(0, 4).toUpperCase(),
        active: true,
        createdAt: new Date().toISOString(),
      });
      setFarmer(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && !fbUser.emailVerified) {
        setFirebaseUser(null);
        setUser(null);
        setFarmer(null);
        setOperator(null);
        setIsLoading(false);
        return;
      }

      setFirebaseUser(fbUser);
      if (fbUser) {
        applyFirebaseUser(fbUser);
        setIsLoading(false);
      } else {
        const token = getAuthToken();
        if (token) {
          try {
            const data = await api.getMe();
            setUser(data.user);
            setFarmer(data.farmer);
            setOperator(data.operator);
          } catch {
            removeAuthToken();
            setUser(null);
            setFarmer(null);
            setOperator(null);
          }
        } else {
          setUser(null);
          setFarmer(null);
          setOperator(null);
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      if (!auth.currentUser.emailVerified) {
        setUser(null);
        setFarmer(null);
        setOperator(null);
        setIsLoading(false);
        return;
      }
      applyFirebaseUser(auth.currentUser);
      setIsLoading(false);
      return;
    }

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
    } catch {
      removeAuthToken();
      setUser(null);
      setFarmer(null);
      setOperator(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password?: string; role?: Role }) => {
    setIsLoading(true);
    try {
      if (credentials.role) {
        localStorage.setItem('kisan_role', credentials.role);
      }
      // Firebase Email/Password Sign-In
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password || ''
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        const err: any = new Error('EMAIL_NOT_VERIFIED');
        err.code = 'auth/email-not-verified';
        throw err;
      }

      applyFirebaseUser(userCredential.user);

      // Attempt mock/backend token sync if matching account exists
      try {
        const data = await api.login(credentials);
        setAuthToken(data.token);
      } catch {
        // Safe to ignore backend mock sync error when authenticating purely via Firebase
      }
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
      email = 'admin@demo.Kisan Marg';
      password = 'Admin@123';
      roleEnum = 'ADMIN';
    }

    localStorage.setItem('kisan_role', roleEnum);

    try {
      const data = await api.login({ email, password, role: roleEnum });
      setAuthToken(data.token);
      setUser(data.user);
      setFarmer(data.farmer);
      setOperator(data.operator);
    } catch (err) {
      console.warn('Backend login fallback:', err);
    }
  };

  const register = async (farmerData: any) => {
    setIsLoading(true);
    try {
      localStorage.setItem('kisan_role', 'FARMER');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        farmerData.email,
        farmerData.password || ''
      );
      applyFirebaseUser(userCredential.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (role?: Role) => {
    setIsLoading(true);
    try {
      const selectedRole = role || (localStorage.getItem('kisan_role') as Role) || 'FARMER';
      localStorage.setItem('kisan_role', selectedRole);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      applyFirebaseUser(userCredential.user);
      return userCredential.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
    removeAuthToken();
    localStorage.removeItem('kisan_role');
    setUser(null);
    setFarmer(null);
    setOperator(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farmer,
        operator,
        firebaseUser,
        isAuthenticated: !!user || !!firebaseUser,
        isLoading,
        login,
        loginWithGoogle,
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
