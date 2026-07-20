const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('atlas page presents five question-led visualizations and source labels', () => {
  const page = read('industry.md');
  const chartNames = ['topics', 'stack', 'models', 'adoption', 'economics'];

  assert.match(page, /permalink:\s*\/industry\//);
  chartNames.forEach((name) => {
    assert.match(page, new RegExp(`data-atlas-chart="${name}"`));
  });
  assert.match(page, /Coverage signal/);
  assert.match(page, /Industry measure/);
  assert.match(page, /industry-atlas-data/);
});

test('atlas interactions remain dependency-free and keyboard accessible', () => {
  const source = read('assets/js/industry-atlas.js');

  assert.match(source, /setAttribute\('tabindex', '0'\)/);
  assert.match(source, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(source, /aria-label/);
  assert.match(source, /triweiAnalytics\.track/);
  assert.doesNotMatch(source, /innerHTML/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /XMLHttpRequest/);
});

test('atlas styling provides mobile overflow and reduced-motion behavior', () => {
  const css = read('assets/css/industry-atlas.css');

  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.atlas-heatmap-grid/);
  assert.match(css, /\.atlas-adoption-row/);
});
