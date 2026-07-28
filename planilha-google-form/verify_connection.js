import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs';

dotenv.config();

const SPREADSHEET_ID = process.env.SHEET_ID;

console.log("=== VERIFICACAO DE CONEXAO COM GOOGLE SHEETS ===");
console.log("Planilha ID:", SPREADSHEET_ID);

if (!SPREADSHEET_ID) {
  console.error("ERRO: SHEET_ID nao esta definido no arquivo .env");
  process.exit(1);
}

let authConfig = {
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
};

const keyFilePath = 'service-account.json';
const credentialsJson = process.env.GOOGLE_CREDS_JSON;

if (credentialsJson) {
  try {
    authConfig.credentials = JSON.parse(credentialsJson);
    console.log("Status: Usando credenciais da variavel GOOGLE_CREDS_JSON");
  } catch (err) {
    console.error("ERRO: Falha ao decodificar a variavel GOOGLE_CREDS_JSON:", err.message);
    process.exit(1);
  }
} else if (fs.existsSync(keyFilePath)) {
  authConfig.keyFile = keyFilePath;
  console.log("Status: Usando arquivo de credenciais 'service-account.json'");
  try {
    const fileContent = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    console.log("Service Account Email:", fileContent.client_email);
  } catch (err) {
    console.error("ERRO: Falha ao ler ou decodificar 'service-account.json':", err.message);
    process.exit(1);
  }
} else {
  console.error("ERRO: Nenhum arquivo de credenciais encontrado.");
  console.error("Por favor, crie o arquivo 'service-account.json' na pasta 'planilha-google-form' ou defina a variavel GOOGLE_CREDS_JSON no arquivo .env.");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth(authConfig);
const sheets = google.sheets({ version: 'v4', auth });

async function checkConnection() {
  try {
    console.log("Conectando a API do Google Sheets...");
    const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    console.log("CONEXAO ESTABELECIDA COM SUCESSO!");
    console.log("Titulo da Planilha:", response.data.properties.title);
    console.log("Abas encontradas:");
    response.data.sheets.forEach(sheet => {
      console.log(` - ${sheet.properties.title}`);
    });
  } catch (err) {
    console.error("ERRO AO CONECTAR A PLANILHA:");
    console.error(err.message);
    if (err.message.includes("caller does not have permission") || err.message.includes("403")) {
      console.error("\nDICA: Certifique-se de que a planilha foi compartilhada com o email da Service Account com permissao de 'Editor'.");
    }
  }
}

checkConnection();
