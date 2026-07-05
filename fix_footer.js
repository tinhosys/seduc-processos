const fs = require('fs');

function updateFooter() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Replace injectFixedFooter logic
  const oldFooterLogicRegex = /footer\.innerHTML = \`([\s\S]*?)\`;/;
  const newFooterLogic = `footer.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:5px; font-weight:normal; color:#000; font-family: Arial, sans-serif; height:15mm; width:100%; box-sizing:border-box; padding: 0;">
          <div style="flex:1; text-align:left;">SAP - SISTEMA DE ACOMPANHAMENTO DE PROCESSO</div>
          <div style="flex:1; text-align:center;">
            <span class="print-date-time-rodape"></span>
          </div>
          <div style="flex:1; text-align:right;">
            <!-- Deixado vazio para o navegador injetar a paginação nativa se o usuário marcar a opção -->
          </div>
        </div>
      \`;`;
      
  app = app.replace(oldFooterLogicRegex, newFooterLogic);
  
  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Footer updated');
}

updateFooter();
