const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const head = fs.readFileSync(path.join(root, '_includes', 'head.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets', 'js', 'evidence-home-refinement.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'assets', 'css', 'evidence-home-refinement.css'), 'utf8');

test('the refined reading path loads only on the homepage', () => {
  assert.match(head, /assets\/css\/evidence-home-refinement\.css/);
  assert.match(head, /assets\/js\/evidence-home-refinement\.js/);
  assert.match(head, /page\.layout == "home"/);
});

test('the first reading path is event, evidence, and uncertainty', () => {
  assert.match(script, /What changed in AI—and what the evidence supports/);
  assert.match(script, /What changed/);
  assert.match(script, /What the record supports/);
  assert.match(script, /What remains uncertain/);
  assert.match(script, /Recent reviewed changes/);
  assert.match(script, /How TriWei labels and reviews records/);
});

test('methodology remains available but no longer dominates the first screen', () => {
  assert.match(script, /makeElement\('details'/);
  assert.match(script, /evidence-freshness/);
  assert.match(script, /evidence-class-grid/);
  assert.match(styles, /\.evidence-method-details/);
  assert.match(styles, /\.evidence-quick-guide/);
});

test('the refinement is local, dependency-free, and cannot alter the orbit', () => {
  assert.doesNotMatch(script, /\bfetch\s*\(/);
  assert.doesNotMatch(script, /XMLHttpRequest/);
  assert.doesNotMatch(script, /innerHTML/);
  assert.doesNotMatch(script, /hero-orbit-wrap/);
  assert.doesNotMatch(script, /\.orbit/);
  assert.doesNotMatch(styles, /\.orbit/);
  assert.match(styles, /@media \(max-width: 820px\)/);
});
