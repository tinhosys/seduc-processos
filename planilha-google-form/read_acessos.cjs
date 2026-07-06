const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'c:/Users/Elton/SEDUC/planilha-google-form/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E';

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Acessos!A:D'
  });

  console.log(JSON.stringify(res.data.values, null, 2));
}

main().catch(console.error);
