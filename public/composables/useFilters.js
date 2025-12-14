/**
 * Filters Composable
 * Manages route filtering by search query, method, and bundle
 */

import { ref, computed } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

export function useFilters(routes) {
  const searchQuery = ref("");
  const selectedMethod = ref("all");
  const selectedBundle = ref("all");

  /**
   * Get filtered routes based on search and filter criteria
   */
  const filteredRoutes = computed(() => {
    let filtered = routes.value;

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (route) =>
          route.name.toLowerCase().includes(query) ||
          route.path.toLowerCase().includes(query) ||
          route.controller.toLowerCase().includes(query)
      );
    }

    // Filter by HTTP method
    if (selectedMethod.value !== "all") {
      filtered = filtered.filter((route) =>
        route.methods.includes(selectedMethod.value)
      );
    }

    // Filter by bundle
    if (selectedBundle.value !== "all") {
      filtered = filtered.filter(
        (route) => route.bundle === selectedBundle.value
      );
    }

    return filtered;
  });

  /**
   * Get unique HTTP methods from routes
   */
  const uniqueMethods = computed(() => {
    const methods = new Set();
    routes.value.forEach((route) => {
      route.methods.forEach((method) => methods.add(method));
    });
    return Array.from(methods).sort();
  });

  /**
   * Get unique bundles from routes
   */
  const uniqueBundles = computed(() => {
    const bundles = new Set();
    routes.value.forEach((route) => bundles.add(route.bundle));
    return Array.from(bundles).sort();
  });

  return {
    searchQuery,
    selectedMethod,
    selectedBundle,
    filteredRoutes,
    uniqueMethods,
    uniqueBundles,
  };
}
