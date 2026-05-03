let host;

function ensureHost() {
  if (host) return host;
  host = document.createElement("div");
  host.className = "toast-host";
  host.setAttribute("aria-live", "polite");
  document.body.appendChild(host);
  return host;
}

export function showToast(message, variant = "info", durationMs = 4200) {
  const root = ensureHost();
  const el = document.createElement("div");
  el.className = `toast toast--${variant === "error" ? "error" : variant === "success" ? "success" : ""}`;
  const icons = { success: "✓", error: "✕", info: "·" };
  el.innerHTML = `<span class="toast-icon">${icons[variant] || "·"}</span><span>${message}</span>`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-visible"));
  window.setTimeout(() => {
    el.classList.remove("is-visible");
    window.setTimeout(() => el.remove(), 250);
  }, durationMs);
}
