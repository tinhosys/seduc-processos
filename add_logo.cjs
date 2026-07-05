const fs = require('fs');
let pdf = fs.readFileSync('planilha-google-form/public/js/pdf.js', 'utf8');

pdf = pdf.replace(
  '// 3. Desenhar Header\n  doc.setFillColor(15, 102, 195); // Azul SEDUC\n  doc.rect(14, 14, 60, 24, \'F\');\n  \n  // Texto SEDUC\n  doc.setTextColor(255, 255, 255);\n  doc.setFontSize(22);\n  doc.setFont(\'helvetica\', \'bold\');\n  doc.text(\'SEDUC\', 44, 25, {align: \'center\'});\n  doc.setFontSize(7);\n  doc.setFont(\'helvetica\', \'normal\');\n  doc.text(\'Secretaria de Estado da\\\\nEducação\', 44, 31, {align: \'center\'});',
  '// 3. Desenhar Header\n  doc.setFillColor(15, 102, 195); // Azul SEDUC\n  doc.rect(14, 14, 60, 24, \\'F\\');\n  \n  if (LOGO_B64 && LOGO_B64.length > 50) {\n    try {\n      doc.addImage(LOGO_B64, \\'PNG\\', 18, 17, 18, 18);\n    } catch(e) { console.error(\\'Erro ao adicionar logo:\\', e); }\n  }\n  \n  // Texto SEDUC\n  doc.setTextColor(255, 255, 255);\n  doc.setFontSize(22);\n  doc.setFont(\\'helvetica\\', \\'bold\\');\n  doc.text(\\'SEDUC\\', 54, 25, {align: \\'center\\'});\n  doc.setFontSize(7);\n  doc.setFont(\\'helvetica\\', \\'normal\\');\n  doc.text(\\'Secretaria de Estado da\\nEducação\\', 54, 31, {align: \\'center\\'});'
);

fs.writeFileSync('planilha-google-form/public/js/pdf.js', pdf, 'utf8');
console.log('Logo addImage inserted');
const fs = require('fs');
let script = fs.readFileSync('make_pdfjs.cjs', 'utf8');
script = script.replace('doc.text(\'SEDUC\', 44, 25', 'if(LOGO_B64 && LOGO_B64.length > 50) doc.addImage(LOGO_B64, \'PNG\', 18, 17, 18, 18);\n  doc.text(\'SEDUC\', 54, 25');
script = script.replace('Educação\\', 44, 31', 'Educação\\', 54, 31');
fs.writeFileSync('make_pdfjs.cjs', script);
require('./make_pdfjs.cjs');
