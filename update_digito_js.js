const fs = require('fs');

function updateJS(file) {
  let js = fs.readFileSync(file, 'utf8');
  
  // 1. Reading into form
  js = js.replace(
    "document.getElementById('form-agrupamento').value = p.agrupamento  || '';",
    "document.getElementById('form-agrupamento').value = p.agrupamento  || '';\n    document.getElementById('form-digito').value = p.digito || p.DIGITO || '';"
  );
  
  // 2. Clearing form
  js = js.replace(
    "document.getElementById('form-agrupamento').value = '';",
    "document.getElementById('form-agrupamento').value = '';\n    document.getElementById('form-digito').value = '';"
  );
  
  // 3. Saving from form
  js = js.replace(
    "agrupamento: document.getElementById('form-agrupamento').value.trim(),",
    "agrupamento: document.getElementById('form-agrupamento').value.trim(),\n    digito: document.getElementById('form-digito').value.trim(),"
  );

  // 4. Populate digito filter
  js = js.replace(
    "preencherSelectFiltro('filtro-agrupamento', [...new Set(todosProcs.map(p => p.agrupamento).filter(Boolean))].sort());",
    "preencherSelectFiltro('filtro-agrupamento', [...new Set(todosProcs.map(p => p.agrupamento).filter(Boolean))].sort());\n  preencherSelectFiltro('filtro-digito', [...new Set(todosProcs.map(p => p.digito || p.DIGITO).filter(Boolean))].sort());"
  );
  // for app_github.js
  js = js.replace(
    "preencherSelectFiltro('filtro-agrupamento', [...new Set(carregarProcessos().map(p => p.agrupamento).filter(Boolean))].sort());",
    "preencherSelectFiltro('filtro-agrupamento', [...new Set(carregarProcessos().map(p => p.agrupamento).filter(Boolean))].sort());\n  preencherSelectFiltro('filtro-digito', [...new Set(carregarProcessos().map(p => p.digito || p.DIGITO).filter(Boolean))].sort());"
  );

  // 5. Placeholder
  js = js.replace(
    "else if (id === 'filtro-agrupamento') placeholder = 'AGRUPAMENTO';",
    "else if (id === 'filtro-agrupamento') placeholder = 'AGRUPAMENTO';\n  else if (id === 'filtro-digito') placeholder = 'DÍGITO';"
  );

  // 6. Filter Event Listener
  js = js.replace(
    "const filtroAgrupEl = document.getElementById('filtro-agrupamento');",
    "const filtroDigitoEl = document.getElementById('filtro-digito');\n  if (filtroDigitoEl) { filtroDigitoEl.addEventListener('change', (e) => aplicarFiltro('digito', e?.target?.value || null)); }\n  const filtroAgrupEl = document.getElementById('filtro-agrupamento');"
  );

  // 7. Clear Filters array
  js = js.replace(
    "'filtro-ano','filtro-agrupamento'].forEach",
    "'filtro-ano','filtro-agrupamento','filtro-digito'].forEach"
  );
  
  // 8. Clear Filters (app_github.js style)
  js = js.replace(
    "const fAgr = document.getElementById('filtro-agrupamento');\n    if (fAgr) fAgr.value = '';",
    "const fAgr = document.getElementById('filtro-agrupamento');\n    if (fAgr) fAgr.value = '';\n    const fDig = document.getElementById('filtro-digito');\n    if (fDig) fDig.value = '';"
  );

  fs.writeFileSync(file, js, 'utf8');
}

updateJS('js/app.js');
updateJS('js/app_github.js');
console.log('Done modifying JS');
