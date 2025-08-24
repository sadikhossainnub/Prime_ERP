import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { BASE_URL } from '@/constants/config';
import { useColorScheme } from '@/hooks/useColorScheme'; // Import useColorScheme
import { setSid } from '@/services/api';
import { getCurrentUserInfo, UserProfile } from '@/services/profile';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Appearance, // Import Appearance
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../AuthContext';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { logout, user } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const colorScheme = useColorScheme(); // Get current color scheme
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(colorScheme === 'dark'); // State for dark mode toggle

  useEffect(() => {
    const BIOMETRIC_PREFERENCE_KEY = 'prime_erp_biometric_preference';

    const checkBiometricStatus = async () => {
      const biometricPreference = await SecureStore.getItemAsync(BIOMETRIC_PREFERENCE_KEY);
      setBiometricEnabled(biometricPreference === 'true');
    };
    checkBiometricStatus();

    // Load dark mode preference
    const loadDarkModePreference = async () => {
      const storedPreference = await SecureStore.getItemAsync(DARK_MODE_PREFERENCE_KEY);
      if (storedPreference !== null) {
        const isEnabled = storedPreference === 'true';
        setIsDarkModeEnabled(isEnabled);
        Appearance.setColorScheme(isEnabled ? 'dark' : 'light');
      } else {
        // If no preference is stored, set the switch to match the system theme
        setIsDarkModeEnabled(colorScheme === 'dark');
      }
    };
    loadDarkModePreference();
  }, [colorScheme]);

  const BIOMETRIC_PREFERENCE_KEY = 'prime_erp_biometric_preference';
  const DARK_MODE_PREFERENCE_KEY = 'prime_erp_dark_mode_preference'; // Define key for dark mode

  const handleBiometricToggle = async (value: boolean) => {
    setBiometricEnabled(value);
    if (value) {
      // User is enabling biometrics
      if (!user) {
        Alert.alert('Login Required', 'Please log in with your credentials first to enable biometric login.');
        setBiometricEnabled(false); // Revert switch state
        return;
      }
      // If user is logged in, SID is already in SecureStore via services/api.ts
      await SecureStore.setItemAsync(BIOMETRIC_PREFERENCE_KEY, 'true');
      Alert.alert('Biometric login enabled.');
    } else {
      // User is disabling biometrics
      await SecureStore.setItemAsync(BIOMETRIC_PREFERENCE_KEY, 'false'); // Store preference
      await setSid(null); // Clear SID from SecureStore to prevent automatic login
      Alert.alert('Biometric login disabled.');
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setIsDarkModeEnabled(value);
    const newColorScheme = value ? 'dark' : 'light';
    Appearance.setColorScheme(newColorScheme); // Set the color scheme
    await SecureStore.setItemAsync(DARK_MODE_PREFERENCE_KEY, String(value)); // Store preference
    Alert.alert('Theme Changed', `Dark mode is now ${value ? 'enabled' : 'disabled'}.`);
  };

 const fetchProfile = async () => {
    try {
      setError(null);
      console.log('Fetching profile data...');
      const profileData = await getCurrentUserInfo();
      console.log('Profile data received:', profileData);
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      const errorMessage = err.message || 'Failed to load profile data';
      setError(errorMessage);
      
      // Enhanced fallback to user data from AuthContext if API fails
      if (user) {
        console.log('Using fallback data from AuthContext:', user);
        setProfile({
          name: user.name || user.email || 'N/A',
          email: user.email || 'N/A',
          full_name: user.full_name || user.name || 'Unknown User',
          phone: user.phone || undefined,
          mobile_no: user.mobile_no || undefined,
          creation: user.creation || undefined,
          last_login: user.last_login || undefined,
          enabled: user.enabled !== undefined ? user.enabled : 1,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

   const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const themeColors = Colors[colorScheme ?? 'light'];

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        <ThemedText style={styles.loadingText}>Loading Profile...</ThemedText>
      </View>
    );
  }

  if (!profile && error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
        <Icon name="account-alert" size={64} color="#EF4444" />
        <ThemedText style={styles.errorText}>Failed to load profile</ThemedText>
        <ThemedText style={styles.errorSubText}>{error}</ThemedText>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: themeColors.tint }]} onPress={fetchProfile}>
          <ThemedText style={[styles.retryButtonText, { color: themeColors.background }]}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
        <View style={styles.avatarContainer}>
          {profile?.user_image ? (
            <Image
              source={{ uri: `${BASE_URL}${profile.user_image}` }}
              style={styles.avatar}
              onError={(error) => console.error('Image load error:', error)}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.icon }]}>
              <Icon name="account" size={48} color={themeColors.background} />
            </View>
          )}
        </View>
          <ThemedText type="title" style={styles.name}>
            {profile?.full_name || 'Unknown User'}
        </ThemedText>
        <ThemedText style={styles.email}>{profile?.email}</ThemedText>
        {profile?.role_profile_name && (
          <View style={[styles.roleBadge, { backgroundColor: themeColors.tint }]}>
            <ThemedText style={[styles.roleText, { color: themeColors.background }]}>
              {profile.role_profile_name}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Profile Information Cards */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Personal Information
        </ThemedText>
        
        <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
          <View style={styles.infoRow}>
            <Icon name="account-outline" size={20} color={themeColors.icon} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
              <ThemedText style={styles.infoValue}>
                {profile?.full_name || 'N/A'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
          <View style={styles.infoRow}>
            <Icon name="email-outline" size={20} color={themeColors.icon} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>
                {profile?.email || 'N/A'}
              </ThemedText>
            </View>
          </View>
        </View>

        {profile?.phone && (
          <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
            <View style={styles.infoRow}>
              <Icon name="phone-outline" size={20} color={themeColors.icon} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Phone</ThemedText>
                <ThemedText style={styles.infoValue}>{profile.phone}</ThemedText>
              </View>
            </View>
          </View>
        )}

        {profile?.mobile_no && (
          <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
            <View style={styles.infoRow}>
              <Icon name="cellphone" size={20} color={themeColors.icon} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Mobile</ThemedText>
                <ThemedText style={styles.infoValue}>{profile.mobile_no}</ThemedText>
              </View>
            </View>
          </View>
        )}

        {profile?.location && (
          <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
            <View style={styles.infoRow}>
              <Icon name="map-marker-outline" size={20} color={themeColors.icon} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Location</ThemedText>
                <ThemedText style={styles.infoValue}>{profile.location}</ThemedText>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Account Information
        </ThemedText>
        
        <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={20} color={themeColors.icon} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Member Since</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(profile?.creation)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
          <View style={styles.infoRow}>
            <Icon name="login" size={20} color={themeColors.icon} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Last Login</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(profile?.last_login)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
          <View style={styles.infoRow}>
            <Icon 
              name={profile?.enabled ? "check-circle-outline" : "close-circle-outline"} 
              size={20} 
              color={profile?.enabled ? "#10b981" : "#ef4444"} 
            />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Account Status</ThemedText>
              <ThemedText style={[
                styles.infoValue,
                { color: profile?.enabled ? "#10b981" : "#ef4444" }
              ]}>
                {profile?.enabled ? 'Active' : 'Inactive'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Security
        </ThemedText>
        <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
          <View style={styles.infoRow}>
            <Icon name="fingerprint" size={20} color={themeColors.icon} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Biometric Login</ThemedText>
              <ThemedText style={styles.infoValue}>
                Enable or disable biometric login
              </ThemedText>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#767577', true: themeColors.tint }}
              thumbColor={biometricEnabled ? themeColors.tint : '#E0E0E0'}
            />
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Appearance
        </ThemedText>
        <View style={[styles.card, { backgroundColor: themeColors.background, shadowColor: themeColors.text }]}>
          <View style={styles.infoRow}>
            <Icon name="theme-light-dark" size={20} color={themeColors.icon} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Dark Mode</ThemedText>
              <ThemedText style={styles.infoValue}>
                Toggle dark mode on or off
              </ThemedText>
            </View>
            <Switch
              value={isDarkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#767577', true: themeColors.tint }}
              thumbColor={isDarkModeEnabled ? themeColors.tint : '#E0E0E0'}
            />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#FFFFFF" />
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  errorSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#EF4444', // Red for logout
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
