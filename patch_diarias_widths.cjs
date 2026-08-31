const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const oldHeader = `<th>Data</th>
              <th>Beneficiário</th>
              <th>Motivo</th>
              <th>Valor</th>`;

const newHeader = `<th style="width: 10%;">Data</th>
              <th style="width: 25%;">Beneficiário</th>
              <th style="width: 50%;">Motivo</th>
              <th style="width: 15%; text-align: right;">Valor</th>`;

content = content.replace(/<th>Data<\/th>\s*<th>Benefici.rio<\/th>\s*<th>Motivo<\/th>\s*<th>Valor<\/th>/g, newHeader);

fs.writeFileSync(file, content);
console.log('Patched index.html diarias widths');
