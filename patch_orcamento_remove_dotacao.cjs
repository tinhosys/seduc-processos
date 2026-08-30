const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Remove the 4 doc.text lines
content = content.replace(/doc\.text\(`Dotação Inicial.*?;\r?\n\s*doc\.text\(`Empenhado.*?;\r?\n\s*doc\.text\(`Executado.*?;\r?\n\s*doc\.text\(`Saldo Líquido.*?;\r?\n/g, "");
content = content.replace(/doc\.text\(`Dota..o Inicial.*?;\r?\n\s*doc\.text\(`Empenhado.*?;\r?\n\s*doc\.text\(`Executado.*?;\r?\n\s*doc\.text\(`Saldo L.quido.*?;\r?\n/g, ""); // fallback for bad encoding

fs.writeFileSync(file, content);
console.log('Removed Dotacao Inicial text lines');
