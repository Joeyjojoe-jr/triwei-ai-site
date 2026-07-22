const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function isDirectHttps(value) {
  return /^https:\/\//.test(String(value || '')) &&
    !/news\.google\.com|google\.com\/search|bing\.com\/search/i.test(String(value || ''));
}

test('homepage topic remains a gateway into the source-only Signal History register', () => {
  const home = read('_layouts/home.html');

  assert.match(home, /class="hero-cycle"[^>]+href="\{\{ '\/signals\/'/);
  assert.match(home, /encodeURIComponent\(topic\)/);
  assert.match(home, /#signal-ledger/);
});

test('Signal History publishes metadata and direct links, not AI-authored relationships', () => {
  const page = read('signals.md');
  const data = JSON.parse(read('_data/signals.json'));

  assert.match(page, /publication_key:\s*signals/);
  assert.match(page, /id="signal-ledger"/);
  assert.match(page, /Historical source register/);
  assert.match(page, /Open the original piece/);
  assert.match(page, /event\.author/);
  assert.match(page, /event\.outlet/);
  assert.match(page, /event\.date/);
  assert.match(page, /event\.url/);

  for (const forbidden of [
    /event\.note/,
    /thread\.dek/,
    /thread\.status/,
    /event\.relationship/,
    /signals\.observers/,
    /data-signal-filter/,
    /data-signal-tag/,
  ]) {
    assert.doesNotMatch(page, forbidden);
  }

  assert.ok(data.threads.length >= 5);
  for (const thread of data.threads) {
    for (const event of thread.events) {
      assert.ok(isDirectHttps(event.url), `non-direct signal source: ${event.url}`);
      assert.ok(String(event.author || '').trim(), 'signal source missing author or institution');
      assert.ok(String(event.outlet || '').trim(), 'signal source missing publisher or outlet');
    }
  }
});

test('AI Hardware publishes sourced specification fields without recommendations', () => {
  const page = read('hardware.md');
  const data = JSON.parse(read('_data/hardware.json'));

  assert.match(page, /publication_key:\s*hardware/);
  assert.match(page, /Specification register/);
  assert.match(page, /gpu\.source_url/);
  assert.match(page, /gpu\.source_label/);
  assert.match(page, /material\.source_url/);
  assert.match(page, /fab\.source_url/);
  assert.match(page, /Interpretive material withheld/);

  for (const forbidden of [
    /gpu\.best_read/,
    /metric\.explanation/,
    /metric\.method/,
    /metric\.limit/,
    /material\.why/,
    /material\.how/,
    /material\.myth/,
    /fab\.lesson/,
    /conversion_options/,
    /hardware-intelligence\.js/,
  ]) {
    assert.doesNotMatch(page, forbidden);
  }

  assert.ok(data.gpus.length >= 4);
  for (const gpu of data.gpus) {
    assert.ok(isDirectHttps(gpu.source_url), `non-direct GPU source: ${gpu.source_url}`);
  }
  for (const material of data.materials) {
    assert.ok(isDirectHttps(material.source_url), `non-direct material source: ${material.source_url}`);
  }
  for (const fab of data.fab_projects) {
    assert.ok(isDirectHttps(fab.source_url), `non-direct fab source: ${fab.source_url}`);
  }
});

test('source-only presentation supports narrow screens and reduced motion', () => {
  const css = read('assets/css/publication-standard.css');

  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.source-only-table/);
  assert.match(css, /\.withheld-notice/);
});

test('primary navigation exposes both source-register destinations', () => {
  const header = read('_includes/header.html');

  assert.match(header, />Signal History<\/a>/);
  assert.match(header, />AI Hardware<\/a>/);
});
