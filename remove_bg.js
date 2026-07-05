const fs = require('fs');

function removeBackgroundGraphics() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Remove the print-color-adjust properties
  app = app.replace(/-webkit-print-color-adjust:\s*exact;\s*print-color-adjust:\s*exact;\s*/g, '');

  // Remove the dark blue background from the header rows in Padrao and Detalhado
  // Currently: <tr style="background:#1a2b4c; color:white;">
  app = app.replace(/<tr style="background:#1a2b4c; color:white;">/g, '<tr>');
  app = app.replace(/<tr style="background:#52c41a; color:white;">/g, '<tr>'); // just in case

  // Change the th color from #ffffff to #000000
  // Currently: <th style="color:#ffffff; border: 1px solid #ccc;
  app = app.replace(/<th style="color:#ffffff;/g, '<th style="color:#000000;');

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Background graphics removed');
}

removeBackgroundGraphics();
