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

test('Industry Atlas publishes source-dated registers before its workbench referral', () => {
  const page = read('industry.md');

  assert.match(page, /publication_key:\s*industry/);
  assert.match(page, /API price register/);
  assert.match(page, /Physical supply-chain source register/);
  assert.match(page, /Model-access and provenance source register/);
  assert.match(page, /Visual Industry Atlas features are being rebuilt/);
  assert.match(page, /workbench-industry-visualizations/);
  assert.match(page, /id="supply-chain"/);
  assert.match(page, /id="diffusion"/);
  assert.ok(page.indexOf('API price register') < page.indexOf('Visual Industry Atlas features are being rebuilt'));

  for (const forbidden of [
    /data-atlas-chart/,
    /coverage\.stories/,
    /coverage\.signals/,
    /milestone\.headline/,
    /milestone\.detail/,
    /stage\.why/,
    /stage\.choke/,
    /atlas-readout/,
    /industry-atlas-data/,
    /industry-atlas\.js/,
  ]) {
    assert.doesNotMatch(page, forbidden);
  }
});

test('Industry Atlas source URLs are direct and source fields stay attributable', () => {
  const data = JSON.parse(read('_data/industry.json'));

  assert.ok(data.model_value.models.length >= 4);
  for (const model of data.model_value.models) {
    assert.ok(isDirectHttps(model.source_url), `non-direct model price source: ${model.source_url}`);
    assert.ok(String(model.source_label || '').trim(), 'model price record missing source label');
  }

  assert.ok(data.supply_chain.stages.length >= 4);
  for (const stage of data.supply_chain.stages) {
    assert.ok(Array.isArray(stage.sources) && stage.sources.length > 0, `${stage.key} missing sources`);
    for (const source of stage.sources) {
      assert.ok(isDirectHttps(source.url), `non-direct supply source: ${source.url}`);
      assert.ok(String(source.label || '').trim(), 'supply source missing label');
    }
  }

  assert.ok(data.diffusion_watch.milestones.length >= 4);
  for (const milestone of data.diffusion_watch.milestones) {
    assert.ok(isDirectHttps(milestone.source_url), `non-direct diffusion source: ${milestone.source_url}`);
    assert.ok(String(milestone.source_label || '').trim(), 'diffusion record missing source label');
  }
});

test('homepage source register still links to the Industry and Hardware source registers', () => {
  const home = read('_layouts/home.html');
  const sources = JSON.parse(read('_data/home_sources.json'));

  assert.match(home, /Original pieces and public records/);
  assert.ok(sources.records.some((record) => record.tracker_url === '/industry/#diffusion'));
  assert.ok(sources.records.some((record) => record.tracker_url === '/hardware/'));
  for (const record of sources.records) {
    for (const forbidden of ['summary', 'synopsis', 'context', 'analysis']) {
      assert.equal(Object.hasOwn(record, forbidden), false, `${record.id} contains ${forbidden}`);
    }
  }
});
