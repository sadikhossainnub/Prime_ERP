import { apiRequest } from './api';

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
 * Common doctypes that are typically available in ERPNext systems.
 * This serves as a fallback when we can't fetch the full doctype list due to permissions.
 */
export const COMMON_DOCTYPES = [
  // Core
  'User',
  'Role',
  'Company',
  'Customer',
  'Supplier',
  'Item',
  'Contact',
  'Address',
  
  // Selling
  'Lead',
  'Opportunity',
  'Customer Group',
  'Territory',
  'Sales Order',
  'Quotation',
  'Sales Invoice',
  'Delivery Note',
  
  // Buying
  'Purchase Order',
  'Purchase Receipt',
  'Purchase Invoice',
  'Request for Quotation',
  'Supplier Quotation',
  
  // Stock
  'Stock Entry',
  'Material Request',
  'Item Group',
  'Warehouse',
  'UOM',
  
  // Accounts
  'Account',
  'Journal Entry',
  'Payment Entry',
  'Cost Center',
  
  // HR
  'Employee',
  'Leave Application',
  'Attendance',
  'Salary Slip',
  
  // Projects
  'Project',
  'Task',
  'Timesheet',
  
  // Manufacturing
  'BOM',
  'Work Order',
  'Job Card',
].sort();

/**
 * Check if a doctype exists by trying to fetch its first record
 * This is a workaround when we can't access the DocType list directly
 */
export const checkDoctypeExists = async (doctype: string): Promise<boolean> => {
  try {
    await apiRequest(doctype, { params: { limit_page_length: 1 } });
    return true;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    // Log other errors but consider the doctype as non-existent for safety
    console.warn(`Error checking doctype existence for ${doctype}:`, error);
    return false;
  }
};

/**
 * Fetches the definition of a single doctype.
 * @param doctype - The name of the doctype to fetch.
 * @returns A promise that resolves to the doctype definition.
 */
export const getDoctype = async (doctype: string): Promise<IDocType> => {
  try {
    const response = await apiRequest(`DocType/${doctype}`);
    return response.data;
  } catch (error: any) {
    let errorMessage = `Failed to fetch doctype ${doctype}`;
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = `Access denied: You don't have permission to access doctype ${doctype}. Please check your user roles.`;
      } else if (error.response.status === 404) {
        errorMessage = `Doctype ${doctype} not found. Please verify the doctype name.`;
      } else if (error.response.status === 401) {
        errorMessage = `Authentication failed. Please check API credentials.`;
      }
    }
    console.error(`Failed to fetch doctype ${doctype}:`, error);
    throw new Error(errorMessage);
  }
};

/**
 * Fetches a list of all doctypes with fallback strategies.
 * @param retryCount - Number of retry attempts (default: 2)
 * @param useFallback - Whether to use fallback strategies when direct access fails (default: true)
 * @returns A promise that resolves to an array of doctype names.
 */
export const getDoctypes = async (retryCount: number = 2, useFallback: boolean = true): Promise<string[]> => {
  try {
    const response = await apiRequest('DocType', {
      params: { limit_page_length: 'None' },
    });
    return response.data.map((d: any) => d.name);
  } catch (error: any) {
    if (useFallback && error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.warn('Direct doctype access denied. Will use fallback strategies.');
      return await getDoctypesWithFallback();
    }
    if (useFallback) {
      console.warn('API call failed. Using fallback strategies.', error);
      return await getDoctypesWithFallback();
    }
    throw error;
  }
};

/**
 * Fallback strategy to get available doctypes when direct access is denied.
 * Uses common doctypes and validates their existence.
 */
export const getDoctypesWithFallback = async (): Promise<string[]> => {
  console.log('Using fallback doctype discovery strategy...');
  
  const availableDoctypes: string[] = [];
  const batchSize = 5; // Check doctypes in batches to avoid overwhelming the server
  
  // Check common doctypes in batches
  for (let i = 0; i < COMMON_DOCTYPES.length; i += batchSize) {
    const batch = COMMON_DOCTYPES.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (doctype) => {
      try {
        const exists = await checkDoctypeExists(doctype);
        return exists ? doctype : null;
      } catch (error) {
        console.warn(`Error checking ${doctype}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    const validDoctypes = batchResults.filter(Boolean) as string[];
    availableDoctypes.push(...validDoctypes);
    
    // Small delay between batches to be gentle on the server
    if (i + batchSize < COMMON_DOCTYPES.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Discovered ${availableDoctypes.length} available doctypes using fallback strategy`);
  return availableDoctypes.sort();
};

/**
 * Get a specific set of doctypes for a module or category
 * This is useful when you know exactly which doctypes you need
 */
export const getModuleDoctypes = (module: 'selling' | 'buying' | 'stock' | 'accounts' | 'hr' | 'core'): string[] => {
  switch (module) {
    case 'selling':
      return ['Customer', 'Lead', 'Opportunity', 'Quotation', 'Sales Order', 'Sales Invoice', 'Delivery Note'];
    case 'buying':
      return ['Supplier', 'Purchase Order', 'Purchase Receipt', 'Purchase Invoice', 'Request for Quotation'];
    case 'stock':
      return ['Item', 'Stock Entry', 'Material Request', 'Warehouse', 'Item Group'];
    case 'accounts':
      return ['Account', 'Journal Entry', 'Payment Entry', 'Cost Center'];
    case 'hr':
      return ['Employee', 'Leave Application', 'Attendance', 'Salary Slip'];
    case 'core':
      return ['User', 'Role', 'Company', 'Contact', 'Address'];
    default:
      return COMMON_DOCTYPES;
  }
};

/**
 * Creates a new doctype.
 * @param doctypeData - The data for the new doctype.
 * @returns A promise that resolves to the created doctype.
 */
export const createDoctype = async (doctypeData: Partial<IDocType>): Promise<IDocType> => {
  if (!doctypeData.name) {
    throw new Error('Doctype name is required.');
  }

  try {
    const response = await apiRequest('DocType', {
      method: 'POST',
      data: doctypeData,
    });
    return response.data;
  } catch (error: any) {
    let errorMessage = 'Failed to create doctype';
    if (error.response) {
      const errorData = error.response.data;
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData._error_message) {
        errorMessage = errorData._error_message;
      } else if (error.response.status === 403) {
        errorMessage = 'Access denied: You don\'t have permission to create doctypes.';
      } else if (error.response.status === 401) {
        errorMessage = 'Authentication failed. Please check API credentials.';
      } else if (error.response.status === 409) {
        errorMessage = `Doctype '${doctypeData.name}' already exists.`;
      }
    }
    console.error('Failed to create doctype:', error);
    throw new Error(errorMessage);
  }
};
