// sync-public.js — Sincroniza arquivos da raiz SEDUC com a pasta public/ do servidor
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'planilha-google-form', 'public');
const files = [
  { src: 'index.html',        dst: 'index.html' },
  { src: 'cadastro.html',     dst: 'cadastro.html' },
  { src: 'js/dados.js',       dst: 'js/dados.js' },
  { src: 'js/app.js',         dst: 'js/app.js' },
  { src: 'js/multi-select.js',dst: 'js/multi-select.js' },
  { src: 'js/escolas.js',     dst: 'js/escolas.js' },
  { src: 'js/mapa.js',        dst: 'js/mapa.js' },
  { src: 'style.css',         dst: 'style.css' },
  { src: 'style.css',         dst: 'css/style.css' },
  { src: 'GRAPHITE_TOKENS.css', dst: 'GRAPHITE_TOKENS.css' },
  { src: 'img/banner_suporte_cam.jpg', dst: 'img/banner_suporte_cam.jpg' },
  { src: 'img/banner_suporte_cam.png', dst: 'img/banner_suporte_cam.png' },
  { src: 'img/logo-cam-login.png', dst: 'img/logo-cam-login.png' },
  { src: 'img/bg-login-frame.png', dst: 'img/bg-login-frame.png' },
  { src: 'img/banner-cadastre-escolas-vertical.jpg', dst: 'img/banner-cadastre-escolas-vertical.jpg' },
  { src: 'img/banner-cadastre-escolas-vertical.png', dst: 'img/banner-cadastre-escolas-vertical.png' },
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
