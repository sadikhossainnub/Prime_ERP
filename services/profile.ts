import { BASE_URL } from '@/constants/config';
import api from './api';

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
  user_image?: string;
  role_profile_name?: string;
  creation?: string;
  last_login?: string;
  enabled?: number;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const loggedUser = await api.get('/api/method/frappe.auth.get_logged_user');
    const username = loggedUser.data.message; // Assuming this returns the username/email

    if (!username) {
      throw new Error('Logged in user email not found.');
    }

    // Now fetch the full User doctype for more details
    const userProfileData = await api.get(`/api/resource/User/${username}`);

    console.log('Full User Profile Data:', userProfileData.data.data);
    return userProfileData.data.data; // Frappe API usually returns data in .data property for resource GET
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const data = await api.put('/api/resource/User', profileData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data.data.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export async function getCurrentUserInfo() {
  const res = await api.get("/api/method/frappe.auth.get_logged_user");
  const user = res.data.message; // returns the user ID/email
  const profileRes = await api.get(`/api/resource/User/${user}`);
  return profileRes.data.data; // full user profile doc
}
