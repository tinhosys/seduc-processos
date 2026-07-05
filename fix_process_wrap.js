const fs = require('fs');

function applyProcessWrapAndFooter() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // 1. Fix footer font size to 7px, normal weight, aligned left and right
  const oldFooterRegex = /<div style="display:flex; justify-content:space-between; align-items:center; font-size:5px; font-weight:normal; color:#000;/g;
  const newFooterStyle = '<div style="display:flex; justify-content:space-between; align-items:center; font-size:7px; font-weight:normal; color:#000;';
  app = app.replace(oldFooterRegex, newFooterStyle);

  // Since we removed the center div, let's make sure it's just Left and Right, or Left and Right with empty center.
  // The current footer HTML inside app.js:
  /*
  <div style="display:flex; justify-content:space-between; align-items:center; font-size:5px; font-weight:normal; color:#000; font-family: Arial, sans-serif; height:15mm; width:100%; box-sizing:border-box; padding: 0;">
    <div style="flex:1; text-align:left;">SAP - SISTEMA DE ACOMPANHAMENTO DE PROCESSO</div>
    <div style="flex:1; text-align:center;">
      <span class="print-date-time-rodape"></span>
    </div>
    <div style="flex:1; text-align:right;">
      <!-- Deixado vazio para o navegador injetar a paginação nativa se o usuário marcar a opção -->
    </div>
  </div>
  */
  // Wait, the user said: "DATA E HORA ALINHADO A DIREITA".
  // So I need to move the date/time span from the center div to the right div, and remove the center div (or just use 2 divs).
  const footerFullRegex = /<div style="display:flex; justify-content:space-between; align-items:center; font-size:5px; font-weight:normal; color:#000; font-family: Arial, sans-serif; height:15mm; width:100%; box-sizing:border-box; padding: 0;">\s*<div style="flex:1; text-align:left;">SAP - SISTEMA DE ACOMPANHAMENTO DE PROCESSO<\/div>\s*<div style="flex:1; text-align:center;">\s*<span class="print-date-time-rodape"><\/span>\s*<\/div>\s*<div style="flex:1; text-align:right;">\s*<!-- Deixado vazio para o navegador injetar a paginação nativa se o usuário marcar a opção -->\s*<\/div>\s*<\/div>/g;

  const newFooterFull = `<div style="display:flex; justify-content:space-between; align-items:center; font-size:7px; font-weight:normal; color:#000; font-family: Arial, sans-serif; height:15mm; width:100%; box-sizing:border-box; padding: 0;">
          <div style="text-align:left;">SAP - SISTEMA DE ACOMPANHAMENTO DE PROCESSO</div>
          <div style="text-align:right;">
            <span class="print-date-time-rodape"></span>
          </div>
        </div>`;
  app = app.replace(footerFullRegex, newFooterFull);
  
  // Just in case it didn't match perfectly, let's also do a fallback replace for font-size:5px to 7px in the footer string
  app = app.replace(/font-size:5px; font-weight:normal/g, 'font-size:7px; font-weight:normal');

  // 2. Fix the Processo SEI column to wrap lines.
  // It currently has `white-space:nowrap;`. We want `white-space:normal; word-wrap:break-word;`.
  // And to ensure "one below the other", we can replace spaces with <br> in the mapped value, or just let CSS do it.
  // Let's replace the td styling first.
  app = app.replace(/<td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap; width:12%;">/g, 
                    '<td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:12%;">');
                    
  // Let's also actually inject a .replace(/ /g, '<br>') into the JS string for p.numero so it STRICTLY breaks on spaces.
  // The current code is: `${p.numero || '-'}`
  // Let's change it to `${(p.numero || '-').replace(/\\s+/g, '<br>')}`
  
  // Detalhado:
  const tdNumeroRegex = /<td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:12%;">\$\{p\.numero \|\| '-'}<\/td>/g;
  app = app.replace(tdNumeroRegex, 
                    `<td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:12%;">\${(p.numero || '-').replace(/\\s+/g, '<br>')}</td>`);

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Process wrap and footer fixed');
}

applyProcessWrapAndFooter();
