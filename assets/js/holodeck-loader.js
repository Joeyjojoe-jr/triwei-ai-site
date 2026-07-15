/* TriWei AI — capability-aware holodeck loader.
   Mobile, touch, reduced-motion, data-saver, and low-memory clients use
   the lightweight CSS background and never download or initialize WebGL. */
(function () {
  'use strict';

  var root = document.documentElement;
  var canvas = document.getElementById('holodeck-canvas');
  var loaderScript = document.currentScript;

  function mediaMatches(query) {
    try {
      return Boolean(window.matchMedia && window.matchMedia(query).matches);
    } catch (error) {
      return false;
    }
  }

  function setStaticMode(reason) {
    root.setAttribute('data-holodeck', 'static');
    root.setAttribute('data-holodeck-reason', reason || 'fallback');
    if (canvas) {
      canvas.hidden = true;
      canvas.setAttribute('aria-hidden', 'true');
    }
  }

  function shouldUseStaticMode() {
    var nav = window.navigator || {};
    var connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    return (
      mediaMatches('(prefers-reduced-motion: reduce)') ||
      mediaMatches('(max-width: 900px)') ||
      mediaMatches('(pointer: coarse)') ||
      mediaMatches('(hover: none)') ||
      Boolean(connection && connection.saveData === true) ||
      Boolean(typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4)
    );
  }

  function loadScript(src, onLoad, onError) {
    if (!src || !document.head) {
      onError();
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
  }

  if (!canvas || !loaderScript) {
    setStaticMode('missing-elements');
    return;
  }

  if (root.getAttribute('data-holodeck') === 'static' || shouldUseStaticMode()) {
    setStaticMode('mobile-or-constrained');
    return;
  }

  if (!window.WebGLRenderingContext && !window.WebGL2RenderingContext) {
    setStaticMode('webgl-unavailable');
    return;
  }

  var threeSrc = loaderScript.getAttribute('data-three-src');
  var holodeckSrc = loaderScript.getAttribute('data-holodeck-src');
  root.setAttribute('data-holodeck', 'loading');

  loadScript(
    threeSrc,
    function () {
      if (!window.THREE) {
        setStaticMode('three-unavailable');
        return;
      }

      loadScript(
        holodeckSrc,
        function () {
          if (root.getAttribute('data-holodeck') === 'loading') {
            setStaticMode('renderer-init-failed');
          }
        },
        function () {
          setStaticMode('holodeck-script-failed');
        }
      );
    },
    function () {
      setStaticMode('three-script-failed');
    }
  );
})();
