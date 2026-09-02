const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /<th style="padding:12px 16px; font-weight:600; color:var\(--text-secondary\); font-size:13px; width: 14%;">N.*?vel de Acesso<\/th>/;
const replacement = `<th style="padding:12px 16px; font-weight:600; color:var(--text-secondary); font-size:13px; width: 12%;">Nível de Acesso</th>\n                  <th style="padding:12px 16px; font-weight:600; color:var(--text-secondary); font-size:13px; width: 12%;">Setor</th>`;

// Wait, widths add up to 100? Let's not worry too much about width percentage.
content = content.replace(regex, replacement);
fs.writeFileSync('index.html', content);
console.log('patched table header 2');
