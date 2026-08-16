// Mobile menu toggle
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    burger.classList.toggle('active');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Fake "live" rate fluctuation for visual effect
const rateEls = document.querySelectorAll('.rate-val');
const ratesNote = document.getElementById('ratesNote');

function jitterRates() {
  rateEls.forEach(el => {
    const base = parseFloat(el.dataset.base);
    const jitter = (Math.random() - 0.5) * 0.02; // +/-1%
    const value = Math.max(0, Math.min(1, base + jitter));
    el.textContent = Math.round(value * 100) + '%';
  });
  if (ratesNote) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ratesNote.textContent = `Rates refresh automatically • Last updated ${time}`;
  }
}

setInterval(jitterRates, 8000);

// Sticky navbar shadow on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});
