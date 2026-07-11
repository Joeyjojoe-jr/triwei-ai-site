(() => {
  const ROOT_ID = "tw-notify-root";
  const LIVE_ID = "tw-notify-live";

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-atomic", "true");
    root.style.position = "fixed";
    root.style.right = "0.8rem";
    root.style.bottom = "0.8rem";
    root.style.zIndex = "90";
    root.style.display = "grid";
    root.style.gap = "0.5rem";
    root.style.maxWidth = "min(28rem, calc(100vw - 1.6rem))";
    root.style.pointerEvents = "none";
    document.body.appendChild(root);
    return root;
  }

  function ensureLiveRegion() {
    let live = document.getElementById(LIVE_ID);
    if (live) return live;
    live = document.createElement("div");
    live.id = LIVE_ID;
    live.setAttribute("aria-live", "polite");
    live.style.position = "absolute";
    live.style.left = "-9999px";
    live.style.width = "1px";
    live.style.height = "1px";
    live.style.overflow = "hidden";
    document.body.appendChild(live);
    return live;
  }

  function colorForType(type) {
    switch (type) {
      case "success":
        return { border: "#1a9e72", bg: "#eaf9f3", fg: "#0f5f45" };
      case "warn":
        return { border: "#d18700", bg: "#fff6df", fg: "#6e4f00" };
      case "error":
        return { border: "#cb2431", bg: "#ffeef0", fg: "#7a1320" };
      default:
        return { border: "#0f7acc", bg: "#eaf4ff", fg: "#0e3b61" };
    }
  }

  function createToast(message, type) {
    const colors = colorForType(type);
    const el = document.createElement("div");
    el.setAttribute("role", "status");
    el.style.pointerEvents = "auto";
    el.style.border = `1px solid ${colors.border}`;
    el.style.background = colors.bg;
    el.style.color = colors.fg;
    el.style.borderRadius = "0.6rem";
    el.style.padding = "0.5rem 0.65rem";
    el.style.boxShadow = "0 12px 24px rgba(16, 33, 53, 0.16)";
    el.style.fontFamily = "\"IBM Plex Sans\", \"Segoe UI\", sans-serif";
    el.style.fontSize = "0.9rem";
    el.style.lineHeight = "1.35";
    el.style.whiteSpace = "pre-wrap";
    el.textContent = String(message || "");
    return el;
  }

  function notify(message, options = {}) {
    const type = options.type || "info";
    const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 3800;
    const root = ensureRoot();
    const live = ensureLiveRegion();
    const text = String(message || "");
    const toast = createToast(text, type);
    root.appendChild(toast);
    live.textContent = text;
    if (timeoutMs > 0) {
      window.setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, timeoutMs);
    }
  }

  window.notify = window.notify || notify;
})();
