const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Replace action-adm with action-report on specific buttons
content = content.replace(/<button class="btn action-adm" onclick="imprimirAnalise/g, '<button class="btn action-report" onclick="imprimirAnalise');
content = content.replace(/<button class="btn action-adm" onclick="imprimirDetalhado/g, '<button class="btn action-report" onclick="imprimirDetalhado');
content = content.replace(/<button class="btn action-adm" onclick="imprimirPadrao/g, '<button class="btn action-report" onclick="imprimirPadrao');
content = content.replace(/<button class="btn action-adm" onclick="imprimirPadraoSelecionado/g, '<button class="btn action-report" onclick="imprimirPadraoSelecionado');
content = content.replace(/<button class="btn action-adm" onclick="exportarExcel/g, '<button class="btn action-report" onclick="exportarExcel');
content = content.replace(/<button class="btn action-adm" onclick="if\(typeof window\.imprimirRelatorioEscolas/g, '<button class="btn action-report" onclick="if(typeof window.imprimirRelatorioEscolas');
content = content.replace(/<button class="btn action-adm" onclick="gerarRelatorioMonitoramento/g, '<button class="btn action-report" onclick="gerarRelatorioMonitoramento');

fs.writeFileSync('index.html', content);
console.log('patched report buttons');
