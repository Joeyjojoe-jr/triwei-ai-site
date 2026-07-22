const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

const publicPages = {
  about: 'about.md',
  signals: 'signals.md',
  hardware: 'hardware.md',
  industry: 'industry.md',
  ethics: 'ethics.md',
  sources: 'sources.md',
  corrections: 'corrections.md',
};

const intermediaryPattern = /news\.google\.com|google\.com\/search|bing\.com\/search|duckduckgo\.com\/\?q=/i;

test('every governed public page declares a publication status', () => {
  const policy = json('_data/publication_policy.json');

  assert.equal(policy.version, '1.0.0');
  assert.match(policy.effective_date, /^\d{4}-\d{2}-\d{2}$/);

  for (const [key, file] of Object.entries(publicPages)) {
    const page = read(file);
    assert.match(page, new RegExp(`publication_key:\\s*${key}`), `${file} missing publication_key`);
    assert.ok(policy.pages[key], `publication policy missing ${key}`);
    assert.ok(String(policy.pages[key].notice || '').trim(), `${key} missing notice`);
  }
});

test('shared publication disclosure is rendered through the default layout', () => {
  const layout = read('_layouts/default.html');
  const include = read('_includes/publication-status.html');
  const head = read('_includes/head.html');
  const css = read('assets/css/publication-standard.css');

  assert.match(layout, /include publication-status\.html/);
  assert.match(include, /site\.data\.publication_policy/);
  assert.match(include, /Corrections and revisions/);
  assert.match(head, /publication-standard\.css/);
  assert.match(css, /\.publication-status/);
  assert.match(css, /\.source-only-page/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('third-party synopsis and automated judgment fields are not rendered on governed pages', () => {
  const pageText = Object.values(publicPages).map(read).join('\n');

  const forbiddenTemplatePatterns = [
    /item\.summary/,
    /news-summary/,
    /event\.note/,
    /thread\.dek/,
    /thread\.status/,
    /observer\.signal/,
    /milestone\.detail/,
    /milestone\.headline/,
    /fab\.lesson/,
    /gpu\.best_read/,
    /material\.why/,
    /material\.how/,
    /ethics_tags/,
    /ethics-tags/,
    /coverage\.stories/,
    /coverage\.signals/,
  ];

  for (const pattern of forbiddenTemplatePatterns) {
    assert.doesNotMatch(pageText, pattern);
  }
});

test('official ethics register contains direct metadata-only sources', () => {
  const register = json('_data/ethics_sources.json');

  assert.ok(register.records.length >= 4);
  for (const record of register.records) {
    for (const field of [
      'id', 'source_title', 'author_or_institution', 'publisher_or_host',
      'source_type', 'published_display', 'source_url', 'checked_on',
    ]) {
      assert.equal(typeof record[field], 'string', `${record.id || 'record'} missing ${field}`);
      assert.ok(record[field].trim(), `${record.id || 'record'} has empty ${field}`);
    }
    assert.match(record.source_url, /^https:\/\//);
    assert.doesNotMatch(record.source_url, intermediaryPattern);
    for (const forbidden of ['summary', 'synopsis', 'analysis', 'context', 'verdict', 'rating']) {
      assert.equal(Object.hasOwn(record, forbidden), false, `${record.id} contains ${forbidden}`);
    }
  }
});

test('About, Sources, Corrections, and footer state the operational safeguards', () => {
  const about = read('about.md');
  const sources = read('sources.md');
  const corrections = read('corrections.md');
  const footer = read('_includes/footer.html');

  assert.match(about, /noncommercial source-linking and research website/i);
  assert.match(about, /incomplete folder or visible source-gap notice/i);
  assert.match(about, /does not provide legal, medical, financial/i);

  assert.match(sources, /Site-wide publication contract/);
  assert.match(sources, /does not publish AI-written synopses/i);
  assert.match(sources, /prefer an incomplete page/i);
  assert.match(sources, /human research, human authorship/i);
  assert.match(sources, /Withdrawal/);

  assert.match(corrections, /Corrections & Revisions/);
  assert.match(corrections, /No material corrections have been recorded/);
  assert.match(corrections, /Do not include private, confidential, privileged/i);
  assert.match(footer, /\/corrections\//);
});

test('public templates do not hard-code intermediary article URLs', () => {
  const files = [
    '_layouts/home.html',
    ...Object.values(publicPages),
  ];

  for (const file of files) {
    const source = read(file);
    const hardCodedHrefs = source.match(/href=["']https?:\/\/[^"']+/gi) || [];
    for (const href of hardCodedHrefs) {
      assert.doesNotMatch(href, intermediaryPattern, `${file} contains intermediary href`);
    }
  }
});
