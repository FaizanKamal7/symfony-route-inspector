/**
 * RouteGraphTab Component
 * Displays interactive D3.js route hierarchy visualization
 */

import { getMethodColor } from "../utils/colors.js";
import { GRAPH_SETTINGS } from "../utils/constants.js";

export default {
  name: "RouteGraphTab",
  props: {
    routes: {
      type: Array,
      required: true,
    },
    hierarchyData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      graphInitialized: false,
    };
  },
  mounted() {
    this.initRouteGraph();
  },
  watch: {
    routes() {
      this.initRouteGraph();
    },
  },
  methods: {
    initRouteGraph() {
      if (this.routes.length === 0) return;

      const container = document.getElementById("route-graph-container");
      if (!container) return;

      // Clear container
      container.innerHTML = "";

      const width = container.clientWidth;
      const height = GRAPH_SETTINGS.HEIGHT;

      const svg = d3
        .select("#route-graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Determine line color based on theme
      const isDarkTheme =
        document.documentElement.getAttribute("data-theme") !== "light";
      const lineColor = isDarkTheme ? "#ffffff" : "#7c3aed";

      const g = svg
        .append("g")
        .attr("id", "graph-main-group")
        .attr("transform", "translate(40, 40)");

      // Create tree layout
      const tree = d3.tree().size([height - 80, width - 200]);
      const root = d3.hierarchy(this.hierarchyData);
      tree(root);

      // Add zoom
      const zoom = d3
        .zoom()
        .scaleExtent([GRAPH_SETTINGS.ZOOM_MIN, GRAPH_SETTINGS.ZOOM_MAX])
        .on("zoom", (event) => g.attr("transform", event.transform));

      svg.call(zoom);

      // Add links
      this.addLinks(g, root, lineColor);

      // Add nodes
      this.addNodes(g, root);

      // Add legend
      this.addLegend(svg, height);

      this.graphInitialized = true;
    },

    addLinks(g, root, lineColor) {
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
          // Animate the dash offset
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
    },

    addNodes(g, root) {
      const tooltip = this.createTooltip();
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
        .attr("r", (d) =>
          d.data.isEndpoint
            ? GRAPH_SETTINGS.NODE_RADIUS_ENDPOINT
            : GRAPH_SETTINGS.NODE_RADIUS_SEGMENT
        )
        .style("fill", (d) =>
          d.data.isEndpoint
            ? getMethodColor(d.data.methods?.[0])
            : "var(--accent-primary)"
        )
        .style("stroke", "var(--bg-primary)")
        .style("stroke-width", "2px")
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => this.handleNodeMouseOver(event, d, tooltip))
        .on("mouseout", (event, d) => this.handleNodeMouseOut(event, d, tooltip));

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

      // Add method badges
      this.addMethodBadges(node);
    },

    addMethodBadges(node) {
      const badgeGroup = node
        .filter((d) => d.data.isEndpoint && d.data.methods)
        .append("g")
        .attr("class", "method-badge-group")
        .attr("transform", "translate(0, 22)");

      badgeGroup.each(function (d) {
        const group = d3.select(this);
        const methods = d.data.methods;
        const { BADGE_WIDTH, BADGE_HEIGHT, BADGE_GAP } = GRAPH_SETTINGS;
        const totalWidth = methods.length * (BADGE_WIDTH + BADGE_GAP) - BADGE_GAP;
        const startX = -totalWidth / 2;

        methods.forEach((method, i) => {
          const x = startX + i * (BADGE_WIDTH + BADGE_GAP);

          // Add rounded rectangle
          group
            .append("rect")
            .attr("x", x)
            .attr("y", -BADGE_HEIGHT / 2)
            .attr("width", BADGE_WIDTH)
            .attr("height", BADGE_HEIGHT)
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", getMethodColor(method))
            .style("stroke", "white")
            .style("stroke-width", "2px")
            .style("pointer-events", "none");

          // Add method text
          group
            .append("text")
            .attr("x", x + BADGE_WIDTH / 2)
            .attr("y", 0)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(method)
            .style("fill", "white")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("pointer-events", "none");
        });
      });
    },

    addLegend(svg, height) {
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

      methods.forEach((method, i) => {
        const legendItem = legend
          .append("g")
          .attr("transform", `translate(0, ${i * 25})`);

        legendItem
          .append("rect")
          .attr("width", 60)
          .attr("height", 18)
          .attr("rx", 3)
          .style("fill", method.color);

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

    createTooltip() {
      return d3
        .select("body")
        .append("div")
        .attr("class", "route-tooltip")
        .style("opacity", 0);
    },

    handleNodeMouseOver(event, d, tooltip) {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", 10);

      if (d.data.isEndpoint) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html(
            `
            <div class="tooltip-header">
              <strong>${d.data.routeName || d.data.name}</strong>
            </div>
            <div class="tooltip-body">
              <div><strong>Path:</strong> ${d.data.path}</div>
              <div><strong>Methods:</strong> ${d.data.methods.join(", ")}</div>
              ${d.data.controller ? `<div><strong>Controller:</strong> ${d.data.controller}</div>` : ""}
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
    },

    handleNodeMouseOut(event, d, tooltip) {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", d.data.isEndpoint ? GRAPH_SETTINGS.NODE_RADIUS_ENDPOINT : GRAPH_SETTINGS.NODE_RADIUS_SEGMENT);

      tooltip.transition().duration(500).style("opacity", 0);
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
  template: `
    <div>
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
  `,
};
