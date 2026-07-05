const fs = require('fs');

function fixColumnsExact() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Add formatNumberOnly if not exists
  if (!app.includes('function formatNumberOnly')) {
    app = app.replace('function formatCurrency', `function formatNumberOnly(valor) {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrency`);
  }

  const buildHeaders = () => `
            <tr style="background:#1a2b4c; color:white;">
              <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:3%; font-size:12px; font-weight:bold;">Nº</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:5%; font-size:12px; font-weight:bold;">PREF.</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:12%; font-size:12px; font-weight:bold;">PROCESSO SEI</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:18%; font-size:12px; font-weight:bold;">INTERESSADO</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:31%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:9%; font-size:12px; font-weight:bold;">STATUS</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px; font-weight:bold;">LOCAL</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:7%; font-size:12px; font-weight:bold;">DATA</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:right; width:8%; font-size:12px; font-weight:bold;">VALOR R$</th>
            </tr>`;

  const buildRowMapper = () => `
        <tr>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${index + 1}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.prefixo || '-'}</td>
          <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap;">\${p.numero || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.interessado || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word;">\${p.objeto || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>\${p.status || '-'}</b></td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.localizacao || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${formatDate(p.data)}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatNumberOnly(p.valorOf)}</td>
        </tr>`;
        
  const buildRowMapperDetalhado = () => `
      <tr>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${i + 1}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.prefixo || '-'}</td>
        <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap;">\${p.numero || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.interessado || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word;">\${p.objeto || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>\${p.status || '-'}</b></td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.localizacao || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${formatDate(p.data)}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatNumberOnly(p.valorOf)}</td>
      </tr>`;

  // Fix Padrao table
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
            \${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding: 10px; font-size:10px;">Nenhum processo encontrado.</td></tr>'}
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

  // Fix Detalhado table
  const htmlTableRegex = /const tableHtml = \`[\s\S]*?<table class="print-table-detalhado"[\s\S]*?<\/table>\s*\`;/;
  app = app.replace(htmlTableRegex, `const tableHtml = \`
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; margin-top:20px; font-size:14px;">1. Detalhamento dos processos</h3>
    <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">
      <thead>\${buildHeaders()}</thead>
      <tbody>\${tableRows}</tbody>
    </table>
  \`;`);
  
  // Detalhado map loop is slightly different
  const loopRegex = /let tableRows = '';\s*filtrados\.forEach\(\(p, i\) => \{([\s\S]*?)tableRows \+= \`([\s\S]*?)\`;\s*\}\);/g;
  app = app.replace(loopRegex, `let tableRows = '';
  filtrados.forEach((p, i) => {
    tableRows += \`${buildRowMapperDetalhado()}\`;
  });`);

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Columns perfectly sized');
}

fixColumnsExact();
