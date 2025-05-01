import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import {
  SegmentationResult,
  RFMCustomer,
  SegmentMetrics,
} from "../../types/CustomerTypes";
import "./SegmentationDashboard.css";

interface SegmentationDashboardProps {
  segmentationResult: SegmentationResult | null;
}

// Custom tooltip component for the scatter plot
const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const customer = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-id">{customer.customer_id}</p>
        <p className="tooltip-segment">Segment: {customer.segment}</p>
        <p className="tooltip-data">
          R: {customer.r_score}, F: {customer.f_score}, M: {customer.m_score}
        </p>
        <p className="tooltip-data">
          Recency: {customer.days_since_last_purchase} days
        </p>
        <p className="tooltip-data">
          Frequency: {customer.purchase_count_6mo} purchases
        </p>
        <p className="tooltip-data">Spend: ${customer.total_spend_6mo}</p>
      </div>
    );
  }
  return null;
};

// Generate colors for pie chart based on segment names
const getSegmentColor = (segmentName: string): string => {
  // Define some color mappings for common segment names
  const colorMap: Record<string, string> = {
    Champions: "#4CAF50",
    "Loyal Customers": "#8BC34A",
    "Potential Loyalists": "#CDDC39",
    "Recent Big Spenders": "#FFC107",
    Promising: "#FF9800",
    "New High Potential": "#FF5722",
    "At Risk": "#F44336",
    Dormant: "#9E9E9E",
    Lost: "#607D8B",
    "High-Value Regulars": "#3F51B5",
    "Occasional Big Spenders": "#2196F3",
    "New Potentials": "#00BCD4",
    "At-Risk Customers": "#E91E63",
    "Dormant Customers": "#9C27B0",
    "One-Time Shoppers": "#673AB7",
    "Loyal Budget Buyers": "#009688",
    "Seasonal Shoppers": "#795548",
  };

  // Check if we have a predefined color for this segment
  if (segmentName in colorMap) {
    return colorMap[segmentName];
  }

  // Otherwise generate a color based on the string (simple hash function)
  let hash = 0;
  for (let i = 0; i < segmentName.length; i++) {
    hash = segmentName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to RGB color
  const c = (hash & 0x00ffffff).toString(16).toUpperCase().padStart(6, "0");

  return `#${c}`;
};

// Format currency values
const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

// Format percentage values
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const SegmentationDashboard: React.FC<SegmentationDashboardProps> = ({
  segmentationResult,
}) => {
  // Return empty state if no data
  if (!segmentationResult) {
    return (
      <div className="empty-dashboard">
        <p>Run segmentation analysis to view the dashboard</p>
      </div>
    );
  }

  // Prepare data for scatter plot
  const scatterData = useMemo(() => {
    // Create a sample of customers for the scatter plot to avoid overcrowding
    const maxPoints = 200;
    const customers = segmentationResult.segmentedCustomers;

    if (customers.length <= maxPoints) {
      return customers;
    }

    // Sample customers evenly for visualization
    const step = Math.ceil(customers.length / maxPoints);
    const sampledCustomers = [];

    for (let i = 0; i < customers.length; i += step) {
      sampledCustomers.push(customers[i]);
    }

    return sampledCustomers;
  }, [segmentationResult.segmentedCustomers]);

  // Prepare data for segment distribution pie chart
  const pieData = useMemo(() => {
    return segmentationResult.segmentMetrics.map((segment) => ({
      name: segment.segmentName,
      value: segment.customerCount,
      percentage: segment.percentageOfTotal,
    }));
  }, [segmentationResult.segmentMetrics]);

  // Group customers by segment for rendering separate scatters
  const customersBySegment = useMemo(() => {
    const grouped: Record<string, RFMCustomer[]> = {};

    segmentationResult.segmentedCustomers.forEach((customer) => {
      const segment = customer.segment;
      if (!grouped[segment]) {
        grouped[segment] = [];
      }
      grouped[segment].push(customer);
    });

    return grouped;
  }, [segmentationResult.segmentedCustomers]);

  // Calculate segment names and colors for the scatter plot
  const segmentDetails = useMemo(() => {
    return Object.keys(customersBySegment).map((segmentName) => ({
      name: segmentName,
      color: getSegmentColor(segmentName),
    }));
  }, [customersBySegment]);

  return (
    <div className="segmentation-dashboard">
      <div className="dashboard-header">
        <h3>Customer Segmentation Dashboard</h3>
        <p className="dashboard-summary">
          {segmentationResult.totalCustomers} customers analyzed in{" "}
          {segmentationResult.segmentMetrics.length} segments
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Scatter Plot: Recency vs Frequency */}
        <div className="dashboard-card scatter-plot-card">
          <h4>Customer RFM Distribution</h4>
          <p className="card-description">
            Scatter plot of customers by Recency and Frequency scores
          </p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="r_score"
                  name="Recency Score"
                  domain={[0.5, 5.5]}
                  label={{
                    value: "Recency Score (5 = Most Recent)",
                    position: "bottom",
                    offset: 0,
                  }}
                  ticks={[1, 2, 3, 4, 5]}
                />
                <YAxis
                  type="number"
                  dataKey="f_score"
                  name="Frequency Score"
                  domain={[0.5, 5.5]}
                  label={{
                    value: "Frequency Score (5 = Most Frequent)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  ticks={[1, 2, 3, 4, 5]}
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Legend />

                {/* Render a separate scatter for each segment */}
                {segmentDetails.map((segment, index) => (
                  <Scatter
                    key={index}
                    name={segment.name}
                    data={customersBySegment[segment.name]}
                    fill={segment.color}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segment Distribution Pie Chart */}
        <div className="dashboard-card pie-chart-card">
          <h4>Customer Segment Distribution</h4>
          <p className="card-description">
            Relative size of each customer segment
          </p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={140}
                  paddingAngle={1}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) =>
                    `${name}: ${percentage.toFixed(1)}%`
                  }
                  labelLine={{ stroke: "var(--text-dark)", strokeWidth: 0.5 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getSegmentColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} customers (${props.payload.percentage.toFixed(
                      1
                    )}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segment Comparison Table */}
      <div className="dashboard-card comparison-table-card">
        <h4>Segment Metrics Comparison</h4>
        <p className="card-description">
          Key performance metrics for each customer segment
        </p>
        <div className="table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Customers</th>
                <th>% of Total</th>
                <th>Avg. Recency (days)</th>
                <th>Avg. Frequency (6mo)</th>
                <th>Avg. Order Value</th>
                <th>Total Revenue</th>
                <th>% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {segmentationResult.segmentMetrics.map((segment, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: `${getSegmentColor(
                      segment.segmentName
                    )}20`,
                  }}
                >
                  <td className="segment-name-cell">
                    <span
                      className="segment-color-indicator"
                      style={{
                        backgroundColor: getSegmentColor(segment.segmentName),
                      }}
                    />
                    {segment.segmentName}
                  </td>
                  <td>{segment.customerCount}</td>
                  <td>{formatPercentage(segment.percentageOfTotal)}</td>
                  <td>{segment.avgRecencyDays.toFixed(1)}</td>
                  <td>{segment.avgPurchaseFrequency.toFixed(1)}</td>
                  <td>{formatCurrency(segment.avgOrderValue)}</td>
                  <td>{formatCurrency(segment.totalRevenue)}</td>
                  <td>{formatPercentage(segment.percentageOfRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SegmentationDashboard;
