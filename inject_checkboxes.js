const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

// 1. Modify imprimirPadrao
appJs = appJs.replace('window.imprimirPadrao = function() {', 'window.imprimirPadrao = function(processosToPrint) {');
appJs = appJs.replace('const filtrados = getFiltrados();', 'const filtrados = processosToPrint || getFiltrados();');

// 2. Add imprimirPadraoSelecionado and toggleAllProcessos
const customFunctions = `
window.imprimirPadraoSelecionado = function() {
    const idsSelecionados = Array.from(document.querySelectorAll('.check-processo:checked')).map(cb => cb.value);
    if (idsSelecionados.length === 0) {
        alert('Nenhum processo selecionado.');
        return;
    }
    const filtrados = getFiltrados().filter(p => idsSelecionados.includes(p.id));
    imprimirPadrao(filtrados);
};

window.toggleAllProcessos = function(el) {
    const checkboxes = document.querySelectorAll('.check-processo');
    checkboxes.forEach(cb => cb.checked = el.checked);
};
`;
if (!appJs.includes('imprimirPadraoSelecionado')) {
    appJs += '\n' + customFunctions;
}

// 3. Update table rendering to include checkbox
const tdHtml = '<td onclick="event.stopPropagation()" style="text-align: center;"><input type="checkbox" class="check-processo" value="${p.id}" style="cursor:pointer; transform: scale(1.2);"></td>\n      <td class="col-prefixo"';
appJs = appJs.replace('<td class="col-prefixo"', tdHtml);

// Let's make sure the number of columns matched in colspan in the empty message
appJs = appJs.replace(/<td colspan="9">/g, '<td colspan="10">');
appJs = appJs.replace(/<td colspan="10">Nenhum processo encontrado.<\/td>/g, '<td colspan="11">Nenhum processo encontrado.</td>');

fs.writeFileSync('js/app.js', appJs);

let indexHtml = fs.readFileSync('index.html', 'utf8');
// Update index.html thead
const thHtml = '<th style="width: 40px; text-align: center;"><input type="checkbox" id="check-all-processos" onchange="toggleAllProcessos(this)" style="cursor:pointer; transform: scale(1.2);"></th>';
indexHtml = indexHtml.replace('<th data-sort="prefixo"', thHtml + '\n                <th data-sort="prefixo"');

// Update version in index.html (bump version)
let versionMatch = indexHtml.match(/v(\d+)\.(\d+)\.(\d+)/);
if (versionMatch) {
    let patch = parseInt(versionMatch[3]) + 1;
    let newVersion = 'v' + versionMatch[1] + '.' + versionMatch[2] + '.' + patch;
    indexHtml = indexHtml.replace(new RegExp(versionMatch[0].replace(/\./g, '\\\\.'), 'g'), newVersion);
    console.log('Bumped version to ' + newVersion);
}

fs.writeFileSync('index.html', indexHtml);
console.log('Injected successfully.');
