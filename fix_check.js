const fs = require('fs');
let app = fs.readFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', 'utf8').replace(/\r\n/g, '\n');

// The app.js has an entire second copy of the ESCOLAS module starting at the pattern:
// "window.inserirDataHoje = inserirDataHoje;\n\n\n// ============================================================\n// MÓDULO: ESCOLAS"
// We need to find the second occurrence of this module header and remove it to the end of the second module.

const moduleHeader = '// ============================================================\n// MÓDULO: ESCOLAS (ADM ONLY)\n// ============================================================';
const idx1 = app.indexOf(moduleHeader);
const idx2 = app.indexOf(moduleHeader, idx1 + 1);
console.log('Module header occurrences:', idx1, idx2);

if (idx2 !== -1) {
  // Find the end of the entire file content after idx2
  // The second module runs to the end of the file (or next non-escolas content)
  // Let's check what comes after the second module
  const afterModule2 = app.substring(idx2 + moduleHeader.length, idx2 + moduleHeader.length + 200);
  console.log('After second module:', afterModule2);
}
