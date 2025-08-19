import { Doctype } from '../../types/doctypes';

export interface FieldMapping {
  component: string;
  props?: Record<string, any>;
  validation?: (value: any) => string | null;
}

export const getFieldMapping = (field: Doctype): FieldMapping => {
  const mapping: FieldMapping = { component: 'text' };

  switch (field.fieldtype) {
    case 'Data':
      mapping.component = 'text';
      break;
      
    case 'Long Text':
    case 'Text Editor':
    case 'Code':
      mapping.component = 'textarea';
      mapping.props = { multiline: true, numberOfLines: 4 };
      break;

    case 'Int':
      mapping.component = 'number';
      mapping.props = { keyboardType: 'numeric' };
      mapping.validation = (value) => {
        if (value !== undefined && value !== null && value !== '' && isNaN(parseInt(value))) {
          return 'Please enter a valid integer';
        }
        return null;
      };
      break;

    case 'Float':
    case 'Currency':
    case 'Percent':
      mapping.component = 'number';
      mapping.props = { keyboardType: 'numeric' };
      mapping.validation = (value) => {
        if (value !== undefined && value !== null && value !== '' && isNaN(parseFloat(value))) {
          return 'Please enter a valid number';
        }
        return null;
      };
      break;

    case 'Date':
      mapping.component = 'date';
      break;

    case 'Datetime':
      mapping.component = 'datetime';
      break;

    case 'Time':
      mapping.component = 'time';
      break;

    case 'Check':
      mapping.component = 'switch';
      break;

    case 'Select':
      mapping.component = 'select';
      mapping.props = { options: field.options?.split('\n') || [] };
      break;

    case 'Link':
      mapping.component = 'link';
      mapping.props = { doctype: field.options };
      break;

    case 'Dynamic Link':
      mapping.component = 'dynamicLink';
      break;

    case 'Password':
      mapping.component = 'password';
      mapping.props = { secureTextEntry: true };
      break;

    case 'Read Only':
      mapping.component = 'readonly';
      mapping.props = { editable: false };
      break;

    case 'Attach':
    case 'Attach Image':
      mapping.component = 'file';
      break;

    case 'Button':
      mapping.component = 'button';
      break;

    default:
      mapping.component = 'text';
  }

  return mapping;
};

export const validateField = (field: Doctype, value: any): string | null => {
  // Required field validation
  if (field.mandatory === 1) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${field.label} is required`;
    }
  }

  // Email validation for fields containing 'email'
  if (field.fieldtype === 'Data' && 
      field.fieldname.toLowerCase().includes('email') && 
      value) {
    if (!/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
  }

  // Phone number validation
  if (field.fieldtype === 'Data' && 
      (field.fieldname.toLowerCase().includes('phone') || 
       field.fieldname.toLowerCase().includes('mobile')) && 
      value) {
    if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
      return 'Please enter a valid phone number';
    }
  }

  // URL validation for website fields
  if (field.fieldtype === 'Data' && 
      field.fieldname.toLowerCase().includes('website') && 
      value) {
    try {
      new URL(value);
    } catch {
      return 'Please enter a valid URL';
    }
  }

  // Length validation
  if (field.length && value && value.length > field.length) {
    return `${field.label} cannot exceed ${field.length} characters`;
  }

  // Numeric validation with precision
  if (['Float', 'Currency', 'Percent'].includes(field.fieldtype) && 
      field.precision && 
      value) {
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > parseInt(field.precision)) {
      return `${field.label} can have maximum ${field.precision} decimal places`;
    }
  }

  // Get field-specific validation from mapping
  const mapping = getFieldMapping(field);
  if (mapping.validation) {
    return mapping.validation(value);
  }

  return null;
};

export const getDefaultValue = (field: Doctype): any => {
  if (field.default) {
    switch (field.fieldtype) {
      case 'Int':
        return parseInt(field.default) || 0;
      case 'Float':
      case 'Currency':
      case 'Percent':
        return parseFloat(field.default) || 0;
      case 'Check':
        return field.default === '1' || field.default.toLowerCase() === 'true';
      case 'Date':
        return field.default === 'Today' ? new Date().toISOString().split('T')[0] : field.default;
      case 'Datetime':
        return field.default === 'Now' ? new Date().toISOString() : field.default;
      default:
        return field.default;
    }
  }

  // Default values based on field type
  switch (field.fieldtype) {
    case 'Int':
    case 'Float':
    case 'Currency':
    case 'Percent':
      return 0;
    case 'Check':
      return false;
    case 'Date':
    case 'Datetime':
    case 'Time':
      return '';
    default:
      return '';
  }
};

export const formatValue = (field: Doctype, value: any): string => {
  if (!value && value !== 0) return '';

  switch (field.fieldtype) {
    case 'Currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'BDT'
      }).format(value);
    case 'Percent':
      return `${value}%`;
    case 'Float':
      return parseFloat(value).toFixed(field.precision ? parseInt(field.precision) : 2);
    case 'Date':
      return new Date(value).toLocaleDateString();
    case 'Datetime':
      return new Date(value).toLocaleString();
    case 'Time':
      return new Date(`1970-01-01T${value}`).toLocaleTimeString();
    default:
      return value.toString();
  }
};

export const getSectionFromFieldname = (fieldname: string): string => {
  const lowerFieldname = fieldname.toLowerCase();
  
  if (lowerFieldname.includes('address') || 
      lowerFieldname.includes('city') || 
      lowerFieldname.includes('state') || 
      lowerFieldname.includes('country') || 
      lowerFieldname.includes('pincode') ||
      lowerFieldname.includes('zip')) {
    return 'Address Information';
  }
  
  if (lowerFieldname.includes('email') || 
      lowerFieldname.includes('phone') || 
      lowerFieldname.includes('mobile') || 
      lowerFieldname.includes('contact') ||
      lowerFieldname.includes('fax')) {
    return 'Contact Information';
  }
  
  if (lowerFieldname.includes('rate') || 
      lowerFieldname.includes('price') || 
      lowerFieldname.includes('amount') || 
      lowerFieldname.includes('tax') ||
      lowerFieldname.includes('currency') ||
      lowerFieldname.includes('cost') ||
      lowerFieldname.includes('discount')) {
    return 'Pricing Information';
  }
  
  if (lowerFieldname.includes('stock') || 
      lowerFieldname.includes('qty') || 
      lowerFieldname.includes('inventory') || 
      lowerFieldname.includes('warehouse') ||
      lowerFieldname.includes('uom') ||
      lowerFieldname.includes('weight')) {
    return 'Inventory Information';
  }

  if (lowerFieldname.includes('date') || 
      lowerFieldname.includes('time') ||
      lowerFieldname.includes('schedule') ||
      lowerFieldname.includes('delivery')) {
    return 'Date & Time Information';
  }

  if (lowerFieldname.includes('tax') || 
      lowerFieldname.includes('gst') || 
      lowerFieldname.includes('hsn') ||
      lowerFieldname.includes('vat')) {
    return 'Tax Information';
  }

  return 'General Information';
};

export const groupFieldsBySection = (fields: Doctype[]): Record<string, Doctype[]> => {
  const grouped: Record<string, Doctype[]> = {};
  
  fields.forEach(field => {
    const section = getSectionFromFieldname(field.fieldname);
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(field);
  });

  return grouped;
};