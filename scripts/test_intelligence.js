const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('homepage topic is a contextual gateway into Signal History', () => {
  const home = read('_layouts/home.html');

  assert.match(home, /class="hero-cycle"[^>]+href="\{\{ '\/signals\/'/);
  assert.match(home, /encodeURIComponent\(topic\)/);
  assert.match(home, /#signal-ledger/);
  assert.match(home, /Select the topic to trace its earlier signals/);
});

test('Signal History exposes relationships, filters, attribution, and limits', () => {
  const page = read('signals.md');
  const data = JSON.parse(read('_data/signals.json'));

  assert.match(page, /permalink:\s*\/signals\//);
  assert.match(page, /id="signal-ledger"/);
  assert.match(page, /data-signal-filter/);
  assert.match(page, /data-signal-thread/);
  assert.match(page, /Early, durable reads/);
  assert.match(page, /not a pundit scoreboard/i);
  assert.deepEqual(new Set(data.relationship_types.map((item) => item.key)), new Set(['seed', 'corroborates', 'complicates', 'redirects']));
  assert.ok(data.threads.length >= 5);
});

test('Signal History interaction is dependency-free and safe', () => {
  const source = read('assets/js/signal-history.js');

  assert.match(source, /URLSearchParams/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /triweiAnalytics\.track/);
  assert.doesNotMatch(source, /innerHTML/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});

test('AI Hardware teaches resource gates, memory, materials, factories, and conversion', () => {
  const page = read('hardware.md');
  const data = JSON.parse(read('_data/hardware.json'));

  assert.match(page, /permalink:\s*\/hardware\//);
  ['gpu-numbers', 'compare', 'memory', 'materials', 'fabs', 'conversion'].forEach((id) => {
    assert.match(page, new RegExp(`id="${id}"`));
  });
  assert.match(page, /The exact 12 GB vs 16 GB lesson/);
  assert.match(page, /Specifications narrow a decision; workload tests finish it/);
  assert.match(page, /hardware_age_seconds > 7776000/);
  assert.match(page, /Reference expired/);
  assert.match(page, /\/industry\/#supply-chain/);
  assert.ok(data.gpus.some((gpu) => gpu.key === 'rtx-4070-super-12'));
  assert.ok(data.gpus.some((gpu) => gpu.key === 'rtx-4060-ti-16'));
  assert.equal(data.conversion_options.length, 4);
  assert.equal(data.reverify_by, '2026-10-18');
});

test('AI Hardware comparator remains accessible and dependency-free', () => {
  const source = read('assets/js/hardware-intelligence.js');

  assert.match(source, /textContent/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /triweiAnalytics\.track/);
  assert.doesNotMatch(source, /innerHTML/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});

test('intelligence pages support narrow screens and reduced motion', () => {
  const css = read('assets/css/intelligence.css');

  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.signal-event-list/);
  assert.match(css, /\.hardware-comparison/);
});

test('primary navigation exposes both intelligence destinations', () => {
  const header = read('_includes/header.html');

  assert.match(header, />Signal History<\/a>/);
  assert.match(header, />AI Hardware<\/a>/);
});
