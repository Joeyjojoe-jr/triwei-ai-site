(function () {
  'use strict';

  var dataNode = document.getElementById('industry-atlas-data');
  var atlasRoot = document.querySelector('[data-industry-atlas]');
  if (!dataNode || !atlasRoot) return;

  var data;
  try {
    data = JSON.parse(dataNode.textContent || '{}');
  } catch (error) {
    atlasRoot.classList.add('atlas-data-error');
    return;
  }

  var NS = 'http://www.w3.org/2000/svg';
  var seriesColors = [
    'var(--atlas-c1)',
    'var(--atlas-c2)',
    'var(--atlas-c3)',
    'var(--atlas-c4)',
    'var(--atlas-c5)',
    'var(--atlas-c6)'
  ];
  var organizationColors = Object.create(null);

  function track(name, payload) {
    if (window.triweiAnalytics && typeof window.triweiAnalytics.track === 'function') {
      window.triweiAnalytics.track(name, payload || {});
    }
  }

  function svgElement(name, attributes, text) {
    var element = document.createElementNS(NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      element.setAttribute(key, String(attributes[key]));
    });
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function htmlElement(name, className, text) {
    var element = document.createElement(name);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function clear(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function compactDate(value) {
    var parts = String(value || '').split('-');
    if (parts.length !== 3) return value;
    return Number(parts[1]) + '/' + Number(parts[2]);
  }

  function formatMoney(value) {
    var number = Number(value || 0);
    if (number >= 1000000000) {
      return '$' + (number / 1000000000).toFixed(number >= 100000000000 ? 0 : 1).replace(/\.0$/, '') + 'B';
    }
    if (number >= 1000000) {
      return '$' + (number / 1000000).toFixed(number >= 100000000 ? 0 : 1).replace(/\.0$/, '') + 'M';
    }
    if (number >= 1000) return '$' + Math.round(number / 1000) + 'K';
    return '$' + number.toLocaleString('en-US');
  }

  function setSelection(kind, text) {
    var selection = document.querySelector('[data-atlas-selection="' + kind + '"]');
    if (selection) selection.textContent = text;
  }

  function makeSvg(container, label, height, role) {
    var svg = svgElement('svg', {
      class: 'atlas-svg',
      viewBox: '0 0 920 ' + height,
      role: role || 'img',
      'aria-label': label,
      preserveAspectRatio: 'xMidYMid meet'
    });
    container.appendChild(svg);
    return svg;
  }

  function addAxisLabel(svg, x, y, text, anchor, className) {
    svg.appendChild(svgElement('text', {
      x: x,
      y: y,
      'text-anchor': anchor || 'middle',
      class: className || 'atlas-axis-label'
    }, text));
  }

  function wireSvgPoint(group, description, handler) {
    group.setAttribute('tabindex', '0');
    group.setAttribute('role', 'button');
    group.setAttribute('aria-label', description);
    group.addEventListener('click', handler);
    group.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    });
  }

  function renderTopics() {
    var container = document.querySelector('[data-atlas-chart="topics"]');
    var topicData = data.topic_lifecycle || {};
    var series = topicData.series || [];
    if (!container || !series.length) return;
    clear(container);

    var legend = htmlElement('div', 'atlas-chart-legend atlas-topic-legend');
    container.appendChild(legend);
    series.forEach(function (row, index) {
      var button = htmlElement('button', 'atlas-legend-button', row.term);
      button.type = 'button';
      button.setAttribute('aria-pressed', 'true');
      button.style.setProperty('--series-color', seriesColors[index % seriesColors.length]);
      button.addEventListener('click', function () {
        var visible = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', visible ? 'false' : 'true');
        var elements = container.querySelectorAll('[data-topic-series="' + index + '"]');
        Array.prototype.forEach.call(elements, function (element) {
          element.classList.toggle('is-muted', visible);
        });
        track('atlas_topic_toggle', { topic: row.term, visible: !visible });
      });
      legend.appendChild(button);
    });

    var width = 920;
    var height = 360;
    var margin = { top: 20, right: 28, bottom: 50, left: 56 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var points = series[0].points || [];
    var maxShare = 0;
    series.forEach(function (row) {
      row.points.forEach(function (point) {
        maxShare = Math.max(maxShare, Number(point.share || 0));
      });
    });
    maxShare = Math.max(10, Math.ceil(maxShare / 10) * 10);
    var svg = makeSvg(container, topicData.metric || 'Topic momentum', height);

    [0, 0.5, 1].forEach(function (fraction) {
      var y = margin.top + plotHeight - (plotHeight * fraction);
      svg.appendChild(svgElement('line', {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        class: 'atlas-grid-line'
      }));
      addAxisLabel(svg, margin.left - 10, y + 4, Math.round(maxShare * fraction) + '%', 'end');
    });

    var xIndexes = points.length > 2 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : points.map(function (_, index) { return index; });
    xIndexes.forEach(function (index) {
      var x = margin.left + (points.length <= 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
      addAxisLabel(svg, x, height - 18, compactDate(points[index].date), 'middle');
    });
    addAxisLabel(svg, 15, margin.top + plotHeight / 2, 'share of stories', 'middle', 'atlas-axis-title atlas-axis-title-y');

    series.forEach(function (row, seriesIndex) {
      var coordinates = row.points.map(function (point, index) {
        var x = margin.left + (row.points.length <= 1 ? plotWidth / 2 : (index / (row.points.length - 1)) * plotWidth);
        var y = margin.top + plotHeight - (Number(point.share || 0) / maxShare) * plotHeight;
        return { x: x, y: y, point: point };
      });
      var pathData = coordinates.map(function (point, index) {
        return (index ? 'L' : 'M') + point.x.toFixed(1) + ' ' + point.y.toFixed(1);
      }).join(' ');
      var path = svgElement('path', {
        d: pathData,
        class: 'atlas-topic-line',
        stroke: seriesColors[seriesIndex % seriesColors.length],
        'data-topic-series': seriesIndex
      });
      svg.appendChild(path);

      coordinates.forEach(function (coordinate) {
        var point = svgElement('circle', {
          cx: coordinate.x,
          cy: coordinate.y,
          r: 4,
          fill: seriesColors[seriesIndex % seriesColors.length],
          class: 'atlas-topic-point',
          'data-topic-series': seriesIndex
        });
        point.appendChild(svgElement('title', {}, row.term + ': ' + coordinate.point.share + '% on ' + coordinate.point.date));
        svg.appendChild(point);
      });
    });
  }

  function renderStack() {
    var container = document.querySelector('[data-atlas-chart="stack"]');
    var stack = data.industry_stack || {};
    var companies = stack.companies || [];
    if (!container || !companies.length) return;
    clear(container);

    var scroller = htmlElement('div', 'atlas-heatmap-scroll');
    var grid = htmlElement('div', 'atlas-heatmap-grid');
    grid.style.setProperty('--atlas-layer-count', String((stack.layers || []).length));
    scroller.appendChild(grid);
    container.appendChild(scroller);
    grid.appendChild(htmlElement('div', 'atlas-heatmap-corner', 'Company'));
    (stack.layers || []).forEach(function (layer) {
      grid.appendChild(htmlElement('div', 'atlas-heatmap-head', layer.label));
    });

    var maximum = Math.max(Number(stack.max_count || 0), 1);
    companies.forEach(function (company) {
      var name = htmlElement('div', 'atlas-company-name');
      name.appendChild(htmlElement('strong', '', company.name));
      name.appendChild(htmlElement('span', '', company.story_count + ' stories'));
      grid.appendChild(name);
      company.cells.forEach(function (cell) {
        var button = htmlElement('button', 'atlas-heat-cell', String(cell.count));
        var intensity = cell.count ? 0.18 + (Number(cell.count) / maximum) * 0.82 : 0;
        button.type = 'button';
        button.style.setProperty('--heat-alpha', Math.round(intensity * 64) + '%');
        button.style.setProperty('--heat-border-alpha', Math.round(intensity * 70) + '%');
        button.setAttribute('aria-label', company.name + ', ' + cell.label + ': ' + cell.count + ' matching stories');
        button.addEventListener('click', function () {
          setSelection('stack', company.name + ' × ' + cell.label + ': ' + cell.count + ' matching stories in the current snapshot.');
          track('atlas_stack_select', { company: company.name, layer: cell.key, count: cell.count });
        });
        grid.appendChild(button);
      });
    });
  }

  function logScale(value, minimum, maximum, start, length) {
    var minLog = Math.log10(minimum);
    var maxLog = Math.log10(maximum);
    return start + ((Math.log10(value) - minLog) / (maxLog - minLog)) * length;
  }

  function colorForOrganization(name) {
    if (!organizationColors[name]) {
      var index = Object.keys(organizationColors).length;
      organizationColors[name] = seriesColors[index % seriesColors.length];
    }
    return organizationColors[name];
  }

  function renderModels() {
    var container = document.querySelector('[data-atlas-chart="models"]');
    var modelData = data.model_value || {};
    var models = modelData.models || [];
    if (!container || !models.length) return;
    clear(container);

    var profiles = modelData.profiles || [];
    var controls = htmlElement('div', 'model-profile-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Choose API workload shape');
    container.appendChild(controls);

    var list = htmlElement('div', 'model-price-list');
    container.appendChild(list);

    function priceFor(row, profile) {
      return Number(row.input_price) * Number(profile.input_share)
        + Number(row.output_price) * Number(profile.output_share);
    }

    function priceLabel(value) {
      if (value < 0.01) return '$' + value.toFixed(4);
      if (value < 1) return '$' + value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
      return '$' + value.toFixed(2).replace(/\.00$/, '');
    }

    var allPrices = [];
    profiles.forEach(function (profile) {
      models.forEach(function (row) { allPrices.push(priceFor(row, profile)); });
    });
    var minPrice = Math.max(0.0001, Math.min.apply(Math, allPrices));
    var maxPrice = Math.max.apply(Math, allPrices);

    function draw(profile) {
      Array.prototype.forEach.call(controls.querySelectorAll('button'), function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-model-profile') === profile.key ? 'true' : 'false');
      });
      clear(list);

      var note = htmlElement('div', 'model-price-scale');
      note.appendChild(htmlElement('span', '', priceLabel(minPrice) + ' / MTok'));
      note.appendChild(htmlElement('span', '', 'log price scale'));
      note.appendChild(htmlElement('span', '', priceLabel(maxPrice) + ' / MTok'));
      list.appendChild(note);

      models.map(function (row) {
        return { row: row, blended: priceFor(row, profile) };
      }).sort(function (a, b) {
        return a.blended - b.blended;
      }).forEach(function (item) {
        var row = item.row;
        var normalized = (Math.log10(item.blended) - Math.log10(minPrice))
          / (Math.log10(maxPrice) - Math.log10(minPrice));
        var button = htmlElement('button', 'model-price-row');
        button.type = 'button';
        button.setAttribute('aria-label', row.name + ', ' + priceLabel(item.blended) + ' per million tokens for ' + profile.label + ' workload');

        var identity = htmlElement('span', 'model-price-identity');
        identity.appendChild(htmlElement('strong', '', row.name));
        identity.appendChild(htmlElement('small', '', row.organization));
        button.appendChild(identity);

        var priceTrack = htmlElement('span', 'model-price-track');
        var bar = htmlElement('i', 'model-price-bar');
        bar.style.setProperty('--model-price-share', (4 + normalized * 96).toFixed(1) + '%');
        bar.style.setProperty('--model-color', colorForOrganization(row.organization));
        priceTrack.appendChild(bar);
        button.appendChild(priceTrack);
        button.appendChild(htmlElement('strong', 'model-price-value', priceLabel(item.blended)));

        button.addEventListener('click', function () {
          var cache = row.cached_input_price === undefined ? 'not listed' : priceLabel(Number(row.cached_input_price));
          setSelection('models', row.name + ' · ' + row.organization + ' · ' + profile.label + ' blend ' + priceLabel(item.blended) + '/MTok · input ' + priceLabel(Number(row.input_price)) + ' · cached input ' + cache + ' · output ' + priceLabel(Number(row.output_price)) + '.');
          track('atlas_model_price_select', { model: row.name, profile: profile.key });
        });
        list.appendChild(button);
      });
      track('atlas_model_profile', { profile: profile.key });
    }

    profiles.forEach(function (profile) {
      var button = htmlElement('button', 'model-profile-button', profile.label);
      button.type = 'button';
      button.setAttribute('data-model-profile', profile.key);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () { draw(profile); });
      controls.appendChild(button);
    });

    var defaultProfile = profiles.filter(function (profile) {
      return profile.key === modelData.default_profile;
    })[0] || profiles[0];
    if (defaultProfile) draw(defaultProfile);
  }

  function renderAdoption() {
    var container = document.querySelector('[data-atlas-chart="adoption"]');
    var adoption = data.adoption || {};
    var sectors = adoption.sectors || [];
    if (!container || !sectors.length) return;
    clear(container);

    var maximum = Math.max(50, Math.ceil(Math.max.apply(Math, sectors.map(function (row) { return Number(row.expected); })) / 10) * 10);
    var legend = htmlElement('div', 'atlas-chart-legend');
    legend.appendChild(htmlElement('span', 'atlas-current-key', 'Current use'));
    legend.appendChild(htmlElement('span', 'atlas-expected-key', 'Expected in six months'));
    container.appendChild(legend);

    var ruler = htmlElement('div', 'atlas-adoption-ruler');
    ruler.appendChild(htmlElement('span', '', '0%'));
    ruler.appendChild(htmlElement('span', '', Math.round(maximum / 2) + '%'));
    ruler.appendChild(htmlElement('span', '', maximum + '%'));
    container.appendChild(ruler);

    var rows = htmlElement('div', 'atlas-adoption-rows');
    container.appendChild(rows);
    sectors.forEach(function (sector, index) {
      var row = htmlElement('div', 'atlas-adoption-row' + (index >= 10 ? ' is-extra' : ''));
      var label = htmlElement('div', 'atlas-adoption-label');
      label.appendChild(htmlElement('strong', '', sector.name));
      label.appendChild(htmlElement('span', '', sector.current + '% → ' + sector.expected + '%'));
      row.appendChild(label);
      var trackElement = htmlElement('div', 'atlas-adoption-track');
      var start = clamp((Number(sector.current) / maximum) * 100, 0, 100);
      var end = clamp((Number(sector.expected) / maximum) * 100, 0, 100);
      var connection = htmlElement('span', 'atlas-adoption-connection');
      connection.style.left = Math.min(start, end) + '%';
      connection.style.width = Math.abs(end - start) + '%';
      var current = htmlElement('span', 'atlas-adoption-dot atlas-adoption-current');
      current.style.left = start + '%';
      var expected = htmlElement('span', 'atlas-adoption-dot atlas-adoption-expected');
      expected.style.left = end + '%';
      trackElement.appendChild(connection);
      trackElement.appendChild(current);
      trackElement.appendChild(expected);
      trackElement.setAttribute('role', 'img');
      trackElement.setAttribute('aria-label', sector.name + ': current use ' + sector.current + ' percent, expected use ' + sector.expected + ' percent');
      row.appendChild(trackElement);
      rows.appendChild(row);
    });

    if (sectors.length > 10) {
      var toggle = htmlElement('button', 'atlas-show-all', 'Show all ' + sectors.length + ' sectors');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        toggle.textContent = expanded ? 'Show all ' + sectors.length + ' sectors' : 'Show leading sectors';
        rows.classList.toggle('is-expanded', !expanded);
        track('atlas_adoption_expand', { expanded: !expanded });
      });
      container.appendChild(toggle);
    }
  }

  function renderEconomics() {
    var container = document.querySelector('[data-atlas-chart="economics"]');
    var economics = data.company_economics || {};
    var companies = economics.companies || [];
    if (!container || !companies.length) return;
    clear(container);

    var width = 920;
    var height = 430;
    var margin = { top: 28, right: 36, bottom: 66, left: 76 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var fundingValues = companies.map(function (row) { return Number(row.funding); });
    var revenueValues = companies.map(function (row) { return Number(row.revenue); });
    var minFunding = Math.min.apply(Math, fundingValues) * 0.7;
    var maxFunding = Math.max.apply(Math, fundingValues) * 1.4;
    var minRevenue = Math.min.apply(Math, revenueValues) * 0.65;
    var maxRevenue = Math.max.apply(Math, revenueValues) * 1.5;
    var staffValues = companies.map(function (row) { return Number(row.staff || 0); });
    var maxStaff = Math.max.apply(Math, staffValues.concat([1]));
    var svg = makeSvg(container, economics.metric || 'Frontier company economics', height, 'group');

    [1000000000, 10000000000, 100000000000].forEach(function (tick) {
      if (tick < minFunding || tick > maxFunding) return;
      var x = logScale(tick, minFunding, maxFunding, margin.left, plotWidth);
      svg.appendChild(svgElement('line', { x1: x, y1: margin.top, x2: x, y2: margin.top + plotHeight, class: 'atlas-grid-line' }));
      addAxisLabel(svg, x, height - 31, formatMoney(tick), 'middle');
    });
    [100000000, 1000000000, 10000000000].forEach(function (tick) {
      if (tick < minRevenue || tick > maxRevenue) return;
      var y = margin.top + plotHeight - (logScale(tick, minRevenue, maxRevenue, 0, plotHeight));
      svg.appendChild(svgElement('line', { x1: margin.left, y1: y, x2: width - margin.right, y2: y, class: 'atlas-grid-line' }));
      addAxisLabel(svg, margin.left - 12, y + 4, formatMoney(tick), 'end');
    });
    addAxisLabel(svg, margin.left + plotWidth / 2, height - 7, 'cumulative equity funding · logarithmic', 'middle', 'atlas-axis-title');
    addAxisLabel(svg, 17, margin.top + plotHeight / 2, 'annualized revenue · log', 'middle', 'atlas-axis-title atlas-axis-title-y');

    companies.forEach(function (row) {
      var x = logScale(Number(row.funding), minFunding, maxFunding, margin.left, plotWidth);
      var y = margin.top + plotHeight - logScale(Number(row.revenue), minRevenue, maxRevenue, 0, plotHeight);
      var radius = 7 + Math.sqrt(Number(row.staff || 0) / maxStaff) * 12;
      var group = svgElement('g', { class: 'atlas-data-point atlas-company-point' });
      var circle = svgElement('circle', {
        cx: x,
        cy: y,
        r: radius,
        fill: colorForOrganization(row.name),
        class: 'atlas-point-circle'
      });
      circle.appendChild(svgElement('title', {}, row.name + ': ' + formatMoney(row.revenue) + ' revenue, ' + formatMoney(row.funding) + ' funding'));
      group.appendChild(circle);
      group.appendChild(svgElement('text', { x: x + radius + 5, y: y + 4, class: 'atlas-point-label' }, row.name));
      wireSvgPoint(group, row.name + ', ' + formatMoney(row.revenue) + ' annualized revenue and ' + formatMoney(row.funding) + ' equity funding', function () {
        var staff = row.staff ? ' · ' + Number(row.staff).toLocaleString('en-US') + ' staff' : '';
        setSelection('economics', row.name + ' · ' + formatMoney(row.revenue) + ' annualized revenue · ' + formatMoney(row.funding) + ' cumulative equity funding' + staff + ' · ' + row.confidence + ' estimate');
        track('atlas_company_select', { company: row.name });
      });
      svg.appendChild(group);
    });
  }

  function formatMoneyTables() {
    var cells = document.querySelectorAll('[data-money]');
    Array.prototype.forEach.call(cells, function (cell) {
      cell.textContent = formatMoney(cell.getAttribute('data-money'));
    });
  }

  renderTopics();
  renderStack();
  renderModels();
  renderAdoption();
  renderEconomics();
  formatMoneyTables();
  atlasRoot.classList.add('is-ready');
}());
