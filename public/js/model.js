// One building, drawn in code, shown at each stage of its lifecycle.
(() => {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();
  const C = {
    ink: token('--color-ink') || '#0B0D0B',
    muted: token('--color-ink-60') || '#586056',
    green: token('--color-signal') || '#43903C',
    greenDark: token('--color-signal-text') || '#2E6B29',
    tint: token('--color-tint') || '#EDF5EC',
    surface: token('--color-surface') || '#F4F6F3',
    line: token('--color-line') || '#DDE2DB',
    paper: token('--color-white') || '#FFFFFF',
    inkGreen: token('--color-ink-green') || '#7BC474',
    clash: token('--color-error') || '#B3261E',
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MONO = '"JetBrains Mono Variable", "JetBrains Mono", Consolas, monospace';

  // Geometry in metres.
  const W = 30, D = 18, BAY = 6, FLOORS = 5, FH = 3.6;
  const H = FLOORS * FH;
  const boxes = [];
  const add = (x, y, z, w, d, h, type, phase, floor = 0) => boxes.push({ x, y, z, w, d, h, type, phase, floor });

  add(-1, -1, -0.6, W + 2, D + 2, 0.6, 'slab', 0);
  for (let f = 0; f < FLOORS; f++) {
    const z = f * FH, phase = 1 + f;
    for (let x = 0; x <= W; x += BAY) for (let y = 0; y <= D; y += BAY) add(x - 0.2, y - 0.2, z, 0.4, 0.4, FH - 0.3, 'column', phase, f);
    for (let y = 0; y <= D; y += BAY) for (let x = 0; x < W; x += BAY) add(x, y - 0.15, z + FH - 0.5, BAY, 0.3, 0.5, 'beam', phase, f);
    add(0, 0, z + FH - 0.25, W, D, 0.25, 'slab', phase, f);
    add(12, 6, z, 6, 6, FH - 0.25, 'core', phase, f);
    add(1, 8.4, z + FH - 1.2, W - 2, 1.2, 0.55, 'duct', 7, f);
  }
  for (let f = 0; f < FLOORS; f++) {
    const z = f * FH;
    for (let x = 0; x < W; x += BAY) {
      add(x + 0.1, -0.25, z + 0.1, BAY - 0.2, 0.1, FH - 0.5, 'glass', 6, f);
      add(x + 0.1, D + 0.15, z + 0.1, BAY - 0.2, 0.1, FH - 0.5, 'glass', 6, f);
    }
    for (let y = 0; y < D; y += BAY) {
      add(-0.25, y + 0.1, z + 0.1, 0.1, BAY - 0.2, FH - 0.5, 'glass', 6, f);
      add(W + 0.15, y + 0.1, z + 0.1, 0.1, BAY - 0.2, FH - 0.5, 'glass', 6, f);
    }
  }
  add(9, 4, H, 12, 10, 1.8, 'plant', 7);

  // Point cloud sampled from surfaces. Seeded so it looks the same every load.
  let seed = 19;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const SCANNER = { x: W + 5, y: D + 6 };
  const points = [];
  const pt = (x, y, z) => {
    const jitter = (rnd() - 0.5) * 0.09;
    points.push({
      x: x + jitter, y: y + jitter, z,
      i: Math.min(1, Math.max(0, 0.2 + (z / H) * 0.62 + (rnd() - 0.5) * 0.28)),
      a: Math.atan2(y - SCANNER.y, x - SCANNER.x),
    });
  };
  const small = matchMedia('(max-width: 700px)').matches;
  const density = small ? 0.9 : 2.2;
  const N = (n) => Math.round(n * density);
  const onWindow = (u, z) => {
    const inBay = (u % BAY) > 0.45 && (u % BAY) < BAY - 0.45, fz = z % FH;
    return inBay && fz > 0.7 && fz < 2.9;
  };
  for (let i = 0; i < N(2400); i++) { const x = rnd() * W, z = rnd() * H; if (!onWindow(x, z) || rnd() < 0.1) pt(x, D, z); }
  for (let i = 0; i < N(1500); i++) { const y = rnd() * D, z = rnd() * H; if (!onWindow(y, z) || rnd() < 0.1) pt(W, y, z); }
  for (let i = 0; i < N(1100); i++) { const x = rnd() * W, y = rnd() * D, z = rnd() * H; pt(rnd() < 0.5 ? x : (rnd() < 0.5 ? 0 : W), rnd() < 0.5 ? y : 0, z); }
  for (let i = 0; i < N(1000); i++) pt(rnd() * W, rnd() * D, H);
  for (let i = 0; i < N(600); i++) pt(9 + rnd() * 12, 4 + rnd() * 10, H + 1.8);
  for (let i = 0; i < N(2600); i++) { const x = -7 + rnd() * (W + 14), y = -5 + rnd() * (D + 13); if (x < 0 || x > W || y < 0 || y > D) pt(x, y, 0); }
  // Sorted by angle, so a share of the array is the same share of the visible scan.
  points.sort((a, b) => a.a - b.a);

  // Intensity greyscale: neutral greys on ink / white, no rainbow height ramps (4.8)
  const ramp = (t) => {
    const v = Math.round(110 + t * 125);
    return `rgb(${v},${v},${v})`;
  };
  const rampCache = Array.from({ length: 32 }, (_, i) => ramp(i / 31));

  const DURATION = {
    journey: 13.5, visual: 6, advise: 4, capture: 5, information: 6.5, sequence: 12.5, delivery: 7.8, twin: 6, drawings: 2, planning: 2, regs: 2,
    plan: 2, elevation: 2, section: 2, wire: 4, cloud: 5, cde: 6.5, programme: 7.8,
  };
  const STATE_MAP = {
    plan: 'drawings',
    elevation: 'planning',
    section: 'regs',
    wire: 'advise',
    cloud: 'capture',
    cde: 'information',
    programme: 'delivery',
  };
  const resolveState = (s) => STATE_MAP[s] || s;
  const PHASES = ['Substructure', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Envelope', 'Services'];
  const CLASHES = [{ x: 12.2, y: 9, z: FH * 3 - 0.9 }, { x: 24.1, y: 9, z: FH * 2 - 0.9 }, { x: 6.1, y: 9, z: FH * 4 - 0.9 }];
  const SENSORS = [
    [3, -0.3, 2], [15, -0.3, 5.5], [27, -0.3, 9], [9, -0.3, 13], [21, -0.3, 16],
    [-0.3, 3, 6], [-0.3, 15, 12], [W + 0.3, 3, 2.5], [W + 0.3, 9, 9], [W + 0.3, 15, 15], [15, 9, H + 1.9],
  ];
  const DISCIPLINES = [['Architecture', ['glass', 'core']], ['Structure', ['column', 'beam', 'slab']], ['MEP', ['duct', 'plant']]];

  function create(root) {
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    let state = root.dataset.state, started = performance.now();
    let real = null, yaw = 0.62, baseYaw = 0.62, master = 1, width = 0, height = 0, scale = 1, ox = 0, oy = 0, visible = true, frame = 0;
    let cosY = Math.cos(yaw), sinY = Math.sin(yaw);

    const project = (x, y, z) => {
      const cx = x - W / 2, cy = y - D / 2;
      const X = cx * cosY - cy * sinY, Y = cx * sinY + cy * cosY;
      return [ox + X * scale, oy + (Y * 0.52 - z * 0.86) * scale, Y];
    };
    const line = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(width / 54, height / 38);
      ox = width / 2; oy = height * 0.7;
    }

    function drawBox(b, style) {
      const { x, y, z, w, d, h } = b;
      const p = (px, py, pz) => project(px, py, pz);
      const faces = [
        { pts: [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)], nx: 0, ny: 1, shade: 0.94 },
        { pts: [p(x, y, z), p(x + w, y, z), p(x + w, y, z + h), p(x, y, z + h)], nx: 0, ny: -1, shade: 0.94 },
        { pts: [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)], nx: 1, ny: 0, shade: 0.86 },
        { pts: [p(x, y, z), p(x, y + d, z), p(x, y + d, z + h), p(x, y, z + h)], nx: -1, ny: 0, shade: 0.86 },
      ];
      ctx.globalAlpha = (style.alpha ?? 1) * master;
      for (const f of faces) {
        if (f.nx * sinY + f.ny * cosY <= 0) continue;
        path(f.pts);
        if (style.fill) { ctx.fillStyle = style.side || style.fill; ctx.fill(); }
        if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lw || 0.6; ctx.stroke(); }
      }
      path([p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)]);
      if (style.fill) { ctx.fillStyle = style.fill; ctx.fill(); }
      if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lw || 0.6; ctx.stroke(); }
      ctx.globalAlpha = master;
    }
    function path(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    }
    const sorted = () => boxes
      .map((b) => ({ b, k: project(b.x + b.w / 2, b.y + b.d / 2, 0)[2] + (b.z + b.h / 2) * 1.2 }))
      .sort((m, n) => m.k - n.k)
      .map((m) => m.b);

    function label(text, x, y, opts = {}) {
      ctx.font = `${opts.size || 11}px ${MONO}`;
      ctx.textAlign = opts.align || 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = opts.color || C.ink;
      ctx.fillText(text, x, y);
    }

    // Setting-out grid on the ground, with grid bubbles as on a general arrangement drawing.
    function setOutGrid(alpha = 1) {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = C.line; ctx.lineWidth = 0.75;
      ctx.setLineDash([9, 3, 2, 3]);
      const letters = 'ABCDEF';
      const bubble = (pos, text) => {
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(pos[0], pos[1], 9, 0, 7);
        ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
        label(text, pos[0], pos[1] + 0.5, { align: 'center', size: 10 });
        ctx.setLineDash([9, 3, 2, 3]);
      };
      let n = 0;
      for (let x = 0; x <= W; x += BAY) {
        const a = project(x, -5, 0), b = project(x, D + 5, 0); line(a, b); bubble(sortEnd(a, b), letters[n++]);
      }
      n = 1;
      for (let y = 0; y <= D; y += BAY) {
        const a = project(-5, y, 0), b = project(W + 5, y, 0); line(a, b); bubble(sortEnd(a, b), String(n++));
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    const sortEnd = (a, b) => (a[1] < b[1] ? a : b);

    // Flat drawing sheets for architectural pages, set out on a 640 by 480 grid.
    function sheet(t, drawing) {
      const p = reduced ? 1 : ease(Math.min(1, t / 1.6));
      const fit = Math.min(width / 640, height / 480);
      ctx.save();
      ctx.translate((width - 640 * fit) / 2, (height - 480 * fit) / 2);
      ctx.scale(fit, fit);

      // Fine drawing grid behind the linework (Brand rules 3.6, 4.11)
      ctx.save();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.35 * p;
      for (let x = 0; x <= 640; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 480); ctx.stroke();
      }
      for (let y = 0; y <= 480; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke();
      }
      ctx.restore();

      const stroke = (w, color = C.ink) => { ctx.lineWidth = w; ctx.strokeStyle = color; };
      const seg = (...pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
      const box = (x, y, w, h) => { ctx.beginPath(); ctx.rect(x, y, w, h); ctx.stroke(); };
      const note = (text, x, y, align) => label(text, x, y, { size: 13, align });
      ctx.globalAlpha = p;
      drawing({ stroke, seg, box, note });
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // The finished visual: same geometry, shown as materials, ground and planting.
    const TREES = [[-6, -3], [-7, 13], [36, -2], [37, 11], [8, -7], [24, -7], [-5, 24], [20, 25], [34, 25]];
    function visualScene() {
      const corner = (x, y) => project(x, y, 0);
      path([corner(-11, -9), corner(41, -9), corner(41, 29), corner(-11, 29)]);
      ctx.globalAlpha = master; ctx.fillStyle = '#e4ecdf'; ctx.fill();
      path([corner(2, 18), corner(W + 12, 18), corner(W + 12, 28), corner(2, 28)]);
      ctx.fillStyle = '#d5d6d0'; ctx.fill();
      // Soft building shadow on the ground.
      path([corner(W, 0), corner(W + 9, 3), corner(W + 9, D + 3), corner(W, D)]);
      ctx.globalAlpha = master * 0.14; ctx.fillStyle = '#26302a'; ctx.fill();
      ctx.globalAlpha = master;
      const trunk = '#6b5a45';
      const items = [
        ...boxes.filter((b) => b.type !== 'duct' && b.type !== 'beam' && b.type !== 'column' && b.type !== 'core').map((b) => ({ b })),
        ...TREES.map((t) => ({ tree: t })),
      ].map((it) => {
        const [x, y] = it.b ? [it.b.x + it.b.w / 2, it.b.y + it.b.d / 2] : it.tree;
        const z = it.b ? it.b.z + it.b.h / 2 : 0;
        return { ...it, k: project(x, y, 0)[2] + z * 1.2 };
      }).sort((a, c) => a.k - c.k);
      for (const it of items) {
        if (it.tree) {
          const base = project(it.tree[0], it.tree[1], 0), top = project(it.tree[0], it.tree[1], 3.2);
          ctx.strokeStyle = trunk; ctx.lineWidth = Math.max(1.5, scale * 0.28); line(base, top);
          const crown = project(it.tree[0], it.tree[1], 5);
          ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(crown[0], crown[1], scale * 2.1, 0, 7); ctx.fill();
          ctx.fillStyle = C.greenDark; ctx.globalAlpha = master * 0.35; ctx.beginPath(); ctx.arc(crown[0] + scale * 0.6, crown[1] + scale * 0.6, scale * 1.4, 0, 7); ctx.fill(); ctx.globalAlpha = master;
        } else if (it.b.type === 'glass') {
          drawBox(it.b, { fill: '#a9cfdf', side: '#7fb0c9', stroke: '#47606e', lw: 0.5 });
        } else if (it.b.type === 'plant') {
          drawBox(it.b, { fill: '#c9ccc8', side: '#a7aba6', stroke: '#5d625d', lw: 0.5 });
        } else {
          drawBox(it.b, { fill: '#f3f2ee', side: '#d9d8d2', stroke: '#6f716c', lw: 0.4 });
        }
      }
    }

    function journeyLabels(active) {
      const names = ['Point cloud', '3D model', 'Visualisation', 'Real-time view'];
      names.forEach((name, i) => {
        const y = 16 + i * 20;
        ctx.globalAlpha = 1;
        ctx.fillStyle = i === active ? C.green : C.tint;
        ctx.beginPath(); ctx.arc(18, y, 5, 0, 7); ctx.fill();
        label(name, 30, y, { color: i === active ? C.ink : C.muted, size: 11 });
      });
    }

    const render = {
      journey(t0) {
        const t = reduced ? DURATION.journey : t0;
        const seg = (a, b) => ease(clamp((t - a) / (b - a)));
        const cloud = 1 - seg(3.6, 6.2);
        const wire = seg(3.4, 5.4) * (1 - seg(6.2, 8.4));
        const solid = seg(6.2, 8.6);
        yaw = baseYaw + 0.62 * seg(9.4, 13.5);
        cosY = Math.cos(yaw); sinY = Math.sin(yaw);
        if (solid > 0) { master = solid; visualScene(); master = 1; }
        if (wire > 0) {
          master = wire;
          for (const b of sorted()) {
            if (b.type === 'glass') continue;
            if (b.type === 'duct') drawBox(b, { stroke: C.greenDark, lw: 0.6 });
            else if (b.type === 'slab') drawBox(b, { stroke: C.ink, lw: 0.35, alpha: 0.35 });
            else drawBox(b, { stroke: C.ink, lw: 0.5, alpha: 0.8 });
          }
          master = 1;
        }
        if (cloud > 0) {
          const shown = Math.floor(points.length * Math.min(1, 0.55 + 0.45 * (t / 3)));
          const size = Math.max(1.2, scale * 0.13);
          ctx.globalAlpha = cloud;
          for (let n = 0; n < shown; n++) {
            const p = points[n], s = project(p.x, p.y, p.z);
            ctx.fillStyle = rampCache[Math.floor(p.i * 31)];
            ctx.fillRect(s[0], s[1], size, size);
          }
          ctx.globalAlpha = 1;
        }
        ctx.globalAlpha = 1;
        journeyLabels(t < 3.9 ? 0 : t < 7 ? 1 : t < 9.4 ? 2 : 3);
      },
      visual(t) {
        const g = reduced ? 1 : ease(clamp(t / 1.2));
        yaw = baseYaw + (reduced ? 0.4 : 0.4 * ease(clamp(t / 6)));
        cosY = Math.cos(yaw); sinY = Math.sin(yaw);
        master = g; visualScene(); master = 1; ctx.globalAlpha = 1;
      },
      drawings(t) {
        // Ground floor plan with a proposed rear extension, drawn to sheet conventions.
        sheet(t, ({ stroke, seg, box, note }) => {
          const wall = (x, y, w, h) => { ctx.fillStyle = C.ink; ctx.fillRect(x, y, w, h); };
          const gap = (x, y, w, h) => { ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h); };
          const small = (text, x, y, align = 'center', color = C.muted) => label(text, x, y, { size: 10, align, color });
          const win = (x, y, w, h) => { gap(x, y, w, h); stroke(0.75); box(x, y, w, h); w > h ? seg([x, y + h / 2], [x + w, y + h / 2]) : seg([x + w / 2, y], [x + w / 2, y + h]); };
          const door = (hx, hy, r, a0, a1) => {
            stroke(0.75); ctx.beginPath(); ctx.arc(hx, hy, r, a0, a1); ctx.stroke();
            stroke(1.5); seg([hx, hy], [hx + r * Math.cos(a1), hy + r * Math.sin(a1)]);
          };
          // Proposed rear extension: the one green element (4.11).
          ctx.fillStyle = C.tint; ctx.fillRect(120, 40, 180, 70);
          stroke(3, C.greenDark); box(120, 40, 180, 70);
          stroke(1, C.greenDark); box(129, 49, 162, 61);
          label('Proposed extension', 210, 76, { size: 11, align: 'center', color: C.greenDark });
          // External walls, cut at 1m: solid poché.
          wall(120, 110, 300, 9); wall(120, 331, 300, 9); wall(120, 110, 9, 230); wall(411, 110, 9, 230);
          // Internal walls.
          wall(268, 119, 5, 212); wall(129, 215, 139, 5); wall(273, 200, 138, 5);
          // Openings: rear wall opened into the extension, shown with removed-wall dashes.
          gap(140, 110, 115, 9); stroke(0.75); ctx.setLineDash([4, 3]); seg([140, 110], [255, 110]); seg([140, 119], [255, 119]); ctx.setLineDash([]);
          gap(200, 331, 30, 9); door(230, 331, 30, Math.PI, Math.PI * 1.5);
          gap(268, 250, 5, 30); door(273, 250, 30, Math.PI * 0.5, Math.PI * 0.5);
          stroke(0.75); ctx.beginPath(); ctx.arc(273, 250, 30, 0, Math.PI * 0.5); ctx.stroke(); stroke(1.5); seg([273, 250], [303, 250]);
          gap(160, 215, 30, 5); stroke(0.75); ctx.beginPath(); ctx.arc(160, 220, 30, 0, Math.PI * 0.5); ctx.stroke(); stroke(1.5); seg([160, 220], [160, 250]);
          gap(300, 200, 30, 5); stroke(0.75); ctx.beginPath(); ctx.arc(330, 205, 30, Math.PI * 0.5, Math.PI); ctx.stroke(); stroke(1.5); seg([330, 205], [330, 235]);
          win(140, 331, 45, 9); win(320, 331, 70, 9); win(300, 110, 90, 9); win(120, 245, 9, 55); win(411, 230, 9, 70);
          // Room names.
          small('KITCHEN', 198, 168); small('LIVING', 198, 290); small('BATHROOM', 342, 158); small('BEDROOM', 342, 270);
          // Dimension strings, in millimetres.
          stroke(0.75, C.muted);
          seg([120, 372], [420, 372]); seg([268, 366], [268, 378]);
          [[120, 372], [268, 372], [420, 372]].forEach(([x, y]) => seg([x - 4, y + 4], [x + 4, y - 4]));
          small('4 900', 194, 362); small('5 100', 344, 362);
          seg([88, 40], [88, 340]); [[88, 40], [88, 110], [88, 340]].forEach(([x, y]) => seg([x - 4, y + 4], [x + 4, y - 4]));
          small('2 300', 82, 75, 'right'); small('7 700', 82, 225, 'right');
          // North point, title and scale bar.
          stroke(1); ctx.beginPath(); ctx.arc(570, 78, 20, 0, 7); ctx.stroke();
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(570, 56); ctx.lineTo(578, 92); ctx.lineTo(570, 85); ctx.lineTo(562, 92); ctx.closePath(); ctx.fill();
          label('N', 570, 44, { size: 11, align: 'center' });
          note('Ground floor plan', 470, 404);
          small('PROPOSED · 1:100 @ A3', 470, 424, 'left');
          for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? C.paper : C.ink; ctx.fillRect(470 + i * 20, 440, 20, 6); }
          stroke(0.75); box(470, 440, 100, 6); small('0', 470, 456, 'left'); small('5 m', 570, 456, 'right');
        });
      },
      planning(t) {
        // Front elevation with a proposed single-storey side extension.
        sheet(t, ({ stroke, seg, box, note }) => {
          const small = (text, x, y, align = 'left', color = C.muted) => label(text, x, y, { size: 10, align, color });
          const win = (x, y, w, h) => { stroke(1.5); box(x, y, w, h); stroke(0.75); seg([x + w / 2, y], [x + w / 2, y + h]); seg([x, y + h * 0.35], [x + w, y + h * 0.35]); stroke(2); seg([x - 4, y + h + 3], [x + w + 4, y + h + 3]); };
          // Brick coursing, kept faint so it reads as texture.
          ctx.save(); ctx.beginPath(); ctx.rect(150, 200, 260, 180); ctx.clip();
          stroke(0.5, C.line); for (let y = 206; y < 380; y += 6) seg([150, y], [410, y]);
          ctx.restore();
          // Chimney sits behind the ridge, then the roof with tile coursing.
          stroke(2); box(334, 76, 22, 40); seg([330, 76], [360, 76]);
          ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(138, 200); ctx.lineTo(176, 112); ctx.lineTo(384, 112); ctx.lineTo(422, 200); ctx.closePath(); ctx.fill();
          stroke(2.5); ctx.stroke();
          stroke(0.5, C.muted);
          for (let y = 122; y < 200; y += 9) { const k = (y - 112) / 88; seg([176 - 38 * k, y], [384 + 38 * k, y]); }
          // Main walls.
          stroke(2.5); box(150, 200, 260, 180);
          win(178, 228, 60, 48); win(322, 228, 60, 48); win(178, 300, 60, 52);
          stroke(1.5); box(322, 296, 34, 84); seg([316, 290], [362, 290]);
          // Proposed side extension: the one green element (4.11).
          ctx.fillStyle = C.tint; ctx.fillRect(410, 296, 110, 84);
          stroke(2.5, C.greenDark); seg([410, 296], [520, 296], [520, 380]); seg([406, 290], [524, 290]);
          stroke(1, C.greenDark); box(438, 318, 58, 40);
          label('Proposed side extension', 465, 274, { size: 11, align: 'center', color: C.greenDark });
          // Ground line with hatching.
          stroke(2.5); seg([40, 380], [600, 380]);
          stroke(0.75, C.muted); for (let x = 46; x < 600; x += 12) seg([x, 380], [x - 8, 390]);
          // Level datums.
          const datum = (y, text) => {
            stroke(0.5, C.muted); ctx.setLineDash([3, 3]); seg([424, y], [548, y]); ctx.setLineDash([]);
            ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(556, y); ctx.lineTo(562, y - 7); ctx.lineTo(550, y - 7); ctx.closePath(); ctx.fill();
            small(text, 568, y - 4);
          };
          datum(112, 'Ridge +7.900'); datum(200, 'Eaves +5.200'); datum(380, 'FFL +0.000');
          note('Front elevation', 40, 420); small('PROPOSED · 1:100 @ A3', 40, 440);
        });
      },
      regs(t) {
        // Section through the external wall, floor and roof: the build-up building control checks.
        sheet(t, ({ stroke, seg, box, note }) => {
          const small = (text, x, y, align = 'left', color = C.muted) => label(text, x, y, { size: 10, align, color });
          const hatch = (x, y, w, h, step = 8) => {
            ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
            stroke(0.5, C.muted); for (let i = -h; i < w; i += step) seg([x + i, y + h], [x + i + h, y]);
            ctx.restore(); stroke(1.5); box(x, y, w, h);
          };
          const zig = (x0, y0, x1, y1, amp, step) => {
            const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
            ctx.beginPath();
            for (let d = 0, i = 0; d <= len; d += step, i++) { const o = i % 2 ? amp : -amp; const px = x0 + ux * d + nx * o, py = y0 + uy * d + ny * o; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
            ctx.stroke();
          };
          // Ground and foundation.
          stroke(0.75, C.muted); for (let x = 30; x < 430; x += 12) seg([x, 380], [x - 8, 390]);
          stroke(2); seg([30, 380], [90, 380]);
          hatch(84, 404, 96, 40, 6);
          // Cavity wall: outer and inner leaves, cut, with the cavity between.
          hatch(104, 150, 18, 254, 7); hatch(142, 150, 18, 254, 7);
          // Floor: slab on insulation, with the damp-proof course across the wall.
          hatch(160, 372, 270, 14, 9);
          stroke(1.5, C.ink); seg([100, 366], [164, 366]);
          // Roof: rafter, covering, ceiling joist; cut off with a break line.
          stroke(3); seg([92, 156], [330, 40]); stroke(1.5); seg([88, 146], [326, 30]);
          stroke(3); seg([142, 150], [430, 150]);
          stroke(1); seg([430, 140], [436, 146], [424, 154], [430, 160]); seg([430, 366], [436, 372], [424, 380], [430, 392]);
          // Insulation, one continuous green system (4.11): cavity, loft and floor.
          stroke(2, C.greenDark);
          zig(131, 152, 131, 400, 7, 8); zig(166, 142, 426, 142, 5, 10); zig(166, 392, 426, 392, 4, 10);
          // Leaders to labels.
          stroke(0.75, C.muted);
          [['Roof covering', 240, 72, 60], ['Loft insulation', 300, 142, 120], ['Cavity insulation', 131, 260, 200], ['Floor slab', 300, 379, 300], ['Damp-proof course', 160, 366, 340], ['Floor insulation', 380, 392, 380], ['Strip foundation', 180, 424, 420]].forEach(([text, x, y, ly]) => {
            seg([x, y], [470, ly]); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill();
            small(text, 478, ly, 'left', C.ink);
          });
          note('Section A–A', 30, 30); small('1:20 @ A3', 30, 50);
        });
      },
      advise(t) {
        setOutGrid();
        const k = reduced ? 1 : ease(Math.min(1, t / 2));
        ctx.setLineDash([5, 4]);
        drawBox({ x: 0, y: 0, z: 0, w: W, d: D, h: H * k }, { fill: C.tint, stroke: C.ink, lw: 1, alpha: 0.75 });
        ctx.setLineDash([]);
        const notes = ['Assess', 'Roadmap', 'Implement'];
        notes.forEach((text, i) => {
          const show = reduced ? 1 : clamp((t - 1 - i * 0.8) * 2);
          if (!show) return;
          const anchor = project(W * (0.2 + i * 0.3), D, H * (0.35 + i * 0.25));
          ctx.globalAlpha = show;
          ctx.strokeStyle = C.ink; ctx.lineWidth = 0.75;
          line(anchor, [anchor[0] + 26, anchor[1] - 24]);
          ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 3.5, 0, 7); ctx.fill();
          label(text, anchor[0] + 30, anchor[1] - 26);
          ctx.globalAlpha = 1;
        });
      },
      capture(t) {
        // Opens part-way through the scan, so the first frame already shows the building.
        const k = reduced ? 1 : Math.min(1, 0.55 + 0.45 * (t / 5));
        const shown = Math.floor(points.length * k);
        const sweep = points[Math.max(0, shown - 1)].a;
        const size = Math.max(1.2, scale * 0.13);
        for (let n = 0; n < shown; n++) {
          const p = points[n];
          const s = project(p.x, p.y, p.z);
          ctx.fillStyle = rampCache[Math.floor(p.i * 31)];
          ctx.fillRect(s[0], s[1], size, size);
        }
        const base = project(SCANNER.x, SCANNER.y, 0), head = project(SCANNER.x, SCANNER.y, 1.9);
        if (k < 1) {
          const far = 42;
          const beam = project(SCANNER.x + Math.cos(sweep) * far, SCANNER.y + Math.sin(sweep) * far, 7);
          ctx.strokeStyle = C.green; ctx.lineWidth = 1; ctx.globalAlpha = 0.55; line(head, beam); ctx.globalAlpha = 1;
        }
        // The scan is always shown on ink (4.8), so the scanner and its label are drawn light.
        const onInk = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = onInk; ctx.lineWidth = 1.5;
        for (const [dx, dy] of [[-1.1, 0.3], [1, 0.5], [0.1, -1]]) line(head, project(SCANNER.x + dx, SCANNER.y + dy, 0));
        ctx.fillStyle = onInk; ctx.beginPath(); ctx.arc(head[0], head[1] - 4, 5, 0, 7); ctx.fill();
        label('Laser scan', base[0], base[1] + 18, { align: 'center', color: onInk });
      },
      information(t) {
        setOutGrid(0.5);
        for (const b of sorted()) {
          if (b.type === 'glass') continue;
          if (b.type === 'duct') drawBox(b, { fill: C.green, side: C.greenDark, stroke: C.greenDark, lw: 0.5 });
          else if (b.type === 'column' || b.type === 'beam' || b.type === 'core' || b.type === 'plant') drawBox(b, { stroke: C.ink, lw: 0.5, alpha: b.type === 'core' ? 0.5 : 0.8 });
          else drawBox(b, { stroke: C.ink, lw: 0.35, alpha: 0.28 });
        }
        CLASHES.forEach((c, i) => {
          const local = reduced ? 1 : (t + i * 1.6) % 7;
          const resolved = reduced ? false : local > 4;
          const color = resolved ? C.green : C.clash;
          const s = project(c.x, c.y, c.z);
          const pulse = reduced || resolved ? 0 : (t * 1.4 + i) % 1;
          ctx.strokeStyle = color; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(s[0], s[1], 7 + pulse * 10, 0, 7); ctx.globalAlpha = 1 - pulse * 0.8; ctx.stroke(); ctx.globalAlpha = 1;
          ctx.fillStyle = color; ctx.beginPath(); ctx.arc(s[0], s[1], 4, 0, 7); ctx.fill();
          ctx.fillStyle = C.paper; const tx = s[0] + 12, ty = s[1] - 12, text = resolved ? 'Resolved' : 'Clash';
          ctx.font = `11px ${MONO}`; const tw = ctx.measureText(text).width;
          ctx.fillRect(tx - 3, ty - 8, tw + 6, 16);
          label(text, tx, ty, { color: resolved ? C.greenDark : C.clash });
        });
      },
      sequence(t) {
        const span = 12;
        const k = reduced ? 1 : Math.min(1, (t % (span + 2.5)) / span);
        const progress = k * PHASES.length;
        for (const b of sorted()) {
          const local = progress - b.phase;
          if (local <= 0) continue;
          const live = local < 1 && k < 1;
          const g = live ? ease(local) : 1;
          const box = { ...b, h: b.h * g };
          if (b.type === 'glass') drawBox(box, { fill: live ? C.green : C.tint, stroke: live ? C.greenDark : C.line, lw: 0.4, alpha: 0.8 });
          else if (b.type === 'duct') drawBox(box, { fill: C.green, side: C.greenDark });
          else drawBox(box, { fill: live ? C.green : C.paper, side: live ? C.greenDark : C.tint, stroke: C.ink, lw: 0.4 });
        }
        // Gantt strip with a cost line. The shapes are illustrative, so there are no figures.
        const x0 = 12, gw = Math.min(width - 24, Math.max(280, width * 0.62));
        const narrow = width < 420, rowH = narrow ? 7 : 11;
        const y0 = height - (PHASES.length + 1) * rowH - 16;
        PHASES.forEach((name, i) => {
          const bx = x0 + (narrow ? 0 : 92) + (i / PHASES.length) * (gw - (narrow ? 0 : 92));
          const bw = ((gw - (narrow ? 0 : 92)) / PHASES.length) * 1.5;
          const by = y0 + i * rowH;
          ctx.fillStyle = progress > i ? C.green : C.tint;
          ctx.fillRect(bx, by, Math.min(bw, x0 + gw - bx), rowH - 2);
          if (!narrow) label(name, x0, by + rowH / 2 - 1, { size: 10 });
        });
        const startX = x0 + (narrow ? 0 : 92), range = gw - (narrow ? 0 : 92);
        const head = startX + k * range;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
        line([head, y0 - 4], [head, y0 + PHASES.length * rowH + 2]);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath();
        const base = y0 + PHASES.length * rowH;
        for (let i = 0; i <= 30; i++) {
          const u = (i / 30) * k;
          const curve = u * u * (3 - 2 * u);
          const px = startX + u * range, py = base - curve * (PHASES.length * rowH);
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
        label('Time and cost', x0, y0 - 12, { size: 11 });
      },
      delivery(t) {
        setOutGrid(0.4);
        const active = reduced ? 1 : Math.floor(t / 2.6) % DISCIPLINES.length;
        const types = DISCIPLINES[active][1];
        for (const b of sorted()) {
          const on = types.includes(b.type);
          if (on) drawBox(b, { fill: b.type === 'glass' ? C.green : C.green, side: C.greenDark, stroke: C.greenDark, lw: 0.4, alpha: b.type === 'glass' ? 0.82 : 1 });
          else if (b.type === 'glass') drawBox(b, { fill: C.tint, stroke: C.line, lw: 0.4, alpha: 0.55 });
          else drawBox(b, { fill: C.paper, side: C.tint, stroke: C.ink, lw: 0.3, alpha: 0.9 });
        }
        DISCIPLINES.forEach(([name], i) => {
          const y = 18 + i * 22;
          ctx.fillStyle = i === active ? C.green : C.tint; ctx.fillRect(12, y - 6, 12, 12);
          label(name, 32, y, { color: C.ink });
        });
      },
      twin(t) {
        for (const b of sorted()) {
          if (b.type === 'glass') drawBox(b, { fill: C.tint, stroke: C.line, lw: 0.4, alpha: 0.75 });
          else drawBox(b, { fill: C.paper, side: C.tint, stroke: C.ink, lw: 0.3 });
        }
        const hub = [width - 42, 42];
        ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.setLineDash([9, 5]);
        ctx.beginPath(); ctx.arc(hub[0], hub[1], 22, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(hub[0], hub[1], 10, 0, 7); ctx.fill();
        label('Live data', hub[0] - 30, hub[1], { align: 'right' });
        SENSORS.forEach((v, i) => {
          const s = project(v[0], v[1], v[2]);
          ctx.globalAlpha = 0.28; ctx.strokeStyle = C.greenDark; ctx.lineWidth = 0.75; line(s, hub); ctx.globalAlpha = 1;
          if (!reduced) {
            const u = (t * 0.35 + i * 0.137) % 1;
            ctx.fillStyle = C.green;
            ctx.beginPath(); ctx.arc(s[0] + (hub[0] - s[0]) * u, s[1] + (hub[1] - s[1]) * u, 2.2, 0, 7); ctx.fill();
          }
          const pulse = reduced ? 0 : (t * 0.6 + i * 0.21) % 1;
          ctx.strokeStyle = C.green; ctx.lineWidth = 1.2; ctx.globalAlpha = 1 - pulse;
          ctx.beginPath(); ctx.arc(s[0], s[1], 4 + pulse * 10, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
          ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(s[0], s[1], 3.5, 0, 7); ctx.fill();
        });
      },
    };

    function draw(now) {
      frame = 0;
      if (!visible || !width) return;
      ctx.clearRect(0, 0, width, height);
      // Each stage plays once and holds. Dragging redraws the final frame.
      const length = DURATION[state] ?? 4;
      // The frame clock can read just before the start time, so never go negative.
      const elapsed = Math.max(0, (now - started) / 1000);
      const t = Math.min(elapsed, length);
      // The 4D view makes room for its programme chart.
      const fit = Math.min(width / 54, height / 38);
      const planned = state === 'sequence';
      scale = planned ? fit * 0.72 : fit;
      ox = width / 2;
      oy = planned ? height * 0.5 : height * 0.7;
      const renderFn = render[resolveState(state)] || render.advise;
      renderFn(t);
      if (!reduced && elapsed < length) frame = requestAnimationFrame(draw);
    }
    const request = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };

    new ResizeObserver(() => { resize(); request(); }).observe(canvas);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) request();
      else if (frame) { cancelAnimationFrame(frame); frame = 0; }
    }).observe(canvas);

    let drag = null;
    canvas.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, yaw, base: baseYaw };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      baseYaw = drag.base + (e.clientX - drag.x) * 0.008;
      yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
      cosY = Math.cos(yaw); sinY = Math.sin(yaw);
      request();
    });
    const end = () => { drag = null; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    resize();
    request();
    return {
      attach(handle) { real = handle; },
      set(next) {
        if (real) { if (next === 'journey' || next === 'visual') real.show(); else real.hide(); }
        state = next; started = performance.now(); baseYaw = yaw;
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        request();
      },
    };
  }

  const clamp = (v) => Math.max(0, Math.min(1, v));

  // Brand easing curve: cubic-bezier(0.2, 0.8, 0.2, 1)
  function ease(t) {
    let u = Math.max(0, Math.min(1, t));
    for (let i = 0; i < 6; i++) {
      const x = 3 * (1 - u) * (1 - u) * u * 0.2 + 3 * (1 - u) * u * u * 0.2 + u * u * u;
      const dx = 3 * (1 - u) * (1 - u) * 0.2 + 3 * u * u * 0.8;
      if (Math.abs(x - t) < 1e-4) break;
      u -= (x - t) / (dx || 1);
      u = Math.max(0, Math.min(1, u));
    }
    return 3 * (1 - u) * (1 - u) * u * 0.8 + 3 * (1 - u) * u * u * 1.0 + u * u * u;
  }

  function start() {
    document.querySelectorAll('[data-model]').forEach((root) => {
      const model = create(root);
      // The 3D animation loads after the page. The render is the fallback and the end frame.
      const mode = root.dataset.state;
      const showRender = () => {
        const photo = new Image();
        photo.src = '/img/ibim-visual.webp?v=2';
        photo.alt = 'Visualisation · illustrative, not a client project';
        photo.width = 1600; photo.height = 1280;
        photo.className = 'model__photo model__photo--static';
        root.querySelector('canvas').after(photo);
      };
      if (mode === 'visual') {
        showRender();
      } else if (mode === 'journey') {
        const load = () => import('/js/visual3d.js?v=8')
          .then((m) => model.attach(m.mount(root, { mode })))
          .catch((err) => {
            console.warn('3D animation unavailable', err);
            showRender();
          });
        if (document.readyState === 'complete') setTimeout(load, 200);
        else addEventListener('load', () => setTimeout(load, 200), { once: true });
      }
      if (!('lifecycle' in root.dataset)) return;

      const stops = [...document.querySelectorAll('[data-stop]')];
      const panels = [...document.querySelectorAll('[data-panel]')];
      const select = (name) => {
        stops.forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.stop === name)));
        panels.forEach((p) => { p.hidden = p.dataset.panel !== name; });
        model.set(name);
        root.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      };
      stops.forEach((s) => s.addEventListener('click', () => select(s.dataset.stop)));
    });
  }

  // Canvas labels need the brand font loaded before the first draw.
  const load = document.fonts && document.fonts.load ? document.fonts.load(`11px "JetBrains Mono Variable", "JetBrains Mono"`) : Promise.resolve();
  load.catch(() => {}).then(start);
})();
