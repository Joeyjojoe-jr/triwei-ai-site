const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const radar = require('../assets/js/triwei-radar.js');
const root = path.resolve(__dirname, '..');
const home = fs.readFileSync(path.join(root, '_layouts/home.html'), 'utf8');
const head = fs.readFileSync(path.join(root, '_includes/head.html'), 'utf8');
const style = fs.readFileSync(path.join(root, 'assets/css/triwei-radar.css'), 'utf8');

test('Radar is on the homepage without replacing the existing orbit', () => {
  assert.match(home, /class="radar-terminal"/);
  assert.match(home, /data-radar-generated/);
  assert.match(home, /data-orbit-nav/);
  assert.match(home, /triwei-logo\.png/);
  assert.ok(home.indexOf('class="radar-terminal"') < home.indexOf('data-orbit-nav'));
  assert.match(head, /assets\/css\/triwei-radar\.css/);
  assert.match(home, /assets\/js\/triwei-radar\.js/);
  assert.match(style, /var\(--accent\)/);
  assert.doesNotMatch(style, /\.orbit\s*\{/);
  assert.match(style, /prefers-reduced-motion/);
});

test('Radar publishes original headlines, link attribution, and no inferred verdict', () => {
  assert.match(home, /report\.title \| escape/);
  assert.match(home, /report\.source \| escape/);
  assert.match(home, /report\.link \| escape/);
  assert.match(home, /unless report\.link contains 'news\.google\.com'/);
  assert.match(home, /not independently assessed by TriWei/);
  assert.match(home, /news\.radar_items/);
  assert.match(home, /report\.source_channel/);
  assert.match(home, /data-radar-channel/);
  assert.doesNotMatch(home, /report\.summary/);
  assert.doesNotMatch(home, /report\.ethics_tags/);
  assert.doesNotMatch(home, /report\.trend_score/);
});

test('only direct HTTPS article links are eligible', () => {
  assert.equal(radar.direct('https://arxiv.org/abs/2601.00001'), true);
  assert.equal(radar.direct('https://news.google.com/rss/articles/id'), false);
  assert.equal(radar.direct('https://www.news.google.com/rss/articles/id'), false);
  assert.equal(radar.direct('javascript:alert(1)'), false);
  assert.equal(radar.direct('http://example.com/report'), false);
  assert.equal(radar.direct('https://localhost/report'), false);
});

test('24-hour freshness uses actual publication time, not RSS refresh time', () => {
  const now = Date.parse('2026-11-05T21:00:00Z');
  assert.equal(radar.ageHours('2026-11-05T20:00:00Z', now), 1);
  assert.equal(radar.ageHours('2026-11-03T20:00:00Z', now), 49);
  assert.equal(radar.ageHours('invalid', now), Infinity);
  assert.equal(radar.ageHours('2026-12-05T20:00:00Z', now), Infinity);
});

test('topic, query, local watch and time filters compose without granting verification', () => {
  const now = Date.parse('2026-11-05T21:00:00Z');
  const item = {
    url: 'https://arxiv.org/abs/2601.00001', topic: 'research',
    published: '2026-11-05T20:00:00Z', title: 'A model benchmark',
    source: 'arXiv'
  };
  const filter = { hours: 24, topic: 'research', query: 'BENCHMARK', savedOnly: true,
    saved: new Set([item.url]) };
  assert.equal(radar.matches(item, filter, now), true);
  assert.equal(radar.matches(
    { ...item, channel: 'organization' },
    { ...filter, channel: 'reporting' }, now), false);
  assert.equal(radar.matches(
    { ...item, channel: 'organization' },
    { ...filter, channel: 'organization' }, now), true);
  assert.equal(radar.matches(item, { ...filter, topic: 'labs' }, now), false);
  assert.equal(radar.matches(item, { ...filter, saved: new Set() }, now), false);
  assert.equal(radar.matches(item, { ...filter, query: 'impossible' }, now), false);
  assert.equal(radar.matches({ ...item, published: '2026-11-01T20:00:00Z' }, { ...filter, savedOnly: false }, now), false);
  assert.equal(radar.matches({ ...item, url: 'https://news.google.com/x' }, filter, now), false);
});

test('balanced display alternates categories rather than ranking by frequency', () => {
  const items = [
    {topic:'community',published:'2026-11-05T20:59:00Z',title:'C1'},
    {topic:'community',published:'2026-11-05T20:58:00Z',title:'C2'},
    {topic:'labs',published:'2026-11-05T20:50:00Z',title:'L1'},
    {topic:'research',published:'2026-11-05T20:45:00Z',title:'R1'},
  ];
  assert.deepEqual(radar.balancedOrder(items).map(x=>x.title),['L1','R1','C1','C2']);
});

test('Watched links bypass the current news window but remain filtered by source', () => {
  const now = Date.parse('2026-11-05T21:00:00Z');
  const item = {title:'Older research',source:'arXiv',topic:'research',channel:'research',
    published:'2026-08-01T00:00:00Z',url:'https://arxiv.org/abs/2601.00001'};
  const filter = {hours:24,topic:'all',channel:'all',query:'',savedOnly:true,
    saved:new Set([item.url])};
  assert.equal(radar.matches(item, filter, now), true);
  assert.equal(radar.matches(item, {...filter,savedOnly:false}, now), false);
  assert.equal(radar.matches(item, {...filter,saved:new Set()}, now), false);
});

test('archived link records reject unsafe URLs and malformed saved entries', () => {
  const win = {localStorage:{getItem:()=>JSON.stringify([
    {url:'javascript:alert(1)',title:'X'},
    {url:'https://arxiv.org/abs/2601.00001',title:'Verified only as a saved link',
      source:'arXiv',published:'2026-01-02T00:00:00Z',topic:'research',channel:'research'}
  ])}};
  const records = radar.readSavedRecords(win);
  assert.equal(records.size, 1);
  assert.equal(records.get('https://arxiv.org/abs/2601.00001').title,
    'Verified only as a saved link');
  assert.deepEqual(Array.from(radar.readSavedRecords(
    {localStorage:{getItem:()=>'{invalid'}}).values()), []);
});

test('malformed device watch storage cannot break Radar', () => {
  assert.deepEqual(Array.from(radar.readSaved({localStorage:{getItem:()=>'{broken'}})),[]);
  const saved = radar.readSaved({localStorage:{getItem:()=>JSON.stringify([
    'https://arxiv.org/abs/2601.00001', 'https://news.google.com/x', 10
  ])}});
  assert.deepEqual(Array.from(saved),['https://arxiv.org/abs/2601.00001']);
});
