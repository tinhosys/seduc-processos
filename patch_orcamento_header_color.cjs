const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Update header
const ano = new Date().getFullYear();
const regexHeader = /doc\.text\("RELATÓRIO DE EXECUÇÃO ORÇAMENTÁRIA - SEDUC\/RO", 14, 15\);/;
const replacementHeader = `const anoRelativo = new Date().getFullYear();
    doc.text("EXECUÇÃO ORÇAMENTÁRIA " + anoRelativo + " - CAM / Coordenadoria de Articulações com os Municípios / SEDUC - RO", 14, 15);`;
content = content.replace(regexHeader, replacementHeader);

// Update Total Row Color (black instead of red)
// In didParseCell, replace data.cell.styles.textColor = [220, 38, 38]; with [0, 0, 0]
// Keep the top line red, or maybe they just meant the text. "faça a soma em preto mesmo, negrito"
const regexColor = /data\.cell\.styles\.textColor = \[220, 38, 38\];/;
const replacementColor = `data.cell.styles.textColor = [0, 0, 0];`;
content = content.replace(regexColor, replacementColor);

fs.writeFileSync(file, content);
console.log('Patched header and total row color');
