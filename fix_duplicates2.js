const fs = require('fs');
let app = fs.readFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', 'utf8').replace(/\r\n/g, '\n');

const m = [...app.matchAll(/function inserirDataHoje/g)];
const idx2 = m[1].index;

// Find end of the second inserirDataHoje block
const afterSecond = app.indexOf('\nwindow.inserirDataHoje', idx2);
const endSecond = app.indexOf('\n\n\n', afterSecond) + 3;

// Remove the duplicate block (the one after _escolasAtualizarUI)
const toRemove = app.substring(idx2 - 1, endSecond);
console.log('Removing:', toRemove.length, 'chars');

app = app.replace(toRemove, '\n');

fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', app, 'utf8');
fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\planilha-google-form\\public\\js\\app.js', app, 'utf8');
console.log('Removed duplicate inserirDataHoje');
