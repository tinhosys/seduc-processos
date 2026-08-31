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
      const mes = cols[13] ? cols[13].trim() : '';
      
      let dateObj = null;
      if (dataInicio) {
        const parts = dataInicio.split('/');
        if (parts.length === 3) {
           dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }
      
      DIARIAS_DATA.push({
        status: status,
        processo: processo,
        data: dataInicio,
        nome: setor,
        motivo: motivo,
        valor: valor,
        mes: mes,
        dateObj: dateObj,
        setorOriginal: setor
      });
    }
    
    renderizarDiarias();
  } catch (e) {
    console.error('Erro ao carregar diarias:', e);
    document.querySelector('#table-diarias tbody').innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#f87171;">Erro ao carregar dados. Verifique o link e permissões.</td></tr>';
  }
};

window.popularSelectsDiarias = function() {
  const selMes = document.getElementById('diaria-filtro-mes');
  const selSetor = document.getElementById('diaria-filtro-setor');
  if(!selMes || !selSetor || DIARIAS_DATA.length === 0) return;
  
  // Mês
  if (selMes.options.length <= 1) {
    const meses = [...new Set(DIARIAS_DATA.map(d => d.mes).filter(m => m && m.trim() !== ''))].sort();
    meses.forEach(m => {
      let o = document.createElement('option'); o.value = m; o.text = m; selMes.appendChild(o);
    });
  }
  
  // Setor
  if (selSetor.options.length <= 1) {
    const setores = [...new Set(DIARIAS_DATA.map(d => d.setorOriginal).filter(s => s && s.trim() !== ''))].sort();
    setores.forEach(s => {
      let o = document.createElement('option'); o.value = s; o.text = s; selSetor.appendChild(o);
    });
  }
};

window.limparFiltrosDiarias = function() {
  const ids = ['busca-diarias', 'diaria-filtro-data-ini', 'diaria-filtro-data-fim'];
  ids.forEach(id => { const e = document.getElementById(id); if(e) e.value = ''; });
  const idsSel = ['diaria-filtro-mes', 'diaria-filtro-status', 'diaria-filtro-setor'];
  idsSel.forEach(id => { const e = document.getElementById(id); if(e) e.value = 'Todos'; });
  renderizarDiarias();
};

function renderizarDiarias() {
  const tbody = document.querySelector('#table-diarias tbody');
  if (!tbody) return;
  
  // Populate dropdowns once
  popularSelectsDiarias();
  
  let html = '';
  let totalGasto = 0;
  let totalPago = 0;
  
  const aba = window._filtroDiariasAba || 'estadual';
  const busca = (document.getElementById('busca-diarias') ? document.getElementById('busca-diarias').value.toLowerCase() : '');
  
  const vMes = document.getElementById('diaria-filtro-mes') ? document.getElementById('diaria-filtro-mes').value : 'Todos';
  const vStatus = document.getElementById('diaria-filtro-status') ? document.getElementById('diaria-filtro-status').value : 'Todos';
  const vSetor = document.getElementById('diaria-filtro-setor') ? document.getElementById('diaria-filtro-setor').value : 'Todos';
  const vDataIni = document.getElementById('diaria-filtro-data-ini') ? document.getElementById('diaria-filtro-data-ini').value : '';
  const vDataFim = document.getElementById('diaria-filtro-data-fim') ? document.getElementById('diaria-filtro-data-fim').value : '';
  
  let filtrados = DIARIAS_DATA;
  
  // Aba Filter
  if (aba === 'executadas' || aba === 'consolidado') {
     // all
  } else if (aba === 'federal') {
     filtrados = filtrados.filter(d => (d.valorFederal && d.valorFederal > 0) || d.motivo.toLowerCase().includes('federal'));
  } else if (aba === 'parametros') {
     // all for now
  } else {
     // Default Estadual
     filtrados = filtrados.filter(d => (!d.valorFederal || d.valorFederal === 0) && !d.motivo.toLowerCase().includes('federal'));
  }
  
  // Select Filters
  if (vMes !== 'Todos') {
    filtrados = filtrados.filter(d => d.mes === vMes);
  }
  if (vSetor !== 'Todos') {
    filtrados = filtrados.filter(d => d.setorOriginal === vSetor);
  }
  if (vStatus !== 'Todos') {
    if (vStatus === 'Pago') filtrados = filtrados.filter(d => d.status.toLowerCase() === 'pago');
    else if (vStatus === 'Reserva') filtrados = filtrados.filter(d => d.status.toLowerCase() === 'reserva');
    else if (vStatus === 'Anulação') filtrados = filtrados.filter(d => d.status.toLowerCase().includes('anula') || d.status.toLowerCase().includes('encerra'));
  }

  // Date Search
  if (vDataIni) {
    const dtIni = new Date(vDataIni + 'T00:00:00');
    filtrados = filtrados.filter(d => d.dateObj && d.dateObj >= dtIni);
  }
  if (vDataFim) {
    const dtFim = new Date(vDataFim + 'T23:59:59');
    filtrados = filtrados.filter(d => d.dateObj && d.dateObj <= dtFim);
  }

  // Text Search
  if (busca) {
    filtrados = filtrados.filter(d => 
      (d.nome && d.nome.toLowerCase().includes(busca)) || 
      (d.motivo && d.motivo.toLowerCase().includes(busca)) || 
      (d.processo && d.processo.toLowerCase().includes(busca)) ||
      (d.cpf && d.cpf.includes(busca)) ||
      (d.cidade && d.cidade.toLowerCase().includes(busca))
    );
  }

  filtrados.forEach(d => {
    if(d.status.toLowerCase() !== 'anulação' && d.status.toLowerCase() !== 'anulação') {
      totalGasto += d.valor;
    }
    // O Valor da Busca consolida todos os registros do filtro
    totalPago += d.valor;
    
    let cor = '#94a3b8';
    if(d.status.toLowerCase() === 'pago') cor = '#10b981';
    else if(d.status.toLowerCase().includes('anul') || d.status.toLowerCase().includes('encerra')) cor = '#f87171';
    else if(d.status.toLowerCase() === 'reserva') cor = '#3b82f6';
    
    let infoExtra = '';
    if(d.cpf) infoExtra += ` | CPF: ${d.cpf}`;
    if(d.cidade) infoExtra += ` | Destino: ${d.cidade}`;
    
    html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 16px; font-size:12px;">${d.data}<br><span style="color:${cor}; font-size:10px; font-weight:bold; text-transform:uppercase;">${d.status}</span></td>
      <td style="padding:12px 16px; font-size:12px; font-weight:bold; color:#e2e8f0;">
          ${d.nome}${infoExtra}<br>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <span style="color:#a3e635; font-weight:bold; font-size:11px;">${d.processo}</span>
            <button onclick="navigator.clipboard.writeText('${d.processo}'); typeof showToast === 'function' ? showToast('Processo copiado!', 'success') : alert('Copiado');" style="padding:4px 8px; font-size:10px; display:flex; align-items:center; justify-content:center; gap:4px; border:none; border-radius:4px; background:#3b82f6; color:#ffffff; cursor:pointer;" title="Copiar Número">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar
            </button>
            <a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI" target="_blank" style="padding:2px 8px; height:20px; display:flex; align-items:center; justify-content:center; background:white; border-radius:4px; text-decoration:none;" title="Acessar SEI">
              <img src="img/logo-sei.png" style="height:14px; object-fit:contain" alt="SEI">
            </a>
          </div>
        </td>
      <td style="padding:12px 16px; font-size:11px; color:#cbd5e1; max-width:300px; white-space:normal;">${d.motivo}</td>
      <td style="padding:12px 16px; color:${d.status.toLowerCase().includes('anul') || d.status.toLowerCase().includes('encerra') ? '#64748b' : '#f87171'}; font-weight:bold; text-align:right;">
        R$ ${d.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}
      </td>
    </tr>`;
  });
  
  if (filtrados.length === 0) {
    html = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">Nenhum registro encontrado para este filtro.</td></tr>';
  }
  
  tbody.innerHTML = html;
  
  const pagoEl = document.getElementById('diaria-total-pago');
  if(pagoEl) pagoEl.innerText = totalPago.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  
  const qtdEl = document.getElementById('diaria-qtd-listadas');
  if(qtdEl) qtdEl.innerText = filtrados.length + ' diárias listadas';
}

window.verificarSaldoDiaria = function() {
  const pa = document.getElementById('diaria-pa').value;
  const fonte = document.getElementById('diaria-fonte').value;
  const nd = document.getElementById('diaria-nd').value;
  const aviso = document.getElementById('diaria-saldo-aviso');
  const btn = document.getElementById('btn-registrar-diaria');
  
  if(!pa || !fonte || !nd) {
    aviso.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> Selecione os parâmetros acima para verificar a disponibilidade de saldo.';
    aviso.style.background = 'rgba(59,130,246,0.1)';
    aviso.style.borderColor = 'rgba(59,130,246,0.3)';
    aviso.style.color = '#60a5fa';
    btn.disabled = true;
    btn.style.background = '#475569';
    btn.style.color = '#94a3b8';
    btn.style.cursor = 'not-allowed';
    btn.innerText = 'Bloqueado - Verifique o Saldo';
    return;
  }
  
  // Find in ORCAMENTO_DATA
  if (typeof ORCAMENTO_DATA === 'undefined') {
    aviso.innerHTML = 'Dados do Orçamento não carregados. Aguarde...';
    return;
  }
  
  const empenho = ORCAMENTO_DATA.find(o => o.pa === pa && o.fonte === fonte && o.despesa === nd);
  
  if (!empenho || empenho.saldoLiquido <= 0) {
    aviso.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> 
      <strong>Empenho Inválido ou Sem Saldo!</strong> Saldo atual: R$ ${empenho ? empenho.saldoLiquido.toLocaleString('pt-BR',{minimumFractionDigits:2}) : '0,00'}`;
    aviso.style.background = 'rgba(239,68,68,0.1)';
    aviso.style.borderColor = 'rgba(239,68,68,0.3)';
    aviso.style.color = '#f87171';
    btn.disabled = true;
    btn.style.background = '#475569';
    btn.style.color = '#94a3b8';
    btn.style.cursor = 'not-allowed';
    btn.innerText = 'Bloqueado - Sem Saldo';
  } else {
    aviso.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> 
      <strong>Empenho Válido!</strong> Saldo Disponível: R$ ${empenho.saldoLiquido.toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
    aviso.style.background = 'rgba(16,185,129,0.1)';
    aviso.style.borderColor = 'rgba(16,185,129,0.3)';
    aviso.style.color = '#34d399';
    btn.disabled = false;
    btn.style.background = '#3b82f6';
    btn.style.color = 'white';
    btn.style.cursor = 'pointer';
    btn.innerText = 'Registrar e Subtrair Saldo';
  }
};

window.popularSelectsFluxo = function() {
  if (typeof ORCAMENTO_DATA === 'undefined') return;
  const selectPA = document.getElementById('diaria-pa');
  const selectFonte = document.getElementById('diaria-fonte');
  
  if(selectPA && selectPA.options.length <= 1) {
    const pas = [...new Set(ORCAMENTO_DATA.map(o => o.pa))];
    pas.forEach(p => {
      let opt = document.createElement('option');
      opt.value = p; opt.text = p + (typeof PA_DESCRICAO !== 'undefined' && PA_DESCRICAO[p] ? ' - ' + PA_DESCRICAO[p] : '');
      selectPA.appendChild(opt);
    });
  }
  
  if(selectFonte && selectFonte.options.length <= 1) {
    const fontes = [...new Set(ORCAMENTO_DATA.map(o => o.fonte))];
    fontes.forEach(f => {
      let opt = document.createElement('option');
      opt.value = f; opt.text = f;
      selectFonte.appendChild(opt);
    });
  }
};


  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if(cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for(let i=1; i<=9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if((resto === 10) || (resto === 11)) resto = 0;
    if(resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for(let i=1; i<=10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if((resto === 10) || (resto === 11)) resto = 0;
    if(resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }

window.inserirDiaria = function() {

  const nome = document.getElementById('diaria-nome').value;
  const cpf = document.getElementById('diaria-cpf').value;
  const cidade = document.getElementById('diaria-cidade').value;
  const proc = document.getElementById('diaria-proc').value;
  const qtde = parseFloat(document.getElementById('diaria-qtde').value) || 0;
  const unit = parseFloat(document.getElementById('diaria-valor-unit').value) || 0;
  const valor = qtde * unit;
  const motivo = document.getElementById('diaria-motivo').value;
  const dataSaida = document.getElementById('diaria-data-saida').value;
  
  if (!validarCPF(cpf)) {
    alert("CPF Inválido! Verifique o número digitado.");
    return;
  }
  
  if (!nome || !valor || !motivo || !cpf || !cidade) {
    alert("Preencha todos os campos obrigatórios (Nome, CPF, Cidade, Motivo, Qtde e Valor)!");
    return;
  }
  
  DIARIAS_DATA.unshift({
    status: 'Reserva',
    data: dataSaida ? dataSaida.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR'),
    nome: nome,
    cpf: cpf,
    cidade: cidade,
    processo: proc,
    motivo: motivo,
    valor: valor,
    valorFederal: 0
  });
  
  document.getElementById('diaria-nome').value = '';
  document.getElementById('diaria-cpf').value = '';
  document.getElementById('diaria-cidade').value = '';
  document.getElementById('diaria-proc').value = '';
  document.getElementById('diaria-qtde').value = '';
  document.getElementById('diaria-valor-unit').value = '';
  document.getElementById('diaria-valor-total').value = '';
  document.getElementById('diaria-motivo').value = '';
  document.getElementById('diaria-data-saida').value = '';
  
  // Create simple report PDF
  if (window.jspdf) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Emissão de Diária', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiário: ' + nome, 14, 30);
    doc.text('CPF: ' + cpf, 14, 37);
    doc.text('Processo SEI: ' + proc, 14, 44);
    doc.text('Cidade de Destino: ' + cidade, 14, 51);
    doc.text('Data de Saída: ' + (dataSaida ? dataSaida.split('-').reverse().join('/') : 'N/A'), 14, 58);
    doc.text('Motivo da Viagem: ' + motivo, 14, 65, {maxWidth: 180});
    
    doc.setFont('helvetica', 'bold');
    doc.text('Quantidade de Diárias: ' + qtde.toFixed(1), 14, 85);
    doc.text('Valor Unitário: R$ ' + unit.toLocaleString('pt-BR', {minimumFractionDigits:2}), 14, 92);
    doc.text('Valor Total: R$ ' + valor.toLocaleString('pt-BR', {minimumFractionDigits:2}), 14, 99);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('* Este documento comprova o registro local da diária.', 14, 120);
    doc.text('* Para gravar na planilha oficial do Google Sheets, um script de integração backend é necessário.', 14, 127);
    
    window.open(doc.output('bloburl'), '_blank');
  }

  const tabConsolidado = Array.from(document.querySelectorAll('#page-diarias .tabs .tab-link')).find(t => t.innerText === 'Consolidado');
  if(tabConsolidado) tabConsolidado.click();
  else mudarAbaDiarias('consolidado', null);
  
  if (typeof toast === 'function') toast('Diária registrada localmente!', 'success');
  else alert('Registrado com sucesso!');
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

setTimeout(() => popularSelectsFluxo(), 3000);
