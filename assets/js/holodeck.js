/* TriWei AI — WebGL holodeck background.
   A gridded room in real 3D with palette-aware lines, fog depth,
   subtle mouse parallax, and gentle drift. Falls back to CSS when
   Three.js or WebGL is unavailable. */
(function () {
  'use strict';

  if (!window.THREE) return;
  var canvas = document.getElementById('holodeck-canvas');
  if (!canvas) return;

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
  } catch (error) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 45, 190);

  var camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
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
    return document.documentElement.getAttribute('data-palette') === 'amber'
      ? 'amber'
      : 'phosphor';
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
    while (room.children.length) {
      var child = room.children.pop();
      disposeObject(child);
    }
  }

  function makeGrid(colors) {
    return new THREE.GridHelper(SIZE, DIVISIONS, colors.major, colors.minor);
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
    if (reduce) render();
  }

  buildRoom(currentPalette());

  window.addEventListener('triwei:palettechange', function (event) {
    var palette = event.detail && event.detail.palette;
    buildRoom(palette === 'amber' ? 'amber' : 'phosphor');
  });

  var targetX = 0;
  var targetY = 0;
  var mouseX = 0;
  var mouseY = 0;
  var time = 0;

  window.addEventListener('mousemove', function (event) {
    targetX = (event.clientX / window.innerWidth) - 0.5;
    targetY = (event.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  function frame() {
    window.requestAnimationFrame(frame);
    if (!reduce) {
      time += 0.0016;
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;
      camera.position.x = mouseX * 16 + Math.sin(time) * 3.2;
      camera.position.y = -mouseY * 11 + Math.cos(time * 0.8) * 2.2;
    }
    camera.lookAt(0, 0, -HALF);
    renderer.render(scene, camera);
  }

  frame();
})();
