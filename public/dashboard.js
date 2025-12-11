/**
 * Symfony Route Inspector - Dashboard Vue.js Application
 * This file will be symlinked to public/bundles/routeinspector/dashboard.js
 */

import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

export function initDashboard(apiEndpoints) {
  const app = createApp({
    data() {
      return {
        loading: true,
        activeTab: "overview",
        routes: [],
        groupedRoutes: [],
        routeTree: [],
        statistics: {},
        analytics: [],
        sqlQueries: [],
        sqlStats: {},
        sqlEnabled: false,
        performanceIssues: {
          slowRoutes: [],
          nPlusOneIssues: [],
          summary: {
            totalSlowRoutes: 0,
            totalNPlusOneIssues: 0,
            criticalIssues: 0,
            highIssues: 0,
          },
        },
        searchQuery: "",
        selectedMethod: "all",
        selectedBundle: "all",
        apiEndpoints: apiEndpoints,
        theme: localStorage.getItem("theme") || "dark",
      };
    },
    computed: {
      filteredRoutes() {
        let filtered = this.routes;

        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (route) =>
              route.name.toLowerCase().includes(query) ||
              route.path.toLowerCase().includes(query) ||
              route.controller.toLowerCase().includes(query)
          );
        }

        if (this.selectedMethod !== "all") {
          filtered = filtered.filter((route) =>
            route.methods.includes(this.selectedMethod)
          );
        }

        if (this.selectedBundle !== "all") {
          filtered = filtered.filter(
            (route) => route.bundle === this.selectedBundle
          );
        }

        return filtered;
      },
      uniqueMethods() {
        const methods = new Set();
        this.routes.forEach((route) => {
          route.methods.forEach((method) => methods.add(method));
        });
        return Array.from(methods).sort();
      },
      uniqueBundles() {
        const bundles = new Set();
        this.routes.forEach((route) => bundles.add(route.bundle));
        return Array.from(bundles).sort();
      },
      topRoutes() {
        return this.analytics.slice(0, 10);
      },
    },
    methods: {
      async fetchData() {
        try {
          const [routes, grouped, tree, stats, analytics, sqlData, perfIssues] =
            await Promise.all([
              fetch(this.apiEndpoints.routes).then((r) => r.json()),
              fetch(this.apiEndpoints.grouped).then((r) => r.json()),
              fetch(this.apiEndpoints.tree).then((r) => r.json()),
              fetch(this.apiEndpoints.statistics).then((r) => r.json()),
              fetch(this.apiEndpoints.analytics).then((r) => r.json()),
              fetch(this.apiEndpoints.sqlQueries).then((r) => r.json()),
              fetch(this.apiEndpoints.performanceIssues).then((r) => r.json()),
            ]);

          this.routes = routes.routes;
          this.groupedRoutes = grouped.groups;
          this.routeTree = tree.tree;
          this.statistics = stats.stats;
          this.analytics = analytics.analytics;
          this.sqlQueries = sqlData.queries || [];
          this.sqlStats = sqlData.stats || {};
          this.sqlEnabled = sqlData.enabled || false;
          this.performanceIssues = perfIssues;
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          this.loading = false;
        }
      },
      getMethodColor(method) {
        const colors = {
          GET: "#3b82f6",
          POST: "#10b981",
          PUT: "#f59e0b",
          DELETE: "#ef4444",
          PATCH: "#8b5cf6",
          ANY: "#64748b",
        };
        return colors[method] || "#64748b";
      },
      formatDate(dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      },
      getSeverityColor(severity) {
        const colors = {
          critical: "#ef4444", // red
          high: "#f59e0b", // orange
          medium: "#f59e0b", // orange
          low: "#64748b", // gray
        };
        return colors[severity] || "#64748b";
      },
      getResponseTimeClass(time) {
        if (time > 2000) return "slow";
        if (time > 1000) return "medium";
        return "fast";
      },
      toggleTheme() {
        this.theme = this.theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", this.theme);
        document.documentElement.setAttribute("data-theme", this.theme);
      },
      initRouteGraph() {
        if (this.activeTab !== "graph" || this.routes.length === 0) return;

        const container = document.getElementById("route-graph-container");
        if (!container) return;

        // Build hierarchical structure
        const hierarchyData = this.buildRouteHierarchy();

        // Clear container
        container.innerHTML = "";

        const width = container.clientWidth;
        const height = 800;

        const svg = d3
          .select("#route-graph-container")
          .append("svg")
          .attr("width", width)
          .attr("height", height);

        // Determine line color based on theme
        const isDarkTheme =
          document.documentElement.getAttribute("data-theme") !== "light";
        const lineColor = isDarkTheme ? "#ffffff" : "#7c3aed"; // white for dark theme, dark purple for light theme

        const g = svg
          .append("g")
          .attr("id", "graph-main-group")
          .attr("transform", "translate(40, 40)");

        // Create tree layout
        const tree = d3.tree().size([height - 80, width - 200]);
        const root = d3.hierarchy(hierarchyData);
        tree(root);

        // Add zoom
        const zoom = d3
          .zoom()
          .scaleExtent([0.3, 3])
          .on("zoom", (event) => g.attr("transform", event.transform));

        svg.call(zoom);

        // Add links with faster animation
        g.selectAll(".link")
          .data(root.links())
          .enter()
          .append("path")
          .attr("class", "graph-link")
          .attr(
            "d",
            d3
              .linkHorizontal()
              .x((d) => d.y)
              .y((d) => d.x)
          )
          .style("fill", "none")
          .style("stroke", lineColor)
          .style("stroke-width", "2px")
          .style("stroke-dasharray", "8,4")
          .style("stroke-dashoffset", 0)
          .style("opacity", 0.6)
          .each(function () {
            // Animate the dash offset for fast flowing effect
            d3.select(this)
              .transition()
              .duration(1000)
              .ease(d3.easeLinear)
              .style("stroke-dashoffset", -12)
              .on("end", function repeat() {
                d3.select(this)
                  .transition()
                  .duration(1000)
                  .ease(d3.easeLinear)
                  .style("stroke-dashoffset", -24)
                  .transition()
                  .duration(0)
                  .style("stroke-dashoffset", 0)
                  .on("end", repeat);
              });
          });

        // Create tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "route-tooltip")
          .style("opacity", 0);

        // Add nodes
        const node = g
          .selectAll(".node")
          .data(root.descendants())
          .enter()
          .append("g")
          .attr("class", "graph-node")
          .attr("transform", (d) => `translate(${d.y}, ${d.x})`);

        // Add circles
        node
          .append("circle")
          .attr("r", (d) => (d.data.isEndpoint ? 6 : 8))
          .style("fill", (d) =>
            d.data.isEndpoint
              ? this.getMethodColor(d.data.methods?.[0])
              : "var(--accent-primary)"
          )
          .style("stroke", "var(--bg-primary)")
          .style("stroke-width", "2px")
          .style("cursor", "pointer")
          .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
              .transition()
              .duration(200)
              .attr("r", 10);

            // Show tooltip
            if (d.data.isEndpoint) {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip
                .html(
                  `
                                <div class="tooltip-header">
                                    <strong>${
                                      d.data.routeName || d.data.name
                                    }</strong>
                                </div>
                                <div class="tooltip-body">
                                    <div><strong>Path:</strong> ${
                                      d.data.path
                                    }</div>
                                    <div><strong>Methods:</strong> ${d.data.methods.join(
                                      ", "
                                    )}</div>
                                    ${
                                      d.data.controller
                                        ? `<div><strong>Controller:</strong> ${d.data.controller}</div>`
                                        : ""
                                    }
                                </div>
                            `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            } else {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip
                .html(
                  `
                                <div class="tooltip-header">
                                    <strong>Path Segment</strong>
                                </div>
                                <div class="tooltip-body">
                                    <div><strong>Segment:</strong> /${d.data.name}</div>
                                    <div><strong>Full Path:</strong> ${d.data.path}</div>
                                </div>
                            `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            }
          })
          .on("mouseout", (event, d) => {
            d3.select(event.currentTarget)
              .transition()
              .duration(200)
              .attr("r", d.data.isEndpoint ? 6 : 8);
            tooltip.transition().duration(500).style("opacity", 0);
          });

        // Add labels
        node
          .append("text")
          .attr("dy", -12)
          .attr("text-anchor", "middle")
          .text((d) => d.data.name)
          .style("fill", "var(--text-primary)")
          .style("font-size", "11px")
          .style("font-weight", (d) => (d.data.isEndpoint ? "normal" : "bold"))
          .style("pointer-events", "none");

        // Add method badges with rounded squares
        const badgeGroup = node
          .filter((d) => d.data.isEndpoint && d.data.methods)
          .append("g")
          .attr("class", "method-badge-group")
          .attr("transform", "translate(0, 18)");

        badgeGroup.each(
          function (d) {
            const group = d3.select(this);
            const methods = d.data.methods;
            const badgeWidth = 35;
            const badgeHeight = 14;
            const gap = 2;
            const totalWidth = methods.length * (badgeWidth + gap) - gap;
            const startX = -totalWidth / 2;

            methods.forEach((method, i) => {
              const x = startX + i * (badgeWidth + gap);

              // Add rounded rectangle
              group
                .append("rect")
                .attr("x", x)
                .attr("y", -badgeHeight / 2)
                .attr("width", badgeWidth)
                .attr("height", badgeHeight)
                .attr("rx", 3)
                .attr("ry", 3)
                .style("fill", this.getMethodColor(method))
                .style("stroke", this.getMethodColor(method))
                .style("stroke-width", "1.5px")
                .style("pointer-events", "none");

              // Add method text
              group
                .append("text")
                .attr("x", x + badgeWidth / 2)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(method)
                .style("fill", "white")
                .style("font-size", "8px")
                .style("font-weight", "bold")
                .style("pointer-events", "none");
            });
          }.bind(this)
        );

        // Add legend
        const legend = svg
          .append("g")
          .attr("class", "graph-legend")
          .attr("transform", `translate(20, ${height - 100})`);

        const methods = [
          { name: "GET", color: "#3b82f6" },
          { name: "POST", color: "#10b981" },
          { name: "PUT", color: "#f59e0b" },
          { name: "DELETE", color: "#ef4444" },
          { name: "PATCH", color: "#8b5cf6" },
        ];

        const legendItemHeight = 25;

        methods.forEach((method, i) => {
          const legendItem = legend
            .append("g")
            .attr("transform", `translate(0, ${i * legendItemHeight})`);

          // Add colored rectangle
          legendItem
            .append("rect")
            .attr("width", 60)
            .attr("height", 18)
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill", method.color);

          // Add method text
          legendItem
            .append("text")
            .attr("x", 30)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(method.name)
            .style("fill", "white")
            .style("font-size", "11px")
            .style("font-weight", "bold");
        });
      },
      buildRouteHierarchy() {
        const root = { name: "localhost:8080", children: [] };
        const pathMap = new Map();
        pathMap.set("/", root);

        this.routes.forEach((route) => {
          const parts = route.path.split("/").filter((p) => p);
          let currentPath = "";
          let parent = root;

          if (parts.length === 0) {
            // Root path "/"
            root.children.push({
              name: "/",
              path: "/",
              isEndpoint: true,
              routeName: route.name,
              methods: route.methods,
              controller: route.controller,
              children: [],
            });
            return;
          }

          parts.forEach((part, index) => {
            currentPath += "/" + part;

            if (!pathMap.has(currentPath)) {
              const isLastPart = index === parts.length - 1;
              const node = {
                name: part,
                path: currentPath,
                isEndpoint: isLastPart,
                children: [],
              };

              if (isLastPart) {
                node.routeName = route.name;
                node.methods = route.methods;
                node.controller = route.controller;
              }

              parent.children.push(node);
              pathMap.set(currentPath, node);
              parent = node;
            } else {
              parent = pathMap.get(currentPath);
            }
          });
        });

        return root;
      },
      resetGraphZoom() {
        const svg = d3.select("#route-graph-container svg");
        svg
          .transition()
          .duration(750)
          .call(d3.zoom().transform, d3.zoomIdentity.translate(40, 40));
      },
      exportGraphAsSVG() {
        const svg = document.querySelector("#route-graph-container svg");
        if (!svg) return;

        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svg);
        const blob = new Blob([source], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "route-graph.svg";
        link.click();

        URL.revokeObjectURL(url);
      },
    },
    watch: {
      activeTab(newTab) {
        if (newTab === "graph") {
          this.$nextTick(() => this.initRouteGraph());
        }
      },
    },
    mounted() {
      this.fetchData();
      document.documentElement.setAttribute("data-theme", this.theme);
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
                                        <rect width="40" height="40" rx="8" fill="url(#gradient1)"/>
                                        <path d="M12 20L18 14L24 20L30 14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 26L18 20L24 26L30 20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
                                        <defs>
                                            <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                                <stop stop-color="#3b82f6"/>
                                                <stop offset="1" stop-color="#8b5cf6"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div class="brand-text">
                                    <h1 class="dashboard-title" :style="{ color: theme === 'dark' ? '#ffffff' : '#000000' }">
                                        Symfony  Inspector
                                        <span class="title-badge" :style="{ backgroundColor: theme === 'dark' ? '#222126ff' : '#4977c5ff', color: '#ffffff' }">
                                            v1.0.1
                                        </span>
                                    </h1>
                                    <p class="dashboard-tagline">
                                        Developer Tools Suite
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
                        <div class="stat-card">
                            <div class="stat-label">Total Routes</div>
                            <div class="stat-value stat-primary">{{ statistics.total }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Secured Routes</div>
                            <div class="stat-value stat-success">{{ statistics.secured }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Bundles</div>
                            <div class="stat-value stat-warning">{{ Object.keys(statistics.byBundle || {}).length }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">HTTP Methods</div>
                            <div class="stat-value stat-purple">{{ Object.keys(statistics.byMethod || {}).length }}</div>
                        </div>
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
                            <!-- Overview Tab -->
                            <div v-if="activeTab === 'overview'">
                                <h2 class="section-title">Route Distribution</h2>

                                <div class="distribution-grid">
                                    <!-- By Method -->
                                    <div>
                                        <h3 class="subsection-title">By HTTP Method</h3>
                                        <div v-for="(count, method) in statistics.byMethod" :key="method" class="progress-item">
                                            <div class="progress-header">
                                                <span class="progress-label" :style="{ color: getMethodColor(method) }">{{ method }}</span>
                                                <span class="progress-count">{{ count }}</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" :style="{ width: (count / statistics.total * 100) + '%', background: getMethodColor(method) }"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- By Bundle -->
                                    <div>
                                        <h3 class="subsection-title">By Bundle</h3>
                                        <div v-for="(count, bundle) in statistics.byBundle" :key="bundle" class="progress-item">
                                            <div class="progress-header">
                                                <span class="progress-label">{{ bundle }}</span>
                                                <span class="progress-count">{{ count }}</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" :style="{ width: (count / statistics.total * 100) + '%', background: '#8b5cf6' }"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Routes Tab -->
                            <div v-if="activeTab === 'routes'">
                                <!-- Filters -->
                                <div class="filters">
                                    <input v-model="searchQuery" type="text" placeholder="Search routes..." class="filter-input">
                                    <select v-model="selectedMethod" class="filter-select">
                                        <option value="all">All Methods</option>
                                        <option v-for="method in uniqueMethods" :key="method" :value="method">{{ method }}</option>
                                    </select>
                                    <select v-model="selectedBundle" class="filter-select">
                                        <option value="all">All Bundles</option>
                                        <option v-for="bundle in uniqueBundles" :key="bundle" :value="bundle">{{ bundle }}</option>
                                    </select>
                                </div>

                                <div class="result-count">
                                    Showing {{ filteredRoutes.length }} of {{ routes.length }} routes
                                </div>

                                <!-- Routes Table -->
                                <div class="table-container">
                                    <table class="routes-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Path</th>
                                                <th>Methods</th>
                                                <th>Controller</th>
                                                <th>Security</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="route in filteredRoutes" :key="route.name">
                                                <td class="route-name">{{ route.name }}</td>
                                                <td class="route-path">{{ route.path }}</td>
                                                <td>
                                                    <span v-for="method in route.methods" :key="method" class="method-badge" :style="{ background: getMethodColor(method) }">
                                                        {{ method }}
                                                    </span>
                                                </td>
                                                <td class="route-controller" :title="route.controller">{{ route.controller }}</td>
                                                <td>
                                                    <span v-if="route.security" class="security-badge secured">
                                                        🔒 Secured
                                                    </span>
                                                    <span v-else class="security-badge">-</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Grouped Tab -->
                            <div v-if="activeTab === 'grouped'">
                                <div v-for="group in groupedRoutes" :key="group.name" class="route-group">
                                    <h3 class="group-title">
                                        📦 {{ group.name }} <span class="group-count">({{ group.routes.length }} routes)</span>
                                    </h3>

                                    <div class="route-list">
                                        <div v-for="route in group.routes" :key="route.name" class="route-item">
                                            <div class="route-item-header">
                                                <div>
                                                    <div class="route-item-name">{{ route.name }}</div>
                                                    <div class="route-item-path">{{ route.path }}</div>
                                                </div>
                                                <div class="route-item-methods">
                                                    <span v-for="method in route.methods" :key="method" class="method-badge" :style="{ background: getMethodColor(method) }">
                                                        {{ method }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="route-item-controller">{{ route.controller }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Analytics Tab -->
                            <div v-if="activeTab === 'analytics'">
                                <div class="alert alert-warning">
                                    <div class="alert-title">⚠️ Mock Data</div>
                                    <div class="alert-message">Analytics data is currently simulated. Integrate with real tracking for production use.</div>
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
                                                <td class="text-right" :class="['response-time', item.avgResponseTime < 100 ? 'fast' : item.avgResponseTime < 300 ? 'medium' : 'slow']">
                                                    {{ item.avgResponseTime }}
                                                </td>
                                                <td class="last-accessed">{{ formatDate(item.lastAccessed) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- SQL Queries Tab -->
                            <div v-if="activeTab === 'sql'">
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
                                        <div class="alert-message">No database queries found in recent requests. Visit a route that uses Doctrine to see SQL queries here.</div>
                                    </div>

                                    <!-- SQL Queries List -->
                                    <div v-else>
                                        <h3 class="subsection-title">Recent SQL Queries (from last request with DB activity)</h3>

                                        <div class="sql-queries-list">
                                            <div v-for="(query, index) in sqlQueries" :key="index" class="sql-query-item" :class="{ 'slow-query': query.isSlow }">
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

                            <!-- Route Graph Tab -->
                            <div v-if="activeTab === 'graph'">
                                <h2 class="section-title">Route Hierarchy Visualization</h2>
                                <p class="section-description">
                                    Interactive graph showing your application's route structure. Zoom and pan to explore the hierarchy.
                                </p>

                                <div class="graph-controls">
                                    <button @click="resetGraphZoom" class="graph-button">Reset Zoom</button>
                                    <button @click="exportGraphAsSVG" class="graph-button">Export as SVG</button>
                                </div>

                                <div id="route-graph-container" class="route-graph-container"></div>
                            </div>

                            <!-- Performance Issues Tab -->
                            <div v-if="activeTab === 'issues'">
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
                                                        <span class="method-badge" :style="{ background: getSeverityColor(route.severity) }">
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
                                        <div v-for="(issue, index) in performanceIssues.nPlusOneIssues" :key="index" class="sql-query-item">
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
                                <div v-if="performanceIssues.slowRoutes.length === 0 && performanceIssues.nPlusOneIssues.length === 0" class="alert alert-info">
                                    <div class="alert-title">No Performance Issues Detected</div>
                                    <div class="alert-message">
                                        Great! Your application is performing well. Keep monitoring as traffic increases.
                                    </div>
                                </div>
                            </div>
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
/**
 * Symfony Route Inspector - Dashboard Vue.js Application
 * This file will be symlinked to public/bundles/routeinspector/dashboard.js
 */

import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

export function initDashboard(apiEndpoints) {
  const app = createApp({
    data() {
      return {
        loading: true,
        activeTab: "overview",
        routes: [],
        groupedRoutes: [],
        routeTree: [],
        statistics: {},
        analytics: [],
        sqlQueries: [],
        sqlStats: {},
        sqlEnabled: false,
        performanceIssues: {
          slowRoutes: [],
          nPlusOneIssues: [],
          summary: {
            totalSlowRoutes: 0,
            totalNPlusOneIssues: 0,
            criticalIssues: 0,
            highIssues: 0,
          },
        },
        searchQuery: "",
        selectedMethod: "all",
        selectedBundle: "all",
        apiEndpoints: apiEndpoints,
        theme: localStorage.getItem("theme") || "dark",
      };
    },
    computed: {
      filteredRoutes() {
        let filtered = this.routes;

        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (route) =>
              route.name.toLowerCase().includes(query) ||
              route.path.toLowerCase().includes(query) ||
              route.controller.toLowerCase().includes(query)
          );
        }

        if (this.selectedMethod !== "all") {
          filtered = filtered.filter((route) =>
            route.methods.includes(this.selectedMethod)
          );
        }

        if (this.selectedBundle !== "all") {
          filtered = filtered.filter(
            (route) => route.bundle === this.selectedBundle
          );
        }

        return filtered;
      },
      uniqueMethods() {
        const methods = new Set();
        this.routes.forEach((route) => {
          route.methods.forEach((method) => methods.add(method));
        });
        return Array.from(methods).sort();
      },
      uniqueBundles() {
        const bundles = new Set();
        this.routes.forEach((route) => bundles.add(route.bundle));
        return Array.from(bundles).sort();
      },
      topRoutes() {
        return this.analytics.slice(0, 10);
      },
    },
    methods: {
      async fetchData() {
        try {
          const [routes, grouped, tree, stats, analytics, sqlData, perfIssues] =
            await Promise.all([
              fetch(this.apiEndpoints.routes).then((r) => r.json()),
              fetch(this.apiEndpoints.grouped).then((r) => r.json()),
              fetch(this.apiEndpoints.tree).then((r) => r.json()),
              fetch(this.apiEndpoints.statistics).then((r) => r.json()),
              fetch(this.apiEndpoints.analytics).then((r) => r.json()),
              fetch(this.apiEndpoints.sqlQueries).then((r) => r.json()),
              fetch(this.apiEndpoints.performanceIssues).then((r) => r.json()),
            ]);

          this.routes = routes.routes;
          this.groupedRoutes = grouped.groups;
          this.routeTree = tree.tree;
          this.statistics = stats.stats;
          this.analytics = analytics.analytics;
          this.sqlQueries = sqlData.queries || [];
          this.sqlStats = sqlData.stats || {};
          this.sqlEnabled = sqlData.enabled || false;
          this.performanceIssues = perfIssues;
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          this.loading = false;
        }
      },
      getMethodColor(method) {
        const colors = {
          GET: "#3b82f6",
          POST: "#10b981",
          PUT: "#f59e0b",
          DELETE: "#ef4444",
          PATCH: "#8b5cf6",
          ANY: "#64748b",
        };
        return colors[method] || "#64748b";
      },
      formatDate(dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      },
      getSeverityColor(severity) {
        const colors = {
          critical: "#ef4444", // red
          high: "#f59e0b", // orange
          medium: "#f59e0b", // orange
          low: "#64748b", // gray
        };
        return colors[severity] || "#64748b";
      },
      getResponseTimeClass(time) {
        if (time > 2000) return "slow";
        if (time > 1000) return "medium";
        return "fast";
      },
      toggleTheme() {
        this.theme = this.theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", this.theme);
        document.documentElement.setAttribute("data-theme", this.theme);
      },
      initRouteGraph() {
        if (this.activeTab !== "graph" || this.routes.length === 0) return;

        const container = document.getElementById("route-graph-container");
        if (!container) return;

        // Build hierarchical structure
        const hierarchyData = this.buildRouteHierarchy();

        // Clear container
        container.innerHTML = "";

        const width = container.clientWidth;
        const height = 800;

        const svg = d3
          .select("#route-graph-container")
          .append("svg")
          .attr("width", width)
          .attr("height", height);

        // Determine line color based on theme
        const isDarkTheme =
          document.documentElement.getAttribute("data-theme") !== "light";
        const lineColor = isDarkTheme ? "#ffffff" : "#7c3aed"; // white for dark theme, dark purple for light theme

        const g = svg
          .append("g")
          .attr("id", "graph-main-group")
          .attr("transform", "translate(40, 40)");

        // Create tree layout
        const tree = d3.tree().size([height - 80, width - 200]);
        const root = d3.hierarchy(hierarchyData);
        tree(root);

        // Add zoom
        const zoom = d3
          .zoom()
          .scaleExtent([0.3, 3])
          .on("zoom", (event) => g.attr("transform", event.transform));

        svg.call(zoom);

        // Add links with faster animation
        g.selectAll(".link")
          .data(root.links())
          .enter()
          .append("path")
          .attr("class", "graph-link")
          .attr(
            "d",
            d3
              .linkHorizontal()
              .x((d) => d.y)
              .y((d) => d.x)
          )
          .style("fill", "none")
          .style("stroke", lineColor)
          .style("stroke-width", "2px")
          .style("stroke-dasharray", "8,4")
          .style("stroke-dashoffset", 0)
          .style("opacity", 0.6)
          .each(function () {
            // Animate the dash offset for fast flowing effect
            d3.select(this)
              .transition()
              .duration(1000)
              .ease(d3.easeLinear)
              .style("stroke-dashoffset", -12)
              .on("end", function repeat() {
                d3.select(this)
                  .transition()
                  .duration(1000)
                  .ease(d3.easeLinear)
                  .style("stroke-dashoffset", -24)
                  .transition()
                  .duration(0)
                  .style("stroke-dashoffset", 0)
                  .on("end", repeat);
              });
          });

        // Create tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "route-tooltip")
          .style("opacity", 0);

        // Add nodes
        const node = g
          .selectAll(".node")
          .data(root.descendants())
          .enter()
          .append("g")
          .attr("class", "graph-node")
          .attr("transform", (d) => `translate(${d.y}, ${d.x})`);

        // Add circles
        node
          .append("circle")
          .attr("r", (d) => (d.data.isEndpoint ? 6 : 8))
          .style("fill", (d) =>
            d.data.isEndpoint
              ? this.getMethodColor(d.data.methods?.[0])
              : "var(--accent-primary)"
          )
          .style("stroke", "var(--bg-primary)")
          .style("stroke-width", "2px")
          .style("cursor", "pointer")
          .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
              .transition()
              .duration(200)
              .attr("r", 10);

            // Show tooltip
            if (d.data.isEndpoint) {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip
                .html(
                  `
                                <div class="tooltip-header">
                                    <strong>${
                                      d.data.routeName || d.data.name
                                    }</strong>
                                </div>
                                <div class="tooltip-body">
                                    <div><strong>Path:</strong> ${
                                      d.data.path
                                    }</div>
                                    <div><strong>Methods:</strong> ${d.data.methods.join(
                                      ", "
                                    )}</div>
                                    ${
                                      d.data.controller
                                        ? `<div><strong>Controller:</strong> ${d.data.controller}</div>`
                                        : ""
                                    }
                                </div>
                            `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            } else {
              tooltip.transition().duration(200).style("opacity", 1);
              tooltip
                .html(
                  `
                                <div class="tooltip-header">
                                    <strong>Path Segment</strong>
                                </div>
                                <div class="tooltip-body">
                                    <div><strong>Segment:</strong> /${d.data.name}</div>
                                    <div><strong>Full Path:</strong> ${d.data.path}</div>
                                </div>
                            `
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            }
          })
          .on("mouseout", (event, d) => {
            d3.select(event.currentTarget)
              .transition()
              .duration(200)
              .attr("r", d.data.isEndpoint ? 6 : 8);
            tooltip.transition().duration(500).style("opacity", 0);
          });

        // Add labels
        node
          .append("text")
          .attr("dy", -12)
          .attr("text-anchor", "middle")
          .text((d) => d.data.name)
          .style("fill", "var(--text-primary)")
          .style("font-size", "11px")
          .style("font-weight", (d) => (d.data.isEndpoint ? "normal" : "bold"))
          .style("pointer-events", "none");

        // Add method badges with rounded squares
        const badgeGroup = node
          .filter((d) => d.data.isEndpoint && d.data.methods)
          .append("g")
          .attr("class", "method-badge-group")
          .attr("transform", "translate(0, 18)");

        badgeGroup.each(
          function (d) {
            const group = d3.select(this);
            const methods = d.data.methods;
            const badgeWidth = 35;
            const badgeHeight = 14;
            const gap = 2;
            const totalWidth = methods.length * (badgeWidth + gap) - gap;
            const startX = -totalWidth / 2;

            methods.forEach((method, i) => {
              const x = startX + i * (badgeWidth + gap);

              // Add rounded rectangle
              group
                .append("rect")
                .attr("x", x)
                .attr("y", -badgeHeight / 2)
                .attr("width", badgeWidth)
                .attr("height", badgeHeight)
                .attr("rx", 3)
                .attr("ry", 3)
                .style("fill", this.getMethodColor(method))
                .style("stroke", this.getMethodColor(method))
                .style("stroke-width", "1.5px")
                .style("pointer-events", "none");

              // Add method text
              group
                .append("text")
                .attr("x", x + badgeWidth / 2)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(method)
                .style("fill", "white")
                .style("font-size", "8px")
                .style("font-weight", "bold")
                .style("pointer-events", "none");
            });
          }.bind(this)
        );

        // Add legend
        const legend = svg
          .append("g")
          .attr("class", "graph-legend")
          .attr("transform", `translate(20, ${height - 100})`);

        const methods = [
          { name: "GET", color: "#3b82f6" },
          { name: "POST", color: "#10b981" },
          { name: "PUT", color: "#f59e0b" },
          { name: "DELETE", color: "#ef4444" },
          { name: "PATCH", color: "#8b5cf6" },
        ];

        const legendItemHeight = 25;

        methods.forEach((method, i) => {
          const legendItem = legend
            .append("g")
            .attr("transform", `translate(0, ${i * legendItemHeight})`);

          // Add colored rectangle
          legendItem
            .append("rect")
            .attr("width", 60)
            .attr("height", 18)
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill", method.color);

          // Add method text
          legendItem
            .append("text")
            .attr("x", 30)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(method.name)
            .style("fill", "white")
            .style("font-size", "11px")
            .style("font-weight", "bold");
        });
      },
      buildRouteHierarchy() {
        const root = { name: "localhost:8080", children: [] };
        const pathMap = new Map();
        pathMap.set("/", root);

        this.routes.forEach((route) => {
          const parts = route.path.split("/").filter((p) => p);
          let currentPath = "";
          let parent = root;

          if (parts.length === 0) {
            // Root path "/"
            root.children.push({
              name: "/",
              path: "/",
              isEndpoint: true,
              routeName: route.name,
              methods: route.methods,
              controller: route.controller,
              children: [],
            });
            return;
          }

          parts.forEach((part, index) => {
            currentPath += "/" + part;

            if (!pathMap.has(currentPath)) {
              const isLastPart = index === parts.length - 1;
              const node = {
                name: part,
                path: currentPath,
                isEndpoint: isLastPart,
                children: [],
              };

              if (isLastPart) {
                node.routeName = route.name;
                node.methods = route.methods;
                node.controller = route.controller;
              }

              parent.children.push(node);
              pathMap.set(currentPath, node);
              parent = node;
            } else {
              parent = pathMap.get(currentPath);
            }
          });
        });

        return root;
      },
      resetGraphZoom() {
        const svg = d3.select("#route-graph-container svg");
        svg
          .transition()
          .duration(750)
          .call(d3.zoom().transform, d3.zoomIdentity.translate(40, 40));
      },
      exportGraphAsSVG() {
        const svg = document.querySelector("#route-graph-container svg");
        if (!svg) return;

        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svg);
        const blob = new Blob([source], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "route-graph.svg";
        link.click();

        URL.revokeObjectURL(url);
      },
    },
    watch: {
      activeTab(newTab) {
        if (newTab === "graph") {
          this.$nextTick(() => this.initRouteGraph());
        }
      },
    },
    mounted() {
      this.fetchData();
      document.documentElement.setAttribute("data-theme", this.theme);
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
                                        <rect width="40" height="40" rx="8" fill="url(#gradient1)"/>
                                        <path d="M12 20L18 14L24 20L30 14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 26L18 20L24 26L30 20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
                                        <defs>
                                            <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                                <stop stop-color="#3b82f6"/>
                                                <stop offset="1" stop-color="#8b5cf6"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div class="brand-text">
                                    <h1 class="dashboard-title" :style="{ color: theme === 'dark' ? '#ffffff' : '#000000' }">
                                        Symfony  Inspector
                                        <span class="title-badge" :style="{ backgroundColor: theme === 'dark' ? '#222126ff' : '#4977c5ff', color: '#ffffff' }">
                                            v1.0.1
                                        </span>
                                    </h1>
                                    <p class="dashboard-tagline">
                                        Developer Tools Suite
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
                        <div class="stat-card">
                            <div class="stat-label">Total Routes</div>
                            <div class="stat-value stat-primary">{{ statistics.total }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Secured Routes</div>
                            <div class="stat-value stat-success">{{ statistics.secured }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Bundles</div>
                            <div class="stat-value stat-warning">{{ Object.keys(statistics.byBundle || {}).length }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">HTTP Methods</div>
                            <div class="stat-value stat-purple">{{ Object.keys(statistics.byMethod || {}).length }}</div>
                        </div>
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
                            <!-- Overview Tab -->
                            <div v-if="activeTab === 'overview'">
                                <h2 class="section-title">Route Distribution</h2>

                                <div class="distribution-grid">
                                    <!-- By Method -->
                                    <div>
                                        <h3 class="subsection-title">By HTTP Method</h3>
                                        <div v-for="(count, method) in statistics.byMethod" :key="method" class="progress-item">
                                            <div class="progress-header">
                                                <span class="progress-label" :style="{ color: getMethodColor(method) }">{{ method }}</span>
                                                <span class="progress-count">{{ count }}</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" :style="{ width: (count / statistics.total * 100) + '%', background: getMethodColor(method) }"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- By Bundle -->
                                    <div>
                                        <h3 class="subsection-title">By Bundle</h3>
                                        <div v-for="(count, bundle) in statistics.byBundle" :key="bundle" class="progress-item">
                                            <div class="progress-header">
                                                <span class="progress-label">{{ bundle }}</span>
                                                <span class="progress-count">{{ count }}</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" :style="{ width: (count / statistics.total * 100) + '%', background: '#8b5cf6' }"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Routes Tab -->
                            <div v-if="activeTab === 'routes'">
                                <!-- Filters -->
                                <div class="filters">
                                    <input v-model="searchQuery" type="text" placeholder="Search routes..." class="filter-input">
                                    <select v-model="selectedMethod" class="filter-select">
                                        <option value="all">All Methods</option>
                                        <option v-for="method in uniqueMethods" :key="method" :value="method">{{ method }}</option>
                                    </select>
                                    <select v-model="selectedBundle" class="filter-select">
                                        <option value="all">All Bundles</option>
                                        <option v-for="bundle in uniqueBundles" :key="bundle" :value="bundle">{{ bundle }}</option>
                                    </select>
                                </div>

                                <div class="result-count">
                                    Showing {{ filteredRoutes.length }} of {{ routes.length }} routes
                                </div>

                                <!-- Routes Table -->
                                <div class="table-container">
                                    <table class="routes-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Path</th>
                                                <th>Methods</th>
                                                <th>Controller</th>
                                                <th>Security</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="route in filteredRoutes" :key="route.name">
                                                <td class="route-name">{{ route.name }}</td>
                                                <td class="route-path">{{ route.path }}</td>
                                                <td>
                                                    <span v-for="method in route.methods" :key="method" class="method-badge" :style="{ background: getMethodColor(method) }">
                                                        {{ method }}
                                                    </span>
                                                </td>
                                                <td class="route-controller" :title="route.controller">{{ route.controller }}</td>
                                                <td>
                                                    <span v-if="route.security" class="security-badge secured">
                                                        🔒 Secured
                                                    </span>
                                                    <span v-else class="security-badge">-</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Grouped Tab -->
                            <div v-if="activeTab === 'grouped'">
                                <div v-for="group in groupedRoutes" :key="group.name" class="route-group">
                                    <h3 class="group-title">
                                        📦 {{ group.name }} <span class="group-count">({{ group.routes.length }} routes)</span>
                                    </h3>

                                    <div class="route-list">
                                        <div v-for="route in group.routes" :key="route.name" class="route-item">
                                            <div class="route-item-header">
                                                <div>
                                                    <div class="route-item-name">{{ route.name }}</div>
                                                    <div class="route-item-path">{{ route.path }}</div>
                                                </div>
                                                <div class="route-item-methods">
                                                    <span v-for="method in route.methods" :key="method" class="method-badge" :style="{ background: getMethodColor(method) }">
                                                        {{ method }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="route-item-controller">{{ route.controller }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Analytics Tab -->
                            <div v-if="activeTab === 'analytics'">
                                <div class="alert alert-warning">
                                    <div class="alert-title">⚠️ Mock Data</div>
                                    <div class="alert-message">Analytics data is currently simulated. Integrate with real tracking for production use.</div>
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
                                                <td class="text-right" :class="['response-time', item.avgResponseTime < 100 ? 'fast' : item.avgResponseTime < 300 ? 'medium' : 'slow']">
                                                    {{ item.avgResponseTime }}
                                                </td>
                                                <td class="last-accessed">{{ formatDate(item.lastAccessed) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- SQL Queries Tab -->
                            <div v-if="activeTab === 'sql'">
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
                                        <div class="alert-message">No database queries found in recent requests. Visit a route that uses Doctrine to see SQL queries here.</div>
                                    </div>

                                    <!-- SQL Queries List -->
                                    <div v-else>
                                        <h3 class="subsection-title">Recent SQL Queries (from last request with DB activity)</h3>

                                        <div class="sql-queries-list">
                                            <div v-for="(query, index) in sqlQueries" :key="index" class="sql-query-item" :class="{ 'slow-query': query.isSlow }">
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

                            <!-- Route Graph Tab -->
                            <div v-if="activeTab === 'graph'">
                                <h2 class="section-title">Route Hierarchy Visualization</h2>
                                <p class="section-description">
                                    Interactive graph showing your application's route structure. Zoom and pan to explore the hierarchy.
                                </p>

                                <div class="graph-controls">
                                    <button @click="resetGraphZoom" class="graph-button">Reset Zoom</button>
                                    <button @click="exportGraphAsSVG" class="graph-button">Export as SVG</button>
                                </div>

                                <div id="route-graph-container" class="route-graph-container"></div>
                            </div>

                            <!-- Performance Issues Tab -->
                            <div v-if="activeTab === 'issues'">
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
                                                        <span class="method-badge" :style="{ background: getSeverityColor(route.severity) }">
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
                                        <div v-for="(issue, index) in performanceIssues.nPlusOneIssues" :key="index" class="sql-query-item">
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
                                <div v-if="performanceIssues.slowRoutes.length === 0 && performanceIssues.nPlusOneIssues.length === 0" class="alert alert-info">
                                    <div class="alert-title">No Performance Issues Detected</div>
                                    <div class="alert-message">
                                        Great! Your application is performing well. Keep monitoring as traffic increases.
                                    </div>
                                </div>
                            </div>
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
