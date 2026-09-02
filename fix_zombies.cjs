const fs = require('fs');

// Fix app.js
let appJs = fs.readFileSync('js/app.js', 'utf8');
appJs = appJs.replace(/nǜo/g, 'não');
appJs = appJs.replace(/Atenǜo/g, 'Atenção');
appJs = appJs.replace(/divergǦncia/g, 'divergência');
appJs = appJs.replace(/divergǦncias/g, 'divergências');
appJs = appJs.replace(/estǭ/g, 'está');
appJs = appJs.replace(/ortogrǭficos/g, 'ortográficos');
appJs = appJs.replace(/espaamento/g, 'espaçamento');
appJs = appJs.replace(/Localizaǜo/g, 'Localização');
appJs = appJs.replace(/mudanas/g, 'mudanças');
appJs = appJs.replace(/correes/g, 'correções');
appJs = appJs.replace(/Concludo/g, 'Concluído');
fs.writeFileSync('js/app.js', appJs);

// Fix index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/sT\?/g, '✅');
html = html.replace(/Padronizaǜo/g, 'Padronização');
html = html.replace(/Localizaǜo/g, 'Localização');
html = html.replace(/cǸlulas/g, 'células');
html = html.replace(/parǽmetros/g, 'parâmetros');
html = html.replace(/Y"\?/g, '🔍');
html = html.replace(/incio/g, 'início');
html = html.replace(/Ocultar Formulário/g, 'Ocultar Formulário'); // Wait, the button "Ocultar" zombie
html = html.replace(/\? Ocultar/g, 'Ocultar');
html = html.replace(/\?\? Ocultar/g, 'Ocultar');
fs.writeFileSync('index.html', html);

console.log('fixed zombies');
