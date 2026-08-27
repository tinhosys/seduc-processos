const fs = require('fs');
let file = fs.readFileSync('js/mapa.js', 'utf8');

// Replace standard _mapaNormalizarStr to remove hyphens and extra spaces
file = file.replace(
  /function _mapaNormalizarStr\(str\) {[\s\S]*?}/,
  `function _mapaNormalizarStr(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[\\u2018\\u2019\\u201A\\u201B\\u2032\\u0060]/g, "'")
    .replace(/-/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}`
);

fs.writeFileSync('js/mapa.js', file, 'utf8');
console.log('Fixed js/mapa.js');
