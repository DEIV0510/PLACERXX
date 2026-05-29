/* Copia, crop y aplica bg-card a los preservativos */
const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const SRC = 'C:/Users/Lenovo/OneDrive/Escritorio/Cosmeticos sexuales/otros';
const DST = path.join(__dirname, 'catalogo');
const BG = path.join(__dirname, 'bg-card.png');

const CODES = ['Ot08', 'Ot09', 'Ot10', 'Ot21'];

(async () => {
  const bgOrig = await Jimp.read(BG);
  const files = fs.readdirSync(SRC);
  let done = 0;
  for (const code of CODES) {
    const re = new RegExp('^' + code + '[\\s\\.]');
    const match = files.find(f => re.test(f));
    if (!match) { console.log('Falta:', code); continue; }
    const img = await Jimp.read(path.join(SRC, match));
    const h = img.bitmap.height;
    const w = img.bitmap.width;
    const top = Math.floor(h * 0.22);
    const bottom = Math.floor(h * 0.82);
    img.crop({ x: 0, y: top, w: w, h: bottom - top });
    const bg = bgOrig.clone().resize({ w: img.bitmap.width, h: img.bitmap.height });
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
      const r = img.bitmap.data[idx];
      const g = img.bitmap.data[idx + 1];
      const b = img.bitmap.data[idx + 2];
      const isPurple = (b > r + 10) && (r > g + 10) && (b > 100) && (g < 180);
      if (isPurple) {
        img.bitmap.data[idx]     = bg.bitmap.data[idx];
        img.bitmap.data[idx + 1] = bg.bitmap.data[idx + 1];
        img.bitmap.data[idx + 2] = bg.bitmap.data[idx + 2];
        img.bitmap.data[idx + 3] = 255;
      }
    });
    await img.write(path.join(DST, match));
    done++;
  }
  console.log('OK', done, '/', CODES.length);
})();
