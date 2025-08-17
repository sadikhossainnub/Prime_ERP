import { BASE_URL } from '@/constants/config';
import { getSession, login, logout } from './auth';

const API_URL = BASE_URL;

export const apiRequest = async (endpoint: string) => {
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/resource/${endpoint}`, {
    headers: {
      "Cookie": `sid=${session.sid}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
};

export const getDocCount = async (doctype: string) => {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(
    `${API_URL}/api/method/frappe.desk.reportview.get_count`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sid=${session.sid}`,
      },
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
      throw new Error('Login failed');
    }

    const data = await response.json();
    await login(data.full_name, data.home_page);
    return data;
  },

  logout: async () => {
    await logout();
  },

  getDashboardData: async () => {
    const session = await getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/resource/Dashboard`, {
      headers: {
        "Cookie": `sid=${session.sid}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return response.json();
  },
};

export default api;
