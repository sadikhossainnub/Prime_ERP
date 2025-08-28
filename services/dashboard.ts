import { apiRequest, getDocCount } from "./api";

// Dashboard data
export const getDashboardData = async () => {
  // Remove session-based filtering for API token authentication
  const filters = "";

  const [
    salesOrders,
    customerCount,
    itemCount,
    leadCount,
    opportunityCount,
    quotationCount,
    salesInvoiceItems,
  ] = await Promise.all([
    apiRequest(`Sales Order?fields=["name","grand_total","transaction_date"]${filters}`),
    getDocCount("Customer"),
    getDocCount("Item"),
    getDocCount("Lead"),
    getDocCount("Opportunity"),
    getDocCount("Quotation"),
    apiRequest(`Sales Invoice?fields=["items.item_name","items.amount"]`),
  ]);

  // --- KPI values ---
  const totalSales = salesOrders.data.reduce((sum: number, so: any) => sum + so.grand_total, 0);

  // --- Bar chart data (sales by date) ---
  const salesByDate: Record<string, number> = {};
  salesOrders.data.forEach((so: any) => {
    const date = so.transaction_date;
    salesByDate[date] = (salesByDate[date] || 0) + so.grand_total;
  });

  // --- Pie chart data (top items) ---
  const itemSales: Record<string, number> = {};
  salesInvoiceItems.data.forEach((invoice: any) => {
    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach((item: any) => {
        if (item.item_name) {
          itemSales[item.item_name] = (itemSales[item.item_name] || 0) + item.amount;
        }
      });
    }
  });

  const sortedItems = Object.entries(itemSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topItemsColors = ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"];
  const topItems = sortedItems.map(([name, population], index) => ({
    name,
    population,
    color: topItemsColors[index % topItemsColors.length],
    legendFontColor: "#333",
    legendFontSize: 12,
  }));

  // --- Sales pipeline data ---
  const salesPipelineData = [
    { name: "Prospecting", value: leadCount, color: "#a953c6" },
    { name: "Qualification", value: opportunityCount, color: "#00b8a9" },
    { name: "Meeting or Demo", value: quotationCount, color: "#f44336" },
    { name: "Proposal and Negotiation", value: quotationCount, color: "#ff9800" },
    { name: "Close", value: salesOrders.data.length, color: "#00bcd4" },
  ];

  return {
    salesCount: salesOrders.data.length,
    totalSales,
    customerCount,
    itemCount,
    salesByDate,
    topItems,
    salesPipelineData,
  };
};
