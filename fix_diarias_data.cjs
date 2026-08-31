const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

// Fix Estadual mapping
content = content.replace(
  /const status = cols\[0\] \? cols\[0\]\.trim\(\) : '';\s+const processo = cols\[2\] \? cols\[2\]\.trim\(\) : '';\s+const dataInicio = cols\[3\] \? cols\[3\]\.trim\(\) : '';\s+const setor = cols\[5\] \? cols\[5\]\.trim\(\) : '';\s+const motivo = cols\[6\] \? cols\[6\]\.trim\(\)\.replace\(\/\\n\/g, ' '\) : '';\s+const valorStr = cols\[11\] \|\| '0';\s+const valor = parseFloat\(valorStr\.replace\(\/R\\\$\|\\s\/g, ''\)\.replace\(\/\\.\/g, ''\)\.replace\(',', '\.'\)\) \|\| 0;\s+const mes = cols\[13\] \? cols\[13\]\.trim\(\) : '';\s+DIARIAS_DATA\.push\(\{ origem: 'estadual', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor \}\);/g,
  `const status = cols[12] ? cols[12].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const dataInicio = cols[3] ? cols[3].trim() : '';
      const setor = cols[5] ? cols[5].trim() : '';
      const motivo = cols[6] ? cols[6].trim().replace(/\\n/g, ' ') : '';
      const valorStr = cols[11] || '0';
      const valor = parseFloat(valorStr.replace(/R\\$|\\s/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
      const mes = cols[13] ? cols[13].trim() : '';
      const nota = ''; // No NE in Estadual
      DIARIAS_DATA.push({ origem: 'estadual', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor, nota });`
);

// Fix Federal mapping
content = content.replace(
  /const status = cols\[0\] \? cols\[0\]\.trim\(\) : '';\s+const processo = cols\[2\] \? cols\[2\]\.trim\(\) : '';\s+const dataInicio = cols\[4\] \? cols\[4\]\.trim\(\) : '';\s+const setor = cols\[6\] \? cols\[6\]\.trim\(\) : '';\s+const motivo = cols\[7\] \? cols\[7\]\.trim\(\)\.replace\(\/\\n\/g, ' '\) : '';\s+const valorStr = cols\[10\] \|\| '0';\s+const valor = parseFloat\(valorStr\.replace\(\/R\\\$\|\\s\/g, ''\)\.replace\(\/\\.\/g, ''\)\.replace\(',', '\.'\)\) \|\| 0;\s+const mes = cols\[12\] \? cols\[12\]\.trim\(\) : '';\s+DIARIAS_DATA\.push\(\{ origem: 'federal', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor \}\);/g,
  `const status = cols[11] ? cols[11].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const nota = cols[3] ? cols[3].trim() : '';
      const dataInicio = cols[4] ? cols[4].trim() : '';
      const setor = cols[6] ? cols[6].trim() : '';
      const motivo = cols[7] ? cols[7].trim().replace(/\\n/g, ' ') : '';
      const valorStr = cols[10] || '0';
      const valor = parseFloat(valorStr.replace(/R\\$|\\s/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
      const mes = cols[12] ? cols[12].trim() : '';
      DIARIAS_DATA.push({ origem: 'federal', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor, nota });`
);

fs.writeFileSync('js/diarias.js', content);
console.log('Fixed data extraction!');
