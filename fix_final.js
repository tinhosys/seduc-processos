const fs = require('fs');

function applyFinalFixes() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // 1. Fix Padrao HTML structure to repeat the header
  const padraoHtmlBlockRegex = /const html = \`\s*\$\{getCommonHeader\('Lista de Processos Oficial'\)\}\s*<table class="print-table-detalhado"([\s\S]*?)<thead>/;
  app = app.replace(padraoHtmlBlockRegex, `const html = \`
          <table class="print-table-detalhado"$1<thead>
            <tr><td colspan="9" style="border:none;">\${getCommonHeader('Lista de Processos Oficial')}</td></tr>`);

  // 2. Change font-size of CAM title from 14px to 11px
  app = app.replace(/<h2 style="margin:0 0 2px 0; font-size:14px; color:#000;">CAM - COORDENAÇÃO DE ARTICULAÇÃO COM OS MUNICÍPIOS<\/h2>/g, 
                    '<h2 style="margin:0 0 2px 0; font-size:11px; color:#000;">CAM - COORDENAÇÃO DE ARTICULAÇÃO COM OS MUNICÍPIOS</h2>');
  app = app.replace(/<h2 style="margin:0 0 2px 0; font-size:14px; color:#000;">CAM - COORDENAǟO DE ARTICULAǟO COM OS MUNIC?PIOS<\/h2>/g, 
                    '<h2 style="margin:0 0 2px 0; font-size:11px; color:#000;">CAM - COORDENAÇÃO DE ARTICULAÇÃO COM OS MUNICÍPIOS</h2>');
  app = app.replace(/<h2 style="margin:0 0 2px 0; font-size:14px; color:#000;">CAM -/g, 
                    '<h2 style="margin:0 0 2px 0; font-size:11px; color:#000;">CAM -');

  // 3. Remove bold from STATUS column in Padrao and Detalhado mappers
  // Currently it is: <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>${p.status || '-'}</b></td>
  app = app.replace(/<td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>\$\{p\.status \|\| '-'}<\/b><\/td>/g, 
                    `<td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;">\${p.status || '-'}</td>`);

  // 4. Force color:#ffffff on every th
  // Currently: <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:3%; font-size:12px; font-weight:bold;">Nº</th>
  // I will just do a generic replace inside the headersHtml I injected:
  const thRegex = /<th style="border: 1px solid #ccc;/g;
  app = app.replace(thRegex, '<th style="color:#ffffff; border: 1px solid #ccc;');

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Final fixes applied');
}

applyFinalFixes();
