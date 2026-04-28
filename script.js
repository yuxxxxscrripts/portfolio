/* ─── 1. Splash / click-to-enter ──────────────────────────
   Dismisses on any click/tap and starts audio immediately.   */
const splash = document.getElementById('splash');
let splashDone = false;

function dismissSplash() {
  if (splashDone) return;
  splashDone = true;
  splash.classList.add('hidden');

  // Start audio — this is guaranteed inside a user gesture
  const audio     = document.getElementById('audio');
  const playBtn   = document.getElementById('playBtn');
  const icoPlay   = document.getElementById('ico-play');
  const icoPause  = document.getElementById('ico-pause');
  const eqBars    = document.getElementById('eqBars');

  audio.play().then(() => {
    playing = true;
    icoPlay.style.display  = 'none';
    icoPause.style.display = '';
    eqBars.classList.add('active');
  }).catch(() => {});
}

splash.addEventListener('click', dismissSplash);
splash.addEventListener('touchstart', dismissSplash, { passive: true });

/* ─── 2. Custom cursor (GPU-accelerated) ──────────────── */
const cursorRing = document.getElementById('cursor');
const cursorDot  = document.getElementById('cursorDot');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursorDot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
}, { passive: true });

(function lerpCursor() {
  rx += (mx - rx) * 0.22;
  ry += (my - ry) * 0.22;
  cursorRing.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
  requestAnimationFrame(lerpCursor);
})();

document.querySelectorAll('a, button, .badge, .avatar-wrap').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});

/* ─── 3. Particle canvas (greyscale, optimised) ─────────── */
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize, { passive: true });

// All greyscale/white tones
const COLS = [
  'rgba(255,255,255,A)',
  'rgba(200,200,200,A)',
  'rgba(160,160,160,A)',
  'rgba(120,120,120,A)'
];

class Dot {
  constructor(scatter) { this.reset(scatter); }
  reset(scatter) {
    this.x = Math.random() * W;
    this.y = scatter ? Math.random() * H : H + 6;
    this.r = Math.random() * 1.2 + 0.2;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = -(Math.random() * 0.45 + 0.12);
    const a = (Math.random() * 0.2 + 0.03).toFixed(2);
    this.color = COLS[Math.floor(Math.random() * COLS.length)].replace('A', a);
    this.life = 0;
    this.max = Math.random() * 280 + 140;
  }
  tick() {
    this.x += this.vx; this.y += this.vy; this.life++;
    if (this.y < -6 || this.life > this.max) this.reset(false);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const dots = Array.from({ length: 38 }, () => new Dot(true));

let lineFrame = 0;
function drawLines() {
  lineFrame++;
  if (lineFrame % 2 !== 0) return;
  const MAX = 75;
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const d  = Math.hypot(dx, dy);
      if (d < MAX) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${(1 - d / MAX) * 0.04})`;
        ctx.lineWidth = 0.4;
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

/* ─── 4. Card 3D tilt ──────────────────────────────────── */
const card = document.getElementById('card');
let tiltPending = false, lastEx = 0, lastEy = 0;

document.addEventListener('mousemove', e => {
  lastEx = e.clientX; lastEy = e.clientY;
  if (!tiltPending) {
    tiltPending = true;
    requestAnimationFrame(() => {
      tiltPending = false;
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const nx = (lastEx - cx) / (r.width  / 2);
      const ny = (lastEy - cy) / (r.height / 2);
      card.style.transform = `perspective(1000px) rotateX(${-ny * 4}deg) rotateY(${nx * 4}deg)`;
    });
  }
}, { passive: true });

document.addEventListener('mouseleave', () => { card.style.transform = ''; });
card.style.transition = 'transform 0.2s ease';

/* ─── 5. Typing bio ────────────────────────────────────── */
const bio    = document.getElementById('bioEl');
const bioStr = 'just a person doing things on the internet. discord nerd & vibe curator ✦';
let bioIdx   = 0;

function typeBio() {
  if (bioIdx < bioStr.length) {
    bio.textContent += bioStr[bioIdx++];
    setTimeout(typeBio, 24 + Math.random() * 16);
  }
}
setTimeout(typeBio, 1200);

/* ─── 6. View counter — cookie-based, 1 count per visitor ─
   Uses a cookie with a 365-day expiry so the same browser
   is only counted once. The total is stored in localStorage
   so it persists across sessions.                            */
const viewsEl = document.getElementById('viewsNum');

(function initViews() {
  const SEEN_KEY  = 'gabkoss_seen';
  const COUNT_KEY = 'gabkoss_views';

  // Check if this browser has already been counted
  function getCookie(name) {
    return document.cookie.split('; ').find(r => r.startsWith(name + '=')) || null;
  }

  let count = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
  const alreadySeen = getCookie(SEEN_KEY);

  if (!alreadySeen) {
    count += 1;
    localStorage.setItem(COUNT_KEY, count);
    // Set cookie for 365 days
    const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${SEEN_KEY}=1; expires=${exp}; path=/; SameSite=Lax`;
  }

  // Animated count-up
  const duration = 1200;
  const start    = performance.now();
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  (function step(now) {
    const t = Math.min((now - start) / duration, 1);
    viewsEl.textContent = Math.round(easeOut(t) * count).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  })(performance.now());
})();

/* ─── 7. Social row ripple ─────────────────────────────── */
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
      background:rgba(255,255,255,0.05);
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

/* ─── 8. Music player ──────────────────────────────────── */
const audio    = document.getElementById('audio');
const playBtn  = document.getElementById('playBtn');
const icoPlay  = document.getElementById('ico-play');
const icoPause = document.getElementById('ico-pause');
const eqBars   = document.getElementById('eqBars');
let playing = false;

function setPlay(state) {
  playing = state;
  if (state) {
    audio.play().catch(() => {
      playing = false;
      icoPlay.style.display  = '';
      icoPause.style.display = 'none';
      eqBars.classList.remove('active');
    });
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
