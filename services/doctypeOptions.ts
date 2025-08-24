import { apiRequest } from './api';

async function fetchOptions(doctype: string, search = '') {
  try {
    let fieldsToFetch = ["name"];
    let titleField = "name";

    // Always use 'name' as the title field to avoid server errors
    fieldsToFetch.push("name");

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