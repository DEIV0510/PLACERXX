// Genera las fotos que usa la web (WebP livianos) a partir de las fotos maestras del catálogo.
//   node tools/optimizar-imagenes.js          solo las que cambiaron
//   node tools/optimizar-imagenes.js --todo   todas
// Necesita sharp, que no está en el repo: define SHARP_PATH con la ruta a una carpeta
// node_modules/sharp que ya exista, o instálalo aparte con `npm i sharp`.
const fs = require('fs');
const path = require('path');
const sharp = require(process.env.SHARP_PATH || 'sharp');

const RAIZ = path.join(__dirname, '..');
const cat = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'catalogo.json'), 'utf8'));
const SALIDA = path.join(RAIZ, 'img', 'p');
const TODO = process.argv.includes('--todo');
fs.mkdirSync(SALIDA, { recursive: true });

(async () => {
  const hechos = new Set();
  let nuevos = 0;
  for (const c of cat.categorias) for (const s of c.subs) for (const p of s.productos) {
    if (hechos.has(p.code)) continue;
    hechos.add(p.code);
    const origen = path.join(RAIZ, p.img);
    const destino = path.join(SALIDA, `${p.code}.webp`);
    if (!TODO && fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= fs.statSync(origen).mtimeMs) continue;
    // enfoque leve: al reducir de 1080 a 720 la foto pierde nitidez
    await sharp(origen).resize(720, 540, { fit: 'cover' }).sharpen({ sigma: 0.6 }).webp({ quality: 82 }).toFile(destino);
    nuevos++;
  }
  console.log(`${hechos.size} productos · ${nuevos} fotos web generadas en img/p/`);
})().catch((e) => { console.error(e); process.exit(1); });
