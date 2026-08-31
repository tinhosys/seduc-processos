const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const start = content.indexOf('window.carregarDiariasData =');
const end = content.indexOf('window.limparFiltrosDiarias =');

const replacement = fs.readFileSync('replacement.txt', 'utf8');

content = content.substring(0, start) + replacement + content.substring(end);
fs.writeFileSync(file, content);
console.log('Patched final diarias.js');
