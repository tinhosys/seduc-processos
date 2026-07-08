require('dotenv').config();
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SHEET_ID;

async function run() {
  try {
    const rowNumber = 2; // Test row
    const tabName = 'Processos'; // Wait, let's just get the first tab
    const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const tab = response.data.sheets[0].properties.title;
    console.log("Tab:", tab);

    const headerDefRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `!A1:Z1`
    });
    const headers = headerDefRes.data.values[0];
    
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

    const lastColumn = columnToLetter(headers.length);
    console.log("Headers length:", headers.length, "Last column:", lastColumn);

    const updatedRow = [...headers];
    const range = `!A2:2`;
    console.log("Range:", range);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] }
    });
    console.log("Success");
  } catch(e) { console.log("ERROR:", e); }
}
run();
