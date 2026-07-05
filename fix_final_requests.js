const fs = require('fs');

function applyFinalRequests() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // 1. Change "Lista de Processos Oficial" to "Lista de Processos"
  app = app.replace(/'Lista de Processos Oficial'/g, "'Lista de Processos'");

  // 2. Change header date font size to 8px
  app = app.replace(/<div class="print-date-time-rodape" style="font-size:7px;/g, 
                    '<div class="print-date-time-rodape" style="font-size:8px;');

  // 3. Add total sum row at the end of the tables
  
  // For Padrao:
  const padraoRowsHtmlRegex = /let rowsHtml = filtrados\.map\(\(p, index\) => \`([\s\S]*?)\`\)\.join\(''\);/;
  if (padraoRowsHtmlRegex.test(app)) {
    const padraoTotalLogic = `let rowsHtml = filtrados.map((p, index) => \`$1\`).join('');
      const totalValorPadrao = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
      const totalRowPadrao = \`
        <tr style="font-weight:bold; background:#f9fafb;">
          <td colspan="8" style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">TOTAL GERAL (\${filtrados.length} processos):</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatNumberOnly(totalValorPadrao)}</td>
        </tr>\`;
      rowsHtml += totalRowPadrao;`;
      
    app = app.replace(padraoRowsHtmlRegex, padraoTotalLogic);
  }

  // For Detalhado:
  // It has a loop: filtrados.forEach((p, i) => { tableRows += `...` });
  const detalhadoLoopRegex = /filtrados\.forEach\(\(p, i\) => \{([\s\S]*?)tableRows \+= \`([\s\S]*?)\`;\s*\}\);/;
  if (detalhadoLoopRegex.test(app)) {
    const detalhadoTotalLogic = `filtrados.forEach((p, i) => {$1tableRows += \`$2\`;
  });
  const totalValorDetalhado = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  tableRows += \`
    <tr style="font-weight:bold; background:#f9fafb;">
      <td colspan="8" style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">TOTAL GERAL (\${filtrados.length} processos):</td>
      <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatNumberOnly(totalValorDetalhado)}</td>
    </tr>\`;`;
    
    app = app.replace(detalhadoLoopRegex, detalhadoTotalLogic);
  }

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Final requests applied successfully');
}

applyFinalRequests();
