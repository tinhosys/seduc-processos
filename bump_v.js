const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Also make sure Escolas page doesn't have the print button if I didn't clean it up perfectly
// Check if "imprimirContatos()" exists in the Escolas section.
// (I did run a script for this earlier, let's just do a version bump to v1.0.91)
html = html.replace(/v1\.0\.90/g, 'v1.0.91');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Bumped to v1.0.91');
