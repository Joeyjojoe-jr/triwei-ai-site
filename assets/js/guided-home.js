/* TriWei Brief: a visually distinct five-minute briefing below the preserved orbit.
   It reads the existing rendered AI Pulse, makes no network requests, and never
   rewrites the orbit, emblem, or topic-folder markup. */
(function () {
  'use strict';

  var HERO_SELECTOR = '.hero-orbit-wrap';
  var PULSE_SELECTOR = '.pulse-block';
  var SNAPSHOT_KEY = 'triwei-brief-snapshot-v1';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function safeText(node, fallback) {
    var value = node && node.textContent ? node.textContent.replace(/\s+/g, ' ').trim() : '';
    return value || fallback || '';
  }

  function readNumber(text, pattern) {
    var match = String(text || '').match(pattern);
    return match ? Number(match[1]) : 0;
  }

  function signalKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }

  function contextFor(title) {
    var value = String(title || '').toLowerCase();
    if (/(kimi|deepseek|llama|qwen|open.weight|model)/.test(value)) {
      return {
        why: 'Changes in model access and capability affect who can experiment, how much inference costs, and which provenance claims require verification.',
        concepts: ['Open weights', 'Benchmarks', 'Inference cost', 'Provenance'],
        route: '/signals/',
        routeLabel: 'Trace model diffusion'
      };
    }
    if (/(amd|nvidia|chip|gpu|hbm|hardware|rack|memory|semiconductor)/.test(value)) {
      return {
        why: 'AI capability depends on physical systems: accelerators, memory, interconnect, packaging, power, cooling, and manufacturing capacity.',
        concepts: ['Compute', 'Memory', 'Interconnect', 'Supply chain'],
        route: '/hardware/',
        routeLabel: 'Open hardware intelligence'
      };
    }
    if (/(safety|alignment|policy|regulat|govern|law|court)/.test(value)) {
      return {
        why: 'Policy and safety developments can change deployment duties, disclosure expectations, user rights, and responsibility for harm.',
        concepts: ['Governance', 'Disclosure', 'Rights', 'Enforcement'],
        route: '/ethics/',
        routeLabel: 'Open Ethics Watch'
      };
    }
    if (/(agent|coding|tool|automation)/.test(value)) {
      return {
        why: 'Agentic tools may change software production and knowledge work, while reliability, oversight, security, and labor effects remain central constraints.',
        concepts: ['Agents', 'Tools', 'Reliability', 'Labor'],
        route: '/industry/',
        routeLabel: 'Open Industry Atlas'
      };
    }
    if (/(research|benchmark|study|paper|science)/.test(value)) {
      return {
        why: 'Research findings can redirect the field, but methods, datasets, replication, and real-world transfer determine what the result supports.',
        concepts: ['Method', 'Data', 'Replication', 'Limits'],
        route: '/signals/',
        routeLabel: 'Trace the evidence'
      };
    }
    return {
      why: 'Repeated coverage can indicate a developing issue worth understanding, while source quality, evidence type, and practical consequences still require inspection.',
      concepts: ['Current event', 'Sources', 'Evidence', 'Consequences'],
      route: '/industry/',
      routeLabel: 'Explore the wider system'
    };
  }

  function collectSources(card) {
    return Array.prototype.slice.call(card.querySelectorAll('.pulse-stories li'), 0, 3)
      .map(function (item) {
        var link = item.querySelector('.pulse-story-title');
        var source = item.querySelector('.pulse-story-meta span');
        if (!link || !link.getAttribute('href')) return null;
        return {
          title: safeText(link, 'Current source'),
          href: link.getAttribute('href'),
          source: safeText(source, 'Source')
        };
      })
      .filter(Boolean);
  }

  function collectSignals(pulse) {
    return Array.prototype.slice.call(pulse.querySelectorAll('.pulse-card'), 0, 5)
      .map(function (card) {
        var meta = safeText(card.querySelector('.pulse-card-meta'));
        var title = safeText(card.querySelector('h3'), 'Current AI topic');
        var context = contextFor(title);
        return {
          key: signalKey(title),
          title: title,
          storyCount: readNumber(safeText(card.querySelector('.pulse-story-count')), /(\d+)\s+signals?/i),
          sourceCount: readNumber(meta, /(\d+)\s+sources?/i),
          deskCount: readNumber(meta, /(\d+)\s+desks?/i),
          why: context.why,
          concepts: context.concepts,
          route: context.route,
          routeLabel: context.routeLabel,
          sources: collectSources(card)
        };
      });
  }

  function readSnapshot() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(SNAPSHOT_KEY) || 'null');
      return parsed && Array.isArray(parsed.signals) ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function writeSnapshot(updated, signals) {
    try {
      window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({
        updated: updated,
        savedAt: new Date().toISOString(),
        signals: signals.map(function (signal) {
          return {
            key: signal.key,
            storyCount: signal.storyCount,
            sourceCount: signal.sourceCount
          };
        })
      }));
    } catch (error) {
      // Browser storage is optional.
    }
  }

  function changeFor(signal, snapshot) {
    if (!snapshot) {
      return {
        label: 'First visit',
        detail: 'TriWei will compare this brief with the next one saved only in this browser.'
      };
    }

    var previous = snapshot.signals.find(function (item) {
      return item.key === signal.key;
    });

    if (!previous) {
      return {
        label: 'New since your last visit',
        detail: 'This topic was not present in the previous TriWei Brief saved in this browser.'
      };
    }

    var storyDelta = signal.storyCount - Number(previous.storyCount || 0);
    var sourceDelta = signal.sourceCount - Number(previous.sourceCount || 0);

    if (storyDelta > 0 || sourceDelta > 0) {
      var parts = [];
      if (storyDelta > 0) parts.push('+' + storyDelta + ' coverage signal' + (storyDelta === 1 ? '' : 's'));
      if (sourceDelta > 0) parts.push('+' + sourceDelta + ' source voice' + (sourceDelta === 1 ? '' : 's'));
      return {
        label: 'Coverage expanded',
        detail: parts.join(' · ') + ' since the prior brief saved in this browser.'
      };
    }

    if (storyDelta < 0 || sourceDelta < 0) {
      return {
        label: 'Coverage narrowed',
        detail: 'Fewer current stories or source voices are present than in the prior saved brief.'
      };
    }

    return {
      label: 'Continuing signal',
      detail: 'The current coverage breadth is unchanged from the prior brief saved in this browser.'
    };
  }

  function track(eventName, payload) {
    if (window.triweiAnalytics && typeof window.triweiAnalytics.track === 'function') {
      window.triweiAnalytics.track(eventName, payload);
    }
  }

  function externalLink(text, href, className) {
    var link = element('a', className || 'brief-action', text);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function initialize() {
    var hero = document.querySelector(HERO_SELECTOR);
    var pulse = document.querySelector(PULSE_SELECTOR);

    if (!hero || !pulse || document.querySelector('[data-guided-home]')) return;

    var signals = collectSignals(pulse);
    if (!signals.length) return;

    var updated = safeText(document.querySelector('.updated-stamp'), 'Current coverage snapshot');
    var snapshot = readSnapshot();
    signals.forEach(function (signal) {
      signal.change = changeFor(signal, snapshot);
    });

    var state = { signalIndex: 0, mode: 'brief', pulseOpen: false };

    var section = element('section', 'guided-home triwei-brief-v2 animate-in');
    section.setAttribute('data-guided-home', '');
    section.setAttribute('aria-labelledby', 'triwei-brief-title');

    var masthead = element('div', 'brief-masthead');
    var mastheadCopy = element('div');
    mastheadCopy.appendChild(element('p', 'brief-kicker', '5-minute TriWei Brief'));
    var title = element('h2', 'brief-title', 'What changed in AI—and why it matters');
    title.id = 'triwei-brief-title';
    mastheadCopy.appendChild(title);
    mastheadCopy.appendChild(element(
      'p',
      'brief-deck',
      'A compressed orientation layer built from the live AI Pulse. Read the lead development, scan four more, then inspect original sources.'
    ));
    masthead.appendChild(mastheadCopy);

    var mastheadMeta = element('div', 'brief-masthead-meta');
    mastheadMeta.appendChild(element('span', 'brief-live-dot', 'LIVE'));
    mastheadMeta.appendChild(element('span', '', updated));
    masthead.appendChild(mastheadMeta);
    section.appendChild(masthead);

    var statusStrip = element('div', 'brief-status-strip');
    statusStrip.appendChild(element('strong', '', signals.length + ' developments'));
    statusStrip.appendChild(element('span', '', 'Selected from current recurring coverage'));
    statusStrip.appendChild(element('span', '', snapshot ? 'Compared with your last browser-local brief' : 'First browser-local comparison snapshot'));
    section.appendChild(statusStrip);

    var stage = element('div', 'brief-stage');
    var feature = element('article', 'brief-feature');
    var featureTop = element('div', 'brief-feature-top');
    var featureIndex = element('span', 'brief-feature-index', '01');
    var featureChange = element('span', 'brief-change-badge');
    featureTop.appendChild(featureIndex);
    featureTop.appendChild(featureChange);
    feature.appendChild(featureTop);

    var featureTitle = element('h3', 'brief-feature-title');
    feature.appendChild(featureTitle);

    var featureMetrics = element('div', 'brief-metrics');
    var metricSource = element('span');
    var metricDesk = element('span');
    var metricSignal = element('span');
    featureMetrics.appendChild(metricSource);
    featureMetrics.appendChild(metricDesk);
    featureMetrics.appendChild(metricSignal);
    feature.appendChild(featureMetrics);

    var modeNav = element('div', 'brief-mode-nav');
    modeNav.setAttribute('role', 'tablist');
    modeNav.setAttribute('aria-label', 'Choose the depth of the selected development');
    [
      ['brief', 'Brief'],
      ['learn', 'Learn'],
      ['verify', 'Verify']
    ].forEach(function (item, index) {
      var button = element('button', 'brief-mode-button', item[1]);
      button.type = 'button';
      button.setAttribute('data-brief-mode', item[0]);
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      modeNav.appendChild(button);
    });
    feature.appendChild(modeNav);

    var featureBody = element('div', 'brief-feature-body');
    feature.appendChild(featureBody);

    var featureActions = element('div', 'brief-actions');
    feature.appendChild(featureActions);

    var rail = element('aside', 'brief-rail');
    rail.setAttribute('aria-label', 'Other developments in the current brief');
    var railHeading = element('div', 'brief-rail-heading');
    railHeading.appendChild(element('span', '', 'Also worth understanding'));
    railHeading.appendChild(element('small', '', 'Select to promote'));
    rail.appendChild(railHeading);

    var railList = element('div', 'brief-rail-list');
    signals.forEach(function (signal, index) {
      var button = element('button', 'brief-rail-card');
      button.type = 'button';
      button.setAttribute('data-brief-signal', String(index));
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.appendChild(element('span', 'brief-rail-number', String(index + 1).padStart(2, '0')));
      var copy = element('span', 'brief-rail-copy');
      copy.appendChild(element('strong', '', signal.title));
      copy.appendChild(element('small', '', signal.change.label + ' · ' + signal.sourceCount + ' sources'));
      button.appendChild(copy);
      railList.appendChild(button);
    });
    rail.appendChild(railList);

    stage.appendChild(feature);
    stage.appendChild(rail);
    section.appendChild(stage);

    var evidenceBoundary = element(
      'p',
      'brief-boundary',
      'Evidence boundary: coverage breadth is an orientation signal, not a truth score or importance ranking. It does not establish that sources are independent, equally reliable, or correct.'
    );
    section.appendChild(evidenceBoundary);

    var pulseToggle = element('button', 'brief-pulse-toggle', 'Show full AI Pulse and all underlying stories');
    pulseToggle.type = 'button';
    pulseToggle.setAttribute('aria-expanded', 'false');
    pulseToggle.setAttribute('aria-controls', 'ai-pulse');
    section.appendChild(pulseToggle);

    function fact(label, text) {
      var block = element('section', 'brief-fact');
      block.appendChild(element('span', '', label));
      block.appendChild(element('p', '', text));
      return block;
    }

    function conceptFlow(signal) {
      var wrapper = element('div', 'brief-concept-flow');
      signal.concepts.forEach(function (concept, index) {
        var item = element('div', 'brief-concept-node');
        item.appendChild(element('span', '', String(index + 1).padStart(2, '0')));
        item.appendChild(element('strong', '', concept));
        wrapper.appendChild(item);
      });
      return wrapper;
    }

    function sourceLedger(signal) {
      var wrapper = element('div', 'brief-source-ledger');
      if (!signal.sources.length) {
        wrapper.appendChild(element('p', 'brief-empty', 'No source links were available in the current rendered AI Pulse card.'));
        return wrapper;
      }
      signal.sources.forEach(function (source, index) {
        var row = element('a', 'brief-source-row');
        row.href = source.href;
        row.target = '_blank';
        row.rel = 'noopener noreferrer';
        row.appendChild(element('span', 'brief-source-index', String(index + 1).padStart(2, '0')));
        var copy = element('span');
        copy.appendChild(element('strong', '', source.source));
        copy.appendChild(element('small', '', source.title));
        row.appendChild(copy);
        row.appendChild(element('span', 'brief-source-arrow', '↗'));
        wrapper.appendChild(row);
      });
      return wrapper;
    }

    function renderFeature() {
      var signal = signals[state.signalIndex];
      var firstSource = signal.sources[0];

      featureIndex.textContent = String(state.signalIndex + 1).padStart(2, '0');
      featureChange.textContent = signal.change.label;
      featureTitle.textContent = signal.title;
      metricSource.textContent = signal.sourceCount + ' source voices';
      metricDesk.textContent = signal.deskCount + ' desks';
      metricSignal.textContent = signal.storyCount + ' signals';

      featureBody.innerHTML = '';
      featureActions.innerHTML = '';

      if (state.mode === 'learn') {
        featureBody.appendChild(element('p', 'brief-mode-intro', 'Understand the minimum concept path before opening the deeper portal.'));
        featureBody.appendChild(conceptFlow(signal));
        featureBody.appendChild(fact('System connection', signal.why));
        featureBody.appendChild(fact('What changed', signal.change.detail));
      } else if (state.mode === 'verify') {
        featureBody.appendChild(element('p', 'brief-mode-intro', 'Inspect the visible source ledger and the limits of what coverage breadth can establish.'));
        featureBody.appendChild(sourceLedger(signal));
        featureBody.appendChild(fact(
          'What TriWei can show',
          'This topic appears across ' + signal.sourceCount + ' source voices, ' + signal.deskCount + ' desks, and ' + signal.storyCount + ' current coverage signals.'
        ));
        featureBody.appendChild(fact(
          'What this cannot prove',
          'Coverage volume alone does not verify the underlying claims, source independence, source quality, or practical importance.'
        ));
      } else {
        var grid = element('div', 'brief-fact-grid');
        grid.appendChild(fact(
          'What happened',
          firstSource ? 'Current coverage is led by “' + firstSource.title + '” from ' + firstSource.source + '.' : 'Current coverage is clustering around ' + signal.title + '.'
        ));
        grid.appendChild(fact('Why it matters', signal.why));
        grid.appendChild(fact('What changed', signal.change.detail));
        featureBody.appendChild(grid);
      }

      if (firstSource) {
        featureActions.appendChild(externalLink('Open lead source →', firstSource.href, 'brief-action brief-action-primary'));
      }
      var route = element('a', 'brief-action', signal.routeLabel + ' →');
      route.href = signal.route;
      featureActions.appendChild(route);

      railList.querySelectorAll('[data-brief-signal]').forEach(function (button) {
        button.setAttribute('aria-pressed', Number(button.getAttribute('data-brief-signal')) === state.signalIndex ? 'true' : 'false');
      });
    }

    modeNav.addEventListener('click', function (event) {
      var button = event.target.closest('[data-brief-mode]');
      if (!button) return;
      state.mode = button.getAttribute('data-brief-mode');
      modeNav.querySelectorAll('[data-brief-mode]').forEach(function (candidate) {
        candidate.setAttribute('aria-selected', candidate === button ? 'true' : 'false');
      });
      renderFeature();
      track('triwei_brief_mode', { mode: state.mode });
    });

    railList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-brief-signal]');
      if (!button) return;
      state.signalIndex = Number(button.getAttribute('data-brief-signal')) || 0;
      renderFeature();
      feature.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      track('triwei_brief_signal', { title: signals[state.signalIndex].title });
    });

    pulseToggle.addEventListener('click', function () {
      state.pulseOpen = !state.pulseOpen;
      pulse.hidden = !state.pulseOpen;
      pulse.setAttribute('aria-hidden', state.pulseOpen ? 'false' : 'true');
      pulseToggle.setAttribute('aria-expanded', state.pulseOpen ? 'true' : 'false');
      pulseToggle.textContent = state.pulseOpen
        ? 'Hide full AI Pulse'
        : 'Show full AI Pulse and all underlying stories';
      if (state.pulseOpen) {
        pulse.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      track('triwei_brief_full_pulse', { open: state.pulseOpen });
    });

    renderFeature();

    pulse.hidden = true;
    pulse.setAttribute('aria-hidden', 'true');

    hero.insertAdjacentElement('afterend', section);
    writeSnapshot(updated, signals);
  }

  ready(initialize);
})();
