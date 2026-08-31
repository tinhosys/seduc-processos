const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');
let start = content.indexOf('window.inserirDiaria');
let end = content.indexOf('window.gerarRelatorioDiarias', start);
console.log(content.substring(start, end));
