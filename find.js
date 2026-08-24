const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('page-contatos');
console.log(html.substring(idx + 1500, idx + 3500));
