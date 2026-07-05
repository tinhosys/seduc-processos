const fs = require('fs');

function applyCompleteIntegrity() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Add integrity to the cards in Detalhado (RELATÓRIO DETALHADO DE PROCESSOS)
  const detalhadoCardsHtmlSearch = '<div style="display:flex; gap:10px; margin-bottom: 20px;">';
  const detalhadoCardsHtmlReplace = '<div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; display:flex; gap:10px; margin-bottom: 20px;">';
  app = app.replace(detalhadoCardsHtmlSearch, detalhadoCardsHtmlReplace);

  // Add integrity to the cards/synthesis block in Analise Gerencial
  const analiseCardsHtmlSearch = '<div style="margin-bottom:20px; font-size:12px; text-align:justify; line-height:1.6; padding:10px; border:1px solid #ccc;">';
  const analiseCardsHtmlReplace = '<div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; margin-bottom:20px; font-size:12px; text-align:justify; line-height:1.6; padding:10px; border:1px solid #ccc;">';
  app = app.replace(analiseCardsHtmlSearch, analiseCardsHtmlReplace);

  // In Padrao, Detalhado, and Analise, let's explicitly inject the style on EVERY <tr> generation just to be absolutely bulletproof, even though CSS covers it.
  app = app.replace(/<tr>/g, '<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">');
  
  // Also fix the rows built with template literals
  // In Padrao:
  app = app.replace(/<tr\s*>/g, '<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">');
  
  // Specific row in Padrao/Detalhado:
  // let rowsHtml = filtrados.map((p, index) => `\n          <tr>
  app = app.replace(/<tr>\s*<td style="border:/g, '<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">\n            <td style="border:');

  // Any other tr with styles
  app = app.replace(/<tr style="/g, '<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; ');

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Complete integrity applied');
}

applyCompleteIntegrity();
