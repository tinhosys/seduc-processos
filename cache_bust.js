const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Bust cache for app.js
html = html.replace(/src="js\/app\.js(\?v=[0-9]+)?"/g, `src="js/app.js?v=${Date.now()}"`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Cache busted for app.js');
