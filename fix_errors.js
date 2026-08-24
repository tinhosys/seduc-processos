const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix imprimirPadrão to imprimirPadrao
html = html.replace(/onclick="imprimirPadrão\(\)"/g, 'onclick="imprimirPadrao()"');
html = html.replace(/onclick="imprimirPadr.o\(\)"/g, 'onclick="imprimirPadrao()"');

// 2. Inject the User button to fill the space
const controlsRegex = /<div style="display:flex; align-items:stretch; justify-content:flex-end; gap:10px; flex-wrap:wrap; width:100%;">\s*<button type="button" id="btn-toggle-filtros"/;

const userButton = `<div style="display:flex; align-items:stretch; justify-content:flex-end; gap:10px; flex-wrap:wrap; width:100%;">
              <button type="button" class="btn btn-ghost btn-sm" style="flex:1; max-width:180px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); color:#94a3b8; padding:10px 12px; height:40px; border-radius:8px; font-weight:700; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:default; text-transform:uppercase; letter-spacing:0.5px;" title="Usuário Logado">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span class="btn-text">ELTON (ADMIN)</span>
              </button>
              <button type="button" id="btn-toggle-filtros"`;

html = html.replace(controlsRegex, userButton);

// Version bump
html = html.replace(/v1\.0\.97/g, 'v1.0.98');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html fixed');

// --- Now fix app.js ---
let js = fs.readFileSync('js/app.js', 'utf8');

// The regex should match ANY characters before <span class="btn-text">Mostrar Filtros</span>
// example: btn.innerHTML = '?? <span class="btn-text">Mostrar Filtros</span>';
js = js.replace(/btn\.innerHTML = '[^<]*<span class="btn-text">Mostrar Filtros<\/span>';/g, `btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polyline></svg> <span class="btn-text">MOSTRAR FILTROS</span>';`);

js = js.replace(/btn\.innerHTML = '[^<]*<span class="btn-text">Ocultar Filtros<\/span>';/g, `btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> <span class="btn-text">OCULTAR FILTROS</span>';`);

// Also fix btnFilters (used in window.onload or similar)
js = js.replace(/btnFilters\.innerHTML = '[^<]*<span class="btn-text">Mostrar Filtros<\/span>';/g, `btnFilters.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polyline></svg> <span class="btn-text">MOSTRAR FILTROS</span>';`);

js = js.replace(/btnFilters\.innerHTML = '[^<]*<span class="btn-text">Ocultar Filtros<\/span>';/g, `btnFilters.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> <span class="btn-text">OCULTAR FILTROS</span>';`);

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('js/app.js fixed');

