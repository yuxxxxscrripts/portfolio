/* ─── script.js ───────────────────────────────────────────── */

/* ── 1. Custom cursor glow ─────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX, glowY = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function lerpCursor() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top  = glowY + 'px';
  requestAnimationFrame(lerpCursor);
}
lerpCursor();

/* ── 2. Card tilt on mouse move ────────────────────────────── */
const card = document.getElementById('card');
document.addEventListener('mousemove', e => {
  const rect = card.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const dx   = (e.clientX - cx) / (rect.width  / 2);
  const dy   = (e.clientY - cy) / (rect.height / 2);
  const maxRot = 6;
  card.style.transform = `
    perspective(900px)
    rotateX(${-dy * maxRot}deg)
    rotateY(${dx * maxRot}deg)
    translateZ(8px)
  `;
});
document.addEventListener('mouseleave', () => {
  card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
});
card.style.transition = 'transform 0.2s ease';

/* ── 3. Particle canvas ────────────────────────────────────── */
const canvas  = document.getElementById('particles');
const ctx     = canvas.getContext('2d');
let   W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 80;
const COLORS = ['rgba(167,139,250,VAL)', 'rgba(56,189,248,VAL)', 'rgba(251,113,133,VAL)', 'rgba(255,255,255,VAL)'];

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : H + 10;
    this.r  = Math.random() * 2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.6 + 0.2);
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)].replace('VAL', this.alpha.toFixed(2));
    this.life  = 0;
    this.maxLife = Math.random() * 300 + 150;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.y < -10 || this.life > this.maxLife) this.reset(false);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

/* connecting lines between close particles */
function drawLines() {
  const DIST = 90;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(167,139,250,${(1 - d/DIST) * 0.08})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  drawLines();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ── 4. Typing bio effect ──────────────────────────────────── */
const bioText  = "just a person doing things on the internet. discord nerd & vibe curator. probably up way too late.";
const bioEl    = document.getElementById('bio');
let   bioIndex = 0;

function typeBio() {
  if (bioIndex < bioText.length) {
    bioEl.textContent += bioText[bioIndex++];
    setTimeout(typeBio, 28 + Math.random() * 20);
  }
}
setTimeout(typeBio, 1400);

/* ── 5. Counter animation ──────────────────────────────────── */
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  function step(now) {
    const t    = Math.min((now - start) / duration, 1);
    const val  = Math.round(easeOutExpo(t) * target);
    el.textContent = val.toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsEls = document.querySelectorAll('.stat-val');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.target, 10);
      animateCounter(e.target, target);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
statsEls.forEach(el => observer.observe(el));

/* ── 6. Social button ripple ───────────────────────────────── */
document.querySelectorAll('.social-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r    = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    r.style.cssText = `
      position:absolute;
      border-radius:50%;
      transform:scale(0);
      animation:rippleAnim 0.5s ease-out;
      background:rgba(255,255,255,0.15);
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top  - size/2}px;
      pointer-events:none;
    `;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 500);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

/* ── 7. Scroll badges stagger ──────────────────────────────── */
const badges = document.querySelectorAll('.badge');
badges.forEach((b, i) => {
  b.style.opacity     = '0';
  b.style.transform   = 'translateY(10px) scale(0.9)';
  b.style.transition  = `all 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.85 + i * 0.07}s`;
  setTimeout(() => {
    b.style.opacity   = '1';
    b.style.transform = 'translateY(0) scale(1)';
  }, 50);
});

/* ── 8. Music Player ───────────────────────────────────────── */
const audio       = document.getElementById('bgAudio');
const toggleBtn   = document.getElementById('musicToggle');
const playIcon    = document.getElementById('playIcon');
const pauseIcon   = document.getElementById('pauseIcon');
const disc        = document.getElementById('musicDisc');
const playerEl    = document.getElementById('musicPlayer');
const barsWrap    = playerEl.querySelector('.music-bars');
let   isPlaying   = false;

function setPlaying(state) {
  isPlaying = state;
  if (state) {
    audio.play().catch(() => {});
    playIcon.style.display  = 'none';
    pauseIcon.style.display = '';
    disc.classList.add('spinning');
    barsWrap.classList.add('playing');
  } else {
    audio.pause();
    playIcon.style.display  = '';
    pauseIcon.style.display = 'none';
    disc.classList.remove('spinning');
    barsWrap.classList.remove('playing');
  }
}

toggleBtn.addEventListener('click', () => setPlaying(!isPlaying));

/* Autoplay on first user interaction */
let autoplayDone = false;
function tryAutoplay() {
  if (!autoplayDone) {
    autoplayDone = true;
    setPlaying(true);
    document.removeEventListener('click', tryAutoplay);
    document.removeEventListener('keydown', tryAutoplay);
  }
}
document.addEventListener('click',   tryAutoplay);
document.addEventListener('keydown', tryAutoplay);

/* ── 9. Social button cursor none fix ──────────────────────── */
document.querySelectorAll('.social-btn, .music-toggle').forEach(el => {
  el.style.cursor = 'none';
});

/* ── 10. Subtle card shimmer on avatar hover ────────────────── */
const avatar = document.querySelector('.avatar');
avatar.addEventListener('mouseenter', () => {
  card.style.boxShadow = '0 0 60px rgba(167,139,250,0.12), 0 0 120px rgba(167,139,250,0.06)';
});
avatar.addEventListener('mouseleave', () => {
  card.style.boxShadow = '';
});

/* ── 11. Live clock in location (bonus) ────────────────────── */
// optional – just adds a live subtle timestamp feel
const locEl = document.querySelector('.location span');
if (locEl) {
  setInterval(() => {
    const t = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    locEl.textContent = `Earth, Milky Way 🌍  ${t}`;
  }, 1000);
}
