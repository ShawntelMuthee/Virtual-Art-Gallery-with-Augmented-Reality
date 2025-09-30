import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { logout as logoutAction } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [isArtistMode, setIsArtistMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { logout, send2FACode, enroll2FA } = useAuth();
  const authUser = useSelector((state) => state.auth.user);

  // Derived user data from Redux auth state
  const userData = {
    name: authUser?.full_name || 'User',
    username: authUser ? `@${(authUser.full_name || 'user').toLowerCase().replace(/\s+/g, '')}` : '@user',
    email: authUser?.email || '',
    avatar: 'https://via.placeholder.com/120',
    bio: 'Art enthusiast from Nairobi. Love collecting contemporary African art.',
    following: 124,
    followers: 89,
    artworksLiked: 234,
    artworksOwned: 12,
    joinDate: authUser?.created_at ? new Date(authUser.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : '—',
  };

  // Mock artist data
  const artistData = {
    artworksUploaded: 18,
    totalViews: 2345,
    totalLikes: 567,
    salesThisMonth: 3,
    revenue: 'KSh 45,000',
  };

  const menuItems = [
    { 
      id: '1', 
      title: 'My Collections', 
      icon: 'heart-outline', 
      color: '#FF6B6B',
      action: () => console.log('My Collections')
    },
    { 
      id: '2', 
      title: 'Purchase History', 
      icon: 'receipt-outline', 
      color: '#4ECDC4',
      action: () => console.log('Purchase History')
    },
    { 
      id: '3', 
      title: 'Saved Searches', 
      icon: 'bookmark-outline', 
      color: '#45B7D1',
      action: () => console.log('Saved Searches')
    },
    { 
      id: '4', 
      title: 'Privacy Settings', 
      icon: 'shield-outline', 
      color: '#96CEB4',
      action: () => console.log('Privacy Settings')
    },
    { 
      id: '5', 
      title: 'Help & Support', 
      icon: 'help-circle-outline', 
      color: '#FECA57',
      action: () => console.log('Help & Support')
    },
  ];

  const artistMenuItems = [
    { 
      id: '1', 
      title: 'Upload New Art', 
      icon: 'add-circle-outline', 
      color: '#FF6B6B',
      action: () => console.log('Upload Art')
    },
    { 
      id: '2', 
      title: 'My Artworks', 
      icon: 'images-outline', 
      color: '#4ECDC4',
      action: () => console.log('My Artworks')
    },
    { 
      id: '3', 
      title: 'Analytics', 
      icon: 'bar-chart-outline', 
      color: '#45B7D1',
      action: () => console.log('Analytics')
    },
    { 
      id: '4', 
      title: 'Sales & Orders', 
      icon: 'card-outline', 
      color: '#96CEB4',
      action: () => console.log('Sales & Orders')
    },
    { 
      id: '5', 
      title: 'Artist Profile', 
      icon: 'person-circle-outline', 
      color: '#FECA57',
      action: () => console.log('Artist Profile')
    },
  ];

  const StatCard = ({ title, value, change, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {change && (
        <Text style={[styles.statChange, { color: change.includes('+') ? '#4ECDC4' : '#FF6B6B' }]}>
          {change}
        </Text>
      )}
    </View>
  );

  // SMS MFA enrollment state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [enablingMfa, setEnablingMfa] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [mfaStatus, setMfaStatus] = useState('');

  useEffect(() => {
    let t;
    if (resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendMfaCode = async () => {
    const e164 = /^\+[1-9]\d{1,14}$/;
    if (!e164.test(phoneNumber)) {
      Alert.alert('Invalid Phone', 'Use E.164 format, e.g. +254712345678');
      return;
    }
    if (resendCooldown > 0) return;
    setSendingCode(true);
    setMfaStatus('');
    try {
      const id = await send2FACode(phoneNumber);
      setVerificationId(id);
      setResendCooldown(60);
      setMfaStatus('Code sent. Check SMS and enter the code below.');
    } catch (err) {
      setMfaStatus(err?.message || 'Failed to send code');
      if (String(err?.code).includes('too-many-requests')) setResendCooldown(90);
    } finally {
      setSendingCode(false);
    }
  };

  const enableMfa = async () => {
    if (!verificationId) {
      Alert.alert('Missing Step', 'Send the verification code first');
      return;
    }
    if (!verificationCode.trim()) {
      Alert.alert('Missing Code', 'Enter the SMS verification code');
      return;
    }
    setEnablingMfa(true);
    setMfaStatus('');
    try {
      await enroll2FA(verificationId, verificationCode, 'Phone');
      setMfaStatus('Two-factor authentication enabled successfully.');
      setVerificationCode('');
    } catch (err) {
      setMfaStatus(err?.message || 'Failed to enable 2FA');
    } finally {
      setEnablingMfa(false);
    }
  };

  const MenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.action}>
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background, paddingTop: 35 }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBackground} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userHandle}>{userData.username}</Text>
          <Text style={styles.userBio}>{userData.bio}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.artworksLiked}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.artworksOwned}</Text>
              <Text style={styles.statLabel}>Owned</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Artist Mode Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Artist Mode</Text>
              <Text style={styles.toggleSubtitle}>
                Switch to artist dashboard to manage your artworks
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#E9ECEF', true: '#FFE8E8' }}
              thumbColor={isArtistMode ? '#000080' : '#FFFFFF'}
              value={isArtistMode}
              onValueChange={setIsArtistMode}
            />
          </View>
        </View>
        
        {/* Dark Mode Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Dark Mode</Text>
              <Text style={styles.toggleSubtitle}>
                Switch to dark theme for better viewing at night
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#E9ECEF', true: '#E0E0FF' }}
              thumbColor={isDarkMode ? '#000080' : '#FFFFFF'}
              value={isDarkMode}
              onValueChange={toggleTheme}
            />
          </View>
        </View>

        {/* Artist Dashboard Stats */}
        {isArtistMode && (
          <View style={styles.artistStats}>
            <Text style={styles.sectionTitle}>Artist Dashboard</Text>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Artworks" 
                value={artistData.artworksUploaded} 
                change="+2 this week"
                color="#FF6B6B"
              />
              <StatCard 
                title="Total Views" 
                value={`${artistData.totalViews}`} 
                change="+12%"
                color="#4ECDC4"
              />
              <StatCard 
                title="Total Likes" 
                value={artistData.totalLikes} 
                change="+8%"
                color="#45B7D1"
              />
              <StatCard 
                title="Revenue" 
                value={artistData.revenue}
                change="+KSh 15,000"
                color="#96CEB4"
              />
            </View>

            {/* Quick Actions for Artists */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>Upload Art</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionButton}>
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="bar-chart" size={20} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>Analytics</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>
            {isArtistMode ? 'Artist Tools' : 'Account'}
          </Text>
          {(isArtistMode ? artistMenuItems : menuItems).map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: '#4ECDC415' }]}>
                <Ionicons name="notifications-outline" size={20} color="#4ECDC4" />
              </View>
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#E9ECEF', true: '#4ECDC425' }}
              thumbColor={notificationsEnabled ? '#4ECDC4' : '#FFFFFF'}
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: '#45B7D115' }]}>
                <Ionicons name="language-outline" size={20} color="#45B7D1" />
              </View>
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: '#96CEB415' }]}>
                <Ionicons name="moon-outline" size={20} color="#96CEB4" />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Off</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Two-Factor Authentication (SMS) */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          <View style={styles.mfaBox}>
            <Text style={styles.mfaDescription}>
              Add a phone number to receive SMS codes when signing in.
            </Text>

            <View style={styles.mfaInputRow}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.mfaIcon} />
              <TextInput
                style={styles.mfaInput}
                placeholder="Phone (e.g. +254712345678)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.mfaButton, (sendingCode || resendCooldown > 0) && styles.mfaButtonDisabled]}
              onPress={sendMfaCode}
              disabled={sendingCode || resendCooldown > 0}
            >
              <Text style={styles.mfaButtonText}>
                {sendingCode ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Send Code'}
              </Text>
            </TouchableOpacity>

            <View style={styles.mfaInputRow}>
              <Ionicons name="key-outline" size={20} color="#666" style={styles.mfaIcon} />
              <TextInput
                style={styles.mfaInput}
                placeholder="SMS Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.mfaButton, enablingMfa && styles.mfaButtonDisabled]}
              onPress={enableMfa}
              disabled={enablingMfa}
            >
              <Text style={styles.mfaButtonText}>
                {enablingMfa ? 'Enabling…' : 'Enable 2FA'}
              </Text>
            </TouchableOpacity>

            {!!mfaStatus && (
              <Text style={styles.mfaStatus}>{mfaStatus}</Text>
            )}
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.footerButton, styles.signOutButton]}
            onPress={async () => {
              try {
                await logout();
              } catch {}
              dispatch(logoutAction());
            }}
          >
            <Text style={[styles.footerButtonText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>ArtKenya v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ in Kenya</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  editProfileButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 25,
  },
  editProfileText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  toggleSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  artistStats: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  footerActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  footerButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  footerButtonText: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 30,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 11,
    color: '#999',
  },
  mfaBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  mfaDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  mfaInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  mfaIcon: {
    marginRight: 8,
  },
  mfaInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  mfaButton: {
    backgroundColor: '#000080',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  mfaButtonDisabled: {
    opacity: 0.6,
  },
  mfaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mfaStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
});