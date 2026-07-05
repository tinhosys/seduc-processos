const fs = require('fs');

function fixLayout(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Remove the stray </div> right after <section class="page" id="page-processos">
  const strayDivRegex = /(<section class="page" id="page-processos">)\s*<\/div>\s*(<div class="section-header")/i;
  
  if (content.match(strayDivRegex)) {
    content = content.replace(strayDivRegex, "$1\n\n        $2");
    console.log("Fixed stray div in", filepath);
  }

  // Check if we accidentally added "padrao-header-subtitle" to the dashboard table instead of the processos table
  // The first table is the dashboard table. We should remove padrao-header-subtitle from it.
  const badDashboardHeader = /<tr class="print-only">\s*<td colspan="10" id="padrao-header-subtitle"[\s\S]*?<\/tr>/;
  if (content.match(badDashboardHeader)) {
    // Remove it from wherever it is currently
    content = content.replace(badDashboardHeader, "");
    
    // Now add it specifically to tabela-processos
    const processosTableRegex = /(<table id="tabela-processos">\s*<thead>)(\s*<tr>)/i;
    const newHeaderRow = `
              <tr class="print-only">
                <td colspan="10" id="padrao-header-subtitle" style="border:none !important; padding-bottom:10px;"></td>
              </tr>`;
    content = content.replace(processosTableRegex, `$1${newHeaderRow}$2`);
    console.log("Moved padrao-header-subtitle to tabela-processos in", filepath);
  }

  fs.writeFileSync(filepath, content, 'utf8');
}

fixLayout('c:/Users/Elton/SEDUC/planilha-google-form/public/index.html');
fixLayout('c:/Users/Elton/SEDUC/index.html');
