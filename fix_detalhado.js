const fs = require('fs');

function fixReports() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // We will replace the table generation for Detalhado and Padrao.
  // First, Padrao:
  
  const padraoRegex = /window\.imprimirPadrao\s*=\s*function\(\)\s*\{([\s\S]*?)window\.print\(\);([\s\S]*?)\};/g;
  app = app.replace(padraoRegex, `window.imprimirPadrao = function() {
      injectFixedFooter();
      updatePrintDateTime();
      const filtrados = getFiltrados();
      
      let rowsHtml = filtrados.map((p, index) => \`
        <tr>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${index + 1}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.prefixo || '-'}</td>
          <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.numero || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.interessado || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.objeto || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>\${p.status || '-'}</b></td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.localizacao || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${formatDate(p.data)}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatCurrency(p.valorOf)}</td>
        </tr>\`).join('');

      const html = \`
        \${getCommonHeader('Lista de Processos Oficial')}
        <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word;">
          <thead>
            <tr style="background:#52c41a; color:white;">
              <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:3%; font-size:12px;">Nº</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">PREFIXO</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:12%; font-size:12px;">PROCESSO SEI</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:18%; font-size:12px;">INTERESSADO</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:31%; font-size:12px;">OBJETO / FINALIDADE</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">STATUS</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">LOCALIZAÇÃO</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:7%; font-size:12px;">DATA</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:right; width:8%; font-size:12px;">VALOR R$</th>
            </tr>
          </thead>
          <tbody>
            \${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding: 10px;">Nenhum processo encontrado.</td></tr>'}
          </tbody>
          <tfoot class="print-spacer-tfoot"><tr><td colspan="9"></td></tr></tfoot>
        </table>
      \`;
      
      let container = document.getElementById('print-layout-padrao');
      if (!container) {
        container = document.createElement('div');
        container.id = 'print-layout-padrao';
        container.className = 'print-only-layout';
        document.body.appendChild(container);
      }
      container.innerHTML = html;
      
      document.getElementById('print-layout-detalhado').style.display = 'none';
      document.getElementById('print-layout-analise').style.display = 'none';
      container.style.display = 'block';
      
      document.body.classList.add('print-mode-padrao');
      document.body.classList.remove('print-mode-detalhado', 'print-mode-analise');

      const origTitle = document.title;
      document.title = 'CAM_PADRAO_' + getFormattedDateForTitle();

      const style = document.createElement('style');
      style.innerHTML = '@media print { @page { size: A4 landscape !important; } }';
      document.head.appendChild(style);

      window.print();

      setTimeout(() => {
        document.title = origTitle;
        if (document.head.contains(style)) document.head.removeChild(style);
        document.body.classList.remove('print-mode-padrao');
        container.style.display = 'none';
      }, 1000);
    };`);

  // Second, Detalhado: We will do string replacement on the table generation parts
  
  // Replace tableRows mapping:
  const oldTableRowsStr = `      <tr>
        <td style="text-align:center;">\${i + 1}</td>
        <td>\${p.prefixo || '-'}</td>
        <td>\${p.numero || '-'}</td>
        <td>\${p.interessado || '-'}</td>
        <td>\${p.objeto || '-'}</td>
        <td style="font-weight:bold;">\${p.status || '-'}</td>
        <td>\${p.localizacao || '-'}</td>
        <td style="text-align:right;">\${formatCurrency(p.valorOf)}</td>
        <td style="text-align:center;">\${formatDate(p.data)}</td>
      </tr>`;
      
  const newTableRowsStr = `      <tr>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${i + 1}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.prefixo || '-'}</td>
        <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.numero || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.interessado || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.objeto || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>\${p.status || '-'}</b></td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.localizacao || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${formatDate(p.data)}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatCurrency(p.valorOf)}</td>
      </tr>`;
      
  app = app.replace(oldTableRowsStr, newTableRowsStr);
  
  // Replace table header in Detalhado:
  const oldTableHeaderRegex = /<table class="print-table-detalhado"[\s\S]*?<\/thead>/g;
  
  // We need to be careful as there might be other things, but Detalhado has only one such block inside its function.
  // Wait, I can just replace the whole HTML block for Detalhado table.
  const oldHtmlTableRegex = /const tableHtml = \`[\s\S]*?<\/table>\s*\`;/g;
  app = app.replace(oldHtmlTableRegex, (match) => {
    if (match.includes('1. Detalhamento dos processos')) {
      return `const tableHtml = \`
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; margin-top:20px; font-size:14px;">1. Detalhamento dos processos</h3>
    <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">
      <thead>
        <tr style="background:#52c41a; color:white;">
          <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:3%; font-size:12px;">Nº</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">PREFIXO</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:12%; font-size:12px;">PROCESSO SEI</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:18%; font-size:12px;">INTERESSADO</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:31%; font-size:12px;">OBJETO / FINALIDADE</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">STATUS</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">LOCALIZAÇÃO</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:7%; font-size:12px;">DATA</th>
          <th style="border: 1px solid #ccc; padding: 2px; text-align:right; width:8%; font-size:12px;">VALOR R$</th>
        </tr>
      </thead>
      <tbody>\${tableRows}</tbody>
    </table>
  \`;`;
    }
    return match;
  });

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Columns renamed and resized');
}

fixReports();
