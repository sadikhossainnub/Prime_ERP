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
  {
    "fieldname": "item_code",
    "label": "Item Code",
    "fieldtype": "Data"
  },
  {
    "fieldname": "item_name",
    "label": "Item Name",
    "fieldtype": "Data"
  },
  {
    "fieldname": "item_group",
    "label": "Item Group",
    "fieldtype": "Link",
    "options": "Item Group",
    "default": "Products"
  },
  {
    "fieldname": "stock_uom",
    "label": "Default Unit of Measure",
    "fieldtype": "Link",
    "options": "UOM"
  },
  {
    "fieldname": "item_type",
    "label": "Item Type",
    "fieldtype": "Select"
  },
  {
    "fieldname": "is_stock_item",
    "label": "Maintain Stock",
    "fieldtype": "Check"
  },
  {
    "fieldname": "has_variants",
    "label": "Has Variants",
    "fieldtype": "Check"
  },
  {
    "fieldname": "opening_stock",
    "label": "Opening Stock",
    "fieldtype": "Float"
  },
  {
    "fieldname": "customer_target_price",
    "label": "Customer Target Price",
    "fieldtype": "Currency"
  },
  {
    "fieldname": "valuation_rate",
    "label": "Valuation Rate",
    "fieldtype": "Currency"
  },
  {
    "fieldname": "standard_rate",
    "label": "Standard Selling Rate",
    "fieldtype": "Currency"
  },
  {
    "fieldname": "image",
    "label": "Image",
    "fieldtype": "Attach Image"
  },
  {
    "fieldname": "paper_cup_size",
    "label": "Paper Cup Size",
    "fieldtype": "Select"
  },
  {
    "fieldname": "box_name",
    "label": "Box Name",
    "fieldtype": "Link"
  },
  {
    "fieldname": "file_folder_name",
    "label": "File Folder Name",
    "fieldtype": "Link"
  },
  {
    "fieldname": "envelop_name",
    "label": "Envelop Name",
    "fieldtype": "Link"
  },
  {
    "fieldname": "window",
    "label": "Window",
    "fieldtype": "Select"
  },
  {
    "fieldname": "paper_cup_type",
    "label": "Paper Cup Type",
    "fieldtype": "Select"
  },
  {
    "fieldname": "paper_cup_wall",
    "label": "Paper Cup Wall",
    "fieldtype": "Select"
  },
  {
    "fieldname": "single_wall_paper_gsm",
    "label": "Single Wall Paper Gsm",
    "fieldtype": "Select"
  },
  {
    "fieldname": "double_wall_paper_gsm",
    "label": "Double Wall Paper GSM",
    "fieldtype": "Select"
  },
  {
    "fieldname": "bottom_gsm",
    "label": "Bottom GSM",
    "fieldtype": "Select"
  },
  {
    "fieldname": "bottom_size",
    "label": "Bottom Size",
    "fieldtype": "Select"
  },
  {
    "fieldname": "office_document_name",
    "label": "Office Document Name",
    "fieldtype": "Link"
  },
  {
    "fieldname": "printing_colour",
    "label": "Printing Colour",
    "fieldtype": "Select"
  },
  {
    "fieldname": "laminnation",
    "label": "Laminnation",
    "fieldtype": "Select"
  },
  {
    "fieldname": "foil",
    "label": "Foil",
    "fieldtype": "Select"
  },
  {
    "fieldname": "tear_away_label",
    "label": "Tear Away Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "heat_transfer_label",
    "label": "Heat Transfer Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "origin",
    "label": "Origin",
    "fieldtype": "Select"
  },
  {
    "fieldname": "brand",
    "label": "Brand",
    "fieldtype": "Link"
  },
  {
    "fieldname": "sub_brand",
    "label": "Sub Brand",
    "fieldtype": "Link"
  },
  {
    "fieldname": "lid_size",
    "label": "Lid Size",
    "fieldtype": "Select"
  },
  {
    "fieldname": "file_folder_size",
    "label": "File Folder Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "lid_color",
    "label": "Lid Color",
    "fieldtype": "Select"
  },
  {
    "fieldname": "lid_type",
    "label": "Lid Type",
    "fieldtype": "Select"
  },
  {
    "fieldname": "quality",
    "label": "Quality",
    "fieldtype": "Select"
  },
  {
    "fieldname": "paper_name",
    "label": "Paper Name",
    "fieldtype": "Select"
  },
  {
    "fieldname": "paper_gsm",
    "label": "Paper GSM",
    "fieldtype": "Select"
  },
  {
    "fieldname": "printing_metallic",
    "label": "Printing Metallic",
    "fieldtype": "Select"
  },
  {
    "fieldname": "printing_sandy",
    "label": "Printing Sandy",
    "fieldtype": "Select"
  },
  {
    "fieldname": "corrugated",
    "label": "Corrugated ",
    "fieldtype": "Select"
  },
  {
    "fieldname": "pasting",
    "label": "Pasting",
    "fieldtype": "Select"
  },
  {
    "fieldname": "cup_lock",
    "label": "Cup Lock",
    "fieldtype": "Select"
  },
  {
    "fieldname": "holder_size",
    "label": "Holder Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "ambush",
    "label": "Ambush",
    "fieldtype": "Select"
  },
  {
    "fieldname": "business_card_size",
    "label": "Business Card Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "screen_printing",
    "label": "Screen Printing",
    "fieldtype": "Select"
  },
  {
    "fieldname": "envelop_size",
    "label": "Envelop Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "invoice_size",
    "label": "Invoice Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "brand_label",
    "label": "Brand Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "woven_label",
    "label": "Woven Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "printed_fabric_label",
    "label": "Printed Fabric Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "satin_label",
    "label": "Satin Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "box_size",
    "label": "Box Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "window_size",
    "label": "Window Size ",
    "fieldtype": "Link"
  },
  {
    "fieldname": "bag_name",
    "label": "Bag Name",
    "fieldtype": "Select"
  },
  {
    "fieldname": "bag_size",
    "label": "Bag Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "ribbon",
    "label": "Ribbon",
    "fieldtype": "Select"
  },
  {
    "fieldname": "table_matt_size",
    "label": "Table Matt Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "die_cut",
    "label": "Die Cut",
    "fieldtype": "Select"
  },
  {
    "fieldname": "tray_size",
    "label": "Tray Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "wrapping_paper_size",
    "label": "Wrapping Paper Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "sticker_size",
    "label": "Sticker Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "cone_name",
    "label": "Cone Name",
    "fieldtype": "Link"
  },
  {
    "fieldname": "cone_size",
    "label": "Cone Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "leaflet_size",
    "label": "Leaflet Size",
    "fieldtype": "Link"
  },
  {
    "fieldname": "page_fold",
    "label": "Page Fold",
    "fieldtype": "Select"
  },
  {
    "fieldname": "paper_pages",
    "label": "Paper Pages",
    "fieldtype": "Link"
  },
  {
    "fieldname": "eye_late",
    "label": "Eye Late",
    "fieldtype": "Select"
  },
  {
    "fieldname": "main_label",
    "label": "Main Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "care_label",
    "label": "Care Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "size_label",
    "label": "Size Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "composition_label",
    "label": "Composition Label",
    "fieldtype": "Select"
  },
  {
    "fieldname": "description",
    "label": "Description",
    "fieldtype": "Text Editor"
  },
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
