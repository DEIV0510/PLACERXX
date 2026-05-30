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

  /* ========== PAGINATOR (8 productos por página) ========== */
  const PER_PAGE = 8;
  document.querySelectorAll('.sub-panel .pc-grid').forEach(grid => {
    const cards = Array.from(grid.querySelectorAll('.pc'));
    if (cards.length <= PER_PAGE) return;

    const totalPages = Math.ceil(cards.length / PER_PAGE);
    cards.forEach((card, i) => {
      card.dataset.page = String(Math.floor(i / PER_PAGE) + 1);
    });

    const pager = document.createElement('div');
    pager.className = 'pc-pager';
    for (let p = 1; p <= totalPages; p++) {
      if (p > 1) {
        const dot = document.createElement('span');
        dot.className = 'pc-pager-dot';
        dot.textContent = '·';
        pager.appendChild(dot);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pc-page-btn' + (p === 1 ? ' is-active' : '');
      btn.dataset.page = String(p);
      btn.textContent = String(p);
      pager.appendChild(btn);
    }
    grid.parentNode.insertBefore(pager, grid.nextSibling);

    const setPage = (p) => {
      const pStr = String(p);
      cards.forEach(card => {
        card.style.display = (card.dataset.page === pStr) ? '' : 'none';
      });
      pager.querySelectorAll('.pc-page-btn').forEach(b =>
        b.classList.toggle('is-active', b.dataset.page === pStr)
      );
      grid.scrollLeft = 0;
    };

    pager.addEventListener('click', (e) => {
      const btn = e.target.closest('.pc-page-btn');
      if (btn) setPage(btn.dataset.page);
    });
    setPage(1);
  });

  /* ========== PRODUCT DRAWER (modal con qty, sabor, recomendados) ========== */
  const drawer = document.getElementById('productDrawer');
  if (drawer) initDrawer();

  function initDrawer() {
    const els = {
      img: drawer.querySelector('[data-role="img"]'),
      code: drawer.querySelector('[data-role="code"]'),
      name: drawer.querySelector('[data-role="name"]'),
      price: drawer.querySelector('[data-role="price"]'),
      qty: drawer.querySelector('[data-role="qty"]'),
      cta: drawer.querySelector('[data-role="cta"]'),
      tagline: drawer.querySelector('[data-role="tagline"]'),
      cat: drawer.querySelector('[data-role="cat"]'),
      desc: drawer.querySelector('[data-role="desc"]'),
      features: drawer.querySelector('[data-role="features"]'),
      flavorsSection: drawer.querySelector('[data-role="flavors-section"]'),
      flavors: drawer.querySelector('[data-role="flavors"]'),
      recs: drawer.querySelector('[data-role="recs"]'),
    };

    /* Info por subcategoría: label + descripción + features + tagline */
    const CAT_INFO = {
      potenciadores: {
        label: '⚡ Potenciador',
        tagline: 'Para llegar con todo · sin perder el ritmo',
        desc: 'Potenciador masculino/femenino de acción rápida que aumenta la libido, la resistencia y la firmeza. Ideal para esas noches donde quieres ir con todo y aguantar más.',
        features: ['Acción en 20–30 min', 'Duración 4–6 horas', 'Sin perder sensación', 'Apto +18'],
      },
      retardantes: {
        label: '⏱ Retardante',
        tagline: 'Aguanta más · sin perder sensación',
        desc: 'Producto para el control de la eyaculación. Permite prolongar el placer sin perder sensibilidad ni anestesiar la zona. Aplicación discreta minutos antes.',
        features: ['Efecto +30 min', 'No adormece', 'Compatible con condón', 'Apto +18'],
      },
      multiorgasmos: {
        label: '💥 Multiorgásmico',
        tagline: 'Para sentir 5 veces más · y volver a empezar',
        desc: 'Gel/elixir estimulante que multiplica la sensibilidad de las zonas íntimas. Provoca múltiples orgasmos en una sola noche con sensación electrizante.',
        features: ['Aumenta sensibilidad', 'Sensación frío/calor', 'Múltiples orgasmos', 'Apto +18'],
      },
      estrechantes: {
        label: '🔒 Estrechante',
        tagline: 'Recupera la firmeza · siéntelo todo',
        desc: 'Gel femenino que contrae las paredes vaginales para una sensación de mayor ajuste y firmeza. Sensación natural, sin químicos agresivos.',
        features: ['Sensación primera vez', 'Aplicación íntima', 'Apto +18'],
      },
      'cuidado-intimo': {
        label: '🌷 Cuidado íntimo',
        tagline: 'Tu zona merece lo mejor · cuídala bonito',
        desc: 'Línea de cuidado íntimo: despigmentantes, desodorantes y limpiadores formulados con ingredientes seguros para la piel más delicada.',
        features: ['pH balanceado', 'Sin parabenos', 'Uso diario', 'Resultados visibles'],
      },
      'cuidado-facial': {
        label: '✨ Cuidado facial',
        tagline: 'Realza tu atractivo · sin esfuerzo',
        desc: 'Brillos labiales y productos faciales con feromonas que potencian tu encanto natural. Acabado seductor con un toque sutil de magnetismo.',
        features: ['Con feromonas', 'Larga duración', 'Aroma irresistible'],
      },
      'cuerpo-masajes': {
        label: '🌹 Cuerpo y masajes',
        tagline: 'Crea el ambiente · sin decir una palabra',
        desc: 'Aceites, velas y splash con feromonas para masajes sensuales y ambiente íntimo. Activa el deseo desde el primer contacto.',
        features: ['Con feromonas', 'Apto para piel', 'Aroma envolvente'],
      },
      lubricantes: {
        label: '💧 Lubricante',
        tagline: 'Para que todo fluya · sin pausa',
        desc: 'Lubricante íntimo base agua con efectos especiales: caliente, frío, neutro o saborizado. Sensación natural, no pega, compatible con condón.',
        features: ['Base agua', 'No pega ni mancha', 'Compatible con condón', 'Apto +18'],
      },
      'condones-all': {
        label: '🍿 Condón',
        tagline: 'Protección con placer · sin sacrificar nada',
        desc: 'Preservativos de alta calidad: saborizados, texturizados, con efecto delay & cooling o lubricados. Cuídate sin perder sensación.',
        features: ['Látex premium', 'Certificación Invima', 'Ultra sensible', 'Apto +18'],
      },
      'juegos-mesa': {
        label: '🎲 Juego erótico',
        tagline: 'Rompe el hielo · dale picante a la noche',
        desc: 'Juegos de mesa para parejas y grupos: dados, cartas, jenga, ruleta, triki y más. Diversión garantizada, retos calientes, sin pena.',
        features: ['Para parejas', 'Retos hot', 'Calidad premium', 'Apto +18'],
      },
    };

    /* Detecta sub-categoría del producto por su super-panel */
    function getCatInfo(card) {
      const subPanel = card.closest('.sub-panel');
      const sub = subPanel ? subPanel.dataset.sub : null;
      if (sub && CAT_INFO[sub]) return CAT_INFO[sub];
      // Lubricantes legacy
      if (sub && sub.indexOf('lubricantes') === 0) return CAT_INFO.lubricantes;
      return CAT_INFO.potenciadores;
    }

    /* Sabores específicos por producto (leídos de cada imagen) */
    const PRODUCT_FLAVORS = {
      // ---- LUBRICANTES (4 con sabores) ----
      'Lu01': [
        { v: 'Caramelo', e: '🍯' },
        { v: 'Chocolate', e: '🍫' },
        { v: 'Crema de Whisky', e: '🥃' },
        { v: 'Lychee', e: '🍒' },
      ],
      'Lu04': [
        { v: 'Chocolate', e: '🍫' },
        { v: 'Caramelo', e: '🍯' },
        { v: 'Café Moka', e: '☕' },
        { v: 'Crema de Whisky', e: '🥃' },
      ],
      'Lu33': [
        { v: 'Fresa', e: '🍓' },
        { v: 'Frambuesa', e: '🫐' },
        { v: 'Cereza', e: '🍒' },
        { v: 'Uva', e: '🍇' },
        { v: 'Chocolate Picante', e: '🌶️' },
      ],
      'Lu41': [
        { v: 'Chicle', e: '🩷' },
        { v: 'Sandía', e: '🍉' },
        { v: 'Fresa Bombón', e: '🍓' },
        { v: 'Crema de Whisky', e: '🥃' },
      ],
      // ---- MULTIORGÁSMICOS ----
      'M01': [
        { v: 'Lychee', e: '🍒' },
        { v: 'Tequila', e: '🥃' },
        { v: 'Crema de Whisky', e: '🥃' },
        { v: 'Mango', e: '🥭' },
      ],
      // ---- BRILLOS LABIALES ----
      'F05': [{ v: 'Frutos Rojos', e: '🍓' }],
      'F07': [
        { v: 'Sandía', e: '🍉' },
        { v: 'Frutos Rojos', e: '🍓' },
      ],
      // ---- ESTRECHANTES ---- (ninguno muestra sabores en la imagen)
      // ---- CONDONES ----
      'Ot09': [
        { v: 'Uva', e: '🍇' },
        { v: 'Chocolate', e: '🍫' },
        { v: 'Manzana', e: '🍏' },
        { v: 'Frutos Rojos', e: '🍓' },
        { v: 'Cereza', e: '🍒' },
      ],
    };

    function getFlavors(code) {
      return PRODUCT_FLAVORS[code] || null;
    }

    let state = { qty: 1, unit: 0, currentCard: null };

    const formatCOP = n => '$' + Number(n).toLocaleString('es-CO');

    function renderFlavors(code) {
      const list = getFlavors(code);
      if (!list) {
        els.flavors.innerHTML = '';
        return false;
      }
      els.flavors.innerHTML = list
        .map((f, i) => `<button class="drawer-chip${i === 0 ? ' is-active' : ''}" data-flavor="${f.v}">${f.e} ${f.v}</button>`)
        .join('');
      return true;
    }

    function getActiveFlavor() {
      if (els.flavorsSection.hasAttribute('hidden')) return null;
      const chip = drawer.querySelector('.drawer-chip.is-active');
      return chip ? chip.dataset.flavor : null;
    }

    function updateTotal() {
      els.price.textContent = formatCOP(state.unit * state.qty);
    }

    function buildCTA() {
      const name = els.name.textContent;
      const code = els.code.textContent;
      const flavor = getActiveFlavor();
      const lines = [`Hola PLACERX, quiero pedir 🔥`];
      lines.push(`• ${name} (cód. ${code})`);
      if (flavor) lines.push(`• Sabor: ${flavor}`);
      lines.push(`• Cantidad: ${state.qty}`);
      lines.push(`• Total: ${formatCOP(state.unit * state.qty)}`);
      els.cta.href = `https://wa.me/573000000000?text=${encodeURIComponent(lines.join('\n'))}`;
    }

    function pickRecs(card) {
      const superPanel = card.closest('.super-panel');
      const pool = superPanel
        ? Array.from(superPanel.querySelectorAll('.pc')).filter(p => p !== card)
        : Array.from(document.querySelectorAll('.pc')).filter(p => p !== card);
      // Shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, 4);
    }

    function renderRecs(card) {
      const recs = pickRecs(card);
      els.recs.innerHTML = recs.map(r => {
        const img = r.querySelector('.pc-img img');
        const name = r.querySelector('.pc-name').textContent;
        const price = r.querySelector('.pc-price').textContent;
        const code = r.dataset.code;
        return `<button class="drawer-rec" data-rec-code="${code}">
          <div class="drawer-rec-img"><img src="${img.src}" alt="" loading="lazy" /></div>
          <div class="drawer-rec-body">
            <p class="drawer-rec-name">${name}</p>
            <span class="drawer-rec-price">${price}</span>
          </div>
        </button>`;
      }).join('');
    }

    function openDrawer(card) {
      state.currentCard = card;
      const code = card.dataset.code;
      const name = card.querySelector('.pc-name').textContent;
      const priceText = card.querySelector('.pc-price').textContent;
      const unit = Number(priceText.replace(/[^\d]/g, ''));
      const imgEl = card.querySelector('.pc-img img');
      const info = getCatInfo(card);

      els.code.textContent = code;
      els.name.textContent = name;
      els.img.src = imgEl.src;
      els.img.alt = name;
      els.tagline.textContent = info.tagline;
      els.cat.textContent = info.label;
      els.desc.textContent = info.desc;
      els.features.innerHTML = info.features.map(f => `<li>✓ ${f}</li>`).join('');

      state.unit = unit;
      state.qty = 1;
      els.qty.textContent = '1';

      // Mostrar/ocultar sabores según el código
      const hasFlav = renderFlavors(code);
      if (hasFlav) {
        els.flavorsSection.removeAttribute('hidden');
      } else {
        els.flavorsSection.setAttribute('hidden', '');
      }

      updateTotal();
      buildCTA();
      renderRecs(card);

      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-drawer-open');
      // Reset scroll
      const card_el = drawer.querySelector('.drawer-card');
      if (card_el) card_el.scrollTop = 0;
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('has-drawer-open');
    }

    // Click en cualquier parte de la card del catálogo → abre drawer
    document.addEventListener('click', (e) => {
      // Si clickea una rec dentro del drawer → cambiar al producto recomendado
      const rec = e.target.closest('.drawer-rec');
      if (rec) {
        const code = rec.dataset.recCode;
        const target = document.querySelector('.pc[data-code="' + code + '"]');
        if (target) openDrawer(target);
        return;
      }
      // Cerrar drawer
      if (e.target.matches('[data-close]')) {
        closeDrawer();
        return;
      }
      // Card del catálogo (cualquier punto)
      const card = e.target.closest('.pc');
      if (card && !e.target.closest('.drawer')) {
        e.preventDefault();
        openDrawer(card);
      }
    });

    // Qty buttons
    drawer.querySelectorAll('.drawer-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.q === 'plus') state.qty = Math.min(state.qty + 1, 99);
        else state.qty = Math.max(state.qty - 1, 1);
        els.qty.textContent = String(state.qty);
        updateTotal();
        buildCTA();
      });
    });

    // Flavor chips (delegation)
    els.flavors.addEventListener('click', (e) => {
      const chip = e.target.closest('.drawer-chip');
      if (!chip) return;
      drawer.querySelectorAll('.drawer-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      buildCTA();
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });
  }

  /* ========== CATALOG 2-LEVEL TABS (3 super × 7 sub) ========== */
  const superTabs   = document.querySelectorAll('.super-tab');
  const superPanels = document.querySelectorAll('.super-panel');

  function activateSuper(target) {
    if (!target) return;
    superTabs.forEach(t => t.classList.toggle('is-active', t.dataset.super === target));
    superPanels.forEach(p => p.classList.toggle('is-active', p.dataset.super === target));
  }
  superTabs.forEach(tab => {
    tab.addEventListener('click', () => activateSuper(tab.dataset.super));
  });

  /* Sub-tabs are scoped to their parent super-panel */
  document.querySelectorAll('.super-panel').forEach(superPanel => {
    const subTabs   = superPanel.querySelectorAll(':scope > .sub-tabs .sub-tab');
    const subPanels = superPanel.querySelectorAll(':scope > .sub-panel');
    subTabs.forEach(st => {
      st.addEventListener('click', () => {
        subTabs.forEach(t => t.classList.toggle('is-active', t === st));
        subPanels.forEach(p => p.classList.toggle('is-active', p.dataset.sub === st.dataset.sub));
      });
    });
  });

  /* Nav links with data-super → activate that super-tab + scroll to catalog */
  document.querySelectorAll('.nav-links a[data-super]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sup = link.dataset.super;
      activateSuper(sup);
      nav && nav.classList.remove('is-open');
      const catalog = document.getElementById('catalogo');
      if (catalog) {
        const offset = window.innerWidth < 768 ? 70 : 110;
        window.scrollTo({ top: catalog.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

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
    '.catalog-master-head > *, .super-tabs, .super-desc, .sub-tabs, .pc, ' +
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
    if (link.dataset.super) return; // handled above
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = window.innerWidth < 768 ? 70 : 100;
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
