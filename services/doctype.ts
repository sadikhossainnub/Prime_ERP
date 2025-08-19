import { BASE_URL } from '@/constants/config';
import { getAuthHeaders } from './authHeaders';

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
  const headers = await getAuthHeaders();
  
  try {
    const response = await fetch(`${BASE_URL}/api/resource/${doctype}?limit_page_length=1`, {
      headers,
    });
    
    // If we get 200 or 403 (forbidden but doctype exists), the doctype exists
    // If we get 404, the doctype doesn't exist
    return response.status !== 404;
  } catch (error) {
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
  const headers = await getAuthHeaders();

  try {
    const response = await fetch(`${BASE_URL}/api/resource/DocType/${doctype}`, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch doctype ${doctype}`;
      
      if (response.status === 403) {
        errorMessage = `Access denied: You don't have permission to access doctype ${doctype}. Please check your user roles.`;
      } else if (response.status === 404) {
        errorMessage = `Doctype ${doctype} not found. Please verify the doctype name.`;
      } else if (response.status === 401) {
        errorMessage = `Authentication failed. Please check API credentials.`;
      }
      
      console.error(`Failed to fetch doctype ${doctype}:`, response.status, errorText);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Fetches a list of all doctypes with fallback strategies.
 * @param retryCount - Number of retry attempts (default: 2)
 * @param useFallback - Whether to use fallback strategies when direct access fails (default: true)
 * @returns A promise that resolves to an array of doctype names.
 */
export const getDoctypes = async (retryCount: number = 2, useFallback: boolean = true): Promise<string[]> => {
  const headers = await getAuthHeaders();

  // First, try the direct API approach
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/api/resource/DocType?limit_page_length=None`, {
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch doctypes';
        
        if (response.status === 403) {
          console.warn('Direct doctype access denied. Will use fallback strategies.');
          if (useFallback) {
            return await getDoctypesWithFallback();
          }
          errorMessage = 'Access denied: You don\'t have permission to access doctypes. Please check your user roles or contact your system administrator.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check API credentials.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        console.error('Failed to fetch doctypes:', response.status, errorText);
        
        // Don't retry for permission or authentication errors
        if (response.status === 403 || response.status === 401) {
          if (response.status === 403 && useFallback) {
            return await getDoctypesWithFallback();
          }
          throw new Error(errorMessage);
        }
        
        // Retry for server errors if attempts remain
        if (attempt < retryCount && response.status >= 500) {
          console.log(`Retrying... Attempt ${attempt + 2} of ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data.map((d: any) => d.name);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (attempt < retryCount) {
          console.log(`Network error, retrying... Attempt ${attempt + 2} of ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        // If direct API fails due to network and we have fallback enabled
        if (useFallback) {
          console.warn('Network error accessing DocType API. Using fallback strategies.');
          return await getDoctypesWithFallback();
        }
        
        throw new Error('Network error: Unable to connect to the server. Please check your connection.');
      }
      
      // For other errors, try fallback if enabled
      if (useFallback && error instanceof Error && error.message.includes('permission')) {
        return await getDoctypesWithFallback();
      }
      
      // Re-throw non-network errors immediately
      throw error;
    }
  }
  
  // Final fallback if all retries failed
  if (useFallback) {
    console.warn('All direct API attempts failed. Using fallback strategies.');
    return await getDoctypesWithFallback();
  }
  
  throw new Error('Maximum retry attempts reached. Please try again later.');
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
  const headers = await getAuthHeaders();

  if (!doctypeData.name) {
    throw new Error('Doctype name is required.');
  }

  try {
    const response = await fetch(`${BASE_URL}/api/resource/DocType`, {
      method: 'POST',
      headers,
      body: JSON.stringify(doctypeData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create doctype';
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData._error_message) {
          errorMessage = errorData._error_message;
        }
      } catch {
        // If JSON parsing fails, use generic error message based on status
        if (response.status === 403) {
          errorMessage = 'Access denied: You don\'t have permission to create doctypes.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check API credentials.';
        } else if (response.status === 409) {
          errorMessage = `Doctype '${doctypeData.name}' already exists.`;
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred while creating doctype. Please try again later.';
        }
      }
      
      console.error('Failed to create doctype:', response.status, errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};
