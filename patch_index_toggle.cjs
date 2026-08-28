const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// give the new button the id
content = content.replace('<button type="button" onclick="toggleFiltros()" title="Mostrar/Ocultar Parâmetros"', '<button id="btn-toggle-filtros" type="button" onclick="toggleFiltros()" title="Mostrar/Ocultar Parâmetros"');

// remove the old button
const oldBtnRegex = /<button type="button" id="btn-toggle-filtros" onclick="toggleFiltros\(\)"[\s\S]*?<\/button>/;
content = content.replace(oldBtnRegex, '');

fs.writeFileSync(file, content);
console.log('index.html toggle fixed');
