const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v1\.1\.09/g, 'v1.1.10');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Version bumped to v1.1.10');
