const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix data-page for all nav items so they highlight properly
html = html.replace(/onclick="navegar\('dashboard'\); fecharSubmenus\(\)"/g, 'data-page="dashboard" onclick="navegar(\'dashboard\'); fecharSubmenus()"');
html = html.replace(/onclick="navegar\('orcamento'\); fecharSubmenus\(\)"/g, 'data-page="orcamento" onclick="navegar(\'orcamento\'); fecharSubmenus()"');

html = html.replace(/onclick="navegar\('processos'\)"/g, 'data-page="processos" onclick="navegar(\'processos\')"');
html = html.replace(/onclick="navegar\('proalfa'\)"/g, 'data-page="proalfa" onclick="navegar(\'proalfa\')"');
html = html.replace(/onclick="navegar\('repetidos'\)"/g, 'data-page="repetidos" onclick="navegar(\'repetidos\')"');
html = html.replace(/onclick="navegar\('escolas'\)"/g, 'data-page="escolas" onclick="navegar(\'escolas\')"');
html = html.replace(/onclick="navegar\('mapa'\)"/g, 'data-page="mapa" onclick="navegar(\'mapa\')"');
html = html.replace(/onclick="navegar\('municipios'\)"/g, 'data-page="municipios" onclick="navegar(\'municipios\')"');
html = html.replace(/onclick="navegar\('acessos'\)"/g, 'data-page="acessos" onclick="navegar(\'acessos\')"');
html = html.replace(/onclick="navegar\('senha'\)"/g, 'data-page="senha" onclick="navegar(\'senha\')"');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed data-page attributes');
