/* Progressive enhancement for the homepage below the existing orbit hero.
   The script reads the rendered AI Pulse; it makes no network requests and
   never rewrites the orbit or emblem markup. */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var HERO_SELECTOR = '.hero-orbit-wrap';
  var PULSE_SELECTOR = '.pulse-block';

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

  function conceptsFor(title) {
    var value = String(title || '').toLowerCase();
    if (/(kimi|deepseek|llama|qwen|open.weight|model)/.test(value)) {
      return ['OPEN WEIGHTS', 'BENCHMARKS', 'INFERENCE COST', 'PROVENANCE'];
    }
    if (/(amd|nvidia|chip|gpu|hbm|hardware|rack|memory)/.test(value)) {
      return ['COMPUTE', 'MEMORY', 'INTERCONNECT', 'SUPPLY CHAIN'];
    }
    if (/(safety|alignment|policy|regulat|govern)/.test(value)) {
      return ['SAFETY', 'GOVERNANCE', 'EVIDENCE', 'RIGHTS'];
    }
    if (/(agent|coding|tool)/.test(value)) {
      return ['AGENTS', 'TOOLS', 'RELIABILITY', 'LABOR'];
    }
    if (/(research|benchmark|study|paper)/.test(value)) {
      return ['METHOD', 'DATA', 'REPLICATION', 'LIMITS'];
    }
    return ['CURRENT EVENT', 'SOURCES', 'EVIDENCE', 'CONSEQUENCES'];
  }

  function collectSignals(pulse) {
    return Array.prototype.slice.call(pulse.querySelectorAll('.pulse-card'), 0, 5).map(function (card) {
      var meta = safeText(card.querySelector('.pulse-card-meta'));
      var why = safeText(card.querySelector('.pulse-why'));
      var firstStory = card.querySelector('.pulse-story-title');
      var ethicsMatch = why.match(/with (.+?) surfacing/i);
      var title = safeText(card.querySelector('h3'), 'Current AI topic');

      return {
        title: title,
        storyCount: readNumber(safeText(card.querySelector('.pulse-story-count')), /(\d+)\s+signals?/i),
        sourceCount: readNumber(meta, /(\d+)\s+sources?/i),
        deskCount: readNumber(meta, /(\d+)\s+desks?/i),
        why: why.replace(/^Why it matters:\s*/i, ''),
        ethics: ethicsMatch ? ethicsMatch[1] : '',
        firstStoryHref: firstStory ? firstStory.getAttribute('href') : '',
        concepts: conceptsFor(title)
      };
    });
  }

  function makePath(id, index, title, description) {
    var button = element('button', 'guided-path');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('data-guided-mode', id);
    button.setAttribute('aria-selected', id === 'catchup' ? 'true' : 'false');

    button.appendChild(element('span', 'guided-path-index', index));
    button.appendChild(element('strong', '', title));
    button.appendChild(element('span', '', description));
    return button;
  }

  function addMapNode(svg, options) {
    var group = svgElement('g');
    var shape;

    if (options.circle) {
      shape = svgElement('circle', {
        cx: options.x,
        cy: options.y,
        r: options.r || 43,
        class: 'guided-map-node guided-map-node-active'
      });
    } else {
      shape = svgElement('rect', {
        x: options.x - options.width / 2,
        y: options.y - 22,
        width: options.width,
        height: 44,
        rx: 10,
        class: 'guided-map-node' + (options.active ? ' guided-map-node-active' : '')
      });
    }

    var label = svgElement('text', {
      x: options.x,
      y: options.y - 2,
      class: 'guided-map-label'
    });
    label.textContent = options.label;

    var sub = svgElement('text', {
      x: options.x,
      y: options.y + 12,
      class: 'guided-map-sub'
    });
    sub.textContent = options.sub || '';

    group.appendChild(shape);
    group.appendChild(label);
    group.appendChild(sub);
    svg.appendChild(group);

    return { label: label, sub: sub, shape: shape };
  }

  function createMap() {
    var svg = svgElement('svg', {
      class: 'guided-map',
      viewBox: '0 0 520 270',
      role: 'img',
      'aria-labelledby': 'guided-map-title guided-map-description'
    });

    var title = svgElement('title', { id: 'guided-map-title' });
    var description = svgElement('desc', { id: 'guided-map-description' });
    svg.appendChild(title);
    svg.appendChild(description);

    var center = { x: 260, y: 135 };
    var positions = [
      { x: 260, y: 36, width: 126, active: true, sub: 'primary lens' },
      { x: 438, y: 78, width: 142, active: true, sub: 'supporting lens' },
      { x: 438, y: 216, width: 142, active: false, sub: 'practical effect' },
      { x: 260, y: 238, width: 126, active: true, sub: 'next question' },
      { x: 82, y: 216, width: 142, active: false, sub: 'wider context' },
      { x: 82, y: 78, width: 142, active: true, sub: 'evidence check' }
    ];

    positions.forEach(function (position, index) {
      var edge = svgElement('path', {
        d: 'M' + center.x + ' ' + center.y + 'L' + position.x + ' ' + position.y,
        class: 'guided-map-edge' + (position.active ? ' guided-map-edge-active' : '')
      });
      edge.setAttribute('data-guided-edge', String(index));
      svg.appendChild(edge);
    });

    var centerNode = addMapNode(svg, {
      x: center.x,
      y: center.y,
      circle: true,
      label: 'CURRENT SIGNAL',
      sub: 'selected topic'
    });

    var outerNodes = positions.map(function (position) {
      return addMapNode(svg, {
        x: position.x,
        y: position.y,
        width: position.width,
        active: position.active,
        label: 'EVIDENCE',
        sub: position.sub
      });
    });

    return {
      svg: svg,
      title: title,
      description: description,
      center: centerNode,
      outer: outerNodes
    };
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

    var state = {
      mode: 'catchup',
      signalIndex: 0
    };

    var section = element('section', 'guided-home animate-in');
    section.setAttribute('data-guided-home', '');
    section.setAttribute('aria-labelledby', 'guided-home-title');

    var header = element('div', 'guided-home-header');
    var headingWrap = element('div');
    headingWrap.appendChild(element('p', 'guided-home-kicker', 'Guided visual layer'));
    var heading = element('h2', 'guided-home-title', 'Choose how deeply to explore today’s AI');
    heading.id = 'guided-home-title';
    headingWrap.appendChild(heading);
    header.appendChild(headingWrap);
    header.appendChild(element('p', 'guided-home-intro', 'The orbit remains the live front door. This layer helps visual learners turn recurring coverage into concepts, evidence, and consequences.'));
    section.appendChild(header);

    var paths = element('div', 'guided-paths');
    paths.setAttribute('role', 'tablist');
    paths.setAttribute('aria-label', 'Choose a homepage learning path');
    paths.appendChild(makePath('catchup', '01 · ORIENT', 'Catch up', 'See what is recurring and why it deserves attention.'));
    paths.appendChild(makePath('learn', '02 · UNDERSTAND', 'Learn the concepts', 'Connect the current topic to the minimum ideas needed to follow it.'));
    paths.appendChild(makePath('explore', '03 · VERIFY', 'Explore the evidence', 'Move into history, hardware, industry, ethics, and source methodology.'));
    section.appendChild(paths);

    var body = element('div', 'guided-home-body');

    var signalPanel = element('aside', 'guided-signal-panel');
    signalPanel.setAttribute('aria-labelledby', 'guided-signal-title');
    signalPanel.appendChild(element('p', 'guided-panel-label', 'Current recurring topics'));
    var signalTitle = element('h3', 'guided-panel-title', 'Select one signal to reframe the map');
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
      copy.appendChild(element('small', '', signal.sourceCount + ' sources · ' + signal.deskCount + ' desks · ' + signal.storyCount + ' signals'));
      button.appendChild(copy);
      signalList.appendChild(button);
    });
    signalPanel.appendChild(signalList);
    signalPanel.appendChild(element('p', 'guided-signal-note', 'Coverage breadth is an orientation signal. It is not a truth score, importance score, or independent verification of every claim.'));
    body.appendChild(signalPanel);

    var mapPanel = element('div', 'guided-map-panel');
    mapPanel.setAttribute('role', 'tabpanel');
    mapPanel.id = 'guided-home-panel';

    var mapHeader = element('div', 'guided-map-header');
    var mapHeaderCopy = element('div');
    mapHeaderCopy.appendChild(element('p', 'guided-panel-label', 'Visual explanation'));
    var mapHeading = element('h3', 'guided-panel-title');
    mapHeaderCopy.appendChild(mapHeading);
    var modeStatus = element('span', 'guided-mode-status');
    mapHeader.appendChild(mapHeaderCopy);
    mapHeader.appendChild(modeStatus);
    mapPanel.appendChild(mapHeader);

    var map = createMap();
    mapPanel.appendChild(map.svg);

    var explanationGrid = element('div', 'guided-explanation-grid');
    var firstExplanation = explanationCard('What TriWei can show');
    var secondExplanation = explanationCard('Why it helps');
    var thirdExplanation = explanationCard('What remains uncertain');
    explanationGrid.appendChild(firstExplanation.card);
    explanationGrid.appendChild(secondExplanation.card);
    explanationGrid.appendChild(thirdExplanation.card);
    mapPanel.appendChild(explanationGrid);

    var actions = element('div', 'guided-home-actions');
    var primaryAction = actionLink('guided-home-action-primary', 'Open a current source →', '#ai-pulse');
    var secondaryAction = actionLink('', 'Open Signal History →', '/signals/');
    var tertiaryAction = actionLink('', 'Review source method →', '/sources/');
    actions.appendChild(primaryAction);
    actions.appendChild(secondaryAction);
    actions.appendChild(tertiaryAction);
    mapPanel.appendChild(actions);

    body.appendChild(mapPanel);
    section.appendChild(body);

    function update() {
      var signal = signals[state.signalIndex];
      var labels;
      var subs;
      var modeLabel;
      var firstText;
      var secondText;
      var thirdText;

      mapHeading.textContent = signal.title;
      map.center.label.textContent = shortLabel(signal.title, 18);

      if (state.mode === 'learn') {
        labels = signal.concepts.concat(['CONSEQUENCES', 'OPEN QUESTIONS']);
        subs = ['foundation', 'measurement', 'practical cost', 'evidence origin', 'who is affected?', 'what to test next?'];
        modeLabel = 'concept path';
        firstText = 'Start with one current event, then attach only the concepts needed to understand it: ' + signal.concepts.join(', ').toLowerCase() + '.';
        secondText = 'The relationship map reduces context switching by showing which technical ideas belong to the same story.';
        thirdText = 'Concept labels simplify a complicated field. Each deeper page must preserve definitions, limitations, and source dates.';
        primaryAction.textContent = 'Open Signal History →';
        primaryAction.href = '/signals/';
        secondaryAction.textContent = 'Open AI Hardware →';
        secondaryAction.href = '/hardware/';
        tertiaryAction.textContent = 'Open Industry Atlas →';
        tertiaryAction.href = '/industry/';
      } else if (state.mode === 'explore') {
        labels = ['SIGNAL HISTORY', 'AI HARDWARE', 'INDUSTRY ATLAS', 'ETHICS WATCH', 'SOURCE METHOD', 'LIVE COVERAGE'];
        subs = ['earlier evidence', 'physical constraints', 'market structure', 'human stakes', 'how claims are handled', 'underlying stories'];
        modeLabel = 'evidence routes';
        firstText = 'TriWei separates the current coverage cluster from its historical, technical, commercial, ethical, and methodological context.';
        secondText = 'The visitor can follow the type of evidence they need instead of reading the entire homepage in sequence.';
        thirdText = 'Different portals answer different questions. None should be treated as a universal ranking or automated truth model.';
        primaryAction.textContent = 'Open Signal History →';
        primaryAction.href = '/signals/';
        secondaryAction.textContent = 'Open AI Hardware →';
        secondaryAction.href = '/hardware/';
        tertiaryAction.textContent = 'Review source method →';
        tertiaryAction.href = '/sources/';
      } else {
        labels = [
          signal.sourceCount + ' SOURCES',
          signal.deskCount + ' DESKS',
          signal.storyCount + ' SIGNALS',
          signal.ethics ? shortLabel(signal.ethics, 16) : 'ETHICS LENS',
          'WHY IT MATTERS',
          'OPEN QUESTIONS'
        ];
        subs = ['source breadth', 'coverage breadth', 'recurrence', 'cross-cutting lens', 'context', 'uncertainty'];
        modeLabel = 'quick orientation';
        firstText = 'TriWei found ' + signal.storyCount + ' current coverage signals across ' + signal.sourceCount + ' source voices and ' + signal.deskCount + ' desks.';
        secondText = signal.why || 'Repeated coverage across multiple source voices makes the topic worth orienting to before reading individual stories.';
        thirdText = 'Coverage frequency and breadth are not proof that every underlying claim is true, equally important, or independently verified.';
        primaryAction.textContent = signal.firstStoryHref ? 'Open a current source →' : 'Open full AI Pulse →';
        primaryAction.href = signal.firstStoryHref || '#ai-pulse';
        secondaryAction.textContent = 'Open full AI Pulse →';
        secondaryAction.href = '#ai-pulse';
        tertiaryAction.textContent = 'Review source method →';
        tertiaryAction.href = '/sources/';
      }

      modeStatus.textContent = modeLabel;
      map.title.textContent = signal.title + ' — ' + modeLabel;
      map.description.textContent = 'A relationship map connecting the selected current topic to six ' + modeLabel + ' nodes.';

      map.outer.forEach(function (node, index) {
        node.label.textContent = shortLabel(labels[index], 18);
        node.sub.textContent = subs[index];
      });

      firstExplanation.body.textContent = firstText;
      secondExplanation.body.textContent = secondText;
      thirdExplanation.body.textContent = thirdText;
    }

    paths.addEventListener('click', function (event) {
      var button = event.target.closest('[data-guided-mode]');
      if (!button) return;
      state.mode = button.getAttribute('data-guided-mode');
      paths.querySelectorAll('[data-guided-mode]').forEach(function (candidate) {
        candidate.setAttribute('aria-selected', candidate === button ? 'true' : 'false');
      });
      update();
      track('guided_home_mode', { mode: state.mode });
    });

    signalList.addEventListener('click', function (event) {
      var button = event.target.closest('[data-guided-signal]');
      if (!button) return;
      state.signalIndex = Number(button.getAttribute('data-guided-signal')) || 0;
      signalList.querySelectorAll('[data-guided-signal]').forEach(function (candidate) {
        candidate.setAttribute('aria-pressed', candidate === button ? 'true' : 'false');
      });
      update();
      track('guided_home_signal', { title: signals[state.signalIndex].title });
    });

    update();

    // Preserve the existing hero exactly and place the enhancement after it.
    hero.insertAdjacentElement('afterend', section);
  }

  ready(initialize);
})();
