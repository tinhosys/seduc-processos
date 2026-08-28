const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /function renderizarDiarias\(\) \{[\s\S]*?window\.inserirDiaria/m;

const replacement = `function renderizarDiarias() {
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
    
    html += \`<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding:12px 16px; font-size:12px;">\${d.data}<br><span style="color:\${cor}; font-size:10px; font-weight:bold; text-transform:uppercase;">\${d.status}</span></td>
      <td style="padding:12px 16px; font-size:12px; font-weight:bold; color:#e2e8f0;">\${d.nome}<br><span style="color:#64748b; font-weight:normal; font-size:10px;">Proc: \${d.processo}</span></td>
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

window.inserirDiaria`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('diarias.js render patched');
