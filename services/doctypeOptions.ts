import { apiRequest } from './api.js';

async function fetchOptions(doctype: string, search = '') {
  try {
    let fieldsToFetch = ["name"];
    let titleField = "name";

    // Always use 'name' as the title field to avoid server errors
    fieldsToFetch.push("name");

    // 2. Fetch options with name (+ title field if not Customer)
    const params: any = {
      fields: JSON.stringify(fieldsToFetch),
      order_by: "modified desc",
    };

    if (search) {
      params.filters = [["name", "like", `%${search}%`]];
    }

    const res = await apiRequest(`resource/${encodeURIComponent(doctype)}`, { params });

    return res.data.data.map((row: any) => ({
      value: row.name,
      label: row[titleField] || row.name
    }));


  } catch (err: any) {
    console.error(`Error fetching ${doctype} options:`, err.response?.data || err.message);
    return [];
  }
}

export default fetchOptions;

