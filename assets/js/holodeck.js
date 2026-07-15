/* TriWei AI — desktop WebGL holodeck background.
   Constrained clients are filtered by holodeck-loader.js before this file
   loads. The renderer still uses conservative settings and clean fallback. */
(function () {
  'use strict';

  if (!window.THREE) return;

  var root = document.documentElement;
  var canvas = document.getElementById('holodeck-canvas');
  if (!canvas) return;

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var renderer;
  var contextLost = false;
  var animationFrameId = 0;
  var running = false;
  var lastFrameTime = 0;
  var FRAME_INTERVAL = 1000 / 30;

  function useFallback(reason) {
    contextLost = true;
    stopAnimation();
    canvas.hidden = true;
    root.setAttribute('data-holodeck', 'static');
    root.setAttribute('data-holodeck-reason', reason || 'renderer-failed');
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true
    });
  } catch (error) {
    useFallback('renderer-construction-failed');
    return;
  }

  function viewportSize() {
    var doc = document.documentElement || {};
    return {
      width: Math.max(1, window.innerWidth || doc.clientWidth || 1),
      height: Math.max(1, window.innerHeight || doc.clientHeight || 1)
    };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 1);

  var initialSize = viewportSize();
  var viewWidth = initialSize.width;
  var viewHeight = initialSize.height;
  renderer.setSize(viewWidth, viewHeight, false);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 45, 190);

  var camera = new THREE.PerspectiveCamera(
    72,
    viewWidth / viewHeight,
    0.1,
    500
  );
  camera.position.set(0, 0, 32);

  var SIZE = 160;
  var DIVISIONS = 32;
  var HALF = SIZE / 2;
  var palettes = {
    phosphor: {
      major: 0x33ff66,
      minor: 0x0f8a34,
      glow: 0x22ff66
    },
    amber: {
      major: 0xffa000,
      minor: 0x8a3f0f,
      glow: 0xff7800
    }
  };

  var room = new THREE.Group();
  scene.add(room);

  var glow = new THREE.PointLight(palettes.phosphor.glow, 1, 0);
  glow.position.set(0, 0, -HALF + 18);
  scene.add(glow);

  function currentPalette() {
    return root.getAttribute('data-palette') === 'amber' ? 'amber' : 'phosphor';
  }

  function disposeObject(object) {
    if (object.geometry && object.geometry.dispose) {
      object.geometry.dispose();
    }
    if (object.material) {
      var materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(function (material) {
        if (material && material.dispose) material.dispose();
      });
    }
  }

  function clearRoom() {
    while (room.children.length > 0) {
      var child = room.children[0];
      room.remove(child);
      disposeObject(child);
    }
  }

  function makeGrid(colors) {
    return new THREE.GridHelper(SIZE, DIVISIONS, colors.major, colors.minor);
  }

  function renderScene() {
    if (contextLost) return;
    camera.lookAt(0, 0, -HALF);
    renderer.render(scene, camera);
  }

  function buildRoom(paletteName) {
    var colors = palettes[paletteName] || palettes.phosphor;
    clearRoom();

    var floor = makeGrid(colors);
    floor.position.y = -HALF;
    room.add(floor);

    var ceiling = makeGrid(colors);
    ceiling.position.y = HALF;
    room.add(ceiling);

    var left = makeGrid(colors);
    left.rotation.z = Math.PI / 2;
    left.position.x = -HALF;
    room.add(left);

    var right = makeGrid(colors);
    right.rotation.z = Math.PI / 2;
    right.position.x = HALF;
    room.add(right);

    var back = makeGrid(colors);
    back.rotation.x = Math.PI / 2;
    back.position.z = -HALF;
    room.add(back);

    var front = makeGrid(colors);
    front.rotation.x = Math.PI / 2;
    front.position.z = HALF;
    room.add(front);

    glow.color.setHex(colors.glow);
  }

  buildRoom(currentPalette());
  renderScene();

  window.addEventListener('triwei:palettechange', function (event) {
    var palette = event.detail && event.detail.palette;
    buildRoom(palette === 'amber' ? 'amber' : 'phosphor');
    renderScene();
  });

  var targetX = 0;
  var targetY = 0;
  var mouseX = 0;
  var mouseY = 0;
  var time = 0;

  window.addEventListener('mousemove', function (event) {
    targetX = (event.clientX / viewWidth) - 0.5;
    targetY = (event.clientY / viewHeight) - 0.5;
  }, { passive: true });

  function frame(timestamp) {
    if (!running || contextLost || document.hidden) return;
    animationFrameId = window.requestAnimationFrame(frame);

    if (timestamp && lastFrameTime && timestamp - lastFrameTime < FRAME_INTERVAL) {
      return;
    }
    lastFrameTime = timestamp || 0;

    time += 0.0016;
    mouseX += (targetX - mouseX) * 0.04;
    mouseY += (targetY - mouseY) * 0.04;
    camera.position.x = mouseX * 16 + Math.sin(time) * 3.2;
    camera.position.y = -mouseY * 11 + Math.cos(time * 0.8) * 2.2;
    renderScene();
  }

  function startAnimation() {
    if (reduce || running || contextLost || document.hidden || !window.requestAnimationFrame) return;
    running = true;
    animationFrameId = window.requestAnimationFrame(frame);
  }

  function stopAnimation() {
    running = false;
    if (animationFrameId && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = 0;
  }

  function resizeRenderer() {
    if (contextLost) return;
    var size = viewportSize();
    viewWidth = size.width;
    viewHeight = size.height;
    camera.aspect = viewWidth / viewHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewWidth, viewHeight, false);
    renderScene();
  }

  window.addEventListener('resize', resizeRenderer, { passive: true });

  if (document.addEventListener) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAnimation();
      } else {
        renderScene();
        startAnimation();
      }
    });
  }

  if (canvas.addEventListener) {
    canvas.addEventListener('webglcontextlost', function (event) {
      if (event && event.preventDefault) event.preventDefault();
      useFallback('webgl-context-lost');
    }, false);

    canvas.addEventListener('webglcontextrestored', function () {
      contextLost = false;
      root.setAttribute('data-holodeck', 'webgl');
      if (root.removeAttribute) root.removeAttribute('data-holodeck-reason');
      canvas.hidden = false;
      resizeRenderer();
      startAnimation();
    }, false);
  }

  window.addEventListener('pagehide', function (event) {
    stopAnimation();
    if (!event || !event.persisted) {
      clearRoom();
      if (renderer && renderer.dispose) renderer.dispose();
    }
  });

  window.addEventListener('pageshow', function () {
    if (!contextLost) {
      renderScene();
      startAnimation();
    }
  });

  root.setAttribute('data-holodeck', 'webgl');
  if (root.removeAttribute) root.removeAttribute('data-holodeck-reason');
  canvas.hidden = false;
  startAnimation();

  window.triweiHolodeck = {
    start: startAnimation,
    stop: stopAnimation,
    isWebGL: function () {
      return !contextLost;
    }
  };
})();
