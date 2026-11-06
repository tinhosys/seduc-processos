process.env.NO_GCE_CHECK = 'true';
const fs = require('fs');
const path = require('path');
const { google } = require('C:/Users/ADM/Documents/GitHub/seduc-processos/planilha-google-form/node_modules/googleapis');
const xlsx = require('C:/Users/ADM/Documents/GitHub/seduc-processos/node_modules/xlsx');
const { OFFICIAL_MUNICIPIOS, normalizeMun } = require('./normalize_municipios.cjs');

const ROOT_DIR = 'C:/Users/ADM/Documents/GitHub/seduc-processos';

function parseCSV(content) {
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const rows = [];
  let curRow = [];
  let curVal = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (c === '"') {
      if (inQuotes && content[i+1] === '"') {
        curVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      curRow.push(curVal);
      curVal = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && content[i+1] === '\n') i++;
      curRow.push(curVal);
      rows.push(curRow);
      curRow = [];
      curVal = '';
    } else {
      curVal += c;
    }
  }
  if (curVal.length > 0 || curRow.length > 0) {
    curRow.push(curVal);
    rows.push(curRow);
  }
  return rows;
}

function serializeCSV(rows) {
  return rows.map(row => {
    return row.map(val => {
      if (val === null || val === undefined) val = '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',');
  }).join('\r\n') + '\r\n';
}

async function updateLocalCSVs() {
  console.log('\n--- 1. ATUALIZANDO PLANILHAS LOCAIS CSV ---');
  const csvFiles = [
    'planilha.csv',
    'sheet_todos.csv',
    'escolas.csv',
    'escolasEstaduais.csv',
    'estadual.csv',
    'ariquemes.csv',
    'contatos.csv',
    'contatos2.csv',
    'proalfa.csv'
  ];

  for (const f of csvFiles) {
    const p = path.join(ROOT_DIR, f);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    const rows = parseCSV(content);
    if (rows.length === 0) continue;

    let headerRow = 0;
    let munCol = -1;
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const idx = rows[r].findIndex(col => {
        const norm = col.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        return norm === 'municipio' || norm === 'municipio/distrito' || norm.startsWith('municipio');
      });
      if (idx !== -1) {
        headerRow = r;
        munCol = idx;
        break;
      }
    }

    if (munCol === -1) {
      console.log(`[CSV] ${f}: Coluna de município não encontrada.`);
      continue;
    }

    let modified = 0;
    for (let r = headerRow + 1; r < rows.length; r++) {
      const oldVal = (rows[r][munCol] || '').trim();
      if (!oldVal) continue;
      const newVal = normalizeMun(oldVal);
      if (newVal !== oldVal) {
        rows[r][munCol] = newVal;
        modified++;
      }
    }

    fs.writeFileSync(p, serializeCSV(rows), 'utf8');
    console.log(`[CSV OK] ${f}: ${modified} células de município padronizadas.`);
  }

  // sheets.txt
  const sheetsTxtPath = path.join(ROOT_DIR, 'sheets.txt');
  if (fs.existsSync(sheetsTxtPath)) {
    const raw = fs.readFileSync(sheetsTxtPath, 'utf8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
    const updatedLines = lines.map(l => {
      const trimmed = l.trim();
      const lower = trimmed.toLowerCase();
      if (lower === 'estadual' || lower === 'federal' || lower === 'contatos' || lower === 'entidades') {
        return trimmed;
      }
      return normalizeMun(trimmed);
    });
    fs.writeFileSync(sheetsTxtPath, updatedLines.join('\r\n') + '\r\n', 'utf8');
    console.log(`[TXT OK] sheets.txt padronizado com os 52 municípios.`);
  }
}

async function updateProalfaXLSX() {
  console.log('\n--- 2. ATUALIZANDO PROALFA.XLSX ---');
  const xlsxPath = path.join(ROOT_DIR, 'proalfa.xlsx');
  if (!fs.existsSync(xlsxPath)) return;

  const wb = xlsx.readFile(xlsxPath);
  let totalUpdated = 0;

  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (!data || data.length === 0) return;

    let headerRow = -1;
    let munCol = -1;
    for (let r = 0; r < Math.min(data.length, 5); r++) {
      const idx = data[r].findIndex(c => {
        const norm = String(c).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        return norm === 'municipio' || norm === 'municipio/distrito';
      });
      if (idx !== -1) {
        headerRow = r;
        munCol = idx;
        break;
      }
    }

    if (munCol !== -1) {
      let sheetUpdated = 0;
      for (let r = headerRow + 1; r < data.length; r++) {
        const oldVal = String(data[r][munCol] || '').trim();
        if (!oldVal) continue;
        const newVal = normalizeMun(oldVal);
        if (newVal !== oldVal) {
          data[r][munCol] = newVal;
          sheetUpdated++;
        }
      }
      wb.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(data);
      totalUpdated += sheetUpdated;
      console.log(`[XLSX] Aba "${sheetName}": ${sheetUpdated} células padronizadas.`);
    }
  });

  xlsx.writeFile(wb, xlsxPath);
  console.log(`[XLSX OK] proalfa.xlsx salvo com ${totalUpdated} alterações totais.`);
}

async function updateJSONFiles() {
  console.log('\n--- 3. ATUALIZANDO ARQUIVOS JSON ---');
  // proalfa.json
  const jsonPath = path.join(ROOT_DIR, 'proalfa.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let total = 0;
    for (const sheet of Object.keys(data)) {
      const rows = data[sheet];
      if (!Array.isArray(rows)) continue;
      let munCol = -1;
      let headerRow = -1;
      for (let r = 0; r < Math.min(rows.length, 5); r++) {
        if (!Array.isArray(rows[r])) continue;
        const idx = rows[r].findIndex(c => c && String(c).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() === 'municipio');
        if (idx !== -1) {
          headerRow = r;
          munCol = idx;
          break;
        }
      }
      if (munCol !== -1) {
        let count = 0;
        for (let r = headerRow + 1; r < rows.length; r++) {
          if (!Array.isArray(rows[r])) continue;
          const oldVal = (rows[r][munCol] || '').trim();
          if (!oldVal) continue;
          const newVal = normalizeMun(oldVal);
          if (newVal !== oldVal) {
            rows[r][munCol] = newVal;
            count++;
          }
        }
        total += count;
      }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[JSON OK] proalfa.json: ${total} registros atualizados.`);
  }

  // backend_test.json
  const backendPath = path.join(ROOT_DIR, 'backend_test.json');
  if (fs.existsSync(backendPath)) {
    const d = JSON.parse(fs.readFileSync(backendPath, 'utf8'));
    let bCount = 0;
    if (d && Array.isArray(d.rows)) {
      d.rows.forEach(r => {
        const oldV = (r['Município'] || '').trim();
        if (oldV) {
          const newV = normalizeMun(oldV);
          if (newV !== oldV) {
            r['Município'] = newV;
            bCount++;
          }
        }
      });
      fs.writeFileSync(backendPath, JSON.stringify(d, null, 2), 'utf8');
      console.log(`[JSON OK] backend_test.json: ${bCount} registros atualizados.`);
    }
  }

  // gviz json files
  ['porto_velho.json', 'estadual.json', 'estadual_sheet.json'].forEach(f => {
    const fp = path.join(ROOT_DIR, f);
    if (!fs.existsSync(fp)) return;
    const content = fs.readFileSync(fp, 'utf8');
    const match = content.match(/setResponse\((.*)\);?$/s);
    if (!match) return;
    try {
      const json = JSON.parse(match[1]);
      const table = json.table;
      if (!table || !table.cols || !table.rows) return;
      const colIdx = table.cols.findIndex(c => c && c.label && /municip/i.test(c.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
      if (colIdx === -1) return;
      let updated = 0;
      table.rows.forEach(r => {
        if (r && r.c && r.c[colIdx]) {
          const cell = r.c[colIdx];
          if (cell.v && typeof cell.v === 'string') {
            const oldV = cell.v.trim();
            const newV = normalizeMun(oldV);
            if (newV !== oldV) {
              cell.v = newV;
              if (cell.f) cell.f = newV;
              updated++;
            }
          }
        }
      });
      const newContent = content.slice(0, match.index) + 'setResponse(' + JSON.stringify(json) + ');';
      fs.writeFileSync(fp, newContent, 'utf8');
      console.log(`[JSON OK] ${f}: ${updated} células atualizadas.`);
    } catch(e) {}
  });
}

async function updateGoogleSheets() {
  console.log('\n--- 4. ATUALIZANDO PLANILHAS ONLINE (GOOGLE SHEETS) ---');
  const creds = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'planilha-google-form/service-account.json')));
  const client = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  await client.authorize();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // 1. GDSM
  console.log('Atualizando GDSM -> "todos"...');
  const resTodos = await sheets.spreadsheets.values.get({
    spreadsheetId: '1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E',
    range: `'todos'!D2:D`
  });
  const rowsTodos = resTodos.data.values || [];
  const updatesTodos = [];
  for (let i = 0; i < rowsTodos.length; i++) {
    const oldVal = (rowsTodos[i][0] || '').trim();
    if (!oldVal) continue;
    const newVal = normalizeMun(oldVal);
    if (newVal !== oldVal) {
      updatesTodos.push({
        range: `'todos'!D${i + 2}`,
        values: [[newVal]]
      });
    }
  }
  if (updatesTodos.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: '1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E',
      requestBody: { valueInputOption: 'USER_ENTERED', data: updatesTodos }
    });
    console.log(`[GOOGLE SHEETS OK] GDSM 'todos': ${updatesTodos.length} linhas atualizadas.`);
  } else {
    console.log(`[GOOGLE SHEETS OK] GDSM 'todos': já padronizada.`);
  }

  // Aba 'escolas'
  console.log('Atualizando GDSM -> "escolas"...');
  const resEscolas = await sheets.spreadsheets.values.get({
    spreadsheetId: '1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E',
    range: `'escolas'!C2:C`
  });
  const rowsEscolas = resEscolas.data.values || [];
  const updatesEscolas = [];
  for (let i = 0; i < rowsEscolas.length; i++) {
    const oldVal = (rowsEscolas[i][0] || '').trim();
    if (!oldVal) continue;
    const newVal = normalizeMun(oldVal);
    if (newVal !== oldVal) {
      updatesEscolas.push({
        range: `'escolas'!C${i + 2}`,
        values: [[newVal]]
      });
    }
  }
  if (updatesEscolas.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: '1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E',
      requestBody: { valueInputOption: 'USER_ENTERED', data: updatesEscolas }
    });
    console.log(`[GOOGLE SHEETS OK] GDSM 'escolas': ${updatesEscolas.length} linhas atualizadas.`);
  } else {
    console.log(`[GOOGLE SHEETS OK] GDSM 'escolas': já padronizada.`);
  }

  // 2. ENTIDADES
  console.log('Atualizando ENTIDADES -> "ENTIDADES"...');
  const resEnt = await sheets.spreadsheets.values.get({
    spreadsheetId: '1kOlpcEzduP_nCSvKo0DYNBnABYV_GWXBEN8Sfu1mCpI',
    range: `'ENTIDADES'!A2:A`
  });
  const rowsEnt = resEnt.data.values || [];
  const updatesEnt = [];
  for (let i = 0; i < rowsEnt.length; i++) {
    const oldVal = (rowsEnt[i][0] || '').trim();
    if (!oldVal) continue;
    const newVal = normalizeMun(oldVal);
    if (newVal !== oldVal) {
      updatesEnt.push({
        range: `'ENTIDADES'!A${i + 2}`,
        values: [[newVal]]
      });
    }
  }
  if (updatesEnt.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: '1kOlpcEzduP_nCSvKo0DYNBnABYV_GWXBEN8Sfu1mCpI',
      requestBody: { valueInputOption: 'USER_ENTERED', data: updatesEnt }
    });
    console.log(`[GOOGLE SHEETS OK] ENTIDADES: ${updatesEnt.length} linhas atualizadas.`);
  } else {
    console.log(`[GOOGLE SHEETS OK] ENTIDADES: já padronizada.`);
  }

  // 3. CONTATOS
  console.log('Atualizando CONTATOS -> "contatos"...');
  const resCont = await sheets.spreadsheets.values.get({
    spreadsheetId: '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08',
    range: `'contatos'!A2:A`
  });
  const rowsCont = resCont.data.values || [];
  const updatesCont = [];
  for (let i = 0; i < rowsCont.length; i++) {
    const oldVal = (rowsCont[i][0] || '').trim();
    if (!oldVal) continue;
    const newVal = normalizeMun(oldVal);
    if (newVal !== oldVal) {
      updatesCont.push({
        range: `'contatos'!A${i + 2}`,
        values: [[newVal]]
      });
    }
  }
  if (updatesCont.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08',
      requestBody: { valueInputOption: 'USER_ENTERED', data: updatesCont }
    });
    console.log(`[GOOGLE SHEETS OK] CONTATOS: ${updatesCont.length} linhas atualizadas.`);
  } else {
    console.log(`[GOOGLE SHEETS OK] CONTATOS: já padronizada.`);
  }
}

async function main() {
  await updateLocalCSVs();
  await updateProalfaXLSX();
  await updateJSONFiles();
  await updateGoogleSheets();
  console.log('\n=== TODAS AS PLANILHAS FORAM ATUALIZADAS COM SUCESSO! ===\n');
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
