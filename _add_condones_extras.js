/* Procesa los 3 condones de tiendacereza: recorta y aplica bg-card */
const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const SRC = 'C:/Users/Lenovo/OneDrive/Escritorio/condones';
const DST = path.join(__dirname, 'catalogo');
const BG = path.join(__dirname, 'bg-card.png');

const ITEMS = [
  { src: 'condones3.jpg', out: 'C01 Kristel Colores Surtidos.png', crop: { x: 50, y: 370, w: 720, h: 540 } },
  { src: 'condones4.jpg', out: 'C02 Sens Extase Burbujas.png',     crop: { x: 280, y: 425, w: 440, h: 475 } },
  { src: 'condones5.jpg', out: 'C03 Sens Exciter Estrias.png',     crop: { x: 180, y: 290, w: 540, h: 600 } },
];

(async () => {
  const bgOrig = await Jimp.read(BG);
  for (const it of ITEMS) {
    const img = await Jimp.read(path.join(SRC, it.src));
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    img.crop(it.crop);

    // Aplicar bg-card escalado al tamaño del recorte
    const bg = bgOrig.clone().resize({ w: img.bitmap.width, h: img.bitmap.height });

    // Reemplazar pixels blancos/casi-blancos con el bg
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
      const r = img.bitmap.data[idx];
      const g = img.bitmap.data[idx + 1];
      const b = img.bitmap.data[idx + 2];
      const isWhite = (r > 235 && g > 235 && b > 235);
      if (isWhite) {
        img.bitmap.data[idx]     = bg.bitmap.data[idx];
        img.bitmap.data[idx + 1] = bg.bitmap.data[idx + 1];
        img.bitmap.data[idx + 2] = bg.bitmap.data[idx + 2];
        img.bitmap.data[idx + 3] = 255;
      }
    });

    await img.write(path.join(DST, it.out));
    console.log('OK:', it.out);
  }
})();
