import { BASE_URL } from '@/constants/config';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = BASE_URL;
const SID_STORAGE_KEY = 'prime_erp_sid'; // Using SecureStore for SID

let currentSid: string | null = null;

export const setSid = async (sid: string | null) => {
  currentSid = sid;
  if (sid) {
    await SecureStore.setItemAsync(SID_STORAGE_KEY, sid);
  } else {
    await SecureStore.deleteItemAsync(SID_STORAGE_KEY);
  }
};

export const getSid = async (): Promise<string | null> => {
  if (currentSid) {
    return currentSid;
  }
  const storedSid = await SecureStore.getItemAsync(SID_STORAGE_KEY);
  currentSid = storedSid;
  return storedSid;
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  const sid = await getSid();
  if (sid) {
    config.headers.Cookie = `sid=${sid}`;
  }
  return config;
});

export const setupAxiosInterceptors = (onSessionExpired: () => void) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        if (error.response.status === 401) {
          console.log('Session expired. Logging out.');
          onSessionExpired();
        }
        console.error(`API Error for ${error.config?.url}: ${error.response.status} ${error.response.statusText}.`, error.response.data);
        throw new Error(`Failed to fetch ${error.config?.url}: ${error.response.statusText}. Details: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('API Error: No response received.', error.request);
        throw new Error('Network error: Unable to connect to the server.');
      } else {
        console.error('API Error: Request setup failed.', error.message);
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  );
};

export const apiRequest = async (endpoint: string, options?: AxiosRequestConfig) => {
  const response = await axiosInstance.request({
    url: `/api/resource/${endpoint.replace('resource/', '')}`, // Remove duplicate 'resource/' if present
    ...options,
  });
  return response.data;
};

export const apiMethodRequest = async (methodPath: string, options?: AxiosRequestConfig) => {
  const response = await axiosInstance.request({
    url: `/api/method/${methodPath}`,
    ...options,
  });
  return response.data;
};

export const getDocCount = async (doctype: string) => {
  const response = await apiMethodRequest('frappe.desk.reportview.get_count', {
    method: 'POST',
    data: { doctype },
  });
  return response.message;
};

const api = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/method/login`, {
      usr: email,
      pwd: password,
    });

    if (response.status !== 200) {
      throw new Error(response.data.message || 'Login failed');
    }

    const data = response.data;
    const cookies = response.headers['set-cookie'];
    let sid: string | undefined;

    if (cookies) {
      const sidCookie = cookies.find(cookie => cookie.startsWith('sid='));
      if (sidCookie) {
        sid = sidCookie.split(';')[0].replace('sid=', '');
      }
    }

    if (sid) {
      await setSid(sid);
      console.log('SID stored:', sid);
    } else {
      console.warn('SID not found in response headers.');
    }

    return {
      email: email,
      name: data.full_name || email,
      full_name: data.full_name || email,
      authenticated: true,
    };
  },

  logout: async () => {
    const sid = await getSid();
    if (sid) {
      try {
        await axios.post(
          `${API_URL}/api/method/logout`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Cookie: `sid=${sid}`,
            },
            withCredentials: true,
          }
        );
        console.log('Successfully logged out from API.');
      } catch (error) {
        console.error('API logout failed, but proceeding with local cleanup:', error);
      }
    }
    await setSid(null); // Always clear local SID
  },

  getDashboardData: async () => {
    const response = await apiRequest('Dashboard');
    return response;
  },

  forgetPassword: async (email: string) => {
    return await apiMethodRequest('frappe.core.doctype.user.user.reset_password', {
      method: 'POST',
      data: { user: email },
    });
  },
};

export default api;
