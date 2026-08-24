const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('id="contatos-table"');
console.log(html.substring(idx + 500, idx + 2500));
