(() => {
  'use strict';

  /* ========== AGE GATE ========== */
  const ageGate = document.getElementById('ageGate');
  const ageYes = document.getElementById('ageYes');
  const AGE_KEY = 'placerx-age-ok';

  try {
    if (sessionStorage.getItem(AGE_KEY) === '1') {
      ageGate && ageGate.classList.add('is-hidden');
    }
  } catch (e) {}

  ageYes && ageYes.addEventListener('click', () => {
    try { sessionStorage.setItem(AGE_KEY, '1'); } catch (e) {}
    ageGate.classList.add('is-hidden');
  });

  /* ========== NAV SCROLL STATE ========== */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========== MOBILE BURGER ========== */
  const burger = document.getElementById('burger');
  burger && burger.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('is-open'));
  });

  /* ========== CATALOG FILTER ========== */
  const filterBar = document.getElementById('catalogFilter');
  const products = document.querySelectorAll('#productGrid .prod');

  const applyFilter = (filter) => {
    if (!filterBar) return;
    filterBar.querySelectorAll('.filter-pill').forEach(p => {
      p.classList.toggle('is-active', p.dataset.filter === filter);
    });
    products.forEach(p => {
      const show = filter === 'todos' || p.dataset.cat === filter;
      p.classList.toggle('is-hidden', !show);
    });
  };

  filterBar && filterBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    applyFilter(pill.dataset.filter);
  });

  /* Category card → jump to filter */
  document.querySelectorAll('.cat[data-filter]').forEach(card => {
    card.addEventListener('click', (e) => {
      const filter = card.dataset.filter;
      if (!filter) return;
      e.preventDefault();
      applyFilter(filter);
      const catalog = document.getElementById('catalogo');
      if (catalog) {
        const offset = window.innerWidth < 768 ? 70 : 90;
        window.scrollTo({ top: catalog.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  /* ========== REVEAL ON SCROLL ========== */
  const revealTargets = document.querySelectorAll(
    '.hero-left > *, .hero-right, .hero-bottom, ' +
    '.section-head, .cat, ' +
    '.filter-pill, .prod, ' +
    '.hotbanner-left > *, .hotbanner-product, ' +
    '.how-step, ' +
    '.dm, ' +
    '.contact-left > *, .contact-card'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-in'), i * 35);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-in'));
  }

  /* ========== SMOOTH ANCHORS ========== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = window.innerWidth < 768 ? 70 : 90;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ========== HERO PARALLAX ========== */
  const heroProduct = document.querySelector('.hero-product');
  const heroSign = document.querySelector('.hero-sign');
  const heroStamp = document.querySelector('.hero-stamp');
  if (heroProduct && window.matchMedia('(min-width: 1024px)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      heroProduct.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      if (heroSign) heroSign.style.transform = `rotate(-6deg) translate(${x * -14}px, ${y * -8}px)`;
    });
  }
})();
