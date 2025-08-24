import { BASE_URL } from '@/constants/config';
import { apiMethodRequest, apiRequest } from './api'; // Import apiRequest and apiMethodRequest

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
    const loggedUser = await apiMethodRequest('frappe.auth.get_logged_user', {
      method: 'GET',
    });
    const username = loggedUser.message; // Assuming this returns the username/email

    if (!username) {
      throw new Error('Logged in user email not found.');
    }

    // Now fetch the full User doctype for more details
    const userProfileData = await apiRequest(`User/${username}`, {
      method: 'GET',
    });

    console.log('Full User Profile Data:', userProfileData.data);
    return userProfileData.data; // Frappe API usually returns data in .data property for resource GET
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const data = await apiRequest('User', {
      method: 'PUT', // Assuming PUT for update
      data: profileData,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getCurrentUserInfo = async (): Promise<UserProfile> => {
  try {
    const loggedUser = await apiMethodRequest('frappe.auth.get_logged_user', {
      method: 'GET',
    });
    const username = loggedUser.message; // Assuming this returns the username/email

    if (!username) {
      throw new Error('Logged in user email not found.');
    }

    // Now fetch the full User doctype for more details
    const userProfileData = await apiRequest(`User/${username}`, {
      method: 'GET',
    });
    return userProfileData.data;
  } catch (error) {
    console.error('Error fetching current user info:', error);
    // Fallback if API call fails or email is not found
    return {
      name: 'Unknown User',
      email: '', // Returning empty string to trigger the check in locationTracking.ts
      full_name: 'Unknown User (API fetch failed)',
    };
  }
};
