const cv = document.getElementById("fx"), ctx = cv.getContext("2d", { alpha: true });
const intro = document.getElementById("intro"), card = document.getElementById("card");
const gift = document.getElementById("startButton"), replay = document.getElementById("replay");
const COLORS = ["#ff4d9d", "#ff8cc4", "#ffd27a", "#c07bff", "#ffffff", "#ff3f7f", "#6fe3ff"];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TAU = Math.PI * 2, rand = (a, b) => a + Math.random() * (b - a), pick = a => a[(Math.random() * a.length) | 0];
let W, H, DPR, started = false, sparks = [], rings = [], floaters = [], outline = [], nextShow = 0, shake = 0, Q = 1, last = 0, slow = 0, frames = 0;

// Pre-rendered glowing sprites: drawing images is far cheaper than shadowBlur/fillText every frame.
const SP = {};
function sprite(kind, color) {
  const key = kind + color; if (SP[key]) return SP[key];
  const c = document.createElement("canvas"), n = 64; c.width = c.height = n;
  const g = c.getContext("2d"); g.translate(n / 2, n / 2); g.fillStyle = color; g.shadowColor = color; g.shadowBlur = 10;
  g.beginPath();
  if (kind === "h") { for (let i = 0; i <= 60; i++) { const t = i / 60 * TAU, x = 16 * Math.sin(t) ** 3, y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); i ? g.lineTo(x * 1.05, y * 1.05 + 1) : g.moveTo(x * 1.05, y * 1.05 + 1); } }
  else if (kind === "s") { for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 20, a = i * Math.PI / 4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } }
  else if (kind === "c") g.rect(-9, -5, 18, 10);
  else g.arc(0, 0, 7, 0, TAU);
  g.closePath(); g.fill(); g.fill();
  return (SP[key] = c);
}
const KINDS = ["h", "h", "h", "s", "s", "c", "d"];
function put(img, x, y, s, rot, a) {
  const c = Math.cos(rot) * s * DPR / 64, n = Math.sin(rot) * s * DPR / 64;
  ctx.globalAlpha = a < 0 ? 0 : a > 1 ? 1 : a;
  ctx.setTransform(c, n, -n, c, x * DPR, y * DPR);
  ctx.drawImage(img, -32, -32);
}

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 1.5);
  W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  buildOutline(); floaters = Array.from({ length: Math.round((reduce ? 8 : 30) * Q) }, () => newFloater(true));
}
function buildOutline() {
  const n = Math.round(Math.min(170, W * H / 7000) * Math.max(Q, .5));
  outline = Array.from({ length: n }, (_, i) => ({ t: i / n * TAU, s: rand(10, 20), ph: rand(0, TAU), img: sprite("h", pick(COLORS.slice(0, 4))) }));
}
function newFloater(init) {
  return { x: rand(0, W), y: init ? rand(0, H) : H + 30, s: rand(14, 34), v: rand(18, 60), ph: rand(0, TAU), a: rand(.35, .8), img: sprite(Math.random() < .75 ? "h" : "s", pick(COLORS)) };
}
function burst(x, y, n, power = 1) {
  n = Math.round(n * Q);
  for (let i = 0; i < n && sparks.length < 380; i++) {
    const a = rand(0, TAU), v = rand(80, 640) * power;
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(0, 120), g: rand(160, 340), life: 1, d: rand(.35, .8), s: rand(14, 34), r: rand(0, 6), vr: rand(-8, 8), img: sprite(pick(KINDS), pick(COLORS)) });
  }
  rings.push({ x, y, r: 10, a: 1, v: 520, img: sprite("d", "#ff8cc4") }, { x, y, r: 4, a: .9, v: 760, img: sprite("d", "#ffd27a") });
}

function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min((t - last) / 1000 || .016, .05); last = t;
  // adaptive quality: if frames are slow for ~1s, trim effects automatically
  frames++; if (dt > .026) slow++;
  if (frames === 60) { if (slow > 25 && Q > .35) { Q -= .25; resize(); } frames = slow = 0; }

  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = "lighter"; // additive light = brighter, glowing look
  if (shake > 0) { ctx.translate(rand(-shake, shake), rand(-shake, shake)); shake *= .88; if (shake < .4) shake = 0; }

  for (let i = 0; i < floaters.length; i++) {
    const f = floaters[i]; f.y -= f.v * dt; if (f.y < -40) floaters[i] = newFloater(false);
    put(f.img, f.x + Math.sin(t * .001 + f.ph) * 20, f.y, f.s, Math.sin(t * .0008 + f.ph) * .4, f.a * (.7 + .3 * Math.sin(t * .003 + f.ph)));
  }

  const beat = Math.max(0, Math.sin(t * .0042)) ** 6;
  const sc = Math.min(W * .017, H * .0125, 11) * (started ? 1.25 : 1) * (1 + beat * .07);
  const cx = W / 2, cy = H / 2 + (started ? 0 : -H * .02), sweep = (t * .00018) % 1;
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i], th = p.t, x = 16 * Math.sin(th) ** 3 * sc, y = -(13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th)) * sc;
    let d = Math.abs(th / TAU - sweep); d = d > .5 ? 1 - d : d;
    const g = Math.max(0, 1 - d * 9), w = Math.sin(t * .0012 + p.ph) * 2.5;
    put(p.img, cx + x + w, cy + y + w, p.s * (1 + g * .8), 0, (started ? .55 : .95) * (.6 + .4 * Math.sin(t * .002 + i)) + g * .4);
  }

  if (started) {
    if (t > nextShow) { nextShow = t + rand(1100, 2000); burst(rand(W * .1, W * .9), rand(H * .1, H * .55), reduce ? 20 : 48, .75); }
    if (!reduce && Math.random() < .22 * Q) sparks.push({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(90, 190), g: 8, life: 1, d: .12, s: rand(14, 24), r: rand(0, 6), vr: rand(-4, 4), img: sprite(pick(["c", "h", "d"]), pick(COLORS)) });
  }

  let k = 0;
  for (let i = 0; i < sparks.length; i++) {
    const p = sparks[i]; p.vx *= 1 - 1.4 * dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= p.d * dt;
    if (p.life > 0 && p.y < H + 40) { put(p.img, p.x, p.y, p.s, p.r, p.life * 1.6); sparks[k++] = p; }
  }
  sparks.length = k;

  k = 0;
  for (let i = 0; i < rings.length; i++) {
    const r = rings[i]; r.r += r.v * dt; r.a *= 1 - 3.2 * dt;
    if (r.a > .03) { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = r.a; ctx.strokeStyle = r.img === SP["d#ff8cc4"] ? "#ff8cc4" : "#ffd27a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke(); rings[k++] = r; }
  }
  rings.length = k;
}

function open() {
  const b = gift.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
  gift.disabled = true; shake = 10 * DPR;
  burst(x, y, reduce ? 50 : 150, 1.3);
  setTimeout(() => burst(x, y, 100, 1.8), 200);
  setTimeout(() => { burst(W * .2, H * .35, 50, .9); burst(W * .8, H * .35, 50, .9); }, 450);
  intro.classList.add("leaving");
  setTimeout(() => {
    intro.classList.add("hidden"); card.classList.remove("hidden", "show"); void card.offsetWidth; card.classList.add("show");
    started = true; nextShow = performance.now() + 1200;
    burst(W / 2, H * .4, reduce ? 40 : 110, 1.5);
  }, 600);
}
function again() { started = false; card.classList.add("hidden"); intro.classList.remove("hidden", "leaving"); gift.disabled = false; }
gift.addEventListener("click", open);
replay.addEventListener("click", again);
let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
resize(); requestAnimationFrame(frame);
