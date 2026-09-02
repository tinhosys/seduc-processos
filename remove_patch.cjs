const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

const regex = /\/\/ Corre[^]*?listaAcessos = listaAcessos\.map[^]*?return u;\s*\}\);/g;
js = js.replace(regex, '');

fs.writeFileSync('js/app.js', js);
console.log('removed patch');
