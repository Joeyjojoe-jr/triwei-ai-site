const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('holodeck cleanup is guarded and pointer math uses cached viewport dimensions', () => {
  const source = read('assets/js/holodeck.js');

  assert.match(source, /if \(renderer && renderer\.dispose\) renderer\.dispose\(\);/);
  assert.match(source, /var viewWidth = initialSize\.width;/);
  assert.match(source, /var viewHeight = initialSize\.height;/);
  assert.match(source, /targetX = \(event\.clientX \/ viewWidth\) - 0\.5;/);
  assert.match(source, /targetY = \(event\.clientY \/ viewHeight\) - 0\.5;/);
  assert.match(source, /viewWidth = size\.width;/);
  assert.match(source, /viewHeight = size\.height;/);
  assert.doesNotMatch(source, /event\.clientX \/ Math\.max\(window\.innerWidth/);
  assert.doesNotMatch(source, /event\.clientY \/ Math\.max\(window\.innerHeight/);
});

test('safe-area release overrides preserve normal gutters and load last', () => {
  const head = read('_includes/head.html');
  const css = read('assets/css/mobile-release-fixes.css');

  const hardeningIndex = head.indexOf('mobile-hardening.css');
  const releaseFixIndex = head.indexOf('mobile-release-fixes.css');

  assert.ok(hardeningIndex >= 0, 'mobile-hardening.css must be loaded');
  assert.ok(releaseFixIndex > hardeningIndex, 'release fixes must load after mobile hardening');
  assert.match(css, /padding-left:\s*max\(1rem, env\(safe-area-inset-left\)\);/);
  assert.match(css, /padding-right:\s*max\(1rem, env\(safe-area-inset-right\)\);/);
  assert.match(css, /padding-bottom:\s*max\(1\.5rem, env\(safe-area-inset-bottom\)\);/);
});
