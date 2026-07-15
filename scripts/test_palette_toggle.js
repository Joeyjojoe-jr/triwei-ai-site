const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function makeElement() {
  return {
    attrs: Object.create(null),
    style: {},
    listeners: Object.create(null),
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getAttribute(name) { return this.attrs[name] ?? null; },
    addEventListener(name, fn) { this.listeners[name] = fn; }
  };
}

test('palette controller toggles, persists, and resets after storage is cleared', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'assets/js/palette-toggle.js'), 'utf8');
  const root = makeElement();
  root.setAttribute('data-palette', 'phosphor');
  const button = makeElement();
  const meta = makeElement();
  const storage = new Map();
  const windowListeners = Object.create(null);
  const dispatched = [];

  function CustomEvent(type, init) {
    this.type = type;
    this.detail = init && init.detail;
  }

  const windowObject = {
    CustomEvent,
    addEventListener(name, fn) { windowListeners[name] = fn; },
    dispatchEvent(event) { dispatched.push(event); return true; }
  };

  const context = {
    window: windowObject,
    document: {
      documentElement: root,
      getElementById(id) { return id === 'palette-toggle' ? button : null; },
      querySelector(selector) { return selector === 'meta[name="theme-color"]' ? meta : null; }
    },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); }
    },
    CustomEvent,
    console
  };

  vm.runInNewContext(source, context, { filename: 'palette-toggle.js' });

  assert.equal(root.getAttribute('data-theme'), 'dark');
  assert.equal(root.getAttribute('data-palette'), 'phosphor');
  assert.equal(button.getAttribute('data-next-palette'), 'amber');
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(button.getAttribute('aria-label'), 'Switch to amber color palette');

  button.listeners.click();
  assert.equal(root.getAttribute('data-palette'), 'amber');
  assert.equal(storage.get('triwei-palette'), 'amber');
  assert.equal(meta.getAttribute('content'), '#ff8800');
  assert.equal(button.getAttribute('data-next-palette'), 'phosphor');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(button.getAttribute('aria-label'), 'Switch to phosphor color palette');
  assert.equal(dispatched.at(-1).type, 'triwei:palettechange');
  assert.equal(dispatched.at(-1).detail.palette, 'amber');

  assert.equal(windowObject.triweiPalette.set('invalid'), 'phosphor');
  assert.equal(root.getAttribute('data-palette'), 'phosphor');
  assert.equal(storage.get('triwei-palette'), 'phosphor');

  windowListeners.storage({ key: 'triwei-palette', newValue: 'amber' });
  assert.equal(root.getAttribute('data-palette'), 'amber');

  windowListeners.storage({ key: 'triwei-palette', newValue: null });
  assert.equal(root.getAttribute('data-palette'), 'phosphor');
  assert.equal(meta.getAttribute('content'), '#33ff33');

  windowListeners.storage({ key: null, newValue: null });
  assert.equal(root.getAttribute('data-palette'), 'phosphor');

  windowListeners.storage({ key: 'unrelated-key', newValue: 'amber' });
  assert.equal(root.getAttribute('data-palette'), 'phosphor');
});

test('toggle label and preview are correct before deferred JavaScript executes', () => {
  const header = fs.readFileSync(path.join(repoRoot, '_includes/header.html'), 'utf8');
  const css = fs.readFileSync(path.join(repoRoot, 'assets/css/palette-toggle.css'), 'utf8');

  assert.match(
    header,
    /<span class="palette-toggle-label" aria-hidden="true"><\/span>/
  );
  assert.doesNotMatch(header, /data-palette-toggle-label/);
  assert.match(
    css,
    /\.palette-toggle-label::after\s*\{\s*content:\s*"AMBER";\s*\}/
  );
  assert.match(
    css,
    /html\[data-palette="amber"\] \.palette-toggle-label::after\s*\{\s*content:\s*"PHOSPHOR";\s*\}/
  );
  assert.match(
    css,
    /html\[data-palette="amber"\] \.palette-toggle\s*\{\s*--palette-toggle-preview:\s*#33ff33;\s*\}/
  );
});

test('reduced-motion holodeck renders only on state changes', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'assets/js/holodeck.js'), 'utf8');
  const root = makeElement();
  root.setAttribute('data-palette', 'phosphor');
  const listeners = Object.create(null);
  let lastScene = null;
  let lastRenderer = null;
  let animationFrameRequests = 0;

  class Disposable {
    constructor() { this.disposed = false; }
    dispose() { this.disposed = true; }
  }

  class Color {
    constructor(hex) { this.hex = hex; }
    setHex(hex) { this.hex = hex; }
  }

  class WebGLRenderer {
    constructor(options) {
      this.options = options;
      this.renderCount = 0;
      lastRenderer = this;
    }
    setPixelRatio(value) { this.pixelRatio = value; }
    setClearColor(color, alpha) { this.clearColor = color; this.clearAlpha = alpha; }
    setSize(width, height) { this.width = width; this.height = height; }
    render(scene, camera) {
      this.renderCount += 1;
      this.rendered = { scene, camera };
    }
  }

  class Scene {
    constructor() {
      this.children = [];
      lastScene = this;
    }
    add(object) { this.children.push(object); }
  }

  class Fog {
    constructor(color, near, far) { this.color = color; this.near = near; this.far = far; }
  }

  class PerspectiveCamera {
    constructor() {
      this.position = { set() {}, x: 0, y: 0 };
    }
    updateProjectionMatrix() {}
    lookAt() {}
  }

  class Group {
    constructor() {
      this.children = [];
      this.removed = [];
    }
    add(object) { this.children.push(object); }
    remove(object) {
      const index = this.children.indexOf(object);
      if (index !== -1) {
        this.children.splice(index, 1);
        this.removed.push(object);
      }
    }
  }

  class GridHelper {
    constructor(size, divisions, major, minor) {
      this.size = size;
      this.divisions = divisions;
      this.major = major;
      this.minor = minor;
      this.position = {};
      this.rotation = {};
      this.geometry = new Disposable();
      this.material = new Disposable();
    }
  }

  class PointLight {
    constructor(color, intensity, distance) {
      this.color = new Color(color);
      this.intensity = intensity;
      this.distance = distance;
      this.position = { set() {} };
    }
  }

  const THREE = {
    WebGLRenderer,
    Scene,
    Color,
    Fog,
    PerspectiveCamera,
    Group,
    GridHelper,
    PointLight
  };

  const windowObject = {
    THREE,
    innerWidth: 1280,
    innerHeight: 720,
    devicePixelRatio: 1,
    matchMedia() { return { matches: true }; },
    addEventListener(name, fn) { listeners[name] = fn; },
    requestAnimationFrame() { animationFrameRequests += 1; }
  };

  const context = {
    window: windowObject,
    document: {
      documentElement: root,
      getElementById(id) { return id === 'holodeck-canvas' ? {} : null; }
    },
    THREE,
    Math,
    Array,
    console
  };

  vm.runInNewContext(source, context, { filename: 'holodeck.js' });

  const room = lastScene.children.find((child) => child instanceof Group);
  const glow = lastScene.children.find((child) => child instanceof PointLight);
  assert.ok(room);
  assert.ok(glow);
  assert.equal(room.children.length, 6);
  assert.equal(room.children[0].major, 0x33ff66);
  assert.equal(room.children[0].minor, 0x0f8a34);
  assert.equal(lastRenderer.renderCount, 1);
  assert.equal(animationFrameRequests, 0);

  const originalChildren = room.children.slice();
  listeners['triwei:palettechange']({ detail: { palette: 'amber' } });
  assert.equal(room.children.length, 6);
  assert.equal(room.removed.length, 6);
  assert.ok(originalChildren.every((child) => child.geometry.disposed && child.material.disposed));
  assert.equal(room.children[0].major, 0xffa000);
  assert.equal(room.children[0].minor, 0x8a3f0f);
  assert.equal(glow.color.hex, 0xff7800);
  assert.equal(lastRenderer.renderCount, 2);
  assert.equal(animationFrameRequests, 0);

  windowObject.innerWidth = 1024;
  windowObject.innerHeight = 768;
  listeners.resize();
  assert.equal(lastRenderer.width, 1024);
  assert.equal(lastRenderer.height, 768);
  assert.equal(lastRenderer.renderCount, 3);
  assert.equal(animationFrameRequests, 0);
});
