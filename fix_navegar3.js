const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

// The file uses CRLF. The exact pattern needs to account for \r\n
const oldText = "  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();\r\n}";
const newText = "  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();\r\n  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();\r\n}";

if (js.includes(oldText)) {
  js = js.replace(oldText, newText);
  console.log('CRLF match found and replaced');
} else {
  // Try LF only
  const oldLF = "  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();\n}";
  const newLF = "  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();\n  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();\n}";
  if (js.includes(oldLF)) {
    js = js.replace(oldLF, newLF);
    console.log('LF match found and replaced');
  } else {
    // Manual index approach
    const idx = js.indexOf("iniciarPaginaTodasEscolas();\r\n}");
    if (idx !== -1) {
      const insertAt = idx + "iniciarPaginaTodasEscolas();\r\n".length;
      js = js.substring(0, insertAt) + "  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();\r\n" + js.substring(insertAt);
      console.log('Index-based insertion succeeded');
    } else {
      const idx2 = js.indexOf("iniciarPaginaTodasEscolas();\n}");
      if (idx2 !== -1) {
        const insertAt2 = idx2 + "iniciarPaginaTodasEscolas();\n".length;
        js = js.substring(0, insertAt2) + "  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();\n" + js.substring(insertAt2);
        console.log('LF index-based insertion succeeded');
      } else {
        console.log('Could not find insertion point');
      }
    }
  }
}

// Also add title
if (!js.includes("'orcamento': 'Controle")) {
  js = js.replace("'todas-escolas': '?? Todas as Escolas'", "'todas-escolas': '?? Todas as Escolas',\n    'orcamento': 'Controle Or\u00E7ament\u00E1rio'");
}

fs.writeFileSync('js/app.js', js, 'utf8');
const check = fs.readFileSync('js/app.js', 'utf8');
console.log('carregarOrcamento found:', check.includes('carregarOrcamento'));
