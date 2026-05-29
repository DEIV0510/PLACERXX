/* Agrega super-panel "Condones" al final del catálogo */
const fs = require('fs');
const path = require('path');
const HTML = path.join(__dirname, 'index.html');

const PRODUCTS = [
  { code: 'Ot08', name: 'Preservativos Duo', price: 6000,  file: 'Ot08 preservativos duo.png' },
  { code: 'Ot09', name: 'Preservativos Saborizados',       price: 5500, file: 'Ot09 preservativos saborizados (3).png' },
  { code: 'Ot10', name: 'Preservativos Vitalis Delay & Cooling', price: 15000, file: 'Ot10 preservativos vitalis.png' },
  { code: 'Ot21', name: 'Preservativos Texturizados',      price: 15000, file: 'Ot21 Preservativos texturizados  (1).png' },
];

const fmtCOP = n => '$' + Number(n).toLocaleString('es-CO');

const cards = PRODUCTS.map(p => {
  const waText = encodeURIComponent('Hola PLACERX, quiero pedir: ' + p.name + ' (cód. ' + p.code + ')');
  const imgPath = 'catalogo/' + p.file.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
  return `      <article class="pc" data-code="${p.code}">
        <div class="pc-img"><img src="${imgPath}" alt="${p.name}" loading="lazy" /><span class="pc-tag">+18</span></div>
        <div class="pc-body">
          <span class="pc-code">${p.code}</span>
          <h4 class="pc-name">${p.name}</h4>
          <div class="pc-foot">
            <span class="pc-price">${fmtCOP(p.price)}</span>
            <a class="pc-cta" href="https://wa.me/573000000000?text=${waText}">Ver más →</a>
          </div>
        </div>
      </article>`;
}).join('\n');

const condonesPanel = `  <div class="super-panel" data-super="condones">
    <p class="super-desc">Protección con placer · saborizados, texturizados, con efecto delay & cooling y más.</p>
    <div class="sub-tabs" role="tablist">
      <button class="sub-tab is-active" data-sub="condones-all">🍿 Condones · ${PRODUCTS.length}</button>
    </div>
    <div class="sub-panel is-active" data-sub="condones-all">
      <div class="pc-grid">
${cards}
      </div>
    </div>
  </div>

  `;

const condonesTab = `      <button class="super-tab" data-super="condones">🍿 Condones</button>\r\n`;

let content = fs.readFileSync(HTML, 'utf-8');

// 1. Insertar nueva tab al final de super-tabs (antes del cierre </div>)
content = content.replace(
  /(      <button class="super-tab" data-super="ritual">🌹 Ritual<\/button>\r?\n)(    <\/div>)/,
  (m, a, b) => a + condonesTab + b
);

// 2. Insertar super-panel al final de catalog-panels (antes del cierre </div>\n  </div>\n</section>)
// El último super-panel es ritual — agregamos condones después
content = content.replace(
  /(<div class="super-panel" data-super="ritual">[\s\S]*?<\/div>\r?\n  <\/div>\r?\n)(  <\/div>\r?\n<\/section>)/m,
  (m, a, b) => a + '\n' + condonesPanel + b
);

fs.writeFileSync(HTML, content);
console.log('Condones agregados · cards:', PRODUCTS.length);
