let DIARIAS_DATA = [];
let DIARIAS_SALDO_INICIAL = 150000; // Fake fallback
let DIARIAS_SALDO_ATUAL = 150000;

﻿let CONSOL_DATA_SETORES = [];
let CONSOL_DATA_NOTAS = [];
let PARAM_SETORES = [];
let PARAM_STATUS = [];

window.carregarDiariasData = async function() {
  try {
    const urlBase = 'https://docs.google.com/spreadsheets/d/1WunsuLAAIUAAo1q65qmSVMIH0qLJu_TjDsb_u9LO304/gviz/tq?tqx=out:csv&gid=';
    
    const [resEst, resFed, resConsol, resParam] = await Promise.all([
      fetch(urlBase + '807660383'),
      fetch(urlBase + '1893936129'),
      fetch(urlBase + '325984433'),
      fetch(urlBase + '24037202')
    ]);
    
    if(!resEst.ok) throw new Error('Falha ao carregar');
    
    const parseCSV = (str) => {
      let result = [];
      let row = [];
      let inQuotes = false;
      let val = '';
      for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (inQuotes) {
          if (char === '"') {
            if (i + 1 < str.length && str[i + 1] === '"') { val += '"'; i++; }
            else { inQuotes = false; }
          } else { val += char; }
        } else {
          if (char === '"') { inQuotes = true; }
          else if (char === ',') { row.push(val); val = ''; }
          else if (char === '\n' || char === '\r') {
            if (char === '\r' && i + 1 < str.length && str[i + 1] === '\n') i++;
            row.push(val); result.push(row); row = []; val = '';
          } else { val += char; }
        }
      }
      if (val || row.length > 0) { row.push(val); result.push(row); }
      return result;
    };

    DIARIAS_DATA = [];
    
    // Parse Estadual
    const rowsEst = parseCSV(await resEst.text());
    for (let i = 1; i < rowsEst.length; i++) {
      let cols = rowsEst[i];
      if (!cols || cols.length < 12) continue;
      const status = cols[12] ? cols[12].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const dataInicio = cols[3] ? cols[3].trim() : '';
      const setor = cols[5] ? cols[5].trim() : '';
      const motivo = cols[6] ? cols[6].trim().replace(/\n/g, ' ') : '';
      const valorStr = cols[11] || '0';
      const valor = parseFloat(valorStr.replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;
      const mes = cols[13] ? cols[13].trim() : '';
      const nota = ''; // No NE in Estadual
      DIARIAS_DATA.push({ origem: 'estadual', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor, nota });
    }

    // Parse Federal
    const rowsFed = parseCSV(await resFed.text());
    for (let i = 1; i < rowsFed.length; i++) {
      let cols = rowsFed[i];
      if (!cols || cols.length < 11) continue;
      const status = cols[11] ? cols[11].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const nota = cols[3] ? cols[3].trim() : '';
      const dataInicio = cols[4] ? cols[4].trim() : '';
      const setor = cols[6] ? cols[6].trim() : '';
      const motivo = cols[7] ? cols[7].trim().replace(/\n/g, ' ') : '';
      const valorStr = cols[10] || '0';
      const valor = parseFloat(valorStr.replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;
      const mes = cols[12] ? cols[12].trim() : '';
      DIARIAS_DATA.push({ origem: 'federal', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor, nota });
    }

    // Parse Consolidado
    CONSOL_DATA_SETORES = [];
    CONSOL_DATA_NOTAS = [];
    const rowsConsol = parseCSV(await resConsol.text());
    for (let i = 1; i < rowsConsol.length; i++) {
      let cols = rowsConsol[i];
      if (!cols || cols.length < 1) continue;
      if (cols[0] && cols[0].trim()) {
        CONSOL_DATA_SETORES.push({
          setor: cols[0],
          dentroAnulacao: cols[1] || 'R$ 0,00',
          dentroPago: cols[2] || 'R$ 0,00',
          dentroReserva: cols[3] || 'R$ 0,00',
          foraPago: cols[4] || 'R$ 0,00',
          foraReserva: cols[5] || 'R$ 0,00'
        });
      }
      if (cols[6] && cols[6].trim() && i <= 5) {
        CONSOL_DATA_NOTAS.push({
          nome: cols[6],
          empenhado: cols[7] || '',
          reforco: cols[8] || '',
          anulacao: cols[9] || '',
          valorAtualizado: cols[10] || '',
          pago: cols[11] || '',
          reserva: cols[12] || '',
          saldoLiquido: cols[13] || ''
        });
      }
    }

    // Parse Parâmetros
    PARAM_SETORES = [];
    PARAM_STATUS = [];
    const rowsParam = parseCSV(await resParam.text());
    for (let i = 1; i < rowsParam.length; i++) {
      let cols = rowsParam[i];
      if (cols && cols[0]) PARAM_SETORES.push(cols[0].trim());
      if (cols && cols[4]) PARAM_STATUS.push(cols[4].trim());
    }
    PARAM_SETORES = [...new Set(PARAM_SETORES)].filter(x => x && x !== 'Setor');
    PARAM_STATUS = [...new Set(PARAM_STATUS)].filter(x => x && x !== 'Status');

    popularSelectsDiarias();
    renderizarDiarias();
    if(typeof window.renderConsolidadoDiarias === 'function') window.renderConsolidadoDiarias();

  } catch (e) {
    console.error(e);
    document.querySelector('#table-diarias tbody').innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#f87171;">Erro ao carregar dados.</td></tr>';
  }
};

window.popularSelectsDiarias = function() {
  const fill = (id, arr) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="Todos">Todos</option>' + arr.map(a => `<option value="${a}">${a}</option>`).join('');
  };
  fill('diaria-filtro-status', [...new Set(DIARIAS_DATA.map(d => d.status))].filter(x => x).sort());
  fill('diaria-filtro-setor', PARAM_SETORES.length > 0 ? PARAM_SETORES : [...new Set(DIARIAS_DATA.map(d => d.setorOriginal))].filter(x => x));
    fill('diaria-filtro-nota', [...new Set(DIARIAS_DATA.map(d => d.nota))].filter(x => x));
  fill('diaria-filtro-mes', [...new Set(DIARIAS_DATA.map(d => d.mes))].filter(x => x));
};

function renderizarDiarias() {
  const tbody = document.querySelector('#table-diarias tbody');
  if (!tbody) return;
  
  let totalGasto = 0;
  let totalPago = 0;
  
  const aba = window._filtroDiariasAba || 'estadual';

    // Toggle display of Nota Empenho based on tab
    const notaEmpenhoEl = document.getElementById('diaria-filtro-nota');
    if (notaEmpenhoEl && notaEmpenhoEl.parentElement) {
      notaEmpenhoEl.parentElement.style.display = (aba === 'estadual') ? 'none' : 'block';
    }

    // Dynamic Options Update for Status based on active tab
    const statusEl = document.getElementById('diaria-filtro-status');
    if (statusEl) {
       const oldVal = statusEl.value;
       const filteredByTab = DIARIAS_DATA.filter(d => (aba === 'estadual' ? d.origem === 'estadual' : d.origem === 'federal'));
       const uniqueStatuses = [...new Set(filteredByTab.map(d => d.status))].filter(x => x).sort();
       statusEl.innerHTML = '<option value="Todos">Todos</option>' + uniqueStatuses.map(a => `<option value="${a}">${a}</option>`).join('');
       if(uniqueStatuses.includes(oldVal)) statusEl.value = oldVal;
    }

  const busca = (document.getElementById('busca-diarias') ? document.getElementById('busca-diarias').value.toLowerCase() : '');
  
  const vMes = document.getElementById('diaria-filtro-mes') ? document.getElementById('diaria-filtro-mes').value : 'Todos';
  const vStatus = document.getElementById('diaria-filtro-status') ? document.getElementById('diaria-filtro-status').value : 'Todos';
  const vSetor = document.getElementById('diaria-filtro-setor') ? document.getElementById('diaria-filtro-setor').value : 'Todos';
    const vNota = document.getElementById('diaria-filtro-nota') ? document.getElementById('diaria-filtro-nota').value : 'Todos';
  const vDataIni = document.getElementById('diaria-filtro-data-ini') ? document.getElementById('diaria-filtro-data-ini').value : '';
  const vDataFim = document.getElementById('diaria-filtro-data-fim') ? document.getElementById('diaria-filtro-data-fim').value : '';
  
  let filtrados = DIARIAS_DATA;
  
  // Aba Filter
  if (aba === 'federal') {
     filtrados = filtrados.filter(d => d.origem === 'federal');
  } else if (aba === 'estadual') {
     // Default Estadual
     filtrados = filtrados.filter(d => d.origem === 'estadual');
  }

  // Text search
  if (busca) {
    filtrados = filtrados.filter(d => 
      (d.nome && d.nome.toLowerCase().includes(busca)) ||
      (d.motivo && d.motivo.toLowerCase().includes(busca)) ||
      (d.processo && d.processo.toLowerCase().includes(busca))
    );
  }
  
  // Outros filtros
  if (vMes !== 'Todos') filtrados = filtrados.filter(d => d.mes === vMes);
  if (vStatus !== 'Todos') filtrados = filtrados.filter(d => d.status === vStatus);
  if (vSetor !== 'Todos') filtrados = filtrados.filter(d => d.setorOriginal === vSetor);
    if (vNota !== 'Todos') filtrados = filtrados.filter(d => d.nota === vNota);
  
  // Date filter
  if (vDataIni || vDataFim) {
    let dIni = null;
    let dFim = null;
    if (vDataIni) {
       const p = vDataIni.split('-');
       if(p.length===3) dIni = new Date(p[0], p[1]-1, p[2]);
    }
    if (vDataFim) {
       const p = vDataFim.split('-');
       if(p.length===3) dFim = new Date(p[0], p[1]-1, p[2]);
    }
    
    filtrados = filtrados.filter(d => {
      if (!d.dateObj) return true;
      if (dIni && d.dateObj < dIni) return false;
      if (dFim && d.dateObj > dFim) return false;
      return true;
    });
  }

  // Somatórias
  filtrados.forEach(d => {
    totalGasto += d.valor;
    if (d.status.toLowerCase().includes('pago')) totalPago += d.valor;
  });
  
  if (document.getElementById('diaria-total-pago')) {
     document.getElementById('diaria-total-pago').innerText = totalGasto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  }
  if (document.getElementById('diaria-qtd-listadas')) {
     document.getElementById('diaria-qtd-listadas').innerText = filtrados.length + ' diárias listadas';
  }
  
  // Render html
  let html = '';
  if (filtrados.length === 0) {
    html = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">Nenhum registro encontrado para este filtro.</td></tr>';
  } else {
    filtrados.forEach(d => {
      let cor = '#3b82f6';
      let stLow = (d.status || '').toLowerCase();
      if(stLow.includes('pago')) cor = '#10b981';
      if(stLow.includes('anula') || stLow.includes('encerra')) cor = '#f87171';
      
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
        <td style="padding:12px 16px; color:${stLow.includes('anul') || stLow.includes('encerra') ? '#64748b' : '#f87171'}; font-weight:bold; text-align:right;">
          R$ ${d.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}
        </td>
      </tr>`;
    });
  }
  
  tbody.innerHTML = html;
}

window.renderConsolidadoDiarias = function() {
  const container = document.getElementById('diarias-tab-consolidado');
  if(!container) return;
  
  let html = `
    <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:20px;">
      
      <div style="flex:2; min-width:400px; background:#1e293b; border-radius:12px; overflow:hidden; border:1px solid #334155;">
        <div style="padding:15px 20px; background:linear-gradient(135deg,#0f172a,#1e293b); border-bottom:1px solid rgba(255,255,255,0.05);">
          <h4 style="margin:0; color:#f8fafc; font-size:14px;">SETORES (DENTRO E FORA DO ESTADO)</h4>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; text-align:right; font-size:12px;">
            <thead style="background:rgba(255,255,255,0.02);">
              <tr>
                <th style="padding:12px; color:#64748b; font-weight:600; text-align:left; border-bottom:1px solid #334155;">Setor</th>
                <th style="padding:12px; color:#64748b; font-weight:600; border-bottom:1px solid #334155;">Anulação (Dentro)</th>
                <th style="padding:12px; color:#64748b; font-weight:600; border-bottom:1px solid #334155;">Pago (Dentro)</th>
                <th style="padding:12px; color:#64748b; font-weight:600; border-bottom:1px solid #334155;">Reserva (Dentro)</th>
                <th style="padding:12px; color:#64748b; font-weight:600; border-bottom:1px solid #334155;">Pago (Fora)</th>
                <th style="padding:12px; color:#64748b; font-weight:600; border-bottom:1px solid #334155;">Reserva (Fora)</th>
              </tr>
            </thead>
            <tbody>
  `;
  
  CONSOL_DATA_SETORES.forEach(s => {
    html += `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.02); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                <td style="padding:12px; color:#e2e8f0; font-weight:bold; text-align:left;">${s.setor}</td>
                <td style="padding:12px; color:#f87171;">${s.dentroAnulacao}</td>
                <td style="padding:12px; color:#10b981;">${s.dentroPago}</td>
                <td style="padding:12px; color:#cbd5e1;">${s.dentroReserva}</td>
                <td style="padding:12px; color:#10b981;">${s.foraPago}</td>
                <td style="padding:12px; color:#cbd5e1;">${s.foraReserva}</td>
              </tr>
    `;
  });
  
  html += `
            </tbody>
          </table>
        </div>
      </div>
      
      <div style="flex:1; min-width:300px; background:#1e293b; border-radius:12px; overflow:hidden; border:1px solid #334155;">
        <div style="padding:15px 20px; background:linear-gradient(135deg,#0f172a,#1e293b); border-bottom:1px solid rgba(255,255,255,0.05);">
          <h4 style="margin:0; color:#f8fafc; font-size:14px;">CONTROLE DAS NOTAS DE EMPENHO</h4>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; text-align:right; font-size:12px;">
            <thead style="background:rgba(255,255,255,0.02);">
              <tr>
                <th style="padding:12px; color:#64748b; font-weight:600; text-align:left; border-bottom:1px solid #334155;">Nota</th>
                <th style="padding:12px; color:#64748b; font-weight:600; border-bottom:1px solid #334155;">Empenhado</th>
                <th style="padding:12px; color:#64748b; font-weight:600; border-bottom:1px solid #334155;">Saldo Liq.</th>
              </tr>
            </thead>
            <tbody>
  `;
  
  const formatMoeda = (val) => {
      if (!val) return 'R$ 0,00';
      if (val.toString().includes('R$')) return val;
      let num = parseFloat(val.toString().replace(/\./g, '').replace(',', '.'));
      if (isNaN(num)) return val;
      return num.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    };
    CONSOL_DATA_NOTAS.forEach(n => {
    let bg = 'transparent';
    if(n.nome.toUpperCase().includes('TOTAL')) bg = 'rgba(59,130,246,0.1)';
    html += `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.02); background:${bg};">
                <td style="padding:12px; color:#e2e8f0; font-weight:bold; text-align:left;">${n.nome}</td>
                <td style="padding:12px; color:#cbd5e1;">${formatMoeda(n.empenhado)}</td>
                <td style="padding:12px; color:#3b82f6; font-weight:bold;">${formatMoeda(n.saldoLiquido)}</td>
              </tr>
    `;
  });
  
  html += `
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  `;
  container.innerHTML = html;
};



window.limparFiltrosDiarias = function() {
  const ids = ['busca-diarias', 'diaria-filtro-data-ini', 'diaria-filtro-data-fim'];
  ids.forEach(id => { const e = document.getElementById(id); if(e) e.value = ''; });
  const idsSel = ['diaria-filtro-mes', 'diaria-filtro-status', 'diaria-filtro-setor', 'diaria-filtro-nota'];
  idsSel.forEach(id => { const e = document.getElementById(id); if(e) e.value = 'Todos'; });
  renderizarDiarias();
};

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
    
    
    window.open(doc.output('bloburl'), '_blank');
  }

  const tabConsolidado = Array.from(document.querySelectorAll('#page-diarias .tabs .tab-link')).find(t => t.innerText === 'Consolidado');
  if(tabConsolidado) tabConsolidado.click();
  else mudarAbaDiarias('consolidado', null);
  
  if (typeof toast === 'function') toast('Diária registrada localmente!', 'success');
  else alert('Registrado com sucesso!');
};

window.gerarRelatorioDiarias = function() {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para visualizar o relatório de impressão.');
    return;
  }

  const aba = window._filtroDiariasAba || 'estadual';
  const agora = new Date();
  const dataHora = agora.toLocaleDateString('pt-BR') + ', ' + agora.toLocaleTimeString('pt-BR');
  const gerencia = 'CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS';

  let title = 'RELATÓRIO DE DIÁRIAS - ' + (aba === 'federal' ? 'RECURSO FEDERAL' : (aba === 'consolidado' ? 'CONSOLIDADO ORÇAMENTÁRIO' : 'EXECUÇÁO ORÇAMENTÁRIA ESTADUAL'));
  let contentHtml = '';

  if (aba === 'consolidado') {
    // Relatório Consolidado
    let setoresHtml = '';
    if (typeof CONSOL_DATA_SETORES !== 'undefined' && CONSOL_DATA_SETORES && CONSOL_DATA_SETORES.length > 0) {
      setoresHtml = CONSOL_DATA_SETORES.map(s => `
        <tr>
          <td class="text-left" style="font-weight:600;">${s.setor}</td>
          <td class="text-right" style="color:#ef4444;">${s.dentroAnulacao}</td>
          <td class="text-right" style="color:#10b981; font-weight:bold;">${s.dentroPago}</td>
          <td class="text-right" style="color:#f59e0b;">${s.dentroReserva}</td>
          <td class="text-right" style="color:#10b981; font-weight:bold;">${s.foraPago}</td>
          <td class="text-right" style="color:#f59e0b;">${s.foraReserva}</td>
        </tr>
      `).join('');
    }

    let notasHtml = '';
    if (typeof CONSOL_DATA_NOTAS !== 'undefined' && CONSOL_DATA_NOTAS && CONSOL_DATA_NOTAS.length > 0) {
      notasHtml = CONSOL_DATA_NOTAS.map(n => `
        <tr>
          <td class="text-left" style="font-weight:bold; color:#1e3a8a;">${n.nome}</td>
          <td class="text-right">${n.empenhado}</td>
          <td class="text-right">${n.reforco}</td>
          <td class="text-right" style="color:#ef4444;">${n.anulacao}</td>
          <td class="text-right" style="font-weight:bold;">${n.valorAtualizado}</td>
          <td class="text-right" style="color:#10b981; font-weight:bold;">${n.pago}</td>
          <td class="text-right" style="color:#f59e0b;">${n.reserva}</td>
          <td class="text-right" style="font-weight:bold; color:#0284c7;">${n.saldoLiquido}</td>
        </tr>
      `).join('');
    }

    contentHtml = `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:10pt; color:#1e3a8a; margin:0 0 6px 0; text-transform:uppercase;">1. Detalhamento por Setor (Dentro e Fora do Estado)</h3>
        <table class="striped">
          <thead>
            <tr>
              <th style="text-align:left;">Setor</th>
              <th style="text-align:right;">Anulação (Dentro)</th>
              <th style="text-align:right;">Pago (Dentro)</th>
              <th style="text-align:right;">Reserva (Dentro)</th>
              <th style="text-align:right;">Pago (Fora)</th>
              <th style="text-align:right;">Reserva (Fora)</th>
            </tr>
          </thead>
          <tbody>
            ${setoresHtml || '<tr><td colspan="6" class="text-center">Nenhum dado consolidado de setor encontrado.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div style="margin-top:15px;">
        <h3 style="font-size:10pt; color:#1e3a8a; margin:0 0 6px 0; text-transform:uppercase;">2. Execução das Notas de Empenho (Consolidação Orçamentária)</h3>
        <table class="striped">
          <thead>
            <tr>
              <th style="text-align:left;">Nota / Finalidade</th>
              <th style="text-align:right;">Empenhado</th>
              <th style="text-align:right;">Reforço</th>
              <th style="text-align:right;">Anulação</th>
              <th style="text-align:right;">Valor Atualizado</th>
              <th style="text-align:right;">Pago</th>
              <th style="text-align:right;">Reserva</th>
              <th style="text-align:right;">Saldo Líquido</th>
            </tr>
          </thead>
          <tbody>
            ${notasHtml || '<tr><td colspan="8" class="text-center">Nenhuma nota de empenho encontrada.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Relatório de Diárias Listadas (Estadual ou Federal) com todos os filtros aplicados
    const busca = (document.getElementById('busca-diarias') ? document.getElementById('busca-diarias').value.toLowerCase().trim() : '');
    const vMes = document.getElementById('diaria-filtro-mes') ? document.getElementById('diaria-filtro-mes').value : 'Todos';
    const vStatus = document.getElementById('diaria-filtro-status') ? document.getElementById('diaria-filtro-status').value : 'Todos';
    const vSetor = document.getElementById('diaria-filtro-setor') ? document.getElementById('diaria-filtro-setor').value : 'Todos';
    const vNota = document.getElementById('diaria-filtro-nota') ? document.getElementById('diaria-filtro-nota').value : 'Todos';
    const vDataIni = document.getElementById('diaria-filtro-data-ini') ? document.getElementById('diaria-filtro-data-ini').value : '';
    const vDataFim = document.getElementById('diaria-filtro-data-fim') ? document.getElementById('diaria-filtro-data-fim').value : '';

    let filtrados = DIARIAS_DATA || [];

    if (aba === 'federal') {
      filtrados = filtrados.filter(d => d.origem === 'federal');
    } else {
      filtrados = filtrados.filter(d => d.origem === 'estadual');
    }

    if (busca) {
      filtrados = filtrados.filter(d => 
        (d.nome && d.nome.toLowerCase().includes(busca)) ||
        (d.motivo && d.motivo.toLowerCase().includes(busca)) ||
        (d.processo && d.processo.toLowerCase().includes(busca)) ||
        (d.cidade && d.cidade.toLowerCase().includes(busca)) ||
        (d.cpf && d.cpf.toLowerCase().includes(busca))
      );
    }

    if (vMes && vMes !== 'Todos') filtrados = filtrados.filter(d => d.mes === vMes);
    if (vStatus && vStatus !== 'Todos') filtrados = filtrados.filter(d => d.status === vStatus);
    if (vSetor && vSetor !== 'Todos') filtrados = filtrados.filter(d => d.setorOriginal === vSetor);
    if (vNota && vNota !== 'Todos') filtrados = filtrados.filter(d => d.nota === vNota);

    if (vDataIni || vDataFim) {
      let dIni = null;
      let dFim = null;
      if (vDataIni) {
        const p = vDataIni.split('-');
        if (p.length === 3) dIni = new Date(p[0], p[1] - 1, p[2]);
      }
      if (vDataFim) {
        const p = vDataFim.split('-');
        if (p.length === 3) dFim = new Date(p[0], p[1] - 1, p[2]);
      }
      filtrados = filtrados.filter(d => {
        if (!d.dateObj) {
          if (d.data) {
            const parts = d.data.split('/');
            if (parts.length === 3) {
              const dt = new Date(parts[2], parts[1] - 1, parts[0]);
              if (dIni && dt < dIni) return false;
              if (dFim && dt > dFim) return false;
            }
          }
          return true;
        }
        if (dIni && d.dateObj < dIni) return false;
        if (dFim && d.dateObj > dFim) return false;
        return true;
      });
    }

    let totalGeral = 0;
    let totalPago = 0;
    let totalReserva = 0;

    filtrados.forEach(d => {
      const val = Number(d.valor) || 0;
      totalGeral += val;
      const st = (d.status || '').toLowerCase();
      if (st.includes('pago')) totalPago += val;
      else if (st.includes('reserva')) totalReserva += val;
    });

    const isFederal = (aba === 'federal');

    const rowsHtml = filtrados.map((d, idx) => {
      let corStatus = '#0284c7';
      const stLow = (d.status || '').toLowerCase();
      if (stLow.includes('pago')) corStatus = '#16a34a';
      else if (stLow.includes('anula') || stLow.includes('encerra')) corStatus = '#dc2626';
      else if (stLow.includes('reserva')) corStatus = '#d97706';

      let destinoExtra = '';
      if (d.cidade) destinoExtra += ' Destino: ' + d.cidade;
      if (d.cpf) destinoExtra += (destinoExtra ? ' | ' : '') + 'CPF: ' + d.cpf;

      return `
        <tr>
          <td class="text-center" style="font-weight:600; color:#64748b;">${idx + 1}</td>
          <td class="text-center" style="white-space:nowrap;">${d.data || '-'}</td>
          <td class="text-center" style="font-weight:700; color:${corStatus}; font-size:7.5pt; text-transform:uppercase;">${d.status || '-'}</td>
          <td class="text-center" style="font-weight:700; font-family:monospace; color:#0f172a; white-space:nowrap;">${d.processo || '-'}</td>
          ${isFederal ? `<td class="text-center" style="font-weight:600;">${d.nota || '-'}</td>` : ''}
          <td class="text-left" style="font-weight:600; color:#0f172a;">
            ${d.nome || '-'}
            ${d.setorOriginal && d.setorOriginal !== d.nome ? `<div style="font-size:7.5pt; color:#64748b; font-weight:normal;">Setor: ${d.setorOriginal}</div>` : ''}
          </td>
          <td class="text-left" style="line-height:1.3; color:#334155;">
            ${d.motivo || '-'}
            ${destinoExtra ? `<div style="font-size:7.5pt; color:#64748b; margin-top:2px;">${destinoExtra}</div>` : ''}
          </td>
          <td class="text-right" style="font-weight:700; color:#0f172a; white-space:nowrap;">
            R$ ${(Number(d.valor) || 0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}
          </td>
        </tr>
      `;
    }).join('');

    const filtrosAplicados = [];
    if (vMes !== 'Todos') filtrosAplicados.push('Mês: ' + vMes);
    if (vStatus !== 'Todos') filtrosAplicados.push('Status: ' + vStatus);
    if (vSetor !== 'Todos') filtrosAplicados.push('Setor: ' + vSetor);
    if (isFederal && vNota !== 'Todos') filtrosAplicados.push('Nota: ' + vNota);
    if (busca) filtrosAplicados.push('Busca: "' + busca + '"');
    if (vDataIni || vDataFim) filtrosAplicados.push('Período: ' + (vDataIni || 'Início') + ' até ' + (vDataFim || 'Hoje'));

    const filtrosTexto = filtrosAplicados.length > 0 ? filtrosAplicados.join(' | ') : 'Todos os Registros';

    contentHtml = `
      <div style="margin-bottom:10px; padding:6px 10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; font-size:8pt; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <div>
          <span style="font-weight:bold; color:#1e3a8a; text-transform:uppercase;">Filtros:</span>
          <span style="color:#475569;"> ${filtrosTexto}</span>
        </div>
        <div>
          <span style="font-weight:bold; color:#1e3a8a;">Total Listadas:</span>
          <span style="font-weight:700; color:#0f172a;"> ${filtrados.length}</span>
          &nbsp;|&nbsp;
          <span style="font-weight:bold; color:#16a34a;">Pago:</span>
          <span style="font-weight:700; color:#16a34a;"> R$ ${totalPago.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
          &nbsp;|&nbsp;
          <span style="font-weight:bold; color:#1e3a8a;">Total:</span>
          <span style="font-weight:800; color:#1e3a8a;"> R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
      </div>

      <table class="striped">
        <thead>
          <tr>
            <th style="width: 3%; text-align:center;">Nº</th>
            <th style="width: 8%; text-align:center;">Data</th>
            <th style="width: 9%; text-align:center;">Status</th>
            <th style="width: 14%; text-align:center;">Processo SEI</th>
            ${isFederal ? '<th style="width: 10%; text-align:center;">Nota Empenho</th>' : ''}
            <th style="width: 20%; text-align:left;">Beneficiário / Setor</th>
            <th style="width: ${isFederal ? '24%' : '34%'}; text-align:left;">Motivo da Viagem / Destino</th>
            <th style="width: 12%; text-align:right;">Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || `<tr><td colspan="${isFederal ? '8' : '7'}" class="text-center" style="padding:20px; color:#94a3b8;">Nenhum registro de diária encontrado para os filtros selecionados.</td></tr>`}
        </tbody>
        <tfoot>
          <tr style="background-color:#1e3a8a !important; color:#ffffff !important; font-weight:800;">
            <td colspan="${isFederal ? '5' : '4'}" style="color:#ffffff !important; font-weight:800; text-align:left; padding:6px 8px; border:1px solid #93c5fd !important;">
              TOTAL GERAL: ${filtrados.length} registro(s) listado(s)
              ${totalPago > 0 ? ` &nbsp;|&nbsp; <span style="color:#86efac;">Executado (Pago): R$ ${totalPago.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>` : ''}
              ${totalReserva > 0 ? ` &nbsp;|&nbsp; <span style="color:#fde047;">Reserva: R$ ${totalReserva.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>` : ''}
            </td>
            <td colspan="2" style="color:#ffffff !important; font-weight:800; text-align:right; padding:6px 8px; border:1px solid #93c5fd !important;">
              VALOR TOTAL FILTRADO:
            </td>
            <td style="color:#ffffff !important; font-weight:800; text-align:right; padding:6px 8px; border:1px solid #93c5fd !important; white-space:nowrap;">
              R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}
            </td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @media print {
          @page { size: A4 landscape !important; margin: 10mm !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 8.5pt;
          margin: 0;
          padding: 10mm;
          color: #0f172a;
          background: #ffffff;
        }
        .official-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 6px;
          margin-bottom: 12px;
          width: 100%;
        }
        .official-header .titles {
          text-align: left;
          line-height: 1.25;
        }
        .official-header .titles .line-1 {
          font-size: 10px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .official-header .titles .line-2 {
          font-size: 10px;
          font-weight: 700;
          color: #0284c7;
          text-transform: uppercase;
        }
        .official-header .titles .line-3 {
          font-size: 10px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
        }
        .official-header .header-sisedu {
          text-align: right;
          font-size: 6pt;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .report-subtitle {
          font-size: 11px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 8px;
          text-transform: uppercase;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          font-size: 8.5pt;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 5px 6px;
          box-sizing: border-box;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        th {
          background-color: #1e3a8a !important;
          color: #ffffff !important;
          font-weight: 700;
          font-size: 8pt;
          text-transform: uppercase;
          text-align: center;
          border: 1px solid #93c5fd !important;
        }
        td {
          color: #0f172a;
        }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .striped tr:nth-child(even) { background-color: #f8fafc; }
        .official-footer {
          margin-top: 14px;
          border-top: 1px solid #cbd5e1;
          padding-top: 6px;
          font-size: 8pt;
          color: #475569;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .official-footer .f-left {
          flex: 1;
          text-align: left;
          font-weight: 700;
          color: #0f172a;
        }
        .official-footer .f-center {
          flex: 1;
          text-align: center;
          font-weight: 600;
          color: #64748b;
        }
        .official-footer .f-right {
          flex: 1;
          text-align: right;
          font-weight: 500;
          color: #64748b;
        }
        .btn-print-action {
          position: fixed;
          top: 12px;
          right: 12px;
          background: #0284c7;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 10pt;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 9999;
        }
      </style>
    </head>
    <body>
      <button class="btn-print-action no-print" onclick="window.print()">🖨️ Imprimir Relatório</button>

      <div class="official-header">
        <div class="titles">
          <div class="line-1">GOVERNO DO ESTADO DE RONDÔNIA</div>
          <div class="line-2">SEDUC - SECRETARIA DE ESTADO DA EDUCAÇÁO</div>
          <div class="line-3">CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS</div>
        </div>
        <div class="header-sisedu">SISEDU</div>
      </div>

      <div class="report-subtitle"><span>${title}</span></div>

      ${contentHtml}

      <div class="official-footer">
        <div class="f-left">${gerencia}</div>
        <div class="f-center">Página 1 de 1</div>
        <div class="f-right">Documento gerado eletronicamente em ${dataHora}</div>
      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => { window.print(); }, 400);
        });
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};
window.imprimirRelatorioDiarias = window.gerarRelatorioDiarias;

setTimeout(() => { window.carregarDiariasData(); }, 1000);

setTimeout(() => popularSelectsFluxo(), 3000);


// Função para limpar o formulário de Nova Diária
// Função para limpar o formulário de Nova Diária
window.limparFormNovaDiaria = function() {
  if (confirm("Tem certeza que deseja limpar todos os dados do formulário?")) {
    if(document.getElementById('diaria-pa')) document.getElementById('diaria-pa').value = '';
    if(document.getElementById('diaria-fonte')) document.getElementById('diaria-fonte').value = '';
    if(document.getElementById('diaria-nd')) document.getElementById('diaria-nd').value = '';
    
    if (typeof verificarSaldoDiaria === 'function') verificarSaldoDiaria();
    
    if(document.getElementById('diaria-nome')) document.getElementById('diaria-nome').value = '';
    if(document.getElementById('diaria-cpf')) document.getElementById('diaria-cpf').value = '';
    if(document.getElementById('diaria-cidade')) document.getElementById('diaria-cidade').value = '';
    if(document.getElementById('diaria-proc')) document.getElementById('diaria-proc').value = '';
    if(document.getElementById('diaria-motivo')) document.getElementById('diaria-motivo').value = '';
    if(document.getElementById('diaria-data-saida')) document.getElementById('diaria-data-saida').value = '';
    if(document.getElementById('diaria-qtde')) document.getElementById('diaria-qtde').value = '';
    if(document.getElementById('diaria-valor-unit')) document.getElementById('diaria-valor-unit').value = '';
    if(document.getElementById('diaria-valor-total')) document.getElementById('diaria-valor-total').value = '';
    
    if (typeof toast === 'function') toast('Formulário limpo', 'info');
  }
};
