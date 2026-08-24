const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

// Add orcamento page title and navigate hook into navegar()
// Find the titles object and add orcamento
js = js.replace(
  `'todas-escolas': '?? Todas as Escolas'`,
  `'todas-escolas': '?? Todas as Escolas',\n    'orcamento': 'Controle Orçamentário'`
);

// Add the page callback after "if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();"
js = js.replace(
  `if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();\n}`,
  `if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();
  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();
}`
);

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('app.js updated with orcamento navegar hook');
