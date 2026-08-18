(function () {
  function initBackgroundAnimation() {
    const canvas = document.getElementById('bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const CELL = 38;
    const SC = [180, 220, 255];
    const NC = [255, 255, 255];
    
    let W, H, cols, rows, t = 0;
    let nodes = [], streams = [], packets = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cols = Math.floor(W / CELL);
      rows = Math.floor(H / CELL);
      buildGraph();
    }

    function gx(c) { return c * CELL + CELL / 2; }
    function gy(r) { return r * CELL + CELL / 2; }

    function buildGraph() {
      nodes = []; streams = []; packets = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) nodes.push({ c, r, lit: 0 });
      }
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c < cols; c++) streams.push({ c1: c, r1: r, c2: c + 1, r2: r });
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols; c++) streams.push({ c1: c, r1: r, c2: c, r2: r + 1 });
      }
    }

    function spawnPacket() {
      const edge = Math.floor(Math.random() * 4);
      let c, r, dc, dr;
      if (edge === 0) { c = Math.floor(Math.random() * (cols + 1)); r = 0; dc = 0; dr = 1; }
      else if (edge === 1) { c = cols; r = Math.floor(Math.random() * (rows + 1)); dc = -1; dr = 0; }
      else if (edge === 2) { c = Math.floor(Math.random() * (cols + 1)); r = rows; dc = 0; dr = -1; }
      else { c = 0; r = Math.floor(Math.random() * (rows + 1)); dc = 1; dr = 0; }

      const turns = Math.floor(4 + Math.random() * 8);
      const path = [];
      let cc = c, rr = r, dcc = dc, drr = dr;

      for (let i = 0; i < turns; i++) {
        const steps = Math.floor(2 + Math.random() * 5);
        for (let s = 0; s < steps; s++) {
          path.push({ c: cc, r: rr });
          cc += dcc; rr += drr;
          if (cc < 0 || cc > cols || rr < 0 || rr > rows) break;
        }
        if (cc < 0 || cc > cols || rr < 0 || rr > rows) break;
        if (Math.random() > 0.5) { const tmp = dcc; dcc = drr; drr = tmp; }
        else { dcc = -drr; drr = -dcc; }
      }
      if (path.length < 2) return;
      packets.push({ path, pos: 0, speed: 0.04 + Math.random() * 0.04, alpha: 0.7 + Math.random() * 0.3, tail: Math.floor(6 + Math.random() * 10) });
    }

    function nIdx(c, r) { return r * (cols + 1) + c; }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;

      for (const s of streams) {
        ctx.beginPath();
        ctx.moveTo(gx(s.c1), gy(s.r1));
        ctx.lineTo(gx(s.c2), gy(s.r2));
        ctx.stroke();
      }

      for (const p of packets) {
        const total = p.path.length - 1;
        const hi = Math.min(Math.floor(p.pos), total);
        const frac = p.pos - Math.floor(p.pos);
        const head = p.path[hi];
        const next = p.path[Math.min(hi + 1, total)];
        const hx = gx(head.c) + (gx(next.c) - gx(head.c)) * frac;
        const hy = gy(head.r) + (gy(next.r) - gy(head.r)) * frac;

        for (let ti = 0; ti < p.tail; ti++) {
          const tI = hi - ti;
          if (tI < 0) break;
          const alpha = p.alpha * (1 - ti / p.tail) * 0.5;
          const tp = p.path[tI];
          const tnx = p.path[Math.min(tI + 1, total)];
          const tfrac = tI === hi ? frac : 1;
          const tx = gx(tp.c) + (gx(tnx.c) - gx(tp.c)) * tfrac;
          const ty = gy(tp.r) + (gy(tnx.r) - gy(tp.r)) * tfrac;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${SC},${alpha})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${NC},${p.alpha})`;
        ctx.fill();

        const ni = nIdx(head.c, head.r);
        if (nodes[ni]) nodes[ni].lit = 1.0;
        p.pos += p.speed;
      }

      for (const n of nodes) {
        if (n.lit > 0.01) {
          ctx.beginPath();
          ctx.arc(gx(n.c), gy(n.r), 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${NC},${n.lit * 0.6})`;
          ctx.fill();
          n.lit *= 0.92;
        }
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        if (packets[i].pos >= packets[i].path.length - 1) packets.splice(i, 1);
      }

      t++;
      if (t % 18 === 0) spawnPacket();
      if (packets.length < 4) spawnPacket();
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    for (let i = 0; i < 6; i++) spawnPacket();
    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgroundAnimation);
  } else {
    initBackgroundAnimation();
  }
})();
