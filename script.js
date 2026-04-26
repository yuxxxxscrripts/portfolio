/* ─────────────────────────────────────────────────────────────
   Portfolio JS — cursor, particles, view counter, card tilt
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Custom Cursor ────────────────────────────────────────── */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let fx = 0, fy = 0;
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  function animateFollower() {
    fx += (cx - fx) * 0.12;
    fy += (cy - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  /* ── Particle Canvas ──────────────────────────────────────── */
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      o:  Math.random() * 0.5 + 0.15,
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 160, 255, ${p.o})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Draw faint connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 92, 252, ${0.04 * (1 - dist / 90)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }

  window.addEventListener('resize', resize);
  resize();
  drawParticles();

  /* ── Card 3-D Tilt ────────────────────────────────────────── */
  const card = document.getElementById('card');
  let tiltActive = true;

  document.addEventListener('mousemove', e => {
    if (!tiltActive) return;
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rx   = dy * -6;
    const ry   = dx *  6;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    card.style.transition = 'transform 0.1s linear';
  });

  document.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.6s cubic-bezier(.23,1,.32,1)';
  });

  /* ── View Counter ─────────────────────────────────────────── */
  const key   = 'portfolio_views';
  const saved = parseInt(localStorage.getItem(key) || '0', 10);
  const count = saved + 1;
  localStorage.setItem(key, count);

  const vNum = document.getElementById('vNum');
  animateNumber(vNum, 0, count, 900);

  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t   = Math.min((now - start) / duration, 1);
      const val = Math.floor(easeOut(t) * (to - from) + from);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ── Staggered social btn hover ripple ─────────────────────── */
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.animate([
        { transform: 'translateX(4px) translateY(-2px)' },
        { transform: 'translateX(5px) translateY(-3px)' },
        { transform: 'translateX(4px) translateY(-2px)' }
      ], { duration: 300, easing: 'ease-in-out' });
    });
  });

  /* ── Activity bar track scroll ──────────────────────────────── */
  const track = document.querySelector('.activity-track');
  if (track) {
    const text = track.textContent;
    // Only scroll if text overflows
    setTimeout(() => {
      if (track.scrollWidth > track.clientWidth + 4) {
        track.style.animation = `scrollTrack ${text.length * 0.18}s linear infinite`;
        const style = document.createElement('style');
        style.textContent = `
          @keyframes scrollTrack {
            0%   { text-indent: 0; }
            40%  { text-indent: -${track.scrollWidth - track.clientWidth}px; }
            60%  { text-indent: -${track.scrollWidth - track.clientWidth}px; }
            100% { text-indent: 0; }
          }
        `;
        document.head.appendChild(style);
        track.style.overflow = 'hidden';
        track.style.whiteSpace = 'nowrap';
      }
    }, 800);
  }

  /* ── Orb mouse parallax ─────────────────────────────────────── */
  const orbs = document.querySelectorAll('.orb');
  document.addEventListener('mousemove', e => {
    const xRatio = e.clientX / window.innerWidth  - 0.5;
    const yRatio = e.clientY / window.innerHeight - 0.5;
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 14;
      orb.style.transform = `translate(${xRatio * depth}px, ${yRatio * depth}px)`;
    });
  });

})();
