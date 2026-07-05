const fs = require('fs');

function applyPadraoFix() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Rewrite imprimirPadrao
  const padraoRegex = /window\.imprimirPadrao\s*=\s*function\(\)\s*\{([\s\S]*?)window\.print\(\);([\s\S]*?)\};/g;
  app = app.replace(padraoRegex, `window.imprimirPadrao = function() {
    injectFixedFooter();
    updatePrintDateTime();
    const filtrados = getFiltrados();
    
    let rowsHtml = filtrados.map((p, index) => \`
      <tr>
        <td style="border: 1px solid #ccc; padding: 4px; text-align:center;">\${index + 1}</td>
        <td style="border: 1px solid #ccc; padding: 4px;">\${p.prefixo || '-'}</td>
        <td class="col-numero" style="border: 1px solid #ccc; padding: 4px;">\${p.numero || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 4px;">\${p.interessado || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 4px;">\${p.objeto || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 4px; text-transform: uppercase;"><b>\${p.status || '-'}</b></td>
        <td style="border: 1px solid #ccc; padding: 4px;">\${p.localizacao || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 4px; text-align:right">\${formatCurrency(p.valorOf)}</td>
        <td style="border: 1px solid #ccc; padding: 4px; text-align:center">\${formatDate(p.data)}</td>
      </tr>
    \`).join('');

    const html = \`
      \${getCommonHeader('Lista de Processos Oficial')}
      <table class="print-table-detalhado" style="width:100%; border-collapse:collapse; font-size:10px; font-family:Arial;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="border: 1px solid #ccc; padding: 4px; text-align:center; width:30px;">Nº</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:left;">PREFIXO</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:left;">Nº PROCESSO</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:left;">INTERESSADO</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:left;">OBJETO / FINALIDADE</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:left;">STATUS</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:left;">LOCALIZAÇÃO</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:right;">VALOR OFICIAL</th>
            <th style="border: 1px solid #ccc; padding: 4px; text-align:center;">DATA</th>
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

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  // Fix CSS
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Add print-mode-padrao hiding rules
  if (!css.includes('body.print-mode-padrao .sidebar')) {
    css += `
@media print {
  body.print-mode-padrao .sidebar,
  body.print-mode-padrao .topbar,
  body.print-mode-padrao .section-header,
  body.print-mode-padrao .filters-bar,
  body.print-mode-padrao .table-wrap,
  body.print-mode-padrao .pagination,
  body.print-mode-padrao #export-buttons,
  body.print-mode-padrao .charts-grid,
  body.print-mode-padrao .dashboard,
  body.print-mode-padrao > section:not(#page-processos) {
    display: none !important;
  }

  body.print-mode-padrao #print-layout-padrao {
    display: block !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: white;
  }
  
  body.print-mode-padrao {
    padding: 0 !important;
    margin: 0 !important;
    margin-bottom: 15mm !important;
  }
}
`;
  }
  
  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');

  console.log('Fixed Padrao');
}

applyPadraoFix();
