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
    /paper\.summary/,
    /paper\.abstract/,
    /paper\.synopsis/,
    /paper\.importance/,
    /paper\.influence/,
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

test('research lineage register contains direct scholarly metadata only', () => {
  const register = json('_data/research_lineage.json');

  assert.match(register.verified_on, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(register.curation.assistant_attribution, /OpenAI ChatGPT/);
  assert.match(register.curation.sequence_rule, /does not establish/i);
  assert.match(register.curation.peer_review_boundary, /does not by itself establish peer review/i);

  const ids = new Set();
  for (const paper of register.papers) {
    for (const field of ['id', 'title', 'submitted_on', 'source_url', 'source_host', 'record_type', 'checked_on']) {
      assert.equal(typeof paper[field], 'string', `${paper.id || 'paper'} missing ${field}`);
      assert.ok(paper[field].trim(), `${paper.id || 'paper'} has empty ${field}`);
    }
    assert.equal(paper.source_url, `https://arxiv.org/abs/${paper.id}`);
    assert.equal(paper.source_host, 'arXiv');
    assert.ok(Array.isArray(paper.authors) && paper.authors.length > 0, `${paper.id} missing authors`);
    assert.ok(!ids.has(paper.id), `duplicate paper id: ${paper.id}`);
    ids.add(paper.id);

    for (const forbidden of [
      'summary', 'abstract', 'synopsis', 'analysis', 'importance', 'impact',
      'influence', 'relationship', 'conclusion', 'why_it_matters',
    ]) {
      assert.equal(Object.hasOwn(paper, forbidden), false, `${paper.id} contains ${forbidden}`);
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
  assert.match(sources, /Research Lineage Library/);
  assert.match(sources, /OpenAI ChatGPT/);
  assert.match(sources, /Withdrawal/);

  assert.match(corrections, /Corrections & Revisions/);
  assert.match(corrections, /No material corrections have been recorded/);
  assert.match(corrections, /Do not include private, confidential, privileged/i);
  assert.match(footer, /\/corrections\//);
  assert.match(footer, />Research Library<\/a>/);
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
