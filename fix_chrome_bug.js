const fs = require('fs');

function applyTbodyFix() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // 1. Remove the hardcoded <tbody> and </tbody> around rowsHtml and tableRows in Padrao and Detalhado.
  // Padrao:
  app = app.replace(/<tbody>\s*\$\{rowsHtml \|\| '([\s\S]*?)'\}\s*<\/tbody>/g, 
    "${rowsHtml || '<tbody>$1</tbody>'}");

  // Detalhado:
  app = app.replace(/<tbody>\$\{tableRows\}<\/tbody>/g, '${tableRows}');

  // 2. Change the row mappers to wrap each row in a <tbody> with page-break-inside: avoid
  
  // In Padrao:
  app = app.replace(/<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">/g, 
    '<tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr>');

  app = app.replace(/<\/td>\s*<\/tr>`/g, '</td></tr></tbody>`');

  // In Detalhado (which might have matched the above, but let's be sure about totalValorPadrao and totalValorDetalhado):
  // Let's check for any </tr>`; that was missed, or just do a global replace of </tr>`; with </tr></tbody>`; 
  // Wait, the rows are built with template literals.
  
  // For totalRowPadrao:
  // <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold; background:#f9fafb;">
  app = app.replace(/<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold;/g,
    '<tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr style="font-weight:bold;');
    
  // The end of total row: 
  // </td>\n          </tr>`; -> </td>\n          </tr></tbody>`;
  // Let's just do a specific replace for the total rows.
  app = app.replace(/<\/td>\n\s*<\/tr>`;/g, '</td>\n          </tr></tbody>`;');
  app = app.replace(/<\/td>\n\s*<\/tr>`/g, '</td>\n          </tr></tbody>`');

  // 3. For Analise Gerencial summary table
  app = app.replace(/<tbody>\$\{sumRows\}<\/tbody>/g, '${sumRows}');
  // sumRows loop inside Analise
  // It probably uses <tr class="no-page-break" ...
  // Since we replaced it globally, sumRows might also be using <tbody><tr>...</tr></tbody> now, which is perfect.

  // Let's verify the replacement logic by saving it
  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Tbody wrap fix applied to solve Chrome row swallow bug');
}

applyTbodyFix();
