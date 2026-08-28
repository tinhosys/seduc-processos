let DIARIAS_DATA = [];
let DIARIAS_SALDO_INICIAL = 150000; // Fake fallback
let DIARIAS_SALDO_ATUAL = 150000;

window.carregarDiariasData = async function() {
  try {
    const gid = '807660383';
    const url = `https://docs.google.com/spreadsheets/d/1WunsuLAAIUAAo1q65qmSVMIH0qLJu_TjDsb_u9LO304/gviz/tq?tqx=out:csv&gid=${gid}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csv = await res.text();
    
    
    // Proper CSV Parsing handling quoted newlines
    const parseCSV = (str) => {
      let result = [];
      let row = [];
      let inQuotes = false;
      let val = '';
      for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (inQuotes) {
          if (char === '"') {
            if (i + 1 < str.length && str[i + 1] === '"') {
              val += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            val += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            row.push(val);
            val = '';
          } else if (char === '\n' || char === '\r') {
            if (char === '\r' && i + 1 < str.length && str[i + 1] === '\n') i++;
            row.push(val);
            result.push(row);
            row = [];
            val = '';
          } else {
            val += char;
          }
        }
      }
      if (val || row.length > 0) {
        row.push(val);
        result.push(row);
      }
      return result;
    };

    const rows = parseCSV(csv);
    DIARIAS_DATA = [];
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      let cols = rows[i];
      if (!cols || cols.length < 12) continue;
      
      const status = cols[0] ? cols[0].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const dataInicio = cols[3] ? cols[3].trim() : '';
      const setor = cols[5] ? cols[5].trim() : '';
      const motivo = cols[6] ? cols[6].trim().replace(/\n/g, ' ') : '';
      const valorStr = cols[11] || '0';
      const valor = parseFloat(valorStr.replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;
      
      DIARIAS_DATA.push({
        status: status,
        processo: processo,
        data: dataInicio,
        nome: setor, // using Setor/Processo as identifier since there is no 'Beneficiario'
        motivo: motivo,
        valor: valor
      });
    }
    
    renderizarDiarias();
  } catch (e) {
    console.error('Erro ao carregar diarias:', e);
    document.querySelector('#table-diarias tbody').innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#f87171;">Erro ao carregar dados. Verifique o link e permissões.</td></tr>';
  }
};

function renderizarDiarias() {
  const tbody = document.querySelector('#table-diarias tbody');
  if (!tbody) return;
  
  let html = '';
  let totalGasto = 0;
  let totalPago = 0;
  
  const aba = window._filtroDiariasAba || 'todas';
  
  let filtrados = DIARIAS_DATA;
  if (aba === 'executadas') {
    filtrados = DIARIAS_DATA.filter(d => d.status.toLowerCase() === 'pago');
  }

  filtrados.forEach(d => {
    if(d.status.toLowerCase() !== 'anulação' && d.status.toLowerCase() !== 'anulação') {
      totalGasto += d.valor;
    }
    if (d.status.toLowerCase() === 'pago') {
      totalPago += d.valor;
    }
    
    let cor = '#94a3b8';
    if(d.status.toLowerCase() === 'pago') cor = '#10b981';
    else if(d.status.toLowerCase().includes('anul')) cor = '#f87171';
    else if(d.status.toLowerCase() === 'reserva') cor = '#3b82f6';
    
    html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 16px; font-size:12px;">${d.data}<br><span style="color:${cor}; font-size:10px; font-weight:bold; text-transform:uppercase;">${d.status}</span></td>
      <td style="padding:12px 16px; font-size:12px; font-weight:bold; color:#e2e8f0;">${d.nome}<br><span style="color:#64748b; font-weight:normal; font-size:10px;">Proc: ${d.processo}</span></td>
      <td style="padding:12px 16px; font-size:11px; color:#cbd5e1; max-width:300px; white-space:normal;">${d.motivo}</td>
      <td style="padding:12px 16px; color:${d.status.toLowerCase().includes('anul') ? '#64748b' : '#f87171'}; font-weight:bold; text-align:right;">
        R$ ${d.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}
      </td>
    </tr>`;
  });
  
  if (filtrados.length === 0) {
    html = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">Nenhum registro encontrado para este filtro.</td></tr>';
  }
  
  tbody.innerHTML = html;
  
  // Update totals
  DIARIAS_SALDO_ATUAL = DIARIAS_SALDO_INICIAL - totalGasto;
  
  const saldoEl = document.getElementById('diaria-saldo-total');
  if(saldoEl) {
    saldoEl.innerText = DIARIAS_SALDO_ATUAL.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  }
  
  const pagoEl = document.getElementById('diaria-total-pago');
  if(pagoEl) {
    // Calculando o pago geral, ignorando o filtro atual para o card do painel
    let calcTotalPago = 0;
    DIARIAS_DATA.forEach(d => { if(d.status.toLowerCase() === 'pago') calcTotalPago += d.valor; });
    pagoEl.innerText = calcTotalPago.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  }
}

window.inserirDiaria = function() {
  const nome = document.getElementById('diaria-nome').value;
  const valor = parseFloat(document.getElementById('diaria-valor').value);
  const motivo = document.getElementById('diaria-motivo').value;
  
  if (!nome || !valor || !motivo) {
    alert("Preencha todos os campos!");
    return;
  }
  
  DIARIAS_DATA.push({
    data: new Date().toLocaleDateString('pt-BR'),
    nome: nome,
    motivo: motivo,
    valor: valor
  });
  
  document.getElementById('diaria-nome').value = '';
  document.getElementById('diaria-valor').value = '';
  document.getElementById('diaria-motivo').value = '';
  
  renderizarDiarias();
  if (typeof toast === 'function') toast('Diária registrada e saldo deduzido temporariamente!', 'success');
  else alert('Registrado! (Não salva na nuvem sem backend)');
};

window.gerarRelatorioDiarias = function() {
  if (!window.jspdf) {
    alert("Biblioteca jsPDF não carregada.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(14);
  doc.text("RELATÓRIO DE DIÁRIAS - SEDUC/RO", 14, 15);
  doc.setFontSize(10);
  doc.text("Gerado em: " + new Date().toLocaleString('pt-BR'), 14, 21);
  doc.text("Saldo Atual: " + DIARIAS_SALDO_ATUAL.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 14, 27);
  
  const head = [['Data', 'Beneficiário', 'Motivo', 'Valor']];
  const body = DIARIAS_DATA.map(d => [
    d.data, d.nome, d.motivo, 'R$ ' + d.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})
  ]);
  
  doc.autoTable({
    startY: 35,
    head: head,
    body: body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [14, 165, 233] }
  });
  
  doc.save(`Relatorio_Diarias.pdf`);
};

setTimeout(() => { window.carregarDiariasData(); }, 1000);
