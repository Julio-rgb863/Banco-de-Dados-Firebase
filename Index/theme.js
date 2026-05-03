const STORAGE_KEY = "nimbus_theme";

export function getStoredTheme() {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" ? "light" : "dark";
}

export function setStoredTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function initThemeFromStorage() {
  applyTheme(getStoredTheme());
}