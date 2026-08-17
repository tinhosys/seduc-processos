const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js/escolas.js');
let content = fs.readFileSync(file, 'utf8');

const oldCodeEst = `    municipio: val(2),
    inep: val(3),`;

const newCodeEst = `    municipio: val(2),
    codigoInep: val(3),`;

let newContent = content.replace(oldCodeEst, newCodeEst);

const oldCodeMun = `    modalidadeStr: val(3),
    inep: val(4),`;

const newCodeMun = `    modalidadeStr: val(3),
    codigoInep: val(4),`;

newContent = newContent.replace(oldCodeMun, newCodeMun);

const oldCodeMun2 = `               nome: parsed.nome,
               inep: parsed.inep,`;

const newCodeMun2 = `               nome: parsed.nome,
               codigoInep: parsed.codigoInep,`;

newContent = newContent.replace(oldCodeMun2, newCodeMun2);

const oldCodeMun3 = `          const key = (parsed.inep && parsed.inep.length > 3) ? parsed.inep.trim() : parsed.nome.trim().toUpperCase();`;
const newCodeMun3 = `          const key = (parsed.codigoInep && parsed.codigoInep.length > 3) ? parsed.codigoInep.trim() : parsed.nome.trim().toUpperCase();`;
newContent = newContent.replace(oldCodeMun3, newCodeMun3);

if (newContent !== content) {
  fs.writeFileSync(file, newContent, 'utf8');
  console.log("escolas.js patched successfully with codigoInep.");
} else {
  console.log("Could not find the target strings.");
}
