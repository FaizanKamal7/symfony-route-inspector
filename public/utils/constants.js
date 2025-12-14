/**
 * Constants for Route Inspector
 * Centralized configuration and magic numbers
 */

/**
 * Performance thresholds in milliseconds
 */
export const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 100,        // SQL query > 100ms is slow
  SLOW_ROUTE: 500,        // Route > 500ms is slow
  MEDIUM_RESPONSE: 1000,  // Route > 1s is medium
  CRITICAL_RESPONSE: 2000 // Route > 2s is critical
};

/**
 * Graph visualization settings
 */
export const GRAPH_SETTINGS = {
  WIDTH: 800,
  HEIGHT: 800,
  BADGE_WIDTH: 45,
  BADGE_HEIGHT: 18,
  BADGE_GAP: 3,
  NODE_RADIUS_ENDPOINT: 6,
  NODE_RADIUS_SEGMENT: 8,
  ZOOM_MIN: 0.3,
  ZOOM_MAX: 3,
};

/**
 * API request settings
 */
export const API_SETTINGS = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

/**
 * N+1 detection threshold
 * If same query appears more than this many times, it's likely N+1
 */
export const N_PLUS_ONE_THRESHOLD = 5;

/**
 * Number of routes to show in analytics top list
 */
export const TOP_ROUTES_COUNT = 10;
