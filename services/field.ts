import { Doctype } from '../types/doctypes';
import { apiRequest } from './api';

export const getDoctypeFields = async (doctype: string): Promise<Doctype[]> => {
  try {
    const response = await apiRequest(
      `Doctype?fields=["name", "label", "fieldname", "fieldtype", "options", "default", "mandatory", "read_only", "hidden", "depends_on", "description", "length", "precision", "unique", "allow_on_submit", "in_list_view", "in_print_format", "fetch_from", "collapsible", "allow_copy", "read_only_on_submit", "fetch_if_empty"]&filters=[["name", "=", "${doctype}"]]`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching doctype fields:', error);
    throw error;
  }
};
