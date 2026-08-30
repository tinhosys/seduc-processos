const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Change doc.autoTable styles to use fontSize 7
content = content.replace(/styles: \{ fontSize: 8 \}/, "styles: { fontSize: 7, cellPadding: 1.5 }");

// 2. Prevent money values from wrapping
const regexHalign = /data\.cell\.styles\.halign = 'right';/g;
const replacementHalign = `data.cell.styles.halign = 'right';
           data.cell.styles.cellWidth = 'wrap';`;
content = content.replace(regexHalign, replacementHalign);

// 3. Header adjustment - two lines, CAM on second line left-aligned
const regexHeader = /doc\.text\('EXECUÇÃO ORÇAMENTÁRIA ' \+ anoRelativo \+ ' - CAM \/ Coordenadoria de Articulações com os Municípios \/ SEDUC - RO', 14, 15\);/;
const replacementHeader = `doc.text('EXECUÇÃO ORÇAMENTÁRIA ' + anoRelativo, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('CAM / Coordenadoria de Articulações com os Municípios / SEDUC - RO', 14, 20);
    doc.setTextColor(0, 0, 0);`;
content = content.replace(regexHeader, replacementHeader);

// 4. Update title position to 26 so it doesn't collide with the new header line (at 20)
content = content.replace(/doc\.text\(title, 14, 25\);/g, "doc.text(title, 14, 26);");
content = content.replace(/startY: 30,/g, "startY: 31,");

fs.writeFileSync(file, content);
console.log('Patched table styles and header');
