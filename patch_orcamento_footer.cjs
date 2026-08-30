const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Gerado em
content = content.replace(/doc\.setFontSize\(10\);\s*doc\.text\("Gerado em: " \+ new Date\(\)\.toLocaleString\('pt-BR'\), 14, 21\);\s*/, "");

// 2. Remove Dotação Inicial... Empenhado...
content = content.replace(/doc\.text\(`Dotação Inicial: \$\{_fmtBRL\(tInicial\)\}    Empenhado: \$\{_fmtBRL\(tEmpenhado\)\}        Executado: \$\{_fmtBRL\(tExecutado\)\}        Saldo Líquido: \$\{_fmtBRL\(tLiquido\)\}`, 14, 27\);\s*/, "");

// 3. Move the title up a little since we removed two lines!
// The title was: doc.text(title, 14, 35);
// Let's change it to 14, 25 and autoTable startY from 40 to 30.
content = content.replace(/doc\.text\(title, 14, 35\);/g, "doc.text(title, 14, 25);");
content = content.replace(/startY: 40,/g, "startY: 30,");

// 4. Add didDrawPage to add Footer (Gerado em and Pagina)
const didParseStr = `didParseCell: function(data) {`;
const didDrawPageStr = `didDrawPage: function(data) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        
        const str = "Gerado em: " + new Date().toLocaleString('pt-BR');
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const textWidth = doc.getTextWidth(str);
        // centralizado
        doc.text(str, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 10);
        
        // a esquerda "1/1" ou apenas "Página 1" etc
        const pageText = "Página " + data.pageNumber;
        doc.text(pageText, 14, doc.internal.pageSize.height - 10);
      },
      didParseCell: function(data) {`;
content = content.replace(didParseStr, didDrawPageStr);

fs.writeFileSync(file, content);
console.log('Patched footer');
