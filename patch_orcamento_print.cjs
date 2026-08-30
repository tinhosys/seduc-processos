const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Replace orientation
const regexOrientation = /const doc = new jsPDF\(modelo === 7 \|\| modelo === 2 \? 'landscape' : 'portrait'\);/;
content = content.replace(regexOrientation, "const doc = new jsPDF('landscape', 'mm', 'a4');");

// Replace doc.save for Model 8
const regexSave8 = /doc\.save\("Relatorio_Status_Graficos\.pdf"\);/g;
const replacementSave = `doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');`;
content = content.replace(regexSave8, replacementSave);

// Replace doc.save for others
const regexSaveOthers = /doc\.save\(`Relatorio_Orcamento_Mod\$\{modelo\}\.pdf`\);/g;
content = content.replace(regexSaveOthers, replacementSave);

// Fix messed up chars
content = content.replace(/RELAT"RIO DE EXECUǟO ORAMENT\?RIA - SEDUC\/RO/g, "RELATÓRIO DE EXECUÇÃO ORÇAMENTÁRIA - SEDUC/RO");
content = content.replace(/Relatrio com Status e Grǭficos/g, "Relatório com Status e Gráficos");
content = content.replace(/Saldo Lquido/g, "Saldo Líquido");
content = content.replace(/Saldo Lq\./g, "Saldo Líq.");
content = content.replace(/Programa de Aǜo/g, "Programa de Ação");
content = content.replace(/Relatrio de Saldos Crticos \(Baixo Saldo ou Alta Execuǜo\)/g, "Relatório de Saldos Críticos (Baixo Saldo ou Alta Execução)");

fs.writeFileSync(file, content);
console.log('jsPDF print logic patched in orcamento.js');
