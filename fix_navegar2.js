const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

// The patch_navegar.js regex didn't match. Let's do it directly.
// Line 152: "  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();"
// We need to insert BEFORE the closing "}"
js = js.replace(
  `  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();\n}`,
  `  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();
  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();
}`
);

// Also add title for Orçamento in the titles object
js = js.replace(
  `'todas-escolas': '?? Todas as Escolas'`,
  `'todas-escolas': '?? Todas as Escolas',\n    'orcamento': 'Controle Or\u00E7ament\u00E1rio'`
);

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('app.js patched');

// Verify
const check = fs.readFileSync('js/app.js', 'utf8');
const found = check.includes("carregarOrcamento");
console.log('carregarOrcamento found in app.js:', found);
