// sync-public.js — Sincroniza arquivos da raiz SEDUC com a pasta public/ do servidor
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'planilha-google-form', 'public');
const files = [
  { src: 'index.html',    dst: 'index.html' },
  { src: 'js/app.js',     dst: 'js/app.js' },
  { src: 'js/escolas.js', dst: 'js/escolas.js' },
  { src: 'js/mapa.js',    dst: 'js/mapa.js' },
];
let changes = 0;
files.forEach(({ src, dst }) => {
  const srcPath = path.join(ROOT, src);
  const dstPath = path.join(PUBLIC, dst);
  if (!fs.existsSync(srcPath)) { console.log("Nao encontrado: " + src); return; }
  fs.copyFileSync(srcPath, dstPath);
  const size = fs.statSync(srcPath).size;
  console.log("OK " + src + " -> public/" + dst + " (" + size + " bytes)");
  changes++;
});
console.log(changes + " arquivo(s) sincronizado(s).");
