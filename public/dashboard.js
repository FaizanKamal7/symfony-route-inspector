/**
 * Symfony Route Inspector - Dashboard Vue.js Application (Refactored)
 * Clean, modular architecture with separated concerns
 */

import { createApp, ref, computed } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

// Composables
import { useTheme } from "./composables/useTheme.js";
import { useRouteData } from "./composables/useRouteData.js";
import { useFilters } from "./composables/useFilters.js";

// Services
import { RouteHierarchyBuilder } from "./services/routeHierarchy.js";

// Components
import StatCard from "./components/StatCard.js";
import OverviewTab from "./components/OverviewTab.js";
import RoutesTab from "./components/RoutesTab.js";
import GroupedTab from "./components/GroupedTab.js";
import AnalyticsTab from "./components/AnalyticsTab.js";
import SQLQueriesTab from "./components/SQLQueriesTab.js";
import RouteGraphTab from "./components/RouteGraphTab.js";
import PerformanceIssuesTab from "./components/PerformanceIssuesTab.js";

/**
 * Initialize the Route Inspector Dashboard
 * @param {Object} apiEndpoints - API endpoint URLs
 */
export function initDashboard(apiEndpoints) {
  const app = createApp({
    components: {
      StatCard,
      OverviewTab,
      RoutesTab,
      GroupedTab,
      AnalyticsTab,
      SQLQueriesTab,
      RouteGraphTab,
      PerformanceIssuesTab,
    },
    setup() {
      // Theme management
      const { theme, toggleTheme } = useTheme();

      // Route data management
      const {
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
      } = useRouteData(apiEndpoints);

      // Route filtering
      const {
        searchQuery,
        selectedMethod,
        selectedBundle,
        filteredRoutes,
        uniqueMethods,
        uniqueBundles,
      } = useFilters(routes);

      // Active tab
      const activeTab = ref("overview");

      // Route hierarchy builder
      const hierarchyBuilder = new RouteHierarchyBuilder();
      const hierarchyData = computed(() => {
        return routes.value.length > 0
          ? hierarchyBuilder.build(routes.value)
          : { name: "localhost:8080", children: [] };
      });

      return {
        // Theme
        theme,
        toggleTheme,

        // Data
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

        // Filters
        searchQuery,
        selectedMethod,
        selectedBundle,
        filteredRoutes,
        uniqueMethods,
        uniqueBundles,

        // UI State
        activeTab,
        hierarchyData,
      };
    },
    template: `
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading Dashboard...</span>
      </div>
      <div v-else class="dashboard-container">
        <!-- Header -->
        <header class="dashboard-header">
          <div class="container header-content">
            <div class="header-left">
              <div class="header-brand">
                <div class="brand-icon">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="8" fill="url(#route-inspector-gradient)"/>
                    <path d="M12 20L18 14L24 20L30 14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 26L18 20L24 26L30 20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
                    <defs>
                      <linearGradient id="route-inspector-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#3b82f6"/>
                        <stop offset="1" stop-color="#8b5cf6"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div class="brand-text">
                  <h1 class="dashboard-title" :style="{ color: theme === 'dark' ? '#ffffff' : '#000000' }">
                    Symfony Route Inspector
                    <span class="title-badge" :style="{ backgroundColor: theme === 'dark' ? '#222126ff' : '#4977c5ff', color: '#ffffff' }">
                      v1.0.1
                    </span>
                  </h1>
                  <p class="dashboard-tagline">
                    Developer Tools Suite by <a href="https://github.com/FaizanKamal7/symfony-route-inspector">FaizanKamal</a>
                  </p>
                </div>
              </div>
              <p class="dashboard-subtitle">
                🚀 Visual Route Performance Monitor • Track, analyze, and optimize your Symfony routes in real-time
                <br>
                <span class="subtitle-features">
                  ⚡ N+1 Detection • 📊 Performance Analytics • 🎯 SQL Query Inspector • 🗺️ Route Visualization
                </span>
              </p>
            </div>
            <button @click="toggleTheme" class="theme-toggle">
              <span class="theme-icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
              <span>{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
            </button>
          </div>
        </header>

        <!-- Stats Cards -->
        <div class="container">
          <div class="stats-grid">
            <StatCard label="Total Routes" :value="statistics.total" variant="primary" />
            <StatCard label="Secured Routes" :value="statistics.secured" variant="success" />
            <StatCard label="Bundles" :value="Object.keys(statistics.byBundle || {}).length" variant="warning" />
            <StatCard label="HTTP Methods" :value="Object.keys(statistics.byMethod || {}).length" variant="purple" />
          </div>

          <!-- Tabs -->
          <div class="card">
            <div class="tabs-header">
              <button @click="activeTab = 'overview'" :class="['tab-button', { active: activeTab === 'overview' }]">
                Overview
              </button>
              <button @click="activeTab = 'routes'" :class="['tab-button', { active: activeTab === 'routes' }]">
                All Routes
              </button>
              <button @click="activeTab = 'grouped'" :class="['tab-button', { active: activeTab === 'grouped' }]">
                By Bundle
              </button>
              <button @click="activeTab = 'analytics'" :class="['tab-button', { active: activeTab === 'analytics' }]">
                Analytics
              </button>
              <button @click="activeTab = 'sql'" :class="['tab-button', { active: activeTab === 'sql' }]">
                SQL Queries
              </button>
              <button @click="activeTab = 'graph'" :class="['tab-button', { active: activeTab === 'graph' }]">
                Route Graph
              </button>
              <button @click="activeTab = 'issues'" :class="['tab-button', { active: activeTab === 'issues' }]">
                Performance Issues
              </button>
            </div>

            <div class="tab-content">
              <OverviewTab v-if="activeTab === 'overview'" :statistics="statistics" />

              <RoutesTab
                v-if="activeTab === 'routes'"
                :routes="routes"
                :filteredRoutes="filteredRoutes"
                v-model:searchQuery="searchQuery"
                v-model:selectedMethod="selectedMethod"
                v-model:selectedBundle="selectedBundle"
                :uniqueMethods="uniqueMethods"
                :uniqueBundles="uniqueBundles"
              />

              <GroupedTab v-if="activeTab === 'grouped'" :groupedRoutes="groupedRoutes" />

              <AnalyticsTab v-if="activeTab === 'analytics'" :analytics="analytics" />

              <SQLQueriesTab
                v-if="activeTab === 'sql'"
                :sqlEnabled="sqlEnabled"
                :sqlQueries="sqlQueries"
                :sqlStats="sqlStats"
              />

              <RouteGraphTab
                v-if="activeTab === 'graph'"
                :routes="routes"
                :hierarchyData="hierarchyData"
              />

              <PerformanceIssuesTab
                v-if="activeTab === 'issues'"
                :performanceIssues="performanceIssues"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="dashboard-footer">
          <div class="container footer-content">
            <p>Symfony Route Inspector by <a href="https://github.com/FaizanKamal7/symfony-route-inspector" target="_blank">FaizanKamal7</a></p>
            <p>Built for developers who love visibility into their Symfony applications</p>
          </div>
        </footer>
      </div>
    `,
  });

  app.mount("#route-inspector-app");
}
