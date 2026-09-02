const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

js = js.replace(/window\.getCategoryBadge = function\(categoria\)/, 'function getCategoryBadge(categoria)');
js = js.replace(/window\.getTypeBadge = function\(tipo\)/, 'function getTypeBadge(tipo)');

fs.writeFileSync('js/app.js', js);
console.log('fixed badges func');
