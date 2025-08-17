import { apiRequest } from './api';

/**
 * @interface IFieldType
 * @description Represents the structure of a Frappe fieldtype.
 */
export interface IFieldType {
  name: string;
  // Add other properties as needed
}

/**
 * Fetches a list of all field types.
 * @returns A promise that resolves to an array of fieldtype names.
 */
export const getFieldTypes = async (): Promise<string[]> => {
  const response = await apiRequest('DocField'); // Assuming 'DocField' is the doctype for field types
  return response.data.map((d: any) => d.name);
};
