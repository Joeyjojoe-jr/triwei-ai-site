const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const head = fs.readFileSync(path.join(root, '_includes', 'head.html'), 'utf8');
const home = fs.readFileSync(path.join(root, '_layouts', 'home.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets', 'js', 'guided-home.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'assets', 'css', 'guided-home.css'), 'utf8');

function sectionBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('the original orbit hero remains the first homepage section', () => {
  const hero = sectionBetween(
    home,
    '<section class="hero card animate-in hero-orbit-wrap">',
    '</section>'
  );

  assert.match(hero, /data-orbit-nav/);
  assert.match(hero, /triwei-logo\.png/);
  assert.match(hero, /orbit-main/);
  assert.match(hero, /folder-heads/);
  assert.match(hero, /Right now in AI/);

  const heroIndex = home.indexOf('<section class="hero card animate-in hero-orbit-wrap">');
  const pulseIndex = home.indexOf('<section class="section-block animate-in pulse-block"');
  assert.ok(heroIndex >= 0 && pulseIndex > heroIndex, 'AI Pulse must remain below the orbit hero');
});

test('TriWei Brief assets are scoped to the home layout', () => {
  const homeConditional = sectionBetween(
    head,
    '{% if page.layout == "home" %}',
    '{% endif %}'
  );

  assert.match(homeConditional, /assets\/css\/guided-home\.css/);
  assert.match(homeConditional, /assets\/js\/guided-home\.js/);
});

test('the brief preserves the hero and reuses the existing AI Pulse', () => {
  assert.match(script, /HERO_SELECTOR = '\.hero-orbit-wrap'/);
  assert.match(script, /PULSE_SELECTOR = '\.pulse-block'/);
  assert.match(script, /hero\.insertAdjacentElement\('afterend', section\)/);
  assert.match(script, /TriWei Brief/);
  assert.match(script, /What happened/);
  assert.match(script, /Why it matters/);
  assert.match(script, /What changed/);
  assert.doesNotMatch(script, /hero\.innerHTML\s*=/);
  assert.doesNotMatch(script, /fetch\s*\(/);
  assert.doesNotMatch(script, /XMLHttpRequest/);
});

test('the brief uses local-only return context and explicit evidence boundaries', () => {
  assert.match(script, /triwei-brief-snapshot-v1/);
  assert.match(script, /window\.localStorage/);
  assert.match(script, /New since your last visit/);
  assert.match(script, /not a truth score/i);
  assert.match(script, /does not establish that the sources are independent/i);
});

test('the brief inherits TriWei tokens and protects reduced motion', () => {
  assert.match(styles, /var\(--accent\)/);
  assert.match(styles, /var\(--surface\)/);
  assert.match(styles, /var\(--mono\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.guided-home/);
  assert.doesNotMatch(styles, /\.hero-orbit-wrap\s*\{/);
  assert.doesNotMatch(styles, /\.orbit\s*\{/);
});
