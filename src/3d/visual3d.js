// Animated 3D scene: laser scan point cloud, then 3D model, ending on a path-traced render.
// Bundled to public/js/visual3d.js and loaded after the page, so it never delays the first paint.
import {
  ACESFilmicToneMapping, BackSide, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CircleGeometry, Clock, Color,
  CylinderGeometry, DirectionalLight, EdgesGeometry, EquirectangularReflectionMapping, Fog, Group, HemisphereLight,
  IcosahedronGeometry, InstancedMesh, LineBasicMaterial, LineSegments, Matrix4, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  MeshStandardMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, Plane, PlaneGeometry, PMREMGenerator, Points,
  PointsMaterial, RepeatWrapping, Scene, SphereGeometry, SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three';

const W = 30, D = 18, FLOORS = 5, FH = 3.6, H = FLOORS * FH, BAY = 3;
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

function canvasTexture(size, draw, repeatX = 1, repeatY = repeatX, colour = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 8;
  if (colour) t.colorSpace = SRGBColorSpace;
  return t;
}

function speckle(ctx, size, base, amount, count) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < count; i++) {
    const v = rnd() < 0.5 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${rnd() * amount})`;
    const s = 1 + rnd() * 2.5;
    ctx.fillRect(rnd() * size, rnd() * size, s, s);
  }
}

function brickDraw(ctx, size, heightMap) {
  ctx.fillStyle = heightMap ? '#555' : '#b9b2a6';
  ctx.fillRect(0, 0, size, size);
  const rows = 16, cols = 8, bh = size / rows, bw = size / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = -1; c < cols; c++) {
      const x = c * bw + (r % 2 ? bw / 2 : 0);
      if (heightMap) ctx.fillStyle = '#fff';
      else ctx.fillStyle = `hsl(${12 + rnd() * 10}, ${34 + rnd() * 16}%, ${30 + rnd() * 14}%)`;
      ctx.fillRect(x + 1.5, r * bh + 1.5, bw - 3, bh - 3);
    }
  }
}

function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#2f6fb5'); g.addColorStop(0.32, '#6aa5d8'); g.addColorStop(0.49, '#d6e6f0');
  g.addColorStop(0.51, '#b9bfb4'); g.addColorStop(1, '#5e6a58');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 46; i++) {
    const cx = rnd() * 1024, cy = 90 + rnd() * 135, w = 30 + rnd() * 110;
    for (let j = 0; j < 22; j++) {
      const r = 8 + rnd() * 30, px = cx + (rnd() - 0.5) * w * 2, py = cy + (rnd() - 0.5) * 18;
      const grad = x.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.34)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = grad; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    }
  }
  const t = new CanvasTexture(c);
  t.mapping = EquirectangularReflectionMapping;
  t.colorSpace = SRGBColorSpace;
  return t;
}

function shadowBlob() {
  return canvasTexture(256, (x, s) => {
    x.clearRect(0, 0, s, s);
    const g = x.createRadialGradient(s / 2, s / 2, s * 0.26, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(10,14,10,0.55)'); g.addColorStop(1, 'rgba(10,14,10,0)');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
  });
}

export function mount(root, { mode = 'journey', onReady }) {
  const base = root.querySelector('canvas');
  const canvas = document.createElement('canvas');
  canvas.className = 'model__3d';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', base.getAttribute('aria-label') || 'Interactive 3D building');

  // Alpha true so the CSS drawing grid on .hero-ink shines directly through!
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const sky = skyTexture();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(sky).texture;
  scene.environmentIntensity = 0.85;
  pmrem.dispose();

  const skyDome = new Mesh(new SphereGeometry(420, 32, 16), new MeshBasicMaterial({ map: sky, side: BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false }));
  skyDome.renderOrder = -10;
  scene.add(skyDome);

  const sun = new DirectionalLight(0xfff1dc, 3.1);
  sun.position.set(-46, 62, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -62, right: 62, top: 62, bottom: -62, near: 10, far: 190 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3.5;
  scene.add(sun);
  scene.add(new HemisphereLight(0xcfe3f5, 0x6a6f58, 0.45));

  const reveal = new Plane(new Vector3(0, -1, 0), 0);
  const world = new Group();
  scene.add(world);

  // Materials
  const clip = { clippingPlanes: [reveal], clipShadows: true };
  const concrete = new MeshStandardMaterial({ map: canvasTexture(256, (x, s) => speckle(x, s, '#c9c6bd', 0.05, 2600), 4), roughness: 0.82, ...clip });
  const brick = new MeshStandardMaterial({
    map: canvasTexture(512, (x, s) => brickDraw(x, s, false), 2), bumpMap: canvasTexture(512, (x, s) => brickDraw(x, s, true), 2, 2, false), bumpScale: 1.4, roughness: 0.9, ...clip,
  });
  const aluminium = new MeshStandardMaterial({ color: 0x2f3438, metalness: 0.85, roughness: 0.38, ...clip });
  const glass = new MeshPhysicalMaterial({ color: 0x8fb2c4, metalness: 0.96, roughness: 0.035, envMapIntensity: 1.5, clearcoat: 1, clearcoatRoughness: 0.03, ...clip });
  const entrance = new MeshPhysicalMaterial({ color: 0x395a68, metalness: 0.75, roughness: 0.06, envMapIntensity: 1.2, ...clip });
  const plant = new MeshStandardMaterial({ color: 0x8e9391, metalness: 0.45, roughness: 0.52, ...clip });

  const building = new Group();
  world.add(building);
  const add = (geo, mat, x, y, z, parent = building, shadows = true) => {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = shadows; m.receiveShadow = shadows;
    parent.add(m);
    return m;
  };
  const box = (w, h, d) => new BoxGeometry(w, h, d);

  add(box(W + 0.6, 0.45, D + 0.6), concrete, 0, 0.22, 0);
  const brickFront = box(BAY * 0.86, FH - 0.5, 0.4);
  for (let f = 0; f < FLOORS; f++) {
    const y = f * FH;
    add(box(W + 0.5, 0.42, D + 0.5), concrete, 0, y + FH - 0.05, 0);
    add(box(W - 0.6, FH - 0.2, D - 0.6), new MeshStandardMaterial({ color: 0x20262b, roughness: 1, ...clip }), 0, y + FH / 2 + 0.05, 0, building, false);
  }

  const paneSpots = [], mullionSpots = [];
  const facadeRun = (fixed, length, axis, out) => {
    const count = Math.round(length / BAY);
    for (let f = 0; f < FLOORS; f++) {
      for (let i = 0; i < count; i++) {
        const pos = -length / 2 + BAY * (i + 0.5);
        const y = f * FH + FH / 2 + 0.2;
        const isDoor = f === 0 && axis === 'x' && out > 0 && Math.abs(pos) < 3.2;
        if (f === 0 && !isDoor && (i % 3 !== 1)) {
          const m = add(brickFront, brick, axis === 'x' ? pos : fixed, y - 0.12, axis === 'x' ? fixed : pos);
          if (axis !== 'x') m.rotation.y = Math.PI / 2;
          continue;
        }
        if (isDoor) {
          const m = add(box(BAY - 0.15, FH - 0.6, 0.12), entrance, pos, y - 0.2, fixed, building, false);
          if (axis !== 'x') m.rotation.y = Math.PI / 2;
          continue;
        }
        paneSpots.push({ axis, x: axis === 'x' ? pos : fixed, y, z: axis === 'x' ? fixed : pos });
        for (const side of [-BAY / 2, BAY / 2]) mullionSpots.push({ x: axis === 'x' ? pos + side : fixed, y, z: axis === 'x' ? fixed : pos + side });
      }
    }
  };
  facadeRun(D / 2 + 0.05, W, 'x', 1);
  facadeRun(-D / 2 - 0.05, W, 'x', -1);
  facadeRun(W / 2 + 0.05, D, 'z', 1);
  facadeRun(-W / 2 - 0.05, D, 'z', -1);

  const dummy = new Object3D();
  const panes = new InstancedMesh(box(BAY - 0.14, FH - 0.5, 0.05), glass, paneSpots.length);
  paneSpots.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(0, p.axis === 'x' ? 0 : Math.PI / 2, 0);
    dummy.updateMatrix(); panes.setMatrixAt(i, dummy.matrix);
  });
  panes.castShadow = true; panes.receiveShadow = true;
  building.add(panes);
  const mullions = new InstancedMesh(box(0.15, FH - 0.42, 0.15), aluminium, mullionSpots.length);
  mullionSpots.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix(); mullions.setMatrixAt(i, dummy.matrix);
  });
  mullions.castShadow = true;
  building.add(mullions);

  const top = H + 0.17;
  add(box(W + 0.5, 0.75, 0.3), concrete, 0, top + 0.37, D / 2 + 0.1);
  add(box(W + 0.5, 0.75, 0.3), concrete, 0, top + 0.37, -D / 2 - 0.1);
  add(box(0.3, 0.75, D + 0.5), concrete, W / 2 + 0.1, top + 0.37, 0);
  add(box(0.3, 0.75, D + 0.5), concrete, -W / 2 - 0.1, top + 0.37, 0);
  add(box(W, 0.1, D), new MeshStandardMaterial({ color: 0x7c7f7a, roughness: 0.95, ...clip }), 0, top + 0.05, 0);
  add(box(11, 1.8, 7), plant, -2, top + 0.9, 0);
  for (let i = 0; i < 12; i++) add(box(0.06, 1.5, 7.05), aluminium, -7 + i * 0.9, top + 0.9, 0);
  add(box(8, 0.22, 2.6), aluminium, 0, 3.15, D / 2 + 1.4);
  for (const x of [-3.7, 3.7]) add(box(0.14, 3, 0.14), aluminium, x, 1.6, D / 2 + 2.4);

  // Site context
  const site = new Group();
  world.add(site);
  const ground = (geo, mat, x, y, z) => {
    const m = new Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    site.add(m);
    return m;
  };
  const fading = [];
  const fadeMat = (opts) => { const m = new MeshStandardMaterial({ transparent: true, opacity: 0, ...opts }); fading.push(m); return m; };
  const lawnMap = canvasTexture(512, (x, s) => {
    speckle(x, s, '#5f7d3c', 0.1, 9000);
    for (let i = 0; i < 2400; i++) { x.strokeStyle = `hsla(${78 + rnd() * 30},${35 + rnd() * 25}%,${22 + rnd() * 22}%,0.5)`; const a = rnd() * s, b = rnd() * s; x.beginPath(); x.moveTo(a, b); x.lineTo(a + rnd() * 3 - 1.5, b - 3 - rnd() * 5); x.stroke(); }
  }, 34);
  ground(new CircleGeometry(400, 64), fadeMat({ map: lawnMap, roughness: 1, color: 0xffffff }), 0, -0.02, 0);
  const paving = canvasTexture(512, (x, s) => {
    speckle(x, s, '#aaa79d', 0.05, 5000);
    x.strokeStyle = 'rgba(70,70,64,.42)'; x.lineWidth = 2;
    for (let i = 0; i <= 8; i++) { const p = i * s / 8; x.beginPath(); x.moveTo(p, 0); x.lineTo(p, s); x.moveTo(0, p); x.lineTo(s, p); x.stroke(); }
  }, 6, 2.5);
  ground(new PlaneGeometry(W + 10, 14), fadeMat({ map: paving, roughness: 0.92 }), 0, 0.01, D / 2 + 7);
  const asphalt = canvasTexture(512, (x, s) => speckle(x, s, '#3d3f41', 0.12, 12000), 24, 2);
  ground(new PlaneGeometry(420, 10), fadeMat({ map: asphalt, roughness: 0.96 }), 0, 0.02, D / 2 + 22);
  const lineMat = fadeMat({ color: 0xe6e3d8, roughness: 0.8 });
  for (let i = -18; i <= 18; i++) ground(new PlaneGeometry(2.4, 0.16), lineMat, i * 5, 0.04, D / 2 + 22);
  ground(new PlaneGeometry(420, 0.34), fadeMat({ color: 0xbdbbb2, roughness: 0.9 }), 0, 0.05, D / 2 + 16.9);
  ground(new PlaneGeometry(10, 22), fadeMat({ map: paving, roughness: 0.92 }), -W / 2 - 7, 0.01, 2);
  const contact = ground(new PlaneGeometry(W + 13, D + 13), fadeMat({ map: shadowBlob(), roughness: 1, depthWrite: false }), 0, 0.03, 0);
  contact.material.transparent = true;

  const distant = new Group();
  site.add(distant);
  const distantMat = fadeMat({ color: 0xb8b3a8, roughness: 0.9 });
  [[-70, -46, 24, 22, 20], [-26, -66, 30, 30, 18], [34, -62, 26, 19, 24], [82, -30, 22, 26, 26], [-92, 16, 26, 14, 30], [94, 30, 30, 12, 24], [10, -96, 44, 36, 24]].forEach(([x, z, w, h, d]) => {
    const m = add(box(w, h, d), distantMat, x, h / 2, z, distant, false);
    m.receiveShadow = false;
  });

  const treeSpots = [[-24, 0], [-25, 13], [-22, -13], [27, -9], [27, 4], [28, 16], [-11, 20], [12, 21], [24, 22], [-26, 25], [-6, -19], [13, -20], [-44, 6], [46, -12], [-52, 30], [55, 36]];
  const leafCount = treeSpots.length * 240;
  const leaves = new InstancedMesh(new IcosahedronGeometry(1, 0), new MeshStandardMaterial({ roughness: 0.78, flatShading: true }), leafCount);
  const trunks = new Group();
  site.add(trunks);
  const trunkMat = new MeshStandardMaterial({ color: 0x4f4235, roughness: 0.95 });
  let leaf = 0;
  const tint = new Color();
  treeSpots.forEach(([x, z]) => {
    const size = 0.85 + rnd() * 0.55, height = 4.2 * size;
    const t = new Mesh(new CylinderGeometry(0.13 * size, 0.24 * size, height, 8), trunkMat);
    t.position.set(x, height / 2, z); t.castShadow = true; trunks.add(t);
    for (let i = 0; i < 240; i++) {
      const a = rnd() * 7, b = Math.acos(2 * rnd() - 1), r = (0.9 + rnd() * 2.2) * size;
      dummy.position.set(x + Math.sin(b) * Math.cos(a) * r, height + 1.7 * size + Math.cos(b) * r * 0.9, z + Math.sin(b) * Math.sin(a) * r);
      const s = (0.24 + rnd() * 0.3) * size;
      dummy.scale.set(s, s * 0.82, s); dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      dummy.updateMatrix(); leaves.setMatrixAt(leaf, dummy.matrix);
      tint.setHSL(0.26 + rnd() * 0.06, 0.38 + rnd() * 0.2, 0.12 + rnd() * 0.1);
      leaves.setColorAt(leaf, tint);
      leaf++;
    }
  });
  dummy.scale.set(1, 1, 1);
  leaves.castShadow = true; leaves.receiveShadow = true;
  site.add(leaves);

  // Structural ground setting-out grid in 3D space
  const gridPos = [];
  for (let x = -W / 2 - 6; x <= W / 2 + 6; x += 6) {
    gridPos.push(x, 0.02, -D / 2 - 8, x, 0.02, D / 2 + 8);
  }
  for (let z = -D / 2 - 6; z <= D / 2 + 6; z += 6) {
    gridPos.push(-W / 2 - 8, 0.02, z, W / 2 + 8, 0.02, z);
  }
  const gridGeo = new BufferGeometry();
  gridGeo.setAttribute('position', new BufferAttribute(new Float32Array(gridPos), 3));
  const groundGrid = new LineSegments(gridGeo, new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 }));
  scene.add(groundGrid);

  // Wireframe model stage: Neutral structural edges + 1 iBIM Green highlighted MEP & Level 3 Datum
  const wirePositions = [];
  const wireGreenPositions = [];
  const pushEdges = (w, h, d, x, y, z, targetArr = wirePositions) => {
    const e = new EdgesGeometry(box(w, h, d));
    const p = e.attributes.position;
    for (let i = 0; i < p.count; i++) targetArr.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z);
    e.dispose();
  };
  for (let f = 0; f < FLOORS; f++) {
    const isHighlightFloor = f === 2;
    pushEdges(W, 0.3, D, 0, f * FH + FH - 0.05, 0, isHighlightFloor ? wireGreenPositions : wirePositions);
    for (let x = -W / 2; x <= W / 2; x += 6) {
      for (let z = -D / 2; z <= D / 2; z += 6) {
        pushEdges(0.42, FH - 0.3, 0.42, x, f * FH + FH / 2, z, wirePositions);
      }
    }
    for (let z = -D / 2; z <= D / 2; z += 6) pushEdges(W, 0.45, 0.28, 0, f * FH + FH - 0.35, z, wirePositions);
    for (let x = -W / 2; x <= W / 2; x += 6) pushEdges(0.28, 0.45, D, x, f * FH + FH - 0.35, 0, wirePositions);
    // Primary MEP duct spine highlighted in green
    pushEdges(W - 4, 0.55, 1.4, 0, f * FH + FH - 0.9, 0, wireGreenPositions);
  }
  pushEdges(11, 1.8, 7, -2, top + 0.9, 0, wireGreenPositions);

  const wireGeo = new BufferGeometry();
  wireGeo.setAttribute('position', new BufferAttribute(new Float32Array(wirePositions), 3));
  const wire = new LineSegments(wireGeo, new LineBasicMaterial({ color: 0xdde2db, transparent: true, opacity: 0 }));
  scene.add(wire);

  const wireGreenGeo = new BufferGeometry();
  wireGreenGeo.setAttribute('position', new BufferAttribute(new Float32Array(wireGreenPositions), 3));
  const wireGreen = new LineSegments(wireGreenGeo, new LineBasicMaterial({ color: 0x7bc474, transparent: true, opacity: 0 }));
  scene.add(wireGreen);

  // Point cloud stage: intensity greyscale on ink, with live green LiDAR sweep front
  const scanPoints = [];
  const pt = (x, y, z) => {
    const n = (y / H) * 0.72 + 0.12 + (rnd() - 0.5) * 0.14;
    scanPoints.push({ x: x + (rnd() - 0.5) * 0.05, y, z: z + (rnd() - 0.5) * 0.05, n: clamp(n), a: Math.atan2(z - 34, x - 40) });
  };
  const density = small ? 0.65 : 1.1;
  const N = (n) => Math.round(n * density);
  const onGlass = (u, y) => (u + 900) % BAY > 0.3 && (u + 900) % BAY < BAY - 0.3 && y % FH > 0.65 && y % FH < 3;
  for (let i = 0; i < N(9500); i++) { const x = (rnd() - 0.5) * W, y = rnd() * H; if (!onGlass(x, y) || rnd() < 0.22) pt(x, y, D / 2); }
  for (let i = 0; i < N(5800); i++) { const z = (rnd() - 0.5) * D, y = rnd() * H; if (!onGlass(z, y) || rnd() < 0.22) pt(W / 2, y, z); }
  for (let i = 0; i < N(2500); i++) { const x = (rnd() - 0.5) * W, y = rnd() * H; pt(x, y, -D / 2); }
  for (let i = 0; i < N(1800); i++) { const z = (rnd() - 0.5) * D, y = rnd() * H; pt(-W / 2, y, z); }
  for (let i = 0; i < N(5200); i++) pt((rnd() - 0.5) * W, H + 0.2, (rnd() - 0.5) * D);
  for (let i = 0; i < N(1600); i++) { const u = rnd(); pt(-2 + (u - 0.5) * 11, H + 2, (rnd() - 0.5) * 7); }
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
  const cloud = new Points(cloudGeo, new PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, sizeAttenuation: true, depthWrite: false, toneMapped: false }));
  scene.add(cloud);

  scene.fog = new Fog(0xd8e4ea, 160, 400);

  // Camera and controls
  const camera = new PerspectiveCamera(28, 1.25, 1, 900);
  const target = new Vector3(0, 8.2, 0);
  camera.position.set(50, 20, 58);
  const startAngle = Math.atan2(camera.position.x, camera.position.z);
  const radius = Math.hypot(camera.position.x, camera.position.z);

  const labels = document.createElement('ol');
  labels.className = 'journey-steps';
  labels.setAttribute('aria-hidden', 'true');
  ['01 Point cloud', '02 BIM model', '03 Visualisation'].forEach((labelText, index) => {
    const li = document.createElement('li');
    li.textContent = labelText;
    li.dataset.stage = String(index);
    li.addEventListener('click', () => {
      const stageTimes = [1.8, 5.0, 10.4];
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
  photo.src = '/img/ibim-visual.webp?v=2';
  photo.alt = 'Visualisation · illustrative, not a client project';
  photo.width = 1600; photo.height = 1280;
  canvas.after(photo);

  const clock = new Clock(false);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = mode === 'visual' ? 6 : 0;
  const LENGTH = 11.2;
  const END_ANGLE = 0.45, END_HEIGHT = 9;
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

    const wireAlpha = seg(3.2, 5.2) * (1 - seg(6.8, 9.0));
    wire.material.opacity = wireAlpha * 0.65;
    wireGreen.material.opacity = wireAlpha;
    wire.visible = wireGreen.visible = wireAlpha > 0;

    // Progressive wireframe draw-on
    const wireDraw = ease(clamp((time - 3.0) / 2.4));
    wireGeo.setDrawRange(0, Math.floor((wirePositions.length / 3) * wireDraw));
    wireGreenGeo.setDrawRange(0, Math.floor((wireGreenPositions.length / 3) * wireDraw));

    groundGrid.material.opacity = (1 - seg(7.0, 9.2)) * 0.16;
    groundGrid.visible = groundGrid.material.opacity > 0.01;

    const build = seg(6.0, 9.2);
    reveal.constant = build * (H + 3.5);
    building.visible = build > 0;

    const scene1 = seg(6.4, 9.0);
    fading.forEach((m) => { m.opacity = m === contact.material ? scene1 * 0.85 : scene1; });
    leaves.visible = trunks.visible = scene1 > 0.5;
    skyDome.material.opacity = scene1;
    scene.fog.far = 400 + (1 - scene1) * 5000;

    // Camera settles smoothly onto the exact perspective of the path-traced render
    const settle = seg(0, 9.2);
    const angle = startAngle + (END_ANGLE - startAngle) * settle;
    camera.position.set(Math.sin(angle) * radius, 21 + (END_HEIGHT - 21) * settle, Math.cos(angle) * radius);
    camera.lookAt(target);
    photo.style.opacity = String(seg(9.2, 10.8));

    if (mode === 'journey') {
      const stage = time < 3.6 ? 0 : time < 9.0 ? 1 : 2;
      [...labels.children].forEach((li, i) => li.classList.toggle('is-active', i === stage));
    }
  }

  function resize() {
    const w = base.clientWidth, h = base.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1.2 ? 32 : 27;
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
