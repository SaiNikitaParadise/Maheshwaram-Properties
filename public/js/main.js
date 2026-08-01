/* ===========================
   JS — Maheshwaram Properties
   =========================== */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}

// Mobile dropdown toggle
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dd => {
  const link = dd.querySelector('.nav-link');
  if (link) {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dd.classList.toggle('open');
      }
    });
  }
});

// Close nav when a link is clicked
document.querySelectorAll('.dropdown-menu a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks) navLinks.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
  });
});

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

function initAnimations() {
  const animElements = document.querySelectorAll(
    '.why-card, .venture-card, .service-card, .testimonial-card, .about-stat-card, .process-step, .contact-detail-item'
  );
  animElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
    observer.observe(el);
  });
}

// Contact form submission handler -> opens WhatsApp with the enquiry
const WHATSAPP_NUMBER = '919908224832';

function initContactForm() {
  const form = document.getElementById('main-contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim().slice(0, 1000) : '';
    };

    const firstName = val('first-name');
    const lastName = val('last-name');
    const phone = val('phone');
    const email = val('email');
    const budget = val('budget');
    const message = val('message');

    const ventureEl = document.getElementById('venture-interest');
    const venture =
      ventureEl && ventureEl.selectedIndex > 0
        ? ventureEl.options[ventureEl.selectedIndex].text.trim()
        : '';

    if (!firstName || !phone) {
      alert('Please enter your name and phone number.');
      return;
    }

    const lines = [
      'New Enquiry — Maheshwaram Properties',
      '',
      `Name: ${firstName}${lastName ? ' ' + lastName : ''}`,
      `Phone: ${phone}`,
    ];
    if (email) lines.push(`Email: ${email}`);
    if (venture) lines.push(`Venture of Interest: ${venture}`);
    if (budget) lines.push(`Budget: ${budget}`);
    if (message) lines.push('', `Message: ${message}`);

    const url =
      'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.textContent = 'Opening WhatsApp...';
      btn.disabled = true;
    }

    window.open(url, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      form.reset();
      if (btn) {
        btn.textContent = 'Send Enquiry';
        btn.disabled = false;
      }
    }, 1500);
  });
}


// Mini inquiry form on venture pages
function initMiniForm() {
  const form = document.getElementById('venture-inquiry-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = '✅ Enquiry Sent!';
    btn.disabled = true;
    form.reset();
    setTimeout(() => {
      btn.textContent = 'Send Enquiry';
      btn.disabled = false;
    }, 3000);
  });
}

// Counter animation for stat numbers
function animateCounters() {
  const counters = document.querySelectorAll('.asc-number, .stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.textContent.replace(/\D/g, ''), 10);
    if (isNaN(target)) return;
    const suffix = counter.textContent.includes('+') ? '+' : '';
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = current + suffix;
    }, 25);
  });
}

const statsSection = document.querySelector('.about-stats, .hero-stats');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });
  statsSection && statsObserver.observe(statsSection);
}

// Active nav link based on current page
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  if (path.includes('ventures')) {
    const ventureNav = document.getElementById('nav-ventures');
    if (ventureNav) ventureNav.classList.add('active');
  } else if (path.includes('services')) {
    const servicesNav = document.getElementById('nav-services');
    if (servicesNav) servicesNav.classList.add('active');
  } else if (path.includes('contact')) {
    const contactNav = document.getElementById('nav-contact');
    if (contactNav) contactNav.classList.add('active');
  } else {
    const homeNav = document.getElementById('nav-home');
    if (homeNav) homeNav.classList.add('active');
  }
}

// Hero headline slideshow (right-to-left, GPU-accelerated transforms only)
function initHeroSlider() {
  const slides = document.querySelectorAll('#hero-title-slider .hero-slide');
  if (slides.length < 2) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // keep first slide static, no animation

  let current = 0;
  const total = slides.length;
  const DISPLAY_MS = 4200;

  function goToNext() {
    const next = (current + 1) % total;
    const currentEl = slides[current];
    const nextEl = slides[next];

    // Reset the incoming slide instantly off-screen right, no transition flash
    nextEl.style.transition = 'none';
    nextEl.classList.remove('exit');
    nextEl.style.transform = 'translateX(100%)';
    nextEl.style.opacity = '0';
    void nextEl.offsetWidth; // force reflow so the reset applies before re-enabling transition
    nextEl.style.transition = '';
    nextEl.style.transform = '';
    nextEl.style.opacity = '';

    currentEl.classList.remove('active');
    currentEl.classList.add('exit');
    nextEl.classList.add('active');

    current = next;
  }

  setInterval(goToNext, DISPLAY_MS);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initContactForm();
  initMiniForm();
  setActiveNav();
  initHeroSlider();
  // Start with scrolled navbar if not at top
  if (window.scrollY > 60) navbar.classList.add('scrolled');
});
