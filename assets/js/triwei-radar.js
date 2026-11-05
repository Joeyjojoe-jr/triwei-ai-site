/* TriWei Radar: metadata-only discovery. Never converts headlines into verified claims. */
(function (make) {
  var radar = make();
  if (typeof module === 'object' && module.exports) module.exports = radar;
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    radar.mount(document, window);
  }
})(function () {
  'use strict';
  var STORAGE_KEY = 'triwei-radar-watch-v1';
  var TOPICS = ['labs', 'research', 'community', 'business', 'ethics'];

  function direct(url) {
    try {
      var parsed = new URL(url);
      return parsed.protocol === 'https:' && !!parsed.hostname &&
        parsed.hostname !== 'news.google.com' &&
        parsed.hostname !== 'www.news.google.com' &&
        !/^(localhost|127\.0\.0\.1)$/.test(parsed.hostname);
    } catch (error) {
      return false;
    }
  }

  function ageHours(published, now) {
    var time = Date.parse(published || '');
    if (!Number.isFinite(time)) return Infinity;
    var delta = (now - time) / 3600000;
    return delta < -0.1 ? Infinity : Math.max(0, delta);
  }

  function matches(item, filter, now) {
    if (!direct(item.url)) return false;
    if (!Number.isFinite(ageHours(item.published, now)) ||
        ageHours(item.published, now) > filter.hours) return false;
    if (filter.topic !== 'all' && item.topic !== filter.topic) return false;
    if (filter.channel && filter.channel !== 'all' && item.channel !== filter.channel) return false;
    if (filter.savedOnly && !filter.saved.has(item.url)) return false;
    var needle = (filter.query || '').trim().toLowerCase();
    return !needle || (item.title + ' ' + item.source).toLowerCase().indexOf(needle) !== -1;
  }

  // Equal opportunity for each source folder. Not an importance or truth score.
  function balancedOrder(items) {
    var buckets = {};
    TOPICS.forEach(function (topic) { buckets[topic] = []; });
    items.forEach(function (item) {
      if (!buckets[item.topic]) buckets[item.topic] = [];
      buckets[item.topic].push(item);
    });
    Object.keys(buckets).forEach(function (topic) {
      buckets[topic].sort(function (a, b) {
        return Date.parse(b.published || '') - Date.parse(a.published || '');
      });
    });
    var output = [];
    var keys = TOPICS.concat(Object.keys(buckets).filter(function (key) {
      return TOPICS.indexOf(key) === -1;
    }));
    var more = true;
    while (more) {
      more = false;
      keys.forEach(function (key) {
        if (buckets[key] && buckets[key].length) {
          output.push(buckets[key].shift());
          more = true;
        }
      });
    }
    return output;
  }

  function readSaved(win) {
    try {
      var value = JSON.parse(win.localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(value)) return new Set();
      return new Set(value.filter(function (url) { return typeof url === 'string' && direct(url); }).slice(-100));
    } catch (error) {
      return new Set();
    }
  }

  function writeSaved(win, saved) {
    try {
      win.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(saved).slice(-100)));
    } catch (error) {
      // Private browsing and storage restrictions must not break the page.
    }
  }

  function mount(doc, win) {
    var root = doc.querySelector('[data-radar]');
    if (!root) return null;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-radar-card]'));
    var grid = root.querySelector('[data-radar-grid]');
    var select = root.querySelector('[data-radar-topic]');
    var channelSelect = root.querySelector('[data-radar-channel]');
    var search = root.querySelector('[data-radar-search]');
    var more = root.querySelector('[data-radar-more]');
    var count = root.querySelector('[data-radar-count]');
    var empty = root.querySelector('[data-radar-empty]');
    var stale = root.querySelector('[data-radar-stale]');
    var windows = Array.prototype.slice.call(root.querySelectorAll('[data-radar-window]'));
    var savedButton = root.querySelector('[data-radar-saved]');
    if (!grid || !select || !channelSelect || !search || !more || !count || !empty || !savedButton) return null;

    var saved = readSaved(win);
    var state = { hours: 24, topic: 'all', channel: 'all', query: '', savedOnly: false, expanded: false };
    var seen = new Set();
    var items = cards.map(function (card) {
      var link = card.querySelector('[data-radar-source]');
      var url = link ? link.href : '';
      var item = {
        card: card,
        url: url,
        topic: card.getAttribute('data-radar-topic') || '',
        channel: card.getAttribute('data-radar-channel') || 'unknown',
        published: card.getAttribute('data-radar-published') || '',
        title: link ? link.textContent.trim() : '',
        source: (card.querySelector('[data-radar-publisher]') || {}).textContent || ''
      };
      item.duplicate = seen.has(url);
      seen.add(url);
      return item;
    });
    // Sorting does not change the source, attribution, or original headline.
    balancedOrder(items.filter(function (item) { return !item.duplicate; })).forEach(function (item) {
      grid.appendChild(item.card);
    });

    function render() {
      var now = Date.now();
      var filter = {
        hours: state.hours,
        topic: state.topic,
        channel: state.channel,
        query: state.query,
        savedOnly: state.savedOnly,
        saved: saved
      };
      var qualifying = items.filter(function (item) {
        return !item.duplicate && matches(item, filter, now);
      });
      var ordered = state.topic === 'all' ? balancedOrder(qualifying) :
        qualifying.sort(function (a, b) { return Date.parse(b.published) - Date.parse(a.published); });
      var visible = state.expanded ? ordered : ordered.slice(0, 6);
      var show = new Set(visible.map(function (item) { return item.url; }));
      items.forEach(function (item) {
        item.card.hidden = item.duplicate || !show.has(item.url);
        var button = item.card.querySelector('[data-radar-watch]');
        if (button) {
          var isSaved = saved.has(item.url);
          button.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
          button.textContent = isSaved ? 'Saved to watch' : 'Save to watch';
        }
      });
      // Reorder visible cards consistently with the active filters.
      ordered.forEach(function (item) { grid.appendChild(item.card); });
      count.textContent = qualifying.length + ' direct-source report' +
        (qualifying.length === 1 ? '' : 's') + ' found';
      empty.hidden = qualifying.length > 0;
      more.hidden = state.expanded || qualifying.length <= 6;
      savedButton.setAttribute('aria-pressed', state.savedOnly ? 'true' : 'false');
      windows.forEach(function (button) {
        button.setAttribute('aria-pressed',
          Number(button.getAttribute('data-radar-window')) === state.hours ? 'true' : 'false');
      });
      if (stale) {
        stale.hidden = ageHours(root.getAttribute('data-radar-generated'), now) <= 12;
      }
    }

    grid.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('[data-radar-watch]');
      if (!button) return;
      var card = button.closest('[data-radar-card]');
      var item = items.find(function (entry) { return entry.card === card; });
      if (!item || !direct(item.url)) return;
      if (saved.has(item.url)) saved.delete(item.url);
      else saved.add(item.url);
      writeSaved(win, saved);
      render();
    });
    select.addEventListener('change', function () {
      state.topic = select.value;
      state.expanded = false;
      render();
    });
    channelSelect.addEventListener('change', function () {
      state.channel = channelSelect.value;
      state.expanded = false;
      render();
    });
    search.addEventListener('input', function () {
      state.query = search.value;
      state.expanded = false;
      render();
    });
    windows.forEach(function (button) {
      button.addEventListener('click', function () {
        state.hours = Number(button.getAttribute('data-radar-window'));
        state.expanded = false;
        render();
      });
    });
    savedButton.addEventListener('click', function () {
      state.savedOnly = !state.savedOnly;
      state.expanded = false;
      render();
    });
    more.addEventListener('click', function () {
      state.expanded = true;
      render();
    });
    render();
    return { render: render };
  }

  return {
    direct: direct,
    ageHours: ageHours,
    matches: matches,
    balancedOrder: balancedOrder,
    readSaved: readSaved,
    mount: mount
  };
});
