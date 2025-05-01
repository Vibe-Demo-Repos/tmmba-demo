import {
  Customer,
  RFMCustomer,
  SegmentMetrics,
  SegmentationResult,
} from "../types/CustomerTypes";

class RFMSegmentationService {
  // Default number of clusters for k-means
  private readonly DEFAULT_CLUSTERS = 5;

  // Maps for segment naming based on RFM scores
  private readonly SEGMENT_NAMES: Record<string, string> = {
    "555": "Champions",
    "554": "Loyal Customers",
    "544": "Potential Loyalists",
    "545": "Recent Big Spenders",
    "454": "Promising",
    "455": "New High Potential",
    "445": "Need Attention",
    "444": "Core Customers",
    "435": "At Risk Big Spenders",
    "353": "About To Sleep",
    "344": "At Risk",
    "335": "Wake Up Calls",
    "334": "Can't Lose Them",
    "325": "Hibernating",
    "324": "Almost Lost",
    "315": "Lost High Spenders",
    "314": "Lost",
    "215": "Lost Cheap Customers",
    "214": "Lost Bargain Hunters",
    "115": "Lost Budget Customers",
  };

  // Alternate segment names based on cluster behaviors
  private readonly CLUSTER_NAMES: string[] = [
    "High-Value Regulars",
    "Occasional Big Spenders",
    "New Potentials",
    "At-Risk Customers",
    "Dormant Customers",
    "One-Time Shoppers",
    "Loyal Budget Buyers",
    "Seasonal Shoppers",
  ];

  /**
   * Analyze customers and segment them based on RFM scores
   * @param customers Array of customer data
   * @param clusterCount Optional number of clusters (default: 5)
   * @returns Segmentation result with customer segments and metrics
   */
  public analyzeCustomers(
    customers: Customer[],
    clusterCount: number = this.DEFAULT_CLUSTERS
  ): SegmentationResult {
    if (!customers || customers.length === 0) {
      throw new Error("No customer data provided for analysis");
    }

    // 1. Assign RFM scores to each customer
    const scoredCustomers = this.assignRFMScores(customers);

    // 2. Apply k-means clustering
    const clusteredCustomers = this.applyKMeansClustering(
      scoredCustomers,
      clusterCount
    );

    // 3. Assign segment names
    const segmentedCustomers = this.assignSegmentNames(clusteredCustomers);

    // 4. Calculate segment metrics
    const segmentMetrics = this.calculateSegmentMetrics(segmentedCustomers);

    // 5. Return the complete analysis
    const totalRevenue = segmentedCustomers.reduce(
      (sum, customer) => sum + customer.total_spend_6mo,
      0
    );

    return {
      segmentedCustomers,
      segmentMetrics,
      totalCustomers: customers.length,
      totalRevenue,
    };
  }

  /**
   * Assign RFM scores to each customer based on quartiles
   * @param customers Raw customer data
   * @returns Customers with RFM scores
   */
  private assignRFMScores(customers: Customer[]): RFMCustomer[] {
    // Create a copy of customers to avoid mutating the original
    const customersData = [...customers];

    // Calculate quintiles for RFM metrics
    const recencySorted = [...customersData].sort(
      (a, b) => a.days_since_last_purchase - b.days_since_last_purchase
    );
    const frequencySorted = [...customersData].sort(
      (a, b) => b.purchase_count_6mo - a.purchase_count_6mo
    );
    const monetarySorted = [...customersData].sort(
      (a, b) => b.total_spend_6mo - a.total_spend_6mo
    );

    const quintileSize = Math.ceil(customersData.length / 5);

    // Create RFM quintile thresholds
    const recencyThresholds = [
      recencySorted[quintileSize - 1]?.days_since_last_purchase ?? 0,
      recencySorted[quintileSize * 2 - 1]?.days_since_last_purchase ?? 0,
      recencySorted[quintileSize * 3 - 1]?.days_since_last_purchase ?? 0,
      recencySorted[quintileSize * 4 - 1]?.days_since_last_purchase ?? 0,
    ];

    const frequencyThresholds = [
      frequencySorted[quintileSize - 1]?.purchase_count_6mo ?? 0,
      frequencySorted[quintileSize * 2 - 1]?.purchase_count_6mo ?? 0,
      frequencySorted[quintileSize * 3 - 1]?.purchase_count_6mo ?? 0,
      frequencySorted[quintileSize * 4 - 1]?.purchase_count_6mo ?? 0,
    ];

    const monetaryThresholds = [
      monetarySorted[quintileSize - 1]?.total_spend_6mo ?? 0,
      monetarySorted[quintileSize * 2 - 1]?.total_spend_6mo ?? 0,
      monetarySorted[quintileSize * 3 - 1]?.total_spend_6mo ?? 0,
      monetarySorted[quintileSize * 4 - 1]?.total_spend_6mo ?? 0,
    ];

    // Assign scores to each customer
    return customersData.map((customer) => {
      // For recency, lower is better (1 = most recent, 5 = least recent)
      let r_score = 5;
      if (customer.days_since_last_purchase <= recencyThresholds[0]) {
        r_score = 5;
      } else if (customer.days_since_last_purchase <= recencyThresholds[1]) {
        r_score = 4;
      } else if (customer.days_since_last_purchase <= recencyThresholds[2]) {
        r_score = 3;
      } else if (customer.days_since_last_purchase <= recencyThresholds[3]) {
        r_score = 2;
      } else {
        r_score = 1;
      }

      // For frequency and monetary, higher is better
      let f_score = 1;
      if (customer.purchase_count_6mo >= frequencyThresholds[0]) {
        f_score = 5;
      } else if (customer.purchase_count_6mo >= frequencyThresholds[1]) {
        f_score = 4;
      } else if (customer.purchase_count_6mo >= frequencyThresholds[2]) {
        f_score = 3;
      } else if (customer.purchase_count_6mo >= frequencyThresholds[3]) {
        f_score = 2;
      } else {
        f_score = 1;
      }

      let m_score = 1;
      if (customer.total_spend_6mo >= monetaryThresholds[0]) {
        m_score = 5;
      } else if (customer.total_spend_6mo >= monetaryThresholds[1]) {
        m_score = 4;
      } else if (customer.total_spend_6mo >= monetaryThresholds[2]) {
        m_score = 3;
      } else if (customer.total_spend_6mo >= monetaryThresholds[3]) {
        m_score = 2;
      } else {
        m_score = 1;
      }

      // Calculate combined RFM score (weighted)
      const rfm_score = r_score * 0.35 + f_score * 0.3 + m_score * 0.35;

      return {
        ...customer,
        r_score,
        f_score,
        m_score,
        rfm_score,
        segment: "", // Will be assigned later
        cluster: -1, // Will be assigned by k-means
      };
    });
  }

  /**
   * Implement a simple k-means clustering algorithm for RFM scores
   * @param customers Customers with RFM scores
   * @param k Number of clusters
   * @returns Customers with cluster assignments
   */
  private applyKMeansClustering(
    customers: RFMCustomer[],
    k: number
  ): RFMCustomer[] {
    // Copy the customers array to avoid mutations
    const data = [...customers];
    const n = data.length;

    if (n <= k) {
      // If we have fewer customers than clusters, assign one per cluster
      return data.map((customer, index) => ({
        ...customer,
        cluster: index,
      }));
    }

    // Initialize centroids randomly
    const centroids: Array<[number, number, number]> = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < k; i++) {
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * n);
      } while (usedIndices.has(randomIndex));

      usedIndices.add(randomIndex);
      const customer = data[randomIndex];
      centroids.push([customer.r_score, customer.f_score, customer.m_score]);
    }

    // Track cluster assignments
    const clusters = new Array(n).fill(-1);

    // Maximum iterations to prevent infinite loops
    const MAX_ITERATIONS = 100;
    let iterations = 0;
    let changed = true;

    // Iterate until convergence or max iterations
    while (changed && iterations < MAX_ITERATIONS) {
      changed = false;
      iterations++;

      // Assign each customer to the nearest centroid
      for (let i = 0; i < n; i++) {
        const customer = data[i];
        const point: [number, number, number] = [
          customer.r_score,
          customer.f_score,
          customer.m_score,
        ];

        let minDistance = Infinity;
        let closestCluster = -1;

        // Find the closest centroid
        for (let j = 0; j < k; j++) {
          const distance = this.euclideanDistance(point, centroids[j]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = j;
          }
        }

        // Check if the cluster assignment changed
        if (clusters[i] !== closestCluster) {
          clusters[i] = closestCluster;
          changed = true;
        }
      }

      // Recalculate centroids
      const clusterSums: Array<[number, number, number, number]> = Array(k)
        .fill(0)
        .map(() => [0, 0, 0, 0]);

      for (let i = 0; i < n; i++) {
        const cluster = clusters[i];
        const customer = data[i];

        clusterSums[cluster][0] += customer.r_score;
        clusterSums[cluster][1] += customer.f_score;
        clusterSums[cluster][2] += customer.m_score;
        clusterSums[cluster][3] += 1; // Count of customers in this cluster
      }

      // Update centroids to the average of all points in the cluster
      for (let j = 0; j < k; j++) {
        const count = clusterSums[j][3];
        if (count > 0) {
          centroids[j] = [
            clusterSums[j][0] / count,
            clusterSums[j][1] / count,
            clusterSums[j][2] / count,
          ];
        }
      }
    }

    // Assign clusters to customers
    return data.map((customer, index) => ({
      ...customer,
      cluster: clusters[index],
    }));
  }

  /**
   * Calculate the Euclidean distance between two points
   */
  private euclideanDistance(
    pointA: [number, number, number],
    pointB: [number, number, number]
  ): number {
    const [x1, y1, z1] = pointA;
    const [x2, y2, z2] = pointB;

    return Math.sqrt(
      Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
    );
  }

  /**
   * Assign segment names based on RFM scores and cluster characteristics
   * @param customers Clustered customers
   * @returns Customers with segment names
   */
  private assignSegmentNames(customers: RFMCustomer[]): RFMCustomer[] {
    // Group customers by cluster
    const clusters: Record<number, RFMCustomer[]> = {};

    customers.forEach((customer) => {
      const clusterId = customer.cluster;
      if (!clusters[clusterId]) {
        clusters[clusterId] = [];
      }
      clusters[clusterId].push(customer);
    });

    // Calculate cluster characteristics
    const clusterCharacteristics: Record<
      number,
      { avgR: number; avgF: number; avgM: number }
    > = {};

    Object.entries(clusters).forEach(([clusterId, clusterCustomers]) => {
      const id = parseInt(clusterId);
      const count = clusterCustomers.length;

      const avgR =
        clusterCustomers.reduce((sum, c) => sum + c.r_score, 0) / count;
      const avgF =
        clusterCustomers.reduce((sum, c) => sum + c.f_score, 0) / count;
      const avgM =
        clusterCustomers.reduce((sum, c) => sum + c.m_score, 0) / count;

      clusterCharacteristics[id] = { avgR, avgF, avgM };
    });

    // Rank clusters by combined RFM and assign descriptive names
    const clusterRanking = Object.entries(clusterCharacteristics)
      .map(([clusterId, { avgR, avgF, avgM }]) => ({
        id: parseInt(clusterId),
        combined: avgR * 100 + avgF * 10 + avgM,
      }))
      .sort((a, b) => b.combined - a.combined);

    // Create mapping of cluster ID to segment name
    const clusterToSegmentMap: Record<number, string> = {};

    clusterRanking.forEach((cluster, index) => {
      const segmentIndex = Math.min(index, this.CLUSTER_NAMES.length - 1);
      clusterToSegmentMap[cluster.id] = this.CLUSTER_NAMES[segmentIndex];
    });

    // Assign segment names to customers
    return customers.map((customer) => {
      // First, try to get a precise segment name based on RFM combination
      const rfmKey = `${customer.r_score}${customer.f_score}${customer.m_score}`;
      const preciseSegment = this.SEGMENT_NAMES[rfmKey];

      // If no precise match, use the cluster-based name
      const segment = preciseSegment || clusterToSegmentMap[customer.cluster];

      return {
        ...customer,
        segment: segment || "Uncategorized", // Fallback name if all else fails
      };
    });
  }

  /**
   * Calculate metrics for each segment
   * @param customers Segmented customers
   * @returns Array of segment metrics
   */
  private calculateSegmentMetrics(customers: RFMCustomer[]): SegmentMetrics[] {
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce(
      (sum, c) => sum + c.total_spend_6mo,
      0
    );

    // Group customers by segment
    const segments: Record<string, RFMCustomer[]> = {};

    customers.forEach((customer) => {
      const segment = customer.segment;
      if (!segments[segment]) {
        segments[segment] = [];
      }
      segments[segment].push(customer);
    });

    // Calculate metrics for each segment
    return Object.entries(segments)
      .map(([segmentName, segmentCustomers]) => {
        const customerCount = segmentCustomers.length;
        const percentageOfTotal = (customerCount / totalCustomers) * 100;

        const segmentRevenue = segmentCustomers.reduce(
          (sum, c) => sum + c.total_spend_6mo,
          0
        );
        const percentageOfRevenue = (segmentRevenue / totalRevenue) * 100;

        const avgRecencyDays =
          segmentCustomers.reduce(
            (sum, c) => sum + c.days_since_last_purchase,
            0
          ) / customerCount;
        const avgPurchaseFrequency =
          segmentCustomers.reduce((sum, c) => sum + c.purchase_count_6mo, 0) /
          customerCount;

        // Calculate average order value (AOV)
        const totalPurchases = segmentCustomers.reduce(
          (sum, c) => sum + c.purchase_count_6mo,
          0
        );
        const avgOrderValue =
          totalPurchases > 0 ? segmentRevenue / totalPurchases : 0;

        return {
          segmentName,
          customerCount,
          percentageOfTotal,
          avgRecencyDays,
          avgPurchaseFrequency,
          avgOrderValue,
          totalRevenue: segmentRevenue,
          percentageOfRevenue,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue (highest first)
  }
}

// Create and export a single instance of the service
const rfmSegmentationService = new RFMSegmentationService();
export default rfmSegmentationService;
