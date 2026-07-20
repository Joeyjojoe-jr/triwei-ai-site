(function () {
  'use strict';

  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-signal-filter]'));
  var tagFilters = Array.prototype.slice.call(document.querySelectorAll('[data-signal-tag]'));
  var threads = Array.prototype.slice.call(document.querySelectorAll('[data-signal-thread]'));
  var status = document.getElementById('signal-filter-status');
  var queryNote = document.getElementById('signal-query-note');
  if (!filters.length || !threads.length) return;

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function track(name, payload) {
    if (window.triweiAnalytics && typeof window.triweiAnalytics.track === 'function') {
      window.triweiAnalytics.track(name, payload || {});
    }
  }

  function matches(thread, key, rawQuery) {
    if (key === 'all') return true;
    var tags = normalize(thread.getAttribute('data-signal-tags'));
    var text = normalize(thread.textContent);
    var needle = normalize(rawQuery || key);
    return tags.indexOf(needle) !== -1 || text.indexOf(needle) !== -1;
  }

  function applyFilter(key, rawQuery, announce, origin) {
    var visible = 0;
    threads.forEach(function (thread) {
      var show = matches(thread, key, rawQuery);
      thread.hidden = !show;
      if (show) visible += 1;
    });

    filters.forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-signal-filter') === key ? 'true' : 'false');
    });

    if (status) {
      status.textContent = visible === threads.length
        ? 'Showing all ' + visible + ' threads.'
        : 'Showing ' + visible + ' of ' + threads.length + ' threads.';
    }

    if (queryNote) {
      if (rawQuery) {
        queryNote.hidden = false;
        if (origin === 'tag') {
          queryNote.textContent = visible
            ? 'Showing threads matched by saved tag or text “' + rawQuery + '”. This is literal browser-side matching—not an AI judgment.'
            : 'No additional thread matches “' + rawQuery + '”. Showing the full ledger instead.';
        } else {
          queryNote.textContent = visible
            ? 'Opened from “Right now in AI: ' + rawQuery + '”. Showing threads whose source trail mentions that topic.'
            : 'No historical thread is indexed for “' + rawQuery + '” yet. Showing the full ledger instead.';
        }
      } else {
        queryNote.hidden = true;
        queryNote.textContent = '';
      }
    }

    if (rawQuery && key === 'query' && visible === 0) {
      applyFilter('all', '', false, origin);
      if (queryNote) {
        queryNote.hidden = false;
        queryNote.textContent = 'No historical thread is indexed for “' + rawQuery + '” yet. Showing the full ledger instead.';
      }
    }

    if (announce !== false) track('signal_history_filter', { filter: key, query: rawQuery || '', visible: visible });
  }

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      applyFilter(button.getAttribute('data-signal-filter') || 'all', '', true, 'filter');
    });
  });

  tagFilters.forEach(function (button) {
    button.addEventListener('click', function () {
      applyFilter('query', button.getAttribute('data-signal-tag') || '', true, 'tag');
    });
  });

  var params = new URLSearchParams(window.location.search);
  var topic = params.get('topic');
  if (topic) {
    var normalizedTopic = normalize(topic);
    var direct = filters.filter(function (button) {
      return normalize(button.getAttribute('data-signal-filter')) === normalizedTopic;
    })[0];
    applyFilter(direct ? direct.getAttribute('data-signal-filter') : 'query', topic, false, 'homepage');
  }
}());
