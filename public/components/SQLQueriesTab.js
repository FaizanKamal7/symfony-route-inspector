/**
 * SQLQueriesTab Component
 * Displays SQL queries with performance metrics
 */

export default {
  name: "SQLQueriesTab",
  props: {
    sqlEnabled: {
      type: Boolean,
      default: false,
    },
    sqlQueries: {
      type: Array,
      default: () => [],
    },
    sqlStats: {
      type: Object,
      default: () => ({}),
    },
  },
  template: `
    <div>
      <div v-if="!sqlEnabled" class="alert alert-info">
        <div class="alert-title">ℹ️ SQL Query Monitoring Disabled</div>
        <div class="alert-message">
          SQL query collection requires Symfony Profiler to be enabled in dev mode.
          <br><br>
          <strong>To enable:</strong>
          <ol style="margin-top: 0.5rem;">
            <li>Install Doctrine: <code style="background: var(--bg-secondary); padding: 0.2rem 0.5rem; border-radius: 4px;">composer require symfony/orm-pack</code></li>
            <li>Enable profiler in config/packages/framework.yaml</li>
            <li>Restart your Symfony server</li>
          </ol>
        </div>
      </div>

      <div v-else>
        <!-- SQL Statistics -->
        <div class="stats-grid" style="margin-bottom: 2rem;">
          <div class="stat-card">
            <div class="stat-label">Total Queries</div>
            <div class="stat-value stat-primary">{{ sqlStats.totalQueries || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Time (ms)</div>
            <div class="stat-value stat-success">{{ sqlStats.totalTime || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Slow Queries</div>
            <div class="stat-value stat-warning">{{ sqlStats.slowQueries || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Duplicate Queries</div>
            <div class="stat-value stat-danger">{{ sqlStats.duplicateQueries || 0 }}</div>
          </div>
        </div>

        <div v-if="sqlQueries.length === 0" class="alert alert-info">
          <div class="alert-title">ℹ️ No Recent SQL Queries</div>
          <div class="alert-message">
            No database queries found in recent requests. Visit a route that uses Doctrine to see SQL queries here.
          </div>
        </div>

        <!-- SQL Queries List -->
        <div v-else>
          <h3 class="subsection-title">Recent SQL Queries (from last request with DB activity)</h3>

          <div class="sql-queries-list">
            <div
              v-for="(query, index) in sqlQueries"
              :key="index"
              class="sql-query-item"
              :class="{ 'slow-query': query.isSlow }"
            >
              <div class="sql-query-header">
                <span class="sql-query-number">#{{ index + 1 }}</span>
                <span v-if="query.isSlow" class="sql-badge slow">⚠️ SLOW</span>
                <span class="sql-query-time">{{ query.executionMS.toFixed(2) }} ms</span>
                <span v-if="query.route" class="sql-query-route" :title="query.route">{{ query.route }}</span>
              </div>
              <pre class="sql-query-code">{{ query.sql }}</pre>
              <div v-if="query.params && query.params.length > 0" class="sql-query-params">
                <strong>Parameters:</strong> {{ JSON.stringify(query.params) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
