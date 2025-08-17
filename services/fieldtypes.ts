/**
 * @interface IFieldType
 * @description Represents the structure of a Frappe fieldtype.
 */
export interface IFieldType {
  name: string;
  // Add other properties as needed
}

const standardFieldTypeNames: string[] = [
  'Data',
  'Long Text',
  'Code',
  'Text Editor',
  'Select',
  'Link',
  'Dynamic Link',
  'Table',
  'Int',
  'Float',
  'Currency',
  'Percent',
  'Date',
  'Datetime',
  'Time',
  'Check',
  'Button',
  'Read Only',
  'Password',
  'Attach',
  'Attach Image',
  'Signature',
  'Color',
  'Barcode',
  'Rating',
];

/**
 * Fetches a list of all field types.
 * @returns A promise that resolves to an array of fieldtype names.
 */
export const getFieldTypes = async (): Promise<string[]> => {
  return Promise.resolve(standardFieldTypeNames);
};
