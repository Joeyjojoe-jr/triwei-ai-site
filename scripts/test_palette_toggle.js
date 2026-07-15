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

test('palette controller toggles, persists, and updates accessible state', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'assets/js/palette-toggle.js'), 'utf8');
  const root = makeElement();
  root.setAttribute('data-palette', 'phosphor');
  const label = { textContent: '' };
  const button = makeElement();
  button.querySelector = (selector) => selector === '[data-palette-toggle-label]' ? label : null;
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
  assert.equal(label.textContent, 'AMBER');

  button.listeners.click();
  assert.equal(root.getAttribute('data-palette'), 'amber');
  assert.equal(storage.get('triwei-palette'), 'amber');
  assert.equal(meta.getAttribute('content'), '#ff8800');
  assert.equal(button.getAttribute('data-next-palette'), 'phosphor');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(label.textContent, 'PHOSPHOR');
  assert.equal(dispatched.at(-1).type, 'triwei:palettechange');
  assert.equal(dispatched.at(-1).detail.palette, 'amber');

  assert.equal(windowObject.triweiPalette.set('invalid'), 'phosphor');
  assert.equal(root.getAttribute('data-palette'), 'phosphor');
  assert.equal(storage.get('triwei-palette'), 'phosphor');

  windowListeners.storage({ key: 'triwei-palette', newValue: 'amber' });
  assert.equal(root.getAttribute('data-palette'), 'amber');
});

test('holodeck rebuilds all six grids with amber colors', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'assets/js/holodeck.js'), 'utf8');
  const root = makeElement();
  root.setAttribute('data-palette', 'phosphor');
  const listeners = Object.create(null);
  let lastScene = null;
  let lastRenderer = null;

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
      lastRenderer = this;
    }
    setPixelRatio(value) { this.pixelRatio = value; }
    setClearColor(color, alpha) { this.clearColor = color; this.clearAlpha = alpha; }
    setSize(width, height) { this.width = width; this.height = height; }
    render(scene, camera) { this.rendered = { scene, camera }; }
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
    constructor() { this.children = []; }
    add(object) { this.children.push(object); }
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
    requestAnimationFrame() {}
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

  listeners['triwei:palettechange']({ detail: { palette: 'amber' } });
  assert.equal(room.children.length, 6);
  assert.equal(room.children[0].major, 0xffa000);
  assert.equal(room.children[0].minor, 0x8a3f0f);
  assert.equal(glow.color.hex, 0xff7800);
  assert.ok(lastRenderer.rendered);
});
