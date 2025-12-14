/**
 * Theme Composable
 * Manages dark/light theme switching with localStorage persistence
 */

import { ref, watch, onMounted } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

export function useTheme() {
  const theme = ref(localStorage.getItem("theme") || "dark");

  /**
   * Toggle between dark and light themes
   */
  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
  };

  /**
   * Watch for theme changes and update DOM/localStorage
   */
  watch(theme, (newTheme) => {
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  });

  /**
   * Initialize theme on mount
   */
  onMounted(() => {
    document.documentElement.setAttribute("data-theme", theme.value);
  });

  return {
    theme,
    toggleTheme,
  };
}
