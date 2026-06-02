/* ============================================================
   MAIN JS — LogiFlow Transport (Enhanced)
   Handles: navbar, hamburger, slider, AOS, counters,
            testimonials, FAQ, tracking, contact form
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  initNavbar();
  initHamburger();
  initActiveLinks();
  initHeroSlider();
  initAOS();
  animateCounters();
  initTestiSlider();
  initFAQ();
  initContactForm();
  initTracking();
  initRippleButtons();
  initParallax();

});

/* ─────────────────────────────────────────
   NAVBAR — scroll shadow + shrink
   ───────────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    navbar.classList.toggle('scrolled', current > 20);
    lastScroll = current;
  }, { passive: true });
}

/* ─────────────────────────────────────────
   HAMBURGER — Premium Slide-in Panel
   ───────────────────────────────────────── */
function initHamburger() {
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!mobileMenu.classList.contains('open')) {
        mobileMenu.style.pointerEvents = 'none';
      }
    }, 450);
  }

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) closeMenu();
    else openMenu();
  });

  // Close on overlay click (behind panel)
  mobileMenu.addEventListener('click', (e) => {
    const panel = mobileMenu.querySelector('.mobile-menu-panel');
    if (panel && !panel.contains(e.target)) closeMenu();
  });

  // Close button inside panel
  const closeBtn = mobileMenu.querySelector('.menu-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close when nav link clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeMenu, 150);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });

  // Swipe-right to close
  let touchStartX = 0;
  const panel = mobileMenu.querySelector('.mobile-menu-panel');
  if (panel) {
    panel.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    panel.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (diff > 60) closeMenu();
    }, { passive: true });
  }
}

/* ─────────────────────────────────────────
   ACTIVE NAV LINKS
   ───────────────────────────────────────── */
function initActiveLinks() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop();
    if (linkPage === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────
   HERO SLIDER — Cinematic
   ───────────────────────────────────────── */
function initHeroSlider() {
  const sliderWrap = document.querySelector('.hero-slider-wrap');
  if (!sliderWrap) return;
  const slides   = Array.from(sliderWrap.querySelectorAll('.hero-slide'));
  const dotsWrap = document.querySelector('.slider-dots');
  if (!slides.length) return;

  let current = 0;
  let timer   = null;
  let dots    = [];
  let isAnimating = false;

  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  function goTo(index) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    slides[current].classList.remove('active');
    if (dots.length) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots.length) dots[current].classList.add('active');

    setTimeout(() => { isAnimating = false; }, 800);
  }

  function next() { goTo(current + 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, 4500);
  }

  slides[0].classList.add('active');
  startTimer();

  sliderWrap.addEventListener('mouseenter', () => clearInterval(timer));
  sliderWrap.addEventListener('mouseleave', startTimer);

  // Touch swipe
  let touchStartX = 0;
  sliderWrap.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    clearInterval(timer);
  }, { passive: true });
  sliderWrap.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    startTimer();
  }, { passive: true });
}

/* ─────────────────────────────────────────
   AOS — Animate on Scroll (Enhanced)
   ───────────────────────────────────────── */
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseInt(el.dataset.aosDelay || 0, 10);
        setTimeout(() => el.classList.add('aos-animate'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   COUNTER ANIMATION — Smooth Easing
   ───────────────────────────────────────── */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const startTime = performance.now();

      function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ─────────────────────────────────────────
   TESTIMONIAL SLIDER
   ───────────────────────────────────────── */
function initTestiSlider() {
  const track   = document.querySelector('.testi-track');
  const prevBtn = document.querySelector('.testi-btn.prev');
  const nextBtn = document.querySelector('.testi-btn.next');
  if (!track || !prevBtn || !nextBtn) return;

  let idx   = 0;
  const cards    = track.querySelectorAll('.testi-card');
  const visible  = () => window.innerWidth <= 600 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const maxIdx   = () => Math.max(0, cards.length - visible());

  function update() {
    idx = Math.min(idx, maxIdx());
    if (!cards[0]) return;
    const cardStyle = window.getComputedStyle(cards[0]);
    const w = cards[0].offsetWidth + parseInt(cardStyle.marginRight || 24);
    track.style.transform = `translateX(-${idx * w}px)`;
  }

  prevBtn.addEventListener('click', () => { idx = Math.max(0, idx - 1); update(); });
  nextBtn.addEventListener('click', () => { idx = Math.min(maxIdx(), idx + 1); update(); });
  window.addEventListener('resize', () => { update(); }, { passive: true });
}

/* ─────────────────────────────────────────
   FAQ ACCORDION — Smooth
   ───────────────────────────────────────── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(f => f.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ─────────────────────────────────────────
   CONTACT FORM — Validated + Animated
   ───────────────────────────────────────── */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const success   = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  const submitTxt = document.getElementById('submitText');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    // Clear errors
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    ['fname','lname','email','origin','dest'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        el.classList.add('error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        valid = false;
      }
    });

    const email = document.getElementById('email');
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      valid = false;
    }

    if (!valid) {
      // Shake animation on invalid submit
      form.style.animation = 'none';
      form.offsetHeight; // reflow
      form.style.animation = 'shakeX 0.4s ease';
      return;
    }

    if (submitTxt) submitTxt.textContent = 'Sending…';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.75';
    }

    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.classList.add('visible');
    }, 1400);
  });
}

/* ─────────────────────────────────────────
   TRACKING PAGE
   ───────────────────────────────────────── */
function initTracking() {
  const tabs  = document.querySelectorAll('.ttab');
  const input = document.getElementById('trackingInput');
  const placeholders = {
    tracking:  'e.g. LF-2025-048291',
    booking:   'e.g. BK-78432-A',
    container: 'e.g. MSCU4829103'
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (input) {
        input.placeholder = placeholders[tab.dataset.tab] || '';
        input.focus();
      }
    });
  });

  const trackBtn = document.getElementById('trackBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', doTrack);
  }
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') doTrack();
    });
  }
}

/* ─────────────────────────────────────────
   RIPPLE EFFECT on buttons
   ───────────────────────────────────────── */
function initRippleButtons() {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        top: ${e.clientY - rect.top - size/2}px;
        left: ${e.clientX - rect.left - size/2}px;
        transform: scale(0);
        animation: rippleAnim 0.6s linear;
        pointer-events: none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Inject ripple keyframes
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(1); opacity: 0; }
      }
      @keyframes shakeX {
        0%,100% { transform: translateX(0); }
        20%,60% { transform: translateX(-6px); }
        40%,80% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ─────────────────────────────────────────
   SUBTLE PARALLAX on hero images
   ───────────────────────────────────────── */
function initParallax() {
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (!heroSlides.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroSlides.forEach(slide => {
      slide.style.transform = `scale(1) translateY(${scrolled * 0.15}px)`;
    });
  }, { passive: true });
}

/* ─────────────────────────────────────────
   GLOBAL — exposed to HTML onclick
   ───────────────────────────────────────── */
window.fillDemo = function(val) {
  const input = document.getElementById('trackingInput');
  if (!input) return;
  input.value = val;
  input.focus();
  // Highlight input briefly
  input.style.borderColor = 'var(--orange)';
  input.style.background  = '#fff';
  setTimeout(() => { input.style.borderColor = ''; }, 1000);
};

window.doTrack = function() {
  const input = document.getElementById('trackingInput');
  const val   = (input ? input.value : '').trim();
  if (!val) {
    if (input) {
      input.focus();
      input.style.borderColor = 'var(--orange)';
      input.style.animation = 'none';
      input.offsetHeight;
      input.style.animation = 'shakeX 0.4s ease';
      setTimeout(() => { input.style.animation = ''; }, 500);
    }
    return;
  }
  const resultSection = document.getElementById('trackResult');
  const resultId      = document.getElementById('resultId');
  if (resultSection) {
    if (resultId) resultId.textContent = val;
    resultSection.style.display = 'block';
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
};

window.handleNL = function() {
  const inp = document.getElementById('nlEmail');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    inp.style.borderColor = 'var(--orange)';
    inp.focus();
    setTimeout(() => { inp.style.borderColor = ''; }, 1200);
    return;
  }
  inp.value = '';
  inp.placeholder = '✓ You\'re subscribed! Welcome aboard.';
  inp.style.borderColor = '#10b981';
};