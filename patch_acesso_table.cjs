const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /<th style="padding:12px 16px; font-weight:700; color:var\(--text-muted\);">NVEL DE ACESSO<\/th>/;
content = content.replace(regex, `<th style="padding:12px 16px; font-weight:700; color:var(--text-muted);">NÍVEL DE ACESSO</th>\n                  <th style="padding:12px 16px; font-weight:700; color:var(--text-muted);">SETOR</th>`);

fs.writeFileSync('index.html', content);
console.log('patched table header');
