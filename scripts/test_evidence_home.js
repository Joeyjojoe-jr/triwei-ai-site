const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const head = fs.readFileSync(path.join(root, '_includes', 'head.html'), 'utf8');
const home = fs.readFileSync(path.join(root, '_layouts', 'home.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'assets', 'css', 'evidence-home.css'), 'utf8');
const sourcesPage = fs.readFileSync(path.join(root, 'sources.md'), 'utf8');
const register = JSON.parse(
  fs.readFileSync(path.join(root, '_data', 'home_sources.json'), 'utf8')
);

function sectionBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('the original rotating orbit remains the first homepage section', () => {
  const hero = sectionBetween(
    home,
    '<section class="hero card animate-in hero-orbit-wrap">',
    '</section>'
  );

  assert.match(hero, /data-orbit-nav/);
  assert.match(hero, /triwei-logo\.png/);
  assert.match(hero, /orbit-main/);
  assert.match(hero, /folder-heads/);
  assert.match(hero, /hero-cycle/);
  assert.match(hero, /Right now in AI/);

  const heroIndex = home.indexOf('<section class="hero card animate-in hero-orbit-wrap">');
  const registerIndex = home.indexOf('<main class="source-home"');
  assert.ok(heroIndex >= 0 && registerIndex > heroIndex, 'source register must begin below the orbit hero');
});

test('public links exclude Google News intermediary URLs', () => {
  assert.match(home, /unless h\.link contains 'news\.google\.com'/);
  assert.match(home, /unless item\.link contains 'news\.google\.com'/);
  assert.match(home, /Intermediary links are withheld/);
  assert.doesNotMatch(home, /href="https:\/\/news\.google\.com/);
});

test('the homepage publishes source metadata rather than article synopses', () => {
  assert.match(home, /Read the original work—not an AI synopsis/);
  assert.match(home, /Original pieces and public records/);
  assert.match(home, /Open original piece/);
  assert.match(home, /Author or responsible institution/);
  assert.match(home, /Publisher or host/);

  assert.doesNotMatch(home, /item\.summary/);
  assert.doesNotMatch(home, /news-summary/);
  assert.doesNotMatch(home, /record\.record/);
  assert.doesNotMatch(home, /record\.context/);
  assert.doesNotMatch(home, /record\.limits/);
  assert.doesNotMatch(home, /TriWei synthesis/);
});

test('every registered source is direct, attributable, and metadata-only', () => {
  assert.ok(register.records.length >= 4, 'expected at least four source records');
  const ids = new Set();

  for (const record of register.records) {
    for (const field of [
      'id', 'source_title', 'author', 'publisher', 'source_type',
      'published_display', 'source_url', 'checked_on'
    ]) {
      assert.equal(typeof record[field], 'string', `${record.id || 'record'} missing ${field}`);
      assert.ok(record[field].trim(), `${record.id || 'record'} has empty ${field}`);
    }

    assert.match(record.source_url, /^https:\/\//);
    assert.doesNotMatch(record.source_url, /news\.google\.com/i);
    assert.match(record.checked_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!ids.has(record.id), `duplicate source id: ${record.id}`);
    ids.add(record.id);

    for (const forbidden of ['summary', 'synopsis', 'record', 'context', 'limits', 'analysis']) {
      assert.equal(Object.hasOwn(record, forbidden), false, `${record.id} must not contain ${forbidden}`);
    }
  }
});

test('automated coverage shows headlines and metadata only', () => {
  assert.match(home, /Automated direct-link index/);
  assert.match(home, /Original feed headlines and direct publisher links only/);
  assert.match(home, /does not add article summaries/);
  assert.match(home, /item\.title/);
  assert.match(home, /item\.source/);
  assert.match(home, /item\.published_display/);
  assert.doesNotMatch(home, /ethics-tags/);
  assert.doesNotMatch(home, /coverage-trends/);
});

test('homepage styles inherit TriWei and never target the preserved orbit', () => {
  assert.match(styles, /var\(--accent\)/);
  assert.match(styles, /var\(--surface\)/);
  assert.match(styles, /var\(--mono\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(styles, /\.hero-orbit-wrap\s*\{/);
  assert.doesNotMatch(styles, /\.orbit\s*\{/);

  const homeConditional = sectionBetween(
    head,
    '{% if page.layout == "home" %}',
    '{% endif %}'
  );
  assert.match(homeConditional, /assets\/css\/evidence-home\.css/);
  assert.doesNotMatch(homeConditional, /evidence-home-refinement/);
});

test('Sources and Method states the human-authorship and original-link rule', () => {
  assert.match(sourcesPage, /does not publish AI-written synopses/i);
  assert.match(sourcesPage, /original author's piece/i);
  assert.match(sourcesPage, /canonical source/i);
  assert.match(sourcesPage, /human-researched and human-authored/i);
  assert.match(sourcesPage, /Corrections and revisions/);
});
