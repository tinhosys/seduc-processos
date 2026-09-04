const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/placeholder="D[^"]+GITO"/g, 'placeholder="DÍGITO"');
fs.writeFileSync('index.html', html, 'utf8');
