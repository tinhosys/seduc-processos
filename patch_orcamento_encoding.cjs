const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Use less strict regexes to fix encoding issues
content = content.replace(/RELAT.*RIO DE EXECU.*O OR.*AMENT.*RIA - SEDUC\/RO/, "RELATÓRIO DE EXECUÇÃO ORÇAMENTÁRIA - SEDUC/RO");
content = content.replace(/Relat.*rio com Status e Gr.*ficos/, "Relatório com Status e Gráficos");
content = content.replace(/Saldo L.*quido/g, "Saldo Líquido");
content = content.replace(/Saldo L.*q\./g, "Saldo Líq.");
content = content.replace(/Programa de A.*o/, "Programa de Ação");
content = content.replace(/Agrupado por Programa de A.*o/, "Agrupado por Programa de Ação");
content = content.replace(/Relat.*rio de Saldos Cr.*ticos \(Baixo Saldo ou Alta Execu.*o\)/, "Relatório de Saldos Críticos (Baixo Saldo ou Alta Execução)");

fs.writeFileSync(file, content);
console.log('Encoding fixed in orcamento.js');
