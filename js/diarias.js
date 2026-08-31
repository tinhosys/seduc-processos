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
  fill('diaria-filtro-status', PARAM_STATUS.length > 0 ? PARAM_STATUS : [...new Set(DIARIAS_DATA.map(d => d.status))].filter(x => x));
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
  
  if (document.getElementById('diarias-total-filtrado')) {
     document.getElementById('diarias-total-filtrado').innerText = totalGasto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  }
  if (document.getElementById('diarias-count')) {
     document.getElementById('diarias-count').innerText = filtrados.length + ' diárias listadas';
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
      if (val.toString().includes('R
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
)) return val;
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
                <td style="padding:12px; color:#cbd5e1;">${n.empenhado}</td>
                <td style="padding:12px; color:#3b82f6; font-weight:bold;">${n.saldoLiquido}</td>
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
