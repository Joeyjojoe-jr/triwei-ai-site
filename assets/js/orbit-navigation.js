/* TriWei AI — accessible drill-down navigation for the homepage orbit. */
(function (factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;
  } else {
    factory(document, window);
  }
})(function initOrbitNavigation(document, window) {
  var orbit = document.querySelector('[data-orbit-nav]');
  if (!orbit) return null;

  var mainRing = orbit.querySelector('[data-orbit-level="main"]');
  var backButton = orbit.querySelector('[data-orbit-back]');
  var hint = orbit.querySelector('[data-orbit-hint]');
  var status = orbit.querySelector('[data-orbit-status]');
  var openers = Array.prototype.slice.call(orbit.querySelectorAll('[data-orbit-open]'));
  var rings = Array.prototype.slice.call(orbit.querySelectorAll('[data-orbit-level]'));
  var mainCards = mainRing && mainRing.querySelectorAll
    ? Array.prototype.slice.call(mainRing.querySelectorAll('.folder-card'))
    : [];
  var emptyStates = Array.prototype.slice.call(orbit.querySelectorAll('.folder-empty'));
  var lastOpener = null;

  if (!mainRing || !backButton || !hint || !status) return null;

  function track(eventName, payload) {
    if (window.triweiAnalytics && typeof window.triweiAnalytics.track === 'function') {
      window.triweiAnalytics.track(eventName, payload);
    }
  }

  function showRing(level) {
    var nextRing = orbit.querySelector('[data-orbit-level="' + level + '"]');
    if (!nextRing) return false;

    rings.forEach(function (ring) {
      var active = ring === nextRing;
      ring.hidden = !active;
      ring.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    openers.forEach(function (opener) {
      opener.setAttribute(
        'aria-expanded',
        opener.getAttribute('data-orbit-open') === level ? 'true' : 'false'
      );
    });

    var isMain = nextRing === mainRing;
    var title = nextRing.getAttribute('data-orbit-title') || 'Folders';
    orbit.classList.toggle('is-drilled', !isMain);
    backButton.disabled = isMain;
    backButton.setAttribute(
      'aria-label',
      isMain ? 'Main category folders' : 'Back to all main category folders'
    );
    hint.textContent = isMain ? 'Main folders' : 'Back to main folders';
    status.textContent = isMain
      ? 'Choose a folder to open subcategories; story titles open original sources. We apologize for source gaps and leave them visible rather than risk misattribution or misappropriation.'
      : title + ' — subfolders now orbiting; select an original-source link or use the TriWei logo to go back';
    return true;
  }

  openers.forEach(function (opener) {
    opener.addEventListener('click', function (event) {
      var level = opener.getAttribute('data-orbit-open');
      if (!showRing(level)) return;
      event.preventDefault();
      lastOpener = opener;
      track('orbit_folder_open', { category: level });
      backButton.focus();
    });
  });

  mainCards.forEach(function (card) {
    card.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.closest && target.closest('a')) return;
      var opener = card.querySelector && card.querySelector('[data-orbit-open]');
      if (opener && typeof opener.click === 'function') opener.click();
    });
  });

  emptyStates.forEach(function (emptyState) {
    emptyState.textContent = 'Sorry, this source folder is incomplete. TriWei withholds intermediary or unverified links rather than risk misattribution, misappropriation, copied text, or an AI-written substitute.';
  });

  backButton.addEventListener('click', function () {
    if (!showRing('main')) return;
    track('orbit_folder_back', {});
    if (lastOpener) lastOpener.focus();
  });

  orbit.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || backButton.disabled) return;
    event.preventDefault();
    backButton.click();
  });

  showRing('main');
  return { showRing: showRing };
});
