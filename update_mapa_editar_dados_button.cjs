const fs = require('fs');
const path = require('path');

// 1. Update js/mapa.js
const mapaPath = path.join(__dirname, 'js', 'mapa.js');
let mapaCode = fs.readFileSync(mapaPath, 'utf8');

mapaCode = mapaCode.replace(
  /onclick="if\(typeof abrirModalEditarEscolaById==='function'\) abrirModalEditarEscolaById\('(.*?)'\)"/g,
  `onclick="if(typeof abrirFormEscolaById==='function'){ abrirFormEscolaById('$1'); } else if(typeof abrirModalEditarEscolaById==='function'){ abrirModalEditarEscolaById('$1'); }"`
);

fs.writeFileSync(mapaPath, mapaCode, 'utf8');
console.log('js/mapa.js updated so Editar Dados opens full page form.');

// 2. Update js/escolas.js to alias abrirModalEditarEscolaById -> abrirFormEscolaById
const escolasPath = path.join(__dirname, 'js', 'escolas.js');
let escolasCode = fs.readFileSync(escolasPath, 'utf8');

if (!escolasCode.includes('window.abrirModalEditarEscolaById = abrirFormEscolaById')) {
  escolasCode += '\nwindow.abrirModalEditarEscolaById = abrirFormEscolaById;\n';
  fs.writeFileSync(escolasPath, escolasCode, 'utf8');
  console.log('js/escolas.js updated with alias abrirModalEditarEscolaById -> abrirFormEscolaById.');
}
