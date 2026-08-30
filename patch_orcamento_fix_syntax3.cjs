const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regexBad = /if \(txt\.includes\('R[\s\S]*?doc\.autoPrint\(\);/;

const fixedBlock = `if (txt.includes('R$') || txt.includes('%') || (data.section === 'head' && ['Inicial', 'Executado', 'Saldo Líq.', 'Saldo Líquido', '%', 'Empenhado'].includes(txt))) {
           data.cell.styles.halign = 'right';
        }
        
        // Total row styling
        if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
           const isTotalRow = (data.table.body[data.row.index].cells[0].text[0] || '').includes('TOTAIS');
           if (isTotalRow) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = [220, 38, 38];
              // Top border for totals
              data.cell.styles.lineWidth = { top: 1 };
              data.cell.styles.lineColor = [220, 38, 38];
           }
        }
      }
    });
    doc.autoPrint();`;

content = content.replace(regexBad, fixedBlock);

fs.writeFileSync(file, content);
console.log('Fixed syntax error caused by $ string replace');
