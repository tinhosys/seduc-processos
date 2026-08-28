const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(modelo === 1\) \{/;
const replacement = `if (modelo === 7) {
    if (typeof window.imprimirOrcamento === 'function') {
      window.imprimirOrcamento();
    } else {
      window.print();
    }
    return;
  }
  
  if (modelo === 8) {
    title = "Relatório com Status e Gráficos";
    const selPA = document.getElementById('orc-filtro-pa');
    const selND = document.getElementById('orc-filtro-despesa');
    const nomePA = selPA && selPA.value ? PA_DESCRICAO[selPA.value] || selPA.value : 'Todos os Programas';
    const nomeND = selND && selND.value ? _naturezaNome(selND.value) : 'Todas as Naturezas';
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 150);
    doc.text("Parâmetros: PA = " + nomePA + " | ND = " + nomeND, 14, 35);
    doc.setTextColor(0, 0, 0);
    
    // Status text
    const perc = _pctExec(tInicial, tExecutado);
    let statusText = "STATUS GERAL: ";
    if (perc > 80) statusText += "CRÍTICO (Alta Execução)";
    else if (perc > 50) statusText += "ATENÇÃO (Execução Mediana)";
    else statusText += "NORMAL (Baixa Execução)";
    
    doc.setFontSize(11);
    doc.text(statusText, 14, 42);
    
    // Add Canvas 1
    try {
      const c1 = document.getElementById('orc-chart-bar');
      if (c1) {
        const img1 = c1.toDataURL("image/png", 1.0);
        doc.addImage(img1, 'PNG', 14, 50, 90, 60);
      }
      const c2 = document.getElementById('orc-chart-donut');
      if (c2) {
        const img2 = c2.toDataURL("image/png", 1.0);
        doc.addImage(img2, 'PNG', 110, 50, 80, 60);
      }
    } catch(e) {}
    
    // Summary table below charts
    head = [['Resumo', 'Valor (R$)']];
    body = [
      ['Dotação Inicial', _fmtBRL(tInicial)],
      ['Total Empenhado', _fmtBRL(tEmpenhado)],
      ['Total Executado', _fmtBRL(tExecutado)],
      ['Saldo Líquido', _fmtBRL(tLiquido)],
      ['Taxa de Execução', perc + '%']
    ];
    
    doc.autoTable({
      startY: 120,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    doc.save("Relatorio_Status_Graficos.pdf");
    return;
  }
  
  if (modelo === 1) {`;
content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Modelo 8 added to orcamento');
