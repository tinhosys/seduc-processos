const fs = require('fs');

function applyColFixes() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // We need to fix the th generation and the td generation for all 3 reports.
  // 1. Padrao
  // 2. Detalhado
  // 3. Analise

  // Helper function to build headers
  const buildHeaders = () => `
          <tr style="background:#f3f4f6;">
            <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:3%; font-size:12px;">Nº</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">PREFIXO</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:12%; font-size:12px;">PROCESSO SEI</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:18%; font-size:12px;">INTERESSADO</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:31%; font-size:12px;">OBJETO / FINALIDADE</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">STATUS</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px;">LOCALIZAÇÃO</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:7%; font-size:12px;">DATA</th>
            <th style="border: 1px solid #ccc; padding: 2px; text-align:right; width:8%; font-size:12px;">VALOR R$</th>
          </tr>`;

  // Helper function to build row map logic
  const buildRowMapper = () => `
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
        </tr>`;

  // Padrao Regex and Replace
  const padraoRegex = /window\.imprimirPadrao\s*=\s*function\(\)\s*\{([\s\S]*?)window\.print\(\);([\s\S]*?)\};/g;
  app = app.replace(padraoRegex, `window.imprimirPadrao = function() {
      injectFixedFooter();
      updatePrintDateTime();
      const filtrados = getFiltrados();
      
      let rowsHtml = filtrados.map((p, index) => \`${buildRowMapper()}\`).join('');

      const html = \`
        \${getCommonHeader('Lista de Processos Oficial')}
        <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word;">
          <thead>\${buildHeaders()}</thead>
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


  // For Detalhado
  const detalhadoRegex = /window\.imprimirDetalhado\s*=\s*function\(\)\s*\{([\s\S]*?)window\.print\(\);([\s\S]*?)\};/g;
  app = app.replace(detalhadoRegex, (match, before, after) => {
    // We only want to replace the table part, keeping the cards logic.
    // The table generation in detalhado loops over keys. Let's just do a regex replace on the specific parts.
    return match; // Will do this differently below
  });

  fs.writeFileSync(appPath, app, 'utf8');
}

applyColFixes();
