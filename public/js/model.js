// One building, drawn in code, shown at each stage of its lifecycle.
(() => {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();
  const C = {
    ink: token('--ink'), green: token('--green'), greenDark: token('--green-dark'),
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
  const aMin = Math.min(...points.map((p) => p.a));
  const aMax = Math.max(...points.map((p) => p.a));

  // Scan intensity ramp: the colours a scanner viewer uses, and only ever used here.
  const ramp = (t) => {
    const stops = [[34, 83, 180], [31, 158, 137], [120, 190, 60], [240, 190, 40], [224, 70, 45]];
    const s = Math.min(stops.length - 1.001, t * (stops.length - 1)), k = Math.floor(s), f = s - k;
    const a = stops[k], b = stops[k + 1];
    return `rgb(${a.map((v, n) => Math.round(v + (b[n] - v) * f)).join(',')})`;
  };
  const rampCache = Array.from({ length: 32 }, (_, i) => ramp(i / 31));

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
    let yaw = 0.62, width = 0, height = 0, scale = 1, ox = 0, oy = 0, visible = true, frame = 0, dirty = true;
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
      ctx.globalAlpha = style.alpha ?? 1;
      for (const f of faces) {
        if (f.nx * sinY + f.ny * cosY <= 0) continue;
        path(f.pts);
        if (style.fill) { ctx.fillStyle = style.side || style.fill; ctx.fill(); }
        if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lw || 0.6; ctx.stroke(); }
      }
      path([p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)]);
      if (style.fill) { ctx.fillStyle = style.fill; ctx.fill(); }
      if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lw || 0.6; ctx.stroke(); }
      ctx.globalAlpha = 1;
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

    const render = {
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
        const period = 7;
        const k = reduced ? 1 : Math.min(1, (t % (period + 2)) / period);
        const sweep = aMin + (aMax - aMin) * k;
        const size = Math.max(1.2, scale * 0.13);
        for (const p of points) {
          if (p.a > sweep) continue;
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
      const t = (now - started) / 1000;
      // The 4D view makes room for its programme chart.
      const fit = Math.min(width / 54, height / 38);
      const planned = state === 'sequence';
      scale = planned ? fit * 0.72 : fit;
      ox = width / 2;
      oy = planned ? height * 0.5 : height * 0.7;
      (render[state] || render.advise)(t);
      dirty = false;
      if (!reduced) frame = requestAnimationFrame(draw);
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
      drag = { x: e.clientX, yaw };
      canvas.setPointerCapture(e.pointerId);
      root.dispatchEvent(new CustomEvent('modelinteract'));
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
      cosY = Math.cos(yaw); sinY = Math.sin(yaw);
      if (reduced) { frame = 0; request(); }
    });
    const end = () => { drag = null; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    resize();
    request();
    return {
      set(next) {
        state = next; started = performance.now();
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
      if (!('lifecycle' in root.dataset)) return;

      const stops = [...document.querySelectorAll('[data-stop]')];
      const panels = [...document.querySelectorAll('[data-panel]')];
      const order = stops.map((s) => s.dataset.stop);
      let timer = 0;
      const select = (name) => {
        stops.forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.stop === name)));
        panels.forEach((p) => { p.hidden = p.dataset.panel !== name; });
        model.set(name);
      };
      const stopAuto = () => { clearInterval(timer); timer = 0; };
      stops.forEach((s) => s.addEventListener('click', () => { stopAuto(); select(s.dataset.stop); }));
      root.addEventListener('modelinteract', stopAuto);
      if (!reduced) {
        let current = order.indexOf(root.dataset.state);
        timer = setInterval(() => {
          if (document.hidden || root.getBoundingClientRect().bottom < 0) return;
          current = (current + 1) % order.length;
          select(order[current]);
        }, 10000);
      }
    });
  }

  // Canvas labels need the brand font loaded before the first draw.
  const load = document.fonts && document.fonts.load ? document.fonts.load(`11px "Space Mono"`) : Promise.resolve();
  load.catch(() => {}).then(start);
})();
