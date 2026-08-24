const fs = require('fs');
let js = fs.readFileSync('js/print-proalfa.js', 'utf8');

const regexMap = /contatosDataFiltrados\.forEach\(c => \{[\s\S]*?tableRows \+= `[\s\S]*?`[^}]*\}\);/;

// Wait, the regex might be complicated because there are nested templates.
// I'll just write a script that finds "let tableRows = '';" and then finds "const content = `" and does replace.

let indexStart = js.indexOf("let tableRows = '';");
let indexEnd = js.indexOf("const content = `");

if (indexStart !== -1 && indexEnd !== -1) {
  let innerLoop = js.substring(indexStart, indexEnd);
  const newInnerLoop = `let tableRows = '';
  let grandTotalEsc = 0;
  let grandTotalAlu = 0;
  
  contatosDataFiltrados.forEach(c => {
    let esc = 0; let alu = 0;
    if (typeof calcularAgregados === 'function') {
      const ag = calcularAgregados(c.municipio);
      esc = ag.escolas;
      alu = ag.alunos;
    }
    grandTotalEsc += esc;
    grandTotalAlu += alu;
    
    tableRows += \`
      <tr>
        <td class="text-left" style="font-weight:bold;">\${c.municipio || '-'}</td>
        <td class="text-left">
           <strong>\${c.nomePrefeito || '-'}</strong><br>
           <span style="color:#555;">\${c.celularPrefeito || 'Não informado'}</span>
        </td>
        <td class="text-left">
           <strong>\${c.nomeSecretario || '-'}</strong><br>
           <span style="color:#555;">\${c.celularSecretario || 'Não informado'}</span>
        </td>
        <td class="text-left">\${c.email || '-'}</td>
        <td class="text-center">\${esc}</td>
        <td class="text-center">\${alu.toLocaleString('pt-BR')}</td>
      </tr>
    \`;
  });
  
  // Total Row
  tableRows += \`
    <tr style="background:#e2e8f0; font-weight:bold; font-size:14px; border-top: 2px solid #cbd5e1;">
      <td colspan="4" class="text-right" style="padding: 10px; text-transform: uppercase;">Total Geral:</td>
      <td class="text-center" style="padding: 10px;">\${grandTotalEsc}</td>
      <td class="text-center" style="padding: 10px;">\${grandTotalAlu.toLocaleString('pt-BR')}</td>
    </tr>
  \`;
  
  `;
  js = js.substring(0, indexStart) + newInnerLoop + js.substring(indexEnd);
  fs.writeFileSync('js/print-proalfa.js', js, 'utf8');
  console.log('print-proalfa.js updated with totals');
} else {
  console.log('Could not find loop to inject totals');
}
