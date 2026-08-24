const fs = require('fs');
let js = fs.readFileSync('js/print-proalfa.js', 'utf8');

const newPrintFunc = `
function imprimirContatos() {
  if (typeof contatosDataFiltrados === 'undefined' || !contatosDataFiltrados) {
    alert("Dados não carregados ainda.");
    return;
  }
  
  let tableRows = '';
  
  contatosDataFiltrados.forEach(c => {
    // We calculate aggregations again, or assume they are stored.
    let esc = 0; let alu = 0;
    if (typeof calcularAgregados === 'function') {
      const ag = calcularAgregados(c.municipio);
      esc = ag.escolas;
      alu = ag.alunos;
    }
    
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
  
  const content = \`
    <div style="text-align:center; margin-bottom:15px;"><img src="img/logos_proalfa.png" style="max-height: 60px;" /></div>
    <div class="header-title">
      <span class="text-left" style="font-size:12px;">GOVERNO DO ESTADO DE RONDÔNIA<br>SECRETARIA DE ESTADO DA EDUCAÇÃO<br>COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS</span>
      <span style="font-size:16px;">Governo + CAM</span>
    </div>
    <table class="striped">
      <thead>
        <tr>
          <th class="bg-blue" style="width:15%; text-align:center;">Município</th>
          <th class="bg-blue" style="width:25%; text-align:center;">Prefeito(a)</th>
          <th class="bg-blue" style="width:25%; text-align:center;">Secretário(a)</th>
          <th class="bg-blue" style="width:23%; text-align:center;">E-mail</th>
          <th class="bg-blue" style="width:6%; text-align:center;">Escolas</th>
          <th class="bg-blue" style="width:6%; text-align:center;">Alunos</th>
        </tr>
      </thead>
      <tbody>
        \${tableRows.length > 0 ? tableRows : '<tr><td colspan="6" class="text-center">Nenhum dado encontrado</td></tr>'}
      </tbody>
    </table>
  \`;

  openPrintWindow(content, 'Relatório Governo + CAM');
}
`;

js += newPrintFunc;

fs.writeFileSync('js/print-proalfa.js', js, 'utf8');
console.log('js/print-proalfa.js updated successfully');
