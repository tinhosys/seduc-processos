const fs = require('fs');

function fixJs(file) {
  let js = fs.readFileSync(file, 'utf8');

  // Remove preencherSelectFiltro('filtro-digito', ...);
  js = js.replace(/preencherSelectFiltro\('filtro-digito',[^)]+\)\.sort\(\)\);\r?\n?/g, '');
  js = js.replace(/preencherSelectFiltro\('filtro-digito',.*?\r?\n?/g, '');

  // Remove placeholder logic for select2
  js = js.replace(/else if \(id === 'filtro-digito'\) placeholder = 'D\?GITO';\r?\n?/g, '');
  js = js.replace(/else if \(id === 'filtro-digito'\) placeholder = 'DÍGITO';\r?\n?/g, '');

  // Change event listener to input
  js = js.replace(
    /if \(filtroDigitoEl\) \{ filtroDigitoEl\.addEventListener\('change', \(e\) => aplicarFiltro\('digito', e\?\.target\?\.value \|\| null\)\); \}/g,
    "if (filtroDigitoEl) { filtroDigitoEl.addEventListener('input', (e) => aplicarFiltro('digito', e.target.value.trim())); }"
  );

  // Change state initialization to use string instead of array for digito
  js = js.replace(
    /ano: \[\], agrupamento: \[\], digito: \[\]/g,
    "ano: [], agrupamento: [], digito: ''"
  );
  
  // Clear digito on reset
  js = js.replace(
    /'filtro-prefixo','filtro-categoria','filtro-tipo','filtro-ano','filtro-agrupamento','filtro-digito'\]/g,
    "'filtro-prefixo','filtro-categoria','filtro-tipo','filtro-ano','filtro-agrupamento']"
  );
  
  // Add clear input text logic to reset
  const resetAnchor = "document.getElementById('filtro-busca').value = '';";
  if (js.indexOf(resetAnchor) !== -1) {
    if (js.indexOf("document.getElementById('filtro-digito').value = '';") === -1) {
      js = js.replace(resetAnchor, resetAnchor + "\n    const fd = document.getElementById('filtro-digito');\n    if(fd) fd.value = '';");
    }
  }

  // Change filter logic in renderProcessos
  // Replace filterByMultiple('digito', state.filtros.digito); with string includes
  js = js.replace(
    /filterByMultiple\('digito', state\.filtros\.digito\);/g,
    "if (state.filtros.digito) {\n    lista = lista.filter(p => normalizar(p.digito || p.DIGITO || '').includes(normalizar(state.filtros.digito)));\n  }"
  );

  fs.writeFileSync(file, js, 'utf8');
}

fixJs('js/app.js');
fixJs('js/app_github.js');
console.log('JS files fixed');
