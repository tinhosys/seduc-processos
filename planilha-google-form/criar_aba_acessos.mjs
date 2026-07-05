// Script: Criar aba "Acessos" na planilha com estrutura inicial
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const credentials = JSON.parse(readFileSync(join(__dirname, 'service-account.json'), 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E';

async function criarAbaAcessos() {
  // 1. Check if tab already exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = meta.data.sheets.map(s => s.properties.title);
  
  if (existing.includes('Acessos')) {
    console.log('Aba "Acessos" já existe!');
    const rows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Acessos!A:C'
    });
    console.log('Conteúdo atual:', JSON.stringify(rows.data.values, null, 2));
    return;
  }

  // 2. Create the "Acessos" sheet
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: 'Acessos',
            gridProperties: { rowCount: 100, columnCount: 3 }
          }
        }
      }]
    }
  });
  console.log('Aba "Acessos" criada!');

  // 3. Insert header + first admin row
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Acessos!A1:C4',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        ['EMAIL', 'NIVEL', 'NOME'],
        ['elton@seduc.ro.gov.br', 'editor', 'Elton (Admin)'],
        // Add more users below - 'editor' or 'leitor'
        ['exemplo.leitor@seduc.ro.gov.br', 'leitor', 'Exemplo Leitor'],
      ]
    }
  });

  console.log('Estrutura criada com sucesso!');
  console.log('Acesse sua planilha e edite a aba "Acessos" para adicionar os usuários autorizados.');
  console.log('Colunas: EMAIL | NIVEL (editor/leitor) | NOME');
}

criarAbaAcessos().catch(console.error);
