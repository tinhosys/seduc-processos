const fs = require('fs');
const b64 = fs.readFileSync('logo_b64.txt', 'utf8');

const code = `
const LOGO_B64 = 'data:image/png;base64,${b64}';

// UI Lógica
function abrirModalPdf() {
  document.getElementById('modal-pdf').style.display = 'flex';
  atualizarOpcoesPdf();
}

function fecharModalPdf() {
  document.getElementById('modal-pdf').style.display = 'none';
}

function atualizarOpcoesPdf() {
  const tipo = document.getElementById('pdf-tipo').value;
  const lbl = document.getElementById('pdf-label-valor');
  const sel = document.getElementById('pdf-valor');
  sel.innerHTML = '';
  
  const processos = carregarProcessos();
  const opcoes = new Set();
  
  if (tipo === 'municipio') {
    lbl.textContent = 'Selecione o Município:';
    processos.forEach(p => { if (p.municipio) opcoes.add(p.municipio); });
  } else {
    lbl.textContent = 'Selecione a Planilha (Prefixo):';
    processos.forEach(p => { if (p.prefixo) opcoes.add(p.prefixo); });
  }
  
  const arr = Array.from(opcoes).sort();
  sel.innerHTML = '<option value="">(Todos)</option>' + arr.map(o => \`<option value="\${o}">\${o}</option>\`).join('');
}

async function iniciarGeracaoPdf() {
  const tipo = document.getElementById('pdf-tipo').value;
  const valor = document.getElementById('pdf-valor').value;
  fecharModalPdf();
  toast('Gerando PDF...', 'info');
  
  // Timeout para permitir que a UI respire e o toast apareça
  setTimeout(() => gerarPdf(tipo, valor), 100);
}

function gerarPdf(tipo, valor) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
  
  // 1. Filtrar Processos
  let allProcessos = carregarProcessos();
  // Filtrar apenas se não for vazio e ignorar totais que possam ter passado
  let procFiltrados = allProcessos.filter(p => {
    if(tipo === 'municipio' && valor && p.municipio !== valor) return false;
    if(tipo === 'prefixo' && valor && p.prefixo !== valor) return false;
    return true;
  });
  
  // 2. Cálculos
  const valorTotal = procFiltrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  
  const autorizados = procFiltrados.filter(p => normalizar(p.status) === 'autorizado');
  const valAutorizados = autorizados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  
  const reabertos = procFiltrados.filter(p => normalizar(p.status) === 'reaberto');
  const valReabertos = reabertos.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  
  const notificados = procFiltrados.filter(p => normalizar(p.status).includes('notifica'));
  const semStatus = procFiltrados.filter(p => normalizar(p.status) === 'sem status' || !p.status);
  
  const pendentesOutrosVal = procFiltrados.reduce((acc, p) => {
    const s = normalizar(p.status);
    if(s !== 'autorizado' && s !== 'reaberto') return acc + (p.valorOf || 0);
    return acc;
  }, 0);
  const qtdOutros = procFiltrados.length - autorizados.length - reabertos.length;

  // 3. Desenhar Header
  doc.setFillColor(15, 102, 195); // Azul SEDUC
  doc.rect(14, 14, 60, 24, 'F');
  
  // Texto SEDUC
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  if(LOGO_B64 && LOGO_B64.length > 50) doc.addImage(LOGO_B64, 'PNG', 18, 17, 18, 18);
  doc.text('SEDUC', 54, 25, {align: 'center'});
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Secretaria de Estado da\\nEducação', 54, 31, {align: 'center'});
  
  // Titulos
  doc.setTextColor(15, 102, 195);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO CONSOLIDADO DE PROCESSOS', 78, 22);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const subtitulo = \`\${tipo === 'municipio' ? 'Município' : 'Planilha'}: \${valor || 'Todos'}  |  SEDUC/RO  |  CAM - Coordenadoria de Articulação com os Municípios\`;
  doc.text(subtitulo, 78, 29);
  
  const agora = new Date();
  const dStr = agora.toLocaleDateString('pt-BR');
  const hStr = agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  doc.text(\`Base de consulta: SAP/SEDUC - levantamento exibido em \${dStr}, às \${hStr}.\`, 78, 35);
  
  // 4. Desenhar Cards (Caixas)
  const drawCard = (x, y, w, h, bgColor, strokeColor, title, valStr, subStr, valColor) => {
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(x, y, w, h, 'FD');
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + w/2, y + 6, {align: 'center'});
    
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.setFontSize(20);
    doc.text(valStr, x + w/2, y + 16, {align: 'center'});
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subStr, x + 3, y + 23);
  };
  
  const cY = 44;
  const cW = 63.5;
  const space = 4;
  
  // Card 1: TOTAL
  drawCard(14, cY, cW, 26, [240, 249, 244], [187, 223, 203], 'VALOR TOTAL CONSOLIDADO', formatCurrency(valorTotal), \`\${procFiltrados.length} processos únicos\`, [15, 142, 85]);
  
  // Card 2: AUTORIZADOS
  drawCard(14 + cW + space, cY, cW, 26, [236, 253, 245], [167, 243, 208], 'PROCESSOS AUTORIZADOS', formatCurrency(valAutorizados), \`\${autorizados.length} processos\`, [16, 185, 129]);
  
  // Card 3: REABERTOS
  drawCard(14 + cW*2 + space*2, cY, cW, 26, [245, 243, 255], [221, 214, 254], 'PROCESSOS REABERTOS', formatCurrency(valReabertos), \`\${reabertos.length} processos\`, [139, 92, 246]);
  
  // Card 4: PENDENTES
  drawCard(14 + cW*3 + space*3, cY, cW, 26, [255, 247, 237], [253, 186, 116], 'PENDENTES/OUTROS', formatCurrency(pendentesOutrosVal), \`\${notificados.length} notificado + \${semStatus.length} sem status\`, [217, 119, 6]);
  
  // 5. Tabelas
  doc.setTextColor(15, 102, 195);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Detalhamento dos processos', 14, 82);
  
  let bodyDetalhamento = procFiltrados.map((p, i) => [
    i+1,
    p.prefixo || '-',
    p.numero || '-',
    (p.interessado || '-').substring(0,25) + ((p.interessado||'').length>25?'...':''),
    (p.objeto || '-').substring(0,30) + ((p.objeto||'').length>30?'...':''),
    p.status ? p.status.toUpperCase() : 'SEM STATUS',
    p.localizacao || '-',
    formatCurrency(p.valorOf),
    p.dataEntrada || '-'
  ]);
  
  doc.autoTable({
    startY: 86,
    head: [['Nº', 'Prefixo', 'Processo', 'Interessado', 'Objeto / finalidade', 'Status', 'Localização', 'Valor oficial', 'Data']],
    body: bodyDetalhamento,
    theme: 'striped',
    headStyles: { fillColor: [24, 46, 114], textColor: [255,255,255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      5: { halign: 'center', textColor: [100,100,100] }, // Status
      7: { halign: 'right' },
      8: { halign: 'center' }
    },
    didParseCell: function (data) {
      if(data.section === 'body' && data.column.index === 5) {
         let st = (data.cell.raw || '').toLowerCase();
         if(st.includes('autorizado')) data.cell.styles.textColor = [16, 185, 129];
         if(st.includes('reaberto')) data.cell.styles.textColor = [139, 92, 246];
         if(st.includes('notifica')) data.cell.styles.textColor = [245, 158, 11];
         if(st.includes('pendente')) data.cell.styles.textColor = [239, 68, 68];
      }
    }
  });
  
  let finalY = doc.lastAutoTable.finalY + 10;
  
  // Tabela 2
  // Agrupar por Status
  let mapStatus = {};
  procFiltrados.forEach(p => {
     let s = p.status ? p.status.toUpperCase() : 'SEM STATUS';
     if(!mapStatus[s]) mapStatus[s] = { qtde: 0, valor: 0 };
     mapStatus[s].qtde++;
     mapStatus[s].valor += (p.valorOf || 0);
  });
  
  let sumResumo = Object.keys(mapStatus).map(k => {
     let val = mapStatus[k].valor;
     let part = valorTotal > 0 ? (val / valorTotal)*100 : 0;
     return [
       k,
       mapStatus[k].qtde,
       formatCurrency(val),
       part.toFixed(1).replace('.',',') + '%'
     ];
  });
  
  // Ordenar por valor decrescente
  sumResumo.sort((a,b) => parseCurrency(b[2]) - parseCurrency(a[2]));
  
  // Adicionar TOTAL
  sumResumo.push(['TOTAL GERAL', procFiltrados.length, formatCurrency(valorTotal), '100,0%']);
  
  // Nova página se não couber
  if(finalY > 170) {
    doc.addPage();
    finalY = 20;
  }
  
  doc.setTextColor(15, 102, 195);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Resumo por status', 14, finalY);
  
  doc.autoTable({
    startY: finalY + 4,
    head: [['Status', 'Qtde.', 'Valor total', 'Part.']],
    body: sumResumo,
    theme: 'striped',
    tableWidth: 100,
    headStyles: { fillColor: [40, 80, 150], textColor: [255,255,255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.row.index === sumResumo.length - 1) {
         data.cell.styles.fontStyle = 'bold';
         data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });
  
  // Leitura Executiva
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let percAutorizado = valorTotal > 0 ? ((valAutorizados / valorTotal)*100).toFixed(1).replace('.',',') : '0,0';
  let txtLeitura = "Leitura executiva:\\n";
  txtLeitura += \`• \${percAutorizado}% do valor consolidado já consta como AUTORIZADO.\\n\`;
  if (valReabertos > 0) {
    txtLeitura += \`• Reabertos: \${formatCurrency(valReabertos)}.\\n\`;
  }
  if (notificados.length > 0 || semStatus.length > 0) {
    txtLeitura += \`• \${notificados.length} processo(s) notificado(s) e \${semStatus.length} sem status, requerem atenção.\`;
  }
  
  doc.text(txtLeitura, 120, finalY + 12);
  
  // Observação
  let lastY = doc.lastAutoTable.finalY + 5;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Observação: campos de objeto/interessado com reticências foram mantidos conforme apareceram nos relatórios do SAP/SEDUC.', 14, lastY);
  
  // Rodapé com paginação manual
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CAM/SEDUC', 14, 200);
    doc.text(\`Página \${i} de \${pageCount}\`, 270, 200);
  }
  
  doc.save(\`Relatorio_\${tipo}_\${valor || 'Todos'}.pdf\`);
}
`;

fs.writeFileSync('planilha-google-form/public/js/pdf.js', code, 'utf8');
console.log('pdf.js criado!');
