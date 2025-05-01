// Basic customer data structure
export interface Customer {
  customer_id: string;
  days_since_last_purchase: number;
  purchase_count_6mo: number;
  total_spend_6mo: number;
  product_categories: string;
  customer_age_range: string;
  acquisition_channel: string;
}

// RFM scored customer
export interface RFMCustomer extends Customer {
  r_score: number; // Recency score (1-5)
  f_score: number; // Frequency score (1-5)
  m_score: number; // Monetary score (1-5)
  rfm_score: number; // Combined RFM score
  segment: string; // Segment name
  cluster: number; // Cluster ID from k-means
}

// Segment metrics
export interface SegmentMetrics {
  segmentName: string;
  customerCount: number;
  percentageOfTotal: number;
  avgRecencyDays: number;
  avgPurchaseFrequency: number;
  avgOrderValue: number;
  totalRevenue: number;
  percentageOfRevenue: number;
}

// Analysis results
export interface SegmentationResult {
  segmentedCustomers: RFMCustomer[];
  segmentMetrics: SegmentMetrics[];
  totalCustomers: number;
  totalRevenue: number;
}
