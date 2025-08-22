import { apiRequest } from './api';

async function fetchOptions(doctype: string, search = '') {
  try {
    let fieldsToFetch = ["name"];
    let titleField = "name";

    if (doctype === "Customer") {
      // For Customer, do not fetch 'title' field, as it causes a Frappe DataError
      // The name field will be used for both value and label
    } else {
      // 1. Get the title field for the doctype
      const titleRes = await apiRequest(`method/frappe.desk.search.get_title_field`, {
        params: { doctype },
      });
      titleField = titleRes.message || "name";
      fieldsToFetch.push(titleField);
    }

    // 2. Fetch options with name (+ title field if not Customer)
    const res = await apiRequest(`resource/${encodeURIComponent(doctype)}`, {
      params: {
        fields: JSON.stringify(fieldsToFetch),
        order_by: "modified desc",
        filters: search ? `[["name", "like", "%${search}%"]]` : undefined,
      },
    });

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