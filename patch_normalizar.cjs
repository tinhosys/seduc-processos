const fs = require('fs');
let content = fs.readFileSync('js/dados.js', 'utf8');

// Replace normalizarStatus logic
content = content.replace(/function normalizarStatus\(status\) \{[\s\S]*?return status;\s*\}/, `function normalizarStatus(status) {
  if (!status) return '.';
  const s = status.trim().toUpperCase();
  return (s === '' || s === '.') ? '.' : status.trim();
}`);

// Replace normalizarLocalizacao logic
content = content.replace(/function normalizarLocalizacao\(loc\) \{[\s\S]*?return loc;\s*\}/, `function normalizarLocalizacao(loc) {
  if (!loc) return '.';
  const l = loc.trim().toUpperCase();
  return (l === '' || l === '.') ? '.' : loc.trim();
}`);

fs.writeFileSync('js/dados.js', content);
console.log('patched normalizar functions to bypass rules');
