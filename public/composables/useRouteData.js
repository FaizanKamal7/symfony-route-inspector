/**
 * Route Data Composable
 * Manages fetching and state for route data
 */

import { ref, onMounted } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { RouteInspectorAPI } from "../services/api.js";

export function useRouteData(apiEndpoints) {
  const loading = ref(true);
  const routes = ref([]);
  const groupedRoutes = ref([]);
  const routeTree = ref([]);
  const statistics = ref({});
  const analytics = ref([]);
  const sqlQueries = ref([]);
  const sqlStats = ref({});
  const sqlEnabled = ref(false);
  const performanceIssues = ref({
    slowRoutes: [],
    nPlusOneIssues: [],
    summary: {
      totalSlowRoutes: 0,
      totalNPlusOneIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
    },
  });

  const api = new RouteInspectorAPI(apiEndpoints);

  /**
   * Fetch all dashboard data from API
   */
  const fetchData = async () => {
    try {
      loading.value = true;

      const data = await api.fetchAllData();

      routes.value = data.routes.routes;
      groupedRoutes.value = data.grouped.groups;
      routeTree.value = data.tree.tree;
      statistics.value = data.stats.stats;
      analytics.value = data.analytics.analytics;
      sqlQueries.value = data.sqlData.queries || [];
      sqlStats.value = data.sqlData.stats || {};
      sqlEnabled.value = data.sqlData.enabled || false;
      performanceIssues.value = data.perfIssues;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      loading.value = false;
    }
  };

  // Fetch data on mount
  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    routes,
    groupedRoutes,
    routeTree,
    statistics,
    analytics,
    sqlQueries,
    sqlStats,
    sqlEnabled,
    performanceIssues,
    fetchData,
  };
}
