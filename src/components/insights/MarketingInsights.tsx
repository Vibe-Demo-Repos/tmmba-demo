import React, { useMemo } from "react";
import { SegmentationResult, SegmentMetrics } from "../../types/CustomerTypes";
import "./MarketingInsights.css";

interface MarketingInsightsProps {
  segmentationResult: SegmentationResult | null;
}

// Define an extended segment with marketing insights
interface SegmentInsights extends SegmentMetrics {
  marketingName: string;
  characteristics: string[];
  tactics: string[];
  genericROI: number;
  targetedROI: number;
  revenueImpact: number;
}

const MarketingInsights: React.FC<MarketingInsightsProps> = ({
  segmentationResult,
}) => {
  // Generate segment insights based on segmentation metrics
  const segmentInsights = useMemo(() => {
    if (!segmentationResult) return [];

    return segmentationResult.segmentMetrics
      .map((segment) => {
        // Generate a marketing-friendly name and insights based on segment characteristics
        const insights = generateSegmentInsights(
          segment,
          segmentationResult.totalRevenue
        );
        return {
          ...segment,
          ...insights,
        };
      })
      .sort((a, b) => b.revenueImpact - a.revenueImpact); // Sort by revenue impact (highest first)
  }, [segmentationResult]);

  if (!segmentationResult) {
    return (
      <div className="empty-insights">
        <p>Run segmentation analysis to view marketing insights</p>
      </div>
    );
  }

  return (
    <div className="marketing-insights">
      <div className="insights-header">
        <h3>Segment Marketing Insights</h3>
        <p className="insights-description">
          Tailored marketing recommendations based on customer segment analysis
        </p>
      </div>

      <div className="segments-grid">
        {segmentInsights.map((segment, index) => (
          <div className="segment-insight-card" key={index}>
            <div className="segment-insight-header">
              <h4 className="segment-marketing-name">
                {segment.marketingName}
              </h4>
              <div className="segment-metrics-summary">
                <div className="metric">
                  <span className="metric-value">{segment.customerCount}</span>
                  <span className="metric-label">Customers</span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    ${Math.round(segment.totalRevenue)}
                  </span>
                  <span className="metric-label">Revenue</span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    ${Math.round(segment.avgOrderValue)}
                  </span>
                  <span className="metric-label">AOV</span>
                </div>
              </div>
            </div>

            <div className="segment-insight-body">
              <div className="segment-section">
                <h5>Segment Characteristics</h5>
                <ul className="characteristics-list">
                  {segment.characteristics.map((characteristic, i) => (
                    <li key={i}>{characteristic}</li>
                  ))}
                </ul>
              </div>

              <div className="segment-section">
                <h5>Recommended Marketing Tactics</h5>
                <ul className="tactics-list">
                  {segment.tactics.map((tactic, i) => (
                    <li key={i}>{tactic}</li>
                  ))}
                </ul>
              </div>

              <div className="segment-section roi-section">
                <h5>Revenue Impact Analysis</h5>
                <div className="roi-comparison">
                  <div className="roi-metric">
                    <span className="roi-value">
                      {(segment.genericROI * 100).toFixed(1)}%
                    </span>
                    <span className="roi-label">Generic Campaign ROI</span>
                  </div>
                  <div className="roi-arrow">→</div>
                  <div className="roi-metric targeted">
                    <span className="roi-value">
                      {(segment.targetedROI * 100).toFixed(1)}%
                    </span>
                    <span className="roi-label">Targeted Campaign ROI</span>
                  </div>
                </div>
                <div className="revenue-impact">
                  <span className="impact-label">
                    Estimated Annual Revenue Impact:{" "}
                  </span>
                  <span className="impact-value">
                    +${Math.round(segment.revenueImpact).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="insights-summary">
        <h4>Overall Marketing Strategy Recommendations</h4>
        <p>
          Focus your highest marketing spend on the top 2-3 segments by revenue
          impact. These segments represent the greatest opportunity for
          increased revenue through personalized marketing tactics.
        </p>
        <div className="impact-total">
          <span>Total Potential Revenue Impact: </span>
          <span className="total-value">
            +$
            {Math.round(
              segmentInsights.reduce((sum, s) => sum + s.revenueImpact, 0)
            ).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate segment insights based on segment characteristics
const generateSegmentInsights = (
  segment: SegmentMetrics,
  totalRevenue: number
): Omit<SegmentInsights, keyof SegmentMetrics> => {
  const {
    segmentName,
    avgRecencyDays,
    avgPurchaseFrequency,
    avgOrderValue,
    totalRevenue: segmentRevenue,
  } = segment;

  // Default values
  let marketingName = segmentName;
  let characteristics: string[] = [];
  let tactics: string[] = [];
  let genericROI = 0.05; // Default 5% ROI for generic marketing
  let targetedROI = 0.12; // Default 12% ROI for targeted marketing

  // Determine segment type based on metrics and name
  if (
    segmentName.includes("Champion") ||
    segmentName.includes("Loyal") ||
    segmentName.includes("High-Value")
  ) {
    // High value, frequent customers
    marketingName = "VIP Enthusiasts";
    characteristics = [
      `Frequent shoppers averaging ${avgPurchaseFrequency.toFixed(
        1
      )} purchases in 6 months`,
      `High average order value of $${Math.round(avgOrderValue)}`,
      `Recent purchase within the last ${Math.round(avgRecencyDays)} days`,
      `Represents ${segment.percentageOfRevenue.toFixed(1)}% of total revenue`,
    ];
    tactics = [
      "Exclusive early access to new product launches",
      "VIP rewards program with tiered benefits",
      "Personal shopping assistant via chat/email",
      "Surprise loyalty gifts with purchases",
      "Invitation to exclusive events and experiences",
    ];
    genericROI = 0.07;
    targetedROI = 0.18;
  } else if (
    segmentName.includes("Big Spender") ||
    segmentName.includes("Occasional Big")
  ) {
    // High AOV but less frequent
    marketingName = "Premium Occasional Shoppers";
    characteristics = [
      `High average order value of $${Math.round(avgOrderValue)}`,
      `Less frequent purchases (${avgPurchaseFrequency.toFixed(
        1
      )} in 6 months)`,
      `Last purchase ${Math.round(avgRecencyDays)} days ago`,
      `Values quality over quantity in purchasing decisions`,
    ];
    tactics = [
      "Premium product recommendations based on past purchases",
      "Free shipping on orders over a certain value",
      "Curated collections and limited editions",
      "Extended warranty or premium service options",
      "Luxury packaging and personalization options",
    ];
    genericROI = 0.04;
    targetedROI = 0.15;
  } else if (
    segmentName.includes("Potential") ||
    segmentName.includes("Promising") ||
    segmentName.includes("New")
  ) {
    // New or growing customers
    marketingName = "Growth Opportunity Customers";
    characteristics = [
      `Relatively new to the brand (${Math.round(
        avgRecencyDays
      )} days since first purchase)`,
      `Moderate purchase frequency (${avgPurchaseFrequency.toFixed(
        1
      )} purchases)`,
      `Average order value of $${Math.round(avgOrderValue)}`,
      `Showing interest but not yet fully engaged`,
    ];
    tactics = [
      "Second purchase incentives with personalized discounts",
      "Educational content about product value and usage",
      "Category expansion recommendations",
      "Brand story and values communication",
      "Social proof and customer testimonials",
    ];
    genericROI = 0.06;
    targetedROI = 0.16;
  } else if (
    segmentName.includes("Risk") ||
    segmentName.includes("At-Risk") ||
    segmentName.includes("About To Sleep")
  ) {
    // At risk customers
    marketingName = "Reengagement Targets";
    characteristics = [
      `Declining purchase frequency (${avgPurchaseFrequency.toFixed(
        1
      )} purchases in 6 months)`,
      `${Math.round(avgRecencyDays)} days since last purchase`,
      `Previous average order value of $${Math.round(avgOrderValue)}`,
      `Historically valuable customers showing signs of churn`,
    ];
    tactics = [
      "Re-engagement campaign with personalized incentive",
      "Feedback survey with discount reward",
      "New product line introduction with exclusive preview",
      'Personalized "We miss you" communication',
      "Cross-sell based on previous purchase history",
    ];
    genericROI = 0.03;
    targetedROI = 0.14;
  } else if (
    segmentName.includes("Lost") ||
    segmentName.includes("Dormant") ||
    segmentName.includes("Hibernat")
  ) {
    // Lost or dormant customers
    marketingName = "Win-Back Candidates";
    characteristics = [
      `Inactive for ${Math.round(avgRecencyDays)} days`,
      `Historical average order value of $${Math.round(avgOrderValue)}`,
      `Previously completed ${avgPurchaseFrequency.toFixed(1)} purchases`,
      `No recent engagement with marketing communications`,
    ];
    tactics = [
      "Win-back campaign with substantial one-time discount",
      "Brand reintroduction highlighting new products/features",
      "Request for feedback on why they left",
      "Retargeting ads showcasing new collections",
      "Special incentive for first purchase after return",
    ];
    genericROI = 0.01;
    targetedROI = 0.09;
  } else {
    // Default for other segments
    marketingName = "General Segment";
    characteristics = [
      `${Math.round(avgRecencyDays)} days since last purchase`,
      `${avgPurchaseFrequency.toFixed(1)} purchases in last 6 months`,
      `Average order value of $${Math.round(avgOrderValue)}`,
      `Represents ${segment.percentageOfRevenue.toFixed(1)}% of total revenue`,
    ];
    tactics = [
      "Targeted email campaigns based on browsing history",
      "Personalized product recommendations",
      "Seasonal promotions aligned with purchase patterns",
      "Customer feedback surveys with incentives",
      "Loyalty program enrollment encouragement",
    ];
  }

  // Calculate projected revenue impact of targeted marketing
  // Based on the difference between generic and targeted ROI
  const marketingBudget = segmentRevenue * 0.15; // Assume marketing budget is 15% of segment revenue
  const genericReturn = marketingBudget * genericROI;
  const targetedReturn = marketingBudget * targetedROI;
  const revenueImpact = targetedReturn - genericReturn;

  return {
    marketingName,
    characteristics,
    tactics,
    genericROI,
    targetedROI,
    revenueImpact,
  };
};

export default MarketingInsights;
