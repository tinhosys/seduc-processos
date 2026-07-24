const fs = require('fs');
let app = fs.readFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', 'utf8').replace(/\r\n/g, '\n');

// The second getTypeBadge function (duplicate) is at byte 144379, ends at 146660.
// We also need to fix the orphaned getCategoryBadge body that got inserted into _escolasAtualizarUI.

// Step 1: Find the orphaned getCategoryBadge body inside _escolasAtualizarUI
// It starts after "_escolasRenderPaginacao();\n" and goes to before the second getTypeBadge
const orphanStart = app.indexOf('  _escolasRenderPaginacao();\n  if (!categoria) return');
console.log('orphanStart:', orphanStart);

if (orphanStart !== -1) {
  const idx4 = 144379; // second getTypeBadge
  const blockEnd = app.indexOf('\nfunction inserirDataHoje', idx4);
  console.log('blockEnd:', blockEnd);

  // Replace the orphan area with just the closing of _escolasAtualizarUI
  const toReplace = app.substring(orphanStart, blockEnd);
  const replacement = '  _escolasRenderPaginacao();\n}';
  app = app.replace(toReplace, replacement);

  fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', app, 'utf8');
  fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\planilha-google-form\\public\\js\\app.js', app, 'utf8');
  console.log('Fixed orphaned duplicate functions');
} else {
  console.log('Orphan not found');
}
