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

test('homepage rotating topic opens current direct-source research links without promising historical analysis', () => {
  const home = read('_layouts/home.html');

  assert.match(home, /class="hero-cycle"[^>]+href="#cat-research"/);
  assert.match(home, /Rotation reflects collected coverage, not importance or truth/);
  assert.doesNotMatch(home, /trace its earlier signals/i);
  assert.doesNotMatch(home, /through AI signal history/i);
});

test('Research Lineage Library publishes arXiv metadata without paper summaries or influence claims', () => {
  const page = read('signals.md');
  const data = JSON.parse(read('_data/research_lineage.json'));

  assert.match(page, /publication_key:\s*signals/);
  assert.match(page, /research_lineage:\s*true/);
  assert.match(page, /Research Lineage Library/);
  assert.match(page, /Open arXiv abstract/);
  assert.match(page, /paper\.title/);
  assert.match(page, /paper\.authors/);
  assert.match(page, /paper\.submitted_on/);
  assert.match(page, /paper\.source_url/);
  assert.match(page, /Chronological order only/);
  assert.match(page, /lineage\.curation\.assistant_attribution/);
  assert.match(data.curation.assistant_attribution, /OpenAI ChatGPT/);

  for (const forbidden of [
    /paper\.summary/,
    /paper\.abstract/,
    /paper\.synopsis/,
    /paper\.importance/,
    /paper\.influence/,
    /paper\.relationship/,
    /event\.note/,
    /thread\.dek/,
  ]) {
    assert.doesNotMatch(page, forbidden);
  }

  assert.ok(data.papers.length >= 8, 'expected at least eight verified scholarly records');
  assert.ok(data.paths.length >= 3, 'expected at least three provisional reading paths');

  const paperIds = new Set();
  for (const paper of data.papers) {
    assert.match(paper.id, /^\d{4}\.\d{4,5}$/);
    assert.equal(paper.source_url, `https://arxiv.org/abs/${paper.id}`);
    assert.match(paper.submitted_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(paper.checked_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Array.isArray(paper.authors) && paper.authors.length > 0, `${paper.id} missing authors`);
    assert.ok(String(paper.title || '').trim(), `${paper.id} missing title`);
    assert.ok(!paperIds.has(paper.id), `duplicate paper id: ${paper.id}`);
    paperIds.add(paper.id);

    for (const forbidden of [
      'summary', 'abstract', 'synopsis', 'importance', 'impact', 'influence',
      'relationship', 'analysis', 'conclusion', 'why_it_matters',
    ]) {
      assert.equal(Object.hasOwn(paper, forbidden), false, `${paper.id} contains ${forbidden}`);
    }
  }

  for (const readingPath of data.paths) {
    assert.ok(Array.isArray(readingPath.paper_ids) && readingPath.paper_ids.length > 0);
    for (const paperId of readingPath.paper_ids) {
      assert.ok(paperIds.has(paperId), `${readingPath.id} references unknown paper ${paperId}`);
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

test('research and source-only presentation support narrow screens and reduced motion', () => {
  const publicationCss = read('assets/css/publication-standard.css');
  const researchCss = read('assets/css/research-lineage.css');

  assert.match(publicationCss, /@media \(max-width: 820px\)/);
  assert.match(publicationCss, /overflow-x:\s*auto/);
  assert.match(publicationCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(publicationCss, /\.source-only-table/);
  assert.match(publicationCss, /\.withheld-notice/);

  assert.match(researchCss, /\.lineage-track/);
  assert.match(researchCss, /TIME ORDER ONLY/);
  assert.match(researchCss, /overflow-x:\s*auto/);
  assert.match(researchCss, /@media \(max-width: 820px\)/);
  assert.match(researchCss, /@media \(prefers-reduced-motion: reduce\)/);
});

test('primary navigation exposes Research Library and AI Hardware', () => {
  const header = read('_includes/header.html');

  assert.match(header, />Research Library<\/a>/);
  assert.match(header, />AI Hardware<\/a>/);
});
