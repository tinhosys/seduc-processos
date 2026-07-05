const fs = require('fs');

function applyDropdownAndSearchFixes() {
  const filePath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let js = fs.readFileSync(filePath, 'utf8');

  // 1. Fix setupImportacao crash by checking if elements exist
  js = js.replace(
    `function setupImportacao() {
  const zone = document.getElementById('import-zone');
  const input = document.getElementById('import-input');

  zone.addEventListener('click', () => input.click());`,
    `function setupImportacao() {
  const zone = document.getElementById('import-zone');
  const input = document.getElementById('import-input');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());`
  );

  // 2. Fix search (busca) to include status and location
  js = js.replace(
    `  if (busca) {
    const q = normalizar(busca);
    lista = lista.filter(p =>
      normalizar(p.numero).includes(q) ||
      normalizar(p.interessado).includes(q) ||
      normalizar(p.municipio).includes(q) ||
      normalizar(p.objeto).includes(q) ||
      normalizar(p.obs).includes(q) ||
      normalizar(p.anotacao).includes(q) ||
      normalizar(p.prefixo).includes(q)
    );
  }`,
    `  if (busca) {
    const q = normalizar(busca);
    lista = lista.filter(p =>
      normalizar(p.numero).includes(q) ||
      normalizar(p.interessado).includes(q) ||
      normalizar(p.municipio).includes(q) ||
      normalizar(p.objeto).includes(q) ||
      normalizar(p.obs).includes(q) ||
      normalizar(p.anotacao).includes(q) ||
      normalizar(p.prefixo).includes(q) ||
      normalizar(p.status).includes(q) ||
      normalizar(p.localizacao).includes(q)
    );
  }`
  );

  // 3. Fix preencherSelectFiltro to keep placeholders intact (Status, Localização, etc.)
  js = js.replace(
    `function preencherSelectFiltro(id, opcoes) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const atual = sel.value;
  sel.innerHTML = \`<option value="">Todos</option>\` + opcoes.map(o => \`<option value="\${o}" \${o === atual ? 'selected' : ''}>\${o}</option>\`).join('');
}`,
    `function preencherSelectFiltro(id, opcoes) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const atual = sel.value;
  let placeholder = 'Todos';
  if (id === 'filtro-status') placeholder = 'Status';
  else if (id === 'filtro-localizacao') placeholder = 'Localização';
  else if (id === 'filtro-municipio') placeholder = 'Município';
  else if (id === 'filtro-objeto') placeholder = 'Objeto';

  sel.innerHTML = \`<option value="">\${placeholder}</option>\` + opcoes.map(o => \`<option value="\${o}" \${o === atual ? 'selected' : ''}>\${o}</option>\`).join('');
}`
  );

  // 4. Fill filter selects dynamically inside renderProcessos()
  js = js.replace(
    `  // Preencher filtros dinâmicos
  preencherSelectFiltro('filtro-municipio', [...new Set(carregarProcessos().map(p => p.municipio).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-objeto',    [...new Set(carregarProcessos().map(p => p.objeto).filter(Boolean))].sort());`,
    `  // Preencher filtros dinâmicos
  preencherSelectFiltro('filtro-status',      [...new Set(carregarProcessos().map(p => p.status).filter(s => s && s !== '.'))].sort());
  preencherSelectFiltro('filtro-localizacao', [...new Set(carregarProcessos().map(p => p.localizacao).filter(l => l && l !== '.'))].sort());
  preencherSelectFiltro('filtro-municipio',   [...new Set(carregarProcessos().map(p => p.municipio).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-objeto',      [...new Set(carregarProcessos().map(p => p.objeto).filter(Boolean))].sort());`
  );

  fs.writeFileSync(filePath, js, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', js, 'utf8');
  console.log('app.js updated successfully');
}

applyDropdownAndSearchFixes();
