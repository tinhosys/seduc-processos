const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regexGerar = /window\.gerarRelatorioOrcamento = function\(modelo\) \{/;
const replaceGerar = `window.gerarRelatorioOrcamento = function(modelo) {
  if (_guiaAtualGid === '807660383') {
    return window.gerarRelatorioDespesas(modelo);
  }`;

if (!content.includes('window.gerarRelatorioDespesas = function(modelo)')) {
  content = content.replace(regexGerar, replaceGerar);

  const despesasRelatorioCode = `
window.gerarRelatorioDespesas = function(modelo) {
  const pa = document.getElementById('orc-desp-filtro-pa')?.value || '';
  const setor = document.getElementById('orc-desp-filtro-setor')?.value || '';
  const tipo = document.getElementById('orc-desp-filtro-tipo')?.value || '';
  const natureza = document.getElementById('orc-desp-filtro-natureza')?.value || '';
  const busca = (document.getElementById('orc-desp-filtro-busca')?.value || '').toLowerCase();

  const filtrado = _crmData.filter(r => {
    if (pa && r.pa !== pa) return false;
    if (setor && r.setor !== setor) return false;
    if (tipo && r.tipo !== tipo) return false;
    if (natureza && r.despesa !== natureza) return false;
    if (busca) {
      const match = (r.processo.toLowerCase().includes(busca) || r.descricao.toLowerCase().includes(busca));
      if (!match) return false;
    }
    return true;
  });

  if (modelo === 7 || modelo === 8) {
    document.body.classList.add('print-mode-orcamento');
    let printHeader = document.getElementById('orc-print-header');
    if (!printHeader) {
      printHeader = document.createElement('div');
      printHeader.id = 'orc-print-header';
      document.getElementById('page-orcamento').prepend(printHeader);
    }
    printHeader.style.display = 'block';
    
    let subtitle = [];
    if(pa) subtitle.push('PA: ' + pa);
    if(setor) subtitle.push('Setor: ' + setor);
    if(natureza) subtitle.push('Natureza: ' + natureza);
    if(tipo) subtitle.push('Tipo: ' + tipo);
    if(subtitle.length === 0) subtitle.push('Todos os registros');
    
    printHeader.innerHTML = \`<h1 style="font-size:24px; margin-bottom:5px; text-align:center; color:#000;">Relatório de Despesas Realizadas</h1>
                             <h3 style="font-size:14px; margin-bottom:20px; text-align:center; color:#333;">\${subtitle.join(' | ')}</h3>\`;
    
    const headerDivs = document.querySelectorAll('.section-header > div:nth-child(2)');
    if (headerDivs.length > 0) headerDivs[0].classList.add('orc-buttons');
    
    setTimeout(() => {
      window.print();
      document.body.classList.remove('print-mode-orcamento');
      if (printHeader) printHeader.style.display = 'none';
    }, 100);
    return;
  }

  // Generate PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');
  
  let subtitle = [];
  if(pa) subtitle.push('PA: ' + pa);
  if(setor) subtitle.push('Setor: ' + setor);
  if(natureza) subtitle.push('Natureza: ' + natureza);
  if(tipo) subtitle.push('Tipo: ' + tipo);
  if(subtitle.length === 0) subtitle.push('Todos os registros');

  let y = 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Despesas Realizadas - CAM SEDUC-RO', 14, y);
  y += 7;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle.join(' | '), 14, y);
  y += 10;

  const rows = filtrado.map(p => [
    p.data,
    p.processo,
    p.pa,
    p.setor,
    p.despesa,
    p.tipo,
    p.descricao,
    (p.tipo === 'Anulação' ? '-' : '') + 'R$ ' + p.valorText
  ]);

  doc.autoTable({
    startY: y,
    head: [['Data', 'Processo', 'PA', 'Setor', 'Natureza', 'Tipo', 'Descrição', 'Valor']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      6: { cellWidth: 'auto' },
      7: { cellWidth: 25, halign: 'right' }
    },
    didDrawPage: function(data) {
      let str = 'Página ' + doc.internal.getNumberOfPages();
      if (typeof doc.putTotalPages === 'function') {
        str = str + ' de ' + totalPagesExp;
      }
      doc.setFontSize(8);
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
      doc.text('Gerado em: ' + dateStr, doc.internal.pageSize.width - data.settings.margin.right - 40, doc.internal.pageSize.height - 10);
    }
  });

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  window.open(doc.output('bloburl'), '_blank');
};
  `;

  content += '\n' + despesasRelatorioCode;
  fs.writeFileSync(file, content);
  console.log('Patched orcamento.js successfully.');
} else {
  console.log('Already patched.');
}
