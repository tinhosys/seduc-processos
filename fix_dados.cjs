const fs = require('fs');
let content = fs.readFileSync('js/dados.js', 'utf8');
content = content.replace(/(\/\/ Helper para incluir cabeça.*?\nfunction getHeaders.*?\}\n\n\n?)+/gs, '');
fs.writeFileSync('js/dados.js', content);
console.log('fixed dados.js duplicates');
