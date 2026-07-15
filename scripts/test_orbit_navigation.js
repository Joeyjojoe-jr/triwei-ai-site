const test = require('node:test');
const assert = require('node:assert/strict');

const initOrbitNavigation = require('../assets/js/orbit-navigation.js');

class MockClassList {
  constructor() {
    this.values = new Set();
  }

  toggle(name, force) {
    if (force) this.values.add(name);
    else this.values.delete(name);
  }

  contains(name) {
    return this.values.has(name);
  }
}

class MockElement {
  constructor(attributes = {}) {
    this.attributes = { ...attributes };
    this.listeners = {};
    this.classList = new MockClassList();
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.focused = false;
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener(type, callback) {
    this.listeners[type] = callback;
  }

  dispatch(type, properties = {}) {
    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...properties,
    };
    this.listeners[type](event);
    return event;
  }

  click() {
    return this.dispatch('click');
  }

  focus() {
    this.focused = true;
  }
}

function makeFixture() {
  const main = new MockElement({
    'data-orbit-level': 'main',
    'data-orbit-title': 'Main folders',
  });
  const research = new MockElement({
    'data-orbit-level': 'research',
    'data-orbit-title': 'Research & Papers',
  });
  const opener = new MockElement({
    'data-orbit-open': 'research',
    'aria-expanded': 'false',
  });
  const back = new MockElement({ 'data-orbit-back': '' });
  const hint = new MockElement({ 'data-orbit-hint': '' });
  const status = new MockElement({ 'data-orbit-status': '' });
  const levels = { main, research };
  const events = [];

  const orbit = new MockElement({ 'data-orbit-nav': '' });
  orbit.querySelector = (selector) => {
    const levelMatch = selector.match(/^\[data-orbit-level="([^"]+)"\]$/);
    if (levelMatch) return levels[levelMatch[1]] || null;
    if (selector === '[data-orbit-back]') return back;
    if (selector === '[data-orbit-hint]') return hint;
    if (selector === '[data-orbit-status]') return status;
    return null;
  };
  orbit.querySelectorAll = (selector) => {
    if (selector === '[data-orbit-open]') return [opener];
    if (selector === '[data-orbit-level]') return [main, research];
    return [];
  };

  const document = {
    querySelector(selector) {
      return selector === '[data-orbit-nav]' ? orbit : null;
    },
  };
  const window = {
    triweiAnalytics: {
      track(name, payload) {
        events.push({ name, payload });
      },
    },
  };

  return { document, window, orbit, main, research, opener, back, hint, status, events };
}

test('opens a category subfolder ring and restores the main ring', () => {
  const fixture = makeFixture();
  initOrbitNavigation(fixture.document, fixture.window);

  assert.equal(fixture.main.hidden, false);
  assert.equal(fixture.research.hidden, true);
  assert.equal(fixture.back.disabled, true);
  assert.match(fixture.status.textContent, /choose one to explore/);

  const click = fixture.opener.dispatch('click');
  assert.equal(click.defaultPrevented, true);
  assert.equal(fixture.main.hidden, true);
  assert.equal(fixture.research.hidden, false);
  assert.equal(fixture.opener.getAttribute('aria-expanded'), 'true');
  assert.equal(fixture.back.disabled, false);
  assert.equal(fixture.orbit.classList.contains('is-drilled'), true);
  assert.match(fixture.status.textContent, /Research & Papers/);

  fixture.back.click();
  assert.equal(fixture.main.hidden, false);
  assert.equal(fixture.research.hidden, true);
  assert.equal(fixture.opener.getAttribute('aria-expanded'), 'false');
  assert.equal(fixture.back.disabled, true);
  assert.equal(fixture.opener.focused, true);
  assert.deepEqual(
    fixture.events.map((event) => event.name),
    ['orbit_folder_open', 'orbit_folder_back']
  );
});

test('Escape returns from a subfolder ring to the main folders', () => {
  const fixture = makeFixture();
  initOrbitNavigation(fixture.document, fixture.window);
  fixture.opener.click();

  const keydown = fixture.orbit.dispatch('keydown', { key: 'Escape' });
  assert.equal(keydown.defaultPrevented, true);
  assert.equal(fixture.main.hidden, false);
  assert.equal(fixture.back.disabled, true);
});

test('does nothing on pages without an orbit', () => {
  const result = initOrbitNavigation({ querySelector: () => null }, {});
  assert.equal(result, null);
});
