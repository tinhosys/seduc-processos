const fs = require('fs');

// 1. Fix index.html
let html = fs.readFileSync('index.html', 'utf8');

// Change select to input text
const oldSelect = /<select id="filtro-digito".*?<\/select>/s;
const newInput = '<input type="text" id="filtro-digito" placeholder="DÍGITO" style="flex:1; min-width:120px; max-width:150px; padding:10px 12px; background:transparent; border:1px solid rgba(99,102,241,0.5); border-radius:8px; color:#818cf8; font-size:13px; font-weight:600; outline:none;" autocomplete="off">';
html = html.replace(oldSelect, newInput);

// Fix label form-digito encoding
html = html.replace(/<label for="form-digito">D[^<]+gito<\/label>/g, '<label for="form-digito">Dígito</label>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html fixed');

// 2. Fix app.js
let js1 = fs.readFileSync('js/app.js', 'utf8');

// Remove select2 initialization for filtro-digito
js1 = js1.replace(/preencherSelectFiltro\('filtro-digito',[^;]+;\r?\n?/g, '');
js1 = js1.replace(/else if \(id === 'filtro-digito'\) placeholder = 'D[^']+GITO';\r?\n?/g, '');

// Change event listener from select change to input
js1 = js1.replace(/filtroDigitoEl\.addEventListener\('change', \(e\) => aplicarFiltro\('digito', e\?\.target\?\.value \|\| null\)\);/, 
                  "filtroDigitoEl.addEventListener('input', (e) => aplicarFiltro('digito', e.target.value.trim()));");

// In renderProcessos, change filtering logic
// Currently: if (state.filtros.digito.length > 0) ...
// We need it to be string matching
const oldFilterLogic = /if \(state\.filtros\.digito && state\.filtros\.digito\.length > 0\) \{\s*processos = processos\.filter\(p => state\.filtros\.digito\.includes\(p\.digito\)\);\s*\}/s;
const newFilterLogic = "if (state.filtros.digito && state.filtros.digito.length > 0) {\n      processos = processos.filter(p => (p.digito || p.DIGITO || '').toString().includes(state.filtros.digito));\n    }";

// Wait, the logic is actually dynamically generated in ilterByMultiple maybe?
// Let's check if there is an explicit block for digito in renderProcessos!
