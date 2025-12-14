/**
 * RoutesTab Component
 * Displays all routes with search and filter capabilities
 */

import RouteTable from "./RouteTable.js";

export default {
  name: "RoutesTab",
  components: {
    RouteTable,
  },
  props: {
    routes: {
      type: Array,
      required: true,
    },
    filteredRoutes: {
      type: Array,
      required: true,
    },
    searchQuery: {
      type: String,
      default: "",
    },
    selectedMethod: {
      type: String,
      default: "all",
    },
    selectedBundle: {
      type: String,
      default: "all",
    },
    uniqueMethods: {
      type: Array,
      default: () => [],
    },
    uniqueBundles: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:searchQuery", "update:selectedMethod", "update:selectedBundle"],
  template: `
    <div>
      <!-- Filters -->
      <div class="filters">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Search routes..."
          class="filter-input"
        >
        <select
          :value="selectedMethod"
          @change="$emit('update:selectedMethod', $event.target.value)"
          class="filter-select"
        >
          <option value="all">All Methods</option>
          <option v-for="method in uniqueMethods" :key="method" :value="method">{{ method }}</option>
        </select>
        <select
          :value="selectedBundle"
          @change="$emit('update:selectedBundle', $event.target.value)"
          class="filter-select"
        >
          <option value="all">All Bundles</option>
          <option v-for="bundle in uniqueBundles" :key="bundle" :value="bundle">{{ bundle }}</option>
        </select>
      </div>

      <div class="result-count">
        Showing {{ filteredRoutes.length }} of {{ routes.length }} routes
      </div>

      <RouteTable :routes="filteredRoutes" />
    </div>
  `,
};
