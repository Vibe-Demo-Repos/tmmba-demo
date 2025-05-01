import { useState } from "react";
import "./DataGenerator.css";

// Define the structure of our customer data
interface Customer {
  customer_id: string;
  days_since_last_purchase: number;
  purchase_count_6mo: number;
  total_spend_6mo: number;
  product_categories: string;
  customer_age_range: string;
  acquisition_channel: string;
}

interface DataGeneratorProps {
  onDataGenerated?: (customers: Customer[]) => void;
}

const DataGenerator: React.FC<DataGeneratorProps> = ({ onDataGenerated }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const itemsPerPage = 10;

  // Helper function to generate a random integer between min and max (inclusive)
  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Helper function to get a random element from an array
  const getRandomElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // Helper function to get a random subset of elements from an array
  const getRandomSubset = <T,>(
    array: T[],
    minItems: number,
    maxItems: number
  ): T[] => {
    const count = getRandomInt(minItems, maxItems);
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Generate realistic customer data
  const generateCustomerData = (count: number): Customer[] => {
    const productCategories = [
      "clothing",
      "accessories",
      "footwear",
      "home",
      "beauty",
      "electronics",
      "jewelry",
      "sports",
      "outdoor",
    ];
    const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
    const acquisitionChannels = [
      "social",
      "search",
      "referral",
      "direct",
      "email",
      "partnership",
    ];

    const newCustomers: Customer[] = [];

    for (let i = 1; i <= count; i++) {
      // Generate customer ID with format C-XXXXX
      const customerId = `C-${String(10000 + i).padStart(5, "0")}`;

      // Recent customers tend to buy more frequently
      const daysSinceLastPurchase = getRandomInt(1, 180);

      // Higher frequency generally correlates with higher monetary value
      const purchaseBase = Math.max(
        1,
        Math.floor(15 - daysSinceLastPurchase / 20)
      );
      const purchaseCount = getRandomInt(
        purchaseBase,
        purchaseBase + getRandomInt(0, 5)
      );

      // Average order value between $50-200, with some variation
      const avgOrderValue = getRandomInt(50, 200);

      // Add some randomness to total spend based on purchase count
      const baseSpend = purchaseCount * avgOrderValue;
      const totalSpend = Math.round(baseSpend * (0.8 + Math.random() * 0.4));

      // Select 1-3 random product categories
      const categories = getRandomSubset(productCategories, 1, 3).join(",");

      // Select a random age range and acquisition channel
      const ageRange = getRandomElement(ageRanges);
      const channel = getRandomElement(acquisitionChannels);

      newCustomers.push({
        customer_id: customerId,
        days_since_last_purchase: daysSinceLastPurchase,
        purchase_count_6mo: purchaseCount,
        total_spend_6mo: totalSpend,
        product_categories: categories,
        customer_age_range: ageRange,
        acquisition_channel: channel,
      });
    }

    return newCustomers;
  };

  // Handle data generation
  const handleGenerateData = () => {
    setIsGenerating(true);
    setCurrentPage(1);

    // Use setTimeout to allow UI to update with "Generating..." message
    setTimeout(() => {
      const count = getRandomInt(300, 500);
      const newData = generateCustomerData(count);
      setCustomers(newData);

      // Pass the data up to the parent component if callback exists
      if (onDataGenerated) {
        onDataGenerated(newData);
      }

      setIsGenerating(false);
    }, 500);
  };

  // Export data as CSV
  const handleExportCSV = () => {
    if (customers.length === 0) return;

    // Define the CSV headers
    const headers = [
      "customer_id",
      "days_since_last_purchase",
      "purchase_count_6mo",
      "total_spend_6mo",
      "product_categories",
      "customer_age_range",
      "acquisition_channel",
    ].join(",");

    // Convert customers to CSV rows
    const csvRows = customers.map((customer) => {
      return [
        customer.customer_id,
        customer.days_since_last_purchase,
        customer.purchase_count_6mo,
        customer.total_spend_6mo,
        `"${customer.product_categories}"`, // Wrap in quotes to handle commas
        customer.customer_age_range,
        customer.acquisition_channel,
      ].join(",");
    });

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "retail_customer_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination logic
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, customers.length);
  const currentCustomers = customers.slice(startIndex, endIndex);

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="data-generator">
      <div className="control-panel">
        <button
          className="generate-button"
          onClick={handleGenerateData}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Sample Data"}
        </button>
        <button
          className="export-button"
          onClick={handleExportCSV}
          disabled={customers.length === 0 || isGenerating}
        >
          Export as CSV
        </button>
      </div>

      {customers.length > 0 ? (
        <div className="data-preview">
          <h3>Generated Customer Data ({customers.length} records)</h3>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Recency (Days)</th>
                  <th>Frequency (6mo)</th>
                  <th>Monetary (6mo)</th>
                  <th>Categories</th>
                  <th>Age Range</th>
                  <th>Channel</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.days_since_last_purchase}</td>
                    <td>{customer.purchase_count_6mo}</td>
                    <td>${customer.total_spend_6mo}</td>
                    <td>{customer.product_categories}</td>
                    <td>{customer.customer_age_range}</td>
                    <td>{customer.acquisition_channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
                &laquo;
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          {isGenerating ? (
            <p>Generating customer data...</p>
          ) : (
            <p>
              Click "Generate Sample Data" to create sample retail customer
              data.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DataGenerator;
