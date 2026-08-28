const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /function renderizarDiarias\(\) \{[\s\S]*?window\.verificarSaldoDiaria/m;

const replacement = `window.popularSelectsDiarias = function() {
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
  const b = document.getElementById('busca-diarias'); if(b) b.value = '';
  const m = document.getElementById('diaria-filtro-mes'); if(m) m.value = 'Todos';
  const s = document.getElementById('diaria-filtro-status'); if(s) s.value = 'Todos';
  const st = document.getElementById('diaria-filtro-setor'); if(st) st.value = 'Todos';
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
    if(d.status.toLowerCase() !== 'anulação' && d.status.toLowerCase() !== 'anula\u00E7\u00E3o') {
      totalGasto += d.valor;
    }
    // O Valor da Busca consolida todos os registros do filtro
    totalPago += d.valor;
    
    let cor = '#94a3b8';
    if(d.status.toLowerCase() === 'pago') cor = '#10b981';
    else if(d.status.toLowerCase().includes('anul') || d.status.toLowerCase().includes('encerra')) cor = '#f87171';
    else if(d.status.toLowerCase() === 'reserva') cor = '#3b82f6';
    
    let infoExtra = '';
    if(d.cpf) infoExtra += \` | CPF: \${d.cpf}\`;
    if(d.cidade) infoExtra += \` | Destino: \${d.cidade}\`;
    
    html += \`<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 16px; font-size:12px;">\${d.data}<br><span style="color:\${cor}; font-size:10px; font-weight:bold; text-transform:uppercase;">\${d.status}</span></td>
      <td style="padding:12px 16px; font-size:12px; font-weight:bold; color:#e2e8f0;">\${d.nome}\${infoExtra}<br><span style="color:#64748b; font-weight:normal; font-size:10px;">Proc: \${d.processo}</span></td>
      <td style="padding:12px 16px; font-size:11px; color:#cbd5e1; max-width:300px; white-space:normal;">\${d.motivo}</td>
      <td style="padding:12px 16px; color:\${d.status.toLowerCase().includes('anul') || d.status.toLowerCase().includes('encerra') ? '#64748b' : '#f87171'}; font-weight:bold; text-align:right;">
        R$ \${d.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}
      </td>
    </tr>\`;
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

window.verificarSaldoDiaria`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('diarias.js logic v3 patched');
