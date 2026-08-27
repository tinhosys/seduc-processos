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
    
    const lines = csv.split('\n');
    DIARIAS_DATA = [];
    
    // Simplistic parsing. Assuming the spreadsheet has Date, Name, Reason, Value
    for (let i = 1; i < lines.length; i++) {
      let l = lines[i];
      if (!l || l.trim() === '') continue;
      const cols = l.split('","').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 4) {
         DIARIAS_DATA.push({
           data: cols[0],
           nome: cols[1],
           motivo: cols[2],
           valor: parseFloat(cols[3].replace(/\./g, '').replace(',', '.')) || 0
         });
      }
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
  
  DIARIAS_DATA.forEach(d => {
    totalGasto += d.valor;
    html += `<tr>
      <td>${d.data}</td>
      <td>${d.nome}</td>
      <td>${d.motivo}</td>
      <td style="color:#f87171; font-weight:bold;">- R$ ${d.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
    </tr>`;
  });
  
  if (DIARIAS_DATA.length === 0) {
    html = '<tr><td colspan="4" style="text-align:center; padding:20px;">Nenhum registro encontrado.</td></tr>';
  }
  
  tbody.innerHTML = html;
  DIARIAS_SALDO_ATUAL = DIARIAS_SALDO_INICIAL - totalGasto;
  
  const saldoEl = document.getElementById('diaria-saldo-total');
  if(saldoEl) {
    saldoEl.innerText = DIARIAS_SALDO_ATUAL.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
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
