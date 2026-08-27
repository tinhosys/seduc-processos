const fs = require('fs');
let file = fs.readFileSync('js/escolas.js', 'utf8');

const regexMapToEscola = /localidade: val\(26\),/;
const replacement = `localidade: val(26),
    plusCode: [val(19), val(20), val(21), val(22), val(23), val(24), val(25), val(27), val(28), val(29), val(30)].find(v => v && v.includes('+') && v.length >= 8) || '',`;

file = file.replace(regexMapToEscola, replacement);
fs.writeFileSync('js/escolas.js', file, 'utf8');
console.log('Modified js/escolas.js to include plusCode');
