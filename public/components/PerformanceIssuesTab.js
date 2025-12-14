/**
 * PerformanceIssuesTab Component
 * Displays slow routes and N+1 query problems
 */

import { getSeverityColor } from "../utils/colors.js";
import { getResponseTimeClass } from "../utils/formatters.js";

export default {
  name: "PerformanceIssuesTab",
  props: {
    performanceIssues: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getSeverityColor,
    getResponseTimeClass,
  },
  template: `
    <div>
      <h2 class="section-title">Performance Issues</h2>
      <p class="section-description">
        Identify slow routes and N+1 query problems in your application.
      </p>

      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Slow Routes</div>
          <div class="stat-value stat-warning">{{ performanceIssues.summary.totalSlowRoutes }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">N+1 Query Issues</div>
          <div class="stat-value stat-danger">{{ performanceIssues.summary.totalNPlusOneIssues }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Critical Issues</div>
          <div class="stat-value stat-danger">{{ performanceIssues.summary.criticalIssues }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">High Priority</div>
          <div class="stat-value stat-warning">{{ performanceIssues.summary.highIssues }}</div>
        </div>
      </div>

      <!-- Slow Routes Section -->
      <div v-if="performanceIssues.slowRoutes.length > 0" style="margin-top: 2rem;">
        <h3 class="subsection-title">🐌 Slow Routes (>500ms avg response time)</h3>
        <div class="table-container">
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Route</th>
                <th>Path</th>
                <th class="text-right">Avg Time</th>
                <th class="text-right">Max Time</th>
                <th class="text-right">Min Time</th>
                <th class="text-right">Hits</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="route in performanceIssues.slowRoutes" :key="route.name">
                <td>
                  <span
                    class="method-badge"
                    :style="{ background: getSeverityColor(route.severity) }"
                  >
                    {{ route.severity.toUpperCase() }}
                  </span>
                </td>
                <td class="route-name">{{ route.name }}</td>
                <td class="route-path">{{ route.path }}</td>
                <td class="text-right">
                  <span :class="['response-time', getResponseTimeClass(route.avgResponseTime)]">
                    {{ route.avgResponseTime }}ms
                  </span>
                </td>
                <td class="text-right response-time slow">{{ route.maxResponseTime }}ms</td>
                <td class="text-right response-time fast">{{ route.minResponseTime }}ms</td>
                <td class="text-right hits">{{ route.hits }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- N+1 Query Issues Section -->
      <div v-if="performanceIssues.nPlusOneIssues.length > 0" style="margin-top: 2rem;">
        <h3 class="subsection-title">⚠️ Potential N+1 Query Problems</h3>
        <p class="section-description">
          These queries are executed multiple times in a single request, which may indicate an N+1 query problem.
        </p>
        <div class="sql-queries-list">
          <div
            v-for="(issue, index) in performanceIssues.nPlusOneIssues"
            :key="index"
            class="sql-query-item"
          >
            <div class="sql-query-header">
              <span class="sql-query-number">Issue #{{ index + 1 }}</span>
              <span class="sql-badge slow">N+1 Problem</span>
              <span class="sql-query-time">{{ issue.occurrences }} occurrences</span>
              <span class="sql-query-time">Total: {{ issue.totalTime }}ms</span>
              <span class="sql-query-time">Avg: {{ issue.avgTime }}ms</span>
            </div>
            <div class="sql-query-route">
              {{ issue.method }} {{ issue.route }}
            </div>
            <pre class="sql-query-code">{{ issue.queryPattern }}</pre>
          </div>
        </div>
      </div>

      <!-- No Issues Message -->
      <div
        v-if="performanceIssues.slowRoutes.length === 0 && performanceIssues.nPlusOneIssues.length === 0"
        class="alert alert-info"
      >
        <div class="alert-title">✅ No Performance Issues Detected</div>
        <div class="alert-message">
          Great! Your application is performing well. Keep monitoring as traffic increases.
        </div>
      </div>
    </div>
  `,
};
