const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const replacement = `function _pctEmp(empenhado, executado) {
    if (!empenhado || empenhado <= 0) return executado > 0 ? 100 : 0;
    return Math.min(Math.round((executado / empenhado) * 100), 100);
}

function _pctExec(inicial, executado) {`;

content = content.replace(/function _pctExec\(inicial, executado\) \{/, replacement);

fs.writeFileSync(file, content);
console.log('Patched _pctEmp missing definition');
