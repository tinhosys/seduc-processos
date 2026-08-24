const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/typeof window.listaAcessos !== 'undefined' && Array.isArray\(window.listaAcessos\)/g, "typeof listaAcessos !== 'undefined' && Array.isArray(listaAcessos)");
html = html.replace(/const u = window.listaAcessos.find/g, "const u = listaAcessos.find");

// Version bump
html = html.replace(/v1\.0\.99/g, 'v1.1.00');

fs.writeFileSync('index.html', html, 'utf8');
