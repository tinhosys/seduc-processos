const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /<td style="padding: 10px 16px; color: #94a3b8;">\$\{p\.despesa\}<\/td>/g;
const replacement = `<td style="padding: 10px 16px; color: #94a3b8; font-size: 11px;">\${p.despesa} \${NATUREZA_DESCRICAO[p.despesa]?.nome ? '- ' + NATUREZA_DESCRICAO[p.despesa].nome : ''}</td>`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Patched orcamento.js naturezas');
