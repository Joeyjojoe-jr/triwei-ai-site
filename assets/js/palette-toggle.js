/* TriWei phosphor/amber palette controller. */
(function () {
  'use strict';

  var root = document.documentElement;
  var storageKey = 'triwei-palette';
  var validPalettes = { phosphor: true, amber: true };
  var paletteAssets = {
    phosphor: 'triwei-logo.png',
    amber: 'triwei-logo-amber.png'
  };
  var paletteColors = {
    phosphor: '#33ff33',
    amber: '#ff8800'
  };

  function normalizePalette(value) {
    return validPalettes[value] ? value : 'phosphor';
  }

  function readSavedPalette() {
    try {
      return normalizePalette(localStorage.getItem(storageKey));
    } catch (error) {
      return normalizePalette(root.getAttribute('data-palette'));
    }
  }

  function imageBasePath(image) {
    var src = image.getAttribute('src') || '';
    var marker = '/assets/images/';
    var markerIndex = src.lastIndexOf(marker);
    if (markerIndex === -1) return '/assets/images/';
    return src.slice(0, markerIndex + marker.length);
  }

  function updateEmblems(palette) {
    var images = document.querySelectorAll('img.emblem');
    images.forEach(function (image) {
      var nextSource = imageBasePath(image) + paletteAssets[palette];
      if (image.getAttribute('src') === nextSource) return;

      image.classList.add('is-palette-swapping');
      var finishSwap = function () {
        image.classList.remove('is-palette-swapping');
      };
      image.addEventListener('load', finishSwap, { once: true });
      image.addEventListener('error', finishSwap, { once: true });
      image.setAttribute('src', nextSource);
      if (image.complete) {
        window.requestAnimationFrame(finishSwap);
      }
    });
  }

  function updateControl(palette) {
    var button = document.getElementById('palette-toggle');
    if (!button) return;

    var nextPalette = palette === 'amber' ? 'phosphor' : 'amber';
    var label = button.querySelector('[data-palette-toggle-label]');
    button.setAttribute('data-next-palette', nextPalette);
    button.setAttribute('aria-pressed', palette === 'amber' ? 'true' : 'false');
    button.setAttribute('aria-label', 'Switch to ' + nextPalette + ' color palette');
    button.setAttribute('title', 'Switch to ' + nextPalette + ' color palette');
    if (label) {
      label.textContent = nextPalette.toUpperCase();
    }
  }

  function applyPalette(value, options) {
    var palette = normalizePalette(value);
    var settings = options || {};

    root.setAttribute('data-theme', 'dark');
    root.setAttribute('data-palette', palette);
    root.style.colorScheme = 'dark';

    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', paletteColors[palette]);
    }

    updateControl(palette);
    updateEmblems(palette);

    if (settings.persist) {
      try {
        localStorage.setItem(storageKey, palette);
      } catch (error) {
        // The palette still applies for this session when storage is unavailable.
      }
    }

    if (window.CustomEvent && settings.emit !== false) {
      window.dispatchEvent(new CustomEvent('triwei:palettechange', {
        detail: { palette: palette }
      }));
    }

    return palette;
  }

  function preloadAlternate(palette) {
    var image = document.querySelector('img.emblem');
    if (!image) return;
    var alternate = palette === 'amber' ? 'phosphor' : 'amber';
    var preload = new Image();
    preload.src = imageBasePath(image) + paletteAssets[alternate];
  }

  var currentPalette = applyPalette(
    root.getAttribute('data-palette') || readSavedPalette(),
    { persist: false, emit: false }
  );

  var toggleButton = document.getElementById('palette-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', function () {
      var current = normalizePalette(root.getAttribute('data-palette'));
      currentPalette = applyPalette(
        current === 'amber' ? 'phosphor' : 'amber',
        { persist: true, emit: true }
      );
    });
  }

  window.addEventListener('storage', function (event) {
    if (event.key !== storageKey || !validPalettes[event.newValue]) return;
    currentPalette = applyPalette(event.newValue, { persist: false, emit: true });
  });

  window.addEventListener('load', function () {
    preloadAlternate(currentPalette);
  }, { once: true });

  window.triweiPalette = {
    get: function () {
      return normalizePalette(root.getAttribute('data-palette'));
    },
    set: function (palette) {
      currentPalette = applyPalette(palette, { persist: true, emit: true });
      return currentPalette;
    }
  };
})();
