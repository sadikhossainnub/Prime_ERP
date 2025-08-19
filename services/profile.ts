import { BASE_URL } from '@/constants/config';
import { getAuthHeaders } from './authHeaders';

const API_URL = BASE_URL;

export interface UserProfile {
  name: string;
  email: string;
  full_name: string;
  phone?: string;
  mobile_no?: string;
  location?: string;
  bio?: string;
  image?: string;
  role_profile_name?: string;
  creation?: string;
  last_login?: string;
  enabled?: number;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/method/frappe.auth.get_logged_user`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', errorText);
      throw new Error(`Failed to fetch current user info: HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data.message || data;
  } catch (error) {
    console.error('Error fetching current user info:', error);
    // Fallback for API token authentication
    return {
      name: 'API User',
      email: 'api@system.local',
      full_name: 'API Token User',
    };
  }
};

export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const headers = await getAuthHeaders();

  // For API token authentication, we'll use a generic approach
  const response = await fetch(`${API_URL}/api/resource/User`, {
    method: 'POST',
    headers,
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }

  const data = await response.json();
  return data.data;
};

export const getCurrentUserInfo = async (): Promise<UserProfile> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/method/frappe.auth.get_logged_user`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current user info: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.message || data;
  } catch (error) {
    console.error('Error fetching current user info:', error);
    // Fallback for API token authentication
    return {
      name: 'user.name',
      email: 'user.emil',
      full_name: 'user.full_name',
    };
  }
};
