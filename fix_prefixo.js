const fs = require('fs');

function changePrefToPrefixo() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Replace PREF. with PREFIXO in table headers
  app = app.replace(/>PREF\.<\/th>/g, '>PREFIXO</th>');

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('PREF. changed to PREFIXO');
}

changePrefToPrefixo();
