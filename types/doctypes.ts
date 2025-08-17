export interface Doctype {
  name: string;
  label: string;
  fieldname: string;
  fieldtype: string;
  options: string;
  default: string;
  mandatory: number;
  read_only: number;
  hidden: number;
  depends_on: string;
  description: string;
  length: number;
  precision: string;
  unique: number;
  allow_on_submit: number;
  in_list_view: number;
  in_print_format: number;
  fetch_from: string;
  collapsible: number;
  allow_copy: number;
  read_only_on_submit: number;
  fetch_if_empty: number;
}
