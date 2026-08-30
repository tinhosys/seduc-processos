const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Remove the one inside modelo === 8
content = content.replace(/const totalPagesExp = '\{total_pages_count_string\}';\n\s*doc\.autoTable\(\{/g, "doc.autoTable({");

// Add it to the top of gerarRelatorioOrcamento
const regexFunc = /window\.gerarRelatorioOrcamento = function\(modelo\) \{/;
const replacementFunc = `window.gerarRelatorioOrcamento = function(modelo) {
    const totalPagesExp = '{total_pages_count_string}';`;

content = content.replace(regexFunc, replacementFunc);

fs.writeFileSync(file, content);
console.log('Patched totalPagesExp scope');
