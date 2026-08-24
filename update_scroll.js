const fs = require('fs');

// 1. UPDATE index.html CSS
let html = fs.readFileSync('index.html', 'utf8');

const newCSS = `
    /* CSS for infinite scroll tables and sticky headers */
    .pagination { display: none !important; }
    .page .table-wrap {
      max-height: calc(100vh - 280px);
      overflow-y: auto !important;
      overflow-x: auto !important;
    }
    .page .table-wrap table thead th {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg-secondary); /* ensure header has background */
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .page .filters-bar.collapsed + .table-wrap {
      max-height: calc(100vh - 180px);
    }
`;

html = html.replace('</style>', newCSS + '\n</style>');

// Version bump
html = html.replace(/v1\.1\.00/g, 'v1.1.01');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html CSS updated');

// 2. UPDATE JS files to remove slice()
const jsFiles = ['js/app.js', 'js/app2.js', 'js/app_github.js', 'js/escolas.js'];

for (const file of jsFiles) {
  if (fs.existsSync(file)) {
    let js = fs.readFileSync(file, 'utf8');
    
    // app.js, app2.js, app_github.js
    js = js.replace(/const pagina = filtrados\.slice\(inicio, inicio \+ state\.itensPorPagina\);/g, 'const pagina = filtrados; // Pagination removed');
    
    // escolas.js
    js = js.replace(/const slice = _escolasFiltradas\.slice\(start, start \+ _escolasItensPorPagina\);/g, 'const slice = _escolasFiltradas; // Pagination removed');
    
    // Also TE processes in app.js / app_github.js (if any)
    js = js.replace(/const pag\s*=\s*_teFiltrados\.slice\(ini, fim\);/g, 'const pag = _teFiltrados; // Pagination removed');

    fs.writeFileSync(file, js, 'utf8');
    console.log(`${file} updated (slice removed)`);
  }
}
