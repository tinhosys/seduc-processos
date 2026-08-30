const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// The logic is in didParseCell:
/*
             const isSubtotalRow = cell0.includes('Subtotal');
             if (isSubtotalRow) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [241, 245, 249]; // subtle highlight
             }
*/
const regexSubtotal = /const isSubtotalRow = cell0\.includes\('Subtotal'\);\s*if \(isSubtotalRow\) \{[\s\S]*?\}/;
const replacementSubtotal = `const isSubtotalRow = cell0.includes('Subtotal');
             if (isSubtotalRow) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [30, 58, 138]; // azul marinho
                data.cell.styles.lineWidth = { top: 0.5 };
                data.cell.styles.lineColor = [200, 200, 200]; // grey separator line
                data.cell.styles.fillColor = [248, 250, 252]; // very subtle highlight
             }`;

content = content.replace(regexSubtotal, replacementSubtotal);

fs.writeFileSync(file, content);
console.log('Patched subtotals styling');
