import { API_KEY, API_SECRET, BASE_URL } from '@/constants/config';
import { getSession } from './auth';

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
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // Try multiple endpoints for better compatibility
  const endpoints = [
    '/api/method/frappe.auth.get_logged_user',
    '/api/method/frappe.core.doctype.user.user.get_user_info',
    `/api/resource/User/${session.name || session.email}`
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Cookie': `sid=${session.sid}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        if (endpoint.includes('/resource/User/')) {
          return data.data;
        } else {
          return data.message || data;
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`Failed to fetch from ${endpoint}:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // If all endpoints fail, return session data as fallback
  if (session) {
    return {
      name: session.name || session.email,
      email: session.email,
      full_name: session.full_name || session.name || 'Unknown User',
    };
  }

  throw lastError || new Error('Failed to fetch user profile from all endpoints');
};

export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const userName = session.name || session.email;
  const response = await fetch(`${API_URL}/api/resource/User/${userName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${API_KEY}:${API_SECRET}`,
      'Cookie': `sid=${session.sid}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }

  const data = await response.json();
  return data.data;
};

export const getCurrentUserInfo = async (): Promise<UserProfile> => {
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_URL}/api/method/frappe.auth.get_logged_user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Cookie': `sid=${session.sid}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current user info: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.message || data;
  } catch (error) {
    console.error('Error fetching current user info:', error);
    // Fallback to session data
    return {
      name: session.name || session.email,
      email: session.email,
      full_name: session.full_name || session.name || 'Unknown User',
    };
  }
};