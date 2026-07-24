const fs = require('fs');
let app = fs.readFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', 'utf8').replace(/\r\n/g, '\n');

// The escolas module appears twice:
// First occurrence at 137628 (valid)
// Second occurrence at 142967 (duplicate, must be removed)
// The duplicate runs to the end of the file

const moduleHeader = '// ============================================================\n// MÓDULO: ESCOLAS (ADM ONLY)\n// ============================================================';
const idx1 = app.indexOf(moduleHeader);
const idx2 = app.indexOf(moduleHeader, idx1 + 1);
console.log('idx1:', idx1, 'idx2:', idx2);

if (idx2 !== -1) {
  // The separator before the second module: find "\nwindow.inserirDataHoje = inserirDataHoje;\n\n\n" before idx2
  const separatorBefore = app.lastIndexOf('window.inserirDataHoje = inserirDataHoje;', idx2);
  console.log('separatorBefore:', separatorBefore);

  const cutPoint = separatorBefore + 'window.inserirDataHoje = inserirDataHoje;'.length;
  console.log('cutPoint:', cutPoint);

  // Keep everything before cutPoint, discard the rest (the second module)
  const fixed = app.substring(0, cutPoint) + '\n';
  console.log('Fixed length:', fixed.length, 'vs original:', app.length);
  
  fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', fixed, 'utf8');
  fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\planilha-google-form\\public\\js\\app.js', fixed, 'utf8');
  console.log('Done');
}
