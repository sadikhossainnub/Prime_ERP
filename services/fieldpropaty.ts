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
      {
        "fieldname": "c_contact_person_name",
        "fieldtype": "Data",
        "label": "Name",
        "mandatory": 1
      },
      {
        "default": "+880",
        "fieldname": "c_mobile_number",
        "fieldtype": "Data",
        "label": "Mobile Number",
        "mandatory": 1
      },
      {
        "default": "+880",
        "fieldname": "c_office_mobile",
        "fieldtype": "Data",
        "label": "Office Mobile"
      },
      {
        "fieldname": "c_email",
        "fieldtype": "Data",
        "label": "Email"
      },
      {
        "fieldname": "c_email_personal",
        "fieldtype": "Data",
        "label": "Email Personal"
      },
      {
        "fieldname": "c_address_section",
        "fieldtype": "Section Break",
        "label": "Address"
      },
      {
        "fieldname": "c_address",
        "fieldtype": "Data",
        "label": "Address",
        "mandatory": 1
      },
      {
        "fieldname": "c_division",
        "fieldtype": "Link",
        "label": "Division",
        "options": "Division",
        "mandatory": 1
      },
      {
        "fieldname": "c_district",
        "fieldtype": "Link",
        "label": "District",
        "options": "District",
        "mandatory": 1
      },
      {
        "fieldname": "c_thana",
        "fieldtype": "Link",
        "label": "Thana",
        "options": "Thana"
      },
      {
        "fieldname": "c_post_code",
        "fieldtype": "Data",
        "label": "Post Code"
      }
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
    "fieldtype": "Select",
    "options": "\nPaper CUP\nPaper Cup Lid\nPaper Cup Jacket\nPaper Cup Holder\nOuter BOX\nBags\nTable Matt\nFood Tray\nFood Wrapping Paper\nSticker\nCone\nLeaflet\nBusiness Card\nHang Tag\nEnvelope\nInvoice\nFile Folder\nBrochure\nCalendar\nFood Menu Card\nDairy\nNotebook\nWaffle Box"
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
   "depends_on": "eval:doc.item_type == 'Paper CUP' || doc.item_type == 'Paper Cup Lid' || doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder'",
   "fieldname": "paper_cup_size",
   "fieldtype": "Select",
   "label": "Paper Cup Size",
   "options": "\n60 ML\n70 ML\n80 ML\n100 ML\n120 ML\n150 ML Auto\n150 ML Manual\n200 ML\n210 ML\n250 ML\n300 ML\n350 ML\n450 ML\n8 Oz ML\n12 Oz ML\n16 Oz ML"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP'",
   "fieldname": "paper_cup_type",
   "fieldtype": "Select",
   "label": "Paper Cup Type",
   "options": "\nHot\nCold\nIce cream\nHot & Cold"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP'",
   "fieldname": "paper_cup_wall",
   "fieldtype": "Select",
   "label": "Paper Cup Wall",
   "options": "\nSingle Wall\nDouble Wall\nRipple Wall\nDouble PE"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP'",
   "fieldname": "single_wall_paper_gsm",
   "fieldtype": "Select",
   "label": "Single Wall Paper Gsm",
   "options": "\n28\n30\n35\n40\n45\n50\n55\n60\n65\n70\n75\n80\n85\n90\n95\n100\n105\n110\n115\n120\n125\n130\n135\n140\n145\n150\n155\n160\n165\n170\n175\n180\n185\n190\n195\n200\n205\n210\n215\n220\n225\n230\n235\n240\n245\n250\n255\n260\n265\n270\n275\n280\n285\n290\n295\n300\n305\n310\n315\n320\n325\n330\n335\n340\n345\n350\n355\n360\n365\n370\n375\n380\n385\n390\n395\n400\n405\n410\n415\n420\n425\n430\n435\n440\n445\n450\n455\n460\n465\n470\n475\n480\n485\n490\n495\n500\n505\n510\n515\n520\n525\n530\n535\n540\n545\n550\n555\n560\n565\n570\n575\n580\n585\n590\n595\n600\n605\n610\n615\n620\n625\n630\n635\n640\n645\n650\n655\n660\n665\n670\n675\n680\n685\n690\n695\n700\n705\n710\n715\n720\n725\n730\n735\n740\n745\n750\n755\n760\n765\n770\n775\n780\n785\n790\n795\n800"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP'",
   "fieldname": "double_wall_paper_gsm",
   "fieldtype": "Select",
   "label": "Double Wall Paper GSM",
   "options": "\n28\n30\n35\n40\n45\n50\n55\n60\n65\n70\n75\n80\n85\n90\n95\n100\n105\n110\n115\n120\n125\n130\n135\n140\n145\n150\n155\n160\n165\n170\n175\n180\n185\n190\n195\n200\n205\n210\n215\n220\n225\n230\n235\n240\n245\n250\n255\n260\n265\n270\n275\n280\n285\n290\n295\n300\n305\n310\n315\n320\n325\n330\n335\n340\n345\n350\n355\n360\n365\n370\n375\n380\n385\n390\n395\n400\n405\n410\n415\n420\n425\n430\n435\n440\n445\n450\n455\n460\n465\n470\n475\n480\n485\n490\n495\n500\n505\n510\n515\n520\n525\n530\n535\n540\n545\n550\n555\n560\n565\n570\n575\n580\n585\n590\n595\n600\n605\n610\n615\n620\n625\n630\n635\n640\n645\n650\n655\n660\n665\n670\n675\n680\n685\n690\n695\n700\n705\n710\n715\n720\n725\n730\n735\n740\n745\n750\n755\n760\n765\n770\n775\n780\n785\n790\n795\n800"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP'",
   "fieldname": "bottom_gsm",
   "fieldtype": "Select",
   "label": "Bottom GSM",
   "options": "\n28\n30\n35\n40\n45\n50\n55\n60\n65\n70\n75\n80\n85\n90\n95\n100\n105\n110\n115\n120\n125\n130\n135\n140\n145\n150\n155\n160\n165\n170\n175\n180\n185\n190\n195\n200\n205\n210\n215\n220\n225\n230\n235\n240\n245\n250\n255\n260\n265\n270\n275\n280\n285\n290\n295\n300\n305\n310\n315\n320\n325\n330\n335\n340\n345\n350\n355\n360\n365\n370\n375\n380\n385\n390\n395\n400\n405\n410\n415\n420\n425\n430\n435\n440\n445\n450\n455\n460\n465\n470\n475\n480\n485\n490\n495\n500\n505\n510\n515\n520\n525\n530\n535\n540\n545\n550\n555\n560\n565\n570\n575\n580\n585\n590\n595\n600\n605\n610\n615\n620\n625\n630\n635\n640\n645\n650\n655\n660\n665\n670\n675\n680\n685\n690\n695\n700\n705\n710\n715\n720\n725\n730\n735\n740\n745\n750\n755\n760\n765\n770\n775\n780\n785\n790\n795\n800"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP'",
   "fieldname": "bottom_size",
   "fieldtype": "Select",
   "label": "Bottom Size",
   "options": "\n55 MM\n60 MM\n65 MM\n70 MM\n75 MM\n80 MM\n85 MM\n90 MM\n95 MM"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP' || doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Table Matt' || doc.item_type == 'Food Tray' || doc.item_type == 'Food Wrapping Paper' || doc.item_type == 'Sticker' || doc.item_type == 'Cone' || doc.item_type == 'Leaflet' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag' || doc.item_type == 'Envelope' || doc.item_type == 'Invoice' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Calendar' || doc.item_type == 'Food Menu Card' || doc.item_type == 'Diery'",
   "fieldname": "printing_colour",
   "fieldtype": "Select",
   "label": "Printing Colour",
   "options": "\n1\n2\n3\n4\n5\n6\n7\n8"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP' || doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Table Matt' || doc.item_type == 'Food Tray' || doc.item_type == 'Sticker' || doc.item_type == 'Cone' || doc.item_type == 'Leaflet' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag' || doc.item_type == 'Envelope' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Calendar' || doc.item_type == 'Food Menu Card' || doc.item_type == 'Diery' || doc.item_type == 'Notebook'",
   "fieldname": "laminnation",
   "fieldtype": "Select",
   "label": "Laminnation",
   "options": "\nGlossy\nMatt\nSilver\nBurnish Glossy\nBurnish Matt\nSpot\nMatt Spot"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper CUP' || doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Table Matt' || doc.item_type == 'Food Tray' || doc.item_type == 'Sticker' || doc.item_type == 'Cone' || doc.item_type == 'Leaflet' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag' || doc.item_type == 'Envelope' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Calendar' || doc.item_type == 'Food Menu Card' || doc.item_type == 'Diery' || doc.item_type == 'Notebook' || doc.item_type == 'Invoice'",
   "fieldname": "foil",
   "fieldtype": "Select",
   "label": "Foil",
   "options": "\nGolden Foil\nSilver Foil\nRed Foil\nGreen Foil\nBlue Foil\nPink Foil"
  },
  {
   "depends_on": "item_type",
   "fieldname": "origin",
   "fieldtype": "Select",
   "label": "Origin",
   "options": "\nChina Paper\nBangladesh Paper\nIndia Paper\nRussia Paper\nKorean Paper\nSweden Paper"
  },
  {
   "depends_on": "item_type",
   "fieldname": "brand",
   "fieldtype": "Link",
   "label": "Brand",
   "options": "Brand"
  },
  {
   "depends_on": "item_type",
   "fieldname": "sub_brand",
   "fieldtype": "Link",
   "label": "Sub Brand",
   "options": "Sub Brand"
  },
  {
   "fieldname": "column_break_yonj",
   "fieldtype": "Column Break"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Lid'",
   "fieldname": "lid_size",
   "fieldtype": "Select",
   "label": "Lid Size",
   "options": "\n70 MM\n80 MM\n90 MM"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Lid'",
   "fieldname": "lid_color",
   "fieldtype": "Select",
   "label": "Lid Color",
   "options": "\nWhite\nBlack\nTransparent"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Lid'",
   "fieldname": "lid_type",
   "fieldtype": "Select",
   "label": "Lid Type",
   "options": "\nFlat lid\nLock lid"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Lid'",
   "fieldname": "quality",
   "fieldtype": "Select",
   "label": "Quality",
   "options": "\nHeavy Lid\nLight Lid"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Table Matt' || doc.item_type == 'Food Tray' || doc.item_type == 'Food Wrapping Paper' || doc.item_type == 'Sticker' || doc.item_type == 'Cone' || doc.item_type == 'Leaflet' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag'\t || doc.item_type == 'Envelope' || doc.item_type == 'Invoice' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Calendar' || doc.item_type == 'Food Menu Card' || doc.item_type == 'Diery' || doc.item_type == 'Notebook'",
   "fieldname": "paper_name",
   "fieldtype": "Select",
   "label": "Paper Name",
   "options": "\nOil Paper\nKorian Liner\nAmerican white liner board\nKorean white liner board\nAzad white liner board\nBangla white liner board\nAmber Off-Set Paper\nPartex Off-Set Paper\nSonali Off-Set Paper\nBangla Sticker\nA1 Sticker\nK-Tak Sticker\nKorean Kraft\nAustralian Kraft\nAmerican Kraft\nBangla Liner\nDuplex Board Sheet\nArt Paper\nArt Card\nSwedish Board"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Table Matt' || doc.item_type == 'Food Tray' || doc.item_type == 'Food Wrapping Paper' || doc.item_type == 'Cone' || doc.item_type == 'Leaflet' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag'\t || doc.item_type == 'Envelope' || doc.item_type == 'Invoice' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Calendar' || doc.item_type == 'Food Menu Card' || doc.item_type == 'Diery' || doc.item_type == 'Notebook'",
   "fieldname": "paper_gsm",
   "fieldtype": "Select",
   "label": "Paper GSM",
   "options": "\n28\n30\n35\n40\n45\n50\n55\n60\n65\n70\n75\n80\n85\n90\n95\n100\n105\n110\n115\n120\n125\n130\n135\n140\n145\n150\n155\n160\n165\n170\n175\n180\n185\n190\n195\n200\n205\n210\n215\n220\n225\n230\n235\n240\n245\n250\n255\n260\n265\n270\n275\n280\n285\n290\n295\n300\n305\n310\n315\n320\n325\n330\n335\n340\n345\n350\n355\n360\n365\n370\n375\n380\n385\n390\n395\n400\n405\n410\n415\n420\n425\n430\n435\n440\n445\n450\n455\n460\n465\n470\n475\n480\n485\n490\n495\n500\n505\n510\n515\n520\n525\n530\n535\n540\n545\n550\n555\n560\n565\n570\n575\n580\n585\n590\n595\n600\n605\n610\n615\n620\n625\n630\n635\n640\n645\n650\n655\n660\n665\n670\n675\n680\n685\n690\n695\n700\n705\n710\n715\n720\n725\n730\n735\n740\n745\n750\n755\n760\n765\n770\n775\n780\n785\n790\n795\n800"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Sticker' || doc.item_type == 'Cone' || doc.item_type == 'Leaflet' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag'\t || doc.item_type == 'Envelope' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Calendar' || doc.item_type == 'Food Menu Card' || doc.item_type == 'Diery' || doc.item_type == 'Notebook'",
   "fieldname": "printing_metallic",
   "fieldtype": "Select",
   "label": "Printing Metallic",
   "options": "\nSilver Metallic\nGolden Metallic\n7 Color Metallic"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Sticker' || doc.item_type == 'Cone' || doc.item_type == 'Leaflet' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag'\t || doc.item_type == 'Envelope' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Calendar' || doc.item_type == 'Food Menu Card' || doc.item_type == 'Diery' || doc.item_type == 'Notebook'",
   "fieldname": "printing_sandy",
   "fieldtype": "Select",
   "label": "Printing Sandy",
   "options": "\nSandy\nSandy Spot"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Outer BOX'",
   "fieldname": "corrugated",
   "fieldtype": "Select",
   "label": "Corrugated ",
   "options": "\n2 Ply\n3 Ply\n5 Ply\n7 Ply"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Jacket' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Cone' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag' || doc.item_type == 'Envelope' || doc.item_type == 'Invoice' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Diery' || doc.item_type == 'Notebook' || doc.item_type == 'Waffle Box' || doc.item_type == 'Calendar'",
   "fieldname": "pasting",
   "fieldtype": "Select",
   "label": "Pasting",
   "options": "\nSide Pasting\nSide & Auto Lock\nSide & Hand Lock"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Jacket'",
   "fieldname": "cup_lock",
   "fieldtype": "Select",
   "label": "Cup Lock",
   "options": "\nLock-Yes\nLock-NO"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Holder'",
   "fieldname": "holder_size",
   "fieldtype": "Link",
   "label": "Holder Size",
   "options": "Holder Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Paper Cup Holder' || doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Business Card' || doc.item_type == 'Hang Tag' || doc.item_type == 'Envelope' || doc.item_type == 'File Folder' || doc.item_type == 'Brochure' || doc.item_type == 'Waffle Box'",
   "fieldname": "ambush",
   "fieldtype": "Select",
   "label": "Ambush",
   "options": "\nAmbush Yes\nAmbush NO"
  },
  {
   "depends_on": "eval:doc.item_type == 'Outer BOX'",
   "fieldname": "box_name",
   "fieldtype": "Link",
   "label": "Box Name",
   "options": "Box Name"
  },
  {
   "fieldname": "column_break_vyvh",
   "fieldtype": "Column Break"
  },
  {
   "depends_on": "eval:doc.item_type == 'Outer BOX'",
   "fieldname": "box_size",
   "fieldtype": "Link",
   "label": "Box Size",
   "options": "Box Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Envelope' || doc.item_type == 'File Folder' || doc.item_type == 'Waffle Box'",
   "fieldname": "window",
   "fieldtype": "Select",
   "label": "Window",
   "options": "\nWindow-Yes\nWindow-No"
  },
  {
   "depends_on": "eval:doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Waffle Box'",
   "fieldname": "window_size",
   "fieldtype": "Link",
   "label": "Window Size ",
   "options": "Window Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Bags'",
   "fieldname": "bag_name",
   "fieldtype": "Select",
   "label": "Bag Name",
   "options": "\nFlat Handle Bag\nTwisted Handle Bag\nDie-Cut Handle Bag\nLaminated Paper Bag"
  },
  {
   "depends_on": "eval:doc.item_type == 'Bags'",
   "fieldname": "bag_size",
   "fieldtype": "Link",
   "label": "Bag Size",
   "options": "Bag Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Outer BOX' || doc.item_type == 'Bags' || doc.item_type == 'Hang Tag' || doc.item_type == 'File Folder'",
   "fieldname": "ribbon",
   "fieldtype": "Select",
   "label": "Ribbon",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Table Matt'",
   "fieldname": "table_matt_size",
   "fieldtype": "Link",
   "label": "Table Matt Size",
   "options": "Table Matt Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Table Matt' || doc.item_type == 'Food Tray' || doc.item_type == 'Sticker' || doc.item_type == 'Business Card'",
   "fieldname": "die_cut",
   "fieldtype": "Select",
   "label": "Die Cut",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Food Tray'",
   "fieldname": "tray_size",
   "fieldtype": "Link",
   "label": "Tray Size",
   "options": "Tray Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Food Wrapping Paper'",
   "fieldname": "wrapping_paper_size",
   "fieldtype": "Link",
   "label": "Wrapping Paper Size",
   "options": "Wrapping Paper Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Sticker'",
   "fieldname": "sticker_size",
   "fieldtype": "Link",
   "label": "Sticker Size",
   "options": "Sticker Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Cone'",
   "fieldname": "cone_name",
   "fieldtype": "Link",
   "label": "Cone Name",
   "options": "Cone Name"
  },
  {
   "depends_on": "eval:doc.item_type == 'Cone'",
   "fieldname": "cone_size",
   "fieldtype": "Link",
   "label": "Cone Size",
   "options": "Cone Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Leaflet'",
   "fieldname": "leaflet_size",
   "fieldtype": "Link",
   "label": "Leaflet Size",
   "options": "Leaflet Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Leaflet'",
   "fieldname": "page_fold",
   "fieldtype": "Select",
   "label": "Page Fold",
   "options": "\n1\n2\n3\n5\n6\n7\n8\n9\n10"
  },
  {
   "depends_on": "eval:doc.item_type == 'Business Card'",
   "fieldname": "business_card_size",
   "fieldtype": "Link",
   "label": "Business Card Size",
   "options": "Business Card Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "screen_printing",
   "fieldtype": "Select",
   "label": "Screen Printing",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Envelope'",
   "fieldname": "envelop_name",
   "fieldtype": "Link",
   "label": "Envelop Name",
   "options": "Envelop Name"
  },
  {
   "depends_on": "eval:doc.item_type == 'Envelope'",
   "fieldname": "envelop_size",
   "fieldtype": "Link",
   "label": "Envelop Size",
   "options": "Envelop Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Invoice'",
   "fieldname": "office_document_name",
   "fieldtype": "Link",
   "label": "Office Document Name",
   "options": "Office Document Name"
  },
  {
   "depends_on": "eval:doc.item_type == 'Invoice'",
   "fieldname": "invoice_size",
   "fieldtype": "Link",
   "label": "Invoice Size",
   "options": "Invoice Size"
  },
  {
   "depends_on": "eval:doc.item_type == 'Invoice' || doc.item_type == 'Calendar' || doc.item_type == 'Diery' || doc.item_type == 'Notebook'",
   "fieldname": "paper_pages",
   "fieldtype": "Link",
   "label": "Paper Pages",
   "options": "Paper Pages"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "eye_late",
   "fieldtype": "Select",
   "label": "Eye Late",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "tear_away_label",
   "fieldtype": "Select",
   "label": "Tear Away Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "heat_transfer_label",
   "fieldtype": "Select",
   "label": "Heat Transfer Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "brand_label",
   "fieldtype": "Select",
   "label": "Brand Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "woven_label",
   "fieldtype": "Select",
   "label": "Woven Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "printed_fabric_label",
   "fieldtype": "Select",
   "label": "Printed Fabric Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "satin_label",
   "fieldtype": "Select",
   "label": "Satin Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "main_label",
   "fieldtype": "Select",
   "label": "Main Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "care_label",
   "fieldtype": "Select",
   "label": "Care Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "size_label",
   "fieldtype": "Select",
   "label": "Size Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'Hang Tag'",
   "fieldname": "composition_label",
   "fieldtype": "Select",
   "label": "Composition Label",
   "options": "\nYes\nNo"
  },
  {
   "depends_on": "eval:doc.item_type == 'File Folder'",
   "fieldname": "file_folder_name",
   "fieldtype": "Link",
   "label": "File Folder Name",
   "options": "File Folder Name"
  },
  {
   "depends_on": "eval:doc.item_type == 'File Folder'",
   "fieldname": "file_folder_size",
   "fieldtype": "Link",
   "label": "File Folder Size",
   "options": "File Folder Size"
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
