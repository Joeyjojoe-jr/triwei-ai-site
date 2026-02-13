(() => {
  const isGamePath =
    /^\/games\/.+/.test(window.location.pathname) &&
    window.location.pathname !== "/games/" &&
    !window.location.pathname.startsWith("/games/specs/");
  if (!isGamePath) return;

  const POLL_MS = 500;
  const TOGGLE_KEY = "KeyI";
  const OVERLAY_ID = "tw-inspector-overlay";
  const TOOLBAR_ID = "tw-game-toolbar";
  let visible = false;

  const state = {
    fps: 0,
    dtMs: 0,
    frames: 0,
    lastTickAt: performance.now(),
    lastFrameAt: performance.now(),
    lastError: null
  };

  function nowIso() {
    try {
      return new Date().toISOString();
    } catch {
      return "";
    }
  }

  function safeClone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return { __error: "inspector payload is not JSON-serializable" };
    }
  }

  function deriveSlug(pathname) {
    const cleaned = String(pathname || "").replace(/^\/+|\/+$/g, "");
    const parts = cleaned.split("/");
    if (parts.length < 2 || parts[0] !== "games") return null;
    if (parts[1] === "specs") return null;
    if (parts.length === 2) return parts[1];
    if (parts[1] === "labs") return `labs/${parts[2] || ""}`.replace(/\/+$/g, "");
    return parts[1];
  }

  function createToolbar() {
    const slug = deriveSlug(window.location.pathname);
    if (!slug) return;
    if (document.getElementById(TOOLBAR_ID)) return;

    const mountTarget = document.querySelector(".game-page, .lab-wrap, article.content-page, main .container");
    if (!mountTarget) return;

    const toolbar = document.createElement("nav");
    toolbar.id = TOOLBAR_ID;
    toolbar.setAttribute("aria-label", "Game shortcuts");
    toolbar.style.display = "flex";
    toolbar.style.flexWrap = "wrap";
    toolbar.style.gap = "0.5rem";
    toolbar.style.alignItems = "center";
    toolbar.style.margin = "0.45rem 0 0.95rem";

    const specsUrl = `/games/specs/${slug.replace(/^\/+|\/+$/g, "")}/`;

    function addLink(href, label) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      link.style.display = "inline-flex";
      link.style.alignItems = "center";
      link.style.border = "1px solid var(--border, #d7e3ef)";
      link.style.background = "var(--surface, #ffffff)";
      link.style.borderRadius = "999px";
      link.style.padding = "0.28rem 0.65rem";
      link.style.fontSize = "0.86rem";
      link.style.fontWeight = "600";
      link.style.textDecoration = "none";
      toolbar.appendChild(link);
    }

    addLink("/games/", "Back to Games");
    addLink(specsUrl, "Specs");

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    resetButton.style.border = "1px solid var(--border, #d7e3ef)";
    resetButton.style.background = "var(--surface, #ffffff)";
    resetButton.style.borderRadius = "999px";
    resetButton.style.padding = "0.28rem 0.65rem";
    resetButton.style.fontSize = "0.86rem";
    resetButton.style.fontWeight = "600";
    resetButton.style.cursor = "pointer";
    resetButton.addEventListener("click", () => {
      if (typeof window.TWGame.reset === "function") {
        window.TWGame.reset();
        if (typeof window.notify === "function") {
          window.notify("Reset complete.", { type: "info", timeoutMs: 1800 });
        }
      } else if (typeof window.notify === "function") {
        window.notify("Reset is not yet wired for this page.", { type: "warn", timeoutMs: 2200 });
      }
    });
    toolbar.appendChild(resetButton);

    const hint = document.createElement("span");
    hint.textContent = "Inspector: press I";
    hint.style.fontSize = "0.8rem";
    hint.style.color = "var(--muted, #516273)";
    toolbar.appendChild(hint);

    const heading = mountTarget.querySelector("h1, h2");
    if (heading && heading.parentNode) {
      heading.insertAdjacentElement("afterend", toolbar);
    } else {
      mountTarget.insertAdjacentElement("afterbegin", toolbar);
    }
  }

  function ensureOverlay() {
    let el = document.getElementById(OVERLAY_ID);
    if (el) return el;

    el = document.createElement("aside");
    el.id = OVERLAY_ID;
    el.hidden = true;
    el.style.position = "fixed";
    el.style.right = "0.8rem";
    el.style.top = "4.2rem";
    el.style.width = "min(26rem, calc(100vw - 1.6rem))";
    el.style.maxHeight = "calc(100vh - 5rem)";
    el.style.overflow = "auto";
    el.style.zIndex = "95";
    el.style.border = "1px solid #1f5c93";
    el.style.borderRadius = "0.7rem";
    el.style.background = "rgba(6, 24, 42, 0.93)";
    el.style.color = "#e9f2fb";
    el.style.boxShadow = "0 16px 30px rgba(6, 24, 42, 0.35)";
    el.style.padding = "0.65rem 0.75rem";
    el.style.fontFamily = "\"IBM Plex Sans\", \"Segoe UI\", sans-serif";
    el.style.fontSize = "0.84rem";
    el.style.lineHeight = "1.4";

    const title = document.createElement("div");
    title.textContent = "TriWei Inspector";
    title.style.fontWeight = "700";
    title.style.marginBottom = "0.4rem";
    el.appendChild(title);

    const content = document.createElement("pre");
    content.id = `${OVERLAY_ID}-content`;
    content.style.margin = "0";
    content.style.whiteSpace = "pre-wrap";
    content.style.wordBreak = "break-word";
    content.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace";
    content.textContent = "Waiting for data...";
    el.appendChild(content);

    document.body.appendChild(el);
    return el;
  }

  function getPayload() {
    const base = {
      route: window.location.pathname,
      timestamp: nowIso(),
      fps: Number(state.fps.toFixed(1)),
      frame_dt_ms: Number(state.dtMs.toFixed(2)),
      sim_time: typeof window.TWGame._simTimeGetter === "function" ? window.TWGame._simTimeGetter() : null,
      seed: typeof window.TWGame._seedGetter === "function"
        ? window.TWGame._seedGetter()
        : (typeof window.TWGame.getSeed === "function" ? window.TWGame.getSeed() : null),
      last_error: state.lastError
    };
    if (typeof window.TWGame._inspectorGetter === "function") {
      try {
        base.metrics = safeClone(window.TWGame._inspectorGetter());
      } catch (error) {
        base.metrics = { __error: error && error.message ? error.message : "inspector getter failed" };
      }
    }
    return base;
  }

  function renderOverlay() {
    const overlay = ensureOverlay();
    const content = document.getElementById(`${OVERLAY_ID}-content`);
    if (!content) return;
    const payload = getPayload();
    content.textContent = JSON.stringify(payload, null, 2);
    overlay.hidden = !visible;
  }

  function loopFrame(now) {
    const dt = now - state.lastFrameAt;
    state.lastFrameAt = now;
    state.dtMs = dt;
    state.frames += 1;

    if (now - state.lastTickAt >= 1000) {
      const elapsed = now - state.lastTickAt;
      state.fps = (state.frames * 1000) / Math.max(1, elapsed);
      state.frames = 0;
      state.lastTickAt = now;
    }

    window.requestAnimationFrame(loopFrame);
  }

  window.TWGame = window.TWGame || {};
  window.TWGame._inspectorGetter = null;
  window.TWGame._simTimeGetter = null;
  window.TWGame._seedGetter = null;
  window.TWGame.setInspector = (getter) => {
    window.TWGame._inspectorGetter = typeof getter === "function" ? getter : null;
  };
  window.TWGame.setSimTimeGetter = (getter) => {
    window.TWGame._simTimeGetter = typeof getter === "function" ? getter : null;
  };
  window.TWGame.setSeedGetter = (getter) => {
    window.TWGame._seedGetter = typeof getter === "function" ? getter : null;
  };

  window.addEventListener("error", (event) => {
    state.lastError = {
      message: event.message || "Unhandled error",
      file: event.filename || "",
      line: Number(event.lineno || 0),
      column: Number(event.colno || 0),
      at: nowIso()
    };
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    state.lastError = {
      message: reason && reason.message ? reason.message : String(reason),
      file: "",
      line: 0,
      column: 0,
      at: nowIso()
    };
  });

  window.addEventListener("keydown", (event) => {
    if (event.code !== TOGGLE_KEY) return;
    if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    visible = !visible;
    renderOverlay();
    if (typeof window.notify === "function") {
      window.notify(`Inspector ${visible ? "enabled" : "disabled"} (toggle with I).`, {
        type: "info",
        timeoutMs: 1200
      });
    }
  });

  window.requestAnimationFrame(loopFrame);
  window.setInterval(renderOverlay, POLL_MS);
  document.addEventListener("DOMContentLoaded", () => {
    createToolbar();
    renderOverlay();
  });
})();
