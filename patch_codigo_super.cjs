const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js/escolas.js');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    competencia: 'Estadual',
    super: val(1),`;

const newCode = `    competencia: 'Estadual',
    codigoSuper: 'Estadual',
    super: val(1),`;

let newContent = content.replace(oldCode, newCode);

const oldCode2 = `               competencia: 'Municipal',
               municipio: parsed.municipio || batchMuns[i],`;

const newCode2 = `               competencia: 'Municipal',
               codigoSuper: 'Municipal',
               municipio: parsed.municipio || batchMuns[i],`;

newContent = newContent.replace(oldCode2, newCode2);

if (newContent !== content) {
  fs.writeFileSync(file, newContent, 'utf8');
  console.log("escolas.js patched successfully with codigoSuper.");
} else {
  console.log("Could not find the target strings.");
}
