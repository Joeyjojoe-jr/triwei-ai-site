/* TriWei Brief: progressive homepage enhancement below the existing orbit hero.
   The script reads the rendered AI Pulse, makes no network requests, and never
   rewrites the orbit, emblem, or topic-folder markup. */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
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

  function svgElement(tag, attributes) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
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

  function shortLabel(value, maximum) {
    var normalized = String(value || '').replace(/[^a-z0-9&+\- ]/gi, ' ').replace(/\s+/g, ' ').trim();
    if (!normalized) return 'CURRENT SIGNAL';
    if (normalized.length <= maximum) return normalized.toUpperCase();
    return normalized.slice(0, maximum - 1).trim().toUpperCase() + '…';
  }

  function signalKey(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  }

  function contextFor(title) {
    var value = String(title || '').toLowerCase();
    if (/(kimi|deepseek|llama|qwen|open.weight|model)/.test(value)) {
      return {
        why: 'Changes in model access and capability can affect who can experiment, how much inference costs, and which provenance claims require verification.',
        concepts: ['OPEN WEIGHTS', 'BENCHMARKS', 'INFERENCE COST', 'PROVENANCE'],
        route: '/signals/', routeLabel: 'Trace model diffusion →'
      };
    }
    if (/(amd|nvidia|chip|gpu|hbm|hardware|rack|memory|semiconductor)/.test(value)) {
      return {
        why: 'AI capability depends on physical systems: accelerators, memory, interconnect, packaging, power, cooling, and manufacturing capacity.',
        concepts: ['COMPUTE', 'MEMORY', 'INTERCONNECT', 'SUPPLY CHAIN'],
        route: '/hardware/', routeLabel: 'Open hardware intelligence →'
      };
    }
    if (/(safety|alignment|policy|regulat|govern|law|court)/.test(value)) {
      return {
        why: 'Policy and safety developments can change deployment duties, disclosure expectations, user rights, and who bears responsibility when systems cause harm.',
        concepts: ['GOVERNANCE', 'DISCLOSURE', 'RIGHTS', 'ENFORCEMENT'],
        route: '/ethics/', routeLabel: 'Open Ethics Watch →'
      };
    }
    if (/(agent|coding|tool|automation)/.test(value)) {
      return {
        why: 'Agentic tools may change software production and knowledge work, but reliability, oversight, security, and labor effects remain central constraints.',
        concepts: ['AGENTS', 'TOOLS', 'RELIABILITY', 'LABOR'],
        route: '/industry/', routeLabel: 'Open Industry Atlas →'
      };
    }
    if (/(research|benchmark|study|paper|science)/.test(value)) {
      return {
        why: 'Research findings can redirect the field, but methods, datasets, replication, and real-world transfer determine how much the result actually supports.',
        concepts: ['METHOD', 'DATA', 'REPLICATION', 'LIMITS'],
        route: '/signals/', routeLabel: 'Trace the evidence →'
      };
    }
    return {
      why: 'Repeated coverage can indicate a developing issue worth understanding, while source quality, evidence type, and practical consequences still require inspection.',
      concepts: ['CURRENT EVENT', 'SOURCES', 'EVIDENCE', 'CONSEQUENCES'],
      route: '/industry/', routeLabel: 'Explore the wider system →'
    };
  }

  function collectSources(card) {
    return Array.prototype.slice.call(card.querySelectorAll('.pulse-stories li'), 0, 3).map(function (item) {
      var link = item.querySelector('.pulse-story-title');
      var source = item.querySelector('.pulse-story-meta span');
      if (!link || !link.getAttribute('href')) return null;
      return { title: safeText(link, 'Current source'), href: link.getAttribute('href'), source: safeText(source, 'Source') };
    }).filter(Boolean);
  }

  function collectSignals(pulse) {
    return Array.prototype.slice.call(pulse.querySelectorAll('.pulse-card'), 0, 5).map(function (card) {
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

  function changeFor(signal, snapshot) {
    if (!snapshot) {
      return { label: 'First visit snapshot', detail: 'TriWei will compare this topic with the next brief stored only in this browser.' };
    }
    var previous = snapshot.signals.find(function (item) { return item.key === signal.key; });
    if (!previous) {
      return { label: 'New since your last visit', detail: 'This topic was not present in the previous TriWei Brief saved in this browser.' };
    }
    var storyDelta = signal.storyCount - Number(previous.storyCount || 0);
    var sourceDelta = signal.sourceCount - Number(previous.sourceCount || 0);
    if (storyDelta > 0 || sourceDelta > 0) {
      var parts = [];
      if (storyDelta > 0) parts.push('+' + storyDelta + ' coverage signal' + (storyDelta === 1 ? '' : 's'));
      if (sourceDelta > 0) parts.push('+' + sourceDelta + ' source voice' + (sourceDelta === 1 ? '' : 's'));
      return { label: 'Coverage expanded', detail: parts.join(' · ') + ' since the previous brief saved in this browser.' };
    }
    if (storyDelta < 0 || sourceDelta < 0) {
      return { label: 'Coverage narrowed', detail: 'Fewer current stories or source voices are present than in the previous saved brief.' };
    }
    return { label: 'Continuing signal', detail: 'The current coverage breadth is unchanged from the previous brief saved in this browser.' };
  }

  function writeSnapshot(updated, signals) {
    try {
      window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({
        updated: updated,
        savedAt: new Date().toISOString(),
        signals: signals.map(function (signal) {
          return { key: signal.key, storyCount: signal.storyCount, sourceCount: signal.sourceCount };
        })
      }));
    } catch (error) {
      // Storage is optional; the brief still works without it.
    }
  }

  function addMapNode(svg, options) {
    var shape = options.circle
      ? svgElement('circle', { cx: options.x, cy: options.y, r: 43, class: 'guided-map-node guided-map-node-active' })
      : svgElement('rect', { x: options.x - options.width / 2, y: options.y - 22, width: options.width, height: 44, rx: 10, class: 'guided-map-node' + (options.active ? ' guided-map-node-active' : '') });
    var label = svgElement('text', { x: options.x, y: options.y - 2, class: 'guided-map-label' });
    var sub = svgElement('text', { x: options.x, y: options.y + 12, class: 'guided-map-sub' });
    label.textContent = options.label;
    sub.textContent = options.sub || '';
    svg.appendChild(shape); svg.appendChild(label); svg.appendChild(sub);
    return { label: label, sub: sub };
  }

  function createMap() {
    var svg = svgElement('svg', { class: 'guided-map', viewBox: '0 0 520 270', role: 'img', 'aria-labelledby': 'guided-map-title guided-map-description' });
    var title = svgElement('title', { id: 'guided-map-title' });
    var description = svgElement('desc', { id: 'guided-map-description' });
    svg.appendChild(title); svg.appendChild(description);
    var center = { x: 260, y: 135 };
    var positions = [
      { x: 260, y: 36, width: 126, active: true, sub: 'primary concept' },
      { x: 438, y: 78, width: 142, active: true, sub: 'supporting concept' },
      { x: 438, y: 216, width: 142, active: false, sub: 'practical effect' },
      { x: 260, y: 238, width: 126, active: true, sub: 'evidence check' },
      { x: 82, y: 216, width: 142, active: false, sub: 'wider context' },
      { x: 82, y: 78, width: 142, active: true, sub: 'open question' }
    ];
    positions.forEach(function (position) {
      svg.appendChild(svgElement('path', { d: 'M' + center.x + ' ' + center.y + 'L' + position.x + ' ' + position.y, class: 'guided-map-edge' + (position.active ? ' guided-map-edge-active' : '') }));
    });
    var centerNode = addMapNode(svg, { x: center.x, y: center.y, circle: true, label: 'CURRENT SIGNAL', sub: 'selected development' });
    var outerNodes = positions.map(function (position) {
      return addMapNode(svg, { x: position.x, y: position.y, width: position.width, active: position.active, label: 'EVIDENCE', sub: position.sub });
    });
    return { svg: svg, title: title, description: description, center: centerNode, outer: outerNodes };
  }

  function explanationCard(label) {
    var card = element('div', 'guided-explanation');
    card.appendChild(element('span', '', label));
    var body = element('p');
    card.appendChild(body);
    return { card: card, body: body };
  }

  function actionLink(className, text, href) {
    var link = element('a', 'guided-home-action ' + className, text);
    link.href = href;
    return link;
  }

  function track(eventName, payload) {
    if (window.triweiAnalytics && typeof window.triweiAnalytics.track === 'function') {
      window.triweiAnalytics.track(eventName, payload);
    }
  }

  function initialize() {
    var hero = document.querySelector(HERO_SELECTOR);
    var pulse = document.querySelector(PULSE_SELECTOR);
    if (!hero || !pulse || document.querySelector('[data-guided-home]')) return;

    var signals = collectSignals(pulse);
    if (!signals.length) return;
    var snapshot = readSnapshot();
    var updated = safeText(document.querySelector('.updated-stamp'), 'Current coverage snapshot');
    signals.forEach(function (signal) { signal.change = changeFor(signal, snapshot); });

    var state = { mode: 'catchup', signalIndex: 0 };
    var section = element('section', 'guided-home animate-in');
    section.setAttribute('data-guided-home', '');
    section.setAttribute('aria-labelledby', 'guided-home-title');

    var header = element('div', 'guided-home-header');
    var headingWrap = element('div');
    headingWrap.appendChild(element('p', 'guided-home-kicker', 'TriWei Brief · current coverage compressed'));
    var heading = element('h2', 'guided-home-title', 'Developments worth understanding now');
    heading.id = 'guided-home-title';
    headingWrap.appendChild(heading);
    header.appendChild(headingWrap);
    header.appendChild(element('p', 'guided-home-intro', signals.length + ' developments selected from the current AI Pulse. Start with the change, the consequence, and the evidence boundary; open original sources when a topic matters to you.'));
    section.appendChild(header);

    var paths = element('div', 'guided-paths');
    paths.setAttribute('role', 'tablist');
    paths.setAttribute('aria-label', 'Choose the depth of the TriWei Brief');
    [
      ['catchup', '01 · CATCH UP', 'Brief', 'What happened, why it matters, and what changed.'],
      ['learn', '02 · UNDERSTAND', 'Learn', 'Attach the minimum concepts needed to follow the story.'],
      ['verify', '03 · INSPECT', 'Verify', 'See coverage breadth, source links, and uncertainty.']
    ].forEach(function (path, index) {
      var button = element('button', 'guided-path');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('data-guided-mode', path[0]);
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.appendChild(element('span', 'guided-path-index', path[1]));
      button.appendChild(element('strong', '', path[2]));
      button.appendChild(element('span', '', path[3]));
      paths.appendChild(button);
    });
    section.appendChild(paths);

    var body = element('div', 'guided-home-body');
    var signalPanel = element('aside', 'guided-signal-panel');
    signalPanel.setAttribute('aria-labelledby', 'guided-signal-title');
    signalPanel.appendChild(element('p', 'guided-panel-label', 'Today’s brief'));
    var signalTitle = element('h3', 'guided-panel-title', 'Select a development');
    signalTitle.id = 'guided-signal-title';
    signalPanel.appendChild(signalTitle);

    var signalList = element('div', 'guided-signal-list');
    signals.forEach(function (signal, index) {
      var button = element('button', 'guided-signal-button');
      button.type = 'button';
      button.setAttribute('data-guided-signal', String(index));
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.appendChild(element('span', 'guided-signal-number', String(index + 1).padStart(2, '0')));
      var copy = element('span');
      copy.appendChild(element('strong', '', signal.title));
      copy.appendChild(element('small', '', signal.change.label + ' · ' + signal.sourceCount + ' sources · ' + signal.storyCount + ' signals'));
      button.appendChild(copy);
      signalList.appendChild(button);
    });
    signalPanel.appendChild(signalList);
    signalPanel.appendChild(element('p', 'guided-signal-note', 'Coverage breadth is an orientation signal. It is not a truth score, importance ranking, or independent verification of every underlying claim. Your comparison snapshot stays only in this browser.'));
    body.appendChild(signalPanel);

    var mapPanel = element('div', 'guided-map-panel');
    mapPanel.setAttribute('role', 'tabpanel');
    mapPanel.id = 'guided-home-panel';
    var mapHeader = element('div', 'guided-map-header');
    var mapHeaderCopy = element('div');
    mapHeaderCopy.appendChild(element('p', 'guided-panel-label', 'Selected development'));
    var mapHeading = element('h3', 'guided-panel-title');
    mapHeaderCopy.appendChild(mapHeading);
    var modeStatus = element('span', 'guided-mode-status');
    mapHeader.appendChild(mapHeaderCopy); mapHeader.appendChild(modeStatus); mapPanel.appendChild(mapHeader);

    var map = createMap();
    mapPanel.appendChild(map.svg);
    var explanationGrid = element('div', 'guided-explanation-grid');
    var firstExplanation = explanationCard('What happened');
    var secondExplanation = explanationCard('Why it matters');
    var thirdExplanation = explanationCard('What changed');
    explanationGrid.appendChild(firstExplanation.card); explanationGrid.appendChild(secondExplanation.card); explanationGrid.appendChild(thirdExplanation.card);
    mapPanel.appendChild(explanationGrid);

    var actions = element('div', 'guided-home-actions');
    mapPanel.appendChild(actions);
    body.appendChild(mapPanel); section.appendChild(body);

    function setActions(signal) {
      actions.innerHTML = '';
      if (state.mode === 'catchup' && signal.sources.length) {
        signal.sources.slice(0, 2).forEach(function (source, index) {
          var link = actionLink(index === 0 ? 'guided-home-action-primary' : '', 'Source: ' + source.source + ' →', source.href);
          link.target = '_blank'; link.rel = 'noopener noreferrer'; actions.appendChild(link);
        });
        actions.appendChild(actionLink('', 'Open full AI Pulse →', '#ai-pulse'));
      } else if (state.mode === 'learn') {
        actions.appendChild(actionLink('guided-home-action-primary', signal.routeLabel, signal.route));
        actions.appendChild(actionLink('', 'Open Signal History →', '/signals/'));
        actions.appendChild(actionLink('', 'Open AI Hardware →', '/hardware/'));
      } else {
        signal.sources.slice(0, 2).forEach(function (source, index) {
          var link = actionLink(index === 0 ? 'guided-home-action-primary' : '', 'Inspect ' + source.source + ' →', source.href);
          link.target = '_blank'; link.rel = 'noopener noreferrer'; actions.appendChild(link);
        });
        actions.appendChild(actionLink('', 'Review source method →', '/sources/'));
      }
    }

    function update() {
      var signal = signals[state.signalIndex];
      var firstSource = signal.sources[0];
      var labels;
      mapHeading.textContent = signal.title;
      map.center.label.textContent = shortLabel(signal.title, 18);

      if (state.mode === 'learn') {
        labels = signal.concepts.concat(['CONSEQUENCES', 'OPEN QUESTIONS']);
        modeStatus.textContent = 'concept path';
        firstExplanation.body.textContent = 'The minimum concept set for this development is: ' + signal.concepts.join(', ').toLowerCase() + '.';
        secondExplanation.body.textContent = signal.why;
        thirdExplanation.body.textContent = signal.change.detail;
      } else if (state.mode === 'verify') {
        labels = [signal.sourceCount + ' SOURCES', signal.deskCount + ' DESKS', signal.storyCount + ' SIGNALS', 'SOURCE METHOD', 'ORIGINAL LINKS', 'OPEN QUESTIONS'];
        modeStatus.textContent = signal.sourceCount >= 4 && signal.deskCount >= 2 ? 'broad coverage signal' : 'coverage signal';
        firstExplanation.body.textContent = 'TriWei can show that this topic appears across ' + signal.sourceCount + ' source voices and ' + signal.deskCount + ' coverage desks.';
        secondExplanation.body.textContent = 'Coverage breadth can justify closer inspection, but it does not establish that the sources are independent, equally reliable, or correct.';
        thirdExplanation.body.textContent = signal.change.detail;
      } else {
        labels = signal.concepts.concat(['EVIDENCE', 'OPEN QUESTIONS']);
        modeStatus.textContent = signal.change.label;
        firstExplanation.body.textContent = firstSource ? 'Current coverage is led by “' + firstSource.title + '” from ' + firstSource.source + '.' : 'Current coverage is clustering around ' + signal.title + '.';
        secondExplanation.body.textContent = signal.why;
        thirdExplanation.body.textContent = signal.change.detail;
      }

      map.outer.forEach(function (node, index) {
        node.label.textContent = shortLabel(labels[index], 18);
      });
      map.title.textContent = signal.title + ' — ' + state.mode + ' view';
      map.description.textContent = 'A visual map connecting the selected development to concepts, evidence checks, consequences, and open questions.';
      setActions(signal);
    }

    paths.addEventListener('click', function (event) {
      var button = event.target.closest('[data-guided-mode]');
      if (!button) return;
      state.mode = button.getAttribute('data-guided-mode');
      paths.querySelectorAll('[data-guided-mode]').forEach(function (candidate) {
        candidate.setAttribute('aria-selected', candidate === button ? 'true' : 'false');
      });
      update(); track('triwei_brief_mode', { mode: state.mode });
    });

    signalList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-guided-signal]');
      if (!button) return;
      state.signalIndex = Number(button.getAttribute('data-guided-signal')) || 0;
      signalList.querySelectorAll('[data-guided-signal]').forEach(function (candidate) {
        candidate.setAttribute('aria-pressed', candidate === button ? 'true' : 'false');
      });
      update(); track('triwei_brief_signal', { title: signals[state.signalIndex].title });
    });

    update();
    hero.insertAdjacentElement('afterend', section);
    writeSnapshot(updated, signals);
  }

  ready(initialize);
})();
