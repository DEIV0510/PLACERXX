/* Copia + procesa lubricantes seleccionados */
const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const SRC = 'C:/Users/Lenovo/OneDrive/Escritorio/Cosmeticos sexuales/Lubricantes';
const DST = path.join(__dirname, 'catalogo');

const CODES = ['Lu01','Lu02','Lu04','Lu07','Lu08','Lu14','Lu16','Lu20','Lu21','Lu22','Lu33','Lu40','Lu41'];

(async () => {
  const files = fs.readdirSync(SRC);
  let done = 0, missing = [];
  for (const code of CODES) {
    const re = new RegExp('^' + code + '[\\s\\.]');
    const match = files.find(f => re.test(f));
    if (!match) { missing.push(code); continue; }
    const img = await Jimp.read(path.join(SRC, match));
    const h = img.bitmap.height;
    const top = Math.floor(h * 0.22);
    const bottom = Math.floor(h * 0.82);
    img.crop({ x: 0, y: top, w: img.bitmap.width, h: bottom - top });
    await img.write(path.join(DST, match));
    done++;
  }
  console.log('OK ·', done, '/', CODES.length);
  if (missing.length) console.log('Faltan:', missing);
})();
