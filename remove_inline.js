const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<div id="page-proalfa" class="page" style="display: none;">', '<div id="page-proalfa" class="page">');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Removed inline display none');
