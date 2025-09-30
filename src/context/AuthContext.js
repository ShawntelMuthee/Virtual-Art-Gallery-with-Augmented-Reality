import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { handleMultiFactorAuth, sendTwoFactorCode, enrollTwoFactor, sendSignInTwoFactorCode } from '../services/authService';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [multiFactorResolver, setMultiFactorResolver] = useState(null);
  const [mfaVerificationId, setMfaVerificationId] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Register a new user
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      // Send email verification
      try {
        await sendEmailVerification(userCredential.user);
      } catch (e) {
        console.warn('Failed to send verification email:', e);
      }
      
      return userCredential;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      if (error.code === 'auth/multi-factor-auth-required') {
        // Handle multi-factor authentication
        setMultiFactorResolver(error.resolver);
        try {
          const id = await sendSignInTwoFactorCode(error.resolver);
          setMfaVerificationId(id);
        } catch (e) {
          console.warn('Failed to send 2FA sign-in code:', e);
        }
        return { multiFactorRequired: true, resolver: error.resolver };
      }
      setError(error.message);
      throw error;
    }
  };

  // Complete 2FA verification
  const completeMultiFactorAuth = async (verificationCode) => {
    setError(null);
    try {
      if (!multiFactorResolver) {
        throw new Error('No multi-factor resolver available');
      }
      if (!mfaVerificationId) {
        throw new Error('No verification ID available. Try resending code.');
      }
      const user = await handleMultiFactorAuth(multiFactorResolver, mfaVerificationId, verificationCode);
      setCurrentUser(user);
      setMultiFactorResolver(null);
      setMfaVerificationId(null);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Send SMS code for 2FA enrollment
  const send2FACode = async (phoneNumber) => {
    setError(null);
    try {
      const verificationId = await sendTwoFactorCode(phoneNumber);
      return verificationId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Enroll phone as second factor
  const enroll2FA = async (verificationId, verificationCode, displayName) => {
    setError(null);
    try {
      await enrollTwoFactor(verificationId, verificationCode, displayName);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout the current user
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const forgotPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Send verification email to current user
  const sendVerificationEmail = async () => {
    setError(null);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    multiFactorResolver,
    signup,
    register: signup,
    login,
    logout,
    forgotPassword,
    resetPassword: forgotPassword,
    sendVerificationEmail,
    send2FACode,
    enroll2FA,
    completeMultiFactorAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};