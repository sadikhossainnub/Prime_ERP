import { BASE_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = BASE_URL;
const SID_STORAGE_KEY = 'prime_erp_sid';

let currentSid: string | null = null;

export const setSid = async (sid: string | null) => {
  currentSid = sid;
  if (sid) {
    await AsyncStorage.setItem(SID_STORAGE_KEY, sid);
  } else {
    await AsyncStorage.removeItem(SID_STORAGE_KEY);
  }
};

export const getSid = async (): Promise<string | null> => {
  if (currentSid) {
    return currentSid;
  }
  const storedSid = await AsyncStorage.getItem(SID_STORAGE_KEY);
  currentSid = storedSid;
  return storedSid;
};

export const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const sid = await getSid();
  const headers = new Headers(options?.headers as HeadersInit);

  if (sid) {
    headers.set('Cookie', `sid=${sid}`);
  }

  const response = await fetch(`${API_URL}/api/resource/${endpoint}`, {
    headers: headers,
    ...options,
  });

  const contentType = response.headers.get('content-type');
  if (!response.ok || (contentType && !contentType.includes('application/json'))) {
    const errorText = await response.text();
    console.error(`API Error for ${endpoint}: ${response.status} ${response.statusText}. Response was not JSON or not OK.`, errorText);
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}. Details: ${errorText}`);
  }

  return response.json();
};

export const apiMethodRequest = async (methodPath: string, options?: RequestInit & { params?: Record<string, any> }) => {
  const sid = await getSid();
  const headers = new Headers(options?.headers as HeadersInit);

  if (sid) {
    headers.set('Cookie', `sid=${sid}`);
  }

  let url = `${API_URL}/api/method/${methodPath}`;
  const { params, ...fetchOptions } = options || {}; // Destructure to separate params

  if (params && fetchOptions.method === 'GET') {
    const queryParams = new URLSearchParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        // Handle special Frappe parameters like filters and fields which are JSON strings
        if (['filters', 'fields', 'docstatus', 'group_by', 'order_by', 'limit_start', 'limit_page_length'].includes(key)) {
          queryParams.append(key, params[key]);
        } else {
          queryParams.append(key, params[key]);
        }
      }
    }
    url += `?${queryParams.toString()}`;
  }

  const response = await fetch(url, {
    headers: headers,
    ...fetchOptions, // Use fetchOptions without params
  });

  const contentType = response.headers.get('content-type');
  if (!response.ok || (contentType && !contentType.includes('application/json'))) {
    const errorText = await response.text();
    console.error(`API Method Error for ${methodPath}: ${response.status} ${response.statusText}. Response was not JSON or not OK.`, errorText);
    throw new Error(`Failed to fetch ${methodPath}: ${response.statusText}. Details: ${errorText}`);
  }

  return response.json();
};

export const getDocCount = async (doctype: string) => {
  const sid = await getSid();
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (sid) {
    headers.set('Cookie', `sid=${sid}`);
  }

  const response = await fetch(
    `${API_URL}/api/method/frappe.desk.reportview.get_count`,
    {
      method: "POST",
      headers: headers,
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
    const response = await fetch(`${API_URL}/api/method/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usr: email,
        pwd: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    const sid = response.headers.get('set-cookie')?.split(';')[0]?.replace('sid=', '');

    if (sid) {
      await setSid(sid);
      console.log('SID stored:', sid);
    } else {
      console.warn('SID not found in response headers.');
    }

    // You might want to fetch user profile after successful login
    // For now, we'll return basic user info
    return {
      email: email,
      name: data.full_name || email,
      full_name: data.full_name || email,
      authenticated: true,
    };
  },

  logout: async () => {
    try {
      const sid = await getSid();
      const headers = new Headers();
      if (sid) {
        headers.set('Cookie', `sid=${sid}`);
      }

      const response = await fetch(`${API_URL}/api/method/logout`, {
        method: 'POST',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
      await setSid(null); // Clear SID on logout
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  getDashboardData: async () => {
    const sid = await getSid();
    const headers = new Headers();
    if (sid) {
      headers.set('Cookie', `sid=${sid}`);
    }

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
