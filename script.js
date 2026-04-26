/* ─── 1. Custom cursor ─────────────────────────────────── */
const cursorRing = document.getElementById('cursor');
const cursorDot  = document.getElementById('cursorDot');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});

(function lerpCursor() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(lerpCursor);
})();

// Enlarge ring on interactive elements
document.querySelectorAll('a, button, .badge, .avatar-wrap').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});

/* ─── 2. Particle canvas ───────────────────────────────── */
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const COLS = ['rgba(129,140,248,A)', 'rgba(56,189,248,A)', 'rgba(168,85,247,A)', 'rgba(255,255,255,A)'];

class Dot {
  constructor(scatter) {
    this.reset(scatter);
  }
  reset(scatter) {
    this.x     = Math.random() * W;
    this.y     = scatter ? Math.random() * H : H + 6;
    this.r     = Math.random() * 1.4 + 0.2;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = -(Math.random() * 0.5 + 0.15);
    const a    = (Math.random() * 0.35 + 0.05).toFixed(2);
    this.color = COLS[Math.floor(Math.random() * COLS.length)].replace('A', a);
    this.life  = 0;
    this.max   = Math.random() * 280 + 140;
  }
  tick() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.y < -6 || this.life > this.max) this.reset(false);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const dots = Array.from({ length: 60 }, () => new Dot(true));

// subtle connection lines
function drawLines() {
  const MAX = 80;
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const d  = Math.hypot(dx, dy);
      if (d < MAX) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `rgba(129,140,248,${(1 - d / MAX) * 0.06})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
  }
}

(function loop() {
  ctx.clearRect(0, 0, W, H);
  drawLines();
  dots.forEach(d => { d.tick(); d.draw(); });
  requestAnimationFrame(loop);
})();

/* ─── 3. Card 3D tilt ──────────────────────────────────── */
const card = document.getElementById('card');

document.addEventListener('mousemove', e => {
  const r   = card.getBoundingClientRect();
  const cx  = r.left + r.width  / 2;
  const cy  = r.top  + r.height / 2;
  const nx  = (e.clientX - cx) / (r.width  / 2); // -1 to 1
  const ny  = (e.clientY - cy) / (r.height / 2);
  const deg = 5;
  card.style.transform = `perspective(1000px) rotateX(${-ny * deg}deg) rotateY(${nx * deg}deg)`;
});
document.addEventListener('mouseleave', () => {
  card.style.transform = '';
});
card.style.transition = 'transform 0.18s ease';

/* ─── 4. Typing bio ────────────────────────────────────── */
const bio     = document.getElementById('bioEl');
const bioStr  = 'just a person doing things on the internet. discord nerd & vibe curator ✦';
let   bioIdx  = 0;

function typeBio() {
  if (bioIdx < bioStr.length) {
    bio.textContent += bioStr[bioIdx++];
    setTimeout(typeBio, 26 + Math.random() * 18);
  }
}
setTimeout(typeBio, 1000);

/* ─── 5. Profile view counter (localStorage) ───────────── */
const viewsEl = document.getElementById('viewsNum');

(function initViews() {
  const KEY = 'gabkoss_profile_views';
  let count = parseInt(localStorage.getItem(KEY) || '0', 10);
  count += 1;
  localStorage.setItem(KEY, count);

  // animate counting up to the stored value
  const duration = 1400;
  const start = performance.now();
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  (function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const val = Math.round(easeOut(t) * count);
    viewsEl.textContent = val.toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  })(performance.now());
})();

/* ─── 6. Social row ripple click ───────────────────────── */
document.querySelectorAll('.social-row').forEach(row => {
  row.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 1.8;
    ripple.style.cssText = `
      position:absolute;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(255,255,255,0.06);
      transform:scale(0);
      animation:ripple 0.45s ease-out forwards;
      pointer-events:none;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

const rStyle = document.createElement('style');
rStyle.textContent = '@keyframes ripple { to { transform:scale(1); opacity:0; } }';
document.head.appendChild(rStyle);

/* ─── 7. Music player ──────────────────────────────────── */
const audio   = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const icoPlay = document.getElementById('ico-play');
const icoPause= document.getElementById('ico-pause');
const eqBars  = document.getElementById('eqBars');
let   playing = false;

function setPlay(state) {
  playing = state;
  if (state) {
    audio.play().catch(() => {});
    icoPlay.style.display  = 'none';
    icoPause.style.display = '';
    eqBars.classList.add('active');
  } else {
    audio.pause();
    icoPlay.style.display  = '';
    icoPause.style.display = 'none';
    eqBars.classList.remove('active');
  }
}

playBtn.addEventListener('click', () => setPlay(!playing));

// autoplay on first interaction
let didAuto = false;
function autoplay() {
  if (!didAuto) { didAuto = true; setPlay(true); }
  document.removeEventListener('click', autoplay);
  document.removeEventListener('keydown', autoplay);
}
document.addEventListener('click', autoplay);
document.addEventListener('keydown', autoplay);
