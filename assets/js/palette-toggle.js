/* TriWei phosphor/amber palette controller. */
(function () {
  'use strict';

  var root = document.documentElement;
  var storageKey = 'triwei-palette';
  var validPalettes = { phosphor: true, amber: true };
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

  function updateControl(palette) {
    var button = document.getElementById('palette-toggle');
    if (!button) return;

    var nextPalette = palette === 'amber' ? 'phosphor' : 'amber';
    button.setAttribute('data-next-palette', nextPalette);
    button.setAttribute('aria-pressed', palette === 'amber' ? 'true' : 'false');
    button.setAttribute('aria-label', 'Switch to ' + nextPalette + ' color palette');
    button.setAttribute('title', 'Switch to ' + nextPalette + ' color palette');
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
