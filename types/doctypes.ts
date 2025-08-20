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
  no_copy?: number;
  in_standard_filter?: number;
  in_global_search?: number;
  print_hide?: number;
  reqd?: number;
  width?: string;
  search_index?: number;
  remember_last_selected_value?: number;
  bold?: number;
}

export interface MobileLocation {
  name?: string; // Optional, server might assign
  user?: string; // User associated with the location, as per cURL example
  latitude: number;
  longitude: number;
  timestamp: string; // ISO 8601
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}
