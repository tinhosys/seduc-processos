const fs = require('fs');
const content = fs.readFileSync('orig_diarias.js', 'utf8');
const p1 = content.indexOf('function renderizarDiarias');
const p2 = content.indexOf('window.limparFiltrosDiarias');
console.log('renderizarDiarias at:', p1);
console.log('limparFiltrosDiarias at:', p2);
