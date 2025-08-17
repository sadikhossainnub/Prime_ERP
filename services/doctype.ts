import { API_KEY, API_SECRET, BASE_URL } from '@/constants/config';
import { apiRequest } from './api';
import { getSession } from './auth';

/**
 * @interface IDocType
 * @description Represents the structure of a Frappe doctype.
 * This is a partial definition and can be expanded as needed.
 */
export interface IDocType {
  name: string;
  doctype: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  [key: string]: any; // Allow other properties
}

/**
 * Fetches the definition of a single doctype.
 * @param doctype - The name of the doctype to fetch.
 * @returns A promise that resolves to the doctype definition.
 */
export const getDoctype = async (doctype: string): Promise<IDocType> => {
  const response = await apiRequest(`DocType/${doctype}`);
  return response.data;
};

/**
 * Fetches a list of all doctypes.
 * @returns A promise that resolves to an array of doctype names.
 */
export const getDoctypes = async (): Promise<string[]> => {
  const response = await fetch(`${BASE_URL}/api/resource/DocType?limit_page_length=None`, {
    headers: {
      'Authorization': `token ${API_KEY}:${API_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch doctypes');
  }

  const data = await response.json();
  return data.data.map((d: any) => d.name);
};

/**
 * Creates a new doctype.
 * @param doctypeData - The data for the new doctype.
 * @returns A promise that resolves to the created doctype.
 */
export const createDoctype = async (doctypeData: Partial<IDocType>): Promise<IDocType> => {
    const session = await getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
  
    const response = await fetch(`${BASE_URL}/api/resource/DocType`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Cookie": `sid=${session.sid}`,
      },
      body: JSON.stringify(doctypeData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create doctype');
    }
  
    return response.json();
};
