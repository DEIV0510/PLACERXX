// Servidor estático mínimo para ver la página en local (no se publica en Vercel).
//   node tools/servidor-local.js [puerto]
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PUERTO = Number(process.argv[2]) || 5403;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let archivo = path.normalize(path.join(RAIZ, ruta === '/' ? 'index.html' : ruta));
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  fs.stat(archivo, (err, st) => {
    if (!err && st.isDirectory()) archivo = path.join(archivo, 'index.html');
    fs.readFile(archivo, (e, datos) => {
      if (e) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('No encontrado'); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(datos);
    });
  });
}).listen(PUERTO, () => console.log(`PLACER X en http://localhost:${PUERTO}`));
