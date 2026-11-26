/* DJ Spin That Booth: stickers and logos layer, shared by the GIF and Photocard pages.
   Sticker art follows Leilei's Little DJ Studio style: die-cut white edge, soft shadow, emoji + Fredoka/Nunito/Noto Sans KR. */
(function () {
  const fl = document.createElement('link'); fl.rel = 'stylesheet';
  fl.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@800;900&family=Noto+Sans+KR:wght@700;900&display=swap';
  document.head.appendChild(fl);

  const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const MEM = {
    rm: { n: 'RM', kr: '알엠', c: '#9aa1ad', e: '🐨' }, jin: { n: 'Jin', kr: '진', c: '#ff6fb5', e: '🐹' },
    suga: { n: 'SUGA', kr: '슈가', c: '#8a93a3', e: '🐱' }, jhope: { n: 'j-hope', kr: '제이홉', c: '#f0a500', e: '🐿️' },
    jimin: { n: 'Jimin', kr: '지민', c: '#3a3a46', e: '🐥' }, v: { n: 'V', kr: '뷔', c: '#e0263a', e: '🐯' },
    jk: { n: 'Jung Kook', kr: '정국', c: '#d4a53a', e: '🐰' }, ot7: { n: 'OT7', kr: '방탄소년단', c: '#7c3aed', e: '💜' }
  };
  const CITIES = [['Goyang','🇰🇷'],['Tokyo','🇯🇵'],['Tampa','🇺🇸'],['El Paso','🇺🇸'],['Mexico City','🇲🇽'],['Stanford','🇺🇸'],['Las Vegas','🇺🇸'],['Busan','🇰🇷'],['Madrid','🇪🇸'],['Brussels','🇧🇪'],['London','🇬🇧'],['Munich','🇩🇪'],['Paris','🇫🇷'],['East Rutherford','🇺🇸'],['Foxborough','🇺🇸'],['Baltimore','🇺🇸'],['Arlington','🇺🇸'],['Toronto','🇨🇦'],['Chicago','🇺🇸'],['Los Angeles','🇺🇸'],['Bogotá','🇨🇴'],['Lima','🇵🇪'],['Santiago','🇨🇱'],['Buenos Aires','🇦🇷'],['São Paulo','🇧🇷'],['Kaohsiung','🇹🇼'],['Bangkok','🇹🇭'],['Kuala Lumpur','🇲🇾'],['Singapore','🇸🇬'],['Jakarta','🇮🇩'],['Melbourne','🇦🇺'],['Sydney','🇦🇺'],['Hong Kong','🇭🇰'],['Manila','🇵🇭']];

  const LIB = [];
  [['dj','DJ Spin That','record'],['bio','Link in bio','pill'],['site','djspinthat.net','pill2'],['bora','Borahae','pill3'],['new','New post!','burst']]
    .forEach(([id, label, look]) => LIB.push({ id: 'd-' + id, kind: 'brand', look, label, set: 'DJ Spin That' }));
  ['rm','jin','suga','jhope','jimin','v','jk','ot7'].forEach(k => LIB.push({ id: 'm-' + k, kind: 'member', m: k, label: MEM[k].n, set: 'Members' }));
  [['사랑해','sa-rang-hae'],['보라해','bo-ra-hae'],['화이팅','hwa-i-ting'],['대박','dae-bak'],['아미','a-mi'],['봄날','bom-nal'],['고마워','go-ma-wo'],['친구','chin-gu'],['행복','haeng-bok'],['안녕','an-nyeong']]
    .forEach(([w, r], i) => LIB.push({ id: 'w-' + i, kind: 'word', w, label: r, set: 'Korean words' }));
  CITIES.forEach(([c, f]) => LIB.push({ id: 'c-' + c, kind: 'city', city: c, f, label: c, set: 'Tour stamps' }));
  [['💜','Borahae','#c4a8ff'],['🎧','DJ','#ffd6e8'],['⭐','Star','#fff1c2'],['🌙','Moon','#d9e4ff'],['🌸','Spring','#ffe0ef'],['🦋','Butterfly','#d6f5ff'],['🌊','Sea','#cbf5ee'],['🎤','Mic','#ffe4cc'],['🎫','Ticket','#fff1c2'],['🌈','Rainbow','#f1e6ff'],['💌','Love letter','#ffd6e8'],['🫰','Finger heart','#ffe0ef']]
    .forEach(([e, l, c], i) => LIB.push({ id: 'f-' + i, kind: 'fun', e, label: l, c, set: 'Fun' }));
  LIB.push({ id: 'x-whale', kind: 'img', src: 'purple-whale.png', label: 'Purple Whale', set: 'Fun' });
  const SETS = ['DJ Spin That', 'Members', 'Korean words', 'Tour stamps', 'Fun', 'My logos'];
  const IMG = {};
  const byId = id => LIB.find(s => s.id === id);

  function loadImg(s) {
    if (IMG[s.id]) return;
    const im = new Image(); im.onload = () => { IMG[s.id] = im; delete cache[s.id]; refreshThumbs(); changed(); }; im.src = s.src;
  }
  LIB.filter(s => s.kind === 'img').forEach(loadImg);

  /* ---------- drawing (400 x 400 sticker space) ---------- */
  function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function star(x, cx, cy, R, r, n) { x.beginPath(); for (let k = 0; k < n * 2; k++) { const a = -Math.PI / 2 + k * Math.PI / n, d = k % 2 ? r : R; x.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); } x.closePath(); }
  function heart(x, cx, cy, s) { x.beginPath(); x.moveTo(cx, cy + s * .42); x.bezierCurveTo(cx - s * .9, cy - s * .15, cx - s * .45, cy - s * .75, cx, cy - s * .3); x.bezierCurveTo(cx + s * .45, cy - s * .75, cx + s * .9, cy - s * .15, cx, cy + s * .42); x.closePath(); }
  function fit(x, t, font, max, size) { let s = size; do { x.font = font.replace('{s}', s); s -= 2; } while (x.measureText(t).width > max && s > 10); return s + 2; }
  function dieCut(x, shape) { x.save(); x.shadowColor = 'rgba(40,10,80,.28)'; x.shadowBlur = 14; x.shadowOffsetY = 5; x.fillStyle = '#fff'; shape(); x.fill(); x.restore(); }
  function grad(x, a, b) { const g = x.createLinearGradient(0, 40, 400, 360); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function pill(x, text, sub, bg, ink) {
    dieCut(x, () => rr(x, 14, 120, 372, 160, 80)); rr(x, 28, 134, 344, 132, 66); x.fillStyle = bg; x.fill();
    const fs = fit(x, text, "700 {s}px Fredoka,sans-serif", 300, 64); x.font = `700 ${fs}px Fredoka,sans-serif`; x.fillStyle = ink; x.fillText(text, 200, sub ? 186 : 202);
    if (sub) { x.font = "900 24px Nunito,sans-serif"; x.globalAlpha = .85; x.fillText(sub, 200, 236); x.globalAlpha = 1; }
  }
  function paint(x, s) {
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (s.kind === 'member') {
      const d = MEM[s.m]; dieCut(x, () => { x.beginPath(); x.arc(200, 200, 186, 0, 7); });
      x.beginPath(); x.arc(200, 200, 168, 0, 7); x.fillStyle = s.m === 'ot7' ? grad(x, '#a78bfa', '#ec4899') : grad(x, '#fff', d.c); x.fill();
      x.font = '150px ' + EMOJI; x.fillText(d.e, 200, 170);
      x.fillStyle = '#fff'; rr(x, 70, 262, 260, 74, 37); x.fill(); x.fillStyle = '#2a1650';
      const fs = fit(x, d.n, "700 {s}px Fredoka,sans-serif", 230, 46); x.font = `700 ${fs}px Fredoka,sans-serif`; x.fillText(d.n, 200, 292);
      x.font = "900 22px 'Noto Sans KR',sans-serif"; x.fillStyle = '#5b4a82'; x.fillText(d.kr, 200, 322);
    } else if (s.kind === 'word') {
      dieCut(x, () => heart(x, 200, 215, 370)); heart(x, 200, 215, 330); x.fillStyle = grad(x, '#c4a8ff', '#ff8fc8'); x.fill();
      const fs = fit(x, s.w, "900 {s}px 'Noto Sans KR',sans-serif", 250, 96); x.font = `900 ${fs}px 'Noto Sans KR',sans-serif`;
      x.lineWidth = 10; x.strokeStyle = '#5b21b6'; x.strokeText(s.w, 200, 175); x.fillStyle = '#fff'; x.fillText(s.w, 200, 175);
      x.font = "800 30px Nunito,sans-serif"; x.fillStyle = '#3b0764'; x.fillText(s.label, 200, 250);
    } else if (s.kind === 'city') {
      dieCut(x, () => star(x, 200, 200, 190, 166, 16)); star(x, 200, 200, 174, 152, 16); x.fillStyle = '#fff1c2'; x.fill();
      x.beginPath(); x.arc(200, 200, 132, 0, 7); x.setLineDash([10, 8]); x.lineWidth = 6; x.strokeStyle = '#a87a00'; x.stroke(); x.setLineDash([]);
      x.font = '100px ' + EMOJI; x.fillText(s.f, 200, 160);
      x.fillStyle = '#7a2e00'; const t = s.city.toUpperCase(), fs = fit(x, t, "700 {s}px Fredoka,sans-serif", 220, 44); x.font = `700 ${fs}px Fredoka,sans-serif`; x.fillText(t, 200, 240);
      x.font = "800 20px Nunito,sans-serif"; x.fillStyle = '#a87a00'; x.fillText('ARIRANG TOUR ✓', 200, 282);
    } else if (s.kind === 'img') {
      const im = IMG[s.id]; if (!im) return;
      const k = Math.min(390 / im.width, 390 / im.height); x.save(); x.shadowColor = 'rgba(40,10,80,.28)'; x.shadowBlur = s.flat ? 0 : 14; x.shadowOffsetY = s.flat ? 0 : 5;
      x.drawImage(im, 200 - im.width * k / 2, 200 - im.height * k / 2, im.width * k, im.height * k); x.restore();
    } else if (s.kind === 'brand') {
      if (s.look === 'record') {
        dieCut(x, () => { x.beginPath(); x.arc(200, 200, 190, 0, 7); });
        x.beginPath(); x.arc(200, 200, 174, 0, 7); x.fillStyle = '#16101f'; x.fill();
        x.strokeStyle = 'rgba(255,255,255,.10)'; x.lineWidth = 2; for (let r = 150; r > 80; r -= 12) { x.beginPath(); x.arc(200, 200, r, 0, 7); x.stroke(); }
        x.beginPath(); x.arc(200, 200, 78, 0, 7); const g = x.createLinearGradient(122, 0, 278, 0); g.addColorStop(0, '#ff2a4b'); g.addColorStop(.5, '#ff63a9'); g.addColorStop(1, '#a855f7'); x.fillStyle = g; x.fill();
        x.fillStyle = '#fff'; x.font = "700 30px Fredoka,sans-serif"; x.fillText('DJ SPIN', 200, 186); x.fillText('THAT', 200, 218);
        x.beginPath(); x.arc(200, 200, 7, 0, 7); x.fillStyle = '#16101f'; x.fill();
      } else if (s.look === 'pill') pill(x, 'LINK IN BIO', '👆 tap my profile', '#ff2a4b', '#fff');
      else if (s.look === 'pill2') pill(x, 'djspinthat.net', 'fan-made 💜', '#1a1129', '#fff');
      else if (s.look === 'pill3') pill(x, '보라해 💜', 'borahae', '#c4a8ff', '#3b0764');
      else { dieCut(x, () => star(x, 200, 200, 196, 150, 12)); star(x, 200, 200, 178, 136, 12); x.fillStyle = '#ffe14d'; x.fill();
        x.fillStyle = '#ff2a4b'; x.font = "700 62px Fredoka,sans-serif"; x.fillText('NEW', 200, 176); x.font = "700 52px Fredoka,sans-serif"; x.fillText('POST!', 200, 232); }
    } else {
      dieCut(x, () => star(x, 200, 205, 196, 120, 6)); star(x, 200, 205, 176, 108, 6); x.fillStyle = s.c; x.fill(); x.font = '140px ' + EMOJI; x.fillText(s.e, 200, 190);
      x.fillStyle = '#2a1650'; const fs = fit(x, s.label, "700 {s}px Fredoka,sans-serif", 200, 38); x.font = `700 ${fs}px Fredoka,sans-serif`; x.fillText(s.label, 200, 300);
    }
  }
  const cache = {};
  function art(s) { // 400px pre-rendered sticker, so GIF frames stay fast
    if (cache[s.id]) return cache[s.id];
    const c = document.createElement('canvas'); c.width = c.height = 400; paint(c.getContext('2d'), s);
    if (s.kind !== 'img' || IMG[s.id]) cache[s.id] = c; return c;
  }
  document.fonts && document.fonts.ready.then(() => { for (const k in cache) delete cache[k]; refreshThumbs(); changed(); });

  /* ---------- placed stickers ---------- */
  let placed = [], sel = -1, opts = {}, curSet = 'DJ Spin That';
  function changed() { renderPlaced(); opts.onChange && opts.onChange(); }
  function drawOn(ctx, W, H) {
    const m = Math.min(W, H);
    for (const p of placed) {
      const s = byId(p.id); if (!s) continue; const S = p.size * m;
      ctx.save(); ctx.translate(p.x * W, p.y * H); ctx.rotate(p.rot * Math.PI / 180); ctx.drawImage(art(s), -S / 2, -S / 2, S, S); ctx.restore();
    }
  }
  function add(id) { placed.push({ id, x: .5, y: .5, size: .32, rot: 0 }); sel = placed.length - 1; changed(); }

  /* ---------- panel ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .stk-sets{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:8px}
  .stk-sets button{flex:none;border-radius:99px;padding:7px 12px;font-size:14px;min-height:38px}
  .stk-sets button[aria-pressed=true]{background:#ff5468;border-color:#ff5468;color:#1a0b14;font-weight:600}
  .stk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:6px;max-height:228px;overflow-y:auto;padding:2px}
  .stk-grid button{padding:4px;border-radius:12px;min-height:0;display:grid;gap:2px;justify-items:center;font-size:11px;line-height:1.2;color:#c2b4dc}
  .stk-grid canvas{width:56px;height:56px}
  .stk-up{border-style:dashed!important;place-content:center;font-size:13px!important;min-height:76px!important}
  .stk-placed{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 4px}
  .stk-placed button{padding:3px;border-radius:10px;min-height:0;line-height:0}
  .stk-placed button[aria-pressed=true]{border-color:#ff5468;box-shadow:0 0 0 2px #ff5468}
  .stk-placed canvas{width:40px;height:40px}
  .stk-ctl{display:grid;grid-template-columns:86px 1fr;gap:4px 10px;align-items:center;font-size:14px;color:#c2b4dc;margin-top:6px}
  .stk-ctl input[type=range]{width:100%;accent-color:#ff5468}
  .stk-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
  .stk-hint{font-size:13px;color:#c2b4dc;margin-top:6px}`;
  document.head.appendChild(css);
  let panel;
  function thumb(s, size) { const c = document.createElement('canvas'); c.width = c.height = size * 2; c.dataset.stk = s.id; c.getContext('2d').drawImage(art(s), 0, 0, size * 2, size * 2); return c; }
  function refreshThumbs() { if (!panel) return; renderGrid(); renderPlaced(); }
  function renderGrid() {
    const sets = panel.querySelector('.stk-sets'), grid = panel.querySelector('.stk-grid');
    sets.innerHTML = ''; SETS.forEach(n => { const b = document.createElement('button'); b.type = 'button'; b.textContent = n; b.setAttribute('aria-pressed', n === curSet); b.onclick = () => { curSet = n; renderGrid(); }; sets.appendChild(b); });
    grid.innerHTML = '';
    LIB.filter(s => s.set === curSet).forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.title = 'Add ' + s.label; b.appendChild(thumb(s, 56)); const t = document.createElement('span'); t.textContent = s.label; b.appendChild(t); b.onclick = () => add(s.id); grid.appendChild(b); });
    if (curSet === 'My logos') {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'stk-up'; b.textContent = '+ Upload a logo or sticker (PNG)';
      b.onclick = () => panel.querySelector('.stk-file').click(); grid.appendChild(b);
    }
  }
  function renderPlaced() {
    if (!panel) return;
    const box = panel.querySelector('.stk-placed'), ctl = panel.querySelector('.stk-edit');
    box.innerHTML = '';
    placed.forEach((p, i) => { const s = byId(p.id); if (!s) return; const b = document.createElement('button'); b.type = 'button'; b.title = s.label; b.setAttribute('aria-pressed', i === sel); b.appendChild(thumb(s, 40)); b.onclick = () => { sel = i; renderPlaced(); }; box.appendChild(b); });
    panel.querySelector('.stk-none').hidden = placed.length > 0;
    ctl.hidden = !(sel >= 0 && placed[sel]);
    if (!ctl.hidden) { const p = placed[sel]; ctl.querySelector('[data-k=size]').value = Math.round(p.size * 100); ctl.querySelector('[data-k=rot]').value = p.rot; ctl.querySelector('[data-k=x]').value = Math.round(p.x * 100); ctl.querySelector('[data-k=y]').value = Math.round(p.y * 100); }
  }
  function mount(el) {
    panel = el;
    el.innerHTML = `<div class="stk-sets"></div><div class="stk-grid"></div><input class="stk-file" type="file" accept="image/png,image/webp,image/gif,image/jpeg,image/svg+xml" multiple hidden>
      <div class="stk-placed"></div><div class="stk-hint stk-none">Tap a sticker to add it. Then drag it on the preview to move it.</div>
      <div class="stk-edit" hidden>
        <div class="stk-ctl"><span>Size</span><input type="range" data-k="size" min="6" max="90" step="1"><span>Turn</span><input type="range" data-k="rot" min="-45" max="45" step="1"><span>Left ↔ Right</span><input type="range" data-k="x" min="0" max="100" step="1"><span>Up ↕ Down</span><input type="range" data-k="y" min="0" max="100" step="1"></div>
        <div class="stk-row"><button type="button" data-a="front">Bring to front</button><button type="button" data-a="dup">Duplicate</button><button type="button" data-a="del">Remove</button><button type="button" data-a="clear">Clear all</button></div>
        <div class="stk-hint">Drag stickers on the preview to move them. They show up in everything you make.</div>
      </div>`;
    el.querySelectorAll('.stk-ctl input').forEach(r => r.addEventListener('input', () => {
      const p = placed[sel]; if (!p) return; const v = +r.value, k = r.dataset.k;
      if (k === 'size') p.size = v / 100; else if (k === 'rot') p.rot = v; else p[k] = v / 100; opts.onChange && opts.onChange();
    }));
    el.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.a;
      if (a === 'clear') { placed = []; sel = -1; }
      else if (placed[sel]) {
        if (a === 'del') { placed.splice(sel, 1); sel = placed.length - 1; }
        else if (a === 'front') { placed.push(placed.splice(sel, 1)[0]); sel = placed.length - 1; }
        else if (a === 'dup') { const p = placed[sel]; placed.push({ ...p, x: Math.min(.95, p.x + .06), y: Math.min(.95, p.y + .06) }); sel = placed.length - 1; }
      }
      changed();
    }));
    el.querySelector('.stk-file').addEventListener('change', e => {
      [...e.target.files].forEach((f, i) => {
        const s = { id: 'u-' + Date.now() + '-' + i, kind: 'img', flat: true, src: URL.createObjectURL(f), label: f.name.replace(/\.[^.]+$/, '').slice(0, 18), set: 'My logos' };
        LIB.push(s); const im = new Image(); im.onload = () => { IMG[s.id] = im; delete cache[s.id]; add(s.id); renderGrid(); }; im.src = s.src;
      });
      e.target.value = '';
    });
    renderGrid(); renderPlaced();
  }

  /* ---------- drag on the preview ---------- */
  function attach(canvas, toFrac) {
    let d = null;
    canvas.addEventListener('pointerdown', e => {
      const f = toFrac(e); if (!f) return;
      const r = canvas.getBoundingClientRect(), m = Math.min(f.W, f.H);
      for (let i = placed.length - 1; i >= 0; i--) {
        const p = placed[i], dx = (f.x - p.x) * f.W, dy = (f.y - p.y) * f.H;
        if (Math.hypot(dx, dy) <= p.size * m * 0.5) {
          sel = i; d = { i, ox: f.x - p.x, oy: f.y - p.y }; renderPlaced();
          e.stopImmediatePropagation(); e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
          return;
        }
      }
    }, true);
    canvas.addEventListener('pointermove', e => {
      if (!d) return; e.stopImmediatePropagation(); const f = toFrac(e, true); if (!f) return;
      const p = placed[d.i]; p.x = Math.max(0, Math.min(1, f.x - d.ox)); p.y = Math.max(0, Math.min(1, f.y - d.oy)); opts.onChange && opts.onChange();
    }, true);
    const end = e => { if (d) { e.stopImmediatePropagation(); d = null; renderPlaced(); } };
    canvas.addEventListener('pointerup', end, true); canvas.addEventListener('pointercancel', end, true);
    canvas.style.touchAction = 'none';
  }

  window.Stickers = { init(o) { opts = o; if (o.panel) mount(o.panel); if (o.canvas) attach(o.canvas, o.toFrac); }, drawOn, count: () => placed.length };
})();
