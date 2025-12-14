/**
 * StatCard Component
 * Displays a single statistic with label and value
 */

export default {
  name: "StatCard",
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [Number, String],
      required: true,
    },
    variant: {
      type: String,
      default: "primary",
      validator: (value) =>
        ["primary", "success", "warning", "danger", "purple"].includes(value),
    },
  },
  template: `
    <div class="stat-card">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value" :class="'stat-' + variant">{{ value }}</div>
    </div>
  `,
};
