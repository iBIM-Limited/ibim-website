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
const ease = (v) => v * v * (3 - 2 * v);

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

// Painted sky: used for the backdrop and for the reflections in the glass.
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

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0xffffff, 1);

  const scene = new Scene();
  scene.background = new Color(0xffffff);
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
  scene.add(new HemisphereLight(0xcfe3f5, 0x6a6f58, 0.42));

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

  // Ground floor in brick, with an entrance, and glazed floors above.
  add(box(W + 0.6, 0.45, D + 0.6), concrete, 0, 0.22, 0);
  const brickFront = box(BAY * 0.86, FH - 0.5, 0.4);
  for (let f = 0; f < FLOORS; f++) {
    const y = f * FH;
    add(box(W + 0.5, 0.42, D + 0.5), concrete, 0, y + FH - 0.05, 0);
    add(box(W - 0.6, FH - 0.2, D - 0.6), new MeshStandardMaterial({ color: 0x20262b, roughness: 1, ...clip }), 0, y + FH / 2 + 0.05, 0, building, false);
  }

  // Glass panes and mullions are instanced, so hundreds of parts draw cheaply.
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

  // Roof: parapet, plant and louvres. Entrance canopy.
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

  // Site: lawn, paving, road, kerbs, neighbouring buildings and trees.
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

  // Trees are clusters of leaf blobs, varied in colour.
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

  // Wireframe model stage.
  const wirePositions = [];
  const pushEdges = (w, h, d, x, y, z) => {
    const e = new EdgesGeometry(box(w, h, d));
    const p = e.attributes.position;
    for (let i = 0; i < p.count; i++) wirePositions.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z);
    e.dispose();
  };
  for (let f = 0; f < FLOORS; f++) {
    pushEdges(W, 0.3, D, 0, f * FH + FH - 0.05, 0);
    for (let x = -W / 2; x <= W / 2; x += 6) for (let z = -D / 2; z <= D / 2; z += 6) pushEdges(0.42, FH - 0.3, 0.42, x, f * FH + FH / 2, z);
    for (let z = -D / 2; z <= D / 2; z += 6) pushEdges(W, 0.45, 0.28, 0, f * FH + FH - 0.35, z);
    for (let x = -W / 2; x <= W / 2; x += 6) pushEdges(0.28, 0.45, D, x, f * FH + FH - 0.35, 0);
  }
  pushEdges(11, 1.8, 7, -2, top + 0.9, 0);
  const wireGeo = new BufferGeometry();
  wireGeo.setAttribute('position', new BufferAttribute(new Float32Array(wirePositions), 3));
  const wire = new LineSegments(wireGeo, new LineBasicMaterial({ color: 0x16201a, transparent: true, opacity: 0 }));
  scene.add(wire);

  // Point cloud stage, coloured by height as a scanner viewer would.
  const stops = [[34, 83, 180], [31, 158, 137], [120, 190, 60], [240, 190, 40], [224, 70, 45]].map((c) => new Color(c[0] / 255, c[1] / 255, c[2] / 255).convertSRGBToLinear());
  const scanPoints = [];
  const pt = (x, y, z) => {
    const n = (y / H) * 0.72 + 0.12 + (rnd() - 0.5) * 0.14;
    scanPoints.push({ x: x + (rnd() - 0.5) * 0.05, y, z: z + (rnd() - 0.5) * 0.05, n: clamp(n), a: Math.atan2(z - 34, x - 40) });
  };
  const density = small ? 0.6 : 1;
  const N = (n) => Math.round(n * density);
  const onGlass = (u, y) => (u + 900) % BAY > 0.3 && (u + 900) % BAY < BAY - 0.3 && y % FH > 0.65 && y % FH < 3;
  for (let i = 0; i < N(9000); i++) { const x = (rnd() - 0.5) * W, y = rnd() * H; if (!onGlass(x, y) || rnd() < 0.22) pt(x, y, D / 2); }
  for (let i = 0; i < N(5400); i++) { const z = (rnd() - 0.5) * D, y = rnd() * H; if (!onGlass(z, y) || rnd() < 0.22) pt(W / 2, y, z); }
  for (let i = 0; i < N(2500); i++) { const x = (rnd() - 0.5) * W, y = rnd() * H; pt(x, y, -D / 2); }
  for (let i = 0; i < N(1800); i++) { const z = (rnd() - 0.5) * D, y = rnd() * H; pt(-W / 2, y, z); }
  for (let i = 0; i < N(5200); i++) pt((rnd() - 0.5) * W, H + 0.2, (rnd() - 0.5) * D);
  for (let i = 0; i < N(1600); i++) { const u = rnd(); pt(-2 + (u - 0.5) * 11, H + 2, (rnd() - 0.5) * 7); }
  for (let i = 0; i < N(13000); i++) { const x = (rnd() - 0.5) * 90, z = (rnd() - 0.5) * 72; if (Math.abs(x) > W / 2 || Math.abs(z) > D / 2) pt(x, 0.02, z); }
  scanPoints.sort((a, b) => a.a - b.a);
  const pos = new Float32Array(scanPoints.length * 3), col = new Float32Array(scanPoints.length * 3);
  const mixed = new Color();
  scanPoints.forEach((p, i) => {
    pos.set([p.x, p.y, p.z], i * 3);
    const s = Math.min(stops.length - 1.001, p.n * (stops.length - 1)), k = Math.floor(s);
    mixed.copy(stops[k]).lerp(stops[k + 1], s - k);
    col.set([mixed.r, mixed.g, mixed.b], i * 3);
  });
  const cloudGeo = new BufferGeometry();
  cloudGeo.setAttribute('position', new BufferAttribute(pos, 3));
  cloudGeo.setAttribute('color', new BufferAttribute(col, 3));
  const cloud = new Points(cloudGeo, new PointsMaterial({ size: 0.27, vertexColors: true, transparent: true, sizeAttenuation: true, depthWrite: false, toneMapped: false }));
  scene.add(cloud);

  scene.fog = new Fog(0xd8e4ea, 160, 400);

  // Camera and controls
  const camera = new PerspectiveCamera(30, 1.25, 1, 900);
  const target = new Vector3(0, 7.6, 0);
  camera.position.set(54, 21, 62);
  const startAngle = Math.atan2(camera.position.x, camera.position.z);
  const radius = Math.hypot(camera.position.x, camera.position.z);

  const labels = document.createElement('ol');
  labels.className = 'journey-steps';
  labels.setAttribute('aria-hidden', 'true');
  ['Point cloud', '3D model', 'Realistic visual'].forEach((t) => { const li = document.createElement('li'); li.textContent = t; labels.append(li); });
  if (mode === 'journey') root.append(labels);
  root.classList.add('model--has-3d');
  base.after(canvas);
  const photo = document.createElement('img');
  photo.className = 'model__photo';
  photo.src = '/img/ibim-visual.webp?v=2';
  photo.alt = 'Realistic illustrative render of a five-storey glazed office building with a brick base, trees and a road.';
  photo.width = 1600; photo.height = 1280;
  canvas.after(photo);

  const clock = new Clock(false);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = mode === 'visual' ? 6 : 0;
  const LENGTH = 10.4;
  const END_ANGLE = 0.45, END_HEIGHT = 9;
  let t = reduced ? LENGTH : start, running = !reduced, visible = true, active = true, needsDraw = true, offset = 0, raf = 0;

  function apply(time) {
    const seg = (a, b) => ease(clamp((time - a) / (b - a)));
    const cloudAlpha = 1 - seg(3.6, 6.2);
    cloud.visible = cloudAlpha > 0;
    cloud.material.opacity = cloudAlpha;
    cloudGeo.setDrawRange(0, Math.floor(scanPoints.length * Math.min(1, 0.55 + 0.45 * (time / 3))));
    wire.material.opacity = seg(3.4, 5.4) * (1 - seg(6.4, 8.6));
    wire.visible = wire.material.opacity > 0;
    const build = seg(6, 8.8);
    reveal.constant = build * (H + 3.5);
    building.visible = build > 0;
    const scene1 = seg(6, 8.4);
    fading.forEach((m) => { m.opacity = m === contact.material ? scene1 * 0.85 : scene1; });
    leaves.visible = trunks.visible = scene1 > 0.5;
    skyDome.material.opacity = scene1;
    scene.fog.far = 400 + (1 - scene1) * 5000;
    {
      // The camera settles exactly on the view of the path-traced render.
      const settle = seg(0, 8.8);
      const angle = startAngle + (END_ANGLE - startAngle) * settle;
      camera.position.set(Math.sin(angle) * radius, 21 + (END_HEIGHT - 21) * settle, Math.cos(angle) * radius);
      camera.lookAt(target);
      photo.style.opacity = String(seg(8.8, 10.2));
    }
    if (mode === 'journey') {
      const stage = time < 3.9 ? 0 : time < 9.3 ? 1 : 2;
      [...labels.children].forEach((li, i) => li.classList.toggle('is-active', i === stage));
    }
  }

  function resize() {
    const w = base.clientWidth, h = base.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole building in view on narrower shapes.
    camera.fov = camera.aspect < 1.2 ? 34 : 30;
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
    show() { active = true; photo.style.opacity = '0'; root.classList.add('model--has-3d'); labels.hidden = false; t = reduced ? LENGTH : start; offset = t; running = !reduced; apply(t); clock.start(); needsDraw = true; wake(); },
    hide() { active = false; running = false; root.classList.remove('model--has-3d'); labels.hidden = true; },
  };
}
