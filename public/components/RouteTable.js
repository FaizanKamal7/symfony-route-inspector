/**
 * RouteTable Component
 * Displays routes in a table format with filtering
 */

import { getMethodColor } from "../utils/colors.js";

export default {
  name: "RouteTable",
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getMethodColor,
  },
  template: `
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
          <tr v-for="route in routes" :key="route.name">
            <td class="route-name">{{ route.name }}</td>
            <td class="route-path">{{ route.path }}</td>
            <td>
              <span
                v-for="method in route.methods"
                :key="method"
                class="method-badge"
                :style="{ background: getMethodColor(method) }"
              >
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
  `,
};
