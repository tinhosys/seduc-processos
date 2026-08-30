const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/doc\.text\(`Saldo L.quido\)\}`, 190, 27\);/g, "doc.text(`Saldo Líquido: ${_fmtBRL(tLiquido)}`, 190, 27);");

// Are there any others?
// Program de A.*o -> "Programa de Ação"
// Original: grouped[r.pa] = { inicial: 0, executado: 0, saldo: 0 }; ?? No, title = "Resumo Geral por Programa de Ação" ?
// Let's just fix it.

fs.writeFileSync(file, content);
console.log('Fixed doc.text saldo liquido syntax in orcamento.js');
