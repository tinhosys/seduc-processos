$targetFile = "C:\Users\ADM\Documents\GitHub\seduc-processos\planilha-google-form\server.js"
$content = [System.IO.File]::ReadAllText($targetFile)

$jsContent = @"
// ====== ENDPOINTS: CONTATOS ======
const defaultContatosHeaders = [
  "Municipio", "Nome do Prefeito", "celular prefeito", "Nome secretario", "celular secretario", "E-MAIL", "OBSERVACOES", "QTDE ESCOLAS", "QTDE ALUNOS"
];

function mapRowToContatoObj(headers, row) {
  const get = (termos) => {
    for (const t of termos) {
      const idx = headers.findIndex(h => normalizarStr(h) === normalizarStr(t));
      if (idx !== -1 && row[idx] !== undefined) return String(row[idx]).trim();
    }
    return "";
  };
  return {
    municipio: get(['municipio', 'municpio']),
    nomePrefeito: get(['nome do prefeito', 'prefeito', 'nome prefeito']),
    celularPrefeito: get(['celular prefeito', 'telefone prefeito']),
    nomeSecretario: get(['nome secretario', 'secretario', 'nome secretrio']),
    celularSecretario: get(['celular secretario', 'telefone secretario']),
    email: get(['e-mail', 'email']),
    observacoes: get(['observacoes', 'observaes', 'obs']),
    qtdeEscolas: get(['qtde escolas', 'escolas', 'qtd escolas']),
    qtdeAlunos: get(['qtde alunos', 'alunos', 'qtd alunos'])
  };
}

function mapDataToContatoRow(data, headers, originalRow = []) {
  return headers.map((h, i) => {
    const hLow = normalizarStr(h || "");
    let val = undefined;
    if (hLow.includes('municipio')) val = data.municipio;
    else if (hLow.includes('prefeito') && hLow.includes('celular')) val = data.celularPrefeito;
    else if (hLow.includes('prefeito')) val = data.nomePrefeito;
    else if (hLow.includes('secretario') && hLow.includes('celular')) val = data.celularSecretario;
    else if (hLow.includes('secretario')) val = data.nomeSecretario;
    else if (hLow.includes('mail')) val = data.email;
    else if (hLow.includes('observ')) val = data.observacoes;
    else if (hLow.includes('escola')) val = data.qtdeEscolas;
    else if (hLow.includes('aluno')) val = data.qtdeAlunos;

    if (val !== undefined) return val;
    return originalRow[i] !== undefined ? originalRow[i] : "";
  });
}

app.get("/api/contatos", async (req, res) => {
  try {
    let escolasPorMunicipio = {};
    try {
      const respEscolas = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "escolas!A1:Z" });
      const rowsE = respEscolas.data.values || [];
      if (rowsE.length > 1) {
        const headersE = rowsE[0];
        rowsE.slice(1).forEach(r => {
          const escObj = mapRowToEscolaObj(headersE, r);
          if (!escObj.municipio) return;
          const munLower = normalizarStr(escObj.municipio);
          if (!escolasPorMunicipio[munLower]) {
            escolasPorMunicipio[munLower] = { ineps: new Set(), totalAlunos: 0 };
          }
          if (escObj.codigoInep) escolasPorMunicipio[munLower].ineps.add(escObj.codigoInep);
          if (escObj.totalMatricula) escolasPorMunicipio[munLower].totalAlunos += (parseInt(escObj.totalMatricula) || 0);
        });
      }
    } catch (e) {
      console.error("Erro ao ler escolas para contatos:", e);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "contatos!A1:Z"
    });
    const rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : defaultContatosHeaders;

    const dataRows = rows.slice(1).map((r, idx) => {
      let obj = {
        id: (idx + 2) + "_contatos",
        _tabName: "contatos",
        ...mapRowToContatoObj(headers, r)
      };
      
      const munLower = normalizarStr(obj.municipio);
      if (escolasPorMunicipio[munLower]) {
        obj.qtdeEscolas = escolasPorMunicipio[munLower].ineps.size;
        obj.qtdeAlunos = escolasPorMunicipio[munLower].totalAlunos;
      } else {
        obj.qtdeEscolas = 0;
        obj.qtdeAlunos = 0;
      }
      return obj;
    });
    res.json(dataRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar contatos." });
  }
});

app.post("/api/contatos", editorOnly, async (req, res) => {
  try {
    const headerDefRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "contatos!A1:Z1" });
    let headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];
    if (headers.length === 0) {
      headers = defaultContatosHeaders;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID, range: "contatos!A1", valueInputOption: "USER_ENTERED", requestBody: { values: [headers] }
      });
    }
    const newRow = mapDataToContatoRow(req.body, headers, []);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID, range: "contatos!A:A", valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS", requestBody: { values: [newRow] }
    });
    res.json({ sucesso: true, mensagem: "Contato cadastrado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar contato." });
  }
});

app.put("/api/contatos/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const rowNumber = Number(rawId.split("_")[0]);
    if (!rowNumber || rowNumber < 2) return res.status(400).json({ erro: "Linha invalida." });
    
    const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `contatos!A${rowNumber}:Z${rowNumber}` });
    const existingRow = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
    const headerDefRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "contatos!A1:Z1" });
    const headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];

    const updatedRow = mapDataToContatoRow(req.body, headers, existingRow);
    const lastColumn = columnToLetter(headers.length);
    const range = `contatos!A${rowNumber}:${lastColumn}${rowNumber}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID, range, valueInputOption: "USER_ENTERED", requestBody: { values: [updatedRow] }
    });
    res.json({ sucesso: true, mensagem: "Contato atualizado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar contato." });
  }
});

app.delete("/api/contatos/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const rowNumber = Number(rawId.split("_")[0]);
    if (!rowNumber || rowNumber < 2) return res.status(400).json({ erro: "Linha invalida." });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets.find(s => s.properties.title.toLowerCase() === 'contatos');
    if (!sheet) return res.status(404).json({ erro: "Aba contatos nao encontrada." });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: { sheetId: sheet.properties.sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber }
          }
        }]
      }
    });
    res.json({ sucesso: true, mensagem: "Contato excluido." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir contato." });
  }
});
"@

if (-not $content.Contains("/api/contatos")) {
    $content = $content -replace "(?s)(async function garantirColunasAdicionais\(\) \{)", "`n$jsContent`n`$1"
    [System.IO.File]::WriteAllText($targetFile, $content)
    Write-Output "Injetado com sucesso."
} else {
    Write-Output "Já existia."
}
