const fs = require('fs');
let script = fs.readFileSync('make_pdfjs.cjs', 'utf8');

script = script.replace(
  "doc.text('SEDUC', 44, 25",
  "if(LOGO_B64 && LOGO_B64.length > 50) doc.addImage(LOGO_B64, 'PNG', 18, 17, 18, 18);\n  doc.text('SEDUC', 54, 25"
);

script = script.replace(
  "Educação', 44, 31",
  "Educação', 54, 31"
);

fs.writeFileSync('make_pdfjs.cjs', script, 'utf8');
console.log('Patched');
