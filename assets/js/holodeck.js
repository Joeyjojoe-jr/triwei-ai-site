/* TriWei AI — WebGL holodeck background.
   A gridded room in real 3D. Green lines, fog depth, subtle mouse
   parallax + gentle drift so it feels like standing inside the room.
   Falls back silently to the CSS room if Three.js/WebGL is unavailable. */
(function () {
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
  } catch (e) { return; } // no WebGL -> CSS fallback shows

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 45, 190);

  var camera = new THREE.PerspectiveCamera(
    72, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 32);

  var GREEN = 0x33ff66;   // bright center/major lines
  var DIM   = 0x0f8a34;   // dimmer grid lines
  var SIZE = 160, DIV = 32, HALF = SIZE / 2;

  var room = new THREE.Group();
  function grid() { return new THREE.GridHelper(SIZE, DIV, GREEN, DIM); }

  var floor = grid(); floor.position.y = -HALF; room.add(floor);
  var ceil  = grid(); ceil.position.y = HALF;  room.add(ceil);
  var left  = grid(); left.rotation.z = Math.PI / 2; left.position.x = -HALF; room.add(left);
  var right = grid(); right.rotation.z = Math.PI / 2; right.position.x = HALF; room.add(right);
  var back  = grid(); back.rotation.x = Math.PI / 2; back.position.z = -HALF; room.add(back);
  var front = grid(); front.rotation.x = Math.PI / 2; front.position.z = HALF; room.add(front);
  scene.add(room);

  // soft green glow orb near the vanishing point for depth
  var glow = new THREE.PointLight(0x22ff66, 1, 0);

  var tx = 0, ty = 0, mx = 0, my = 0, t = 0;
  window.addEventListener('mousemove', function (e) {
    tx = (e.clientX / window.innerWidth) - 0.5;
    ty = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  function frame() {
    requestAnimationFrame(frame);
    if (!reduce) {
      t += 0.0016;
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      camera.position.x = mx * 16 + Math.sin(t) * 3.2;
      camera.position.y = -my * 11 + Math.cos(t * 0.8) * 2.2;
    }
    camera.lookAt(0, 0, -HALF);
    renderer.render(scene, camera);
  }
  frame();
})();
