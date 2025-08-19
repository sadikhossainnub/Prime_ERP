import { Doctype } from '../types/doctypes';


import { API_KEY, API_SECRET, BASE_URL } from '@/constants/config';

export const getDoctypeFields = async (doctype: string): Promise<Doctype[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/resource/DocType?fields=["name", "label", "fieldname", "fieldtype", "options", "default", "mandatory", "read_only", "hidden", "depends_on", "description", "length", "precision", "unique", "allow_on_submit", "in_list_view", "in_print_format", "fetch_from", "collapsible", "allow_copy", "read_only_on_submit", "fetch_if_empty"]&filters=[["name", "=", "${doctype}"]]"`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctype fields for ${doctype}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching doctype fields:', error);
    throw error;
  }
};
