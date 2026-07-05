const fs = require('fs');

function fixHtml(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. Add watermark just after <body>
  if (!content.includes('watermark-print')) {
    content = content.replace('<body>', '<body>\n  <img src="img/logo-seduc.png" class="watermark-print">');
  }

  // 2. Remove old .print-header
  content = content.replace(/<div class="print-header">[\s\S]*?<\/div>/, '');

  // 3. Add padrao-header-subtitle inside the table thead
  const theadRegex = /(<table[^>]*>\s*<thead>)(\s*<tr)/i;
  if (!content.includes('padrao-header-subtitle')) {
    const newHeaderRow = `
              <tr class="print-only">
                <td colspan="10" id="padrao-header-subtitle" style="border:none !important; padding-bottom:10px;"></td>
              </tr>`;
    content = content.replace(theadRegex, `$1${newHeaderRow}$2`);
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed', filepath);
}

fixHtml('c:/Users/Elton/SEDUC/planilha-google-form/public/index.html');
fixHtml('c:/Users/Elton/SEDUC/index.html');
