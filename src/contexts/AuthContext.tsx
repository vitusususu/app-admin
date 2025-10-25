'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../lib/firebase'; // Import db from firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import firestore functions

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loading: boolean;
  isStoreAdmin: boolean;
  storeId: string | null;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStoreAdmin, setIsStoreAdmin] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'STORE_ADMIN' && userData.storeId) {
            setUser(user);
            setIsStoreAdmin(true);
            setStoreId(userData.storeId);
          } else {
            // Not a store admin or no storeId, so log out
            await signOut(auth);
            setUser(null);
            setIsStoreAdmin(false);
            setStoreId(null);
          }
        } else {
          // User doc doesn't exist, log out
          await signOut(auth);
          setUser(null);
          setIsStoreAdmin(false);
          setStoreId(null);
        }
      } else {
        setUser(null);
        setIsStoreAdmin(false);
        setStoreId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const register = async (email: string, password: string) => {
    // This might not be needed for the admin app, but keeping it for now
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isStoreAdmin,
    storeId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
