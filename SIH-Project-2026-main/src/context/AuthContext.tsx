import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Farmer, Operator, Role } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

let googleRedirectResultPromise: ReturnType<typeof getRedirectResult> | undefined;

interface AuthContextType {
  user: User | null;
  farmer: Farmer | null;
  operator: Operator | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password?: string; role?: Role }) => Promise<void>;
  loginWithGoogle: (role?: Role) => Promise<FirebaseUser | null>;
  quickLogin: (role: 'farmer' | 'operator' | 'admin') => Promise<void>;
  register: (farmerData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyFirebaseUser = (fbUser: FirebaseUser) => {
    const role: Role = 'FARMER';
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
        try {
          const profile = await api.syncFarmerProfile({ name: fbUser.displayName || undefined });
          setFarmer(profile.farmer);
        } catch (error) {
          console.error('Could not synchronize farmer profile:', error);
        }
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

  // Complete popup fallback sign-ins after Firebase returns to this page.
  useEffect(() => {
    let active = true;
    googleRedirectResultPromise ||= getRedirectResult(auth);
    googleRedirectResultPromise
      .then(async (result) => {
        if (!result || !active) return;
        localStorage.setItem('kisan_role', 'FARMER');
        try {
          const profile = await api.syncFarmerProfile({ name: result.user.displayName || undefined });
          if (active) setFarmer(profile.farmer);
        } catch (error) {
          console.error('Google sign-in completed, but farmer profile sync failed:', error);
        }
        if (active) navigate('/farmer/dashboard', { replace: true });
      })
      .catch((error) => console.error('Could not complete Google sign-in redirect:', error));
    return () => { active = false; };
  }, [navigate]);
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
      const profile = await api.syncFarmerProfile({ name: auth.currentUser.displayName || undefined });
      setFarmer(profile.farmer);
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
      if (credentials.role === 'OPERATOR' || credentials.role === 'ADMIN') {
        removeAuthToken();
        await signOut(auth);
        setFirebaseUser(null);
        const data = await api.login(credentials);
        setAuthToken(data.token);
        setUser(data.user);
        setFarmer(data.farmer || null);
        setOperator(data.operator || null);
        return;
      }

      // Firebase Email/Password Sign-In for farmers.
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
      const profile = await api.syncFarmerProfile({ name: userCredential.user.displayName || undefined });
      setFarmer(profile.farmer);
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

    if (role !== 'farmer') {
      removeAuthToken();
      await signOut(auth);
      setFirebaseUser(null);
      const data = await api.login({ email, password, role: roleEnum });
      setAuthToken(data.token);
      setUser(data.user);
      setFarmer(data.farmer || null);
      setOperator(data.operator || null);
      return;
    }

    try {
      // Try logging into Firebase with demo credentials
      await signInWithEmailAndPassword(auth, email, password);
      const profile = await api.syncFarmerProfile();
      setFarmer(profile.farmer);
    } catch {
      // If demo user hasn't been created in Firebase yet, create it or use backend session
      try {
        const created = await createUserWithEmailAndPassword(auth, email, password);
        const profile = await api.syncFarmerProfile({ name: created.user.displayName || undefined });
        setFarmer(profile.farmer);
      } catch {
        // Fallback to backend login directly
        const data = await api.login({ email, password, role: roleEnum });
        setAuthToken(data.token);
        setUser(data.user);
        setFarmer(data.farmer);
        setOperator(data.operator);
      }
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
      const profile = await api.syncFarmerProfile({
        name: farmerData.name,
        mobile: farmerData.mobile,
        village: farmerData.village,
        district: farmerData.district,
        landArea: farmerData.landArea,
        preferredLanguage: farmerData.preferredLanguage,
      });
      setFarmer(profile.farmer);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (role?: Role): Promise<FirebaseUser | null> => {
    setIsLoading(true);
    try {
      const selectedRole = role || (localStorage.getItem('kisan_role') as Role) || 'FARMER';
      if (selectedRole !== 'FARMER') throw new Error('Google sign-in is available for farmer accounts only.');
      localStorage.setItem('kisan_role', selectedRole);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, provider);
      } catch (error: any) {
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(error?.code)) {
          await signInWithRedirect(auth, provider);
          return null;
        }
        throw error;
      }

      applyFirebaseUser(userCredential.user);
      // Firebase sign-in has succeeded. A transient profile-sync problem should
      // not make the farmer repeat OAuth; auth-state sync will retry as well.
      try {
        const profile = await api.syncFarmerProfile({ name: userCredential.user.displayName || undefined });
        setFarmer(profile.farmer);
      } catch (error) {
        console.error('Google sign-in succeeded, but farmer profile sync failed:', error);
      }
      return userCredential.user;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    removeAuthToken();
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
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
