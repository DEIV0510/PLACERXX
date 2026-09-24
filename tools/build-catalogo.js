// Arma las partes de index.html que salen del catálogo (data/catalogo.json):
// guía de categorías, pestañas y tarjetas, enlaces del pie, conteo del botón y datos del panel.
//   node tools/build-catalogo.js
// Solo reemplaza lo que está entre los comentarios <!-- GEN:NOMBRE --> y <!-- /GEN:NOMBRE -->.
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const HTML = path.join(RAIZ, 'index.html');
const cat = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'catalogo.json'), 'utf8'));
const WA = cat.whatsapp;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cop = (n) => '$' + Number(n).toLocaleString('es-CO');
const waLink = (texto) => `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
const GENERO = { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' };

const productosDe = (c) => c.subs.flatMap((s) => s.productos);
const unicos = new Map();
for (const c of cat.categorias) for (const p of productosDe(c)) unicos.set(p.code, p);
const totalProductos = unicos.size;
const totalSubs = cat.categorias.reduce((n, c) => n + c.subs.length, 0);

function tarjeta(p, sub) {
  const img = `img/p/${p.code}.webp`;
  const genero = p.genero ? `<span class="pc-chip pc-chip--${p.genero}">${GENERO[p.genero]}</span>` : '';
  return `        <article class="pc" data-code="${esc(p.code)}" data-name="${esc(p.nombre)}" data-price="${p.precio}" data-img="${img}" data-sub="${sub.id}"${p.genero ? ` data-genero="${p.genero}"` : ''}>
          <div class="pc-img"><img src="${img}" alt="${esc(p.nombre)}" width="720" height="540" loading="lazy" decoding="async" /><span class="pc-tag">+18</span>${genero}</div>
          <div class="pc-body">
            <span class="pc-code">${esc(p.code)}</span>
            <h3 class="pc-name">${esc(p.nombre)}</h3>
            <div class="pc-foot">
              <span class="pc-price">${cop(p.precio)}</span>
              <a class="pc-cta" href="${esc(waLink(`Hola PLACERX, quiero pedir: ${p.nombre} (cód. ${p.code})`))}" aria-label="Ver ${esc(p.nombre)}">Ver más →</a>
            </div>
          </div>
        </article>`;
}

function catalogo() {
  const tabs = cat.categorias.map((c, i) => `  <button class="super-tab${i === 0 ? ' is-active' : ''}" type="button" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" data-super="${c.id}">${c.emoji} ${esc(c.nombre)}</button>`).join('\n');

  const paneles = cat.categorias.map((c, i) => {
    const subTabs = c.subs.map((s, j) => `      <button class="sub-tab${j === 0 ? ' is-active' : ''}" type="button" role="tab" id="subtab-${s.id}" aria-controls="sub-${s.id}" aria-selected="${j === 0}" data-sub="${s.id}">${s.emoji} ${esc(s.nombre)} · ${s.productos.length}</button>`).join('\n');
    const subs = c.subs.map((s, j) => `
    <div class="sub-panel${j === 0 ? ' is-active' : ''}" id="sub-${s.id}" role="tabpanel" aria-labelledby="subtab-${s.id}" data-sub="${s.id}"${j === 0 ? '' : ' hidden'}>
      <div class="pc-grid">
${s.productos.map((p) => tarjeta(p, s)).join('\n')}
      </div>
      <button class="ver-mas" type="button" hidden>Ver más productos</button>
    </div>`).join('');
    return `  <div class="super-panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" data-super="${c.id}"${i === 0 ? '' : ' hidden'}>
    <p class="super-desc">${esc(c.intro)}</p>
    <div class="sub-tabs" role="tablist" aria-label="${esc(c.nombre)}">
${subTabs}
    </div>${subs}
  </div>`;
  }).join('\n');

  return `
<header class="catalog-master-head">
  <span class="catalog-master-tag">★ CATÁLOGO COMPLETO · ${totalProductos} PRODUCTOS</span>
  <h2 class="catalog-master-title">Explora todo el <em>placer</em>.</h2>
  <p class="catalog-master-sub">${cat.categorias.length} universos, ${totalSubs} categorías, ${totalProductos} productos. Toca cualquiera para ver cómo se usa y pedirlo.</p>
</header>
<div class="super-tabs" role="tablist" aria-label="Categorías del catálogo">
${tabs}
</div>
<div class="catalog-panels">
${paneles}
</div>
`;
}

function guia() {
  return '\n' + cat.categorias.map((c) => {
    const info = cat.info[c.subs[0].info] || {};
    const para = c.id === 'energizantes' ? 'Hombre · Mujer · Unisex' : c.id === 'retardantes' ? 'Hombre' : info.para || 'Todos';
    const texto = info.beneficio || info.efecto || info.desc || c.intro;
    const n = new Set(productosDe(c).map((p) => p.code)).size;
    return `      <a class="cat" href="#${c.id}" data-cat="${c.id}">
        <span class="cat-emoji" aria-hidden="true">${c.emoji}</span>
        <h3 class="cat-name">${esc(c.nombre)}</h3>
        <span class="cat-para">Para: ${esc(para)}</span>
        <p class="cat-text">${esc(texto)}</p>
        <span class="cat-count">${n} productos</span>
        <span class="cat-arrow" aria-hidden="true">→</span>
      </a>`;
  }).join('\n') + '\n    ';
}

function nav() {
  return '\n' + cat.categorias.map((c) => `      <li><a href="#${c.id}" data-cat="${c.id}">${c.emoji} ${esc(c.nombre)}</a></li>`).join('\n') + '\n';
}

function datos() {
  const data = { whatsapp: WA, info: cat.info, sabores: cat.sabores };
  return `\n<script type="application/json" id="catalogo-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`;
}

let html = fs.readFileSync(HTML, 'utf8');
const bloques = { NAV: nav(), TOTAL: String(totalProductos), GUIA: guia(), CATALOGO: catalogo(), DATOS: datos() };
for (const [nombre, contenido] of Object.entries(bloques)) {
  const re = new RegExp(`(<!-- GEN:${nombre} -->)[\\s\\S]*?(<!-- /GEN:${nombre} -->)`, 'g');
  if (!re.test(html)) throw new Error(`Falta el marcador GEN:${nombre} en index.html`);
  html = html.replace(re, (_, a, b) => a + contenido + b);
}
fs.writeFileSync(HTML, html, 'utf8');
console.log(`index.html actualizado: ${totalProductos} productos, ${cat.categorias.length} categorías, ${totalSubs} subcategorías`);
