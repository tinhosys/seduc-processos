const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Change line color to navy blue (e.g. [30, 58, 138]) in the total row
// And make subtotal rows bold
content = content.replace(/data\.cell\.styles\.lineColor = \[220, 38, 38\];/g, "data.cell.styles.lineColor = [30, 58, 138];");

// Also add bold for Subtotal rows in didParseCell
const regexDidParseCell = /const isTotalRow = \(data\.table\.body\[data\.row\.index\]\.cells\[0\]\.text\[0\] \|\| ''\)\.includes\('TOTAIS'\);/g;
const replacementDidParseCell = `const cell0 = data.table.body[data.row.index].cells[0].text[0] || '';
           const isTotalRow = cell0.includes('TOTAIS');
           const isSubtotalRow = cell0.includes('Subtotal');
           if (isSubtotalRow) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [241, 245, 249]; // subtle highlight
           }`;
content = content.replace(regexDidParseCell, replacementDidParseCell);

fs.writeFileSync(file, content);
console.log('Patched line color and subtotal detection');
