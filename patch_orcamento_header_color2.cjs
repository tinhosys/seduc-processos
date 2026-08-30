const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// The string was garbled, we can find it by SEDUC - RO
content = content.replace(/doc\.text\("EXECU.*SEDUC - RO", 14, 15\);/, "doc.text('EXECUÇÃO ORÇAMENTÁRIA ' + anoRelativo + ' - CAM / Coordenadoria de Articulações com os Municípios / SEDUC - RO', 14, 15);");

fs.writeFileSync(file, content);
console.log('Fixed header charset');
