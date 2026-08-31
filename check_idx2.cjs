const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const i = html.indexOf('table-diarias');
console.log(html.substring(i, i + 500));
