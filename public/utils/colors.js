/**
 * Color utilities for Route Inspector
 * Provides consistent color schemes for HTTP methods, severity levels, and UI elements
 */

/**
 * HTTP method color mapping
 */
export const METHOD_COLORS = {
  GET: "#3b82f6",      // Blue
  POST: "#10b981",     // Green
  PUT: "#f59e0b",      // Orange
  DELETE: "#ef4444",   // Red
  PATCH: "#8b5cf6",    // Purple
  ANY: "#64748b",      // Gray
};

/**
 * Severity level color mapping
 */
export const SEVERITY_COLORS = {
  critical: "#ef4444", // Red
  high: "#f59e0b",     // Orange
  medium: "#f59e0b",   // Orange
  low: "#64748b",      // Gray
};

/**
 * Get color for HTTP method
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @returns {string} Hex color code
 */
export function getMethodColor(method) {
  return METHOD_COLORS[method] || METHOD_COLORS.ANY;
}

/**
 * Get color for severity level
 * @param {string} severity - Severity level (critical, high, medium, low)
 * @returns {string} Hex color code
 */
export function getSeverityColor(severity) {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS.low;
}
