const fs = require('fs');

function removeHeaderTopBorder() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Add border-top: none; to all th tags in the print tables that have color:#000000 and border: 1px solid #ccc
  app = app.replace(/<th style="color:#000000; border: 1px solid #ccc;/g, '<th style="color:#000000; border: 1px solid #ccc; border-top: none;');

  // Also remove the top border from the TOTAL GERAL row, or maybe keep it? The user said "MANTENHA AS LINHAS SOMENTE NO MIOLO".
  // The TOTAL GERAL is in the miolo (at the end), so it's fine.

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Top border removed from THs');
}

removeHeaderTopBorder();
