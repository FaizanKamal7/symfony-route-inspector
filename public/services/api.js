/**
 * API Service for Route Inspector
 * Handles all HTTP requests to backend endpoints
 */

export class RouteInspectorAPI {
  /**
   * @param {Object} endpoints - API endpoint URLs
   */
  constructor(endpoints) {
    this.endpoints = endpoints;
  }

  /**
   * Fetch all dashboard data in parallel
   * @returns {Promise<Object>} Combined data from all endpoints
   */
  async fetchAllData() {
    try {
      const [routes, grouped, tree, stats, analytics, sqlData, perfIssues] =
        await Promise.all([
          this.fetchRoutes(),
          this.fetchGroupedRoutes(),
          this.fetchRouteTree(),
          this.fetchStatistics(),
          this.fetchAnalytics(),
          this.fetchSQLQueries(),
          this.fetchPerformanceIssues(),
        ]);

      return {
        routes,
        grouped,
        tree,
        stats,
        analytics,
        sqlData,
        perfIssues,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  /**
   * Fetch all routes
   * @returns {Promise<Object>} Routes data
   */
  async fetchRoutes() {
    const response = await fetch(this.endpoints.routes);
    if (!response.ok) {
      throw new Error(`Failed to fetch routes: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch routes grouped by bundle
   * @returns {Promise<Object>} Grouped routes data
   */
  async fetchGroupedRoutes() {
    const response = await fetch(this.endpoints.grouped);
    if (!response.ok) {
      throw new Error(`Failed to fetch grouped routes: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch route tree for visualization
   * @returns {Promise<Object>} Route tree data
   */
  async fetchRouteTree() {
    const response = await fetch(this.endpoints.tree);
    if (!response.ok) {
      throw new Error(`Failed to fetch route tree: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch route statistics
   * @returns {Promise<Object>} Statistics data
   */
  async fetchStatistics() {
    const response = await fetch(this.endpoints.statistics);
    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch analytics data
   * @returns {Promise<Object>} Analytics data
   */
  async fetchAnalytics() {
    const response = await fetch(this.endpoints.analytics);
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch SQL queries
   * @returns {Promise<Object>} SQL queries data
   */
  async fetchSQLQueries() {
    const response = await fetch(this.endpoints.sqlQueries);
    if (!response.ok) {
      throw new Error(`Failed to fetch SQL queries: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch performance issues (slow routes, N+1 queries)
   * @returns {Promise<Object>} Performance issues data
   */
  async fetchPerformanceIssues() {
    const response = await fetch(this.endpoints.performanceIssues);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch performance issues: ${response.statusText}`
      );
    }
    return response.json();
  }
}
