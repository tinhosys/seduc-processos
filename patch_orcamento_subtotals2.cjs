const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// The code currently is:
/*
          if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
             const cell0 = data.table.body[data.row.index].cells[0].text[0] || '';
             const isTotalRow = cell0.includes('TOTAIS');
             const isSubtotalRow = cell0.includes('Subtotal');
               if (isSubtotalRow) {
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.textColor = [30, 58, 138]; // azul marinho
                  data.cell.styles.lineWidth = { top: 0.5 };
                  data.cell.styles.lineColor = [200, 200, 200]; // grey separator line
                  data.cell.styles.fillColor = [248, 250, 252]; // very subtle highlight
               }
             if (isTotalRow) {
*/

const regexToReplace = /if \(data\.section === 'body' && data\.row\.index === data\.table\.body\.length - 1\) \{[\s\S]*?const isTotalRow = cell0\.includes\('TOTAIS'\);[\s\S]*?if \(isTotalRow\) \{/g;

const replacement = `if (data.section === 'body') {
             const cell0 = data.row.cells[0].text[0] || '';
             const isSubtotalRow = cell0.includes('Subtotal');
             if (isSubtotalRow) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [30, 58, 138]; // azul marinho
                data.cell.styles.fillColor = [238, 242, 255]; // slight blue background
                data.cell.styles.lineWidth = { top: 0.5 };
                data.cell.styles.lineColor = [200, 200, 200];
             }
             
             const isTotalRow = cell0.includes('TOTAIS');
             if (isTotalRow) {`;

content = content.replace(regexToReplace, replacement);

// And we need to make sure the closing brace is correct. 
// Wait, the previous block had one `if` for the last row. If I change it to `if (data.section === 'body') {`, 
// the `isTotalRow` will still work (since TOTAIS only appears at the end, or if it appears, it's correct).

fs.writeFileSync(file, content);
console.log('Patched subtotals bug');
