const fs = require('fs');
let code = fs.readFileSync('planilha-google-form/server.js', 'utf8');

code = code.replace(/range: contatos!A:Z \}\);/g, 'range: "contatos!A:Z" });');
code = code.replace(/range = contatos!A:;/g, 'range = "contatos!A" + rowNumber + ":";');
code = code.replace(/range = "contatos!A" \+ rowNumber \+ ":";/, 'range = "contatos!A" + rowNumber + ":Z" + rowNumber;');

fs.writeFileSync('planilha-google-form/server.js', code);
console.log('fixed syntax');
