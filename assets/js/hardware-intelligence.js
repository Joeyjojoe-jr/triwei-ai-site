(function () {
  'use strict';

  var dataNode = document.getElementById('hardware-data');
  var leftSelect = document.getElementById('hardware-left');
  var rightSelect = document.getElementById('hardware-right');
  var comparison = document.getElementById('hardware-comparison');
  if (!dataNode || !leftSelect || !rightSelect || !comparison) return;

  var gpus = [];
  try {
    gpus = JSON.parse(dataNode.textContent || '[]');
  } catch (error) {
    return;
  }

  function track(name, payload) {
    if (window.triweiAnalytics && typeof window.triweiAnalytics.track === 'function') {
      window.triweiAnalytics.track(name, payload || {});
    }
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function findGpu(key) {
    return gpus.filter(function (gpu) { return gpu.key === key; })[0];
  }

  function valueLabel(value, suffix) {
    if (value === null || value === undefined) return 'Architecture-specific';
    return Number(value).toLocaleString() + suffix;
  }

  function addHeader(grid, gpu) {
    var header = element('article', 'hardware-compare-product');
    header.appendChild(element('span', '', gpu.class));
    header.appendChild(element('h3', '', gpu.name));
    header.appendChild(element('p', '', gpu.architecture + ' · ' + gpu.memory_type));
    grid.appendChild(header);
  }

  function addMetric(grid, label, leftValue, rightValue, leftNumeric, rightNumeric) {
    var row = element('div', 'hardware-compare-row');
    row.appendChild(element('strong', 'hardware-compare-label', label));
    var maximum = Math.max(Number(leftNumeric) || 0, Number(rightNumeric) || 0, 1);
    [
      { label: leftValue, value: Number(leftNumeric) || 0 },
      { label: rightValue, value: Number(rightNumeric) || 0 }
    ].forEach(function (item) {
      var cell = element('div', 'hardware-compare-cell');
      cell.appendChild(element('span', '', item.label));
      if (item.value) {
        var trackNode = element('i', 'hardware-compare-track');
        var bar = element('b', 'hardware-compare-bar');
        bar.style.setProperty('--hardware-bar', Math.max(5, (item.value / maximum) * 100).toFixed(1) + '%');
        trackNode.appendChild(bar);
        cell.appendChild(trackNode);
      }
      row.appendChild(cell);
    });
    grid.appendChild(row);
  }

  function addReadout(grid, gpu) {
    var card = element('article', 'hardware-compare-readout');
    card.appendChild(element('strong', '', gpu.name));
    card.appendChild(element('p', '', gpu.best_read));
    var source = element('a', '', gpu.source_label + ' ↗');
    source.href = gpu.source_url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    card.appendChild(source);
    grid.appendChild(card);
  }

  function renderComparison(announce) {
    var left = findGpu(leftSelect.value);
    var right = findGpu(rightSelect.value);
    if (!left || !right) return;
    clear(comparison);

    var headers = element('div', 'hardware-compare-products');
    addHeader(headers, left);
    addHeader(headers, right);
    comparison.appendChild(headers);

    var metrics = element('div', 'hardware-compare-metrics');
    addMetric(metrics, 'Memory capacity', valueLabel(left.memory_capacity_gb, ' GB'), valueLabel(right.memory_capacity_gb, ' GB'), left.memory_capacity_gb, right.memory_capacity_gb);
    addMetric(metrics, 'Memory bandwidth', valueLabel(left.memory_bandwidth_gbps, ' GB/s'), valueLabel(right.memory_bandwidth_gbps, ' GB/s'), left.memory_bandwidth_gbps, right.memory_bandwidth_gbps);
    addMetric(metrics, 'Memory bus', valueLabel(left.memory_bus_bits, '-bit'), valueLabel(right.memory_bus_bits, '-bit'), left.memory_bus_bits, right.memory_bus_bits);
    addMetric(metrics, 'Compute engines', left.compute_units, right.compute_units, null, null);
    addMetric(metrics, 'AI compute', left.ai_compute, right.ai_compute, null, null);
    addMetric(metrics, 'Power envelope', left.power, right.power, null, null);
    addMetric(metrics, 'Scale-out path', left.interconnect, right.interconnect, null, null);
    comparison.appendChild(metrics);

    var readouts = element('div', 'hardware-compare-readouts');
    addReadout(readouts, left);
    addReadout(readouts, right);
    comparison.appendChild(readouts);
    if (announce !== false) track('hardware_compare', { left: left.key, right: right.key });
  }

  leftSelect.addEventListener('change', function () { renderComparison(true); });
  rightSelect.addEventListener('change', function () { renderComparison(true); });
  renderComparison(false);

  var modeCopy = {
    'local-llm': 'Local LLM: first ask whether weights, runtime, context, and KV cache fit; then compare bandwidth, compute, kernels, and offload cost.',
    creative: 'Rendering & creative: capacity protects large scenes and timelines, while shader/RT/Tensor throughput, media engines, drivers, and sustained clocks determine speed.',
    'data-center': 'Data center: HBM, numerical formats, ECC, interconnect, virtualization, networking, rack power, cooling, reliability, and software support dominate a consumer-style VRAM comparison.'
  };
  var modeEmphasis = {
    'local-llm': ['capacity', 'bandwidth', 'software'],
    creative: ['capacity', 'compute', 'power', 'software'],
    'data-center': ['bandwidth', 'interconnect', 'power', 'software']
  };
  var modeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-hardware-mode]'));
  var copyNode = document.getElementById('hardware-mode-copy');

  modeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var mode = button.getAttribute('data-hardware-mode');
      modeButtons.forEach(function (item) {
        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
      });
      if (copyNode) copyNode.textContent = modeCopy[mode] || '';
      Array.prototype.forEach.call(document.querySelectorAll('[data-hardware-metric]'), function (metric) {
        metric.classList.toggle('is-emphasized', (modeEmphasis[mode] || []).indexOf(metric.getAttribute('data-hardware-metric')) !== -1);
      });
      track('hardware_workload_mode', { mode: mode });
    });
  });

  if (modeButtons[0]) modeButtons[0].click();
}());
