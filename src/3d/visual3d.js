// Animated 3D scene: laser scan point cloud, then a BIM model in a shaded-with-edges view, ending on the render.
// Bundled to public/js/visual3d.js and loaded after the page, so it never delays the first paint.
import {
  BoxGeometry, BufferAttribute, BufferGeometry, Clock, DirectionalLight, DoubleSide, EdgesGeometry, Group, HemisphereLight,
  LineBasicMaterial, LineSegments, Mesh, MeshLambertMaterial, PerspectiveCamera, Plane, Points, PointsMaterial, Scene, SRGBColorSpace,
  Vector3, WebGLRenderer,
} from 'three';

// The building in the render: 30 m by 20 m, a brick ground floor and four glazed floors under a deep parapet.
const W = 30, D = 20, FLOORS = 5, FH = 3.6, H = FLOORS * FH, TOP = 19.5, BAY = W / 9;
// Camera pose fitted to the render (public/img/ibim-visual.webp), so the model lines up with it before the dissolve.
const START = { pos: [50, 20, 58], target: [0, 8.2, 0], fov: 27 };
const END = { pos: [26.786, 4.526, 55.953], target: [-2.536, 8.348, -1.786], fov: 33.385 };
const clamp = (v) => Math.max(0, Math.min(1, v));

// Brand easing curve: cubic-bezier(0.2, 0.8, 0.2, 1)
function ease(t) {
  let u = clamp(t);
  for (let i = 0; i < 6; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * 0.2 + 3 * (1 - u) * u * u * 0.2 + u * u * u;
    const dx = 3 * (1 - u) * (1 - u) * 0.2 + 3 * u * u * 0.8;
    if (Math.abs(x - t) < 1e-4) break;
    u -= (x - t) / (dx || 1);
    u = clamp(u);
  }
  return 3 * (1 - u) * (1 - u) * u * 0.8 + 3 * (1 - u) * u * u * 1.0 + u * u * u;
}

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

export function mount(root, { mode = 'journey', onReady }) {
  const base = root.querySelector('canvas');
  const canvas = document.createElement('canvas');
  canvas.className = 'model__3d';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', base.getAttribute('aria-label') || 'Interactive 3D building');

  // Transparent, so the drawing grid behind the hero shows through.
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  // Flat, even light: the look of a shaded model view, not a render.
  const key = new DirectionalLight(0xffffff, 1.5);
  key.position.set(-30, 60, 70);
  scene.add(key);
  scene.add(new HemisphereLight(0xffffff, 0xaab0aa, 1.5));

  const reveal = new Plane(new Vector3(0, -1, 0), 0);
  const clip = { clippingPlanes: [reveal] };
  // Surfaces sit a hair behind their edge lines, so the lines stay crisp.
  const flat = (color, extra = {}) => new MeshLambertMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...clip, ...extra });
  const M = {
    white: flat(0xeceee9), wall: flat(0xb4b8b1), frame: flat(0x30342f), inside: flat(0xcfd3cd), roof: flat(0x9a9f98),
    glass: flat(0x9fb9c4, { transparent: true, opacity: 0.3, depthWrite: false, side: DoubleSide }),
    green: flat(0x43903c),
  };

  const building = new Group();
  scene.add(building);
  const edgePositions = [], coursePositions = [];
  const pushEdges = (w, h, d, x, y, z, target) => {
    const e = new EdgesGeometry(new BoxGeometry(w, h, d));
    const p = e.attributes.position;
    for (let i = 0; i < p.count; i++) target.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z);
    e.dispose();
  };
  // Every element is a box with its edges drawn, as in a shaded-with-edges model view.
  const solid = (mat, w, h, d, x, y, z, edges = true) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (mat === M.glass) m.renderOrder = 2;
    building.add(m);
    if (edges) pushEdges(w, h, d, x, y, z, edgePositions);
    return m;
  };
  // A run along one facade: `u` is the distance along it, measured from the facade's centre.
  const FACADES = [
    { len: W, at: (u, off) => [u, D / 2 + off], along: 'x' }, { len: W, at: (u, off) => [-u, -D / 2 - off], along: 'x' },
    { len: D, at: (u, off) => [W / 2 + off, -u], along: 'z' }, { len: D, at: (u, off) => [-W / 2 - off, u], along: 'z' },
  ];
  const onFacade = (f, mat, u0, u1, y0, y1, depth, off = 0, edges = true) => {
    const [x, z] = f.at((u0 + u1) / 2, off), len = u1 - u0;
    return solid(mat, f.along === 'x' ? len : depth, y1 - y0, f.along === 'x' ? depth : len, x, (y0 + y1) / 2, z, edges);
  };

  // Ground slab, floor plates with their white spandrel bands, and the parapet around a roof deck.
  solid(M.white, W + 0.6, 0.3, D + 0.6, 0, 0.15, 0);
  for (let f = 1; f < FLOORS; f++) solid(M.white, W + 0.5, 0.6, D + 0.5, 0, f * FH, 0);
  FACADES.forEach((f) => onFacade(f, M.white, -f.len / 2 - 0.25, f.len / 2 + 0.25, H - 0.3, TOP, 0.5, 0));
  solid(M.roof, W, 0.2, D, 0, H + 0.3, 0, false);
  solid(M.inside, 10, 1, 6, -3, H + 0.9, -1);

  // Ground floor: brick walls between the entrance and window openings, drawn with their coursing.
  const OPENINGS = [[[-12.3, -10.2], [-4.6, 0.8], [4.3, 7.6]], [[-9, -6], [5, 8]], [[-6.5, -4.5], [0.5, 3]], [[-2, 1]]];
  FACADES.forEach((f, i) => {
    let from = -f.len / 2;
    [...OPENINGS[i], [f.len / 2, f.len / 2]].forEach(([a, b]) => {
      if (a > from) {
        onFacade(f, M.wall, from, a, 0.3, FH - 0.3, 0.3);
        for (let y = 0.6; y < FH - 0.3; y += 0.3) {
          const [x0, z0] = f.at(from, 0.152), [x1, z1] = f.at(a, 0.152);
          coursePositions.push(x0, y, z0, x1, y, z1);
        }
      }
      if (b > a) {
        // Glazed opening: glass, a frame around it, and a mullion every metre or so.
        onFacade(f, M.glass, a, b, 0.3, FH - 0.3, 0.04, 0, false);
        onFacade(f, M.frame, a, b, FH - 0.42, FH - 0.3, 0.14);
        const n = Math.max(1, Math.round((b - a) / 1.3));
        for (let k = 0; k <= n; k++) { const u = a + ((b - a) * k) / n; onFacade(f, M.frame, u - 0.05, u + 0.05, 0.3, FH - 0.42, 0.14); }
      }
      from = b;
    });
  });
  // Entrance canopy on two posts.
  solid(M.frame, 9.3, 0.2, 2.4, -2.5, 3.0, D / 2 + 1.2);
  for (const x of [-7, 2]) solid(M.frame, 0.14, 2.6, 0.14, x, 1.6, D / 2 + 2.2);

  // Upper floors: curtain walling between the bands, with columns, a core and services visible behind the glass.
  for (let f = 1; f < FLOORS; f++) {
    const y0 = f * FH + 0.3, y1 = (f + 1) * FH - 0.3;
    FACADES.forEach((face) => {
      const bays = Math.round(face.len / BAY), bay = face.len / bays;
      onFacade(face, M.glass, -face.len / 2, face.len / 2, y0, y1, 0.04, 0, false);
      onFacade(face, M.frame, -face.len / 2, face.len / 2, y0, y0 + 0.1, 0.16);
      onFacade(face, M.frame, -face.len / 2, face.len / 2, y1 - 0.1, y1, 0.16);
      for (let k = 0; k <= bays; k++) { const u = -face.len / 2 + k * bay; onFacade(face, M.frame, u - 0.06, u + 0.06, y0 + 0.1, y1 - 0.1, 0.16); }
    });
    for (const x of [-10, -10 / 3, 10 / 3, 10]) for (const z of [-5.5, 5.5]) solid(M.inside, 0.45, FH - 0.6, 0.45, x, f * FH + FH / 2, z);
    solid(M.inside, 6, FH - 0.6, 5, 7, f * FH + FH / 2, -2);
    solid(M.green, W - 8, 0.4, 1, -1, (f + 1) * FH - 0.75, 1.5);
  }

  const lines = (positions, color, opacity) => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    const l = new LineSegments(g, new LineBasicMaterial({ color, transparent: true, opacity, ...clip }));
    building.add(l);
    return l;
  };
  lines(edgePositions, 0x0b0d0b, 0.9);
  lines(coursePositions, 0x6f746d, 0.55);

  // Setting-out grid on the ground.
  const gridPos = [];
  for (let x = -W / 2 - 5; x <= W / 2 + 5.01; x += 5) gridPos.push(x, 0.02, -D / 2 - 8, x, 0.02, D / 2 + 8);
  for (let z = -D / 2 - 5; z <= D / 2 + 5.01; z += 5) gridPos.push(-W / 2 - 8, 0.02, z, W / 2 + 8, 0.02, z);
  const gridGeo = new BufferGeometry();
  gridGeo.setAttribute('position', new BufferAttribute(new Float32Array(gridPos), 3));
  const groundGrid = new LineSegments(gridGeo, new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 }));
  scene.add(groundGrid);

  // Structural frame, drawn on in light lines before the model fills in. Services are the one green element.
  const wirePositions = [], wireGreenPositions = [];
  for (let f = 0; f < FLOORS; f++) {
    pushEdges(W, 0.3, D, 0, (f + 1) * FH - 0.15, 0, wirePositions);
    for (const x of [-15, -10, -10 / 3, 10 / 3, 10, 15]) for (const z of [-10, -5.5, 5.5, 10]) pushEdges(0.42, FH - 0.3, 0.42, x, f * FH + FH / 2 - 0.15, z, wirePositions);
    for (const z of [-10, -5.5, 5.5, 10]) pushEdges(W, 0.45, 0.28, 0, (f + 1) * FH - 0.52, z, wirePositions);
    if (f) pushEdges(W - 8, 0.4, 1, -1, (f + 1) * FH - 0.75, 1.5, wireGreenPositions);
  }
  const wireGeo = new BufferGeometry();
  wireGeo.setAttribute('position', new BufferAttribute(new Float32Array(wirePositions), 3));
  const wire = new LineSegments(wireGeo, new LineBasicMaterial({ color: 0xdde2db, transparent: true, opacity: 0 }));
  scene.add(wire);
  const wireGreenGeo = new BufferGeometry();
  wireGreenGeo.setAttribute('position', new BufferAttribute(new Float32Array(wireGreenPositions), 3));
  const wireGreen = new LineSegments(wireGreenGeo, new LineBasicMaterial({ color: 0x7bc474, transparent: true, opacity: 0 }));
  scene.add(wireGreen);

  // Point cloud stage: intensity greyscale on ink, with a green sweep at the front of the scan.
  const scanPoints = [];
  const pt = (x, y, z) => {
    const n = (y / TOP) * 0.72 + 0.12 + (rnd() - 0.5) * 0.14;
    scanPoints.push({ x: x + (rnd() - 0.5) * 0.05, y, z: z + (rnd() - 0.5) * 0.05, n: clamp(n), a: Math.atan2(z - 34, x - 40) });
  };
  const density = small ? 0.65 : 1.1;
  const N = (n) => Math.round(n * density);
  // Glass returns few points, so the glazed bays read as gaps between the bands.
  const onGlass = (u, y) => y > FH + 0.3 && y < H - 0.3 && (y % FH) > 0.3 && (y % FH) < FH - 0.3 && (u + 900) % BAY > 0.12 && (u + 900) % BAY < BAY - 0.12;
  for (let i = 0; i < N(9500); i++) { const x = (rnd() - 0.5) * W, y = rnd() * TOP; if (!onGlass(x, y) || rnd() < 0.2) pt(x, y, D / 2); }
  for (let i = 0; i < N(6200); i++) { const z = (rnd() - 0.5) * D, y = rnd() * TOP; if (!onGlass(z, y) || rnd() < 0.2) pt(W / 2, y, z); }
  for (let i = 0; i < N(2500); i++) { const x = (rnd() - 0.5) * W, y = rnd() * TOP; pt(x, y, -D / 2); }
  for (let i = 0; i < N(1800); i++) { const z = (rnd() - 0.5) * D, y = rnd() * TOP; pt(-W / 2, y, z); }
  for (let i = 0; i < N(5200); i++) pt((rnd() - 0.5) * W, H + 0.4, (rnd() - 0.5) * D);
  for (let i = 0; i < N(11000); i++) { const x = (rnd() - 0.5) * 84, z = (rnd() - 0.5) * 68; if (Math.abs(x) > W / 2 || Math.abs(z) > D / 2) pt(x, 0.02, z); }
  scanPoints.sort((a, b) => a.a - b.a);

  const pos = new Float32Array(scanPoints.length * 3);
  const col = new Float32Array(scanPoints.length * 3);
  const baseGrey = new Float32Array(scanPoints.length);
  scanPoints.forEach((p, i) => {
    pos.set([p.x, p.y, p.z], i * 3);
    const v = 0.42 + p.n * 0.52;
    baseGrey[i] = v;
    col.set([v, v, v], i * 3);
  });
  const cloudGeo = new BufferGeometry();
  cloudGeo.setAttribute('position', new BufferAttribute(pos, 3));
  const colAttr = new BufferAttribute(col, 3);
  cloudGeo.setAttribute('color', colAttr);
  const cloud = new Points(cloudGeo, new PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, sizeAttenuation: true, depthWrite: false }));
  scene.add(cloud);

  // Camera and controls
  const camera = new PerspectiveCamera(START.fov, 4 / 3, 1, 900);
  const target = new Vector3();
  const mix = (a, b, k) => a + (b - a) * k;

  const labels = document.createElement('ol');
  labels.className = 'journey-steps';
  labels.setAttribute('aria-hidden', 'true');
  ['01 Point cloud', '02 BIM model', '03 Visualisation'].forEach((labelText, index) => {
    const li = document.createElement('li');
    li.textContent = labelText;
    li.dataset.stage = String(index);
    li.addEventListener('click', () => {
      const stageTimes = [1.8, 5.6, 10.8];
      t = stageTimes[index];
      offset = t;
      running = index < 2 && !reduced;
      if (running) clock.start();
      apply(t);
      needsDraw = true;
      wake();
    });
    labels.append(li);
  });
  if (mode === 'journey') root.append(labels);
  root.classList.add('model--has-3d');
  base.after(canvas);

  const photo = document.createElement('img');
  photo.className = 'model__photo';
  photo.src = '/img/ibim-visual.webp?v=3';
  photo.alt = 'Visualisation · illustrative, not a client project';
  photo.width = 1200; photo.height = 896;
  canvas.after(photo);

  const clock = new Clock(false);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = mode === 'visual' ? 6 : 0;
  const LENGTH = 11;
  let t = reduced ? LENGTH : start, running = !reduced, visible = true, active = true, needsDraw = true, offset = 0, raf = 0;
  let prevBandStart = 0, prevBandEnd = 0;

  function apply(time) {
    const seg = (a, b) => ease(clamp((time - a) / (b - a)));
    const cloudAlpha = 1 - seg(4.2, 6.8);
    cloud.visible = cloudAlpha > 0;
    cloud.material.opacity = cloudAlpha;

    const scanProgress = Math.min(1, 0.35 + 0.65 * ease(clamp(time / 3.6)));
    const shownCount = Math.floor(scanPoints.length * scanProgress);
    cloudGeo.setDrawRange(0, shownCount);

    // Highlight the active LiDAR scan wave front in iBIM signal green (#7BC474)
    if (cloud.visible) {
      for (let i = prevBandStart; i < prevBandEnd; i++) {
        const v = baseGrey[i];
        col[i * 3] = v; col[i * 3 + 1] = v; col[i * 3 + 2] = v;
      }
      if (scanProgress < 0.995 && !reduced) {
        const bandWidth = Math.floor(scanPoints.length * 0.045);
        const bStart = Math.max(0, shownCount - bandWidth);
        for (let i = bStart; i < shownCount; i++) {
          const k = (i - bStart) / bandWidth;
          const v = baseGrey[i];
          col[i * 3] = v + (0.48 - v) * k;
          col[i * 3 + 1] = v + (0.77 - v) * k;
          col[i * 3 + 2] = v + (0.45 - v) * k;
        }
        prevBandStart = bStart;
        prevBandEnd = shownCount;
      } else {
        prevBandStart = prevBandEnd = 0;
      }
      colAttr.needsUpdate = true;
    }

    const wireAlpha = seg(3.2, 5.2) * (1 - seg(6.4, 8.2));
    wire.material.opacity = wireAlpha * 0.65;
    wireGreen.material.opacity = wireAlpha;
    wire.visible = wireGreen.visible = wireAlpha > 0;

    // Progressive wireframe draw-on
    const wireDraw = ease(clamp((time - 3.0) / 2.4));
    wireGeo.setDrawRange(0, Math.floor((wirePositions.length / 3) * wireDraw));
    wireGreenGeo.setDrawRange(0, Math.floor((wireGreenPositions.length / 3) * wireDraw));

    // The model rises floor by floor through the frame.
    const build = seg(5.4, 8.4);
    reveal.constant = build * (TOP + 2.5);
    building.visible = build > 0;

    // The camera settles onto the viewpoint of the render before the render fades in over the model.
    const settle = seg(0, 8.6);
    camera.position.set(mix(START.pos[0], END.pos[0], settle), mix(START.pos[1], END.pos[1], settle), mix(START.pos[2], END.pos[2], settle));
    target.set(mix(START.target[0], END.target[0], settle), mix(START.target[1], END.target[1], settle), mix(START.target[2], END.target[2], settle));
    camera.fov = mix(START.fov, END.fov, settle);
    camera.updateProjectionMatrix();
    camera.lookAt(target);
    const dissolve = seg(8.8, 10.8);
    photo.style.opacity = String(dissolve);
    groundGrid.material.opacity = (1 - dissolve) * 0.16;
    groundGrid.visible = dissolve < 0.98;

    if (mode === 'journey') {
      const stage = time < 3.6 ? 0 : time < 9.4 ? 1 : 2;
      [...labels.children].forEach((li, i) => li.classList.toggle('is-active', i === stage));
    }
  }

  function resize() {
    const w = base.clientWidth, h = base.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsDraw = true;
    if (active) wake();
  }

  function frame() {
    raf = 0;
    if (!active || !visible) return;
    if (running) {
      t = Math.min(LENGTH, offset + clock.getElapsedTime());
      if (t >= LENGTH) running = false;
      apply(t);
      needsDraw = true;
    }
    if (needsDraw) { renderer.render(scene, camera); needsDraw = false; }
    if (running) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && active && visible) raf = requestAnimationFrame(frame); }

  new ResizeObserver(resize).observe(base);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { offset = t; clock.start(); wake(); } else { clock.stop(); }
  }).observe(canvas);

  resize();
  apply(t);
  renderer.render(scene, camera);
  offset = t;
  clock.start();
  wake();
  onReady?.();

  return {
    show() { active = true; photo.hidden = false; photo.style.transition = ''; photo.style.opacity = '0'; root.classList.add('model--has-3d'); labels.hidden = false; t = reduced ? LENGTH : start; offset = t; running = !reduced; apply(t); clock.start(); needsDraw = true; wake(); },
    hide() { active = false; running = false; photo.style.transition = 'none'; photo.style.opacity = '0'; photo.hidden = true; root.classList.remove('model--has-3d'); labels.hidden = true; },
  };
}
