const fs = require('fs');

function fix3() {
  const htmlPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/index.html';
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Change button text
  html = html.replace(/<\/svg>\s*Imprimir Padr.o/g, '</svg> Padrão');

  // Add print-spacer-tfoot to tabela-processos if not present
  if (!html.includes('class="print-spacer-tfoot"')) {
    // Actually, tabela-processos doesn't have a tfoot right now. Let's add it before </table>
    // Wait, let's just append it to the table if it has no tfoot.
    html = html.replace(/<\/tbody>\s*<\/table>/g, `</tbody>\n                <tfoot class="print-spacer-tfoot print-only"><tr><td colspan="10"></td></tr></tfoot>\n              </table>`);
  }
  
  fs.writeFileSync(htmlPath, html, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/index.html', html, 'utf8');

  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Remove top border from fixed footer
  app = app.replace(/border-top:2px solid #000;/g, '');
  app = app.replace(/border-top:1px solid #000;/g, '');

  // Modify imprimirPadrao to inject landscape and remove it
  const padraoRegex = /window\.imprimirPadrao\s*=\s*function\(\)\s*\{([\s\S]*?)window\.print\(\);([\s\S]*?)\};/g;
  app = app.replace(padraoRegex, (match, before, after) => {
    // We already have some code there. We want to add style injection before print, and removal after.
    // Let's just rewrite imprimirPadrao carefully.
    return `window.imprimirPadrao = function() {
    injectFixedFooter();
    updatePrintDateTime();
    document.getElementById('print-layout-detalhado').style.display = 'none';
    document.getElementById('print-layout-analise').style.display = 'none';
    document.body.classList.remove('print-mode-detalhado', 'print-mode-analise');
    
    const hEl = document.getElementById('padrao-header-subtitle');
    if(hEl) hEl.innerHTML = getCommonHeader('Lista de Processos Oficial');
  
    const origTitle = document.title;
    document.title = 'CAM_PADRAO_' + getFormattedDateForTitle();

    const style = document.createElement('style');
    style.innerHTML = '@media print { @page { size: A4 landscape !important; } }';
    document.head.appendChild(style);

    window.print();

    setTimeout(() => {
      document.title = origTitle;
      if (document.head.contains(style)) document.head.removeChild(style);
    }, 1000);
  };`;
  });

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log("Fixes 3 applied!");
}

fix3();
