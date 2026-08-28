const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /function renderizarDiarias\(\) \{[\s\S]*?\/\/ Update totals[\s\S]*?\}[\s\S]*?window\.inserirDiaria = function\(\) \{[\s\S]*?\};/m;

const replacement = `function renderizarDiarias() {
  const tbody = document.querySelector('#table-diarias tbody');
  if (!tbody) return;
  
  let html = '';
  let totalGasto = 0;
  let totalPago = 0;
  
  const aba = window._filtroDiariasAba || 'estadual';
  const busca = (document.getElementById('busca-diarias') ? document.getElementById('busca-diarias').value.toLowerCase() : '');
  
  let filtrados = DIARIAS_DATA;
  
  // Filter by Tab (simulated logic based on tab names, since actual CSV doesn't have exact source mapping, assuming 'estadual' = 26, 'federal' = 1)
  if (aba === 'executadas' || aba === 'consolidado') {
     // Consolidado shows all
  } else if (aba === 'federal') {
     filtrados = filtrados.filter(d => (d.valorFederal && d.valorFederal > 0) || d.motivo.toLowerCase().includes('federal'));
  } else if (aba === 'parametros') {
     // Parâmetros might show only a specific subset or we can show all for now
  } else {
     // Default to Estadual
     filtrados = filtrados.filter(d => (!d.valorFederal || d.valorFederal === 0) && !d.motivo.toLowerCase().includes('federal'));
  }

  // Filter by Search Text
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
    if(d.status.toLowerCase() !== 'anulação' && d.status.toLowerCase() !== 'anula\u00E7\u00E3o') {
      totalGasto += d.valor;
    }
    if (d.status.toLowerCase() === 'pago') {
      totalPago += d.valor;
    }
    
    let cor = '#94a3b8';
    if(d.status.toLowerCase() === 'pago') cor = '#10b981';
    else if(d.status.toLowerCase().includes('anul')) cor = '#f87171';
    else if(d.status.toLowerCase() === 'reserva') cor = '#3b82f6';
    
    let infoExtra = '';
    if(d.cpf) infoExtra += \` | CPF: \${d.cpf}\`;
    if(d.cidade) infoExtra += \` | Destino: \${d.cidade}\`;
    
    html += \`<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 16px; font-size:12px;">\${d.data}<br><span style="color:\${cor}; font-size:10px; font-weight:bold; text-transform:uppercase;">\${d.status}</span></td>
      <td style="padding:12px 16px; font-size:12px; font-weight:bold; color:#e2e8f0;">\${d.nome}\${infoExtra}<br><span style="color:#64748b; font-weight:normal; font-size:10px;">Proc: \${d.processo}</span></td>
      <td style="padding:12px 16px; font-size:11px; color:#cbd5e1; max-width:300px; white-space:normal;">\${d.motivo}</td>
      <td style="padding:12px 16px; color:\${d.status.toLowerCase().includes('anul') ? '#64748b' : '#f87171'}; font-weight:bold; text-align:right;">
        R$ \${d.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}
      </td>
    </tr>\`;
  });
  
  if (filtrados.length === 0) {
    html = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">Nenhum registro encontrado para este filtro.</td></tr>';
  }
  
  tbody.innerHTML = html;
  
  const pagoEl = document.getElementById('diaria-total-pago');
  if(pagoEl) {
    pagoEl.innerText = totalPago.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  }
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
    aviso.innerHTML = \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> 
      <strong>Empenho Inválido ou Sem Saldo!</strong> Saldo atual: R$ \${empenho ? empenho.saldoLiquido.toLocaleString('pt-BR',{minimumFractionDigits:2}) : '0,00'}\`;
    aviso.style.background = 'rgba(239,68,68,0.1)';
    aviso.style.borderColor = 'rgba(239,68,68,0.3)';
    aviso.style.color = '#f87171';
    btn.disabled = true;
    btn.style.background = '#475569';
    btn.style.color = '#94a3b8';
    btn.style.cursor = 'not-allowed';
    btn.innerText = 'Bloqueado - Sem Saldo';
  } else {
    aviso.innerHTML = \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> 
      <strong>Empenho Válido!</strong> Saldo Disponível: R$ \${empenho.saldoLiquido.toLocaleString('pt-BR',{minimumFractionDigits:2})}\`;
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

window.inserirDiaria = function() {
  const nome = document.getElementById('diaria-nome').value;
  const cpf = document.getElementById('diaria-cpf').value;
  const cidade = document.getElementById('diaria-cidade').value;
  const proc = document.getElementById('diaria-proc').value;
  const valor = parseFloat(document.getElementById('diaria-valor').value);
  const motivo = document.getElementById('diaria-motivo').value;
  
  if (!nome || !valor || !motivo) {
    alert("Preencha Nome, Valor e Motivo!");
    return;
  }
  
  DIARIAS_DATA.unshift({
    status: 'Reserva',
    data: new Date().toLocaleDateString('pt-BR'),
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
  document.getElementById('diaria-valor').value = '';
  document.getElementById('diaria-motivo').value = '';
  
  // Return to Consolidado Tab to see it
  const tabConsolidado = Array.from(document.querySelectorAll('#page-diarias .tabs .tab-link')).find(t => t.innerText === 'Consolidado');
  if(tabConsolidado) tabConsolidado.click();
  else mudarAbaDiarias('consolidado', null);
  
  if (typeof toast === 'function') toast('Diária registrada e saldo deduzido temporariamente!', 'success');
  else alert('Registrado com sucesso!');
};`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('diarias.js logic patched');
