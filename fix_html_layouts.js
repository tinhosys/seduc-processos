const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Add tfoot to table
  const tfootHtml = `
                <tfoot class="print-only">
                  <tr>
                    <td colspan="10" style="border:none !important; padding-top:20px; text-align:left;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #555; border-top: 1px solid #ccc; padding-top: 4px;">
                        <div style="flex: 1;">SAP/SEDUC — Sistema de Acompanhamento de Processos</div>
                        <div class="print-date-time-rodape"></div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>`;
  content = content.replace(/<\/tbody>\s*<\/table>/, '</tbody>' + tfootHtml);

  // Remove old print-footer
  content = content.replace(/<div class="print-footer"[\s\S]*?<\/div>\s*<\/div>/, '');

  // Add print layout divs
  const printLayouts = `
  <!-- ============= PRINT LAYOUT: DETALHADO ============= -->
  <div id="print-layout-detalhado" class="print-only-layout" style="display:none;"></div>

  <!-- ============= PRINT LAYOUT: ANÁLISE ============= -->
  <div id="print-layout-analise" class="print-only-layout" style="display:none;"></div>
</body>`;
  content = content.replace(/<\/body>/, printLayouts);

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed', filepath);
}

fixFile('c:/Users/Elton/SEDUC/planilha-google-form/public/index.html');
fixFile('c:/Users/Elton/SEDUC/index.html');
