import { useState } from "react";
import {
  Customer,
  SegmentationResult,
  SegmentMetrics,
  RFMCustomer,
} from "../../types/CustomerTypes";
import rfmSegmentationService from "../../services/RFMSegmentationService";
import SegmentationDashboard from "../visualization/SegmentationDashboard";
import MarketingInsights from "../insights/MarketingInsights";
import "./CustomerSegmentation.css";

interface CustomerSegmentationProps {
  customers: Customer[];
}

const CustomerSegmentation: React.FC<CustomerSegmentationProps> = ({
  customers,
}) => {
  const [segmentationResult, setSegmentationResult] =
    useState<SegmentationResult | null>(null);
  const [segmentDetailsOpen, setSegmentDetailsOpen] = useState<
    Record<string, boolean>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clusterCount, setClusterCount] = useState(5);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "segments" | "customers" | "marketing"
  >("dashboard");

  // Run segmentation analysis on customer data
  const runSegmentation = () => {
    if (!customers || customers.length === 0) {
      alert("No customer data available for segmentation");
      return;
    }

    setIsAnalyzing(true);

    // Use setTimeout to prevent UI freeze on large datasets
    setTimeout(() => {
      try {
        const result = rfmSegmentationService.analyzeCustomers(
          customers,
          clusterCount
        );
        setSegmentationResult(result);

        // Initialize all segments as closed
        const initialSegmentState: Record<string, boolean> = {};
        result.segmentMetrics.forEach((segment) => {
          initialSegmentState[segment.segmentName] = false;
        });
        setSegmentDetailsOpen(initialSegmentState);

        setActiveTab("dashboard");
      } catch (error) {
        console.error("Error during customer segmentation:", error);
        alert("An error occurred during segmentation analysis");
      } finally {
        setIsAnalyzing(false);
      }
    }, 100);
  };

  // Toggle a segment's expanded details
  const toggleSegmentDetails = (segmentName: string) => {
    setSegmentDetailsOpen((prev) => ({
      ...prev,
      [segmentName]: !prev[segmentName],
    }));
  };

  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + "%";
  };

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return "$" + value.toFixed(2);
  };

  // Get CSS class based on score value (1-5)
  const getScoreClass = (score: number): string => {
    const classes = [
      "score-very-low",
      "score-low",
      "score-medium",
      "score-high",
      "score-very-high",
    ];
    return classes[Math.min(Math.floor(score) - 1, 4)];
  };

  return (
    <div className="customer-segmentation">
      <div className="segmentation-controls">
        <div className="control-group">
          <label htmlFor="cluster-count">Number of Clusters:</label>
          <input
            id="cluster-count"
            type="number"
            min="2"
            max="10"
            value={clusterCount}
            onChange={(e) => setClusterCount(parseInt(e.target.value) || 5)}
          />
        </div>

        <button
          className="analyze-button"
          onClick={runSegmentation}
          disabled={isAnalyzing || customers.length === 0}
        >
          {isAnalyzing ? "Analyzing..." : "Run RFM Segmentation"}
        </button>
      </div>

      {segmentationResult ? (
        <div className="segmentation-results">
          <div className="segmentation-summary">
            <div className="summary-item">
              <span className="summary-label">Total Customers:</span>
              <span className="summary-value">
                {segmentationResult.totalCustomers}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Revenue:</span>
              <span className="summary-value">
                {formatCurrency(segmentationResult.totalRevenue)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Customer Segments:</span>
              <span className="summary-value">
                {segmentationResult.segmentMetrics.length}
              </span>
            </div>
          </div>

          <div className="results-tabs">
            <button
              className={`tab-button ${
                activeTab === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Visual Dashboard
            </button>
            <button
              className={`tab-button ${
                activeTab === "marketing" ? "active" : ""
              }`}
              onClick={() => setActiveTab("marketing")}
            >
              Marketing Insights
            </button>
            <button
              className={`tab-button ${
                activeTab === "segments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("segments")}
            >
              Segment Analysis
            </button>
            <button
              className={`tab-button ${
                activeTab === "customers" ? "active" : ""
              }`}
              onClick={() => setActiveTab("customers")}
            >
              Customer Data
            </button>
          </div>

          {activeTab === "dashboard" && (
            <SegmentationDashboard segmentationResult={segmentationResult} />
          )}

          {activeTab === "marketing" && (
            <MarketingInsights segmentationResult={segmentationResult} />
          )}

          {activeTab === "segments" && (
            <div className="segments-list">
              <h3>Customer Segments</h3>

              {segmentationResult.segmentMetrics.map(
                (segment: SegmentMetrics) => (
                  <div className="segment-card" key={segment.segmentName}>
                    <div
                      className="segment-header"
                      onClick={() => toggleSegmentDetails(segment.segmentName)}
                    >
                      <h4 className="segment-name">{segment.segmentName}</h4>
                      <div className="segment-summary">
                        <span className="segment-customer-count">
                          {segment.customerCount} customers
                        </span>
                        <span className="segment-percentage">
                          ({formatPercentage(segment.percentageOfTotal)})
                        </span>
                        <span className="segment-revenue">
                          {formatCurrency(segment.totalRevenue)}
                        </span>
                        <span
                          className={`segment-expand-icon ${
                            segmentDetailsOpen[segment.segmentName]
                              ? "expanded"
                              : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    {segmentDetailsOpen[segment.segmentName] && (
                      <div className="segment-details">
                        <div className="segment-metrics">
                          <div className="metric-item">
                            <span className="metric-label">Avg. Recency:</span>
                            <span className="metric-value">
                              {segment.avgRecencyDays.toFixed(1)} days
                            </span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">
                              Avg. Frequency:
                            </span>
                            <span className="metric-value">
                              {segment.avgPurchaseFrequency.toFixed(1)}{" "}
                              purchases
                            </span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">
                              Avg. Order Value:
                            </span>
                            <span className="metric-value">
                              {formatCurrency(segment.avgOrderValue)}
                            </span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Revenue Share:</span>
                            <span className="metric-value">
                              {formatPercentage(segment.percentageOfRevenue)}
                            </span>
                          </div>
                        </div>

                        <div className="segment-recommendations">
                          <h5>Recommended Actions:</h5>
                          <ul>
                            {segment.segmentName.includes("Champion") && (
                              <>
                                <li>Reward with loyalty program perks</li>
                                <li>Seek testimonials and referrals</li>
                                <li>Early access to new products</li>
                              </>
                            )}
                            {segment.segmentName.includes("Loyal") && (
                              <>
                                <li>Upsell higher-value products</li>
                                <li>Special member-only offers</li>
                                <li>Request reviews and feedback</li>
                              </>
                            )}
                            {segment.segmentName.includes("Potential") && (
                              <>
                                <li>Encourage regular purchasing patterns</li>
                                <li>Cross-sell related products</li>
                                <li>Send personalized recommendations</li>
                              </>
                            )}
                            {segment.segmentName.includes("New") && (
                              <>
                                <li>Welcome series with product education</li>
                                <li>First-time customer special offers</li>
                                <li>Encourage second purchase</li>
                              </>
                            )}
                            {segment.segmentName.includes("Risk") && (
                              <>
                                <li>Re-engagement campaign</li>
                                <li>Special "We miss you" discount</li>
                                <li>Request feedback on last experience</li>
                              </>
                            )}
                            {(segment.segmentName.includes("Sleep") ||
                              segment.segmentName.includes("Hibernat")) && (
                              <>
                                <li>Reactivation campaign</li>
                                <li>Survey to understand needs</li>
                                <li>Limited-time special offer</li>
                              </>
                            )}
                            {segment.segmentName.includes("Lost") && (
                              <>
                                <li>Win-back campaign with strong incentive</li>
                                <li>New product announcements</li>
                                <li>Request feedback about why they left</li>
                              </>
                            )}
                            {/* Default recommendations if no specific segment match */}
                            {!segment.segmentName.match(
                              /(Champion|Loyal|Potential|New|Risk|Sleep|Hibernat|Lost)/
                            ) && (
                              <>
                                <li>Analyze purchase patterns for insights</li>
                                <li>Test different marketing approaches</li>
                                <li>Segment-specific promotion strategy</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "customers" && (
            <div className="customer-list">
              <h3>Segmented Customer Data</h3>

              <div className="table-container">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Segment</th>
                      <th>R Score</th>
                      <th>F Score</th>
                      <th>M Score</th>
                      <th>Recency (Days)</th>
                      <th>Frequency</th>
                      <th>Monetary</th>
                      <th>Age Range</th>
                      <th>Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentationResult.segmentedCustomers.map(
                      (customer: RFMCustomer) => (
                        <tr
                          key={customer.customer_id}
                          className={`segment-${customer.segment
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <td>{customer.customer_id}</td>
                          <td>{customer.segment}</td>
                          <td className={getScoreClass(customer.r_score)}>
                            {customer.r_score}
                          </td>
                          <td className={getScoreClass(customer.f_score)}>
                            {customer.f_score}
                          </td>
                          <td className={getScoreClass(customer.m_score)}>
                            {customer.m_score}
                          </td>
                          <td>{customer.days_since_last_purchase}</td>
                          <td>{customer.purchase_count_6mo}</td>
                          <td>${customer.total_spend_6mo}</td>
                          <td>{customer.customer_age_range}</td>
                          <td>{customer.acquisition_channel}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          {isAnalyzing ? (
            <p>Analyzing customer data...</p>
          ) : (
            <p>
              {customers.length === 0
                ? "Generate customer data first, then run segmentation analysis"
                : 'Click "Run RFM Segmentation" to analyze customer data'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSegmentation;
