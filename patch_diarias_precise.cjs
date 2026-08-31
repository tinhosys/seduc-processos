const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove old window.carregarDiariasData and window.popularSelectsDiarias
const p1_start = content.indexOf('window.carregarDiariasData =');
const p1_end = content.indexOf('window.limparFiltrosDiarias =');
content = content.substring(0, p1_start) + content.substring(p1_end);

// 2. Remove old renderizarDiarias
const p2_start = content.indexOf('function renderizarDiarias() {');
const p2_end = content.indexOf('setTimeout(() =>', p2_start);
content = content.substring(0, p2_start) + content.substring(p2_end);

// 3. Prepend the new implementations to the top of the file (after imports if any)
// We'll just put it at the very top
const replacement = fs.readFileSync('replacement.txt', 'utf8');
content = replacement + '\n\n' + content;

fs.writeFileSync(file, content);
console.log('Patched with precise strategy!');
