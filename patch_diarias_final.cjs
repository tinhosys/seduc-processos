const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const p1_start = content.indexOf('window.carregarDiariasData =');
const p1_end = content.indexOf('window.limparFiltrosDiarias =');
const part1 = content.substring(0, p1_start);

const p2_start = content.indexOf('function renderizarDiarias() {');
const p2_end = content.indexOf('window.verificarSaldoDiaria =');
const part2 = content.substring(p1_end, p2_start);
const part3 = content.substring(p2_end);

const replacement = fs.readFileSync('replacement.txt', 'utf8');

// replacement has everything we need: carregarDiariasData, popularSelectsDiarias, renderizarDiarias, renderConsolidadoDiarias.
// We can just put all of them at p1_start, and put part2 and part3 after them!

let finalContent = part1 + replacement + '\n\n' + part2 + part3;

fs.writeFileSync(file, finalContent);
console.log('Patched correctly this time.');
