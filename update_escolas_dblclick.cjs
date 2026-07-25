const fs = require('fs');
const path = require('path');

const escolasPath = path.join(__dirname, 'js', 'escolas.js');
let code = fs.readFileSync(escolasPath, 'utf8');

if (!code.includes('ondblclick=')) {
  code = code.replace(
    `onclick="abrirModalEscola(' + gi + ')"`,
    `onclick="abrirModalEscola(' + gi + ')" ondblclick="abrirModalEditarEscola(' + gi + ')" title="Clique para ver detalhes | Duplo clique para editar"`
  );
  fs.writeFileSync(escolasPath, code, 'utf8');
  console.log('js/escolas.js updated with ondblclick handler.');
} else {
  console.log('ondblclick already added.');
}
