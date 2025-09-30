import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier
} from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

// Store user session
const storeUserSession = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

// Get user session
export const getUserSession = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

// Clear user session
const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

// Register a new user
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Login with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Store user data in AsyncStorage
    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      emailVerified: userCredential.user.emailVerified,
    };
    
    await storeUserSession(userData);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Setup 2FA with phone number
let recaptchaVerifierInstance;

const ensureRecaptchaVerifier = () => {
  // Web-only: Firebase Web SDK requires reCAPTCHA for phone auth
  if (Platform.OS !== 'web') return undefined;
  if (recaptchaVerifierInstance) return recaptchaVerifierInstance;
  const containerId = 'recaptcha-container-2fa';
  if (typeof document !== 'undefined' && !document.getElementById(containerId)) {
    const div = document.createElement('div');
    div.id = containerId;
    div.style.display = 'none';
    document.body.appendChild(div);
  }
  // v9 signature: new RecaptchaVerifier(auth, containerId, params)
  recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  return recaptchaVerifierInstance;
};

// Step 1: send SMS for 2FA enrollment, returns verificationId
export const sendTwoFactorCode = async (phoneNumber) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const session = await multiFactor(user).getSession();
    const phoneInfoOptions = { phoneNumber, session };
    const verifier = ensureRecaptchaVerifier();
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, verifier);
    return verificationId;
  } catch (error) {
    throw error;
  }
};

// Step 2: enroll second factor using received SMS code and verificationId
export const enrollTwoFactor = async (verificationId, verificationCode, displayName = 'Phone Number') => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const assertion = PhoneMultiFactorGenerator.assertion(cred);
    await multiFactor(user).enroll(assertion, displayName);
    return true;
  } catch (error) {
    throw error;
  }
};

// Send SMS code during 2FA sign-in challenge
export const sendSignInTwoFactorCode = async (resolver) => {
  try {
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verifier = ensureRecaptchaVerifier();
    // For native Expo (Platform !== 'web'), Firebase Web SDK phone auth is unsupported
    if (Platform.OS !== 'web') {
      throw Object.assign(new Error('SMS MFA sign-in requires web (Expo Web) with reCAPTCHA. Use TOTP or disable MFA for native Expo.'), { code: 'unsupported-platform' });
    }
    const verificationId = await phoneAuthProvider.verifyPhoneNumber({
      multiFactorHint: resolver.hints[0],
      session: resolver.session,
    }, verifier);
    return verificationId;
  } catch (error) {
    throw error;
  }
};

// Handle 2FA login
export const handleMultiFactorAuth = async (resolver, verificationId, verificationCode) => {
  try {
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const assertion = PhoneMultiFactorGenerator.assertion(cred);
    const userCredential = await resolver.resolveSignIn(assertion);

    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      emailVerified: userCredential.user.emailVerified,
    };
    await storeUserSession(userData);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    await clearUserSession();
    return true;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};