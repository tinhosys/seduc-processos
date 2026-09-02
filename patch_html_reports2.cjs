const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regexMonitoramento = /<button type="button" onclick="gerarRelatorioMonitoramento\(\)" class="btn"/;
content = content.replace(regexMonitoramento, '<button type="button" onclick="gerarRelatorioMonitoramento()" class="btn action-report"');

fs.writeFileSync('index.html', content);
console.log('patched monitoramento button');
