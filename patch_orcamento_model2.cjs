const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Update Model 2
const regexModel2 = /_naturezaNome\(r\.despesa\),\s*r\.detalhamento \? r\.detalhamento\.substring\(0, 25\) : '',/g;

const replacementModel2 = `(r.despesa && r.despesa.length === 6 ? r.despesa.substring(0,2)+'.'+r.despesa.substring(2,4)+'.'+r.despesa.substring(4,6)+' - ' : '') + _naturezaNome(r.despesa), r.detalhamento || '',`;

content = content.replace(regexModel2, replacementModel2);

fs.writeFileSync(file, content);
console.log('Patched Model 2 natureza and detalhe');
