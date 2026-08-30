const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/ORCAMENTO_DATA\.push\(\{/, `if (!cols[0]) return;\n      ORCAMENTO_DATA.push({`);

fs.writeFileSync(file, content);
console.log('Patched ORCAMENTO_DATA parser');
