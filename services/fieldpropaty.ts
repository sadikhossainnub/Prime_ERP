import { BASE_URL } from '@/constants/config';
import { Doctype } from '../types/doctypes';
import { getAuthHeaders } from './authHeaders';

/**
 * Generate a human-readable label from a fieldname
 */
const generateLabelFromFieldname = (fieldname: string): string => {
  return fieldname
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get doctype fields using the meta API endpoint which usually has broader permissions
 */
export const getDoctypeFields = async (doctype: string): Promise<Doctype[]> => {
  const headers = await getAuthHeaders();

  try {
    // First try the meta API which often has broader access permissions
    const response = await fetch(`${BASE_URL}/api/method/frappe.desk.form.meta.get_meta?doctype=${encodeURIComponent(doctype)}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.message && data.message.fields) {
        // Map the meta API format to our expected Doctype format
        return data.message.fields.map((field: any) => createDoctypeField({
          fieldname: field.fieldname,
          label: field.label,
          fieldtype: field.fieldtype,
          options: field.options,
          default: field.default,
          mandatory: field.reqd || 0,
          read_only: field.read_only || 0,
          hidden: field.hidden || 0,
          depends_on: field.depends_on,
          description: field.description,
          length: field.length || 0,
          precision: field.precision,
          unique: field.unique || 0,
          allow_on_submit: field.allow_on_submit || 0,
          in_list_view: field.in_list_view || 0,
          in_print_format: field.print_hide ? 0 : 1,
          fetch_from: field.fetch_from,
          collapsible: field.collapsible || 0,
          allow_copy: field.allow_copy !== undefined ? field.allow_copy : 1,
          read_only_on_submit: field.read_only_on_submit || 0,
          fetch_if_empty: field.fetch_if_empty || 0,
        }));
      }
    }

    // Fallback to direct DocField resource query if meta API fails
    return await getDoctypeFieldsFallback(doctype);
    
  } catch (error) {
    console.warn('Meta API failed, trying fallback method:', error);
    return await getDoctypeFieldsFallback(doctype);
  }
};

/**
 * Fallback method to get doctype fields using DocField resource query
 */
export const getDoctypeFieldsFallback = async (doctype: string): Promise<Doctype[]> => {
  const headers = await getAuthHeaders();

  try {
    // Query DocField doctype to get fields for the specified doctype
    // Note: 'label' field is not permitted in query, so we'll generate it from fieldname
    const response = await fetch(`${BASE_URL}/api/resource/DocField?fields=["fieldname", "fieldtype", "options", "default", "reqd", "read_only", "hidden", "depends_on", "description", "length", "precision", "unique", "allow_on_submit", "in_list_view", "print_hide", "fetch_from", "collapsible", "allow_copy", "read_only_on_submit", "fetch_if_empty"]&filters=[["parent", "=", "${doctype}"]]&limit_page_length=200`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch doctype fields for ${doctype}`;
      
      if (response.status === 403) {
        // Try alternative approach using hardcoded fields for common doctypes
        return await getCommonDoctypeFields(doctype);
      } else if (response.status === 404) {
        errorMessage = `Doctype ${doctype} not found. Please verify the doctype name.`;
      } else if (response.status === 401) {
        errorMessage = `Authentication failed. Please check API credentials.`;
      }
      
      console.error('Error fetching doctype fields:', response.status, await response.text());
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // Map the DocField format to our expected Doctype format
    return data.data.map((field: any) => createDoctypeField({
      fieldname: field.fieldname,
      label: field.label || generateLabelFromFieldname(field.fieldname), // Generate label from fieldname if not available
      fieldtype: field.fieldtype,
      options: field.options,
      default: field.default,
      mandatory: field.reqd || 0,
      read_only: field.read_only || 0,
      hidden: field.hidden || 0,
      depends_on: field.depends_on,
      description: field.description,
      length: field.length || 0,
      precision: field.precision,
      unique: field.unique || 0,
      allow_on_submit: field.allow_on_submit || 0,
      in_list_view: field.in_list_view || 0,
      in_print_format: field.print_hide ? 0 : 1,
      fetch_from: field.fetch_from,
      collapsible: field.collapsible || 0,
      allow_copy: field.allow_copy !== undefined ? field.allow_copy : 1,
      read_only_on_submit: field.read_only_on_submit || 0,
      fetch_if_empty: field.fetch_if_empty || 0,
    }));
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your connection.');
    }
    console.error('Error fetching doctype fields:', error);
    
    // If all API methods fail, fall back to hardcoded fields
    console.warn(`All API methods failed for ${doctype}, using hardcoded fields`);
    return await getCommonDoctypeFields(doctype);
  }
};

/**
 * Helper function to create a complete Doctype object with default values
 */
const createDoctypeField = (overrides: Partial<Doctype>): Doctype => {
  return {
    name: overrides.fieldname || 'unknown',
    label: overrides.label || '',
    fieldname: overrides.fieldname || '',
    fieldtype: overrides.fieldtype || 'Data',
    options: overrides.options || '',
    default: overrides.default || '',
    mandatory: overrides.mandatory || 0,
    read_only: overrides.read_only || 0,
    hidden: overrides.hidden || 0,
    depends_on: overrides.depends_on || '',
    description: overrides.description || '',
    length: overrides.length || 0,
    precision: overrides.precision || '',
    unique: overrides.unique || 0,
    allow_on_submit: overrides.allow_on_submit || 0,
    in_list_view: overrides.in_list_view || 0,
    in_print_format: overrides.in_print_format || 0,
    fetch_from: overrides.fetch_from || '',
    collapsible: overrides.collapsible || 0,
    allow_copy: overrides.allow_copy || 1,
    read_only_on_submit: overrides.read_only_on_submit || 0,
    fetch_if_empty: overrides.fetch_if_empty || 0,
    ...overrides,
  };
};

/**
 * Get common fields for well-known doctypes when API access is limited
 */
export const getCommonDoctypeFields = async (doctype: string): Promise<Doctype[]> => {
  console.log(`Using hardcoded fields for ${doctype}`);
  
  const commonFields: Record<string, Partial<Doctype>[]> = {
    'Customer': [
      { fieldname: 'customer_name', label: 'Customer Name', fieldtype: 'Data', mandatory: 1 },
      { fieldname: 'customer_type', label: 'Customer Type', fieldtype: 'Select', options: 'Individual\nCompany', default: 'Individual' },
      { fieldname: 'customer_group', label: 'Customer Group', fieldtype: 'Link', options: 'Customer Group' },
      { fieldname: 'territory', label: 'Territory', fieldtype: 'Link', options: 'Territory' },
      { fieldname: 'email_id', label: 'Email ID', fieldtype: 'Data' },
      { fieldname: 'mobile_no', label: 'Mobile No', fieldtype: 'Data' },
      { fieldname: 'tax_id', label: 'Tax ID', fieldtype: 'Data' },
    ],
    'Item': [
      { fieldname: 'item_name', label: 'Item Name', fieldtype: 'Data', mandatory: 1 },
      { fieldname: 'item_code', label: 'Item Code', fieldtype: 'Data', mandatory: 1 },
      { fieldname: 'item_group', label: 'Item Group', fieldtype: 'Link', options: 'Item Group', mandatory: 1 },
      { fieldname: 'stock_uom', label: 'Stock UOM', fieldtype: 'Link', options: 'UOM', mandatory: 1 },
      { fieldname: 'is_stock_item', label: 'Is Stock Item', fieldtype: 'Check', default: '1' },
      { fieldname: 'valuation_rate', label: 'Valuation Rate', fieldtype: 'Currency' },
      { fieldname: 'standard_rate', label: 'Standard Selling Rate', fieldtype: 'Currency' },
      { fieldname: 'description', label: 'Description', fieldtype: 'Text Editor' },
    ],
    'Quotation': [
      { fieldname: 'party_name', label: 'Customer', fieldtype: 'Link', options: 'Customer', mandatory: 1 },
      { fieldname: 'transaction_date', label: 'Date', fieldtype: 'Date', mandatory: 1, default: 'Today' },
      { fieldname: 'valid_till', label: 'Valid Till', fieldtype: 'Date' },
      { fieldname: 'quotation_to', label: 'Quotation To', fieldtype: 'Select', options: 'Customer\nLead', default: 'Customer' },
      { fieldname: 'company', label: 'Company', fieldtype: 'Link', options: 'Company', mandatory: 1 },
      { fieldname: 'currency', label: 'Currency', fieldtype: 'Link', options: 'Currency', mandatory: 1 },
    ],
    'Sales Order': [
      { fieldname: 'customer', label: 'Customer', fieldtype: 'Link', options: 'Customer', mandatory: 1 },
      { fieldname: 'transaction_date', label: 'Date', fieldtype: 'Date', mandatory: 1, default: 'Today' },
      { fieldname: 'delivery_date', label: 'Delivery Date', fieldtype: 'Date', mandatory: 1 },
      { fieldname: 'company', label: 'Company', fieldtype: 'Link', options: 'Company', mandatory: 1 },
      { fieldname: 'currency', label: 'Currency', fieldtype: 'Link', options: 'Currency', mandatory: 1 },
      { fieldname: 'selling_price_list', label: 'Price List', fieldtype: 'Link', options: 'Price List' },
    ],
  };

  const defaultFields: Partial<Doctype>[] = [
    { fieldname: 'title', label: 'Title', fieldtype: 'Data', mandatory: 1 },
    { fieldname: 'description', label: 'Description', fieldtype: 'Text' },
  ];

  const fields = commonFields[doctype] || defaultFields;
  return fields.map(field => createDoctypeField(field));
};
