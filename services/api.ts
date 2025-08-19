import { BASE_URL } from '@/constants/config';
import { getAuthHeaders } from './authHeaders';

const API_URL = BASE_URL;

export const apiRequest = async (endpoint: string) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/api/resource/${endpoint}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
};


export const getDocCount = async (doctype: string) => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_URL}/api/method/frappe.desk.reportview.get_count`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        doctype: doctype,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch count for ${doctype}`);
  }
  const data = await response.json();
  return data.message;
};

const api = {
  login: async (email: string, password: string) => {
    // Using API token authentication - no session needed
    // Just validate that we have valid API credentials by testing a simple API call
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/method/frappe.auth.get_logged_user`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('API authentication failed - please check API credentials');
      }

      const data = await response.json();
      
      // Return user data based on API token validation
      return {
        email: email,
        name: data.message || email,
        full_name: data.message || email,
        authenticated: true,
      };
    } catch (error) {
      console.error('Token-based authentication failed:', error);
      throw new Error('Login failed - API token authentication error');
    }
  },

  logout: async () => {
    // No session to clear with token authentication
    return Promise.resolve();
  },

  getDashboardData: async () => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/resource/Dashboard`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return response.json();
  },
  
  forgetPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/api/method/frappe.core.doctype.user.user.reset_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }

    return response.json();
  },
};

export default api;
