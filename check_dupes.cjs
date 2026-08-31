const fs = require('fs');
const content = fs.readFileSync('js/diarias.js', 'utf8');
const p1 = content.indexOf('function renderizarDiarias() {');
const p2 = content.indexOf('function renderizarDiarias() {', p1 + 10);
console.log(content.substring(p1 + 2000, p1 + 2500));
console.log('---');
console.log(content.substring(p2, p2 + 200));
