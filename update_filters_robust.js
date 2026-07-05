const fs = require('fs');

function applyDropdownAndSearchFixesRobust() {
  const filePath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let js = fs.readFileSync(filePath, 'utf8');

  // Normalize line endings to \n to make replacements robust
  js = js.replace(/\r\n/g, '\n');

  // 1. Fix setupImportacao crash
  js = js.replace(
    "function setupImportacao() {\n  const zone = document.getElementById('import-zone');\n  const input = document.getElementById('import-input');\n\n  zone.addEventListener('click', () => input.click());",
    "function setupImportacao() {\n  const zone = document.getElementById('import-zone');\n  const input = document.getElementById('import-input');\n  if (!zone || !input) return;\n\n  zone.addEventListener('click', () => input.click());"
  );

  // 2. Fix search (busca)
  js = js.replace(
    "  if (busca) {\n    const q = normalizar(busca);\n    lista = lista.filter(p =>\n      normalizar(p.numero).includes(q) ||\n      normalizar(p.interessado).includes(q) ||\n      normalizar(p.municipio).includes(q) ||\n      normalizar(p.objeto).includes(q) ||\n      normalizar(p.obs).includes(q) ||\n      normalizar(p.anotacao).includes(q) ||\n      normalizar(p.prefixo).includes(q)\n    );\n  }",
    "  if (busca) {\n    const q = normalizar(busca);\n    lista = lista.filter(p =>\n      normalizar(p.numero).includes(q) ||\n      normalizar(p.interessado).includes(q) ||\n      normalizar(p.municipio).includes(q) ||\n      normalizar(p.objeto).includes(q) ||\n      normalizar(p.obs).includes(q) ||\n      normalizar(p.anotacao).includes(q) ||\n      normalizar(p.prefixo).includes(q) ||\n      normalizar(p.status).includes(q) ||\n      normalizar(p.localizacao).includes(q)\n    );\n  }"
  );

  // 3. Fix preencherSelectFiltro
  js = js.replace(
    "function preencherSelectFiltro(id, opcoes) {\n  const sel = document.getElementById(id);\n  if (!sel) return;\n  const atual = sel.value;\n  sel.innerHTML = `<option value=\"\">Todos</option>` + opcoes.map(o => `<option value=\"${o}\" ${o === atual ? 'selected' : ''}>${o}</option>`).join('');\n}",
    "function preencherSelectFiltro(id, opcoes) {\n  const sel = document.getElementById(id);\n  if (!sel) return;\n  const atual = sel.value;\n  let placeholder = 'Todos';\n  if (id === 'filtro-status') placeholder = 'Status';\n  else if (id === 'filtro-localizacao') placeholder = 'Localização';\n  else if (id === 'filtro-municipio') placeholder = 'Município';\n  else if (id === 'filtro-objeto') placeholder = 'Objeto';\n\n  sel.innerHTML = `<option value=\"\">${placeholder}</option>` + opcoes.map(o => `<option value=\"${o}\" ${o === atual ? 'selected' : ''}>${o}</option>`).join('');\n}"
  );

  // 4. Fill filter selects dynamically inside renderProcessos()
  js = js.replace(
    "  // Preencher filtros dinâmicos\n  preencherSelectFiltro('filtro-municipio', [...new Set(carregarProcessos().map(p => p.municipio).filter(Boolean))].sort());\n  preencherSelectFiltro('filtro-objeto',    [...new Set(carregarProcessos().map(p => p.objeto).filter(Boolean))].sort());",
    "  // Preencher filtros dinâmicos\n  preencherSelectFiltro('filtro-status',      [...new Set(carregarProcessos().map(p => p.status).filter(s => s && s !== '.'))].sort());\n  preencherSelectFiltro('filtro-localizacao', [...new Set(carregarProcessos().map(p => p.localizacao).filter(l => l && l !== '.'))].sort());\n  preencherSelectFiltro('filtro-municipio',   [...new Set(carregarProcessos().map(p => p.municipio).filter(Boolean))].sort());\n  preencherSelectFiltro('filtro-objeto',      [...new Set(carregarProcessos().map(p => p.objeto).filter(Boolean))].sort());"
  );

  // Restore CRLF line endings for Windows environment
  js = js.replace(/\n/g, '\r\n');

  fs.writeFileSync(filePath, js, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', js, 'utf8');
  console.log('app.js updated robustly');
}

applyDropdownAndSearchFixesRobust();
