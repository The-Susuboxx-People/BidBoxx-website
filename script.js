const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header shadow on scroll
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
if (navToggle && mobileNav) {
  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.classList.remove('is-open');
    mobileNav.classList.remove('is-open');
  };
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

// Subtle parallax on the hero photo
const heroPhoto = document.querySelector('.hero-photo');
if (heroPhoto && !prefersReducedMotion) {
  let ticking = false;
  const applyParallax = () => {
    const offset = Math.min(window.scrollY * 0.08, 40);
    heroPhoto.style.transform = `translateY(${offset}px) scale(1.03)`;
    ticking = false;
  };
  document.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add('in-view'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));
}

// Dashboard card: animate balance + savings ring into view
const dashBalance = document.getElementById('dashBalance');
const dashRing = document.querySelector('.dash-ring-progress');
const RING_FULL = 169.6;
const RING_TARGET_OFFSET = 42; // ~75% filled

if (dashBalance) {
  const target = parseFloat(dashBalance.dataset.target);

  const renderDashboard = (progress) => {
    const eased = 1 - Math.pow(1 - progress, 3);
    dashBalance.textContent = '₵' + (target * eased).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (dashRing) {
      dashRing.style.strokeDashoffset = RING_FULL - (RING_FULL - RING_TARGET_OFFSET) * eased;
    }
  };

  if (prefersReducedMotion) {
    renderDashboard(1);
  } else {
    const dashObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          renderDashboard(progress);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        dashObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    dashObserver.observe(document.querySelector('.hero-media'));
  }
}

// Count-up stats
const counters = document.querySelectorAll('[data-count]');
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

if (prefersReducedMotion) {
  counters.forEach((el) => {
    el.textContent = parseInt(el.dataset.count, 10).toLocaleString() + (el.dataset.suffix || '');
  });
} else {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => countObserver.observe(el));
}
