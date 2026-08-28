const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /const valor = parseFloat\(valorStr\.replace\(\/R\\\\\$\|\\\\s\/g, ''\)\.replace\(\/\\\\.\/g, ''\)\.replace\(',', '\.'\)\) \|\| 0;[\s\S]*?DIARIAS_DATA\.push\(\{[\s\S]*?valor: valor\s*\}\);/m;

const replacement = `const valor = parseFloat(valorStr.replace(/R\\$|\\s/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
      const mes = cols[13] ? cols[13].trim() : '';
      
      DIARIAS_DATA.push({
        status: status,
        processo: processo,
        data: dataInicio,
        nome: setor,
        motivo: motivo,
        valor: valor,
        mes: mes,
        setorOriginal: setor // to populate select
      });`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Parser patched');
