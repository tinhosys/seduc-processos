const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// The syntax error is at ['Saldo Líquido)],
// We need to restore it to ['Saldo Líquido', _fmtBRL(tLiquido)],
content = content.replace(/\['Saldo L.quido\)\],/g, "['Saldo Líquido', _fmtBRL(tLiquido)],");

fs.writeFileSync(file, content);
console.log('Fixed syntax error in orcamento.js');
