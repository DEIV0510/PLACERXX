(() => {
  'use strict';

  const DATA = JSON.parse(document.getElementById('catalogo-data').textContent);
  const WA = DATA.whatsapp;
  const POR_PAGINA = 8;
  const formatCOP = (n) => '$' + Number(n).toLocaleString('es-CO');

  /* ========== BLOQUEO DE SCROLL (cada capa pide y suelta el suyo) ========== */
  const bloqueos = new Set();
  const bloquear = (quien) => { bloqueos.add(quien); document.body.classList.add('is-locked'); };
  const desbloquear = (quien) => {
    bloqueos.delete(quien);
    if (!bloqueos.size) document.body.classList.remove('is-locked');
  };

  /* ========== MAYORÍA DE EDAD ========== */
  const ageGate = document.getElementById('ageGate');
  const ageYes = document.getElementById('ageYes');
  const AGE_KEY = 'placerx-age-ok';
  let edadOk = false;
  try { edadOk = sessionStorage.getItem(AGE_KEY) === '1'; } catch (e) {}

  if (edadOk) {
    ageGate.classList.add('is-hidden');
  } else {
    bloquear('edad');
    ageYes.focus();
  }
  ageYes.addEventListener('click', () => {
    try { sessionStorage.setItem(AGE_KEY, '1'); } catch (e) {}
    ageGate.classList.add('is-hidden');
    desbloquear('edad');
    abrirDesdeHash();
  });

  /* ========== NAVEGACIÓN ========== */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const cerrarMenu = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  };
  burger.addEventListener('click', () => {
    const abierto = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(abierto));
    burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) cerrarMenu();
  });
  document.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', cerrarMenu));

  /* ========== CATÁLOGO: CATEGORÍAS Y SUBCATEGORÍAS ========== */
  const catTabs = Array.from(document.querySelectorAll('.cat-tab'));
  const catPanels = Array.from(document.querySelectorAll('.cat-panel'));
  const idsCategorias = catTabs.map((t) => t.dataset.cat);

  function marcarTabs(tabs, activa) {
    tabs.forEach((t) => {
      const on = t === activa;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
  }

  function activarSub(panel, subId) {
    const tabs = Array.from(panel.querySelectorAll('.sub-tab'));
    const destino = tabs.find((t) => t.dataset.sub === subId);
    if (destino) marcarTabs(tabs, destino);
    panel.querySelectorAll('.sub-panel').forEach((p) => {
      const on = p.dataset.sub === subId;
      p.classList.toggle('is-active', on);
      p.hidden = !on;
    });
  }

  function activarCategoria(id) {
    const tab = catTabs.find((t) => t.dataset.cat === id);
    if (!tab) return;
    marcarTabs(catTabs, tab);
    catPanels.forEach((p) => {
      const on = p.dataset.cat === id;
      p.classList.toggle('is-active', on);
      p.hidden = !on;
    });
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function irAlCatalogo(id) {
    activarCategoria(id);
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
    document.querySelector('.cat-tabs-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  catTabs.forEach((t) => t.addEventListener('click', () => {
    activarCategoria(t.dataset.cat);
    try { history.replaceState(null, '', '#' + t.dataset.cat); } catch (e) {}
  }));
  document.querySelectorAll('.cat-panel').forEach((panel) => {
    panel.querySelectorAll('.sub-tab').forEach((st) => st.addEventListener('click', () => activarSub(panel, st.dataset.sub)));
  });

  // flechas del teclado dentro de cada fila de pestañas
  document.querySelectorAll('[role="tablist"]').forEach((lista) => {
    lista.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
      const tabs = Array.from(lista.querySelectorAll('[role="tab"]'));
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const j = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1
        : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[j].focus();
      tabs[j].click();
    });
  });

  // degradado en el borde derecho mientras queden pestañas por deslizar
  const tabsWrap = document.querySelector('.cat-tabs-wrap');
  const tabsRow = document.querySelector('.cat-tabs');
  const marcarMas = () => tabsWrap.classList.toggle('has-more', tabsRow.scrollLeft + tabsRow.clientWidth < tabsRow.scrollWidth - 4);
  tabsRow.addEventListener('scroll', marcarMas, { passive: true });
  window.addEventListener('resize', marcarMas);
  marcarMas();

  // enlaces a una categoría (menú, guía, pie)
  document.querySelectorAll('a[data-cat]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    irAlCatalogo(a.dataset.cat);
  }));

  /* ========== «VER MÁS» EN CADA LISTA ========== */
  document.querySelectorAll('.sub-panel').forEach((sub) => {
    const cards = Array.from(sub.querySelectorAll('.pc'));
    const boton = sub.querySelector('.ver-mas');
    let visibles = POR_PAGINA;
    const pintar = () => {
      cards.forEach((c, i) => { c.hidden = i >= visibles; });
      const faltan = cards.length - visibles;
      boton.hidden = faltan <= 0;
      boton.textContent = `Ver más productos (${faltan})`;
    };
    boton.addEventListener('click', () => {
      const primeraNueva = cards[visibles];
      visibles += POR_PAGINA;
      pintar();
      if (primeraNueva) primeraNueva.querySelector('.pc-link').focus({ preventScroll: true });
    });
    pintar();
  });

  /* ========== PANEL DE PRODUCTO ========== */
  const drawer = document.getElementById('productDrawer');
  const $ = (rol) => drawer.querySelector(`[data-role="${rol}"]`);
  const els = {
    img: $('img'), cat: $('cat'), para: $('para'), name: $('name'), code: $('code'), tagline: $('tagline'),
    guia: $('guia'), flavorsSection: $('flavors-section'), flavors: $('flavors'),
    qty: $('qty'), price: $('price'), cta: $('cta'), recs: $('recs'),
  };
  const estado = { card: null, qty: 1, precio: 0, ultimoFoco: null, cerrando: null };

  const escapar = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function pintarGuia(info) {
    if (info.uso) {
      els.guia.innerHTML = `<span class="drawer-label">Cómo se usa</span>
        <dl class="drawer-guia">
          <div><dt>Uso</dt><dd>${escapar(info.uso)}</dd></div>
          <div><dt>Efecto</dt><dd>${escapar(info.efecto)}</dd></div>
          <div><dt>Beneficio</dt><dd>${escapar(info.beneficio)}</dd></div>
        </dl>`;
    } else {
      const feats = (info.features || []).map((f) => `<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg>${escapar(f)}</li>`).join('');
      els.guia.innerHTML = `<span class="drawer-label">Sobre este producto</span>
        <p class="drawer-desc">${escapar(info.desc || '')}</p>
        ${feats ? `<ul class="drawer-features">${feats}</ul>` : ''}`;
    }
  }

  function pintarSabores(code) {
    const lista = DATA.sabores[code];
    els.flavorsSection.hidden = !lista;
    els.flavors.innerHTML = (lista || []).map((s, i) =>
      `<button class="drawer-chip" type="button" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-flavor="${escapar(s)}">${escapar(s)}</button>`).join('');
  }

  function saborElegido() {
    if (els.flavorsSection.hidden) return null;
    const chip = els.flavors.querySelector('[aria-checked="true"]');
    return chip ? chip.dataset.flavor : null;
  }

  function actualizarPedido() {
    const c = estado.card.dataset;
    const total = estado.precio * estado.qty;
    els.qty.textContent = String(estado.qty);
    els.price.textContent = formatCOP(total);
    const lineas = ['Hola PLACER X, quiero hacer este pedido:', `• ${c.name} (cód. ${c.code})`];
    const sabor = saborElegido();
    if (sabor) lineas.push(`• Sabor: ${sabor}`);
    lineas.push(`• Cantidad: ${estado.qty}`, `• Total: ${formatCOP(total)}`);
    els.cta.href = `https://wa.me/${WA}?text=${encodeURIComponent(lineas.join('\n'))}`;
  }

  function pintarRecomendados(card) {
    const panel = card.closest('.cat-panel');
    const vistos = new Set([card.dataset.code]);
    const pool = [];
    panel.querySelectorAll('.pc').forEach((p) => {
      if (vistos.has(p.dataset.code)) return;
      vistos.add(p.dataset.code);
      pool.push(p);
    });
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    els.recs.innerHTML = pool.slice(0, 4).map((p) => `
      <button class="drawer-rec" type="button" data-rec-code="${escapar(p.dataset.code)}">
        <img src="${escapar(p.dataset.img)}" alt="" width="720" height="540" loading="lazy" />
        <span class="drawer-rec-name">${escapar(p.dataset.name)}</span>
        <span class="drawer-rec-price">${formatCOP(p.dataset.price)}</span>
      </button>`).join('');
  }

  function abrirProducto(card) {
    if (!card) return;
    const d = card.dataset;
    const info = DATA.info[d.sub] || {};
    estado.card = card;
    estado.qty = 1;
    estado.precio = Number(d.price);
    if (!drawer.classList.contains('is-open')) estado.ultimoFoco = document.activeElement;

    els.img.src = d.img;
    els.img.alt = d.name;
    els.cat.textContent = info.etiqueta || '';
    els.para.textContent = info.para ? `Para: ${info.para}` : '';
    els.name.textContent = d.name;
    els.code.textContent = d.code;
    els.tagline.textContent = info.tagline || '';
    pintarGuia(info);
    pintarSabores(d.code);
    pintarRecomendados(card);
    actualizarPedido();

    clearTimeout(estado.cerrando);
    drawer.hidden = false;
    void drawer.offsetWidth; // fuerza el reflow para que la transición arranque sin depender de rAF
    drawer.classList.add('is-open');
    document.body.classList.add('has-drawer');
    bloquear('panel');
    drawer.querySelector('.drawer-scroll').scrollTop = 0;
    drawer.querySelector('.drawer-close').focus({ preventScroll: true });
  }

  function cerrarProducto() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('has-drawer');
    desbloquear('panel');
    estado.cerrando = setTimeout(() => { drawer.hidden = true; }, 340);
    if (estado.ultimoFoco && document.contains(estado.ultimoFoco)) estado.ultimoFoco.focus({ preventScroll: true });
  }

  const tarjetaPorCodigo = (code) => document.querySelector(`.pc[data-code="${CSS.escape(code)}"]`);

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.pc-link');
    if (link) {
      e.preventDefault();
      abrirProducto(link.closest('.pc'));
      return;
    }
    const abrir = e.target.closest('[data-open-code]');
    if (abrir) {
      abrirProducto(tarjetaPorCodigo(abrir.dataset.openCode));
      return;
    }
    const rec = e.target.closest('.drawer-rec');
    if (rec) {
      abrirProducto(tarjetaPorCodigo(rec.dataset.recCode));
      return;
    }
    if (e.target.closest('[data-close]')) cerrarProducto();
  });

  drawer.querySelectorAll('.drawer-qty-btn').forEach((btn) => btn.addEventListener('click', () => {
    estado.qty = btn.dataset.q === 'plus' ? Math.min(estado.qty + 1, 99) : Math.max(estado.qty - 1, 1);
    actualizarPedido();
  }));

  function elegirSabor(chip) {
    els.flavors.querySelectorAll('.drawer-chip').forEach((c) => {
      const on = c === chip;
      c.setAttribute('aria-checked', String(on));
      c.tabIndex = on ? 0 : -1;
    });
    actualizarPedido();
  }
  els.flavors.addEventListener('click', (e) => {
    const chip = e.target.closest('.drawer-chip');
    if (chip) elegirSabor(chip);
  });
  els.flavors.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const chips = Array.from(els.flavors.querySelectorAll('.drawer-chip'));
    const i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const j = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + chips.length) % chips.length;
    chips[j].focus();
    elegirSabor(chips[j]);
  });

  // Esc cierra; Tab no se sale del panel mientras está abierto
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawer.classList.contains('is-open')) cerrarProducto();
      else if (nav.classList.contains('is-open')) { cerrarMenu(); burger.focus(); }
      return;
    }
    if (e.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
    const focos = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .filter((el) => el.offsetParent !== null);
    if (!focos.length) return;
    const primero = focos[0], ultimo = focos[focos.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

  /* ========== ENLACES DIRECTOS: #categoria o #producto-CODIGO ========== */
  function abrirDesdeHash() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return;
    if (idsCategorias.includes(hash)) {
      activarCategoria(hash);
      document.querySelector('.cat-tabs-wrap').scrollIntoView({ block: 'start' });
    } else if (hash.startsWith('producto-')) {
      const card = tarjetaPorCodigo(hash.slice(9));
      if (card) {
        activarCategoria(card.closest('.cat-panel').dataset.cat);
        abrirProducto(card);
      }
    }
  }
  if (edadOk) abrirDesdeHash();
  window.addEventListener('hashchange', () => { if (ageGate.classList.contains('is-hidden')) abrirDesdeHash(); });
})();
