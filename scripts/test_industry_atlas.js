const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('atlas page presents five question-led visualizations and both strategic watches', () => {
  const page = read('industry.md');
  const chartNames = ['topics', 'stack', 'models', 'adoption', 'economics'];

  assert.match(page, /permalink:\s*\/industry\//);
  chartNames.forEach((name) => {
    assert.match(page, new RegExp(`data-atlas-chart="${name}"`));
  });
  assert.match(page, /Coverage signal/);
  assert.match(page, /Industry measure/);
  assert.match(page, /id="supply-chain"/);
  assert.match(page, /PRODUCTION SPLITS INTO PARALLEL ROUTES/);
  assert.match(page, /supply-flow-convergence/);
  assert.match(page, /include supply-stage\.html stage=stage/);
  assert.match(page, /supply\.destinations/);
  assert.match(page, /Billing address ≠ final destination/);
  assert.match(page, /id="diffusion"/);
  assert.match(page, /evidence-\{\{ milestone\.evidence_class \}\}/);
  assert.match(page, /diffusion\.evidence_classes/);
  assert.match(page, /matching output style or benchmark performance is not proof/i);
  assert.match(page, /model_value\.freshness == "expired"/);
  assert.match(page, /Historical research snapshot — not current buying guidance/);
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
  assert.match(css, /\.supply-chain-flow/);
  assert.match(css, /\.supply-parallel-stack/);
  assert.match(css, /\.supply-flow-convergence/);
  assert.match(css, /\.supply-choke-critical/);
  assert.match(css, /\.model-profile-button/);
  assert.match(css, /\.diffusion-timeline/);
  assert.match(css, /\.evidence-provider_claim/);
});

test('homepage promotes the strategic diffusion evidence thread', () => {
  const home = read('_layouts/home.html');
  const evidence = read('_data/home_evidence.json');

  assert.match(home, /Living evidence threads/);
  assert.match(evidence, /Model access and provenance/);
  assert.match(evidence, /\/industry\/#diffusion/);
  assert.match(evidence, /Released artifacts, future commitments, disclosed distillation, and provider-attributed claims remain separate evidence classes/);
});

test('homepage promotes the physical AI supply-chain evidence thread', () => {
  const home = read('_layouts/home.html');
  const evidence = read('_data/home_evidence.json');

  assert.match(home, /Living evidence threads/);
  assert.match(evidence, /Physical AI supply chain/);
  assert.match(evidence, /\/hardware\//);
  assert.match(evidence, /8 production stages/);
});
