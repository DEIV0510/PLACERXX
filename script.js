(() => {
  'use strict';

  const WA_NUMBER = '573000000000';

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

  /* ========== PICKER SECTIONS (5 interactive product configurators) ========== */
  const formatCOP = (n) => '$' + Number(n).toLocaleString('es-CO');

  document.querySelectorAll('.picker').forEach(initPicker);

  function initPicker(section) {
    const image  = section.querySelector('[data-role="image"]');
    const name   = section.querySelector('[data-role="name"]');
    const desc   = section.querySelector('[data-role="desc"]');
    const price  = section.querySelector('[data-role="price"]');
    const cta    = section.querySelector('[data-role="cta"]');
    const qtyVal = section.querySelector('[data-role="qty-value"]');
    const variantsBox = section.querySelector('[data-role="variants-container"]');
    const notesBox    = section.querySelector('[data-role="notes-row"]');
    const notesEl     = section.querySelector('[data-role="notes"]');

    const tabs  = section.querySelectorAll('.tab');
    const chips = section.querySelectorAll('.chip');
    const qtyBtns = section.querySelectorAll('.qty-btn');

    const state = { qty: 1 };

    function buildCTA() {
      const activeTab  = section.querySelector('.tab.is-active') || tabs[0];
      const activeChip = section.querySelector('.chip.is-active');
      const productName = activeTab ? activeTab.dataset.name : '';
      const variant = (variantsBox && !variantsBox.classList.contains('is-hidden') && activeChip)
        ? activeChip.dataset.variant : null;

      const lines = [`Hola PLACERX, quiero pedir:`];
      lines.push(`• ${productName}${variant ? ` (sabor: ${variant})` : ''}`);
      lines.push(`• Cantidad: ${state.qty}`);
      if (cta) cta.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    }

    function updateTotal() {
      const activeTab = section.querySelector('.tab.is-active') || tabs[0];
      if (!price || !activeTab) return;
      const unit = Number(activeTab.dataset.price || 0);
      const total = unit * state.qty;
      // Swap animation
      price.classList.add('is-swapping');
      setTimeout(() => {
        price.textContent = formatCOP(total);
        price.classList.remove('is-swapping');
      }, 130);
    }

    function applyProduct(tab) {
      if (!tab) return;
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      // Show/hide variants block based on data-variants
      if (variantsBox) {
        const hasVariants = tab.dataset.variants !== 'false';
        variantsBox.classList.toggle('is-hidden', !hasVariants);
      }

      // Animated swap
      if (image) {
        image.classList.add('is-swapping');
        setTimeout(() => {
          image.src = tab.dataset.img;
          image.alt = tab.dataset.name;
          image.classList.remove('is-swapping');
        }, 180);
      }
      if (name) {
        name.classList.add('is-swapping');
        setTimeout(() => {
          name.textContent = tab.dataset.name;
          name.classList.remove('is-swapping');
        }, 120);
      }
      if (desc) {
        desc.classList.add('is-swapping');
        setTimeout(() => {
          desc.textContent = tab.dataset.desc;
          desc.classList.remove('is-swapping');
        }, 140);
      }

      // Update notes if present
      if (notesEl && tab.dataset.notes) {
        notesEl.innerHTML = tab.dataset.notes
          .split('·')
          .map(n => `<span class="note">${n.trim()}</span>`)
          .join('');
      }

      updateTotal();
      buildCTA();
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => applyProduct(tab));
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        buildCTA();
      });
    });

    qtyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.qtyAction === 'plus')      state.qty = Math.min(state.qty + 1, 99);
        else if (btn.dataset.qtyAction === 'minus') state.qty = Math.max(state.qty - 1, 1);
        if (qtyVal) qtyVal.textContent = state.qty;
        updateTotal();
        buildCTA();
      });
    });

    buildCTA();
  }

  /* ========== REVEAL ON SCROLL ========== */
  const revealTargets = document.querySelectorAll(
    '.hero-left > *, .hero-right, .hero-bottom, ' +
    '.picker-head > *, .picker-stage, .picker-info > *, ' +
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
  if (heroProduct && window.matchMedia('(min-width: 1024px)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      heroProduct.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      if (heroSign) heroSign.style.transform = `rotate(-6deg) translate(${x * -14}px, ${y * -8}px)`;
    });
  }
})();
