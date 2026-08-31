const fs = require('fs');

const content = fs.readFileSync('js/mapa.js', 'utf8');

// The best way to debug is to just patch index.html to dump missing schools
console.log('Use client side dump to inspect actual fetched data');
