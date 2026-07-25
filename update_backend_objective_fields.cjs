const fs = require('fs');
const path = require('path');

// 1. Update planilha-google-form/server.js mapDataToRow
const serverPath = path.join(__dirname, 'planilha-google-form', 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf8');

const mapDataToRowTarget = "else if ((hLow === 'marca' || hLow === 'marcado') && data.marca !== undefined) val = data.marca;";
const mapDataToRowExtra = `
    else if (hLow.includes('qtde sala') || hLow.includes('qtd sala')) val = data.qtdeSala;
    else if (hLow.includes('tipo sala')) val = data.tipoSala;
    else if (hLow.includes('tipo auditorio') || hLow.includes('tipo auditório')) val = data.tipoAuditorio;
    else if (hLow.includes('audatorio') || hLow.includes('auditório') || hLow.includes('auditorio')) val = data.auditorio;
    else if (hLow.includes('quadra')) val = data.quadra;
    else if (hLow.includes('patio') || hLow.includes('pátio')) val = data.patio;
    else if (hLow.includes('refeitorio') || hLow.includes('refeitório')) val = data.refeitorio;
    else if (hLow.includes('banheiro')) val = data.banheiros;
    else if (hLow.includes('demais observa') || hLow.includes('demais obs')) val = data.demaisObservacoes;
`;

if (!serverCode.includes("val = data.qtdeSala;")) {
  serverCode = serverCode.replace(mapDataToRowTarget, mapDataToRowTarget + mapDataToRowExtra);
  fs.writeFileSync(serverPath, serverCode, 'utf8');
  console.log('server.js updated with objective fields in mapDataToRow.');
}

// 2. Update js/dados.js mapToApp and mapToSheet
const dadosPath = path.join(__dirname, 'js', 'dados.js');
let dadosCode = fs.readFileSync(dadosPath, 'utf8');

if (!dadosCode.includes("qtdeSala:")) {
  dadosCode = dadosCode.replace(
    "alerta: String(alertaStr || '').trim(),",
    `qtdeSala: row['QTDE SALA'] || row['Qtde Sala'] || row['qtdeSala'] || '',
    tipoSala: row['TIPO SALA'] || row['Tipo Sala'] || row['tipoSala'] || '',
    auditorio: row['AUDITORIO'] || row['Auditorio'] || row['auditorio'] || '',
    tipoAuditorio: row['TIPO AUDITORIO'] || row['Tipo Auditorio'] || row['tipoAuditorio'] || '',
    quadra: row['QUADRA'] || row['Quadra'] || row['quadra'] || '',
    patio: row['PATIO'] || row['Patio'] || row['patio'] || '',
    refeitorio: row['REFEITORIO'] || row['Refeitorio'] || row['refeitorio'] || '',
    banheiros: row['BANHEIROS'] || row['Banheiros'] || row['banheiros'] || '',
    demaisObservacoes: row['DEMAIS OBSERVAÇÕES'] || row['DEMAIS OBSERVACOES'] || row['Demais Observações'] || row['demaisObservacoes'] || '',
    alerta: String(alertaStr || '').trim(),`
  );

  dadosCode = dadosCode.replace(
    "'DATA/HORA EDICAO': dados.dataHoraEdicao || ''",
    `'DATA/HORA EDICAO': dados.dataHoraEdicao || '',
    'QTDE SALA': dados.qtdeSala || '',
    'TIPO SALA': dados.tipoSala || '',
    'AUDITORIO': dados.auditorio || '',
    'TIPO AUDITORIO': dados.tipoAuditorio || '',
    'QUADRA': dados.quadra || '',
    'PATIO': dados.patio || '',
    'REFEITORIO': dados.refeitorio || '',
    'BANHEIROS': dados.banheiros || '',
    'DEMAIS OBSERVAÇÕES': dados.demaisObservacoes || ''`
  );

  fs.writeFileSync(dadosPath, dadosCode, 'utf8');
  console.log('js/dados.js updated with objective fields.');
}
