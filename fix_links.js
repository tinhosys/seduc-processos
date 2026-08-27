const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix 'mapa' -> 'mapa-escolas'
html = html.replace(/data-page="mapa" onclick="navegar\('mapa'\)"/g, 'data-page="mapa-escolas" onclick="navegar(\'mapa-escolas\')"');

// Fix 'municipios' -> 'contatos'
html = html.replace(/data-page="municipios" onclick="navegar\('municipios'\)"><span>Municípios<\/span>/g, 'data-page="contatos" onclick="navegar(\'contatos\')"><span>Contatos</span>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed navigation links');
