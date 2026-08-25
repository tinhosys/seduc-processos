const fs = require('fs');
let code = fs.readFileSync('js/print-proalfa.js', 'utf8');

const startIdx = code.indexOf('function imprimirCenso()');
const endIdx = code.indexOf('function imprimirProfessores()');

const novoCenso = `function imprimirCenso() {
  const data = getFilteredProalfaData();
  const allAlunos = [...data.aluMun, ...data.aluEst];
  
  // Ordenar por Município e depois Escola
  allAlunos.sort((a, b) => {
    if (a[1] !== b[1]) return (a[1] || '').localeCompare(b[1] || '');
    return (a[4] || '').localeCompare(b[4] || '');
  });

  let tableRows = '';
  let sumT = 0, sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0, sum5 = 0;
  
  allAlunos.forEach(r => {
    const a1 = Number(r[9]) || 0;
    const a2 = Number(r[10]) || 0;
    const a3 = Number(r[11]) || 0;
    const a4 = Number(r[12]) || 0;
    const a5 = Number(r[13]) || 0;
    const tot = a1 + a2 + a3 + a4 + a5;
    
    sumT += tot;
    sum1 += a1; sum2 += a2; sum3 += a3; sum4 += a4; sum5 += a5;

    tableRows += \`
      <tr>
        <td class="text-left">\${r[0] || '-'}</td>
        <td class="text-left">\${r[1] || '-'}</td>
        <td class="text-center">\${r[5] || '-'}</td>
        <td class="text-center">\${r[6] || '-'}</td>
        <td class="text-center">\${r[3] || '-'}</td>
        <td class="text-left">\${r[4] || '-'}</td>
        <td class="text-center">Alunos</td>
        <td class="text-center" style="font-weight:bold;">\${tot}</td>
        <td class="text-center">\${a1}</td>
        <td class="text-center">\${a2}</td>
        <td class="text-center">\${a3}</td>
        <td class="text-center">\${a4}</td>
        <td class="text-center">\${a5}</td>
      </tr>
    \`;
  });
  
  // Linha de Total Geral
  tableRows += \`
    <tr style="background:#e2e8f0; font-weight:bold; border-top: 2px solid #cbd5e1;">
      <td colspan="7" class="text-right" style="padding: 10px; text-transform: uppercase;">Total Geral:</td>
      <td class="text-center" style="padding: 10px;">\${sumT.toLocaleString('pt-BR')}</td>
      <td class="text-center" style="padding: 10px;">\${sum1.toLocaleString('pt-BR')}</td>
      <td class="text-center" style="padding: 10px;">\${sum2.toLocaleString('pt-BR')}</td>
      <td class="text-center" style="padding: 10px;">\${sum3.toLocaleString('pt-BR')}</td>
      <td class="text-center" style="padding: 10px;">\${sum4.toLocaleString('pt-BR')}</td>
      <td class="text-center" style="padding: 10px;">\${sum5.toLocaleString('pt-BR')}</td>
    </tr>
  \`;
  
  const content = \`
    <div style="text-align:center; margin-bottom:15px;"><img src="img/logos_proalfa.png" style="max-height: 60px;" /></div>
    <div class="header-title">
      <span>Memória Cálculo_ARP Mat Gráfico</span>
      <span>Censo Escolar 2025</span>
    </div>
    <div class="sub-header">ESCOLAS E ALUNOS ATENDIDOS</div>
    <table class="striped">
      <thead>
        <tr>
          <th class="bg-blue" rowspan="2">SUPER responsável</th>
          <th class="bg-blue" rowspan="2">Município</th>
          <th class="bg-blue" rowspan="2">Dependência Administrativa</th>
          <th class="bg-blue" rowspan="2">Localização</th>
          <th class="bg-blue" rowspan="2">Código da Escola</th>
          <th class="bg-blue" rowspan="2">Nome da Escola</th>
          <th class="bg-blue" rowspan="2">Tipo</th>
          <th class="bg-light-blue" colspan="6"></th>
        </tr>
        <tr>
          <th class="bg-light-blue">Total</th>
          <th class="bg-light-blue">1º ano</th>
          <th class="bg-light-blue">2º ano</th>
          <th class="bg-light-blue">3º ano</th>
          <th class="bg-light-blue">4º ano</th>
          <th class="bg-light-blue">5º ano</th>
        </tr>
      </thead>
      <tbody>
        \${tableRows.length > 0 ? tableRows : '<tr><td colspan="13" class="text-center">Nenhum dado encontrado</td></tr>'}
      </tbody>
    </table>
  \`;

  openPrintWindow(content, 'I - CENSO ESCOLAR');
}

`;

code = code.substring(0, startIdx) + novoCenso + code.substring(endIdx);
fs.writeFileSync('js/print-proalfa.js', code, 'utf8');
console.log('imprimirCenso updated!');
