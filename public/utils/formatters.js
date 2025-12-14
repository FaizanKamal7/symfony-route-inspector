/**
 * Formatting utilities for Route Inspector
 * Provides consistent formatting for dates, times, and other data
 */

/**
 * Format date object or string to localized string
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string or "N/A"
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

/**
 * Get CSS class for response time based on thresholds
 * @param {number} time - Response time in milliseconds
 * @returns {string} CSS class name ('fast', 'medium', 'slow')
 */
export function getResponseTimeClass(time) {
  if (time > 2000) return "slow";      // > 2 seconds
  if (time > 1000) return "medium";    // > 1 second
  return "fast";                        // < 1 second
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Format milliseconds to readable string
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
export function formatMilliseconds(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
