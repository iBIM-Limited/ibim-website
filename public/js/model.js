// One building, drawn in code, shown at each stage of its lifecycle.
(() => {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();
  const C = {
    ink: token('--ink'), muted: token('--muted'), green: token('--green'), greenDark: token('--green-dark'),
    tint: token('--tint'), line: token('--line'), paper: token('--paper'), clash: token('--clash'),
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MONO = '"Space Mono", ui-monospace, Menlo, monospace';

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

  // Scan intensity ramp: the colours a scanner viewer uses, and only ever used here.
  const ramp = (t) => {
    const stops = [[34, 83, 180], [31, 158, 137], [120, 190, 60], [240, 190, 40], [224, 70, 45]];
    const s = Math.min(stops.length - 1.001, t * (stops.length - 1)), k = Math.floor(s), f = s - k;
    const a = stops[k], b = stops[k + 1];
    return `rgb(${a.map((v, n) => Math.round(v + (b[n] - v) * f)).join(',')})`;
  };
  const rampCache = Array.from({ length: 32 }, (_, i) => ramp(i / 31));

  const DURATION = { journey: 13.5, visual: 6, advise: 4, capture: 5, information: 6.5, sequence: 12.5, delivery: 7.8, twin: 6, drawings: 2, planning: 2, regs: 2 };
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
    let real = null, yaw = 0.62, baseYaw = 0.62, master = 1, width = 0, height = 0, scale = 1, ox = 0, oy = 0, visible = true, frame = 0, dirty = true;
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
      dirty = true;
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
      const names = ['Point cloud', '3D model', '3D visual', 'Real-time view'];
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
        sheet(t, ({ stroke, seg, box, note }) => {
          ctx.fillStyle = C.tint; ctx.fillRect(40, 240, 250, 90);
          stroke(4); box(40, 70, 250, 170);
          seg([165, 70], [165, 170], [290, 170]);
          stroke(3, C.greenDark); seg([40, 240], [40, 330], [290, 330], [290, 240]);
          stroke(1); ctx.beginPath(); ctx.arc(165, 170, 34, 0, Math.PI / 2); ctx.stroke();
          seg([165, 170], [165, 204]);
          stroke(1, C.line); seg([40, 50], [290, 50]); seg([40, 44], [40, 56]); seg([290, 44], [290, 56]);
          note('Plan', 40, 360); note('Proposed extension', 165, 285, 'center');
          stroke(3); seg([350, 330], [600, 330]); box(375, 190, 200, 140);
          seg([365, 190], [475, 105], [585, 190]);
          stroke(1.5); box(400, 215, 50, 40); box(500, 215, 50, 40); box(400, 275, 50, 40); box(500, 275, 32, 55);
          note('Elevation', 350, 360);
        });
      },
      planning(t) {
        sheet(t, ({ stroke, seg, box, note }) => {
          const BLUE = '#2553a8';
          stroke(1.5, C.line); seg([20, 395], [620, 395]); seg([20, 430], [620, 430]);
          stroke(1, C.ink);
          [[50, 305, 70, 60], [145, 300, 80, 65], [440, 305, 75, 60], [535, 300, 70, 65], [60, 165, 95, 75], [490, 165, 100, 80], [230, 45, 110, 60], [395, 45, 90, 60]].forEach((b) => box(...b));
          ctx.fillStyle = C.tint; ctx.fillRect(265, 225, 80, 80);
          stroke(1.5); box(265, 225, 80, 80);
          stroke(3, C.clash); box(240, 145, 130, 240);
          stroke(3, BLUE); box(370, 145, 80, 150);
          note('Application site', 305, 410, 'center'); note('Other land owned', 455, 130, 'center');
          stroke(2); seg([585, 110], [585, 55]); seg([573, 74], [585, 55], [597, 74]);
          note('N', 585, 40, 'center');
          stroke(2); seg([40, 455], [160, 455]); seg([40, 448], [40, 462]); seg([100, 450], [100, 460]); seg([160, 448], [160, 462]);
          note('Scale bar', 175, 455);
        });
      },
      regs(t) {
        sheet(t, ({ stroke, seg, box, note }) => {
          stroke(2); seg([30, 370], [400, 370]);
          ctx.fillStyle = C.tint; ctx.fillRect(70, 370, 170, 60);
          stroke(1.5); box(70, 370, 170, 60);
          stroke(3); box(120, 110, 22, 260); box(170, 110, 22, 260);
          stroke(2, C.greenDark); ctx.beginPath();
          for (let y = 112, i = 0; y <= 368; y += 8, i++) { const x = i % 2 ? 150 : 162; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
          stroke(3); seg([192, 345], [400, 345]);
          stroke(2.5, C.clash); seg([112, 352], [200, 352]);
          stroke(3); seg([95, 110], [290, 25], [400, 75]);
          stroke(2); seg([120, 110], [400, 110]);
          stroke(2, C.greenDark); ctx.beginPath();
          for (let x = 200, i = 0; x <= 396; x += 10, i++) { const y = i % 2 ? 96 : 106; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
          stroke(1);
          [['Roof insulation', 300, 100, 80], ['Cavity insulation', 156, 220, 200], ['Floor structure', 390, 345, 290], ['Damp-proof course', 200, 352, 350], ['Foundation', 240, 400, 410]].forEach(([text, x, y, ly]) => {
            seg([x, y], [440, ly]); note(text, 446, ly);
          });
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
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
        for (const [dx, dy] of [[-1.1, 0.3], [1, 0.5], [0.1, -1]]) line(head, project(SCANNER.x + dx, SCANNER.y + dy, 0));
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(head[0], head[1] - 4, 5, 0, 7); ctx.fill();
        label('Laser scan', base[0], base[1] + 18, { align: 'center' });
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
      const elapsed = (now - started) / 1000;
      const t = Math.min(elapsed, length);
      // The 4D view makes room for its programme chart.
      const fit = Math.min(width / 54, height / 38);
      const planned = state === 'sequence';
      scale = planned ? fit * 0.72 : fit;
      ox = width / 2;
      oy = planned ? height * 0.5 : height * 0.7;
      (render[state] || render.advise)(t);
      dirty = false;
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
      get dirty() { return dirty; },
    };
  }

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => v * v * (3 - 2 * v);

  function start() {
    document.querySelectorAll('[data-model]').forEach((root) => {
      const model = create(root);
      // The 3D animation loads after the page. The render is the fallback and the end frame.
      const mode = root.dataset.state;
      const showRender = () => {
        const photo = new Image();
        photo.src = '/img/ibim-visual.webp?v=2';
        photo.alt = 'Realistic illustrative render of a glazed office building with a brick base, trees and people.';
        photo.className = 'model__photo model__photo--static';
        root.querySelector('canvas').after(photo);
      };
      if (mode === 'visual') {
        showRender();
      } else if (mode === 'journey') {
        const load = () => import('/js/visual3d.js?v=7')
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
      };
      stops.forEach((s) => s.addEventListener('click', () => select(s.dataset.stop)));
    });
  }

  // Canvas labels need the brand font loaded before the first draw.
  const load = document.fonts && document.fonts.load ? document.fonts.load(`11px "Space Mono"`) : Promise.resolve();
  load.catch(() => {}).then(start);
})();
