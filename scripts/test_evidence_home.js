const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const head = fs.readFileSync(path.join(root, '_includes', 'head.html'), 'utf8');
const home = fs.readFileSync(path.join(root, '_layouts', 'home.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'assets', 'css', 'evidence-home.css'), 'utf8');
const sources = fs.readFileSync(path.join(root, 'sources.md'), 'utf8');
const evidence = JSON.parse(fs.readFileSync(path.join(root, '_data', 'home_evidence.json'), 'utf8'));

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
  const deskIndex = home.indexOf('<main class="evidence-home"');
  assert.ok(heroIndex >= 0 && deskIndex > heroIndex, 'Evidence Desk must begin below the orbit hero');
});

test('the homepage loads only the evidence-first stylesheet', () => {
  const homeConditional = sectionBetween(
    head,
    '{% if page.layout == "home" %}',
    '{% endif %}'
  );

  assert.match(homeConditional, /assets\/css\/evidence-home\.css/);
  assert.doesNotMatch(homeConditional, /guided-home/);
});

test('reviewed evidence is separate from automated coverage', () => {
  assert.match(home, /TriWei Evidence Desk/);
  assert.match(home, /Documented record/);
  assert.match(home, /System context · TriWei synthesis/);
  assert.match(home, /Not established by this record/);
  assert.match(home, /Automated coverage inbox/);
  assert.match(home, /leads for inspection, not TriWei findings/);
  assert.match(home, /data-coverage-inbox/);

  const evidenceStart = home.indexOf('<main class="evidence-home"');
  const evidenceEnd = home.indexOf('</main>', evidenceStart);
  const desk = home.slice(evidenceStart, evidenceEnd);
  assert.doesNotMatch(desk, /ai_pulse/);
  assert.doesNotMatch(desk, /strength_percent/);
  assert.doesNotMatch(desk, /source voices/i);
  assert.doesNotMatch(desk, /truth score/i);
});

test('every homepage record has inspectable provenance and explicit limits', () => {
  assert.ok(evidence.records.length >= 4, 'expected at least four reviewed records');
  const ids = new Set();

  for (const record of evidence.records) {
    for (const field of [
      'id', 'date', 'date_display', 'domain', 'evidence_class', 'evidence_label',
      'source_role', 'title', 'record', 'context', 'limits', 'status',
      'source_label', 'source_url', 'source_owner', 'verified_on',
      'tracker_label', 'tracker_url'
    ]) {
      assert.equal(typeof record[field], 'string', `${record.id || 'record'} missing ${field}`);
      assert.ok(record[field].trim(), `${record.id || 'record'} has empty ${field}`);
    }

    assert.match(record.date, /^\d{4}(?:-\d{2})?(?:-\d{2})?$/);
    assert.match(record.verified_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(record.source_url, /^https:\/\//);
    assert.match(record.tracker_url, /^\//);
    assert.ok(record.title.trim().split(/\s+/).length >= 5, 'record title must describe an event, not only an entity');
    assert.ok(!ids.has(record.id), `duplicate record id: ${record.id}`);
    ids.add(record.id);
  }
});

test('the data contract forbids popularity and hidden verdicts', () => {
  const serialized = JSON.stringify(evidence);
  assert.match(evidence.purpose, /not because .* appeared frequently/i);
  assert.match(evidence.method.publication_gate, /cannot publish/i);
  assert.match(evidence.method.attribution, /does not reproduce article bodies/i);
  assert.match(evidence.method.automation, /AI tools may assist/i);
  assert.match(evidence.method.non_claim, /not endorsement/i);
  assert.doesNotMatch(serialized, /importance_score/i);
  assert.doesNotMatch(serialized, /truth_score/i);
  assert.doesNotMatch(serialized, /confidence_score/i);
});

test('styles inherit TriWei and never target the preserved orbit', () => {
  assert.match(styles, /var\(--accent\)/);
  assert.match(styles, /var\(--surface\)/);
  assert.match(styles, /var\(--mono\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(styles, /\.hero-orbit-wrap\s*\{/);
  assert.doesNotMatch(styles, /\.orbit\s*\{/);
});

test('Sources and Method documents the publication and corrections standard', () => {
  assert.match(sources, /Evidence Desk publication standard/);
  assert.match(sources, /automated coverage inbox/i);
  assert.match(sources, /AI-assisted/i);
  assert.match(sources, /Corrections and revisions/);
  assert.match(sources, /does not copy article bodies/i);
});
