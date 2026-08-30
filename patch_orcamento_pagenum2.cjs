const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regexPageText = /const pageText = "[^"]+" \+ data\.pageNumber;/;
const replacementPageText = `const pageText = "Página " + data.pageNumber + "/" + totalPagesExp;`;
content = content.replace(regexPageText, replacementPageText);

fs.writeFileSync(file, content);
console.log('Patched page numbers 2');
