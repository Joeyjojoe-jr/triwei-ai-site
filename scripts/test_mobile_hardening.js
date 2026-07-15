const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const loaderSource = fs.readFileSync(path.join(repoRoot, 'assets/js/holodeck-loader.js'), 'utf8');

function makeRoot() {
  return {
    attrs: Object.create(null),
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getAttribute(name) { return this.attrs[name] ?? null; }
  };
}

function runLoader(options = {}) {
  const root = makeRoot();
  root.setAttribute('data-holodeck', options.initialMode || 'pending');
  const canvas = {
    hidden: false,
    attrs: Object.create(null),
    setAttribute(name, value) { this.attrs[name] = String(value); }
  };
  const appended = [];
  const loaderScript = {
    getAttribute(name) {
      if (name === 'data-three-src') return 'https://cdn.example/three.min.js';
      if (name === 'data-holodeck-src') return '/assets/js/holodeck.js';
      return null;
    }
  };
  const documentObject = {
    documentElement: root,
    currentScript: loaderScript,
    head: {
      appendChild(script) { appended.push(script); }
    },
    getElementById(id) { return id === 'holodeck-canvas' ? canvas : null; },
    createElement() { return {}; }
  };
  const windowObject = {
    navigator: options.navigator || { deviceMemory: 8 },
    WebGLRenderingContext: function WebGLRenderingContext() {},
    matchMedia(query) {
      return { matches: Boolean(options.media && options.media(query)) };
    }
  };

  vm.runInNewContext(loaderSource, {
    window: windowObject,
    document: documentObject,
    Boolean,
    console
  }, { filename: 'holodeck-loader.js' });

  return { root, canvas, appended, windowObject };
}

test('mobile and touch clients stay in static mode without loading WebGL scripts', () => {
  const result = runLoader({
    media(query) {
      return query === '(max-width: 900px)' || query === '(pointer: coarse)';
    }
  });

  assert.equal(result.root.getAttribute('data-holodeck'), 'static');
  assert.equal(result.root.getAttribute('data-holodeck-reason'), 'mobile-or-constrained');
  assert.equal(result.canvas.hidden, true);
  assert.equal(result.appended.length, 0);
});

test('desktop clients load Three.js and holodeck sequentially', () => {
  const result = runLoader();

  assert.equal(result.root.getAttribute('data-holodeck'), 'loading');
  assert.equal(result.appended.length, 1);
  assert.equal(result.appended[0].src, 'https://cdn.example/three.min.js');

  result.windowObject.THREE = {};
  result.appended[0].onload();
  assert.equal(result.appended.length, 2);
  assert.equal(result.appended[1].src, '/assets/js/holodeck.js');

  result.root.setAttribute('data-holodeck', 'webgl');
  result.appended[1].onload();
  assert.equal(result.root.getAttribute('data-holodeck'), 'webgl');
});

test('failed desktop dependency load falls back safely', () => {
  const result = runLoader();
  result.appended[0].onerror();

  assert.equal(result.root.getAttribute('data-holodeck'), 'static');
  assert.equal(result.root.getAttribute('data-holodeck-reason'), 'three-script-failed');
  assert.equal(result.canvas.hidden, true);
});

test('templates and styles contain mobile safety controls', () => {
  const head = fs.readFileSync(path.join(repoRoot, '_includes/head.html'), 'utf8');
  const layout = fs.readFileSync(path.join(repoRoot, '_layouts/default.html'), 'utf8');
  const css = fs.readFileSync(path.join(repoRoot, 'assets/css/mobile-hardening.css'), 'utf8');
  const holodeck = fs.readFileSync(path.join(repoRoot, 'assets/js/holodeck.js'), 'utf8');

  assert.match(head, /viewport-fit=cover/);
  assert.match(head, /data-holodeck/);
  assert.match(head, /mobile-hardening\.css/);
  assert.match(layout, /id="holodeck-canvas"[^>]*hidden/);
  assert.match(layout, /holodeck-loader\.js/);
  assert.doesNotMatch(layout, /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js/);

  assert.match(css, /html\[data-holodeck\] \.hd-room\s*\{\s*display:\s*none !important;/);
  assert.match(css, /@media \(max-width: 900px\), \(pointer: coarse\), \(hover: none\)/);
  assert.match(css, /background:\s*var\(--surface\);\s*background:\s*color-mix/);
  assert.match(css, /\.orbit\s*\{[\s\S]*?height:\s*auto !important;[\s\S]*?flex-direction:\s*column;/);
  assert.match(css, /\.orbit-folder\s*\{[\s\S]*?position:\s*static !important;[\s\S]*?transform:\s*none !important;/);
  assert.match(css, /backdrop-filter:\s*none/);
  assert.match(css, /animation:\s*none !important/);

  assert.match(holodeck, /preserveDrawingBuffer:\s*false/);
  assert.match(holodeck, /powerPreference:\s*'low-power'/);
  assert.match(holodeck, /failIfMajorPerformanceCaveat:\s*true/);
  assert.match(holodeck, /webglcontextlost/);
  assert.match(holodeck, /visibilitychange/);
  assert.match(holodeck, /1000 \/ 30/);

  const initialExposeIndex = holodeck.lastIndexOf("root.setAttribute('data-holodeck', 'webgl')");
  const pagehideIndex = holodeck.indexOf("window.addEventListener('pagehide'");
  assert.ok(initialExposeIndex > pagehideIndex, 'WebGL mode must be exposed only after initialization and lifecycle hooks');
});
