const fs = require('fs');
const path = require('path');

// 1. Update planilha-google-form/server.js
const serverPath = path.join(__dirname, 'planilha-google-form', 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf8');

const targetServerStr = "else if (hLow.includes('demais observa') || hLow.includes('demais obs')) val = data.demaisObservacoes;";
const extraServerStr = `\n    else if (hLow.includes('oficio') || hLow.includes('ofício')) val = data.oficioNumero;
    else if (hLow.includes('metragem') || hLow.includes('m2') || hLow.includes('m²')) val = data.metragemM2;
    else if (hLow.includes('detalhamento') || hLow.includes('itens pedido')) val = data.detalhamentoItens;`;

if (!serverCode.includes('val = data.oficioNumero;')) {
  serverCode = serverCode.replace(targetServerStr, targetServerStr + extraServerStr);
  fs.writeFileSync(serverPath, serverCode, 'utf8');
  console.log('server.js updated with oficioNumero, metragemM2, detalhamentoItens.');
}

// 2. Update js/dados.js
const dadosPath = path.join(__dirname, 'js', 'dados.js');
let dadosCode = fs.readFileSync(dadosPath, 'utf8');

if (!dadosCode.includes('oficioNumero:')) {
  dadosCode = dadosCode.replace(
    "demaisObservacoes: row['DEMAIS OBSERVAÇÕES'] || row['DEMAIS OBSERVACOES'] || row['Demais Observações'] || row['demaisObservacoes'] || '',",
    `demaisObservacoes: row['DEMAIS OBSERVAÇÕES'] || row['DEMAIS OBSERVACOES'] || row['Demais Observações'] || row['demaisObservacoes'] || '',
    oficioNumero: row['OFICIO'] || row['Ofício'] || row['Oficio'] || row['Nº OFÍCIO'] || row['oficioNumero'] || '',
    metragemM2: row['METRAGEM (M²)'] || row['Metragem (m²)'] || row['METRAGEM'] || row['metragemM2'] || '',
    detalhamentoItens: row['DETALHAMENTO ITENS'] || row['Detalhamento Itens'] || row['detalhamentoItens'] || '',`
  );

  dadosCode = dadosCode.replace(
    "'DEMAIS OBSERVAÇÕES': dados.demaisObservacoes || ''",
    `'DEMAIS OBSERVAÇÕES': dados.demaisObservacoes || '',
    'OFICIO': dados.oficioNumero || '',
    'METRAGEM (M²)': dados.metragemM2 || '',
    'DETALHAMENTO ITENS': dados.detalhamentoItens || ''`
  );

  fs.writeFileSync(dadosPath, dadosCode, 'utf8');
  console.log('js/dados.js updated with new TCE-RO fields.');
}
