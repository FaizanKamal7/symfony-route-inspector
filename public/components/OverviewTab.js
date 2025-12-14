/**
 * OverviewTab Component
 * Displays route distribution by method and bundle
 */

import { getMethodColor } from "../utils/colors.js";

export default {
  name: "OverviewTab",
  props: {
    statistics: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getMethodColor,
  },
  template: `
    <div>
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
              <div
                class="progress-fill"
                :style="{
                  width: (count / statistics.total * 100) + '%',
                  background: getMethodColor(method)
                }"
              ></div>
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
              <div
                class="progress-fill"
                :style="{
                  width: (count / statistics.total * 100) + '%',
                  background: '#8b5cf6'
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
