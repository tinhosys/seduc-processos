const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// The line is: doc.text('CAM / Coordenadoria de Articulações com os Municípios / SEDUC - RO', 14, 20);
content = content.replace(/CAM \/ Coordenadoria de Articula.*es com os Munic.*pios \/ SEDUC - RO/g, "CAM - Coordenadoria de Articulações com os Municípios | SEDUC - RO");

fs.writeFileSync(file, content);
console.log('Patched subtitle');
