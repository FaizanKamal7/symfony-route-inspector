/**
 * AnalyticsTab Component
 * Displays route usage analytics and performance metrics
 */

import { formatDate } from "../utils/formatters.js";

export default {
  name: "AnalyticsTab",
  props: {
    analytics: {
      type: Array,
      default: () => [],
    },
    isRealData: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    topRoutes() {
      return this.analytics.slice(0, 10);
    },
  },
  methods: {
    formatDate,
    getResponseTimeClass(time) {
      if (time > 2000) return "slow";
      if (time > 1000) return "medium";
      return "fast";
    },
  },
  template: `
    <div>
      <div v-if="!isRealData" class="alert alert-warning">
        <div class="alert-title">⚠️ Mock Data</div>
        <div class="alert-message">
          Analytics data is currently simulated. Integrate with real tracking for production use.
        </div>
      </div>

      <h3 class="subsection-title">Top 10 Most Used Routes</h3>

      <div class="table-container">
        <table class="analytics-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Route</th>
              <th>Path</th>
              <th class="text-right">Hits</th>
              <th class="text-right">Avg Response (ms)</th>
              <th>Last Accessed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in topRoutes" :key="item.name">
              <td class="rank">{{ index + 1 }}</td>
              <td class="route-name">{{ item.name }}</td>
              <td class="route-path">{{ item.path }}</td>
              <td class="text-right hits">{{ item.hits.toLocaleString() }}</td>
              <td
                class="text-right"
                :class="['response-time', getResponseTimeClass(item.avgResponseTime)]"
              >
                {{ item.avgResponseTime }}
              </td>
              <td class="last-accessed">{{ formatDate(item.lastAccessed) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
};
