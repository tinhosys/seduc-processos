const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v1\.1\.03/g, 'v1.1.04');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Version bumped to v1.1.04');
