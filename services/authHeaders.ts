import { API_KEY, API_SECRET } from '@/constants/config';

/**
 * Helper function to get authentication headers consistently across all services
 * Uses API token authentication only
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `token ${API_KEY}:${API_SECRET}`,
  };

  console.log('Using API token authentication');
  return headers;
};

/**
 * Helper function for authenticated requests - now uses API token authentication
 */
export const requireAuthHeaders = async (): Promise<Record<string, string>> => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `token ${API_KEY}:${API_SECRET}`,
  };
};