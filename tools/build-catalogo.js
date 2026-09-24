// Arma las partes de index.html que salen del catálogo (data/catalogo.json):
// guía de categorías, pestañas y tarjetas, enlaces del pie y los datos del panel de producto.
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

function tarjeta(p, sub) {
  const img = `img/p/${p.code}.webp`;
  const genero = p.genero ? `\n      <span class="pc-chip pc-chip--${p.genero}">${GENERO[p.genero]}</span>` : '';
  return `  <article class="pc" data-code="${esc(p.code)}" data-name="${esc(p.nombre)}" data-price="${p.precio}" data-img="${img}" data-sub="${sub.id}"${p.genero ? ` data-genero="${p.genero}"` : ''}>
    <div class="pc-media">
      <img src="${img}" alt="${esc(p.nombre)}" width="720" height="540" loading="lazy" decoding="async" />${genero}
    </div>
    <div class="pc-body">
      <span class="pc-code">${esc(p.code)}</span>
      <h3 class="pc-name"><a class="pc-link" href="${esc(waLink(`Hola PLACER X, quiero pedir: ${p.nombre} (cód. ${p.code})`))}">${esc(p.nombre)}</a></h3>
      <div class="pc-foot">
        <span class="pc-price">${cop(p.precio)}</span>
        <span class="pc-more" aria-hidden="true">Ver <svg class="ic"><use href="#i-flecha"/></svg></span>
      </div>
    </div>
  </article>`;
}

function catalogo() {
  const tabs = cat.categorias.map((c, i) => `    <button class="cat-tab${i === 0 ? ' is-active' : ''}" type="button" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" data-cat="${c.id}">
      <svg class="ic" aria-hidden="true"><use href="#i-${c.icono}"/></svg><span>${esc(c.nombre)}</span>
    </button>`).join('\n');

  const paneles = cat.categorias.map((c, i) => {
    const varias = c.subs.length > 1;
    const subTabs = varias ? `
    <div class="sub-tabs" role="tablist" aria-label="${esc(c.nombre)}">
${c.subs.map((s, j) => `      <button class="sub-tab${j === 0 ? ' is-active' : ''}" type="button" role="tab" id="subtab-${s.id}" aria-controls="sub-${s.id}" aria-selected="${j === 0}" data-sub="${s.id}">${esc(s.nombre)} <span>${s.productos.length}</span></button>`).join('\n')}
    </div>` : '';
    const subs = c.subs.map((s, j) => `
    <div class="sub-panel${j === 0 ? ' is-active' : ''}" id="sub-${s.id}" data-sub="${s.id}"${varias ? ` role="tabpanel" aria-labelledby="subtab-${s.id}"` : ''}${j === 0 ? '' : ' hidden'}>
      <div class="pc-grid">
${s.productos.map((p) => tarjeta(p, s)).join('\n')}
      </div>
      <button class="ver-mas" type="button" hidden>Ver más productos</button>
    </div>`).join('');
    return `  <div class="cat-panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" data-cat="${c.id}"${i === 0 ? '' : ' hidden'}>
    <p class="cat-intro">${esc(c.intro)}</p>${subTabs}${subs}
  </div>`;
  }).join('\n');

  return `
<header class="section-head">
  <span class="eyebrow">Catálogo</span>
  <h2 class="section-title">Explora la <em>colección</em></h2>
  <p class="section-sub">${totalProductos} productos en ${cat.categorias.length} categorías. Toca un producto para ver cómo se usa, elegir la cantidad y pedirlo por WhatsApp.</p>
</header>
<div class="cat-tabs-wrap">
  <div class="cat-tabs" role="tablist" aria-label="Categorías del catálogo">
${tabs}
  </div>
</div>
<div class="cat-panels">
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
    return `  <a class="guia-card" href="#${c.id}" data-cat="${c.id}">
    <span class="guia-icon"><svg class="ic" aria-hidden="true"><use href="#i-${c.icono}"/></svg></span>
    <span class="guia-name">${esc(c.nombre)}</span>
    <span class="guia-para">Para: ${esc(para)}</span>
    <span class="guia-text">${esc(texto)}</span>
    <span class="guia-link">${n} productos <svg class="ic" aria-hidden="true"><use href="#i-flecha"/></svg></span>
  </a>`;
  }).join('\n') + '\n';
}

function pie() {
  return '\n' + cat.categorias.map((c) => `      <li><a href="#${c.id}" data-cat="${c.id}">${esc(c.nombre)}</a></li>`).join('\n') + '\n';
}

function datos() {
  const data = { whatsapp: WA, info: cat.info, sabores: cat.sabores };
  return `\n<script type="application/json" id="catalogo-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`;
}

let html = fs.readFileSync(HTML, 'utf8');
const bloques = { GUIA: guia(), CATALOGO: catalogo(), PIE: pie(), DATOS: datos() };
for (const [nombre, contenido] of Object.entries(bloques)) {
  const re = new RegExp(`(<!-- GEN:${nombre} -->)[\\s\\S]*?(<!-- /GEN:${nombre} -->)`);
  if (!re.test(html)) throw new Error(`Falta el marcador GEN:${nombre} en index.html`);
  html = html.replace(re, (_, a, b) => a + contenido + b);
}
fs.writeFileSync(HTML, html, 'utf8');
console.log(`index.html actualizado: ${totalProductos} productos, ${cat.categorias.length} categorías`);
