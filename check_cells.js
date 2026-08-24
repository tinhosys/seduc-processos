const fs = require('fs');
let js = fs.readFileSync('js/orcamento.js', 'utf8');

// Fix the TR template inside renderOrcamentoTable()
// Find and replace the <td> for PA and Fonte with proper overflow/wrap styles

// PA cell
js = js.replace(
  `<td style="padding:10px 12px; font-size:12px; font-weight:700; color:#60a5fa; white-space:normal; min-width:130px; max-width:160px;">`,
  `<td style="padding:10px 12px; font-size:12px; font-weight:700; color:#60a5fa; min-width:130px; max-width:150px; word-break:break-word; overflow:hidden;">`
);

// Fonte cell
js = js.replace(
  `<td style="padding:10px 12px; font-size:11px; color:#94a3b8; white-space:normal; min-width:120px; max-width:150px; word-break:break-word;">`,
  `<td style="padding:10px 12px; font-size:11px; color:#94a3b8; min-width:120px; max-width:140px; word-break:break-word; overflow:hidden;">`
);

fs.writeFileSync('js/orcamento.js', js, 'utf8');

// Also update the generated TR in renderOrcamentoTable - search for existing pattern
const content = fs.readFileSync('js/orcamento.js', 'utf8');
console.log('PA cell found:', content.includes('min-width:130px'));
console.log('Fonte cell found:', content.includes('min-width:120px'));
