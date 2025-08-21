import { API_KEY, API_SECRET, BASE_URL } from '@/constants/config';
import axios from "axios";
import { getAuthHeaders } from "./authHeaders"; // Assuming this is available and provides token based headers

async function fetchOptions(doctype: string) {
  try {
    const headers = await getAuthHeaders();

    // 1. Get the title field for the doctype
    const titleRes = await axios.get(
      `${BASE_URL}/api/method/frappe.desk.search.get_title_field`,
      {
        params: { doctype },
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`
        }
      }
    );

    const titleField = titleRes.data.message || "name";

    // 2. Fetch options with name + title field
    const res = await axios.get(
      `${BASE_URL}/api/resource/${encodeURIComponent(doctype)}`,
      {
        params: {
          fields: JSON.stringify(["name", titleField]),
          order_by: "modified desc"
        },
        headers: {
          Authorization: `token ${API_KEY}:${API_SECRET}`
        }
      }
    );

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

// Usage Example (for testing purposes, remove in production)
/*
(async () => {
  console.log("Fetching Item Groups...");
  const itemGroups = await fetchOptions("Item Group");
  console.log("Item Groups:", itemGroups);

  console.log("\nFetching Customers...");
  const customers = await fetchOptions("Customer");
  console.log("Customers:", customers);

  console.log("\nFetching Items...");
  const items = await fetchOptions("Item");
  console.log("Items:", items);
})();
*/