const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config();

const SPREADSHEET_ID = process.env.SHEET_ID || "1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E";

let authConfig = {
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
};

if (process.env.GOOGLE_CREDS_JSON) {
  authConfig.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
} else {
  authConfig.keyFile = "./service-account.json";
}

const auth = new google.auth.GoogleAuth(authConfig);
const sheets = google.sheets({ version: "v4", auth });

const requiredHeaders = [
  "OFICIO",
  "METRAGEM (M²)",
  "DETALHAMENTO ITENS",
  "DEMAIS OBSERVAÇÕES"
];

function columnToLetter(column) {
  let temp = "";
  let letter = "";
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

async function syncHeaders() {
  console.log("Conectando à planilha ID:", SPREADSHEET_ID);
  
  const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const allSheets = response.data.sheets || [];

  for (const s of allSheets) {
    const title = s.properties.title;
    const sheetId = s.properties.sheetId;
    console.log(`\nVerificando aba: '${title}'...`);

    if (title === 'Acessos' || title.toLowerCase() === 'escolas' || title.toLowerCase() === 'escola') {
      console.log(`Pulando aba especial: '${title}'`);
      continue;
    }

    const safeTitle = title.replace(/'/g, "''");
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${safeTitle}'!A1:ZZ1`
    });

    const currentHeaders = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
    console.log(`Aba '${title}' possui ${currentHeaders.length} cabeçalhos atuais.`);

    const normCurrent = currentHeaders.map(h => String(h || '').trim().toLowerCase());
    const toAdd = [];

    for (const rh of requiredHeaders) {
      const normRh = rh.trim().toLowerCase();
      if (!normCurrent.includes(normRh)) {
        toAdd.push(rh);
      }
    }

    if (toAdd.length > 0) {
      console.log(`Expandindo limite de colunas na aba '${title}' (+${toAdd.length} colunas)...`);
      
      // Expande o limite de colunas da aba
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              appendDimension: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                length: toAdd.length
              }
            }
          ]
        }
      });

      console.log(`Adicionando ${toAdd.length} novos cabeçalhos na aba '${title}':`, toAdd);
      const startCol = currentHeaders.length + 1;
      const startLetter = columnToLetter(startCol);
      const endLetter = columnToLetter(startCol + toAdd.length - 1);
      const updateRange = `'${safeTitle}'!${startLetter}1:${endLetter}1`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [toAdd] }
      });
      console.log(`✅ Aba '${title}' atualizada com sucesso no intervalo ${updateRange}!`);
    } else {
      console.log(`✅ Aba '${title}' já possui todos os cabeçalhos atualizados.`);
    }
  }

  console.log("\n🚀 Sincronização concluída com sucesso em TODAS as abas da planilha Google!");
}

syncHeaders().catch(err => console.error("Erro ao sincronizar cabeçalhos:", err));
