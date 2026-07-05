const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');

// Remove nav-item importar
index = index.replace(/<button class="nav-item" data-page="importar">[\s\S]*?<\/button>/, '');

// Remove button Importar in dashboard
index = index.replace(/<button class="btn btn-ghost btn-sm action-editor" onclick="navegar\('importar'\)">.*?Importar<\/button>/, '');

// Remove section importar
index = index.replace(/<!-- ============= PAGE: IMPORTAR ============= -->[\s\S]*?(?=<!-- ============= PAGE: NOVO PROCESSO ============= -->)/, '');

// Remove action-editor from PDF and Excel
index = index.replace(/class="btn btn-ghost btn-sm action-editor" onclick="exportarExcel\(\)"/g, 'class="btn btn-ghost btn-sm" onclick="exportarExcel()"');
index = index.replace(/class="btn btn-ghost btn-sm action-editor" onclick="abrirModalPdf\(\)"/g, 'class="btn btn-ghost btn-sm" onclick="abrirModalPdf()"');
index = index.replace(/class="btn btn-ghost btn-sm action-editor" onclick="window\.print\(\)"/g, 'class="btn btn-ghost btn-sm" onclick="window.print()"');

fs.writeFileSync('index.html', index, 'utf8');
console.log('UI cleaned');
