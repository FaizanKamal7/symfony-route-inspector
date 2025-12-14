/**
 * GroupedTab Component
 * Displays routes grouped by bundle/controller
 */

import { getMethodColor } from "../utils/colors.js";

export default {
  name: "GroupedTab",
  props: {
    groupedRoutes: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getMethodColor,
  },
  template: `
    <div>
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
                <span
                  v-for="method in route.methods"
                  :key="method"
                  class="method-badge"
                  :style="{ background: getMethodColor(method) }"
                >
                  {{ method }}
                </span>
              </div>
            </div>
            <div class="route-item-controller">{{ route.controller }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
};
