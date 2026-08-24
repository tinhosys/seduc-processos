const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Bust cache on orcamento.js
const ts = Date.now();
html = html.replace(/src="js\/orcamento\.js"/, `src="js/orcamento.js?v=${ts}"`);
html = html.replace(/src="js\/app\.js(\?v=[^"]+)?"/, `src="js/app.js?v=${ts}"`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Cache busted');
