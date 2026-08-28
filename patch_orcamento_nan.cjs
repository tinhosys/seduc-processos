const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Replace the parsing block inside carregarOrcamentoData
const oldParse = `ORCAMENTO_DATA.push({
        pa: cols[0],
        fonte: cols[1],
        despesa: cols[2],
        detalhamento: cols[4],
        inicial: parseMon(cols[5]),
        empenhado: parseMon(cols[7]),
        executado: parseMon(cols[9]),
        saldoLiquido: parseMon(cols[12])
      });`;
const newParse = `ORCAMENTO_DATA.push({
        pa: cols[0],
        fonte: cols[1],
        despesa: cols[2],
        detalhamento: cols[4],
        inicial: parseMon(cols[5]),
        empenhado: parseMon(cols[7]),
        anulacao: parseMon(cols[8]),
        executado: parseMon(cols[9]),
        saldoExistente: parseMon(cols[10]),
        reserva: parseMon(cols[11]),
        saldoLiquido: parseMon(cols[12])
      });`;

content = content.replace(oldParse, newParse);
fs.writeFileSync(file, content);
console.log('orcamento.js NaN fixed');
