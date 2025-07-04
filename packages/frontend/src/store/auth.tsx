import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create a mock auth object for development
  auth = null;
}

// User type
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'student_pilot' | 'ppl_pilot' | 'flight_instructor' | 'base_manager' | 'super_admin';
  status: 'pending' | 'active' | 'suspended' | 'verified';
  isFullyVerified: boolean;
  hasPPL: boolean;
  creditedHours: number;
  totalFlightHours: number;
  baseId?: string;
  firebaseUid: string;
  createdAt: string;
  updatedAt: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch user data from API
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('AuthContext - Fetched user data from Firebase:', userData);
        return userData;
      }
      console.log('AuthContext - Failed to fetch user data from Firebase:', response.status);
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Fetch user data from backend using JWT token
  const fetchUserDataFromJWT = async (): Promise<User | null> => {
    try {
      const jwtToken = localStorage.getItem('access_token');
      if (!jwtToken) {
        console.log('AuthContext - No JWT token found');
        return null;
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('AuthContext - Fetched user data from JWT:', userData);
        return userData;
      } else {
        console.log('AuthContext - JWT token invalid, removing from storage');
        // JWT token is invalid, remove it
        localStorage.removeItem('access_token');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data from JWT:', error);
      localStorage.removeItem('access_token');
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign out
  const signOutUser = async () => {
    // Clear JWT token
    localStorage.removeItem('access_token');
    
    if (!auth) {
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await fetchUserData(firebaseUser);
      setUser(userData);
    }
  };

  // Create temporary user immediately for testing
  useEffect(() => {
    console.log('AuthContext - Creating temporary user for testing');
    const tempUser: User = {
      id: 'temp-user-' + Date.now(),
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'student_pilot',
      status: 'pending',
      isFullyVerified: false,
      hasPPL: false,
      creditedHours: 0,
      totalFlightHours: 0,
      firebaseUid: 'temp-firebase-uid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(tempUser);
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signInWithGoogle,
    signOut: signOutUser,
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 