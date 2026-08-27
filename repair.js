const fs = require('fs');

// Read app.js
let appJs = fs.readFileSync('js/app.js', 'utf8');

// Fix imprimirPadrao (replace only the first one)
appJs = appJs.replace('window.imprimirPadrao = function() {\n      updatePrintDateTime();\n      updatePrintDateTime();\n      const filtrados = getFiltrados();', 'window.imprimirPadrao = function(filtrados = getFiltrados()) {\n      updatePrintDateTime();\n      updatePrintDateTime();');
appJs = appJs.replace('window.imprimirPadrao = function() {\r\n      updatePrintDateTime();\r\n      updatePrintDateTime();\r\n      const filtrados = getFiltrados();', 'window.imprimirPadrao = function(filtrados = getFiltrados()) {\r\n      updatePrintDateTime();\r\n      updatePrintDateTime();');

// Fix table rendering
const searchTableStr = `<td class="col-prefixo" title="${'`' + '${p.prefixo}' + '`'}">`;
const replaceTableStr = `<td onclick="event.stopPropagation()" style="text-align: center;"><input type="checkbox" class="check-processo" value="${'`' + '${p.id}' + '`'}" style="cursor:pointer; transform: scale(1.2);"></td>\n      <td class="col-prefixo" title="${'`' + '${p.prefixo}' + '`'}">`;
appJs = appJs.replace(searchTableStr, replaceTableStr);

// Fix colspans
appJs = appJs.replace(/<td colspan="9">/g, '<td colspan="10">');
appJs = appJs.replace(/<td colspan="10">\s*<div class="empty-state">/g, '<td colspan="11">\n      <div class="empty-state">');

// Append new functions
const customFunctions = `\n
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
};\n`;

if (!appJs.includes('imprimirPadraoSelecionado')) {
    appJs += customFunctions;
}

fs.writeFileSync('js/app.js', appJs, 'utf8');

// Now read index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

const logadosBtnMatch = indexHtml.match(/<button type="button" onclick="abrirLogados\(\)"[\s\S]*?<\/button>/);
const excelBtnMatch = indexHtml.match(/<button class="btn action-adm" onclick="exportarExcel\(\)"[\s\S]*?<\/button>/);

if (logadosBtnMatch && excelBtnMatch) {
    const logadosBtn = logadosBtnMatch[0];
    const excelBtn = excelBtnMatch[0];

    const padraoSelBtn = excelBtn.replace('exportarExcel()', 'imprimirPadraoSelecionado()')
                                 .replace(/#16a34a/g, '#475569')
                                 .replace(/#15803d/g, '#334155')
                                 .replace('Exportar para Excel', 'Imprimir Selecionados')
                                 .replace('EXCEL', 'PADRÃO SEL.')
                                 .replace(/<svg[^>]*>.*?<\/svg>/, "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><polyline points='6 9 6 2 18 2 18 9'/><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/><rect x='6' y='14' width='12' height='8'/></svg>");

    indexHtml = indexHtml.replace(logadosBtn, excelBtn);
    indexHtml = indexHtml.replace(excelBtn, padraoSelBtn);
}

const thHtml = '<th style="width: 40px; text-align: center;"><input type="checkbox" id="check-all-processos" onchange="toggleAllProcessos(this)" style="cursor:pointer; transform: scale(1.2);"></th>';
indexHtml = indexHtml.replace('<th data-sort="prefixo"', thHtml + '\n                <th data-sort="prefixo"');

// Fix the CSS issue where comboboxes turned into listboxes (if any). Actually, let's see if the layout was broken because of the colspan or <th> being added?
// No, the comboboxes are in a different place. The filter section.
// Did I mess up anything else in index.html?
// Wait, my previous script didn't touch filters. Why did they become listboxes?
// If the table rendering failed, maybe a script threw an error, so the initialization of some select2 or custom select didn't run?
// Yes! If `app.js` threw an error `processosToPrint is not defined`, it crashed `renderProcessos()`, which might have stopped subsequent initialization code!

// Version bump to v1.1.20 directly
indexHtml = indexHtml.replace(/v1\.1\.\d+/g, 'v1.1.20');
const now = Date.now();
indexHtml = indexHtml.replace(/app\.js\?v=\d+/, 'app.js?v=' + now);
indexHtml = indexHtml.replace(/escolas\.js\?v=\d+/, 'escolas.js?v=' + now);
indexHtml = indexHtml.replace(/style\.css\?v=\d+/, 'style.css?v=' + now);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('Fixed gracefully.');
