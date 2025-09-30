import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createUserProfile } from '../../services/firestoreSetup';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const dispatch = useDispatch();
  
  // Get auth context
  const { login, completeMultiFactorAuth, error, multiFactorResolver, sendVerificationEmail, logout } = useAuth();
  
  // Watch for multi-factor auth requirement
  useEffect(() => {
    if (multiFactorResolver) {
      setShowTwoFactorAuth(true);
    }
  }, [multiFactorResolver]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      // Attempt to login with Firebase
      const result = await login(email, password);

      // If login successful, ensure email is verified before proceeding
      if (result && result.user && !result.user.emailVerified) {
        try {
          await sendVerificationEmail();
        } catch {}
        Alert.alert(
          'Email Verification Required',
          'We have sent a verification link to your email. Please verify your email, then sign in again.',
          [{ text: 'OK' }]
        );
        // Sign out to prevent partial session
        try { await logout(); } catch {}
        setIsLoading(false);
        return;
      }

      // If login successful and email verified, attempt Firestore sync but do not block navigation on permission errors
      if (result && result.user) {
        const uid = result.user.uid;
        let profile = {
          full_name: result.user.displayName || '',
          role: 'user',
        };

        try {
          const userDocRef = doc(db, 'users', uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            try {
              await createUserProfile({
                uid,
                email: result.user.email,
                full_name: profile.full_name,
                role: profile.role,
              });
            } catch (writeErr) {
              console.warn('Firestore write error (non-blocking):', writeErr);
            }
          }

          if (userDoc.exists()) {
            profile = { ...profile, ...userDoc.data() };
          }
        } catch (readErr) {
          console.warn('Firestore read error (non-blocking):', readErr);
        }

        dispatch(loginSuccess({
          user: {
            id: uid,
            email: result.user.email,
            full_name: profile.full_name || '',
            role: profile.role || 'user',
            created_at: result.user.metadata?.creationTime,
          },
        }));
      }
      
      if (result && result.multiFactorRequired) {
        // If 2FA is required, the UI will update via the useEffect
        setIsLoading(false);
        return;
      }
      
      // Login success handling is now done above
    } catch (error) {
      Alert.alert('Login Error', error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      // Complete multi-factor authentication
      const result = await completeMultiFactorAuth(verificationCode);
      
      if (result) {
        // Dispatch login success with user data
        dispatch(loginSuccess({
          user: {
            id: result.uid,
            email: result.email,
            full_name: result.displayName || 'User',
            role: 'user',
            created_at: result.metadata?.creationTime || new Date().toISOString(),
          }
        }));
      }
    } catch (error) {
      Alert.alert('Verification Error', error.message || 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {showTwoFactorAuth ? 'Two-Factor Authentication' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {showTwoFactorAuth 
              ? 'Enter the verification code sent to your phone'
              : 'Sign in to continue to Art Gallery'}
          </Text>
        </View>

        {!showTwoFactorAuth ? (
          // Regular login form
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // 2FA verification form
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={22} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Verification Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0cdf3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  signUpText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;