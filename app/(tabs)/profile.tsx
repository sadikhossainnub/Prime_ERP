import { useAuth } from '@/app/contexts/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { getUserProfile, UserProfile } from '@/services/profile';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { logout, user } = useAuth();

  const fetchProfile = async () => {
    try {
      setError(null);
      console.log('Fetching profile data...');
      console.log('Current user from auth context:', user);
      
      const profileData = await getUserProfile();
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <ThemedText style={styles.loadingText}>Loading Profile...</ThemedText>
      </View>
    );
  }

  if (!profile && error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="account-alert" size={64} color="#ef4444" />
        <ThemedText style={styles.errorText}>Failed to load profile</ThemedText>
        <ThemedText style={styles.errorSubText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.image ? (
            <Image source={{ uri: profile.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={48} color="#6b7280" />
            </View>
          )}
        </View>
        <ThemedText type="title" style={styles.name}>
          {profile?.full_name || 'Unknown User'}
        </ThemedText>
        <ThemedText style={styles.email}>{profile?.email}</ThemedText>
        {profile?.role_profile_name && (
          <View style={styles.roleBadge}>
            <ThemedText style={styles.roleText}>
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
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="account-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
              <ThemedText style={styles.infoValue}>
                {profile?.full_name || 'N/A'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="email-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>
                {profile?.email || 'N/A'}
              </ThemedText>
            </View>
          </View>
        </View>

        {profile?.phone && (
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Icon name="phone-outline" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Phone</ThemedText>
                <ThemedText style={styles.infoValue}>{profile.phone}</ThemedText>
              </View>
            </View>
          </View>
        )}

        {profile?.mobile_no && (
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Icon name="cellphone" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Mobile</ThemedText>
                <ThemedText style={styles.infoValue}>{profile.mobile_no}</ThemedText>
              </View>
            </View>
          </View>
        )}

        {profile?.location && (
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Icon name="map-marker-outline" size={20} color="#6b7280" />
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
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Member Since</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(profile?.creation)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Icon name="login" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Last Login</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(profile?.last_login)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
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

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#ffffff" />
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
    backgroundColor: '#f9fafb',
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
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
  },
  errorSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: '#f3f4f6',
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
    color: '#6b7280',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
