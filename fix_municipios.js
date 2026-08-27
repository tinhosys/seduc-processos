const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The link currently looks like:
// <a href="#" class="nav-item sub-item" data-page="municipios" onclick="navegar('municipios')" style="font-size: 13px; padding: 10px 16px;"><span>Municpios</span></a>
// We just want to change data-page="municipios" to "contatos" and navegar('municipios') to navegar('contatos')

html = html.replace(/data-page="municipios"/g, 'data-page="contatos"');
html = html.replace(/onclick="navegar\('municipios'\)"/g, 'onclick="navegar(\'contatos\')"');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed link to contatos');
