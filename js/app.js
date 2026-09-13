
// Função global para normalizar o valor da célula do Dígito (GBZ - v1.2.85)
// Remove ,00 ou .00 se for formatação numérica de planilha, preserva texto livre e limita a 8 caracteres
window.limparDigitoValor = function(val) {
  if (val === null || val === undefined) return '';
  let s = String(val).trim();
  if (!s) return '';
  // Se terminar com ,00 ou .00 ou ,0 ou .0 (ex: 2,00 vira 2; texto livre/alfanumérico sem limite)
  s = s.replace(/[,.]0+$/, '');
  return s.trim();
};
window.formatarDigitoInteiro = window.limparDigitoValor;


// Função global para copiar número do processo (SEI) com feedback visual imediato (GBZ - v1.2.85)
window.copiarSeiLinha = function(btn) {
  const row = btn.closest('div');
  const input = row ? row.querySelector('.form-numero-item') : null;
  if (!input || !input.value.trim()) {
    if (typeof showNotification === 'function') showNotification('Nenhum número de processo para copiar', 'warning');
    return;
  }
  const val = input.value.trim();
  const salvarOriginal = btn.innerHTML;

  const feedbackSucesso = () => {
    btn.innerHTML = '<span style="font-size:12px;font-weight:bold;color:#10b981;">✓</span>';
    btn.style.borderColor = '#10b981';
    if (typeof showNotification === 'function') showNotification('Processo copiado: ' + val, 'success');
    setTimeout(() => {
      btn.innerHTML = salvarOriginal;
      btn.style.borderColor = 'var(--border)';
    }, 1500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val).then(feedbackSucesso).catch(() => {
      input.select();
      document.execCommand('copy');
      feedbackSucesso();
    });
  } else {
    input.select();
    document.execCommand('copy');
    feedbackSucesso();
  }
};


// ====== REGRA RESTRITA: DASHBOARD EXCLUSIVO ADMIN ELTON (69) 9 9922-1336 ======
window.podeAcessarDashboard = function() {
  try {
    const uData = JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}");
    const nivel = String(uData.nivel || '').toLowerCase().trim();
    const isAdmin = (nivel === 'adm' || nivel === 'admin');
    if (!isAdmin) return false;

    const nome = String(uData.nome || '').toLowerCase().trim();
    const wa = String(uData.whatsapp || '').replace(/\D/g, '');

    // Somente perfil ADMIN/ADM, usuário Elton, telefone (69) 9 9922-1336
    const isElton = nome.includes('elton') || wa.includes('99221336') || wa === '69999221336' || wa === 'admin';
    return isElton;
  } catch (e) {
    return false;
  }
};

window.isUsuarioAdmin = function() {
  try {
    const uData = JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}");
    const nivel = String(uData.nivel || '').toLowerCase().trim();
    if (nivel === 'admin' || nivel === 'adm') return true;
    if (document.body && document.body.classList.contains('role-adm')) return true;
    const elRole = document.getElementById('user-role');
    if (elRole && elRole.textContent && elRole.textContent.toLowerCase().includes('admin')) return true;
  } catch(e) {}
  return false;
};

window.recarregarDadosGlobais = async function() {
  const btns = document.querySelectorAll('button[onclick*="recarregarDadosGlobais"]');
  btns.forEach(b => {
    b.disabled = true;
    b.dataset.origHtml = b.innerHTML;
    b.innerHTML = '🔄 Recarregando...';
  });

  try {
    if (typeof inicializarDados === 'function') await inicializarDados();
    if (typeof carregarAcessos === 'function') await carregarAcessos();
    if (typeof carregarPainelSistemaInfo === 'function') await carregarPainelSistemaInfo();
    if (typeof recarregarEscolas === 'function') recarregarEscolas();
    if (typeof carregarOrcamentoData === 'function') carregarOrcamentoData();
    if (typeof carregarDiariasData === 'function') carregarDiariasData();
    if (typeof toast === 'function') toast('Dados atualizados com sucesso!', 'success');
  } catch(e) {
    console.error('Erro ao recarregar dados globais:', e);
    if (typeof toast === 'function') toast('Erro ao sincronizar dados.', 'error');
  } finally {
    btns.forEach(b => {
      b.disabled = false;
      b.innerHTML = b.dataset.origHtml || '🔄 Recarregar';
    });
  }
};

function cancelarPadronizacao() {
  const logDiv = document.getElementById('log-status-padronizacao');
  const btnExecutar = document.getElementById('btn-executar-padronizacao');
  const btnCancelar = document.getElementById('btn-cancelar-padronizacao');
  const labelStatus = document.getElementById('label-status-padronizacao');
  if (logDiv) logDiv.innerHTML = '';
  if (btnExecutar) btnExecutar.style.display = 'none';
  if (btnCancelar) btnCancelar.style.display = 'none';
  if (labelStatus) labelStatus.innerHTML = '';
  window._processosInconsistentesParaCorrigir = [];
}
window.cancelarPadronizacao = cancelarPadronizacao;
function jaroWinkler(s1, s2) {
    var m = 0;
    if (!s1 || !s2 || s1.length === 0 || s2.length === 0) return 0;
    if (s1 === s2) return 1;
    var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
    var s1Matches = new Array(s1.length);
    var s2Matches = new Array(s2.length);
    for (var i = 0; i < s1.length; i++) {
        var low  = (i >= range) ? i - range : 0;
        var high = (i + range <= s2.length - 1) ? (i + range) : (s2.length - 1);
        for (var j = low; j <= high; j++) {
            if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
                ++m; s1Matches[i] = s2Matches[j] = true; break;
            }
        }
    }
    if (m === 0) return 0;
    var k = 0, numTrans = 0;
    for (var i = 0; i < s1.length; i++) {
        if (s1Matches[i] === true) {
            for (var j = k; j < s2.length; j++) {
                if (s2Matches[j] === true) { k = j + 1; break; }
            }
            if (s1[i] !== s2[j]) ++numTrans;
        }
    }
    var weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
    var l = 0, p = 0.1;
    if (weight > 0.7) {
        while (s1[l] === s2[l] && l < 4) ++l;
        weight = weight + l * p * (1 - weight);
    }
    return weight;
}

function encontrarEscolaSemelhante(nomeDigitado) {
    const escolas = (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache) && _escolasCache.length > 0) ? _escolasCache : ((typeof _mapaCacheEscolas !== 'undefined' && Array.isArray(_mapaCacheEscolas)) ? _mapaCacheEscolas : []);
    if (escolas.length === 0) return null;
    let melhorMatch = null;
    let melhorScore = 0;
    const digitadoNormal = nomeDigitado.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
    for (let e of escolas) {
        if (!e.nome) continue;
        const nomeEsc = e.nome.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
        const score = jaroWinkler(digitadoNormal, nomeEsc);
        if (score > melhorScore) {
            melhorScore = score;
            melhorMatch = e.nome;
        }
    }
    return (melhorScore >= 0.90 && melhorScore < 1.0) ? melhorMatch : null;
}


function alternarGuiaFormulario(guia) {
  const btnObjeto = document.getElementById('btn-guia-objeto');
  const btnObjetivo = document.getElementById('btn-guia-objetivo');
  const tabObjeto = document.getElementById('tab-content-objeto');
  const tabObjetivo = document.getElementById('tab-content-objetivo');

  if (!tabObjeto || !tabObjetivo) return;

  if (guia === 'objetivo') {
    tabObjeto.style.display = 'none';
    tabObjetivo.style.display = 'block';
    if (btnObjeto) {
      btnObjeto.style.background = 'none';
      btnObjeto.style.color = 'var(--text-secondary)';
      btnObjeto.style.border = '1px solid transparent';
      btnObjeto.style.boxShadow = 'none';
    }
    if (btnObjetivo) {
      btnObjetivo.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      btnObjetivo.style.color = '#ffffff';
      btnObjetivo.style.border = '1px solid #34d399';
      btnObjetivo.style.boxShadow = '0 3px 12px rgba(16,185,129,0.3)';
    }
  } else {
    tabObjeto.style.display = 'block';
    tabObjetivo.style.display = 'none';
    if (btnObjeto) {
      btnObjeto.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      btnObjeto.style.color = '#ffffff';
      btnObjeto.style.border = '1px solid #34d399';
      btnObjeto.style.boxShadow = '0 3px 12px rgba(16,185,129,0.3)';
    }
    if (btnObjetivo) {
      btnObjetivo.style.background = 'none';
      btnObjetivo.style.color = 'var(--text-secondary)';
      btnObjetivo.style.border = '1px solid transparent';
      btnObjetivo.style.boxShadow = 'none';
    }
  }
}
window.alternarGuiaFormulario = alternarGuiaFormulario;

// ============================================================
// SEDUC — App Principal (Router + UI)
// ============================================================

// ---- Estado global ----
let state = {
  page: 'dashboard',
  filtros: {
    busca: '',
    status: [],
    localizacao: [],
    municipio: [],
    super: [],
    objeto: [],
    prefixo: [],
    apontamento: false,
    alerta: '',
    marca: '',
    categoria: [],
    tipo: [],
    autorizacao: '',
    ano: [],
    agrupamento: [],
    cam: false,
    gab: false,
    cc: false
  },
  paginaAtual: 1,
  itensPorPagina: 50,
  editandoId: null,
  sortCol: '',
  sortDir: 'asc',
  ordenacao: { coluna: '', asc: true }
};


let alertasExibidos = false;

function checkAlertasADM(processos) {
  if (getSessaoAtual()?.nivel !== 'adm') return;
  const comAlerta = processos.filter(p => String(p.alerta || '').trim() === '1');
  if (comAlerta.length > 0) {
    const listHtml = comAlerta.map(p => `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px; display:flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: #60a5fa;">${p.prefixo || ''} ${p.numero || 'S/N'}</strong><br>
          <span style="font-size: 12px; color: #cbd5e1;">${p.interessado || ''} - ${p.municipio || ''}</span><br>
          <span style="font-size: 11px; color: #94a3b8;">${(p.apontamento || '').split(';').pop().trim()}</span>
        </div>
        <button onclick="editarProcesso('${p.id}'); fecharModalAlertas()" style="background: #3b82f6; border: none; padding: 6px 12px; border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight:bold;">Visualizar</button>
      </div>
    `).join('');
    
    const content = document.getElementById('modal-alertas-content');
    const overlay = document.getElementById('modal-alertas-overlay');
    if (!content || !overlay) { console.warn('[ALERTA] modal-alertas-overlay nao encontrado no DOM'); return; }
    content.innerHTML = `
      <p style="color: #f0f4ff; margin-bottom: 16px; font-size: 14px;">Você tem <strong>${comAlerta.length}</strong> processo(s) com apontamento pendente:</p>
      <div style="max-height: 300px; overflow-y: auto; padding-right: 4px;">
        ${listHtml}
      </div>
    `;
    overlay.style.display = 'flex';
  }
}
window.fecharModalAlertas = () => {
  const m = document.getElementById('modal-alertas-overlay');
  if (m) m.style.display = 'none';
};

// ---- NAVEGAÇÃO ----
function navegar(pagina) {
  const canDash = (typeof window.podeAcessarDashboard === 'function')
    ? window.podeAcessarDashboard()
    : false;

  // Dashboard visível e acessível SOMENTE para perfil ADMIN/ADM, usuário Elton, (69) 9 9922-1336
  if (pagina === 'dashboard' && !canDash) {
    pagina = 'processos';
  }

  state.page = pagina;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pagina);
  });
  const pageTarget = pagina.startsWith('proalfa') ? 'proalfa' : pagina;
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === 'page-' + pageTarget);
  });

  const titles = {
    financeiro: '💳 Gestão Financeira & Lançamentos',
    dashboard: 'Dashboard',
    processos: 'Processos',
    novo: state.editandoId ? 'Editar Processo' : 'Novo Processo',
    importar: 'Importar Planilha',
    acessos: 'Gerenciamento de Acessos',
    repetidos: 'Processos Repetidos',
    'gmac-aee': '🎒 Equipamento - AEE',
    'gmac-onibus': '🚌 Doação do Ônibus Escolar',
    'gmac-veiculos': '🚗 Doação Definitiva de Veículos',
    'gmac-reordenamento': '🏛️ Municipalização e Reordenamento',
    'gmac-cooperacao': '🤝 Termo de Cooperação',
    proalfa: '📖 PROALFA',
    'proalfa-professores': '👨‍🏫 PROALFA - Professores (Docentes)',
    'proalfa-alunos': '🎒 PROALFA - Alunos (Matrículas)',
    diarias: '✈️ Diárias',
    orcamento: '💰 Controle Orçamentário',
    contatos: '🏛️ Municípios',
    escolas: '🏫 Escolas',
    'mapa-escolas': '🗺️ Mapa de Escolas de Rondônia',
    'todas-escolas': '🏫 Todas as Escolas',
    'orcamento': '💵 Orçamento',
    'diarias': '📅 Controle de Diárias',
    'gdsm-regimes': '📋 GDSM — Regime de Colaboração',
        'gdsm-demais': '📁 GDSM — Demais Processos',
    'gdsm-doacoes': '🎁 GDSM — [Temporário] Doações',
    'gdsm-novoregime': '🚀 GDSM — Novo Regime',
    'sistema-info': '🖥️ Informações do Sistema & Diagnóstico'
  };
  document.getElementById('topbar-title').textContent = titles[pagina] || pagina;

  // Atualizar conteúdo
  if (pagina === 'dashboard') renderDashboard();
  if (pagina === 'financeiro') carregarFinanceiro();
  if (pagina === 'processos') renderProcessos();
  if (pagina === 'novo') renderFormulario();
  if (pagina === 'acessos') {
    carregarAcessos();
    cancelarEdicaoAcesso();
  }
  if (pagina === 'repetidos') renderProcessosRepetidos();
  if (pagina === 'escolas') iniciarPaginaEscolas();
  if (pagina === 'mapa-escolas') {
    if (typeof iniciarMapaEscolas === 'function') {
      setTimeout(() => iniciarMapaEscolas(), 50);
    }
  }
  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();
  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();
  if (pagina === 'sistema-info' && typeof carregarPainelSistemaInfo === 'function') carregarPainelSistemaInfo();
  if (pagina === 'diarias' && typeof carregarDiarias === 'function') carregarDiarias();
  if (pagina && pagina.startsWith('gmac-')) {
    const mod = pagina.replace('gmac-', '');
    if (typeof carregarGMAC === 'function') {
      carregarGMAC(mod);
    } else {
      setTimeout(() => {
        if (typeof carregarGMAC === 'function') carregarGMAC(mod);
      }, 150);
    }
  }
  if (pagina && pagina.startsWith('gdsm-')) {
    const tabKey = pagina.replace('gdsm-', '');
    if (typeof carregarGDSM === 'function') {
      carregarGDSM(tabKey);
    } else {
      setTimeout(() => {
        if (typeof carregarGDSM === 'function') carregarGDSM(tabKey);
      }, 150);
    }
  }
  if (pagina && pagina.startsWith('proalfa')) {
    const tipo = pagina === 'proalfa-alunos' ? 'alunos' : (pagina === 'proalfa-professores' ? 'professores' : null);
    if (typeof window.navegarProalfa === 'function' && tipo) {
      window.navegarProalfa(tipo);
    } else if (typeof carregarProalfa === 'function') {
      carregarProalfa();
    }
  }
}

// ---- TOAST ----
function toast(msg, tipo = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const div = document.createElement('div');
  div.className = `toast ${tipo}`;
  div.innerHTML = `<span>${icons[tipo]}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(div);
  setTimeout(() => div.remove(), 4000);
}
window.showToast = toast;

// ---- DASHBOARD ----
let chartStatus = null;
let chartCategoria = null;
let chartTipo = null;
let chartMunicipio = null;
let chartAcessos = null;

function renderDashboard() {
  const processos = carregarProcessos();
  const total = processos.length;

  const marcadosCount = processos.filter(p => p.marca === '1' || p.marca === 'SIM').length;
  const elMarcado = document.getElementById('stat-marcado');
  if (elMarcado) elMarcado.textContent = marcadosCount;

  const cardMarcados = document.getElementById('card-stat-marcados');
  if (cardMarcados) {
    cardMarcados.style.cursor = 'pointer';
    cardMarcados.onclick = () => {
      state.filtros.marca = 'sim';
      const selectMarca = document.getElementById('filtro-marca');
      if (selectMarca) selectMarca.value = 'sim';
      navegar('processos');
    };
  }

  // Stats
  const countStatus = (s) => processos.filter(p => normalizar(p.status) === normalizar(s)).length;
  const valorTotal  = processos.reduce((a,p) => a + (p.valorOf || 0), 0);
  const autorizados = processos.filter(p => normalizar(p.status) === 'autorizado').length;
  const pagos       = processos.filter(p => normalizar(p.status) === 'pago').length;
  const pendentes   = processos.filter(p => ['pendente','notificar','notificado','p/ autorizo','p/autorizo','para autorizo'].includes(normalizar(p.status))).length;
  const prioridade  = processos.filter(p => normalizar(p.status) === 'prioridade').length;
  const valorPago   = processos.filter(p => normalizar(p.status) === 'pago').reduce((a,p) => a + (p.valorOf || 0), 0);
  const valorAPagar = valorTotal - valorPago;

  document.getElementById('stat-total').textContent      = total.toLocaleString('pt-BR');
  document.getElementById('stat-valor-pago').textContent = formatCurrency(valorPago);
  document.getElementById('stat-valor-total-global').textContent = formatCurrency(valorTotal);
  document.getElementById('stat-valor-a-pagar').textContent = formatCurrency(valorAPagar);
  document.getElementById('stat-autorizado').textContent = autorizados.toLocaleString('pt-BR');
  document.getElementById('stat-pago').textContent       = pagos.toLocaleString('pt-BR');
  document.getElementById('stat-pendente').textContent   = pendentes.toLocaleString('pt-BR');
  document.getElementById('stat-prioridade').textContent = prioridade.toLocaleString('pt-BR');

  // --- Alertas de Datas ---
  let processosSemData = 0;
  let datasValidas = [];
  
  processos.forEach(p => {
    // Apenas considerar processos não encerrados/concludos para o alerta de data antiga
    const isEncerrado = ['pago', 'encerrado', 'concludo', 'cancelado', 'duplicado'].includes(normalizar(p.status));
    
    if (!p.data || String(p.data).trim() === '') {
      if (!isEncerrado) processosSemData++;
    } else if (!isEncerrado) {
      // Tenta fazer o parse da data (esperado DD/MM/YYYY ou similar)
      const parts = String(p.data).split('/');
      if (parts.length === 3) {
        // Formato DD/MM/YYYY
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
        if (!isNaN(d)) datasValidas.push({ date: d, original: p.data, prefixo: p.prefixo, num: p.numero, municipio: p.municipio || '' });
      }
    }
  });

  const elSemData = document.getElementById('alert-sem-data');
  if (elSemData) elSemData.textContent = processosSemData;

  const elDataAntiga = document.getElementById('alert-data-antiga');
  const elDataAntigaList = document.getElementById('alert-data-antiga-list');
  if (elDataAntiga && datasValidas.length > 0) {
    datasValidas.sort((a, b) => a.date - b.date);
    const oldestDateValue = datasValidas[0].date.getTime();
    const oldestProcesses = datasValidas.filter(d => d.date.getTime() === oldestDateValue);
    
    elDataAntiga.textContent = oldestProcesses[0].original;
    
    if (elDataAntigaList) {
      elDataAntigaList.innerHTML = oldestProcesses.map(d => {
        // Link que abre a tela de processos filtrando pelo número
        const encodedNum = encodeURIComponent(d.num || '');
        return `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; border-bottom:1px solid rgba(255,255,255,0.06); padding:5px 0;">
          <span style="color:#94a3b8; min-width:90px;">${d.original}</span>
          <span style="color:#f8fafc; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.municipio || 'S/ Município'}</span>
          <span style="color:#60a5fa; font-weight:700; min-width:60px; text-align:center;">${d.prefixo || '-'}</span>
          <a href="#" onclick="event.preventDefault(); state.filtros.busca='${(d.num||'').replace(/'/g,'')}'; navegar('processos');" 
             style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); border-radius:6px; padding:2px 10px; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap; transition:background 0.2s;" 
             onmouseover="this.style.background='rgba(59,130,246,0.35)'" 
             onmouseout="this.style.background='rgba(59,130,246,0.15)'">👁️ VER</a>
        </div>`;
      }).join('');
    }
  } else if (elDataAntiga) {
    elDataAntiga.textContent = '--/--/----';
    if (elDataAntigaList) elDataAntigaList.innerHTML = '';
  }

  // --- Gráfico de Acessos ---
  renderChartAcessosDashboard();

  // Gráfico: Status
  const statusCounts = {};
  processos.forEach(p => {
    const s = p.status || 'Sem status';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusLabels = Object.keys(statusCounts).sort((a,b) => statusCounts[b] - statusCounts[a]).slice(0, 10);
  const statusValues = statusLabels.map(k => statusCounts[k]);
  const totalStatus = statusValues.reduce((sum, v) => sum + v, 0) || 1;

  const colorsStatus = [
    '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#f97316','#6366f1','#ec4899','#14b8a6'
  ];

  const ctxStatus = document.getElementById('chart-status').getContext('2d');
  if (chartStatus) chartStatus.destroy();
  chartStatus = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: colorsStatus, borderWidth: 2, borderColor: '#0a0f1e' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom', 
          onClick: function(e, legendItem, legend) {
            const index = legendItem.index;
            const ci = legend.chart;
            ci.toggleDataVisibility(index);
            ci.update();
          },
          labels: { 
            color: '#f8fafc', 
            font: { size: 10 }, 
            padding: 10,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percent = ((value / totalStatus) * 100).toFixed(1) + '%';
                  const isHidden = !chart.getDataVisibility(i);
                  return {
                    text: `${label.toUpperCase()} (${percent})`,
                    fillStyle: isHidden ? 'rgba(255,255,255,0.05)' : style.backgroundColor,
                    strokeStyle: isHidden ? 'rgba(255,255,255,0.1)' : style.borderColor,
                    lineWidth: style.borderWidth,
                    fontColor: isHidden ? '#475569' : '#f7f7f7',
                    textDecoration: 'none',
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          } 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = ((val / totalStatus) * 100).toFixed(1) + '%';
              return ` ${context.label.toUpperCase()}: ${val} (${pct})`;
            }
          }
        }
      }
    }
  });

  // Gráfico: Categoria
  const catCounts = {};
  processos.forEach(p => {
    let c = String(p.categoria || '').trim().toUpperCase();
    if (!c) {
      c = 'NÃO INFORMADO';
    } else {
      if (c === 'F') c = 'FOMENTO';
      else if (c === 'C') c = 'CONVÊNIO';
      else if (c === 'T') c = 'TERMO DE COOPERAÇÃO';
      else if (c === 'O') c = 'OUTRO';
    }
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const catLabels = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a]);
  const catValues = catLabels.map(k => catCounts[k]);
  const totalCat = catValues.reduce((sum, v) => sum + v, 0) || 1;

  const colorsCatMap = {
    'FOMENTO': '#3b82f6',
    'CONVÊNIO': '#10b981',
    'TERMO DE COOPERAÇÃO': '#8b5cf6',
    'OUTRO': '#06b6d4',
    'NÃO INFORMADO': '#64748b'
  };
  const colorsCat = catLabels.map(label => colorsCatMap[label] || '#6366f1');

  const ctxCategoria = document.getElementById('chart-categoria').getContext('2d');
  if (chartCategoria) chartCategoria.destroy();
  chartCategoria = new Chart(ctxCategoria, {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{ data: catValues, backgroundColor: colorsCat, borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      cutout: '65%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          onClick: function(e, legendItem, legend) {
            const index = legendItem.index;
            const ci = legend.chart;
            ci.toggleDataVisibility(index);
            ci.update();
          },
          labels: {
            color: '#f8fafc',
            font: { size: 10 },
            padding: 10,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percent = ((value / totalCat) * 100).toFixed(1) + '%';
                  const isHidden = !chart.getDataVisibility(i);
                  return {
                    text: `${label.toUpperCase()} (${percent})`,
                    fillStyle: isHidden ? 'rgba(255,255,255,0.05)' : style.backgroundColor,
                    strokeStyle: isHidden ? 'rgba(255,255,255,0.1)' : style.borderColor,
                    lineWidth: style.borderWidth,
                    fontColor: isHidden ? '#475569' : '#f7f7f7',
                    textDecoration: 'none',
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = ((val / totalCat) * 100).toFixed(1) + '%';
              return ` ${context.label.toUpperCase()}: ${val} (${pct})`;
            }
          }
        }
      }
    }
  });

  // Gráfico: Tipo
  const tipoCounts = {};
  processos.forEach(p => {
    let t = String(p.tipo || '').trim().toUpperCase();
    if (!t) {
      t = 'NÃO INFORMADO';
    } else {
      if (t === 'OB') t = 'OBRAS';
      else if (t === 'MP') t = 'MATERIAL PERMANENTE';
      else if (t === 'MC') t = 'MATERIAL DE CONSUMO';
      else if (t === 'SI') t = 'SISTEMA';
      else if (t === 'TR') t = 'TREINAMENTO';
      else if (t === 'OUT' || t === 'OU') t = 'OUTROS';
    }
    tipoCounts[t] = (tipoCounts[t] || 0) + 1;
  });
  const tipoLabels = Object.keys(tipoCounts).sort((a,b) => tipoCounts[b] - tipoCounts[a]);
  const tipoValues = tipoLabels.map(k => tipoCounts[k]);
  const totalTipo = tipoValues.reduce((sum, v) => sum + v, 0) || 1;

  const colorsTipoMap = {
    'OBRAS': '#06b6d4',
    'MATERIAL PERMANENTE': '#f97316',
    'MATERIAL DE CONSUMO': '#f59e0b',
    'SISTEMA': '#a855f7',
    'TREINAMENTO': '#10b981',
    'OUTROS': '#f43f5e',
    'NÃO INFORMADO': '#64748b'
  };
  const colorsTipo = tipoLabels.map(label => colorsTipoMap[label] || '#6366f1');

  const ctxTipo = document.getElementById('chart-tipo').getContext('2d');
  if (chartTipo) chartTipo.destroy();
  chartTipo = new Chart(ctxTipo, {
    type: 'doughnut',
    data: {
      labels: tipoLabels,
      datasets: [{ data: tipoValues, backgroundColor: colorsTipo, borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      cutout: '65%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          onClick: function(e, legendItem, legend) {
            const index = legendItem.index;
            const ci = legend.chart;
            ci.toggleDataVisibility(index);
            ci.update();
          },
          labels: {
            color: '#f8fafc',
            font: { size: 10 },
            padding: 10,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percent = ((value / totalTipo) * 100).toFixed(1) + '%';
                  const isHidden = !chart.getDataVisibility(i);
                  return {
                    text: `${label.toUpperCase()} (${percent})`,
                    fillStyle: isHidden ? 'rgba(255,255,255,0.05)' : style.backgroundColor,
                    strokeStyle: isHidden ? 'rgba(255,255,255,0.1)' : style.borderColor,
                    lineWidth: style.borderWidth,
                    fontColor: isHidden ? '#475569' : '#f7f7f7',
                    textDecoration: 'none',
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = ((val / totalTipo) * 100).toFixed(1) + '%';
              return ` ${context.label.toUpperCase()}: ${val} (${pct})`;
            }
          }
        }
      }
    }
  });

  // Gráfico: Todos Municípios por valor
  const munValor = {};
  processos.forEach(p => {
    if (p.municipio) munValor[p.municipio] = (munValor[p.municipio] || 0) + (p.valorOf || 0);
  });
  const allMun = Object.entries(munValor).sort((a,b) => b[1]-a[1]);

  const munWrapper = document.getElementById('chart-municipio-wrapper');
  if (munWrapper) {
    const requiredHeight = Math.max(260, allMun.length * 32);
    munWrapper.style.height = requiredHeight + 'px';
  }

  const chartMunEl = document.getElementById('chart-municipio');
  if (chartMunEl) {
    const ctxMun = chartMunEl.getContext('2d');
    if (chartMunicipio) chartMunicipio.destroy();
    chartMunicipio = new Chart(ctxMun, {
      type: 'bar',
      data: {
        labels: allMun.map(([m]) => m.length > 18 ? m.slice(0,18)+'…' : m),
        datasets: [{
          label: 'Valor (R$)',
          data: allMun.map(([,v]) => v),
          backgroundColor: 'rgba(59,130,246,0.7)',
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b', callback: v => 'R$ ' + (v/1e6).toFixed(1)+'M' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  // Gráfico: Prefixo (LT, Cgoi, IeCH, ClJs...)
    const prefixoCounts = {};
    processos.forEach(p => {
      const pr = (p.prefixo || 'OUTROS').trim().toUpperCase();
      prefixoCounts[pr] = (prefixoCounts[pr] || 0) + 1;
    });
    
    const prefixoLabels = Object.keys(prefixoCounts).sort((a,b) => prefixoCounts[b] - prefixoCounts[a]).slice(0, 10);
    const prefixoValues = prefixoLabels.map(k => prefixoCounts[k]);
    
    const colorsPrefixo = [
      '#6366f1','#ec4899','#14b8a6','#8b5cf6','#f97316',
      '#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'
    ];
    
    const ctxPrefixo = document.getElementById('chart-prefixo');
    if (ctxPrefixo) {
      if (window.chartPrefixoInstance) window.chartPrefixoInstance.destroy();
      window.chartPrefixoInstance = new Chart(ctxPrefixo.getContext('2d'), {
        type: 'bar',
        data: {
          labels: prefixoLabels,
          datasets: [{ 
            label: 'Processos',
            data: prefixoValues, 
            backgroundColor: colorsPrefixo, 
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#1f2937' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    // Localização
  const locCount = {};
  processos.forEach(p => {
    if (p.localizacao && p.localizacao !== '.') locCount[p.localizacao] = (locCount[p.localizacao] || 0) + 1;
  });
  const topLoc = Object.entries(locCount).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const locDiv = document.getElementById('loc-list');
  locDiv.innerHTML = topLoc.map(([loc, cnt]) => {
    const pct = Math.round((cnt / total) * 100);
    return `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span style="color:var(--text-primary);font-weight:500">${loc}</span>
          <span style="color:var(--text-muted)">${cnt} (${pct}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('') || '<p style="color:var(--text-muted);font-size:13px">Sem dados</p>';
}

async function renderChartAcessosDashboard() {
  // Pizza removida — apenas gráfico de barras proporcional
  if (chartAcessos) { chartAcessos.destroy(); chartAcessos = null; }

  try {
    const token = sessionStorage.getItem('sap_session_token');
    const res = await fetch(API_BASE + '/api/acessos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Acesso negado');

    const acessos = await res.json();

    // Debug: ver o que a API retorna para contagem
    console.log('[ACESSOS] Dados brutos da API:', JSON.stringify(acessos.map(a => ({nome: a.nome, nivel: a.nivel, contagem: a.contagem}))));

    // ---- Usar o campo 'contagem' real da planilha (CONTAGEM ACESSO) ----
    // Parsing robusto: trata string vazia, ponto, vrgula decimal
    const parseContagem = (val) => {
      if (!val && val !== 0) return 0;
      const str = String(val).trim().replace(/\./g, '').replace(',', '.');
      const n = parseFloat(str);
      return isNaN(n) ? 0 : Math.round(n);
    };

    const usuarios = acessos
      .filter(a => a.nivel && a.nivel !== 'adm')
      .map(a => ({
        nome:     (a.nome || a.whatsapp || 'DESCONHECIDO').toUpperCase(),
        nivel:    a.nivel,
        contagem: parseContagem(a.contagem)
      }))
      .sort((a, b) => b.contagem - a.contagem);

    console.log('[ACESSOS] Usuários processados:', usuarios);

    // Totais por categoria (contagem real)
    const totalAcessos = usuarios.reduce((s, u) => s + u.contagem, 0) || 1;
    const totalEditor  = usuarios.filter(u => u.nivel === 'editor').reduce((s, u) => s + u.contagem, 0);
    const totalLeitor  = usuarios.filter(u => u.nivel === 'leitor').reduce((s, u) => s + u.contagem, 0);

    // ---- Limpar lista de badges (não usada) ----
    const elNomes = document.getElementById('lista-nomes-acessos');
    if (elNomes) elNomes.innerHTML = '';

    // ---- Gráfico de barras VERTICAL proporcional (100% = total) ----
    // Cada barra tem altura proporcional à sua participação no total de acessos
    const barLabels = usuarios.map(u => u.nome);
    const barData   = usuarios.map(u => parseFloat(((u.contagem / totalAcessos) * 100).toFixed(2)));
    const barColors = usuarios.map(u => u.nivel === 'editor' ? '#10b981' : '#f59e0b');
    const barRaw    = usuarios.map(u => u.contagem); // para tooltip

    const barCtx = document.getElementById('chart-acessos-bar');
    if (barCtx) {
      const barCtx2d = barCtx.getContext('2d');
      new Chart(barCtx2d, {
        type: 'bar',
        data: {
          labels: barLabels,
          datasets: [{
            label: '% dos Acessos',
            data: barData,
            backgroundColor: barColors,
            borderWidth: 0,
            borderRadius: 6,
            maxBarThickness: 36,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const raw = barRaw[ctx.dataIndex];
                  const pct = ctx.parsed.y.toFixed(1);
                  return ` ${raw} acessos  (${pct}% do total)`;
                }
              }
            },
            // Exibir o % em cima de cada barra
            datalabels: {
              display: false // usa plugin chartjs-plugin-datalabels se dispoNível
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#f8fafc',
                font: { size: 10, weight: '600' },
                maxRotation: 25,
                minRotation: 0
              },
              grid: { color: 'rgba(255,255,255,0.04)' }
            },
            y: {
              ticks: {
                color: '#94a3b8',
                callback: v => v + '%'
              },
              grid: { color: 'rgba(255,255,255,0.05)' },
              max: 100,
              title: {
                display: true,
                text: '% do total de acessos',
                color: '#64748b',
                font: { size: 10 }
              }
            }
          }
        }
      });
    }

  } catch (err) {
    console.error('[ACESSOS] Erro:', err);
  }
}

const MAPA_MUNICIPIOS_SUPER = {
  'alta floresta do oeste': 'ALTA FLORESTA',
  'alta floresta d\'oeste': 'ALTA FLORESTA',
  'alta floresta': 'ALTA FLORESTA',
  'alto alegre dos parecis': 'ALTA FLORESTA',
  'alto paraiso': 'ARIQUEMES',
  'alvorada do oeste': 'JI-PARANA',
  'ariquemes': 'ARIQUEMES',
  'buritis': 'BURITIS',
  'cabixi': 'CEREJEIRAS',
  'cacoal': 'CACOAL',
  'cacaulandia': 'ARIQUEMES',
  'campo novo de ro': 'BURITIS',
  'campo novo de rondonia': 'BURITIS',
  'candeias do jamari': 'PORTO VELHO',
  'castanheiras': 'ROLIM DE MOURA',
  'cerejeiras': 'CEREJEIRAS',
  'chupinguaia': 'VILHENA',
  'colorado do oeste': 'CEREJEIRAS',
  'corumbiara': 'CEREJEIRAS',
  'costa marques': 'COSTA MARQUES',
  'cujubim': 'ARIQUEMES',
  'dist. de abuna': 'EXTREMA',
  'distrito de abuna': 'EXTREMA',
  'abuna': 'EXTREMA',
  'dist. de surpresa': 'GUAJARA-MIRIM',
  'surpresa': 'GUAJARA-MIRIM',
  'dist. nova california': 'EXTREMA',
  'nova california': 'EXTREMA',
  'dist. vista alegre do abuna': 'EXTREMA',
  'vista alegre do abuna': 'EXTREMA',
  'espigao do oeste': 'ESPIGAO DO OESTE',
  'espigao d\'oeste': 'ESPIGAO DO OESTE',
  'gov. jorge teixeira': 'JARU',
  'governador jorge teixeira': 'JARU',
  'guajara-mirim': 'GUAJARA-MIRIM',
  'guajara mirim': 'GUAJARA-MIRIM',
  'itapua do oeste': 'PORTO VELHO',
  'jaru': 'JARU',
  'ji-parana': 'JI-PARANA',
  'ji parana': 'JI-PARANA',
  'machadinho do oeste': 'MACHADINHO DOESTE',
  'machadinho d\'oeste': 'MACHADINHO DOESTE',
  'machadinho d oeste': 'MACHADINHO DOESTE',
  'ministro andreazza': 'CACOAL',
  'mirante da serra': 'OURO PRETO DO OESTE',
  'monte negro': 'ARIQUEMES',
  'nova brasilandia': 'ROLIM DE MOURA',
  'nova mamore': 'GUAJARA-MIRIM',
  'nova uniao': 'OURO PRETO DO OESTE',
  'novo horizonte': 'ROLIM DE MOURA',
  'ouro preto': 'OURO PRETO DO OESTE',
  'ouro preto do oeste': 'OURO PRETO DO OESTE',
  'parecis': 'PIMENTA BUENO',
  'pimenta bueno': 'PIMENTA BUENO',
  'pimenteiras do oeste': 'CEREJEIRAS',
  'porto velho': 'PORTO VELHO',
  'presidente medici': 'JI-PARANA',
  'primavera de rondonia': 'PIMENTA BUENO',
  'rio crespo': 'ARIQUEMES',
  'rolim de moura': 'ROLIM DE MOURA',
  'santa luzia': 'ROLIM DE MOURA',
  'sao felipe do oeste': 'PIMENTA BUENO',
  'sao francisco do guapore': 'SAO FRANCISCO',
  'sao francisco': 'SAO FRANCISCO',
  'sao miguel do guapore': 'SAO FRANCISCO',
  'sao miguel': 'SAO FRANCISCO',
  'seringueiras': 'SAO FRANCISCO',
  'teixeiropolis': 'OURO PRETO DO OESTE',
  'theobroma': 'JARU',
  'urupa': 'OURO PRETO DO OESTE',
  'vale do anari': 'MACHADINHO DOESTE',
  'vale do paraiso': 'OURO PRETO DO OESTE',
  'vilhena': 'VILHENA'
};

function normalizarMunicipioParaSuper(mun) {
  if (!mun) return '';
  return mun.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function getSuperPorMunicipio(mun) {
  if (!mun) return '';
  const norm = normalizarMunicipioParaSuper(mun);
  
  for (const [key, value] of Object.entries(MAPA_MUNICIPIOS_SUPER)) {
    if (norm === key || norm.includes(key)) {
      return 'SUPER ' + value;
    }
  }
  
  if (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache)) {
    const escola = _escolasCache.find(e => {
       const emun = normalizarMunicipioParaSuper(e.municipio);
       return emun === norm || emun.includes(norm) || norm.includes(emun);
    });
    if (escola && escola.super) {
       let s = escola.super.toString().toUpperCase().trim();
       return s.startsWith('SUPER') ? s : 'SUPER ' + s;
    }
  }
  
  return 'OUTRAS';
}

// ---- LISTA DE PROCESSOS ----
function getFiltrados() {
  let lista = carregarProcessos();
  const { busca, status, localizacao, municipio, objeto, prefixo, alerta, marca, categoria, tipo, ano } = state.filtros;

  if (alerta === 'sim') {
    lista = lista.filter(p => String(p.alerta || '').trim() === '1');
  } else if (alerta === 'nao') {
    lista = lista.filter(p => String(p.alerta || '').trim() !== '1');
  }

  if (marca === 'sim') {
    lista = lista.filter(p => p.marca === '1' || p.marca === 'SIM');
  } else if (marca === 'nao') {
    lista = lista.filter(p => p.marca !== '1' && p.marca !== 'SIM');
  }

  if (busca) {
    const q = normalizar(busca);
    lista = lista.filter(p =>
      normalizar(p.numero).includes(q) ||
      normalizar(p.interessado).includes(q) ||
      normalizar(p.municipio).includes(q) ||
      normalizar(p.objeto).includes(q) ||
      normalizar(p.obs).includes(q) ||
      normalizar(p.anotacao).includes(q) ||
      normalizar(p.prefixo).includes(q) ||
      normalizar(p.status).includes(q) ||
      normalizar(p.localizacao).includes(q) ||
      normalizar(p.agrupamento).includes(q) ||
      String(p.ano || '').includes(q)
    );
  }
    const filterByMultiple = (campo, valor) => {
    if (!valor || (Array.isArray(valor) && valor.length === 0)) return;
    if (Array.isArray(valor)) {
      lista = lista.filter(p => {
        const valNorm = normalizar(p[campo]);
        return valor.some(v => valNorm === normalizar(v));
      });
    } else {
      lista = lista.filter(p => normalizar(p[campo]) === normalizar(valor));
    }
  };

  const filterIncludesMultiple = (campo, valor) => {
    if (!valor || (Array.isArray(valor) && valor.length === 0)) return;
    if (Array.isArray(valor)) {
      lista = lista.filter(p => {
        const valNorm = normalizar(p[campo]);
        return valor.some(v => valNorm.includes(normalizar(v)));
      });
    } else {
      lista = lista.filter(p => normalizar(p[campo]).includes(normalizar(valor)));
    }
  };
  filterByMultiple('status', status);
  filterByMultiple('localizacao', localizacao);
  filterByMultiple('municipio', municipio);
  filterByMultiple('objeto', objeto);
  filterByMultiple('categoria', categoria);
  filterByMultiple('tipo', tipo);
  filterByMultiple('ano', ano);
  filterByMultiple('agrupamento', state.filtros.agrupamento);
    // Filtro de Dígito com parâmetro (=, <>, TODOS) e suporte a multi-valores
  const condDigito = state.filtros.digitoCond || 'todos';
  const valDigitoRaw = String(state.filtros.digito || '').trim();

  if (condDigito !== 'todos' || valDigitoRaw !== '') {
    const alvos = valDigitoRaw
      ? valDigitoRaw.split(/[,;\s]+/).map(v => v.trim()).filter(Boolean)
      : [];

    const numMatch = (procDig, alvo) => {
      const d1 = window.limparDigitoValor(procDig).toLowerCase();
      const d2 = window.limparDigitoValor(alvo).toLowerCase();
      if (!d1 && !d2) return true;
      if (!d1 || !d2) return false;
      return d1 === d2;
    };

    if (condDigito === '=') {
      if (alvos.length > 0) {
        lista = lista.filter(p => {
          const pDig = p.digito || p.DIGITO || '';
          return alvos.some(alvo => numMatch(pDig, alvo));
        });
      } else {
        // '=' com campo vazio: mostra processos sem dígito (vazio/nulo)
        lista = lista.filter(p => {
          const pDig = String(p.digito || p.DIGITO || '').trim();
          return pDig === '';
        });
      }
    } else if (condDigito === '<>') {
      if (alvos.length > 0) {
        lista = lista.filter(p => {
          const pDig = p.digito || p.DIGITO || '';
          // Diferente de todos os alvos digitados. Se pDig for vazio/nulo, !alvos.some é true (INCLUSIVE NULL/VAZIO!)
          return !alvos.some(alvo => numMatch(pDig, alvo));
        });
      } else {
        // '<>' com campo vazio: mostra processos COM dígito preenchido
        lista = lista.filter(p => {
          const pDig = String(p.digito || p.DIGITO || '').trim();
          return pDig !== '';
        });
      }
    }
  }
  filterIncludesMultiple('prefixo', state.filtros.prefixo);

  // Filtros individuais de autorização
  if (state.filtros.cam) lista = lista.filter(p => p.CAM === '1');
  if (state.filtros.gab) lista = lista.filter(p => p.GAB === '1');
  if (state.filtros.cc)  lista = lista.filter(p => p.CC  === '1');


  // Ordenação
  if (state.sortCol) {
    lista.sort((a, b) => {
      let va = a[state.sortCol] || '';
      let vb = b[state.sortCol] || '';
      if (typeof va === 'number') return state.sortDir === 'asc' ? va - vb : vb - va;
      return state.sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'pt-BR')
        : String(vb).localeCompare(String(va), 'pt-BR');
    });
  }

  return lista;
}

// ============================================================
// GBZ v1.2.85 - FUNÇÕES AUXILIARES PARA CÉLULAS E BALÃO MOBILE
// ============================================================
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMobileCell(titulo, valor, maxChars = 7) {
  const str = (valor || '').toString().trim();
  if (!str || str === '—' || str === '-') {
    return '—';
  }
  const trunc = str.length > maxChars ? escapeHtml(str.substring(0, maxChars)) + '...' : escapeHtml(str);
  const attrTitulo = escapeHtml(titulo);
  const attrConteudo = escapeHtml(str);
  return `<span class="mobile-cell-wrap">${trunc}<button type="button" class="btn-lupa-mobile" onclick="abrirBalaoConteudo(event, this)" data-titulo="${attrTitulo}" data-conteudo="${attrConteudo}" title="Ver ${attrTitulo} completo">🔍</button></span>`;
}

function renderMobileStatusCell(status, maxChars = 7) {
  const str = (status || '').toString().trim();
  if (!str || str === '—' || str === '-') return '—';
  const badgeClass = getStatusBadgeClass(str);
  const trunc = str.length > maxChars ? escapeHtml(str.substring(0, maxChars)) + '...' : escapeHtml(str);
  const attrTitulo = 'Status';
  const attrConteudo = escapeHtml(str);
  return `<span class="badge ${badgeClass}" style="padding: 2px 6px; font-size: 10px; display:inline-flex; align-items:center; gap:3px;">${trunc}<button type="button" class="btn-lupa-mobile" onclick="abrirBalaoConteudo(event, this)" data-titulo="${attrTitulo}" data-conteudo="${attrConteudo}" title="Ver Status completo" style="margin-left:2px; padding:0 3px; font-size:9px; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); color:#fff; border-radius:3px; cursor:pointer;">🔍</button></span>`;
}

function renderMobileDateCell(dataRaw) {
  const dataFmt = formatDate(dataRaw);
  const textoData = (!dataFmt || dataFmt === '—' || dataFmt === '-') ? 'Sem data informada' : dataFmt;
  const attrTitulo = 'Data';
  const attrConteudo = escapeHtml(textoData);
  return `<button type="button" class="btn-calendario-mobile" onclick="abrirBalaoConteudo(event, this)" data-titulo="${attrTitulo}" data-conteudo="${attrConteudo}" title="Ver Data (${attrConteudo})">📅</button>`;
}

window.toggleFuncaoMobile = function(forcarEstado) {
  const body = document.body;
  const ativoAtual = body.classList.contains('funcao-mobile-ativa');
  const novoEstado = typeof forcarEstado === 'boolean' ? forcarEstado : !ativoAtual;
  
  if (novoEstado) {
    body.classList.add('funcao-mobile-ativa');
    window._forcarMobile = true;
  } else {
    body.classList.remove('funcao-mobile-ativa');
    window._forcarMobile = false;
  }
  
  const btn = document.getElementById('btn-toggle-mobile');
  const txt = document.getElementById('btn-toggle-mobile-text');
  if (btn && txt) {
    if (novoEstado) {
      btn.style.background = '#0284c7';
      btn.style.color = '#ffffff';
      btn.style.borderColor = '#38bdf8';
      btn.style.boxShadow = '0 0 10px rgba(56,189,248,0.5)';
      txt.textContent = 'MOBILE ATIVO';
    } else {
      btn.style.background = 'rgba(56,189,248,0.25)';
      btn.style.color = '#38bdf8';
      btn.style.borderColor = 'rgba(56,189,248,0.5)';
      btn.style.boxShadow = 'none';
      txt.textContent = 'MODO MOBILE';
    }
  }
};

function verificarModoMobileAuto() {
  const isMobile = window.innerWidth <= 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  if (typeof window._forcarMobile === 'undefined') {
    if (isMobile) {
      document.body.classList.add('funcao-mobile-ativa');
    } else {
      document.body.classList.remove('funcao-mobile-ativa');
    }
    const btn = document.getElementById('btn-toggle-mobile');
    const txt = document.getElementById('btn-toggle-mobile-text');
    if (btn && txt) {
      if (isMobile) {
        btn.style.background = '#0284c7';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#38bdf8';
        btn.style.boxShadow = '0 0 10px rgba(56,189,248,0.5)';
        txt.textContent = 'MOBILE ATIVO';
      } else {
        btn.style.background = 'rgba(56,189,248,0.25)';
        btn.style.color = '#38bdf8';
        btn.style.borderColor = 'rgba(56,189,248,0.5)';
        btn.style.boxShadow = 'none';
        txt.textContent = 'MODO MOBILE';
      }
    }
  }
}
window.addEventListener('resize', verificarModoMobileAuto);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', verificarModoMobileAuto);
} else {
  verificarModoMobileAuto();
}

window.abrirBalaoConteudo = function(event, btnOrTitle, textContent) {
  if (event) {
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    if (typeof event.preventDefault === 'function') event.preventDefault();
  }
  fecharBalaoConteudo();
  
  let titulo = '';
  let conteudo = '';
  if (typeof btnOrTitle === 'string') {
    titulo = btnOrTitle;
    conteudo = textContent || '';
  } else if (btnOrTitle && btnOrTitle.dataset) {
    titulo = btnOrTitle.dataset.titulo || '';
    conteudo = btnOrTitle.dataset.conteudo || '';
  }
  
  const overlay = document.createElement('div');
  overlay.id = 'balao-conteudo-overlay';
  overlay.className = 'balao-conteudo-overlay';
  overlay.onclick = function(e) {
    if (e.target === overlay) fecharBalaoConteudo(e);
  };

  overlay.innerHTML = `
    <div class="balao-conteudo-card" onclick="event.stopPropagation()">
      <div class="balao-conteudo-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">🔍</span>
          <span style="font-weight:700; font-size:13px; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px;">${escapeHtml(titulo)}</span>
        </div>
        <button type="button" class="balao-conteudo-close" onclick="fecharBalaoConteudo(event)" title="Fechar">&times;</button>
      </div>
      <div class="balao-conteudo-body">
        ${escapeHtml(conteudo).replace(/\n/g, '<br>')}
      </div>
      <div class="balao-conteudo-footer">
        <button type="button" class="btn-balao-copiar" onclick="copiarTextoBalao(this)">📋 Copiar</button>
        <button type="button" class="btn-balao-ok" onclick="fecharBalaoConteudo(event)">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.fecharBalaoConteudo = function(event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  const el = document.getElementById('balao-conteudo-overlay');
  if (el) el.remove();
};

window.copiarTextoBalao = function(btn) {
  const card = btn.closest('.balao-conteudo-card');
  const body = card ? card.querySelector('.balao-conteudo-body') : null;
  const txt = body ? body.innerText.trim() : '';
  if (txt && navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => {
      btn.textContent = '✅ Copiado!';
      setTimeout(() => { btn.textContent = '📋 Copiar'; }, 2000);
    }).catch(() => {
      alert('Conteúdo copiado.');
    });
  }
};

if (!window._balaoEscListenerAttached) {
  window._balaoEscListenerAttached = true;
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') fecharBalaoConteudo();
  });
}

function renderProcessos() {
  const processos = carregarProcessos();
  const filtrados = getFiltrados();
  const total = filtrados.length;
  const totalPags = Math.ceil(total / state.itensPorPagina);
  if (state.paginaAtual > totalPags) state.paginaAtual = Math.max(1, totalPags);

  const inicio = (state.paginaAtual - 1) * state.itensPorPagina;
  const pagina = filtrados; // Pagination removed

  // Preencher filtros dinâmicos (preencherSelectFiltro preserva seleções existentes)
  const todosProcs = carregarProcessos();
  const distinctStatus = [...new Set([
    ...todosProcs.map(p => p.status),
    ...STATUS_LIST
  ])].filter(s => s && s !== '.' && s !== '****').sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const distinctLocalizacao = [...new Set([
    ...todosProcs.map(p => p.localizacao),
    ...LOCALIZACAO_LIST
  ])].filter(l => l && l !== '.' && l !== '****').sort((a, b) => a.localeCompare(b, 'pt-BR'));

  preencherSelectFiltro('filtro-status',      distinctStatus);
  preencherSelectFiltro('filtro-localizacao', distinctLocalizacao);
  
  const superList = [...new Set(todosProcs.map(p => getSuperPorMunicipio(p.municipio)).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  preencherSelectFiltro('filtro-super', superList);

  preencherSelectFiltro('filtro-municipio',   [...new Set(todosProcs.map(p => p.municipio).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-prefixo',     [...new Set(todosProcs.map(p => p.prefixo).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-objeto',      [...new Set(todosProcs.map(p => p.objeto).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-ano',         [...new Set(todosProcs.map(p => p.ano).filter(Boolean))].sort((a,b)=>b-a));
  preencherSelectFiltro('filtro-agrupamento', [...new Set(todosProcs.map(p => p.agrupamento).filter(Boolean))].sort());
  // Mapeamento de categorias e tipos para exibição amigável
  const MAPA_CATEGORIA = {
    'C': 'C - Conv\u00eanio', 'F': 'F - Fomento', 'T': 'T - Termo de Coopera\u00e7\u00e3o',
    'Convenio': 'C - Conv\u00eanio', 'Conv\u00eanio': 'C - Conv\u00eanio',
    'Fomento': 'F - Fomento', 'Termo de Coopera\u00e7\u00e3o': 'T - Termo de Coopera\u00e7\u00e3o'
  };
  const MAPA_TIPO = {
    'OB': 'OB - Obras', 'MP': 'MP - Mat. Permanente', 'MC': 'MC - Mat. Consumo',
    'SI': 'SI - Sistema', 'TR': 'TR - Treinamento', 'OUT': 'OUT - Outros',
    'Obras': 'OB - Obras', 'Material Permanente': 'MP - Mat. Permanente',
    'Material de Consumo': 'MC - Mat. Consumo', 'Sistema': 'SI - Sistema',
    'Treinamento': 'TR - Treinamento', 'Outros': 'OUT - Outros'
  };
  const categoriasRaw = [...new Set(todosProcs.map(p => p.categoria).filter(Boolean))].sort();
  const tiposRaw      = [...new Set(todosProcs.map(p => p.tipo).filter(Boolean))].sort();
  preencherSelectFiltroMapeado('filtro-categoria', categoriasRaw, MAPA_CATEGORIA);
  preencherSelectFiltroMapeado('filtro-tipo',      tiposRaw,      MAPA_TIPO);

  // Preencher datalists do formulário
  const preencherDatalist = (id, prop) => {
    const dl = document.getElementById(id);
    if (dl) {
      const itens = [...new Set(carregarProcessos().map(p => p[prop]).filter(Boolean))].sort();
      dl.innerHTML = itens.map(i => `<option value="${i}">`).join('');
    }
  };
  preencherDatalist('list-prefixos', 'prefixo');
  preencherDatalist('list-interessados', 'interessado');
  preencherDatalist('list-objetos', 'objeto');
  preencherDatalist('list-agrupamentos', 'agrupamento');
  preencherDatalist('list-municipios', 'municipio');
  preencherDatalist('list-anos', 'ano');
  preencherDatalist('list-status', 'status');
  preencherDatalist('list-localizacao', 'localizacao');
  if (typeof popularDigitosDisponiveis === 'function') popularDigitosDisponiveis();

  // Tabela
  const tbody = document.getElementById('table-processos');
  const busca = state.filtros.busca;

  tbody.innerHTML = pagina.map(p => {
    const isPago = (p.status || '').toString().trim().toUpperCase().includes('PAGO');
    return `
    <tr onclick="abrirDetalhe('${p.id}')" class="${p.alerta === '1' ? 'linha-alerta' : ''} ${p.marca === '1' || p.marca === 'SIM' ? 'linha-marcada' : ''} ${isPago ? 'linha-pago' : ''} process-row ${p.CAM === '1' && p.GAB === '1' && p.CC === '1' ? 'border-autorizado' : 'border-pendente'}">
      <td onclick="event.stopPropagation()" style="text-align: center;"><input type="checkbox" class="check-processo" value="${p.id}" style="cursor:pointer; transform: scale(1.2);"></td>
      <td class="col-prefixo" title="${p.prefixo}">
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <!-- Linha 1: PREFIXO -->
          <div style="display: flex; align-items: center; white-space: nowrap; gap: 4px;">
            <span class="badge ${p.alerta === '1' ? 'badge-prefixo-alert' : 'badge-prefixo-normal'}" style="flex-shrink: 0; font-size: 11px; padding: 2px 6px;">
              ${p.prefixo || '—'}
            </span>
            ${p.ano ? `<span style="padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 10px; color: #cbd5e1; flex-shrink: 0;">${p.ano}</span>` : ''}
          </div>
          <!-- Linha 2: CATEGORIA; TIPO; MARCAÇÃO -->
          <div style="display: flex; flex-wrap: nowrap; gap: 4px; align-items: center; white-space: nowrap; margin-left: -4px;">
            ${getCategoryBadge(p.categoria)}
            ${getTypeBadge(p.tipo)}
            ${p.marca === '1' || p.marca === 'SIM' ? '<span class="badge-marca" title="Processo Marcado - Ver Observações" style="margin-left:4px; font-size:12px; line-height: 1; flex-shrink: 0;">📌</span>' : ''}
          </div>
          <!-- Linha 3: CAM; GAB; CC -->
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 1px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.CAM === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 3px rgba(0,0,0,0.3);" title="CAM"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.GAB === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 3px rgba(0,0,0,0.3);" title="GABINETE"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.CC === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 3px rgba(0,0,0,0.3);" title="CASA CIVIL"></div>
          </div>
        </div>
      </td>
      <td class="col-municipio" title="${p.municipio || ''}">
        <span class="desktop-cell-view">${hl(p.municipio, busca)}</span>
        <span class="mobile-cell-view">${renderMobileCell('Município', p.municipio, 7)}</span>
      </td>
      <td class="col-numero">
        <span class="desktop-cell-view">${p.numero ? p.numero.split(/\s+/).map(n => hl(n, busca)).join('<br>') : '—'}</span>
        <span class="mobile-cell-view">${renderMobileCell('Nº Processo', p.numero, 7)}</span>
      </td>
      <td class="col-interessado" title="${p.interessado}">
        <span class="desktop-cell-view">${hl(p.interessado, busca) || '—'}</span>
        <span class="mobile-cell-view">${renderMobileCell('Interessado', p.interessado, 7)}</span>
      </td>
      <td class="col-objeto" title="${p.objeto}">
        <span class="desktop-cell-view">${p.objeto || '—'}</span>
        <span class="mobile-cell-view">${renderMobileCell('Objeto', p.objeto, 7)}</span>
      </td>
      <td class="col-status" style="text-align: center;">
        <span class="desktop-cell-view"><span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span></span>
        <span class="mobile-cell-view">${renderMobileStatusCell(p.status, 7)}</span>
      </td>
      <td class="col-localizacao" style="text-align: center;">
        <span class="desktop-cell-view">${p.localizacao ? p.localizacao.replace(/\//g, '/<wbr>').replace(/\|/g, '|<wbr>') : '—'}</span>
        <span class="mobile-cell-view">${renderMobileCell('Localização', p.localizacao, 7)}</span>
      </td>
      <td class="col-valor">${formatCurrency(p.valorOf)}</td>
      <td class="col-data" style="text-align: center;">
        <span class="desktop-cell-view">${formatDate(p.data)}</span>
        <span class="mobile-cell-view">${renderMobileDateCell(p.data)}</span>
      </td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="editarProcesso('${p.id}')" title="Editar">✏️</button>
      </td>
    </tr>
  `;}).join('') || `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td colspan="11">
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <h3>Nenhum resultado encontrado</h3>
        <p>Tente ajustar os filtros</p>
      </div>
    </tr>`;

  // Info paginação
  document.getElementById('pg-info').textContent = total === 0
    ? 'Nenhum resultado'
    : `Exibindo ${inicio + 1}–${Math.min(inicio + state.itensPorPagina, total)} de ${total} processos`;

  // Controles paginação
  renderPaginacao(totalPags);

  // Total valor filtrado
  const valorTotal = filtrados.reduce((a, p) => a + (p.valorOf || 0), 0);
  const el = document.getElementById('valor-filtrado');
  if (el) el.innerHTML = `<span>R$</span> <span>${formatCurrency(valorTotal).replace(/^R\$\s*/u, '')}</span>`;

  const elQtd = document.getElementById('qtd-registros-filtrados');
  if (elQtd) elQtd.innerHTML = `<span>${total === 1 ? 'Processo' : 'Processos'}</span> <span>${total.toLocaleString('pt-BR')}</span>`;

  // Botão exportar
  const btnExportar = document.getElementById('btn-exportar');
  if (btnExportar) {
    btnExportar.onclick = () => exportarExcel(filtrados);
  }
}

function hl(txt, busca) {
  if (!busca || !txt) return txt || '';
  const re = new RegExp(`(${busca.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return String(txt).replace(re, '<mark>$1</mark>');
}


// ==========================================
// CONTROLE DE PARÂMETROS DO DÍGITO (=, <>, TODOS)
// ==========================================
window.setDigitoCondicao = function(cond, triggerFilter = true) {
  state.filtros.digitoCond = cond;
  
  const btnEq = document.getElementById('btn-param-digito-eq');
  const btnNeq = document.getElementById('btn-param-digito-neq');

  if (btnEq) {
    if (cond === '=') {
      btnEq.classList.add('active');
      btnEq.style.background = '#10b981';
      btnEq.style.color = '#ffffff';
      btnEq.style.boxShadow = '0 0 8px rgba(16,185,129,0.4)';
    } else {
      btnEq.classList.remove('active');
      btnEq.style.background = 'transparent';
      btnEq.style.color = '#94a3b8';
      btnEq.style.boxShadow = 'none';
    }
  }

  if (btnNeq) {
    if (cond === '<>') {
      btnNeq.classList.add('active');
      btnNeq.style.background = '#f59e0b';
      btnNeq.style.color = '#ffffff';
      btnNeq.style.boxShadow = '0 0 8px rgba(245,158,11,0.4)';
    } else {
      btnNeq.classList.remove('active');
      btnNeq.style.background = 'transparent';
      btnNeq.style.color = '#94a3b8';
      btnNeq.style.boxShadow = 'none';
    }
  }

  if (triggerFilter) {
    state.paginaAtual = 1;
    renderProcessos();
  }
};

window.formatarDigitoInteiro = function(val) {
  if (val === null || val === undefined) return '';
  return window.limparDigitoValor(val);
};

window._antigoFormatarDigito = function(s) {
  return s.replace(/\D/g, '');
};

window.popularDigitosDisponiveis = function() {
  const todosProcs = (typeof carregarProcessos === 'function' ? carregarProcessos() : (window.processosCache || []));
  
  // Limpar e manter apenas valores únicos reais da célula (sem duplicatas como 2 e 2,00)
  const distinctDigitos = [...new Set(
    todosProcs
      .map(p => window.limparDigitoValor(p.digito || p.DIGITO || ''))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const container = document.getElementById('lista-digitos-checkboxes');
  if (container) {
    if (distinctDigitos.length === 0) {
      container.innerHTML = '<div style="padding:8px; color:#94a3b8; font-size:12px; text-align:center;">Nenhum valor cadastrado</div>';
    } else {
      const inputVal = (document.getElementById('filtro-digito')?.value || '').trim();
      const currentSelected = inputVal 
        ? inputVal.split(/[,;\s]+/).map(v => window.limparDigitoValor(v)).filter(Boolean) 
        : [];
      
      // Removida a palavra DÍGITO do dropbox, mantendo somente o valor real da célula (GBZ - v1.2.85)
      container.innerHTML = distinctDigitos.map(dig => {
        const isChecked = currentSelected.includes(dig);
        return `
          <label class="custom-multiselect-item" style="display:flex; align-items:center; padding:6px 10px; cursor:pointer; font-size:12.5px; color:#e2e8f0; user-select:none; gap:8px;">
            <input type="checkbox" class="cb-digito-opcao" value="${dig}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:#3b82f6;">
            <span style="font-weight:600; font-family:inherit;">${dig}</span>
          </label>
        `;
      }).join('');

      container.querySelectorAll('.cb-digito-opcao').forEach(cb => {
        cb.addEventListener('change', () => {
          const cbs = Array.from(container.querySelectorAll('.cb-digito-opcao:checked')).map(c => c.value);
          const fd = document.getElementById('filtro-digito');
          if (fd) {
            fd.value = cbs.join(', ');
            if (cbs.length > 0 && (state.filtros.digitoCond === 'todos' || !state.filtros.digitoCond)) {
              setDigitoCondicao('=', false);
            } else if (cbs.length === 0 && state.filtros.digitoCond === '=') {
              setDigitoCondicao('todos', false);
            }
            state.filtros.digito = fd.value;
            state.paginaAtual = 1;
            renderProcessos();
          }
        });
      });
    }
  }
};

function preencherSelectFiltro(id, opcoes) {
  const sel = document.getElementById(id);
  if (!sel) return;

  let placeholder = 'TODOS';
  if (id === 'filtro-status') placeholder = 'STATUS';
  else if (id === 'filtro-localizacao') placeholder = 'LOCALIZAÇÃO';
  else if (id === 'filtro-municipio') placeholder = 'MUNICÍPIO';
  else if (id === 'filtro-objeto') placeholder = 'OBJETO';
  else if (id === 'filtro-ano') placeholder = 'ANO';
  else if (id === 'filtro-prefixo') placeholder = 'PREFIXO';
  else if (id === 'filtro-agrupamento') placeholder = 'AGRUPAMENTO';
    else if (id === 'filtro-categoria') placeholder = 'CATEGORIA';
  else if (id === 'filtro-tipo') placeholder = 'TIPO';
  else if (id === 'filtro-super') placeholder = 'SUPER';

  // Pegar valores selecionados atualmente via state (não via DOM, que pode estar destruído)
  const campo = id.replace('filtro-', '');
  let selectedArr = state.filtros[campo] || [];
  if (typeof selectedArr === 'string') selectedArr = selectedArr ? [selectedArr] : [];

  // Verificar se as opções mudaram para decidir se reconstrói
  const opcoesAtuais = Array.from(sel.options).map(o => o.value).filter(v => v !== '');
  const opcoesNovas = opcoes.map(String);
  const precisaReconstruir = opcoesAtuais.length !== opcoesNovas.length ||
    opcoesNovas.some((o, i) => o !== opcoesAtuais[i]);

  if (precisaReconstruir) {
    // Reconstrói o HTML com as opções corretas
    sel.innerHTML = `<option value="">${placeholder}</option>` +
      opcoesNovas.map(o => {
        const isSelected = selectedArr.includes(o);
        return `<option value="${o}"${isSelected ? ' selected' : ''}>${o}</option>`;
      }).join('');

    // Inicializa ou reinicializa o multiselect
    if (window.initMultiSelect && sel.multiple) {
      window.initMultiSelect(id);
    }
  } else {
    // Só atualiza o estado das checkboxes sem reconstruir
    if (sel._multiSelectInstance) {
      Array.from(sel.options).forEach(opt => {
        if (opt.value) opt.selected = selectedArr.includes(opt.value);
      });
      const checkboxes = sel._multiSelectInstance.dropdown
        ? sel._multiSelectInstance.dropdown.querySelectorAll('input[type="checkbox"]')
        : [];
      checkboxes.forEach(cb => { cb.checked = selectedArr.includes(cb.value); });
      sel._multiSelectInstance.updateButtonText();
    }
  }
}

/**
 * Igual a preencherSelectFiltro, mas exibe um label amigável para cada value.
 * O value do <option> continua sendo o valor bruto para filtrar corretamente.
 * @param {string} id - ID do select
 * @param {string[]} valores - array de valores brutos vindos dos dados
 * @param {Object} mapa - dicionário { valorBruto: 'Label Amigavel' }
 */
function preencherSelectFiltroMapeado(id, valores, mapa) {
  const sel = document.getElementById(id);
  if (!sel) return;

  const campo = id.replace('filtro-', '');
  let selectedArr = state.filtros[campo] || [];
  if (typeof selectedArr === 'string') selectedArr = selectedArr ? [selectedArr] : [];

  let placeholder = 'TODOS';
  if (id === 'filtro-categoria') placeholder = 'CATEGORIA';
  else if (id === 'filtro-tipo') placeholder = 'TIPO';

  // Montar as opções com label amigável
  const opcoesComLabel = valores.map(v => ({ value: v, label: mapa[v] || v }));

  // Verificar se precisa reconstruir
  const opcoesAtuais = Array.from(sel.options).map(o => o.value).filter(v => v !== '');
  const opcoesNovas  = opcoesComLabel.map(o => o.value);
  const precisaReconstruir = opcoesAtuais.length !== opcoesNovas.length ||
    opcoesNovas.some((v, i) => v !== opcoesAtuais[i]);

  if (precisaReconstruir) {
    sel.innerHTML = `<option value="">${placeholder}</option>` +
      opcoesComLabel.map(o => {
        const isSelected = selectedArr.includes(o.value);
        return `<option value="${o.value}"${isSelected ? ' selected' : ''}>${o.label}</option>`;
      }).join('');

    if (window.initMultiSelect && sel.multiple) {
      window.initMultiSelect(id);
    }
  } else {
    if (sel._multiSelectInstance) {
      Array.from(sel.options).forEach(opt => {
        if (opt.value) opt.selected = selectedArr.includes(opt.value);
      });
      const checkboxes = sel._multiSelectInstance.dropdown
        ? sel._multiSelectInstance.dropdown.querySelectorAll('input[type="checkbox"]')
        : [];
      checkboxes.forEach(cb => { cb.checked = selectedArr.includes(cb.value); });
      sel._multiSelectInstance.updateButtonText();
    }
  }
}

function renderPaginacao(totalPags) {
  const container = document.getElementById('pg-controls');
  container.innerHTML = '';

  const addBtn = (txt, pg, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.textContent = txt;
    btn.disabled = disabled;
    btn.onclick = () => { state.paginaAtual = pg; renderProcessos(); };
    container.appendChild(btn);
  };

  addBtn('‹', state.paginaAtual - 1, state.paginaAtual === 1);

  let start = Math.max(1, state.paginaAtual - 2);
  let end   = Math.min(totalPags, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) addBtn(i, i, false, i === state.paginaAtual);

  addBtn('›', state.paginaAtual + 1, state.paginaAtual === totalPags || totalPags === 0);
}

// ---- FORMULÁRIO / MÁSCARAS ----
function maskProcesso(v) {
  v = v.replace(/\D/g, "");
  if (v.length > 16) v = v.substring(0, 16);
  v = v.replace(/^(\d{4})(\d)/, "$1.$2");
  v = v.replace(/^(\d{4})\.(\d{6})(\d)/, "$1.$2/$3");
  v = v.replace(/^(\d{4})\.(\d{6})\/(\d{4})(\d)/, "$1.$2/$3-$4");
  return v;
}

function maskCurrency(v) {
  v = v.replace(/\D/g, "");
  if (!v) return "";
  v = (parseInt(v, 10) / 100).toFixed(2);
  v = v.replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return v;
}

function parseCurrency(str) {
  if (!str) return 0;
  return Number(str.replace(/\./g, '').replace(',', '.')) || 0;
}

document.addEventListener('input', e => {
  if (e.target.classList.contains('input-currency')) {
    e.target.value = maskCurrency(e.target.value);
  } else if (e.target.classList.contains('form-numero-item')) {
    e.target.value = maskProcesso(e.target.value);
  }
});

function adicionarCampoNumero(val = '') {
  const container = document.getElementById('container-numeros');
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '6px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding:0 12px;height:42px;border-radius:6px;font-weight:700;font-size:16px;flex-shrink:0;" title="Remover processo">-</button>
    <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="width:220px;flex:1;height:42px;font-family:monospace;font-size:13.5px;font-weight:600;padding:0 10px;" value="${val}">
    <button type="button" class="btn btn-ghost btn-copiar-sei" onclick="copiarSeiLinha(this)" style="padding:0 10px;height:42px;border:1px solid var(--border);border-radius:6px;cursor:pointer;color:#38bdf8;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;" title="Copiar SEI">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
    </button>
  `;
  container.appendChild(div);
}

// ---- FORMULÁRIO ----
function renderFormulario() {
  const processo = state.editandoId ? buscarProcessoPorId(state.editandoId) : null;
  const p = processo || {};

  // Preencher selects do formulário
  const fillSelect = (id, lista, val) => {
    const s = document.getElementById(id);
    if (!s) return;
    s.innerHTML = lista.map(o => `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`).join('');
  };

  
  fillSelect('list-status', STATUS_LIST, '');
  fillSelect('list-localizacao', LOCALIZACAO_LIST, '');
  if(document.getElementById('form-status')) document.getElementById('form-status').value = p.status || '';
  if(document.getElementById('form-localizacao')) document.getElementById('form-localizacao').value = p.localizacao || '';

  
  const anos_list = [...new Set(carregarProcessos().map(x => String(x.ano || '')).filter(Boolean))].sort((a,b)=>b-a);
  fillSelect('list-anos', anos_list, '');
  const agrupamentos_list = [...new Set(carregarProcessos().map(x => String(x.agrupamento || '')).filter(Boolean))].sort();
  fillSelect('list-agrupamentos', agrupamentos_list, '');

  if (processo) {
    document.getElementById('form-ano').value         = p.ano          || '';
    document.getElementById('form-agrupamento').value = p.agrupamento  || '';
    document.getElementById('form-digito').value = window.limparDigitoValor(p.digito || p.DIGITO || '');
    document.getElementById('form-prefixo').value     = p.prefixo      || '';
    document.getElementById('form-municipio').value   = p.municipio   || '';
    document.getElementById('form-anotacao').value = p ? (p.anotacao || '') : '';

    const groupHistorico = document.getElementById('group-historico-apontamentos');
    if (groupHistorico) {
      if (getSessaoAtual()?.nivel === 'adm') {
        groupHistorico.style.display = 'block';
        const txtHistorico = document.getElementById('form-historico-acumulado-texto');
        if (txtHistorico) {
          txtHistorico.value = (p.apontamento || '').split(';').map(x => x.trim()).filter(Boolean).join('\n');
        }
        const txtNovo = document.getElementById('form-novo-apontamento');
        if (txtNovo) {
          txtNovo.value = '';
        }
        const chkAlerta = document.getElementById('form-alerta-toggle');
        if (chkAlerta) {
          chkAlerta.checked = p.alerta === '1';
        }
      } else {
        groupHistorico.style.display = 'none';
      }
    }

    // Processar array de números
    const containerNum = document.getElementById('container-numeros');
    containerNum.innerHTML = '';
    const numeros = p.numero ? p.numero.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (numeros.length === 0) numeros.push(''); // add at least one empty
    
    numeros.forEach((num, i) => {
      if (i === 0) {
        containerNum.innerHTML = `
          <div style="display:flex;gap:6px;align-items:center;">
            <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 12px;height:42px;border:1px solid var(--border);border-radius:6px;font-weight:700;font-size:16px;color:#10b981;flex-shrink:0;" title="Adicionar número">+</button>
            <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="width:220px;flex:1;height:42px;font-family:monospace;font-size:13.5px;font-weight:600;padding:0 10px;" value="${num}">
            <button type="button" class="btn btn-ghost btn-copiar-sei" onclick="copiarSeiLinha(this)" style="padding:0 10px;height:42px;border:1px solid var(--border);border-radius:6px;cursor:pointer;color:#38bdf8;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;" title="Copiar SEI">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        `;
      } else {
        adicionarCampoNumero(num);
      }
    });

    document.getElementById('form-interessado').value = p.interessado || '';
    document.getElementById('form-objeto').value      = p.objeto      || '';
    document.getElementById('form-valorOf').value     = p.valorOf ? maskCurrency((p.valorOf * 100).toFixed(0)) : '';
    document.getElementById('form-valorPlan').value   = p.valorPlan ? maskCurrency((p.valorPlan * 100).toFixed(0)) : '';
    document.getElementById('form-data').value        = p.data        || '';
    
    // Set toggles
    const setToggle = (id, val) => {
      const check = document.getElementById(id);
      if (check) {
        check.checked = (val === '1');
      }
    };
    setToggle('form-cam', p.CAM);
    setToggle('form-gab', p.GAB);
    setToggle('form-cc', p.CC);

    document.getElementById('form-obs').value         = p.obs         || '';
    document.getElementById('form-anotacao').value    = p.anotacao    || '';
    document.getElementById('form-marca').checked     = p.marca === '1' || p.marca === 'SIM';
    document.getElementById('form-categoria').value   = p.categoria   || '';
    document.getElementById('form-tipo').value        = p.tipo        || '';
    updateSegmentControl('categoria', p.categoria || '');
    updateSegmentControl('tipo', p.tipo || '');
    contatosTemporarios = p.contatos ? JSON.parse(JSON.stringify(p.contatos)) : [];

    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
    setVal('form-qtdeSala', p.qtdeSala);
    setVal('form-tipoSala', p.tipoSala);
    setVal('form-auditorio', p.auditorio);
    setVal('form-tipoAuditorio', p.tipoAuditorio);
    setVal('form-quadra', p.quadra);
    setVal('form-patio', p.patio);
    setVal('form-refeitorio', p.refeitorio);
    setVal('form-banheiros', p.banheiros);
    setVal('form-demaisObservacoes', p.demaisObservacoes);
    setVal('form-oficioNumero', p.oficioNumero);
    setVal('form-metragemM2', p.metragemM2);
    setVal('form-detalhamentoItens', p.detalhamentoItens);
    if (typeof alternarGuiaFormulario === 'function') alternarGuiaFormulario('objeto');

    renderizarContatosForm();
  } else {
    document.getElementById('form-processo').reset();
    ['form-cam', 'form-gab', 'form-cc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
      const txt = document.getElementById('text-' + id.split('-')[1]);
      if (txt) txt.textContent = 'OFF';
    });
    document.getElementById('form-marca').checked = false;
    document.getElementById('form-ano').value = '';
    document.getElementById('form-agrupamento').value = '';
    document.getElementById('form-digito').value = '';
    document.getElementById('form-categoria').value   = '';
    document.getElementById('form-tipo').value        = '';
    updateSegmentControl('categoria', '');
    updateSegmentControl('tipo', '');
    document.getElementById('container-numeros').innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;">
        <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 12px;height:42px;border:1px solid var(--border);border-radius:6px;font-weight:700;font-size:16px;color:#10b981;flex-shrink:0;" title="Adicionar número">+</button>
        <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="width:220px;flex:1;height:42px;font-family:monospace;font-size:13.5px;font-weight:600;padding:0 10px;">
        <button type="button" class="btn btn-ghost btn-copiar-sei" onclick="copiarSeiLinha(this)" style="padding:0 10px;height:42px;border:1px solid var(--border);border-radius:6px;cursor:pointer;color:#38bdf8;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;" title="Copiar SEI">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
    `;
    contatosTemporarios = [];
    renderizarContatosForm();

    const groupHistorico = document.getElementById('group-historico-apontamentos');
    if (groupHistorico) {
      if (getSessaoAtual()?.nivel === 'adm') {
        groupHistorico.style.display = 'block';
        const txtHistorico = document.getElementById('form-historico-acumulado-texto');
        if (txtHistorico) txtHistorico.value = '';
        const txtNovo = document.getElementById('form-novo-apontamento');
        if (txtNovo) txtNovo.value = '';
        const chkAlerta = document.getElementById('form-alerta-toggle');
        if (chkAlerta) chkAlerta.checked = false;
      } else {
        groupHistorico.style.display = 'none';
      }
    }
  }

  document.getElementById('form-title').textContent = processo ? 'Editar Processo' : 'Novo Processo';

  // Lógica de Apontamento e Histórico
  const currentSessao = typeof getSessaoAtual === 'function' ? getSessaoAtual() : null;
  const userNivel = currentSessao ? currentSessao.nivel : 'leitor';

  const legendDiv = document.getElementById('legend-ultima-edicao');
  const nomeDiv = document.getElementById('ultima-edicao-nome');
  const dataDiv = document.getElementById('ultima-edicao-data');
  
  if (processo) {
    if (legendDiv) {
      legendDiv.style.setProperty('display', 'flex', 'important');
      legendDiv.style.setProperty('flex-direction', 'column', 'important');
    }
    const nomeEdicao = p.ultimaEdicao || '';
    const dataEdicao = p.dataHoraEdicao || '';
    
    const sepDiv = document.getElementById('ultima-edicao-sep');
    if (nomeEdicao || dataEdicao) {
      if (nomeDiv) nomeDiv.innerHTML = '👤 ' + (nomeEdicao || 'Sistema');
      if (dataDiv) dataDiv.innerHTML = dataEdicao ? ('🗓️ ' + dataEdicao) : '';
      if (sepDiv) sepDiv.style.display = (nomeEdicao && dataEdicao) ? 'inline' : 'none';
    } else {
      if (nomeDiv) nomeDiv.innerHTML = '<span style="font-style: italic; color: var(--text-muted);">Sem registros</span>';
      if (dataDiv) dataDiv.innerHTML = '';
      if (sepDiv) sepDiv.style.display = 'none';
    }
  } else {
    if (legendDiv) legendDiv.style.setProperty('display', 'none', 'important');
  }

  const containerExcluir = document.getElementById('container-excluir-form');
  if (containerExcluir) {
    containerExcluir.style.display = processo ? 'flex' : 'none';
  }
}


function updateFormToggleColors() {
  const camEl = document.getElementById('form-cam');
  const gabEl = document.getElementById('form-gab');
  const ccEl  = document.getElementById('form-cc');
  const container = document.getElementById('form-autorizacoes-container');
  if (!container || !camEl || !gabEl || !ccEl) return;
  if (camEl.checked && gabEl.checked && ccEl.checked) {
    container.classList.add('all-on');
  } else {
    container.classList.remove('all-on');
  }
}

function salvarFormulario(e) {
  e.preventDefault();
  
  // Obter todos os números preenchidos
  const inputsNum = Array.from(document.querySelectorAll('input[name="numero[]"]'));
  const numerosJoined = inputsNum.map(i => i.value.trim()).filter(Boolean).join(', ');

  // Capturar contato digitado mas não adicionado (sem clicar no '+')
  const zapEl = document.getElementById('form-contato-whatsapp');
  const detEl = document.getElementById('form-contato-detalhes');
  if (zapEl && detEl) {
    const zap = zapEl.value.trim();
    const det = detEl.value.trim();
    if (zap || det) {
      contatosTemporarios.push({ whatsapp: zap, detalhes: det });
      zapEl.value = '';
      detEl.value = '';
      renderizarContatosForm();
    }
  }

  const valOf = parseCurrency(document.getElementById('form-valorOf').value);
  const valPlan = parseCurrency(document.getElementById('form-valorPlan').value);

  const user = typeof getSessaoAtual === 'function' ? getSessaoAtual() : null;
  const now = new Date();
  const dataHoraStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const dados = {
    prefixo:     document.getElementById('form-prefixo').value.trim().toUpperCase(),
    municipio:   document.getElementById('form-municipio').value.trim(),
    numero:      numerosJoined,
    interessado: document.getElementById('form-interessado').value.trim(),
    objeto:      document.getElementById('form-objeto').value.trim(),
    valorOf:     valOf,
    valorPlan:   valPlan,
    diferenca:   valOf - valPlan,
    status:      document.getElementById('form-status').value,
    localizacao: document.getElementById('form-localizacao').value,
    data:        document.getElementById('form-data').value,
    obs:         document.getElementById('form-obs').value.trim(),
    anotacao:    document.getElementById('form-anotacao').value.trim(),

    qtdeSala:          document.getElementById('form-qtdeSala')?.value.trim() || '',
    tipoSala:          document.getElementById('form-tipoSala')?.value.trim() || '',
    auditorio:         document.getElementById('form-auditorio')?.value.trim() || '',
    tipoAuditorio:     document.getElementById('form-tipoAuditorio')?.value.trim() || '',
    quadra:            document.getElementById('form-quadra')?.value.trim() || '',
    patio:             document.getElementById('form-patio')?.value.trim() || '',
    refeitorio:        document.getElementById('form-refeitorio')?.value.trim() || '',
    banheiros:         document.getElementById('form-banheiros')?.value.trim() || '',
    demaisObservacoes: document.getElementById('form-demaisObservacoes')?.value.trim() || '',
    oficioNumero:       document.getElementById('form-oficioNumero')?.value.trim() || '',
    metragemM2:         document.getElementById('form-metragemM2')?.value.trim() || '',
    detalhamentoItens:  document.getElementById('form-detalhamentoItens')?.value.trim() || '',
    marca:       document.getElementById('form-marca').checked ? '1' : '',
    ano:         document.getElementById('form-ano').value,
    agrupamento: document.getElementById('form-agrupamento').value.trim(),
    digito: window.limparDigitoValor(document.getElementById('form-digito')?.value || ''),
    DIGITO: window.limparDigitoValor(document.getElementById('form-digito')?.value || ''),
    categoria:   document.getElementById('form-categoria').value,
    tipo:        document.getElementById('form-tipo').value,
    CAM:         document.getElementById('form-cam')?.checked ? '1' : '',
    GAB:         document.getElementById('form-gab')?.checked ? '1' : '',
    CC:          document.getElementById('form-cc')?.checked ? '1' : '',
    ultimaEdicao:   user ? (user.nome || user.whatsapp) : 'Sistema',
    dataHoraEdicao: dataHoraStr,
    contatos:    JSON.parse(JSON.stringify(contatosTemporarios))
  };

  if (getSessaoAtual()?.nivel === 'adm') {
    const txtApontamento = document.getElementById('form-historico-acumulado-texto');
    if (txtApontamento) {
      dados.apontamento = txtApontamento.value.split('\n').map(x => x.trim()).filter(Boolean).join('; ');
    }
    const chkAlerta = document.getElementById('form-alerta-toggle');
    if (chkAlerta) {
      dados.alerta = chkAlerta.checked ? '1' : '';
    }
  }

  if (!dados.interessado && !dados.numero) {
    toast('Informe ao menos o Nº do Processo ou o Interessado.', 'error');
    return;
  }

  if (state.editandoId) {

    atualizarProcesso(state.editandoId, dados);
    toast('Processo atualizado com sucesso!', 'success');
    state.editandoId = null;
  } else {
    adicionarProcesso(dados);
    toast('Processo cadastrado com sucesso!', 'success');
    document.getElementById('form-processo').reset();
  }

  navegar('processos');
}

window.confirmarExcluirForm = function() {
  if (state.editandoId) {
    confirmarExcluir(state.editandoId);
  }
};

// ---- DETALHE / MODAL ----
function abrirDetalhe(id) {
  const p = buscarProcessoPorId(id);
  if (!p) return;

  let contatosHtml = '';
  if (p.contatos && p.contatos.length > 0) {
    contatosHtml = `
      <div class="card" style="margin-bottom:16px">
        <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">📞 Contatos</h4>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${p.contatos.map(c => {
            const numeroLimpo = c.whatsapp.replace(/\D/g, '');
            const whatsappFormatado = maskCelular(numeroLimpo);
            return `
            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.02);padding:8px 12px;border-radius:6px;border:1px solid var(--border)">
              <div style="display:flex;flex-direction:column;gap:2px">
                <span style="font-weight:600;font-size:14px;color:var(--text-primary)">${whatsappFormatado}</span>
                ${c.detalhes ? `<span style="font-size:12px;color:var(--text-secondary)">${c.detalhes}</span>` : ''}
              </div>
              <a href="https://web.whatsapp.com/send?phone=55${numeroLimpo}" target="whatsapp_tab" class="btn btn-success" style="padding:6px 12px;display:flex;align-items:center;gap:6px;border-radius:6px;font-size:13px;text-decoration:none;border:none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Mensagem
              </a>
            </div>
          `}).join('')}
        </div>
      </div>`;
  }

  const currentSessao = typeof getSessaoAtual === 'function' ? getSessaoAtual() : null;
  const userNivel = currentSessao ? currentSessao.nivel : 'leitor';
  
  let apontamentoHtml = '';
  if (userNivel === 'leitor') {
    apontamentoHtml = `
      <div class="card" style="margin-bottom:16px; border: 2px solid #22c55e; background: rgba(34, 197, 94, 0.05);">
        <h4 style="font-size:12px;text-transform:uppercase;color:#22c55e;letter-spacing:.5px;margin-bottom:8px">✍️ Novo Apontamento</h4>
        <textarea id="modal-apontamento-texto" placeholder="Digite seu apontamento..." style="width:100%; min-height:80px; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:#fff; font-size:13px; outline:none; margin-bottom:12px;"></textarea>
        <button onclick="salvarApontamentoModal('${p.id}')" id="btn-salvar-apont" style="width:100%; padding:10px; border-radius:6px; border:none; background:#22c55e; color:#fff; font-weight:bold; cursor:pointer;">Salvar Apontamento</button>
      </div>
    `;
  } else if (userNivel === 'adm' && p.apontamento) {
    apontamentoHtml = `
      <div class="card" style="margin-bottom:16px; border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.05);">
        <h4 style="font-size:12px;text-transform:uppercase;color:#f59e0b;letter-spacing:.5px;margin-bottom:8px">📋 Histórico de Apontamentos</h4>
        <div style="font-size:13px; color:#cbd5e1; background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; white-space:pre-wrap; min-height:60px;">${p.apontamento}</div>
      </div>
    `;
  }

  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-content').innerHTML = `
    <div class="detail-header" style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; gap:12px; width:100%;">
        ${p.numero ? `
        <button style="flex:1; padding:12px; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:6px; background:#3b82f6; color:#ffffff; cursor:pointer;" onclick="copiarProcessoSelecionado()" title="Copiar Número">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar
        </button>
        <a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI" target="_blank" class="btn btn-ghost" style="flex:1; padding:12px; display:flex; align-items:center; justify-content:center; background:white; border:1px solid var(--border); border-radius:6px;" title="Acessar SEI">
          <img src="img/logo-sei.png" style="height:24px; object-fit:contain" alt="SEI">
        </a>
        ` : ''}
        <button style="flex:1; padding:12px; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:6px; background:#10b981; color:#ffffff; cursor:pointer;" onclick="editarProcesso('${p.id}');fecharModal()" class="action-editor">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Editar
        </button>
      </div>

      <!-- Indicadores de Autorização (Estilo Moderno) -->
      <div style="display:flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 12px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-top: 4px; margin-bottom: 4px;">
        <div style="display:flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${p.CAM === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 8px ${p.CAM === '1' ? '#10b981' : '#ef4444'};"></div>
          <span style="font-size: 13px; font-weight: 600; color: ${p.CAM === '1' ? '#f8fafc' : '#94a3b8'};">CAM</span>
        </div>
        <div style="width: 1px; height: 20px; background: rgba(255,255,255,0.1);"></div>
        <div style="display:flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${p.GAB === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 8px ${p.GAB === '1' ? '#10b981' : '#ef4444'};"></div>
          <span style="font-size: 13px; font-weight: 600; color: ${p.GAB === '1' ? '#f8fafc' : '#94a3b8'};">GABINETE</span>
        </div>
        <div style="width: 1px; height: 20px; background: rgba(255,255,255,0.1);"></div>
        <div style="display:flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${p.CC === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 8px ${p.CC === '1' ? '#10b981' : '#ef4444'};"></div>
          <span style="font-size: 13px; font-weight: 600; color: ${p.CC === '1' ? '#f8fafc' : '#94a3b8'};">CASA CIVIL</span>
        </div>
      </div>

      <div>
        ${p.prefixo ? `<div style="margin-bottom:8px"><span class="badge-prefixo">${p.prefixo}</span></div>` : ''}
        <div class="detail-numero" style="margin-bottom:12px">
          ${(() => {
            const numerosLista = p.numero ? p.numero.split(',').map(n => n.trim()).filter(Boolean) : [];
            if (numerosLista.length > 0) {
              return `<div style="display:flex; flex-direction:column; gap:8px;">
                ${numerosLista.map((num, idx) => `
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; font-weight:600;">
                    <input type="radio" name="modal_processo_radio" value="${num}" ${idx === 0 ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
                    ${num}
                  </label>
                `).join('')}
              </div>`;
            }
            return '<span style="font-size:14px;font-weight:600">Sem número</span>';
          })()}
        </div>
        <div class="detail-nome" style="font-size:18px; margin-bottom:8px;">${p.interessado || '—'}</div>
        <div>
          <span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span>
        </div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-item"><label>Município</label><p>${p.municipio || '—'}</p></div>
      <div class="info-item"><label>Objeto</label><p>${p.objeto || '—'}</p></div>
      <div class="info-item"><label>Localização</label><p>${p.localizacao || '—'}</p></div>
      <div class="info-item"><label>Data</label><p>${formatDate(p.data)}</p></div>
    </div>


    <div class="card" style="margin-bottom:16px">
      <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">💰 Execução Financeira</h4>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Valor Oficial</div>
          <div style="font-size:18px;font-weight:700;color:var(--blue)">${formatCurrency(p.valorOf)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Valor Planilha</div>
          <div style="font-size:18px;font-weight:700;color:var(--green)">${formatCurrency(p.valorPlan)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Diferença</div>
          <div style="font-size:18px;font-weight:700;color:${(p.diferenca||0) < 0 ? 'var(--red)' : 'var(--yellow)'}">${formatCurrency(p.diferenca)}</div>
        </div>
      </div>
    </div>

    ${p.marca === '1' || p.marca === 'SIM' ? `
      <div class="card" style="margin-bottom:16px; border: 2px solid var(--blue); background: rgba(59, 130, 246, 0.08); display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(59,130,246,0.15);">
        <span style="font-size: 24px;">📜</span>
        <div>
          <strong style="color: var(--blue); font-size: 14px;">Processo Marcado para Atenção!</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-secondary);">Por favor, verifique as observações abaixo.</p>
        </div>
      </div>
    ` : ''}

    ${p.obs ? `
      <div class="card" style="margin-bottom:16px; ${p.marca === '1' || p.marca === 'SIM' ? 'border: 1px solid var(--blue); background: rgba(59, 130, 246, 0.03);' : ''}">
        <h4 style="font-size:12px;text-transform:uppercase;color:${p.marca === '1' || p.marca === 'SIM' ? 'var(--blue)' : 'var(--text-muted)'};letter-spacing:.5px;margin-bottom:8px">📝 Observações</h4>
        <p style="color:var(--text-secondary);font-size:14px">${p.obs}</p>
      </div>
    ` : ''}
    ${(typeof window.isUsuarioAdmin === 'function' && window.isUsuarioAdmin() && p.anotacao) ? `<div class="card action-adm" style="margin-bottom:16px"><h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:8px">📌 Anotação</h4><p style="color:var(--text-secondary);font-size:14px">${p.anotacao}</p></div>` : ''}

    ${contatosHtml}
    ${apontamentoHtml}
  `;
}

window.salvarApontamentoModal = function(id) {
  const textarea = document.getElementById('modal-apontamento-texto');
  if (!textarea) return;
  const apont = textarea.value.trim();
  if (!apont) {
    toast('Digite um apontamento antes de salvar.', 'error');
    return;
  }

  const btn = document.getElementById('btn-salvar-apont');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

  fetch(API_BASE + `/api/registros/${id}/apontamento`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ apontamento: apont })
  }).then(res => res.json()).then(resData => {
    if (btn) { btn.disabled = false; btn.textContent = 'Salvar Apontamento'; }
    if (resData.sucesso) {
      toast('Apontamento salvo com sucesso!', 'success');
      fecharModal();
      inicializarDados();
    } else {
      toast(resData.erro || 'Erro ao salvar', 'error');
    }
  }).catch(err => {
      console.error(err);
      if (btn) { btn.disabled = false; btn.textContent = 'Salvar Apontamento'; }
      toast('Erro de conexão.', 'error');
  });
};

window.gravarApontamentoImediato = function() {
  const input = document.getElementById('form-novo-apontamento');
  const txtHistorico = document.getElementById('form-historico-acumulado-texto');
  if (!input || !txtHistorico) return;

  const texto = input.value.trim();
  if (!texto) {
    toast('Digite um novo apontamento antes de gravar.', 'error');
    return;
  }

  const id = state.editandoId;
  if (!id) {
    toast('Para um novo processo, salve o processo primeiro antes de gravar apontamentos.', 'error');
    return;
  }

  const btn = document.getElementById('btn-gravar-apontamento-edicao');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Gravando...';
  }

  fetch(API_BASE + `/api/registros/${id}/apontamento`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ apontamento: texto })
  })
  .then(res => res.json())
  .then(resData => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>💾</span> Gravar';
    }
    
    if (resData.sucesso) {
      const now = new Date();
      const dh = now.toLocaleString('pt-BR', { timeZone: 'America/Porto_Velho', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
      const sessao = getSessaoAtual();
      const novaMsg = `[${dh}] ${sessao?.nome || sessao?.whatsapp}: ${texto}`;

      const valorAtual = txtHistorico.value.trim();
      txtHistorico.value = valorAtual ? valorAtual + '\n' + novaMsg : novaMsg;

      const chk = document.getElementById('form-alerta-toggle');
      if (chk) chk.checked = true;

      input.value = '';

      const idx = window.processosCache.findIndex(proc => proc.id === id);
      if (idx !== -1) {
        window.processosCache[idx].apontamento = txtHistorico.value.split('\n').map(x => x.trim()).filter(Boolean).join('; ');
        window.processosCache[idx].alerta = '1';
      }

      toast('Apontamento gravado com sucesso na planilha!', 'success');
    } else {
      toast(resData.erro || 'Erro ao gravar apontamento', 'error');
    }
  })
  .catch(err => {
    console.error(err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>💾</span> Gravar';
    }
    toast('Erro de conexão ao gravar apontamento.', 'error');
  });
};

window.limparApontamentoEdicao = function() {
  if (confirm('Tem certeza de que deseja limpar todo o histórico de apontamentos deste processo?')) {
    const txtHistorico = document.getElementById('form-historico-acumulado-texto');
    if (txtHistorico) {
      txtHistorico.value = '';
    }

    const chk = document.getElementById('form-alerta-toggle');
    if (chk) chk.checked = false;

    toast('Histórico limpo localmente. Clique em Salvar Processo para confirmar a limpeza na planilha.', 'info');
  }
};


function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function editarProcesso(id) {
  state.editandoId = id;
  navegar('novo');
}

function novoProcesso() {
  state.editandoId = null;
  navegar('novo');
}

function confirmarExcluir(id) {
  const p = buscarProcessoPorId(id);
  if (!p) return;
  const ident = p.numero || p.interessado || 'Sem Identificação';
  if (confirm(`DESEJA EXCLUIR REGISTRO "${ident}"?`)) {
    if (confirm(`⚠️ ATENÇÃO: ISSO É IRREVERSÍVEL!\n\nEste registro será excludo permanentemente da planilha do Google e não poderá ser recuperado. Deseja realmente prosseguir?`)) {
      excluirProcesso(id);
      toast('Processo excludo com sucesso.', 'info');
      navegar('processos');
    }
  }
}

// ---- IMPORTAÇÃO ----
function setupImportacao() {
  const zone = document.getElementById('import-zone');
  const input = document.getElementById('import-input');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) processarArquivo(e.dataTransfer.files[0]);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) processarArquivo(input.files[0]);
  });
}

async function processarArquivo(file) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    toast('Selecione um arquivo Excel (.xlsx ou .xls)', 'error');
    return;
  }

  document.getElementById('import-status').innerHTML = `
    <div class="loader"><div class="spinner"></div></div>
    <p style="text-align:center;color:var(--text-muted);margin-top:8px">Processando ${file.name}...</p>`;

  try {
    const result = await importarExcel(file);
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.05)">
        <h3 style="color:var(--green);margin-bottom:12px">✅ Importação concluda!</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:14px">
          <div><span style="color:var(--text-muted)">Total na planilha:</span><br><strong>${result.total}</strong></div>
          <div><span style="color:var(--text-muted)">Novos importados:</span><br><strong style="color:var(--green)">${result.novos}</strong></div>
          <div><span style="color:var(--text-muted)">Duplicados ignorados:</span><br><strong style="color:var(--yellow)">${result.duplicados}</strong></div>
        </div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navegar('processos')">Ver Processos →</button>
      </div>`;
    toast(`${result.novos} processos importados!`, 'success');
  } catch (err) {
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(239,68,68,0.3)">
        <h3 style="color:var(--red)">❌ Erro na importação</h3>
        <p style="color:var(--text-muted);margin-top:8px">${err.message}</p>
      </div>`;
    toast('Erro ao importar arquivo.', 'error');
  }
}

async function processarLinkGoogleSheets() {
  const url = document.getElementById('import-gsheets-url').value.trim();
  if (!url) {
    toast('Informe o link da planilha do Google.', 'error');
    return;
  }

  document.getElementById('import-status').innerHTML = `
    <div class="loader"><div class="spinner"></div></div>
    <p style="text-align:center;color:var(--text-muted);margin-top:8px">Baixando dados do Google Sheets...</p>`;

  try {
    const result = await importarGoogleSheets(url);
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.05)">
        <h3 style="color:var(--green);margin-bottom:12px">✅ Importação do GSheets concluda!</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:14px">
          <div><span style="color:var(--text-muted)">Total lidos:</span><br><strong>${result.total}</strong></div>
          <div><span style="color:var(--text-muted)">Novos importados:</span><br><strong style="color:var(--green)">${result.novos}</strong></div>
          <div><span style="color:var(--text-muted)">Duplicados ignorados:</span><br><strong style="color:var(--yellow)">${result.duplicados}</strong></div>
        </div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navegar('processos')">Ver Processos →</button>
      </div>`;
    toast(`${result.novos} processos importados do GSheets!`, 'success');
  } catch (err) {
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(239,68,68,0.3)">
        <h3 style="color:var(--red)">❌ Erro no Google Sheets</h3>
        <p style="color:var(--text-muted);margin-top:8px">${err.message}</p>
      </div>`;
    toast('Erro ao importar Google Sheets.', 'error');
  }
}

// ---- INICIALIZAÇÃO ----
document.addEventListener('DOMContentLoaded', () => {
  // Navegação
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.page === 'novo') novoProcesso();
      else navegar(el.dataset.page);
    });
  });

  // Formulário
  
  // Listeners filtros autorização individuais
  const setupFiltroToggle = (elId, campo) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.addEventListener('change', () => {
      state.filtros[campo] = el.checked;
      state.paginaAtual = 1;
      // Atualiza all-on do container de filtro
      const camF = document.getElementById('filtro-cam');
      const gabF = document.getElementById('filtro-gab');
      const ccF  = document.getElementById('filtro-cc');
      const cont = document.getElementById('filtro-autorizacoes-container');
      if (cont && camF && gabF && ccF) {
        if (camF.checked && gabF.checked && ccF.checked) cont.classList.add('all-on');
        else cont.classList.remove('all-on');
      }
      renderProcessos();
    });
  };
  setupFiltroToggle('filtro-cam', 'cam');
  setupFiltroToggle('filtro-gab', 'gab');
  setupFiltroToggle('filtro-cc',  'cc');

  // Listeners form toggles (atualizar cor)
  ['form-cam', 'form-gab', 'form-cc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateFormToggleColors);
  });

  document.getElementById('form-processo').addEventListener('submit', salvarFormulario);
  document.getElementById('btn-cancelar-form').addEventListener('click', () => navegar('processos'));

  // Fechar modal
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) fecharModal();
  });

  // Filtros
    const aplicarFiltro = (campo, valor) => {
    const el = document.getElementById('filtro-' + campo);
    if (el && el.multiple) {
      state.filtros[campo] = Array.from(el.selectedOptions).map(o => o.value).filter(v => v !== "");
    } else if (el && valor === null) {
      state.filtros[campo] = el.value;
    } else {
      state.filtros[campo] = valor;
    }
    
    // Auto-select municipios when SUPER is selected
    if (campo === 'super') {
      const selectMun = document.getElementById('filtro-municipio');
      if (selectMun && selectMun._multiSelectInstance) {
        const supersSelecionadas = state.filtros.super || [];
        if (supersSelecionadas.length > 0) {
          Array.from(selectMun.options).forEach(opt => {
            if (opt.value === "") return;
            const supDaOption = getSuperPorMunicipio(opt.value);
            opt.selected = supersSelecionadas.includes(supDaOption);
          });
        } else {
          Array.from(selectMun.options).forEach(opt => {
            opt.selected = false;
          });
        }
        // update the multi-select UI
        selectMun._multiSelectInstance.update();
        // sync the state for municipio as well
        state.filtros.municipio = Array.from(selectMun.selectedOptions).map(o => o.value).filter(v => v !== "");
      }
    }
    
    state.paginaAtual = 1;
    renderProcessos();
  };

  document.getElementById('filtro-prefixo')?.addEventListener('change', () => aplicarFiltro('prefixo', null));
  document.getElementById('filtro-busca')?.addEventListener('input', e => aplicarFiltro('busca', e.target.value));
  document.getElementById('filtro-status')?.addEventListener('change', () => aplicarFiltro('status', null));
  document.getElementById('filtro-localizacao')?.addEventListener('change', () => aplicarFiltro('localizacao', null));
  document.getElementById('filtro-super')?.addEventListener('change', () => aplicarFiltro('super', null));
  document.getElementById('filtro-municipio')?.addEventListener('change', () => aplicarFiltro('municipio', null));
  document.getElementById('filtro-objeto')?.addEventListener('change', () => aplicarFiltro('objeto', null));
  document.getElementById('filtro-categoria')?.addEventListener('change', () => aplicarFiltro('categoria', null));
  document.getElementById('filtro-tipo')?.addEventListener('change', () => aplicarFiltro('tipo', null));
  const filtroAnoEl = document.getElementById('filtro-ano');
  if (filtroAnoEl) {
    filtroAnoEl.addEventListener('change', () => aplicarFiltro('ano', null));
  }
    // Botões de condição do filtro de dígito: TODOS, =, <>
  document.getElementById('btn-param-digito-eq')?.addEventListener('click', () => {
    // Se já estiver ativo, desativa voltando para todos
    const novaCond = state.filtros.digitoCond === '=' ? '' : '=';
    setDigitoCondicao(novaCond, true);
  });

  document.getElementById('btn-param-digito-neq')?.addEventListener('click', () => {
    // Se já estiver ativo, desativa voltando para todos
    const novaCond = state.filtros.digitoCond === '<>' ? '' : '<>';
    setDigitoCondicao(novaCond, true);
  });

  // Toggle do dropdown de checkboxes de dígitos
  const btnToggleDigDropdown = document.getElementById('btn-digito-dropdown-toggle');
  const dropdownDigitos = document.getElementById('dropdown-digitos-opcoes');
  if (btnToggleDigDropdown && dropdownDigitos) {
    btnToggleDigDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const isAberto = dropdownDigitos.style.display === 'block';
      document.querySelectorAll('.custom-multiselect-dropdown').forEach(d => {
        if (d !== dropdownDigitos) d.style.display = 'none';
      });
      dropdownDigitos.style.display = isAberto ? 'none' : 'block';
      if (!isAberto && typeof popularDigitosDisponiveis === 'function') popularDigitosDisponiveis();
    });

    document.addEventListener('click', (e) => {
      if (!dropdownDigitos.contains(e.target) && e.target !== btnToggleDigDropdown) {
        dropdownDigitos.style.display = 'none';
      }
    });

    document.getElementById('btn-digito-limpar-checks')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.cb-digito-opcao').forEach(cb => { cb.checked = false; });
      const fd = document.getElementById('filtro-digito');
      if (fd) fd.value = '';
      state.filtros.digito = '';
      setDigitoCondicao('todos', true);
    });
  }

  // Listener no input de dígito com parser inteligente
  const filtroDigitoEl = document.getElementById('filtro-digito');
  if (filtroDigitoEl) {
    filtroDigitoEl.addEventListener('input', (e) => {
      let val = e.target.value;
      
      // Parser inteligente se o usuário digitar "=" ou "<>" ou "!=" no próprio campo
      if (val.startsWith('<>') || val.startsWith('!=')) {
        val = val.replace(/^(<>|!=)\s*/, '');
        e.target.value = val;
        setDigitoCondicao('<>', false);
      } else if (val.startsWith('=')) {
        val = val.replace(/^=\s*/, '');
        e.target.value = val;
        setDigitoCondicao('=', false);
      } else if (val.toLowerCase() === 'todos') {
        val = '';
        e.target.value = '';
        setDigitoCondicao('todos', false);
      } else if (val.trim() !== '') {
        if (state.filtros.digitoCond === 'todos' || !state.filtros.digitoCond) {
          setDigitoCondicao('=', false);
        }
      }

      // Sincroniza checkboxes se houver
      const alvos = val ? val.split(/[,;\s]+/).map(v => v.trim()).filter(Boolean) : [];
      document.querySelectorAll('.cb-digito-opcao').forEach(cb => {
        cb.checked = alvos.includes(cb.value);
      });

      aplicarFiltro('digito', val.trim());
    });
  }
  const filtroAgrupEl = document.getElementById('filtro-agrupamento');
  if (filtroAgrupEl) {
    filtroAgrupEl.addEventListener('change', () => aplicarFiltro('agrupamento', null));

  }

  const filtroAlertaEl = document.getElementById('filtro-alerta');
  if (filtroAlertaEl) {
    filtroAlertaEl.addEventListener('change', e => aplicarFiltro('alerta', e.target.value));
  }

  const filtroMarcaEl = document.getElementById('filtro-marca');
  if (filtroMarcaEl) {
    filtroMarcaEl.addEventListener('change', e => aplicarFiltro('marca', e.target.value));
  }

  document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    state.filtros = { busca: '', status: [], localizacao: [], municipio: [], super: [], objeto: [], prefixo: [], alerta: '', marca: '', categoria: [], tipo: [], autorizacao: '', ano: [], agrupamento: [], digito: '', digitoCond: 'todos' };
    state.paginaAtual = 1;
    document.getElementById('filtro-busca').value = '';
    const fd = document.getElementById('filtro-digito');
    if(fd) fd.value = '';

    // Limpar autorizações (toggles)
    ['filtro-cam', 'filtro-gab', 'filtro-cc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });

    // Limpar todos os selects múltiplos e simples
    ['filtro-status','filtro-localizacao','filtro-super','filtro-municipio','filtro-objeto',
     'filtro-prefixo','filtro-categoria','filtro-tipo','filtro-ano','filtro-agrupamento'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      Array.from(el.options).forEach(opt => { opt.selected = false; });
      if (el._multiSelectInstance) {
        const cbs = el._multiSelectInstance.dropdown
          ? el._multiSelectInstance.dropdown.querySelectorAll('input[type="checkbox"]')
          : [];
        cbs.forEach(cb => { cb.checked = false; });
        el._multiSelectInstance.updateButtonText();
      } else {
        el.value = ''; // para selects normais
      }
    });

    const fa = document.getElementById('filtro-alerta');
    if (fa) fa.value = '';
    const fm = document.getElementById('filtro-marca');
    if (fm) fm.value = '';
    
    renderProcessos();
  });

  // Ordenação — o prefixo agora é multiselect, não text input (sem listener 'input')

  // Ordenação por coluna
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortCol === col) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortCol = col;
        state.sortDir = 'asc';
      }
      document.querySelectorAll('th[data-sort]').forEach(t => t.textContent = t.textContent.replace(/ [▲▼]$/,''));
      th.textContent += state.sortDir === 'asc' ? ' ▲' : ' ▼';
      renderProcessos();
    });
  });

  // Importação
  setupImportacao();

  // Preencher selects de filtro a partir da conexão de dados preservando as legendas
  window.popularFiltrosProcessos = function() {
    const todosProcs = window.processosCache || [];
    if (!todosProcs || todosProcs.length === 0) return;

    const distinctStatus = [...new Set([
      ...todosProcs.map(p => p.status),
      ...STATUS_LIST
    ])].filter(s => s && s !== '.' && s !== '****').sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const distinctLocalizacao = [...new Set([
      ...todosProcs.map(p => p.localizacao),
      ...LOCALIZACAO_LIST
    ])].filter(l => l && l !== '.' && l !== '****').sort((a, b) => a.localeCompare(b, 'pt-BR'));

    if (typeof preencherSelectFiltro === 'function') {
      preencherSelectFiltro('filtro-status', distinctStatus);
      preencherSelectFiltro('filtro-localizacao', distinctLocalizacao);
      
      const superList = [...new Set(todosProcs.map(p => typeof getSuperPorMunicipio === 'function' ? getSuperPorMunicipio(p.municipio) : '').filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      preencherSelectFiltro('filtro-super', superList);

      preencherSelectFiltro('filtro-municipio', [...new Set(todosProcs.map(p => p.municipio).filter(Boolean))].sort());
      preencherSelectFiltro('filtro-prefixo', [...new Set(todosProcs.map(p => p.prefixo).filter(Boolean))].sort());
      preencherSelectFiltro('filtro-objeto', [...new Set(todosProcs.map(p => p.objeto).filter(Boolean))].sort());
      preencherSelectFiltro('filtro-ano', [...new Set(todosProcs.map(p => p.ano).filter(Boolean))].sort((a,b) => b - a));
      preencherSelectFiltro('filtro-agrupamento', [...new Set(todosProcs.map(p => p.agrupamento).filter(Boolean))].sort());

      const MAPA_CATEGORIA = {
        'C': 'C - Convênio', 'F': 'F - Fomento', 'T': 'T - Termo de Cooperação',
        'Convenio': 'C - Convênio', 'Convênio': 'C - Convênio',
        'Fomento': 'F - Fomento', 'Termo de Cooperação': 'T - Termo de Cooperação'
      };
      const MAPA_TIPO = {
        'OB': 'OB - Obras', 'MP': 'MP - Mat. Permanente', 'MC': 'MC - Mat. Consumo',
        'SI': 'SI - Sistema', 'TR': 'TR - Treinamento', 'OUT': 'OUT - Outros',
        'Obras': 'OB - Obras', 'Material Permanente': 'MP - Mat. Permanente',
        'Material de Consumo': 'MC - Mat. Consumo', 'Sistema': 'SI - Sistema',
        'Treinamento': 'TR - Treinamento', 'Outros': 'OUT - Outros'
      };
      const categoriasRaw = [...new Set(todosProcs.map(p => p.categoria).filter(Boolean))].sort();
      const tiposRaw = [...new Set(todosProcs.map(p => p.tipo).filter(Boolean))].sort();
      if (typeof preencherSelectFiltroMapeado === 'function') {
        preencherSelectFiltroMapeado('filtro-categoria', categoriasRaw, MAPA_CATEGORIA);
        preencherSelectFiltroMapeado('filtro-tipo', tiposRaw, MAPA_TIPO);
      }
      if (typeof popularDigitosDisponiveis === 'function') popularDigitosDisponiveis();
    }
  };
  window.popularFiltrosProcessos();

  // Máscara de Celular (WhatsApp)
  const shareNum = document.getElementById("share-whatsapp-number");
  if (shareNum) {
    shareNum.addEventListener("input", (e) => {
      e.target.value = maskCelular(e.target.value);
    });
  }

  // Toggle de Status no modal de acessos
  const statusToggle = document.getElementById("acesso-status-toggle");
  const statusLabel = document.getElementById("acesso-status-label");
  if (statusToggle && statusLabel) {
    statusToggle.addEventListener("change", (e) => {
      statusLabel.textContent = e.target.checked ? "Liberado" : "Bloqueado";
    });
  }

  // Fechar modal de acesso ao clicar fora
  const modalAcessoOverlay = document.getElementById('modal-acesso-overlay');
  if (modalAcessoOverlay) {
    modalAcessoOverlay.addEventListener('click', e => {
      if (e.target === modalAcessoOverlay) fecharModalAcesso();
    });
  }

  // Página inicial
  navegar('dashboard');
});

// ---- EXPORTAÇÃO ----
function exportarExcel() {
  if (window._dropdownJustClosed && Date.now() - window._dropdownJustClosed < 450) {
    return;
  }
  const filtrados = getFiltrados();
  if (filtrados.length === 0) {
    toast('Nenhum processo para exportar.', 'error');
    return;
  }

  const isAdmin = typeof window.isUsuarioAdmin === 'function' && window.isUsuarioAdmin();

  const data = filtrados.map(p => {
    const row = {
      "Prefixo": p.prefixo || '',
      "Município": p.municipio || '',
      "Nº Processo": p.numero || '',
      "Interessado": p.interessado || '',
      "Objeto": p.objeto || '',
      "Status": p.status || '',
      "Localização": p.localizacao || '',
      "Valor Oficial": p.valorOf || 0,
      "Valor Planilha": p.valorPlan || 0,
      "Data": p.data ? formatDate(p.data) : ''
    };
    // Campos confidenciais: visíveis SOMENTE ao perfil ADMIN
    if (isAdmin) {
      row["Agrupamento"] = p.agrupamento || '';
      row["Dígito"] = p.digito || p.DIGITO || '';
      row["Anotação Interna"] = p.anotacao || '';
    }
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Processos");
  XLSX.writeFile(workbook, "Relatorio_Processos_SEDUC.xlsx");
}

function exportarPDF() {
  const filtrados = getFiltrados();
  if (filtrados.length === 0) {
    toast('Nenhum processo para exportar.', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape', 'mm', 'a4');

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const userElement = document.getElementById('user-name');
  const userName = userElement ? userElement.textContent : 'Admin';
  const dateTimeStr = "Impresso em: " + dateStr + " às " + timeStr + " | Usuário: " + userName;

  const tableColumn = ["Prefixo", "Município", "Nº Processo", "Interessado", "Objeto", "Status", "Localização", "Valor Oficial", "Data"];
  
  const tableRows = filtrados.map(p => {
    const num = p.numero ? p.numero.replace(/, /g, '\n') : '';
    return [
      p.prefixo || '',
      p.municipio || '',
      num,
      p.interessado || '',
      p.objeto || '',
      p.status || '',
      p.localizacao || '',
      p.valorOf ? maskCurrency((p.valorOf * 100).toFixed(0)) : 'R$ 0,00',
      p.data ? formatDate(p.data) : ''
    ];
  });

  const totalPagesExp = "{total_pages_count_string}";

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: function (data) {
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text("CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS | SEDUC - RO", 14, 20);
      
      const str = "Página " + data.pageNumber + " de " + totalPagesExp;
      doc.setFontSize(8);
      doc.setTextColor(100);
      
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      
      doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(dateTimeStr, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }
  });

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  doc.autoPrint();
  const blob = doc.output("blob");
  window.open(URL.createObjectURL(blob), '_blank');
}




window.addEventListener('beforeprint', () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const el = document.getElementById('print-date-time');
  if (el) {
    el.innerHTML = "Emitido em: " + dateStr + ", às " + timeStr;
  }
});


let contatosTemporarios = [];

function maskTelefone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
  if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10);
  input.value = v;
}

function adicionarContato() {
  const zapEl = document.getElementById('form-contato-whatsapp');
  const detEl = document.getElementById('form-contato-detalhes');
  const zap = zapEl.value.trim();
  const det = detEl.value.trim();
  
  if (!zap) {
    toast('Preencha o número do WhatsApp', 'error');
    return;
  }
  
  contatosTemporarios.push({ whatsapp: zap, detalhes: det });
  zapEl.value = '';
  detEl.value = '';
  renderizarContatosForm();
}

function removerContato(index) {
  contatosTemporarios.splice(index, 1);
  renderizarContatosForm();
}

function renderizarContatosForm() {
  const container = document.getElementById('lista-contatos');
  if (!container) return;
  container.innerHTML = '';
  
  contatosTemporarios.forEach((c, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:8px 12px; border-radius:6px; border:1px solid var(--border);';
    
    const numeroLimpo = c.whatsapp.replace(/\D/g, '');
    const whatsappFormatado = maskCelular(numeroLimpo);
    
    div.innerHTML = "<div style=\"display:flex; flex-direction:column; gap:2px;\">" +
      "<span style=\"font-weight:600; color:var(--text-primary); font-size:13px;\">💬 " + whatsappFormatado + "</span>" +
      (c.detalhes ? "<span style=\"color:var(--text-secondary); font-size:12px;\">" + c.detalhes + "</span>" : "****") +
      "</div>" +
      "<button type=\"button\" class=\"btn btn-ghost btn-sm\" onclick=\"removerContato(" + idx + ")\" style=\"color:var(--red); padding: 2px;\">❌</button>";
      
    container.appendChild(div);
  });
}




// ---- FUNÇÃO PARA COPIAR PROCESSO SELECIONADO ----
window.copiarProcessoSelecionado = function() {
  const radio = document.querySelector('input[name="modal_processo_radio"]:checked');
  if (radio) {
    navigator.clipboard.writeText(radio.value);
    toast('Número copiado!', 'success');
  } else {
    toast('Nenhum número selecionado', 'error');
  }
};



// ==================== IMPRESSÕES ====================


function getFormattedDateForTitle() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${d}${m}${y}_${h}${min}${s}`;
}

function getCommonHeader(subtitle) {
  return `
    <div class="official-print-header" style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #0284c7; padding-bottom:6px; margin-bottom:10px; width:100%; font-family: Arial, sans-serif;">
      <div style="text-align:left; line-height:1.25;">
        <div style="font-size:10px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.4px;">GOVERNO DO ESTADO DE RONDÔNIA</div>
        <div style="font-size:10px; font-weight:700; color:#0284c7; text-transform:uppercase;">SEDUC - SECRETARIA DE ESTADO DA EDUCAÇÃO</div>
        <div style="font-size:10px; font-weight:700; color:#334155; text-transform:uppercase;">CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS</div>
      </div>
      <div style="text-align:right;">
        
      </div>
    </div>
    ${subtitle ? `<div style="font-size:11px; font-weight:700; color:#1e3a8a; text-transform:uppercase; margin-bottom:8px; font-family: Arial, sans-serif;">${subtitle}</div>` : ''}
  `;
}

function injectFixedHeader(subtitle) {
  let header = document.getElementById('fixed-print-header');
  if (!header) {
    header = document.createElement('div');
    header.id = 'fixed-print-header';
    header.className = 'print-only fixed-header';
    document.body.appendChild(header);
  }
  header.innerHTML = getCommonHeader(subtitle);
}

function getCommonFooter(gerenciaCustom) {
  const gerenciaTexto = gerenciaCustom || 'GDSM - GERÊNCIA DE DIAGNÓSTICO SITUACIONAL DOS MUNICÍPIOS';
  const agora = new Date();
  const dataHora = agora.toLocaleDateString('pt-BR') + ', ' + agora.toLocaleTimeString('pt-BR');
  return `
    <div class="official-print-footer" style="border-top:1px solid #cbd5e1; padding-top:6px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-family: Arial, sans-serif; font-size:8pt; width:100%; color:#475569;">
      <div style="flex:1; text-align:left; font-weight:700; color:#0f172a;">${gerenciaTexto}</div>
      <div style="flex:1; text-align:center; font-weight:600; color:#64748b;">Página 1 de 1</div>
      <div style="flex:1; text-align:right; font-weight:500; color:#64748b;">Documento gerado eletronicamente em <span class="print-date-time-rodape">${dataHora}</span></div>
    </div>
  `;
}

function updatePrintDateTime() {
  const agora = new Date();
  const d = agora.toLocaleDateString('pt-BR');
  const t = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.querySelectorAll('.print-date-time-rodape').forEach(el => {
    el.innerHTML = `${d} / ${t}`;
  });
}

function injectFixedFooter() { /* Removed - using browser native footer */ }


window.formatNumberOnly = function(valor) {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


function injectPrintHeader(subtitle) { /* disabled */ }

function imprimirPadrao(filtrados = getFiltrados()) {
      if (window._dropdownJustClosed && Date.now() - window._dropdownJustClosed < 450) {
        return;
      }
      updatePrintDateTime();
      updatePrintDateTime();
      
      let rowsHtml = filtrados.map((p, index) => {
        
        
        
        
        const prefixoFormatado = `
          <div style="font-family: Arial, sans-serif; font-size: 9px; line-height: 1.2;">
            <div style="font-weight: bold; margin-bottom: 2px;">${p.prefixo || '-'}</div>
            <div style="display: flex; align-items: center; white-space: nowrap; gap: 2px; font-size: 8px;">
              <span>${p.categoria || '-'}</span><span style="color:#999;">|</span><span>${p.tipo || '-'}</span><span style="color:#999;">|</span>
              <div style="display: flex; font-size: 15px; line-height: 1; color: #000; align-items: center; margin-left: 1px;">
                <span title="CAM">${p.CAM === '1' ? '&#9679;' : '&#9675;'}</span>
                <span title="GABINETE" style="margin-left: -2px;">${p.GAB === '1' ? '&#9679;' : '&#9675;'}</span>
                <span title="CASA CIVIL" style="margin-left: -2px;">${p.CC === '1' ? '&#9679;' : '&#9675;'}</span>
              </div>
            </div>
          </div>
        `;
        return `
          <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
            <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:3%;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">${prefixoFormatado}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:11%;">${p.municipio || '-'}</td>
            <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:12%;">${(p.numero || '-').replace(/\s+/g, '<br>')}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:15%;">${p.interessado || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:22%;">${p.objeto || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px; width:8%;">${p.status || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">${p.localizacao || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:7%;">${formatDate(p.data)}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px; width:8%;">${formatNumberOnly(p.valorOf)}</td>
          </tr>
        `;
      }).join('');
      const totalValorPadrao = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
      const totalRowPadrao = `
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold; background:#f9fafb;">
          <td colspan="9" style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">TOTAL GERAL (${filtrados.length} processos):</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">${formatNumberOnly(totalValorPadrao)}</td></tr>`;
      rowsHtml += totalRowPadrao;

      const html = `
        <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
          <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('Lista de Processos')}</td></tr></thead>
          <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
            <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">
              <colgroup>
                <col style="width: 3%;">
                <col style="width: 7%;">
                <col style="width: 11%;">
                <col style="width: 12%;">
                <col style="width: 15%;">
                <col style="width: 22%;">
                <col style="width: 8%;">
                <col style="width: 7%;">
                <col style="width: 7%;">
                <col style="width: 8%;">
              </colgroup>
              <thead>
                <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background-color:#1e3a8a;"><th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:center; width:3%; font-size:10.5px; font-weight:bold;">Nº</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">PREFIXO</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:11%; font-size:10.5px; font-weight:bold;">MUNICÍPIO</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:12%; font-size:10.5px; font-weight:bold;">PROCESSO SEI</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:15%; font-size:10.5px; font-weight:bold;">INTERESSADO</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:22%; font-size:10.5px; font-weight:bold;">OBJETO / FINALIDADE</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:8%; font-size:10.5px; font-weight:bold;">STATUS</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">LOCAL</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:center; width:7%; font-size:10.5px; font-weight:bold;">DATA</th>
                  <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:right; width:8%; font-size:10.5px; font-weight:bold;">VALOR R$</th>
                </tr>
              </thead>
              ${rowsHtml || '<tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td colspan="10" style="text-align:center; padding: 10px; font-size:10px;">Nenhum processo encontrado.</td></tr></tbody>'}
            </table>
          </td></tr></tbody>
          <tfoot><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonFooter()}</td></tr></tfoot>
        </table>
      `;
      
      let container = document.getElementById('print-layout-padrao');
      if (!container) {
        container = document.createElement('div');
        container.id = 'print-layout-padrao';
        container.className = 'print-only-layout';
        document.body.appendChild(container);
      }
      container.innerHTML = html;
      
      document.getElementById('print-layout-detalhado').style.display = 'none';
      document.getElementById('print-layout-analise').style.display = 'none';
      container.style.display = 'block';
      
      document.body.classList.add('print-mode-padrao');
      document.body.classList.remove('print-mode-detalhado', 'print-mode-analise');

      const origTitle = document.title;
      document.title = 'CAM_PADRAO_' + getFormattedDateForTitle();

      const style = document.createElement('style');
      style.innerHTML = '@media print { @page { size: A4 landscape !important; margin: 10mm !important; } table.print-table-detalhado th { background-color: #1e3a8a !important; color: #ffffff !important; border: 1px solid #93c5fd !important; } }';
      document.head.appendChild(style);

      window.print();

      setTimeout(() => {
        document.title = origTitle;
        if (document.head.contains(style)) document.head.removeChild(style);
        document.body.classList.remove('print-mode-padrao');
        container.style.display = 'none';
      }, 1000);
    };


window.imprimirPadrao = imprimirPadrao;

// ============= RELATÓRIO PADRÃO ADM (SEM INFORMAÇÕES DE ORIGEM) =============
function imprimirPadraoAdm(filtrados = getFiltrados()) {
  if (typeof window.isUsuarioAdmin === 'function' && !window.isUsuarioAdmin()) {
    alert('Acesso restrito ao perfil Administrador.');
    return;
  }

  let rowsHtml = filtrados.map((p, index) => {
    const prefixoFormatado = `
      <div style="font-family: Arial, sans-serif; line-height: 1.2;">
        <div style="font-size: 7px; font-weight: normal; margin-bottom: 2px; color: #0f172a;">${p.prefixo || '-'}</div>
        <div style="display: flex; align-items: center; white-space: nowrap; gap: 2px; font-size: 8px;">
          <span style="font-weight:normal;">${p.categoria || '-'}</span><span style="color:#94a3b8;">|</span><span style="font-weight:normal;">${p.tipo || '-'}</span><span style="color:#94a3b8;">|</span>
          <div style="display: flex; font-size: 14px; line-height: 1; color: #0f172a; align-items: center; margin-left: 1px;">
            <span title="CAM">${p.CAM === '1' ? '&#9679;' : '&#9675;'}</span>
            <span title="GABINETE" style="margin-left: -2px;">${p.GAB === '1' ? '&#9679;' : '&#9675;'}</span>
            <span title="CASA CIVIL" style="margin-left: -2px;">${p.CC === '1' ? '&#9679;' : '&#9675;'}</span>
          </div>
        </div>
      </div>
    `;
    const zebraBg = index % 2 === 1 ? 'background-color:#f8fafc;' : 'background-color:#ffffff;';
    return `
      <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; ${zebraBg}">
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-align:center; font-size:9.5px; font-weight:normal; color:#475569; width:3%;">${index + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:7%;">${prefixoFormatado}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:11%;">${p.municipio || '-'}</td>
        <td class="col-numero" style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; white-space:normal; word-wrap:break-word; width:12%;">${(p.numero || '-').replace(/\s+/g, '<br>')}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:14%;">${p.interessado || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; white-space:normal; word-wrap:break-word; width:19%;">${p.objeto || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-transform: uppercase; font-size:9.5px; font-weight:normal; width:8%;">${p.status || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:7%;">${p.localizacao || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-align:center; font-size:9.5px; font-weight:normal; width:7%;">${formatDate(p.data)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 3px 4px; text-align:right; font-size:9.5px; font-weight:normal; width:12%; white-space:nowrap;">${formatNumberOnly(p.valorOf)}</td>
      </tr>
    `;
  }).join('');

  const totalValor = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  const totalRow = `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background:#f1f5f9; border-top:2px solid #0f172a; border-bottom:2px solid #0f172a;">
      <td colspan="9" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align:right; font-size:11.5px; color:#0f172a; text-transform:uppercase; font-weight:bold; white-space:nowrap;">TOTAL GERAL (${filtrados.length} processos):</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align:right; font-size:12.5px; color:#0f172a; font-weight:bold; white-space:nowrap !important;">${formatNumberOnly(totalValor)}</td>
    </tr>`;
  rowsHtml += totalRow;

  const html = `
    <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
      <thead>
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
          <td>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; font-family: Arial, sans-serif;">
              <div>
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase;">LISTA DE PROCESSOS</div>
              </div>
              <div style="text-align:right; font-size: 9.5px; color: #475569; font-weight: 600;">
                <span>Total: <strong style="color:#0f172a;">${filtrados.length} processos</strong></span>
                <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                <span>Valor Total: <strong style="color:#0f172a;">R$ ${formatNumberOnly(totalValor)}</strong></span>
              </div>
            </div>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
          <td>
            <table class="print-table-adm" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:10px;">
              <colgroup>
                <col style="width: 3%;">
                <col style="width: 7%;">
                <col style="width: 11%;">
                <col style="width: 12%;">
                <col style="width: 14%;">
                <col style="width: 19%;">
                <col style="width: 8%;">
                <col style="width: 7%;">
                <col style="width: 7%;">
                <col style="width: 12%;">
              </colgroup>
              <thead>
                <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background-color:#0f172a;">
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:center; width:3%; font-size:10px; font-weight:bold;">Nº</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:7%; font-size:10px; font-weight:bold;">PREFIXO</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:11%; font-size:10px; font-weight:bold;">MUNICÍPIO</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:12%; font-size:10px; font-weight:bold;">PROCESSO SEI</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:14%; font-size:10px; font-weight:bold;">INTERESSADO</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:19%; font-size:10px; font-weight:bold;">OBJETO / FINALIDADE</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:8%; font-size:10px; font-weight:bold;">STATUS</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:7%; font-size:10px; font-weight:bold;">LOCAL</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:center; width:7%; font-size:10px; font-weight:bold;">DATA</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 3px; text-align:right; width:12%; font-size:10px; font-weight:bold; white-space:nowrap;">VALOR R$</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="10" style="text-align:center; padding: 10px; font-size:10px;">Nenhum processo encontrado.</td></tr>'}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
          <td>
            <div style="margin-top: 8px; border-top: 1.5px solid #cbd5e1; padding-top: 5px; font-family: Arial, sans-serif; font-size: 8px; color: #334155; line-height: 1.4;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <strong style="color: #0f172a; text-transform: uppercase; font-weight: 700;">LEGENDA:</strong>
                  <span>C = Convênio &nbsp;|&nbsp; F = Fomento &nbsp;|&nbsp; OB = Obras &nbsp;|&nbsp; MP = Material Permanente &nbsp;|&nbsp; MC = Material Consumo</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <strong style="color: #0f172a; text-transform: uppercase; font-weight: 700;">AUTORIZAÇÕES:</strong>
                  <span>(1ª CAM &nbsp;|&nbsp; 2ª GAB SEDUC &nbsp;|&nbsp; 3ª CASA CIVIL) &nbsp;&bull;&nbsp; <span style="font-size: 9px; line-height: 1;">●</span> Autorizado &nbsp;|&nbsp; <span style="font-size: 9px; line-height: 1;">○</span> Pendente</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  `;

  let container = document.getElementById('print-layout-padrao-adm');
  if (!container) {
    container = document.createElement('div');
    container.id = 'print-layout-padrao-adm';
    container.className = 'print-only-layout';
    document.body.appendChild(container);
  }
  container.innerHTML = html;

  if (document.getElementById('print-layout-padrao')) document.getElementById('print-layout-padrao').style.display = 'none';
  if (document.getElementById('print-layout-detalhado')) document.getElementById('print-layout-detalhado').style.display = 'none';
  if (document.getElementById('print-layout-analise')) document.getElementById('print-layout-analise').style.display = 'none';
  container.style.display = 'block';

  const pageProcessos = document.getElementById('page-processos');
  if (pageProcessos) pageProcessos.style.display = 'none';

  document.body.classList.add('print-mode-padrao-adm');
  document.body.classList.remove('print-mode-padrao', 'print-mode-detalhado', 'print-mode-analise');

  const origTitle = document.title;
  document.title = 'RELATORIO_PROCESSOS_' + getFormattedDateForTitle();

  const style = document.createElement('style');
  style.innerHTML = '@media print { @page { size: A4 landscape !important; margin: 8mm !important; } .sidebar, .topbar, .section-header, .filters-bar, .table-wrap, .pagination, #export-buttons, .charts-grid, .dashboard, .modal-overlay, #page-processos, .page { display: none !important; } #print-layout-padrao-adm { display: block !important; position: static !important; width: 100% !important; background: white !important; } table.print-table-adm th { background-color: #0f172a !important; color: #ffffff !important; border: 1px solid #334155 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } table.print-table-adm tr:nth-child(even) td { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } table.print-table-adm td:last-child, table.print-table-adm th:last-child { white-space: nowrap !important; } table.print-table-adm tr.group-header-digito, table.print-table-adm tr.group-header-digito td { background-color: #008080 !important; color: #ffffff !important; border-color: #005f5f !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }';
  document.head.appendChild(style);

  const cleanupPrint = () => {
    document.title = origTitle;
    if (document.head.contains(style)) document.head.removeChild(style);
    document.body.classList.remove('print-mode-padrao-adm');
    container.style.display = 'none';
    if (pageProcessos) pageProcessos.style.display = '';
    window.removeEventListener('afterprint', cleanupPrint);
  };

  window.addEventListener('afterprint', cleanupPrint);

  window.print();

  setTimeout(cleanupPrint, 1000);
}

window.imprimirPadraoAdm = imprimirPadraoAdm;

window.imprimirPadraoAdm = imprimirPadraoAdm;

// ============= RELATÓRIO ADM 2 (AGRUPADO POR DÍGITO C/ LINHA MEMORANDO) =============
function imprimirPadraoAdm2(filtrados = getFiltrados()) {
  if (typeof window.isUsuarioAdmin === 'function' && !window.isUsuarioAdmin()) {
    alert('Acesso restrito ao perfil Administrador.');
    return;
  }

  // Agrupamento por Dígito
  const grupos = {};
  filtrados.forEach(p => {
    const dRaw = typeof window.limparDigitoValor === 'function' 
      ? window.limparDigitoValor(p.digito || p.DIGITO || '') 
      : String(p.digito || p.DIGITO || '').trim();
    const chave = dRaw || 'SEM DÍGITO';
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(p);
  });

  const chavesOrdenadas = Object.keys(grupos).sort((a, b) => {
    if (a === 'SEM DÍGITO') return 1;
    if (b === 'SEM DÍGITO') return -1;
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  let globalIndex = 0;
  let rowsHtml = '';

  chavesOrdenadas.forEach(chave => {
    const procs = grupos[chave];
    const totalGrupo = procs.reduce((acc, p) => acc + (p.valorOf || 0), 0);

    // Linha de Cabeçalho do Grupo com cor padrão #008080, sem palavra DÍGITO e sem negrito
    rowsHtml += `
      <tr class="no-page-break group-header-digito" style="page-break-inside: avoid; break-inside: avoid; background-color: #008080 !important; color: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <td colspan="10" style="border: 1px solid #005f5f; background-color: #008080 !important; color: #ffffff !important; padding: 5px 8px; font-size: 10px; font-weight: normal; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
          <span style="color: #ffffff !important; font-weight: normal; letter-spacing: 0.5px;">${chave}</span>
          <span style="margin-left: 12px; font-weight: normal; font-size: 9px; color: #ffffff !important;">(${procs.length} processos &bull; R$ ${formatNumberOnly(totalGrupo)})</span>
        </td>
      </tr>
    `;

    procs.forEach(p => {
      globalIndex++;
      const prefixoFormatado = `
        <div style="font-family: Arial, sans-serif; line-height: 1.2;">
          <div style="font-size: 7px; font-weight: normal; margin-bottom: 2px; color: #0f172a;">${p.prefixo || '-'}</div>
          <div style="display: flex; align-items: center; white-space: nowrap; gap: 2px; font-size: 8px;">
            <span style="font-weight:normal;">${p.categoria || '-'}</span><span style="color:#94a3b8;">|</span><span style="font-weight:normal;">${p.tipo || '-'}</span><span style="color:#94a3b8;">|</span>
            <div style="display: flex; font-size: 14px; line-height: 1; color: #0f172a; align-items: center; margin-left: 1px;">
              <span title="CAM">${p.CAM === '1' ? '&#9679;' : '&#9675;'}</span>
              <span title="GABINETE" style="margin-left: -2px;">${p.GAB === '1' ? '&#9679;' : '&#9675;'}</span>
              <span title="CASA CIVIL" style="margin-left: -2px;">${p.CC === '1' ? '&#9679;' : '&#9675;'}</span>
            </div>
          </div>
        </div>
      `;
      const zebraBg = globalIndex % 2 === 1 ? 'background-color:#f8fafc;' : 'background-color:#ffffff;';

      // Linha Principal do Processo (sem negritos)
      rowsHtml += `
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; ${zebraBg}">
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-align:center; font-size:9.5px; font-weight:normal; color:#475569; width:3%;">${globalIndex}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:7%;">${prefixoFormatado}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:11%;">${p.municipio || '-'}</td>
          <td class="col-numero" style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; white-space:normal; word-wrap:break-word; width:12%;">${(p.numero || '-').replace(/\s+/g, '<br>')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:14%;">${p.interessado || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; white-space:normal; word-wrap:break-word; width:19%;">${p.objeto || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-transform: uppercase; font-size:9.5px; font-weight:normal; width:8%;">${p.status || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:7%;">${p.localizacao || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-align:center; font-size:9.5px; font-weight:normal; width:7%;">${formatDate(p.data)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 4px; text-align:right; font-size:9.5px; font-weight:normal; width:12%; white-space:nowrap;">${formatNumberOnly(p.valorOf)}</td>
        </tr>
      `;

      // Linha Memorando: "AGRUPAMENTO" - "ANOTAÇÃO INTERNA" (itálico vermelho na largura da tabela)
      const partesMemo = [];
      if (p.agrupamento && String(p.agrupamento).trim()) {
        partesMemo.push(String(p.agrupamento).trim());
      }
      if (p.anotacao && String(p.anotacao).trim()) {
        partesMemo.push(String(p.anotacao).trim());
      }

      if (partesMemo.length > 0) {
        const memoTexto = partesMemo.join(' - ');
        rowsHtml += `
          <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background-color: #fff9f9;">
            <td colspan="10" style="border: 1px solid #cbd5e1; border-top: none; padding: 2px 8px 3px 12px; font-size: 8.5px; font-style: italic; color: #dc2626; line-height: 1.3;">
              ${memoTexto}
            </td>
          </tr>
        `;
      }
    });
  });

  const totalValor = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  const totalRow = `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background:#f1f5f9; border-top:2px solid #0f172a; border-bottom:2px solid #0f172a;">
      <td colspan="9" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align:right; font-size:11.5px; color:#0f172a; text-transform:uppercase; font-weight:bold; white-space:nowrap;">TOTAL GERAL (${filtrados.length} processos):</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align:right; font-size:12.5px; color:#0f172a; font-weight:bold; white-space:nowrap !important;">${formatNumberOnly(totalValor)}</td>
    </tr>`;
  rowsHtml += totalRow;

  const html = `
    <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
      <thead>
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
          <td>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; font-family: Arial, sans-serif;">
              <div>
                <div style="font-size: 13px; font-weight: normal; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase;">LISTA DE PROCESSO | GRUPO</div>
              </div>
              <div style="text-align:right; font-size: 9.5px; color: #475569; font-weight: normal;">
                <span>Total: <span style="color:#0f172a;">${filtrados.length} processos</span></span>
                <span style="margin: 0 8px; color: #cbd5e1;">|</span>
                <span>Valor Total: <span style="color:#0f172a;">R$ ${formatNumberOnly(totalValor)}</span></span>
              </div>
            </div>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
          <td>
            <table class="print-table-adm" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:10px;">
              <colgroup>
                <col style="width: 3%;">
                <col style="width: 7%;">
                <col style="width: 11%;">
                <col style="width: 12%;">
                <col style="width: 14%;">
                <col style="width: 19%;">
                <col style="width: 8%;">
                <col style="width: 7%;">
                <col style="width: 7%;">
                <col style="width: 12%;">
              </colgroup>
              <thead>
                <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background-color:#0f172a;">
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:center; width:3%; font-size:10px; font-weight:normal;">Nº</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:7%; font-size:10px; font-weight:normal;">PREFIXO</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:11%; font-size:10px; font-weight:normal;">MUNICÍPIO</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:12%; font-size:10px; font-weight:normal;">PROCESSO SEI</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:14%; font-size:10px; font-weight:normal;">INTERESSADO</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:19%; font-size:10px; font-weight:normal;">OBJETO / FINALIDADE</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:8%; font-size:10px; font-weight:normal;">STATUS</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:left; width:7%; font-size:10px; font-weight:normal;">LOCAL</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 2px; text-align:center; width:7%; font-size:10px; font-weight:normal;">DATA</th>
                  <th style="color:#ffffff; background-color:#0f172a; border: 1px solid #334155; padding: 4px 3px; text-align:right; width:12%; font-size:10px; font-weight:normal; white-space:nowrap;">VALOR R$</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="10" style="text-align:center; padding: 10px; font-size:10px;">Nenhum processo encontrado.</td></tr>'}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
          <td>
            <div style="margin-top: 8px; border-top: 1.5px solid #cbd5e1; padding-top: 5px; font-family: Arial, sans-serif; font-size: 8px; color: #334155; line-height: 1.4;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #0f172a; text-transform: uppercase; font-weight: normal;">LEGENDA:</span>
                  <span>C = Convênio &nbsp;|&nbsp; F = Fomento &nbsp;|&nbsp; OB = Obras &nbsp;|&nbsp; MP = Material Permanente &nbsp;|&nbsp; MC = Material Consumo</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #0f172a; text-transform: uppercase; font-weight: normal;">AUTORIZAÇÕES:</span>
                  <span>(1ª CAM &nbsp;|&nbsp; 2ª GAB SEDUC &nbsp;|&nbsp; 3ª CASA CIVIL) &nbsp;&bull;&nbsp; <span style="font-size: 9px; line-height: 1;">●</span> Autorizado &nbsp;|&nbsp; <span style="font-size: 9px; line-height: 1;">○</span> Pendente</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  `;

  let container = document.getElementById('print-layout-padrao-adm-2');
  if (!container) {
    container = document.createElement('div');
    container.id = 'print-layout-padrao-adm-2';
    container.className = 'print-only-layout';
    document.body.appendChild(container);
  }
  container.innerHTML = html;

  // Oculta os outros layouts
  ['print-layout-padrao', 'print-layout-padrao-adm', 'print-layout-detalhado', 'print-layout-analise'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  container.style.display = 'block';

  const pageProcessos = document.getElementById('page-processos');
  if (pageProcessos) pageProcessos.style.display = 'none';

  document.body.classList.add('print-mode-padrao-adm-2');
  document.body.classList.remove('print-mode-padrao', 'print-mode-padrao-adm', 'print-mode-detalhado', 'print-mode-analise');

  const origTitle = document.title;
  document.title = 'RELATORIO_ADM2_' + getFormattedDateForTitle();

  const style = document.createElement('style');
  style.innerHTML = '@media print { @page { size: A4 landscape !important; margin: 8mm !important; } .sidebar, .topbar, .section-header, .filters-bar, .table-wrap, .pagination, #export-buttons, .charts-grid, .dashboard, .modal-overlay, #page-processos, .page { display: none !important; } #print-layout-padrao-adm-2 { display: block !important; position: static !important; width: 100% !important; background: white !important; } table.print-table-adm th { background-color: #0f172a !important; color: #ffffff !important; border: 1px solid #334155 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } table.print-table-adm tr:nth-child(even) td { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } table.print-table-adm td:last-child, table.print-table-adm th:last-child { white-space: nowrap !important; } }';
  document.head.appendChild(style);

  const cleanupPrint = () => {
    document.title = origTitle;
    if (document.head.contains(style)) document.head.removeChild(style);
    document.body.classList.remove('print-mode-padrao-adm-2');
    container.style.display = 'none';
    if (pageProcessos) pageProcessos.style.display = '';
    window.removeEventListener('afterprint', cleanupPrint);
  };

  window.addEventListener('afterprint', cleanupPrint);

  window.print();

  setTimeout(cleanupPrint, 1000);
}

window.imprimirPadraoAdm2 = imprimirPadraoAdm2;



function imprimirDetalhado() {
  updatePrintDateTime();
  const filtrados = getFiltrados();
  
  let total = 0, qtdAutorizados = 0, valAutorizados = 0;
  let qtdReabertos = 0, valReabertos = 0;
  let qtdOutros = 0, valOutros = 0;
  const statusSummary = {};

  filtrados.forEach(p => {
    total += p.valorOf;
    const st = normalizar(p.status);
    
    if (!statusSummary[p.status]) statusSummary[p.status] = { qtde: 0, valor: 0 };
    statusSummary[p.status].qtde++;
    statusSummary[p.status].valor += p.valorOf;

    if (st.includes('autorizado')) {
      qtdAutorizados++;
      valAutorizados += p.valorOf;
    } else if (st.includes('reaberto')) {
      qtdReabertos++;
      valReabertos += p.valorOf;
    } else {
      qtdOutros++;
      valOutros += p.valorOf;
    }
  });

  const cardsHtml = `
    <div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; display:flex; gap:10px; margin-bottom: 20px;">
      <div style="flex:1; border:2px solid #000; background:#f8fafc; padding:6px; text-align:center; min-width:0;">
        <div style="font-size:7px; font-weight:bold; color:#000;">VALOR TOTAL CONSOLIDADO</div>
        <div style="font-size:14px; font-weight:bold; color:#000; margin:5px 0;">${formatCurrency(total)}</div>
        <div style="font-size:7px; color:#000;">${filtrados.length} processos únicos</div>
      </div>
      <div style="flex:1; border:2px solid #000; background:#f0fdf4; padding:6px; text-align:center; min-width:0;">
        <div style="font-size:7px; font-weight:bold; color:#000;">PROCESSOS AUTORIZADOS</div>
        <div style="font-size:14px; font-weight:bold; color:#000; margin:5px 0;">${formatCurrency(valAutorizados)}</div>
        <div style="font-size:7px; color:#000;">${qtdAutorizados} processos</div>
      </div>
      <div style="flex:1; border:2px solid #000; background:#fef2f2; padding:6px; text-align:center; min-width:0;">
        <div style="font-size:7px; font-weight:bold; color:#000;">REABERTOS E PENDENTES</div>
        <div style="font-size:14px; font-weight:bold; color:#000; margin:5px 0;">${formatCurrency(valReabertos + valOutros)}</div>
        <div style="font-size:7px; color:#000;">${qtdReabertos + qtdOutros} processos</div>
      </div>
    </div>
  `;

  let tableRows = '';
  filtrados.forEach((p, i) => {
    
        
        
        
        const prefixoFormatado = `
          <div style="font-family: Arial, sans-serif; font-size: 9px; line-height: 1.2;">
            <div style="font-weight: bold; margin-bottom: 2px;">${p.prefixo || '-'}</div>
            <div style="display: flex; align-items: center; white-space: nowrap; gap: 2px; font-size: 8px;">
              <span>${p.categoria || '-'}</span><span style="color:#999;">|</span><span>${p.tipo || '-'}</span><span style="color:#999;">|</span>
              <div style="display: flex; font-size: 15px; line-height: 1; color: #000; align-items: center; margin-left: 1px;">
                <span title="CAM">${p.CAM === '1' ? '&#9679;' : '&#9675;'}</span>
                <span title="GABINETE" style="margin-left: -2px;">${p.GAB === '1' ? '&#9679;' : '&#9675;'}</span>
                <span title="CASA CIVIL" style="margin-left: -2px;">${p.CC === '1' ? '&#9679;' : '&#9675;'}</span>
              </div>
            </div>
          </div>
        `;
    tableRows += `
      <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
        <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:3%;">${i + 1}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">${prefixoFormatado}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:11%;">${p.municipio || '-'}</td>
        <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:12%;">${(p.numero || '-').replace(/\s+/g, '<br>')}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:15%;">${p.interessado || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:22%;">${p.objeto || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px; width:8%;">${p.status || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">${p.localizacao || '-'}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:7%;">${formatDate(p.data)}</td>
        <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px; width:8%;">${formatNumberOnly(p.valorOf)}</td></tr>`;
  });
  const totalValorDetalhado = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  tableRows += `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold; background:#f9fafb;">
      <td colspan="9" style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">TOTAL GERAL (${filtrados.length} processos):</td>
      <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">${formatNumberOnly(totalValorDetalhado)}</td></tr>`;

  const tableHtml = `
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; margin-top:20px; font-size:14px;">1. Detalhamento dos processos</h3>
    <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">

            <colgroup>
              <col style="width: 3%;">
              <col style="width: 7%;">
              <col style="width: 11%;">
              <col style="width: 12%;">
              <col style="width: 15%;">
              <col style="width: 22%;">
              <col style="width: 8%;">
              <col style="width: 7%;">
              <col style="width: 7%;">
              <col style="width: 8%;">
            </colgroup>
  
            <thead>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background-color:#1e3a8a;"><th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:center; width:3%; font-size:10.5px; font-weight:bold;">Nº</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">PREFIXO</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:11%; font-size:10.5px; font-weight:bold;">MUNICÍPIO</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:12%; font-size:10.5px; font-weight:bold;">PROCESSO SEI</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:15%; font-size:10.5px; font-weight:bold;">INTERESSADO</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:22%; font-size:10.5px; font-weight:bold;">OBJETO / FINALIDADE</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:8%; font-size:10.5px; font-weight:bold;">STATUS</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">LOCAL</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:center; width:7%; font-size:10.5px; font-weight:bold;">DATA</th>
              <th style="color:#ffffff; background-color:#1e3a8a; border: 1px solid #93c5fd; border-top: none; padding: 2px; text-align:right; width:8%; font-size:10.5px; font-weight:bold;">VALOR R$</th>
            </tr></thead>
      ${tableRows}
    </table>
  `;

  let sumRows = '';
  Object.keys(statusSummary).forEach(st => {
    const part = total > 0 ? (statusSummary[st].valor / total * 100).toFixed(1) + '%' : '0%';
    sumRows += `
      <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
        <td style="padding: 2px; border:1px solid #000;">${st}</td>
        <td style="padding: 2px; border:1px solid #000; text-align:center;">${statusSummary[st].qtde}</td>
        <td style="padding: 2px; border:1px solid #000; text-align:right;">${formatCurrency(statusSummary[st].valor)}</td>
        <td style="padding: 2px; border:1px solid #000; text-align:center;">${part}</td>
      </tr>
    `;
  });
  sumRows += `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background:#e2e8f0; font-weight:bold;">
      <td style="padding: 2px; border:1px solid #000;">TOTAL GERAL</td>
      <td style="padding: 2px; border:1px solid #000; text-align:center;">${filtrados.length}</td>
      <td style="padding: 2px; border:1px solid #000; text-align:right;">${formatCurrency(total)}</td>
      <td style="padding: 2px; border:1px solid #000; text-align:center;">100,0%</td>
    </tr>
  `;

  const execSummaryHtml = `
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; font-size:14px;">2. Resumo por status</h3>
    <div style="display:flex; gap:20px;">
      <div style="flex:1;">
        <table style="width:100%; border-collapse:collapse; font-size:7px;">
          <thead>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background:#f1f5f9; color:#000; ">
              <th style="padding: 2px; border:1px solid #000;">Status</th>
              <th style="padding: 2px; border:1px solid #000;">Qtde.</th>
              <th style="padding: 2px; border:1px solid #000;">Valor total</th>
              <th style="padding: 2px; border:1px solid #000;">Part.</th>
            </tr>
          </thead>
          ${sumRows}
        </table>
      </div>
      <div style="flex:1; font-size:11px; line-height:1.5;">
        <strong>Leitura executiva:</strong><br>
        • ${(valAutorizados / (total||1) * 100).toFixed(1)}% do valor consolidado já consta como AUTORIZADO.<br>
        • ${qtdReabertos > 0 ? 'Reabertos: ' + formatCurrency(valReabertos) + '.' : 'Não há processos reabertos nesta seleção.'}<br>
        • ${qtdOutros > 0 ? 'Existem ' + qtdOutros + ' processos em outras situações.' : 'Todos os processos estão resolvidos.'}
      </div>
    </div>
  `;

  const html = `
    <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
      <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('RELATÓRIO DETALHADO DE PROCESSOS')}</td></tr></thead>
      <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
        <div style="margin-top: 5mm;">
          ${cardsHtml}
          ${tableHtml}
          ${execSummaryHtml}
        </div>
      </td></tr></tbody>
      <tfoot><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonFooter()}</td></tr></tfoot>
    </table>
  `;
  document.getElementById('print-layout-detalhado').innerHTML = html;
  
  document.getElementById('print-layout-detalhado').style.display = 'block';
  document.getElementById('print-layout-analise').style.display = 'none';
  document.body.classList.add('print-mode-detalhado');
  document.body.classList.remove('print-mode-analise');
    const orig = document.title;
    document.title = 'CAM_DETALHADO_' + getFormattedDateForTitle();
    window.print();
    setTimeout(() => document.title = orig, 1000);
  
  setTimeout(() => {
    document.body.classList.remove('print-mode-detalhado');
    document.getElementById('print-layout-detalhado').style.display = 'none';
  }, 1000);
};

window.imprimirDetalhado = imprimirDetalhado;

function imprimirAnalise() {
  updatePrintDateTime();
  const filtrados = getFiltrados();
  let total = 0;
  
  // Extract active filters
  const fGeral = document.getElementById('filtro-geral') ? document.getElementById('filtro-geral').value : '';
  const fStatus = document.getElementById('filtro-status') ? document.getElementById('filtro-status').value : 'Todos';
  const fLocalizacao = document.getElementById('filtro-localizacao') ? document.getElementById('filtro-localizacao').value : 'Todos';
  const fPrefixo = document.getElementById('filtro-prefixo') ? document.getElementById('filtro-prefixo').value : 'Todos';
  const fMunicipio = document.getElementById('filtro-municipio') ? document.getElementById('filtro-municipio').value : 'Todos';
  
  let filtrosAplicados = [];
  if (fGeral) filtrosAplicados.push("Busca: '" + fGeral + "'");
  if (fStatus && fStatus !== 'Todos') filtrosAplicados.push("Status: " + fStatus);
  if (fLocalizacao && fLocalizacao !== 'Todos') filtrosAplicados.push("Localização: " + fLocalizacao);
  if (fPrefixo && fPrefixo !== 'Todos') filtrosAplicados.push("Prefixo: " + fPrefixo);
  if (fMunicipio && fMunicipio !== 'Todos') filtrosAplicados.push("Município: " + fMunicipio);
  // Parâmetros de Dígito e Agrupamento no relatório visíveis SOMENTE ao perfil ADMIN
  if (typeof window.isUsuarioAdmin === 'function' && window.isUsuarioAdmin()) {
    const fAgrup = document.getElementById('filtro-agrupamento') ? document.getElementById('filtro-agrupamento').value : '';
    if (fAgrup && fAgrup !== 'Todos') filtrosAplicados.push("Agrupamento: " + fAgrup);
    if (state.filtros.digitoCond && state.filtros.digitoCond !== 'todos') { 
      const dVal = state.filtros.digito || '(vazio)'; 
      filtrosAplicados.push(`Dígito: ${state.filtros.digitoCond} ${dVal}`); 
    } else if (state.filtros.digito) { 
      filtrosAplicados.push(`Dígito: = ${state.filtros.digito}`); 
    }
  }
  
  const filtrosTexto = filtrosAplicados.length > 0 
    ? "Filtros aplicados (" + filtrosAplicados.join(', ') + ")" 
    : "Todos os processos (sem filtros aplicados)";

  
  const analise = {};
  
  filtrados.forEach(p => {
    total += p.valorOf;
    const st = p.status || 'SEM STATUS';
    const loc = p.localizacao || 'Sem Local';
    
    if(!analise[st]) analise[st] = { qtde: 0, valor: 0, locais: {} };
    analise[st].qtde++;
    analise[st].valor += p.valorOf;
    
    if(!analise[st].locais[loc]) analise[st].locais[loc] = 0;
    analise[st].locais[loc]++;
  });

  const arrStatus = Object.keys(analise).sort((a,b) => analise[b].valor - analise[a].valor);

  let conteudoStatus = '';
  arrStatus.forEach((st, idx) => {
    const bgColor = (idx % 2 === 0) ? '#f2f2f2' : '#ffffff'; // Cinza 15% (f2f2f2) and white zebrado
    const obj = analise[st];
    const pct = ((obj.valor / (total||1)) * 100).toFixed(1);
    
    const arrLocais = Object.entries(obj.locais).sort((a,b) => b[1]-a[1]);
    const topLocaisStr = arrLocais.slice(0,3).map(l => `${l[0]} (${l[1]})`).join(', ');

    conteudoStatus += `
      <div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; border-left:${(idx % 2 === 0) ? '4px solid transparent' : '4px solid #000'}; margin-bottom:0; background:${bgColor}; padding:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px; color:#000;">${st}</h4>
          <strong style="font-size:14px;">${formatCurrency(obj.valor)} (${pct}%)</strong>
        </div>
        <div style="font-size:11px; margin-top:5px; color:#333;">
          <strong>Quantidade:</strong> ${obj.qtde} processos.<br>
          <strong>Locais:</strong> ${topLocaisStr}.
        </div>
      </div>
    `;
  });

  const html = `
    <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
      <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('ANÁLISE GERENCIAL')}</td></tr></thead>
      <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
        
        <div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; margin-bottom:20px; font-size:12px; text-align:justify; line-height:1.6; padding:10px; border:1px solid #ccc;">
          <strong>SÍNTESE ANALÍTICA:</strong> Parâmetros buscados: <em>${filtrosTexto}</em>.<br>O presente cenário totaliza <strong>${formatCurrency(total)}</strong> distribudos em <strong>${filtrados.length}</strong> processos. 
          Abaixo detalhamos a concentração de recursos por status, cruzando com a localização, 
          permitindo identificar os principais setores responsáveis pela retenção de processos.
        </div>

        ${conteudoStatus}

        <div style="margin-top:30px; border-top:2px solid #ea580c; padding-top:10px; text-align:right;">
          <div style="font-size:14px; font-weight:bold; color:#ea580c; display:inline-block;">TOTAL GERAL: ${formatCurrency(total)}</div>
        </div>
        
      </td></tr></tbody>
      <tfoot><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonFooter()}</td></tr></tfoot>
    </table>
  `;
  
  document.getElementById('print-layout-analise').innerHTML = html;
  
  document.getElementById('print-layout-analise').style.display = 'block';
  document.getElementById('print-layout-detalhado').style.display = 'none';
  document.body.classList.add('print-mode-analise');
  document.body.classList.remove('print-mode-detalhado');
    const orig = document.title;
    document.title = 'CAM_ANALITICO_' + getFormattedDateForTitle();
    window.print();
    setTimeout(() => document.title = orig, 1000);
  
  setTimeout(() => {
    document.body.classList.remove('print-mode-analise');
    document.getElementById('print-layout-analise').style.display = 'none';
  }, 1000);
};
window.imprimirAnalise = imprimirAnalise;

// ---- GERENCIAMENTO DE ACESSOS (CRUD) ----

let listaAcessos = [];


window.novoAcessoForm = function() {
  cancelarEdicaoAcesso();
  const form = document.getElementById('form-acesso');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  if (form) form.style.display = 'grid';
  if (btnCancelar) btnCancelar.style.display = 'inline-flex';
  
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const setorInput = document.getElementById('acesso-setor');
  const senhaInput = document.getElementById('acesso-senha');
  const btnSalvar = document.getElementById('btn-salvar-acesso');
  
  if(nomeInput) nomeInput.disabled = false;
  if(whatsappInput) whatsappInput.disabled = false;
  if(nivelInput) nivelInput.disabled = false;
  if(setorInput) setorInput.disabled = false;
  if(senhaInput) senhaInput.disabled = false;
  if(btnSalvar) btnSalvar.disabled = false;
  
  if(nomeInput) nomeInput.focus();
};

function abrirModalAcesso(index = null) {
  const rowInput = document.getElementById('acesso-row');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const setorInput = document.getElementById('acesso-setor');
  const senhaInput = document.getElementById('acesso-senha');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-acesso');
  const form = document.getElementById('form-acesso');

  if (!rowInput) return;

  if (index !== null) {
    if (form) form.style.display = 'grid';
    const user = listaAcessos[index];
    rowInput.value = user._rowNumber;
    nomeInput.value = user.nome;
    whatsappInput.value = user.whatsapp || '';
    nivelInput.value = user.nivel;
    if(setorInput) setorInput.value = user.setor || '';
    senhaInput.value = user.senha || '';

    nomeInput.disabled = false;
    whatsappInput.disabled = true; // WhatsApp não pode ser alterado na ediǜo
    nivelInput.disabled = false;
    if(setorInput) setorInput.disabled = false;
    senhaInput.disabled = false;

    if (btnSalvar) btnSalvar.disabled = false;
    if (btnCancelar) btnCancelar.style.display = 'inline-flex';
    
    nomeInput.focus();
  } else {
    cancelarEdicaoAcesso();
  }
}

function cancelarEdicaoAcesso() {
  const form = document.getElementById('form-acesso');
  const rowInput = document.getElementById('acesso-row');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const setorInput = document.getElementById('acesso-setor');
  const senhaInput = document.getElementById('acesso-senha');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-acesso');

  if (form) {
    form.reset();
    form.style.display = 'none';
  }
  if (rowInput) rowInput.value = '';

  if (nomeInput) nomeInput.disabled = true;
  if (whatsappInput) whatsappInput.disabled = true;
  if (nivelInput) nivelInput.disabled = true;
  if (setorInput) setorInput.disabled = true;
  if (senhaInput) senhaInput.disabled = true;
  if (btnSalvar) btnSalvar.disabled = true;
  if (btnCancelar) btnCancelar.style.display = 'none';
}

window.novoAcessoForm = function() {
  cancelarEdicaoAcesso();

  const title = document.getElementById('cadastro-acesso-title');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const senhaInput = document.getElementById('acesso-senha');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-acesso');

  if (title) title.innerHTML = '<span>➕</span> Novo Registro de Acesso';

  // Habilitar campos
  if (nomeInput) nomeInput.disabled = false;
  if (whatsappInput) whatsappInput.disabled = false;
  if (nivelInput) nivelInput.disabled = false;
  if (senhaInput) senhaInput.disabled = false;

  if (btnSalvar) btnSalvar.disabled = false;
  if (btnCancelar) btnCancelar.style.display = 'inline-flex';

  if (nomeInput) nomeInput.focus();
};

function fecharModalAcesso() {
  cancelarEdicaoAcesso();
}

function renderListaAcessosUI() {
  const tbody = document.getElementById('table-acessos');
  if (!tbody) return;

  if (listaAcessos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum usuário cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = listaAcessos.map((user, index) => {
    const nivelDisplay = {
      leitor: `
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); text-transform: uppercase; letter-spacing: 0.5px; user-select: none;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Leitor
        </span>
      `,
      editor: `
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); text-transform: uppercase; letter-spacing: 0.5px; user-select: none;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Editor
        </span>
      `,
      adm: `
          <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(59, 130, 246, 0.12); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); text-transform: uppercase; letter-spacing: 0.5px; user-select: none;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Admin
          </span>
        `,
        gerente: `
          <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(139, 92, 246, 0.12); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); text-transform: uppercase; letter-spacing: 0.5px; user-select: none;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Gerente
          </span>
        `
    }[user.nivel] || `<span style="font-size:12px; font-weight:600; color:var(--text-primary);">${user.nivel}</span>`;

    const whatsappDisplay = user.whatsapp || '—';
    const senhaDisplay = user.senha || '—';
    const contagemDisplay = user.contagem || '0';
    const dataDisplay = user.data || '—';

    return `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:12px 16px; font-size:14px; font-weight:600; color:var(--text-primary);">${user.nome}</td>
        <td style="padding:12px 16px; font-size:14px; color:var(--text-secondary);">${whatsappDisplay}</td>
        <td style="padding:12px 16px; font-size:14px; color:var(--text-secondary);">${nivelDisplay}</td>
          <td style="padding:12px 16px; font-size:14px; color:var(--text-secondary);">${user.setor || '-'}</td>
        <td style="padding:12px 16px; font-size:14px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <label class="switch" style="transform:scale(0.85); margin:0;">
              <input type="checkbox" onchange="toggleStatusAcesso(${user._rowNumber}, this.checked)" ${user.status === 'liberado' ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <span style="font-size:11px; font-weight:800; letter-spacing:0.5px; width:24px; color:${user.status === 'liberado' ? '#10b981' : '#ef4444'};">
              ${user.status === 'liberado' ? 'ON' : 'OFF'}
            </span>
          </div>
        </td>
        <td style="padding:12px 16px; font-size:14px; font-family:monospace; font-weight:600; color:var(--text-secondary);">${senhaDisplay}</td>
        <td style="padding:12px 16px; font-size:14px; color:var(--text-secondary); font-weight:600;">${contagemDisplay}</td>
        <td style="padding:12px 16px; font-size:13px; color:var(--text-muted);">${dataDisplay}</td>
        <td style="padding:12px 16px; font-size:14px; text-align:right; white-space:nowrap;">
          <button class="btn btn-ghost btn-sm" onclick="abrirModalAcesso(${index})" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; font-size:12px; border:1px solid rgba(59, 130, 246, 0.2); border-radius:6px; background:rgba(59, 130, 246, 0.08); color:#60a5fa; font-weight:600; cursor:pointer; transition:var(--transition);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Editar
          </button>
          
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleStatusAcesso(rowNumber, isChecked) {
  const status = isChecked ? 'liberado' : 'bloqueado';
  const token = sessionStorage.getItem('sap_session_token');

  // Optimistic update
  const user = listaAcessos.find(u => u._rowNumber === rowNumber);
  if (user) {
    user.status = status;
  }
  renderListaAcessosUI();

  try {
    if (!user) throw new Error('Usuário não encontrado.');

    const payload = {
      nome: user.nome,
      whatsapp: user.whatsapp,
      nivel: user.nivel,
      setor: user.setor || '',
      status: status,
      senha: user.senha
    };

    const res = await fetch(API_BASE + `/api/acessos/${rowNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao alterar status.');
    }

    toast(`Acesso do usuário ${user.nome} foi ${status === 'liberado' ? 'ativado' : 'inativado'}!`, 'info');
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
    // Revert
    if (user) {
      user.status = status === 'liberado' ? 'bloqueado' : 'liberado';
      renderListaAcessosUI();
    }
  }
}

async function carregarAcessos() {
  const tbody = document.getElementById('table-acessos');
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">Carregando acessos...</td></tr>`;

  try {
    const token = sessionStorage.getItem('sap_session_token');
    const res = await fetch(API_BASE + '/api/acessos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao carregar lista de acessos.');
    }

    listaAcessos = await res.json();
    
    // Corrige os campos deslocados
    listaAcessos = listaAcessos.map(u => {
      // Se a coluna senha tem 1/0, e a contagem tem a senha real (ex 4791)
      if (u.senha === 1 || u.senha === 0 || u.senha === '1' || u.senha === '0') {
        return {
          ...u,
          status: (u.senha == 1 || String(u.senha).toLowerCase() === 'liberado' || String(u.status).toLowerCase() === 'liberado') ? 'liberado' : 'bloqueado',
          senha: u.contagem,
          contagem: u.data,
          data: 'N/D'
        };
      }
      return u;
    });
    
    
    renderListaAcessosUI();
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:#ef4444;">${error.message}</td></tr>`;
  }
}

async function salvarAcessoForm(event) {
  event.preventDefault();
  const row = document.getElementById('acesso-row').value;
  const nome = document.getElementById('acesso-nome').value;
  const whatsapp = document.getElementById('acesso-whatsapp').value;
  const nivel = document.getElementById('acesso-nivel').value;
    const setor = document.getElementById('acesso-setor').value.trim();
  const senha = document.getElementById('acesso-senha').value;
  
  let status = 'liberado';
  if (row) {
    const user = listaAcessos.find(u => u._rowNumber === Number(row));
    if (user) {
      status = user.status;
    }
  }

  const payload = { nome, whatsapp, nivel, status, senha, setor };
  const token = sessionStorage.getItem('sap_session_token');

  try {
    let url = API_BASE + '/api/acessos';
    let method = 'POST';

    if (row) {
      url += '/' + row;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao salvar acesso.');
    }

    toast(row ? 'Usuário atualizado!' : 'Usuário cadastrado!', 'success');
    cancelarEdicaoAcesso();
    carregarAcessos();
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
  }
}

async function deletarAcesso(rowNumber, whatsapp) {
  if (!confirm(`Deseja realmente excluir o acesso do usuário ${whatsapp}?`)) {
    return;
  }

  const token = sessionStorage.getItem('sap_session_token');
  try {
    const res = await fetch(API_BASE + `/api/acessos/${rowNumber}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao deletar acesso.');
    }

    toast('Usuário removido com sucesso!', 'info');
    carregarAcessos();
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
  }
}

// ---- MÁSCARA E ENVIAR WHATSAPP ----

function maskCelular(v) {
  v = v.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 7) {
    return "(" + v.substring(0, 2) + ") " + v.substring(2, 3) + " " + v.substring(3, 7) + "-" + v.substring(7);
  } else if (v.length > 3) {
    return "(" + v.substring(0, 2) + ") " + v.substring(2, 3) + " " + v.substring(3);
  } else if (v.length > 2) {
    return "(" + v.substring(0, 2) + ") " + v.substring(2);
  } else if (v.length > 0) {
    return "(" + v;
  }
  return v;
}

function enviarLinkWhatsApp() {
  const inputVal = document.getElementById('share-whatsapp-number').value;
  const digits = inputVal.replace(/\D/g, "");

  if (digits.length < 10) {
    toast('Por favor, informe um número de celular válido com DDD.', 'error');
    return;
  }

  const phoneFormatted = digits.startsWith('55') ? digits : '55' + digits;
  const textMsg = encodeURIComponent("Olá! Segue o link de acesso ao sistema de Acompanhamento de Processos da SEDUC-RO:\n\nhttps://tinhosys.github.io/seduc-processos/");

  const url = `https://web.whatsapp.com/send?phone=${phoneFormatted}&text=${textMsg}`;
  window.open(url, 'whatsapp_tab');
}

// ---- PROCESSOS REPETIDOS ----
function renderProcessosRepetidos() {
  const badge = document.getElementById('total-repetidos-badge');
  const tbody = document.getElementById('table-repetidos-body');
  if (!tbody) return;

  const processos = carregarProcessos();

  // Agrupar processos pelo número
  const grupos = {};
  processos.forEach(p => {
    if (!p.numero) return;
    const numClean = p.numero.trim();
    
    // Ignorar processos sem número ou com marcações genéricas de vazio
    if (
      numClean === "****" || 
      numClean === "-" || 
      numClean === "—" || 
      numClean.toLowerCase() === "s/n" || 
      numClean.toLowerCase() === "s/nº" ||
      numClean.toLowerCase() === "s/n°"
    ) {
      return;
    }
    
    if (!grupos[numClean]) grupos[numClean] = [];
    grupos[numClean].push(p);
  });

  // Filtrar apenas grupos com tamanho > 1 (repetidos)
  const repetidos = Object.keys(grupos)
    .filter(num => grupos[num].length > 1)
    .map(num => ({
      numero: num,
      itens: grupos[num]
    }));

  if (badge) {
    badge.textContent = `${repetidos.length} Números com Ocorrências Repetidas`;
  }

  if (repetidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 14px;">
          <h3>🔍 Nenhum processo repetido encontrado!</h3>
          <p style="margin-top: 6px;">Todos os números de processos válidos na planilha são únicos.</p>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  repetidos.forEach((grp, idx) => {
    const totalOcorrencias = grp.itens.length;
    const safeNumClass = grp.numero.replace(/[^a-zA-Z0-9]/g, '_');
    
    // 1. Linha Pai: Exibe apenas o botão de expansão e o número do processo
    html += `
      <tr style="background: rgba(30, 41, 59, 0.85); border-bottom: 1px solid var(--border);">
        <td style="padding: 12px; text-align: center; cursor: pointer; user-select: none; font-size: 14px; font-weight: 900; color: var(--blue);" onclick="toggleGrupoRepetidoTabela('${grp.numero}', this)">
          ➕
        </td>
        <td colspan="6" style="padding: 12px; font-weight: 700; font-family: monospace; color: var(--text-primary); font-size: 14px;">
          Nº PROCESSO: <span style="color: #60a5fa; letter-spacing: 0.5px;">${grp.numero}</span>
          <span style="font-size: 11px; font-weight: 700; margin-left: 12px; padding: 3px 8px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); text-transform: uppercase;">${totalOcorrencias} Ocorrências</span>
        </td>
      </tr>
    `;
    
    // 2. Linhas Filhas: Listadas abaixo em linha, uma abaixo da outra
    grp.itens.forEach(p => {
      html += `
        <tr class="filha-repetido-${safeNumClass}" style="display: none; background: rgba(0, 0, 0, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.03); cursor: pointer; transition: background 0.15s;" onclick="editarProcesso('${p.id}')" title="Clique para editar este processo">
          <td style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 11px; font-weight: bold;">
            —
          </td>
          <td style="padding: 12px; font-weight: 600; color: var(--text-primary);">${p.prefixo || '—'}</td>
          <td style="padding: 12px; color: var(--text-primary);">${p.municipio || '—'}</td>
          <td style="padding: 12px; color: var(--text-primary); font-weight: 500;" title="${p.interessado || ''}">
            ${p.interessado ? (p.interessado.length > 40 ? p.interessado.substring(0, 37) + '...' : p.interessado) : '—'}
          </td>
          <td style="padding: 12px; color: var(--text-secondary);" title="${p.objeto || ''}">
            ${p.objeto ? (p.objeto.length > 55 ? p.objeto.substring(0, 52) + '...' : p.objeto) : '—'}
          </td>
          <td style="padding: 12px;">
            <span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span>
          </td>
          <td style="padding: 12px; font-family: monospace; font-weight: 600; color: var(--green); text-align: right; padding-right: 16px;">
            ${formatCurrency(p.valorOf)}
          </td>
        </tr>
      `;
    });
  });

  tbody.innerHTML = html;
}

function toggleGrupoRepetidoTabela(numeroProcesso, btnElement) {
  const safeNumClass = numeroProcesso.replace(/[^a-zA-Z0-9]/g, '_');
  const linhasFilhas = document.querySelectorAll(`.filha-repetido-${safeNumClass}`);
  
  if (linhasFilhas.length === 0) return;
  
  const estaOculto = linhasFilhas[0].style.display === 'none';
  
  linhasFilhas.forEach(linha => {
    linha.style.display = estaOculto ? 'table-row' : 'none';
  });
  
  btnElement.textContent = estaOculto ? '➖' : '➕';
}

async function excluirProcessoDireto(id) {
  if (confirm("Tem certeza de que deseja excluir este processo repetido? Esta ação não pode ser desfeita e removerá o registro na planilha.")) {
    try {
      await excluirProcesso(id);
      toast("Processo excludo com sucesso!", "success");
      if (typeof inicializarDados === 'function') {
        await inicializarDados();
      }
      renderProcessosRepetidos();
    } catch (err) {
      console.error(err);
      toast("Erro ao excluir o processo.", "error");
    }
  }
}

window.renderProcessosRepetidos = renderProcessosRepetidos;
window.toggleGrupoRepetidoTabela = toggleGrupoRepetidoTabela;
window.excluirProcessoDireto = excluirProcessoDireto;
window.editarProcesso = editarProcesso;

setTimeout(() => {
  document.body.classList.remove('print-mode-analise');
  document.getElementById('print-layout-analise').style.display = 'none';
}, 1000);

// ---- CONTROLE DE OCULTAR/MOSTRAR FILTROS E FORMULÁRIOS (PIN/ALFINETE) ----
function toggleFiltros() {
  const bar = document.querySelector('#page-processos .filters-bar');
  const btn = document.getElementById('btn-toggle-filtros');
  if (!bar || !btn) return;
  const isCollapsed = bar.classList.toggle('collapsed');
  
  if (isCollapsed) {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polyline></svg>';
    localStorage.setItem('filters_collapsed', '1');
  } else {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 14 12 22 20 14"></polyline><polyline points="4 4 12 12 20 4"></polyline></svg>';
    localStorage.removeItem('filters_collapsed');
  }
}

function toggleFormAcesso() {
  const form = document.getElementById('form-acesso');
  const btn = document.getElementById('btn-toggle-form-acesso');
  if (!form || !btn) return;
  
  if (form.style.display !== 'none') {
    form.style.display = 'none';
    btn.innerHTML = '&#10133; <span class="btn-text">Mostrar</span>';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
    localStorage.setItem('form_acesso_collapsed', '1');
  } else {
    form.style.display = 'grid';
    btn.innerHTML = '&#128065; <span class="btn-text">Ocultar</span>';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = '';
    localStorage.removeItem('form_acesso_collapsed');
  }
}

function abrirModalManifestoTCEById(id) {
  const p = (state.processos || []).find(item => item.id === id);
  if (!p) {
    if (typeof toast === 'function') toast('Processo não encontrado para gerar manifesto', 'error');
    return;
  }
  abrirModalManifestoTCE(p);
}

function abrirModalManifestoTCE(p) {
  window._manifestoProcessoAtual = p || {};
  const texto = gerarTextoManifestoTCE(p);
  const preview = document.getElementById('manifesto-tce-texto-preview');
  if (preview) preview.textContent = texto;

  const modal = document.getElementById('modal-manifesto-tce');
  if (modal) modal.style.display = 'flex';
}

function fecharModalManifestoTCE() {
  const modal = document.getElementById('modal-manifesto-tce');
  if (modal) modal.style.display = 'none';
}

function copiarManifestoTCE() {
  const preview = document.getElementById('manifesto-tce-texto-preview');
  if (!preview) return;
  navigator.clipboard.writeText(preview.textContent).then(() => {
    if (typeof toast === 'function') toast('Texto da Manifestação TCE-RO copiado para a área de transferência!', 'success');
  }).catch(() => {
    if (typeof toast === 'function') toast('Erro ao copiar texto', 'error');
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// RELATÓRIO PDF COMPLETO — SEDUC-RO / CAM
// Substitui a função imprimirManifestoTCE em js/app.js (linhas 3527-3712)
// ──────────────────────────────────────────────────────────────────────────────

function imprimirManifestoTCE() {
  var p = window._manifestoProcessoAtual || {};

  var ff = function(v) { return (v && String(v).trim()) ? String(v).trim() : ''; };
  var fv = function(v) {
    var n = parseFloat(String(v || 0).replace(/[R$\s]/g,'').replace(/\./g,'').replace(',','.'));
    return (n > 0) ? 'R$&nbsp;' + n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '';
  };
  var isOn = function(v) { return v===true||v===1||v==='1'||v==='true'; };

  var today = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'});
  var todayLong = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'});

  var numero    = ff(p.numero)      || 'S/N';
  var municipio = ff(p.municipio)   || '&mdash;';
  var escola    = ff(p.interessado) || '&mdash;';
  var objeto    = ff(p.objeto)      || '&mdash;';
  var ano       = ff(p.ano)         || '&mdash;';
  var obs       = ff(p.obs);
  var demaisObs = ff(p.demaisObservacoes);
  var valorOf   = fv(p.valorOf);
  var valorPlan = fv(p.valorPlan);

  var categMap = {F:'Fomento',C:'Conv&ecirc;nio',TC:'Termo de Coopera&ccedil;&atilde;o'};
  var tipoMap  = {OB:'Obras',MP:'Mat. Permanente',MC:'Mat. Consumo',SI:'Sistema',TR:'Treinamento',OU:'Outros'};
  var categ = categMap[ff(p.categoria)] || ff(p.categoria) || '&mdash;';
  var tipo  = tipoMap[(ff(p.tipo)||'').toUpperCase()] || ff(p.tipo) || '&mdash;';

  // Build the dynamic paragraph based on "Objetivo"
  var dynText = "O investimento contemplar&aacute; <b>" + (ff(p.objeto) || 'a&ccedil;&otilde;es de melhoria') + "</b> na unidade escolar <b>" + (ff(p.interessado) || 'especificada') + "</b>, localizada no munic&iacute;pio de <b>" + (ff(p.municipio) || 'Rond&ocirc;nia') + "</b>. ";
  
  var itens = [];
  if (ff(p.qtdeSala))   itens.push("constru&ccedil;&atilde;o/adequa&ccedil;&atilde;o de " + ff(p.qtdeSala) + " sala(s) (" + (ff(p.tipoSala) || "padr&atilde;o") + ")");
  if (ff(p.auditorio))  itens.push("audit&oacute;rio " + ff(p.auditorio) + (ff(p.tipoAuditorio) ? " (" + ff(p.tipoAuditorio) + ")" : "****"));
  if (ff(p.quadra))     itens.push("quadra poliesportiva " + ff(p.quadra));
  if (ff(p.patio))      itens.push("p&aacute;tio " + ff(p.patio));
  if (ff(p.refeitorio)) itens.push("refeit&oacute;rio " + ff(p.refeitorio));
  if (ff(p.banheiros))  itens.push("banheiros " + ff(p.banheiros));

  if (itens.length > 0) {
    dynText += "O projeto envolver&aacute; a " + itens.join(", ").replace(/,([^,]*)$/, ' e$1') + "****";
    if (ff(p.metragemM2)) dynText += ", totalizando uma interven&ccedil;&atilde;o de aproximadamente " + ff(p.metragemM2) + " m&sup2;.";
    else dynText += ". ";
  }

  if (ff(p.detalhamentoItens)) {
    dynText += " Inclui-se no escopo o detalhamento: " + ff(p.detalhamentoItens).replace(/\n/g, ', ') + ". ";
  }

  dynText += "Essa iniciativa fortalecer&aacute; a capacidade de atendimento da institui&ccedil;&atilde;o, aprimorando substancialmente as condi&ccedil;&otilde;es de ensino-aprendizagem. O investimento proporcionar&aacute; um ambiente mais acolhedor e adequado &agrave;s diretrizes pedag&oacute;gicas, contribuindo de forma direta para a eleva&ccedil;&atilde;o dos &iacute;ndices educacionais e garantindo maior bem-estar para toda a comunidade escolar.";

  var fundebText = "A Lei n&ordm; 14.113/2020, que regulamenta o FUNDEB, condiciona o recebimento de complementa&ccedil;&atilde;o de recursos federais &agrave; exist&ecirc;ncia de regime de colabora&ccedil;&atilde;o formalizado entre Estado e Munic&iacute;pios (Art. 14, &sect;1&ordm;, IV). No &acirc;mbito local, a Constitui&ccedil;&atilde;o do Estado de Rond&ocirc;nia (Arts. 187 e 188) reitera os princ&iacute;pios de igualdade de acesso e a coopera&ccedil;&atilde;o interfederativa.<br><br>Ademais, a Lei Estadual n&ordm; 5.735/2024, que institui o Programa de Alfabetiza&ccedil;&atilde;o do Estado de Rond&ocirc;nia (Proalfa Rond&ocirc;nia), estabelece o dever do Estado em prestar coopera&ccedil;&atilde;o t&eacute;cnica e financeira para o fortalecimento das pol&iacute;ticas educacionais municipais. O Eixo 2 do referido programa foca especificamente na melhoria da infraestrutura f&iacute;sica e pedag&oacute;gica das unidades escolares.";

  var conclusaoText = "Diante do exposto, e em atendimento &agrave; solicita&ccedil;&atilde;o do Requerente, esta Ger&ecirc;ncia manifesta-se <strong>FAVORAVELMENTE</strong> ao pleito do Munic&iacute;pio de <strong>" + municipio + "</strong>, fundamentado na Lei Estadual n&ordm; 5.735/2024.<br><br>Submetemos os presentes autos &agrave; aprecia&ccedil;&atilde;o superior para delibera&ccedil;&atilde;o quanto &agrave; oportunidade, conveni&ecirc;ncia administrativa e viabilidade de celebra&ccedil;&atilde;o do regime de colabora&ccedil;&atilde;o.";


  var css =
    '@page{size:A4 portrait;margin:12mm 15mm 12mm 15mm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Arial",sans-serif;font-size:9.5pt;color:#111;background:#fff;line-height:1.4;position:relative}' +
    '.hdr{display:flex;align-items:center;gap:15px;border-bottom:2px solid #1a3a6b;padding-bottom:10px;margin-bottom:12px}.hdr-txt{flex:1}.hdr-gov{font-size:7.5pt;color:#555;text-transform:uppercase;letter-spacing:.5px}.hdr-sec{font-size:11pt;font-weight:800;color:#1a3a6b;text-transform:uppercase}.hdr-dep{font-size:8.5pt;color:#666}' +
    '.tbar{background:#1a3a6b;color:#fff;text-align:center;padding:6px 15px;border-radius:4px;margin-bottom:12px;font-size:11pt;font-weight:bold;text-transform:uppercase;letter-spacing:1px}' +
    '.sec-title{font-size:10pt;font-weight:bold;color:#1a3a6b;text-transform:uppercase;border-bottom:1px solid #ddd;padding-bottom:2px;margin:12px 0 6px 0}' +
    '.info-table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:9.5pt}.info-table td{padding:3px 0;vertical-align:top}.info-table .lbl{font-weight:bold;color:#444;width:15%;padding-right:5px}.info-table .val{width:35%;border-bottom:1px solid #f0f0f0}' +
    '.obs-block{border:1px solid #000;padding:8px 12px;font-size:9pt;white-space:pre-wrap;line-height:1.4;margin-bottom:10px}' +
    '.legal-text{font-size:9.5pt;line-height:1.45;text-align:justify;text-indent:2em;margin-bottom:6px;color:#222}' +
    '.bottom-container{position:fixed;bottom:0;left:0;right:0;background:#fff;padding-top:10px;}' +
    '.ft{border-top:1px solid #1a3a6b;padding-top:8px;display:flex;justify-content:space-between;align-items:center;font-size:7.5pt;color:#777}.ft-logo{font-weight:bold;color:#1a3a6b}' +
    'body{padding-bottom:50px;}' +
    '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';

  var h = '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n' +
    '<title>Relat&oacute;rio de Monitoramento &mdash; ' + numero + '</title>\n' +
    '<style>' + css + '</style>\n</head>\n<body>\n' +
    '<div class="hdr"><div class="hdr-txt">' +
    '<div class="hdr-gov" style="font-weight:800; color:#0f172a; font-size:11pt; letter-spacing:0.5px;">GOVERNO DO ESTADO DE ROND&Ocirc;NIA</div>' +
    '<div class="hdr-sec" style="font-weight:700; color:#0284c7; font-size:10pt;">SEDUC - SECRETARIA DE ESTADO DA EDUCA&Ccedil;&Atilde;O</div>' +
    '<div class="hdr-dep" style="font-weight:700; color:#334155; font-size:9pt; text-transform:uppercase;">CAM - COORDENADORIA DE ARTICULA&Ccedil;&Atilde;O COM OS MUNIC&Iacute;PIOS</div></div></div>' +
    '<div class="tbar">RELAT&Oacute;RIO DE MONITORAMENTO</div>' +
    '<table class="info-table">' +
    '<tr><td class="lbl">Processo:</td><td class="val"><strong>' + numero + '</strong></td><td class="lbl">Munic&iacute;pio:</td><td class="val">' + municipio + '</td></tr>' +
    '<tr><td class="lbl">Escola:</td><td class="val" colspan="3">' + escola + '</td></tr>' +
    '<tr><td class="lbl">Objeto:</td><td class="val" colspan="3">' + objeto + '</td></tr>' +
    '<tr><td class="lbl">Ano:</td><td class="val">' + ano + '</td><td class="lbl">Categoria:</td><td class="val">' + categ + '</td></tr>' +
    '<tr><td class="lbl">Tipo:</td><td class="val">' + tipo + '</td><td class="lbl">Valor:</td><td class="val">';
  
  var vl = valorOf || valorPlan;
  if (vl) {
      h += '<strong>' + vl + '</strong>';
  } else {
      h += '&mdash;';
  }
  h += '</td></tr></table>';
  var obsAll = [obs, demaisObs].filter(Boolean).join('\n\n');
  if (obsAll) { h += '<div class="sec-title">OBSERVA&Ccedil;&Otilde;ES ESPEC&Iacute;FICAS</div><div class="obs-block">' + obsAll + '</div>'; }

  h += '<div class="sec-title">1. IMPACTO E OBJETIVO DO INVESTIMENTO</div>' +
       '<p class="legal-text">' + dynText + '</p>';

  h += '<div class="sec-title">2. FORTALECIMENTO PELO FUNDEB E LEGISLA&Ccedil;&Atilde;O ESTADUAL</div>' +
       '<p class="legal-text">' + fundebText + '</p>';

  h += '<div class="sec-title">3. CONCLUS&Atilde;O E MANIFESTA&Ccedil;&Atilde;O</div>' +
       '<p class="legal-text">' + conclusaoText + '</p>';

  // Bottom Fixed Container
  h += '<div class="bottom-container">' +
       '<div class="ft"><span class="ft-logo">CAM - COORDENADORIA DE ARTICULA&Ccedil;&Atilde;O COM OS MUNIC&Iacute;PIOS</span><span>Relat&oacute;rio Gerencial de Monitoramento</span><span>Emitido em: ' + today + '</span></div>' +
       '</div>'; // end bottom-container

  h += '<script>window.onload=function(){setTimeout(function(){window.print();},500);};</script></body></html>';

  var win = window.open('', '_blank');
  if (!win) { alert('Permita popups para gerar o relat\u00f3rio.'); return; }
  win.document.write(h);
  win.document.close();
}

function gerarRelatorioMonitoramento() {
  var g  = function(id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
  var gb = function(id) { var el = document.getElementById(id); return el ? el.checked : false; };

  var inputsNum  = Array.from(document.querySelectorAll('input[name="numero[]"]'));
  var numeroProc = inputsNum.map(function(i){ return i.value.trim(); }).filter(Boolean).join(', ') || 'Sem número';

  var parseMon = function(v) {
    if (!v) return 0;
    var s = String(v).replace(/[R$\s]/g,'').replace(/\./g,'').replace(',','.');
    return parseFloat(s) || 0;
  };
  var valPlan = (typeof parseCurrency === 'function') ? parseCurrency(g('form-valorPlan')) : parseMon(g('form-valorPlan'));
  var valOf   = (typeof parseCurrency === 'function') ? parseCurrency(g('form-valorOf'))   : parseMon(g('form-valorOf'));

  var catEl  = document.querySelector('#control-categoria .segment-btn.active') || {};
  var tipoEl = document.querySelector('#control-tipo .segment-btn.active')      || {};

  var p = {
    numero:            numeroProc,
    municipio:         g('form-municipio'),
    interessado:       g('form-interessado'),
    objeto:            g('form-objeto'),
    prefixo:           g('form-prefixo'),
    ano:               g('form-ano'),
    agrupamento:       g('form-agrupamento'),
    data:              g('form-data'),
    status:            g('form-status'),
    localizacao:       g('form-localizacao'),
    obs:               g('form-obs'),
    categoria:         (catEl.dataset  && catEl.dataset.value)  || g('form-categoria'),
    tipo:              (tipoEl.dataset && tipoEl.dataset.value) || g('form-tipo'),
    cam:               gb('form-cam')  ? 1 : 0,
    gab:               gb('form-gab')  ? 1 : 0,
    cc:                gb('form-cc')   ? 1 : 0,
    valorPlan:         valPlan,
    valorOf:           valOf,
    qtdeSala:          g('form-qtdeSala'),
    tipoSala:          g('form-tipoSala'),
    auditorio:         g('form-auditorio'),
    tipoAuditorio:     g('form-tipoAuditorio'),
    quadra:            g('form-quadra'),
    patio:             g('form-patio'),
    refeitorio:        g('form-refeitorio'),
    banheiros:         g('form-banheiros'),
    metragemM2:        g('form-metragemM2'),
    detalhamentoItens: g('form-detalhamentoItens'),
    demaisObservacoes: g('form-demaisObservacoes')
  };

  if (typeof state !== 'undefined' && state.editandoId) {
    var saved = (state.processos || []).find(function(item){ return item.id === state.editandoId; });
    if (saved) {
      Object.keys(p).forEach(function(k) {
        if (p[k] === '' || p[k] === 0 || p[k] === null || p[k] === undefined) {
          if (saved[k] !== undefined && saved[k] !== null && saved[k] !== '') p[k] = saved[k];
        }
      });
    }
  }

  window._manifestoProcessoAtual = p;
  if (typeof imprimirManifestoTCE === 'function') {
    imprimirManifestoTCE();
  }
}

window.gerarRelatorioMonitoramento = gerarRelatorioMonitoramento;
window.abrirModalManifestoTCEById     = abrirModalManifestoTCEById;
window.abrirModalManifestoTCE         = abrirModalManifestoTCE;
window.fecharModalManifestoTCE        = fecharModalManifestoTCE;
window.copiarManifestoTCE             = copiarManifestoTCE;
window.imprimirManifestoTCE           = imprimirManifestoTCE;



// ============================================================
// MÓDULO: TODAS ESCOLAS — Multi-aba Google Sheets (v1.2.85)
// Busca TODAS as planilhas por ndice numérico (paralelo)
// ============================================================

const TE_SHEET_ID  = '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08';
const TE_GID_MAIN  = '1444558009';
const TE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/' + TE_SHEET_ID + '/edit?gid=' + TE_GID_MAIN + '#gid=' + TE_GID_MAIN;
const TE_MAX_SHEETS = 50;   // máximo de abas a tentar
const TE_BATCH_SIZE = 8;    // abas buscadas em paralelo por lote
const TE_MAX_CONSEC_FAIL = 3; // para após N falhas consecutivas

// Estado do módulo
var _teCache       = [];
var _teFiltrados   = [];
var _tePagina      = 1;
var _teItensPorPag = 50;
var _teCarregado   = false;
var _teAbas        = [];   // [{idx, nome, count}] - abas carregadas

// Mapeamento das colunas (ndice → chave)
// As abas com ?sheet=N retornam parsedNumHeaders:0, primeira linha é cabeçalho
const TE_COLS = [
  'municipio','nome','alunos','modalidade','inep','endereco','bairro',
  'complemento','cep','competencia','super','redesSociais','telefone','email',
  'diretor','contatoDiretor','secretario','contatoSecretario',
  'salasAula','salasAdm','salaAEE','banheiros','patio','auditorio','refeitorio','quadra','localidade'
];
const TE_HEADER_KEYWORDS = ['municipio','Município','nome completo','inep','modalidade','telefone','endereço','endereco'];

// Verifica se uma linha é cabeçalho
function _teIsHeader(obj) {
  const n = (obj.nome || '').toLowerCase();
  const m = (obj.municipio || '').toLowerCase();
  return TE_HEADER_KEYWORDS.some(k => n.includes(k) || m.includes(k));
}

// Verifica se uma linha é válida (tem pelo menos nome ou municipio)
function _teIsValidRow(obj) {
  return (obj.nome && obj.nome.trim().length > 2) || (obj.municipio && obj.municipio.trim().length > 2);
}

// Parse de uma resposta gviz JSON
function _teParseGviz(text, sheetIdx) {
  try {
    const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    if (!data || !data.table || data.status === 'error') return null;
    if (!data.table.rows || data.table.rows.length === 0) return null;

    const rows = [];
    let lastMunicipio = '';

    data.table.rows.forEach((row) => {
      if (!row.c || row.c.length === 0) return;
      const obj = { _aba: sheetIdx };
      TE_COLS.forEach((key, ci) => {
        const cell = row.c[ci];
        obj[key] = (cell && cell.v !== null && cell.v !== undefined) ? String(cell.v).trim() : '';
      });

      // Pula cabeçalho
      if (_teIsHeader(obj)) return;

      // Propaga Município da linha anterior se a linha atual não tem
      if (!obj.municipio && lastMunicipio) obj.municipio = lastMunicipio;
      if (obj.municipio) lastMunicipio = obj.municipio;

      // Só adiciona linhas com nome de escola
      if (obj.nome && obj.nome.trim().length > 2) {
        rows.push(obj);
      }
    });

    return rows;
  } catch(e) {
    console.warn('[TE] Parse error sheet', sheetIdx, e.message);
    return null;
  }
}

// Entry point
function iniciarPaginaTodasEscolas() {
  if (_teCarregado && _teCache.length > 0) { _teAtualizarUI(); return; }
  buscarTodasEscolasGSheet();
}

function recarregarTodasEscolas() {
  _teCache = []; _teFiltrados = []; _teCarregado = false; _teAbas = [];
  buscarTodasEscolasGSheet();
}

// Busca TODAS as abas em lotes paralelos
async function buscarTodasEscolasGSheet() {
  const tbody     = document.getElementById('te-tbody');
  const wrap      = document.getElementById('te-table-wrap');
  const emptyEl   = document.getElementById('te-empty');
  const statusEl  = document.getElementById('te-badge-status');
  const progressEl = document.getElementById('te-progress');

  if (wrap)    wrap.style.display    = 'none';
  if (emptyEl) emptyEl.style.display = 'none';

  const setBadge = (txt, color) => {
    if (!statusEl) return;
    statusEl.textContent = txt;
    const colors = {
      loading: ['rgba(251,191,36,0.12)','#fbbf24','rgba(251,191,36,0.3)'],
      ok:      ['rgba(16,185,129,0.12)','#34d399','rgba(16,185,129,0.3)'],
      error:   ['rgba(239,68,68,0.12)','#f87171','rgba(239,68,68,0.3)'],
      info:    ['rgba(59,130,246,0.12)','#60a5fa','rgba(59,130,246,0.3)']
    };
    const [bg, col, border] = colors[color] || colors.loading;
    statusEl.style.cssText = `display:inline-flex;align-items:center;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;background:${bg};color:${col};border:1px solid ${border};letter-spacing:0.4px;`;
  };

  setBadge('⏳ Iniciando carregamento...', 'loading');
  if (progressEl) progressEl.style.display = 'block';
  if (tbody) tbody.innerHTML = `<tr><td colspan="20" style="text-align:center;padding:48px;color:var(--text-muted);">
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;">
      <div style="width:36px;height:36px;border:3px solid rgba(59,130,246,0.3);border-top-color:#60a5fa;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <div id="te-load-msg" style="font-size:14px;font-weight:600;color:var(--text-secondary);">Buscando planilhas...</div>
      <div id="te-load-sub" style="font-size:12px;color:var(--text-muted);">Carregando todas as abas do Google Sheets</div>
    </div></td></tr>`;

  const setLoadMsg = (msg, sub) => {
    const el = document.getElementById('te-load-msg');
    const sub2 = document.getElementById('te-load-sub');
    if (el) el.textContent = msg;
    if (sub2 && sub) sub2.textContent = sub;
  };

  _teCache = [];
  _teAbas  = [];
  let totalLoaded = 0;
  
  const MUNICIPIOS_RO = [
    "Alta Floresta d'Oeste", "Alto Alegre dos Parecis", "Alto Paraíso", "Alvorada d'Oeste", "Ariquemes", 
    "Buritis", "Cabixi", "Cacaulândia", "Cacoal", "Campo Novo de Rondônia", "Candeias do Jamari", 
    "Castanheiras", "Cerejeiras", "Chupinguaia", "Colorado do Oeste", "Corumbiara", "Costa Marques", 
    "Cujubim", "Espigão d'Oeste", "Governador Jorge Teixeira", "Guajará-Mirim", "Itapuã do Oeste", 
    "Jaru", "Ji-Paraná", "Machadinho d'Oeste", "Ministro Andreazza", "Mirante da Serra", "Monte Negro", 
    "Nova Brasilândia d'Oeste", "Nova Mamoré", "Nova União", "Novo Horizonte do Oeste", "Ouro Preto do Oeste", 
    "Parecis", "Pimenta Bueno", "Pimenteiras do Oeste", "Porto Velho", "Presidente Médici", 
    "Primavera de Rondônia", "Rio Crespo", "Rolim de Moura", "Santa Luzia d'Oeste", "São Felipe d'Oeste", 
    "São Francisco do Guaporé", "São Miguel do Guaporé", "Seringueiras", "Teixeirópolis", "Theobroma", 
    "Urupá", "Vale do Anari", "Vale do Paraíso", "Vilhena"
  ];
  
  const sigsVistos = new Set();

  try {
    const TODAS_ABAS = [
      { nome: 'estadual', comp: 'Estadual' },
      { nome: 'federal', comp: 'Federal' },
      ...MUNICIPIOS_RO.map(m => ({ nome: m, comp: 'Municipal' }))
    ];

    for (let batchStart = 0; batchStart < TODAS_ABAS.length; batchStart += TE_BATCH_SIZE) {
      const batchAbas = TODAS_ABAS.slice(batchStart, batchStart + TE_BATCH_SIZE);

      setBadge(`⏳ Lote ${Math.floor(batchStart/TE_BATCH_SIZE)+1} / ${Math.ceil(TODAS_ABAS.length/TE_BATCH_SIZE)}...`, 'loading');
      setLoadMsg(
        `Carregando lote ${Math.floor(batchStart/TE_BATCH_SIZE)+1}...`,
        `Buscando ${batchAbas.length} planilhas | ${totalLoaded} escolas encontradas`
      );

      // Busca paralela do lote usando o nome da aba
      const results = await Promise.allSettled(
        batchAbas.map(aba => {
          const url = 'https://docs.google.com/spreadsheets/d/' + TE_SHEET_ID +
                      '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(aba.nome) + '&nocache=' + Date.now();
          return fetch(url).then(r => r.ok ? r.text() : Promise.reject('HTTP ' + r.status)).then(text => ({ text, aba }));
        })
      );

      results.forEach((res, i) => {
        if (res.status === 'rejected') return;
        
        const text = res.value.text;
        const aba = res.value.aba;
        const mun = aba.nome;
        const sigMatch = text.match(/"sig":"(\d+)"/);
        const sig = sigMatch ? sigMatch[1] : null;
        
        // Se a aba não existir, a API retorna a aba padrão. O sig nos ajuda a ignorar duplicatas/fallbacks!
        if (sig) {
          if (sigsVistos.has(sig)) return; 
          sigsVistos.add(sig);
        }

        const rows = _teParseGviz(text, mun);
        if (!rows || rows.length === 0) return;
        
        rows.forEach(r => {
           if (!r.competencia || r.competencia.trim() === '') r.competencia = aba.comp;
           if (aba.comp === 'Estadual') r.competencia = 'Estadual';
           if (aba.comp === 'Municipal') r.competencia = 'Municipal';
           if (aba.comp === 'Federal') r.competencia = 'Federal';
        });

        totalLoaded += rows.length;

        _teAbas.push({ nome: mun, count: rows.length });
        _teCache.push(...rows);
      });
    }

    if (_teCache.length === 0) throw new Error('Nenhum dado encontrado. Verifique se a planilha está compartilhada publicamente.');

    _teCarregado = true;
    _tePopularFiltros();
    _teFiltrados = [..._teCache];
    _tePagina = 1;
    _teAtualizarUI();

    const abasInfo = _teAbas.length + ' planilha(s) | ' + _teCache.length + ' escolas';
    setBadge('✅ ' + abasInfo, 'ok');
    if (typeof showToast === 'function') showToast('Carregadas ' + _teAbas.length + ' planilhas com ' + _teCache.length + ' escolas no total!', 'success');

  } catch(err) {
    console.error('[TodasEscolas]', err);
    const msgEl = document.getElementById('te-empty-msg');
    if (msgEl) msgEl.textContent = 'Erro: ' + err.message;
    if (emptyEl) emptyEl.style.display = 'block';
    if (tbody) tbody.innerHTML = '';
    setBadge('❌ Erro ao carregar', 'error');
    if (typeof showToast === 'function') showToast('Erro: ' + err.message, 'error');
  }
}
// Popular filtros com valores únicos de TODOS os dados
function _tePopularFiltros() {
  const unique = (key) => [...new Set(_teCache.map(e => e[key]).filter(Boolean))].sort();
  [['te-filtro-municipio','municipio','MUNICÍPIO'],
   ['te-filtro-super','super','SUPER / REGIONAL'],
   ['te-filtro-modalidade','modalidade','MODALIDADE'],
   ['te-filtro-localidade','localidade','LOCALIDADE']
  ].forEach(([id, key, label]) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">' + label + '</option>' +
      unique(key).map(v => '<option value="' + v + '">' + v + '</option>').join('');
  });

  // Popula badge de abas
  const abasBadge = document.getElementById('te-badge-abas');
  if (abasBadge) {
    abasBadge.textContent = '📊 ' + _teAbas.length + ' planilhas';
    abasBadge.style.display = 'inline-flex';
  }
}

// Filtrar
function filtrarTodasEscolas() {
  const busca       = (document.getElementById('te-busca')?.value || '').toLowerCase().trim();
  const municipio   = document.getElementById('te-filtro-municipio')?.value || '';
  const superVal    = document.getElementById('te-filtro-super')?.value || '';
  const modalidade  = document.getElementById('te-filtro-modalidade')?.value || '';
  const localidade  = document.getElementById('te-filtro-localidade')?.value || '';
  const competencia = document.getElementById('te-filtro-competencia')?.value || '';

  _teFiltrados = _teCache.filter(e => {
    if (municipio  && e.municipio  !== municipio)  return false;
    if (superVal   && e.super      !== superVal)   return false;
    if (modalidade && e.modalidade !== modalidade) return false;
    if (localidade && e.localidade !== localidade) return false;
    if (competencia && e.competencia !== competencia) return false;
    if (busca) {
      const hay = [e.nome,e.municipio,e.inep,e.diretor,e.email,
                   e.telefone,e.super,e.secretario,e.contatoDiretor,e.modalidade].join(' ').toLowerCase();
      if (!hay.includes(busca)) return false;
    }
    return true;
  });
  _tePagina = 1;
  _teAtualizarUI();
}

function limparFiltrosTodasEscolas() {
  ['te-busca','te-filtro-municipio','te-filtro-super','te-filtro-modalidade',
   'te-filtro-localidade','te-filtro-competencia'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filtrarTodasEscolas();
}

// Renderiza UI completa
function _teAtualizarUI() {
  const wrap   = document.getElementById('te-table-wrap');
  const emptyEl= document.getElementById('te-empty');
  const tbody  = document.getElementById('te-tbody');
  const total  = _teFiltrados.length;
  const ini    = (_tePagina - 1) * _teItensPorPag;
  const fim    = Math.min(ini + _teItensPorPag, total);
  const pag = _teFiltrados; // Pagination removed

  // Badges
  const totalAlunos = _teFiltrados.reduce((s,e) => s + (parseInt(e.alunos)||0), 0);
  const badgeTotal  = document.getElementById('te-badge-total');
  const badgeAlunos = document.getElementById('te-badge-alunos');
  if (badgeTotal)  badgeTotal.textContent  = '🏫 ' + total.toLocaleString('pt-BR') + ' Escolas';
  if (badgeAlunos) badgeAlunos.textContent = '👥 ' + totalAlunos.toLocaleString('pt-BR') + ' Alunos';

  if (total === 0) {
    if (wrap)    wrap.style.display    = 'none';
    if (emptyEl) {
      emptyEl.style.display = 'block';
      const msgEl = document.getElementById('te-empty-msg');
      if (msgEl) msgEl.textContent = _teCache.length > 0
        ? 'Nenhuma escola corresponde aos filtros.'
        : 'Clique em "Recarregar" para buscar os dados.';
    }
    const pg = document.getElementById('te-pagination');
    if (pg) pg.style.display = 'none';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (wrap)    wrap.style.display    = 'block';

  // Helpers
  const esc = (s) => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const wa = (num) => {
    if (!num) return '—';
    const digits = num.replace(/\D/g,'');
    const href = digits ? 'https://wa.me/55'+digits : '#';
    return '<a href="' + href + '" target="_blank" rel="noopener" style="color:#25d366;text-decoration:none;white-space:nowrap;font-size:11px;"> ' + esc(num) + '</a>';
  };
  const localBadge = (loc) => {
    if (!loc) return '—';
    const l = loc.toLowerCase();
    const isUrb = l.includes('urb');
    const col = isUrb ? '#60a5fa' : (l.includes('ind') ? '#f59e0b' : '#34d399');
    const bg  = isUrb ? 'rgba(59,130,246,0.2)' : (l.includes('ind') ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)');
    return '<span style="padding:2px 8px;border-radius:4px;font-weight:700;font-size:10px;background:' + bg + ';color:' + col + ';">' + esc(loc) + '</span>';
  };

  if (tbody) {
    tbody.innerHTML = pag.map((e, idx) => {
      const evenBg = idx%2===0 ? 'transparent' : 'rgba(255,255,255,0.015)';
      const globalIdx = ini + idx;
      return `<tr style="background:${evenBg};cursor:pointer;" 
        ondblclick="abrirTeModal(${globalIdx})"
        onmouseover="this.style.background='rgba(59,130,246,0.06)'" 
        onmouseout="this.style.background='${evenBg}'">` +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);">' + (window._renderCompetenciaBadge ? window._renderCompetenciaBadge(e.competencia) : '<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:rgba(255,255,255,0.06);color:var(--text-secondary);border:1px solid rgba(255,255,255,0.1)">' + esc(e.competencia) + '</span>') + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-secondary);white-space:nowrap;font-size:12px;">' + (esc(e.municipio)||'-') + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);color:#f0f4ff;font-weight:600;font-size:12px;">' + (esc(e.nome)||'-') + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);color:#60a5fa;font-family:monospace;font-size:11px;white-space:nowrap;">' + (esc(e.inep)||'-') + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);color:#34d399;font-weight:700;text-align:right;font-size:12px;">' + (e.alunos ? parseInt(e.alunos).toLocaleString('pt-BR') : '-') + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-secondary);font-size:12px;">' + (esc(e.modalidade)||'-') + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);font-size:11px;">' + localBadge(e.localidade) + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);color:#f0f4ff;font-size:12px;">' + (esc(e.diretor)||'-') + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);font-size:11px;">' + wa(e.contatoDiretor) + '</td>' +
        '<td style="padding:8px 10px;border-bottom:1px solid var(--border);text-align:center;">' +
          '<a href="' + TE_SHEET_URL + '" target="_blank" rel="noopener" title="Editar no Google Sheets" ' +
          'style="display:inline-flex;align-items:center;justify-content:center;background:rgba(26,115,232,0.2);border:1px solid rgba(26,115,232,0.4);color:#60a5fa;width:28px;height:28px;border-radius:6px;text-decoration:none;font-size:13px;" ' +
          'onmouseover="this.style.background=\'rgba(26,115,232,0.4)\'" onmouseout="this.style.background=\'rgba(26,115,232,0.2)\'">✏️</a>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  _teRenderPaginacao(total, ini, fim);
}

function _teRenderPaginacao(total, ini, fim) {
  const pgEl   = document.getElementById('te-pagination');
  const infoEl = document.getElementById('te-pg-info');
  const ctrlEl = document.getElementById('te-pg-controls');
  if (!pgEl) return;
  const totalPags = Math.ceil(total / _teItensPorPag);
  if (totalPags <= 1) { pgEl.style.display = 'none'; return; }
  pgEl.style.display = 'flex';
  if (infoEl) infoEl.textContent = 'Mostrando ' + (ini+1) + '–' + fim + ' de ' + total.toLocaleString('pt-BR') + ' escolas';
  if (ctrlEl) {
    let html = '';
    const btn = (lbl, p, dis, act) => '<button onclick="_teIrParaPagina(' + p + ')" style="padding:6px 12px;border-radius:6px;border:1px solid ' + (act?'#3b82f6':'var(--border)') + ';background:' + (act?'rgba(59,130,246,0.3)':'transparent') + ';color:' + (act?'#60a5fa':'var(--text-secondary)') + ';cursor:' + (dis?'default':'pointer') + ';opacity:' + (dis?'.4':'1') + ';font-size:13px;" ' + (dis?'disabled':'') + '>' + lbl + '</button>';
    html += btn('‹', _tePagina-1, _tePagina===1, false);
    const s = Math.max(1,_tePagina-2), en = Math.min(totalPags,_tePagina+2);
    if (s>1) { html+=btn(1,1,false,false); if(s>2) html+='<span style="padding:0 4px;color:var(--text-muted);">…</span>'; }
    for (let p=s;p<=en;p++) html+=btn(p,p,false,p===_tePagina);
    if (en<totalPags) { if(en<totalPags-1) html+='<span style="padding:0 4px;color:var(--text-muted);">…</span>'; html+=btn(totalPags,totalPags,false,false); }
    html += btn('›', _tePagina+1, _tePagina===totalPags, false);
    ctrlEl.innerHTML = html;
  }
}

function _teIrParaPagina(p) {
  const tot = Math.ceil(_teFiltrados.length / _teItensPorPag);
  if (p<1||p>tot) return;
  _tePagina = p;
  _teAtualizarUI();
  const pg = document.getElementById('page-todas-escolas');
  if (pg) pg.scrollTo({ top: 0, behavior: 'smooth' });
}

window.iniciarPaginaTodasEscolas  = iniciarPaginaTodasEscolas;
window.recarregarTodasEscolas     = recarregarTodasEscolas;
window.filtrarTodasEscolas        = filtrarTodasEscolas;
window.limparFiltrosTodasEscolas  = limparFiltrosTodasEscolas;
window._teIrParaPagina            = _teIrParaPagina;

// -----------------------------------------------------
// Lógica do Modal de Edição (Todas Escolas)
// -----------------------------------------------------
window.abrirTeModal = function(globalIdx) {
  const e = _teFiltrados[globalIdx];
  if (!e) return;
  
  document.getElementById('te-form-cache-idx').value = globalIdx;
  document.getElementById('te-modal-titulo').textContent = `Editar: ${e.nome || 'Escola'}`;
  
  // Identificação
  document.getElementById('te-form-nome').value = e.nome || '';
  document.getElementById('te-form-municipio').value = e.municipio || '';
  document.getElementById('te-form-inep').value = e.inep || '';
  document.getElementById('te-form-alunos').value = e.alunos || '';
  document.getElementById('te-form-modalidade').value = e.modalidade || '';
  document.getElementById('te-form-localidade').value = e.localidade || '';
  document.getElementById('te-form-super').value = e.super || '';
  document.getElementById('te-form-competencia').value = e.competencia || '';
  
  // Gestão
  document.getElementById('te-form-diretor').value = e.diretor || '';
  document.getElementById('te-form-contato-diretor').value = e.contatoDiretor || '';
  document.getElementById('te-form-telefone').value = e.telefone || '';
  document.getElementById('te-form-email').value = e.email || '';
  
  // Secundários
  document.getElementById('te-form-secretario').value = e.secretario || '';
  document.getElementById('te-form-contato-sec').value = e.contatoSecretario || '';
  document.getElementById('te-form-redes').value = e.redesSociais || '';
  document.getElementById('te-form-cep').value = e.cep || '';
  document.getElementById('te-form-endereco').value = e.endereco || '';
  document.getElementById('te-form-bairro').value = e.bairro || '';
  document.getElementById('te-form-complemento').value = e.complemento || '';
  
  // Infra
  document.getElementById('te-form-salas-aula').value = e.salasAula || '';
  document.getElementById('te-form-salas-adm').value = e.salasAdm || '';
  document.getElementById('te-form-banheiros').value = e.banheiros || '';
  document.getElementById('te-form-patio').value = e.patio || '';
  document.getElementById('te-form-aee').value = e.salaAEE || '';
  document.getElementById('te-form-quadra').value = e.quadra || '';
  document.getElementById('te-form-refeitorio').value = e.refeitorio || '';
  document.getElementById('te-form-auditorio').value = e.auditorio || '';
  
  // Link para o GSheets
  document.getElementById('te-modal-sheets-link').href = TE_SHEET_URL;

  // Reseta toggle
  document.getElementById('te-form-secundarios').style.display = 'none';
  document.getElementById('te-form-toggle-btn').innerHTML = '⬇️ Mostrar campos adicionais (Secretário, Endereço, Infraestrutura)';
  
  document.getElementById('te-modal-overlay').style.display = 'flex';
};

window.fecharTeModal = function() {
  document.getElementById('te-modal-overlay').style.display = 'none';
};

window.teToggleCampos = function() {
  const sec = document.getElementById('te-form-secundarios');
  const btn = document.getElementById('te-form-toggle-btn');
  if (sec.style.display === 'none') {
    sec.style.display = 'block';
    btn.innerHTML = '⬆️ Ocultar campos adicionais';
  } else {
    sec.style.display = 'none';
    btn.innerHTML = '⬇️ Mostrar campos adicionais (Secretário, Endereço, Infraestrutura)';
  }
};

window.salvarTeModal = function() {
  const idx = parseInt(document.getElementById('te-form-cache-idx').value, 10);
  if (isNaN(idx) || !_teFiltrados[idx]) return fecharTeModal();
  
  const e = _teFiltrados[idx];
  
  e.nome = document.getElementById('te-form-nome').value;
  e.municipio = document.getElementById('te-form-municipio').value;
  e.inep = document.getElementById('te-form-inep').value;
  e.alunos = document.getElementById('te-form-alunos').value;
  e.modalidade = document.getElementById('te-form-modalidade').value;
  e.localidade = document.getElementById('te-form-localidade').value;
  e.super = document.getElementById('te-form-super').value;
  e.competencia = document.getElementById('te-form-competencia').value;
  e.diretor = document.getElementById('te-form-diretor').value;
  e.contatoDiretor = document.getElementById('te-form-contato-diretor').value;
  e.telefone = document.getElementById('te-form-telefone').value;
  e.email = document.getElementById('te-form-email').value;
  e.secretario = document.getElementById('te-form-secretario').value;
  e.contatoSecretario = document.getElementById('te-form-contato-sec').value;
  e.redesSociais = document.getElementById('te-form-redes').value;
  e.cep = document.getElementById('te-form-cep').value;
  e.endereco = document.getElementById('te-form-endereco').value;
  e.bairro = document.getElementById('te-form-bairro').value;
  e.complemento = document.getElementById('te-form-complemento').value;
  e.salasAula = document.getElementById('te-form-salas-aula').value;
  e.salasAdm = document.getElementById('te-form-salas-adm').value;
  e.banheiros = document.getElementById('te-form-banheiros').value;
  e.patio = document.getElementById('te-form-patio').value;
  e.salaAEE = document.getElementById('te-form-aee').value;
  e.quadra = document.getElementById('te-form-quadra').value;
  e.refeitorio = document.getElementById('te-form-refeitorio').value;
  e.auditorio = document.getElementById('te-form-auditorio').value;
  
  _teAtualizarUI();
  
  if (typeof showToast === 'function') showToast('Alterações locais aplicadas!', 'success');
  fecharTeModal();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const ov = document.getElementById('te-modal-overlay');
    if (ov && ov.style.display === 'flex') {
      fecharTeModal();
    }
  }
});


function imprimirPadraoSelecionado() {
    const idsSelecionados = Array.from(document.querySelectorAll('.check-processo:checked')).map(cb => cb.value);
    if (idsSelecionados.length === 0) {
        alert('Nenhum processo selecionado.');
        return;
    }
    const filtrados = getFiltrados().filter(p => idsSelecionados.includes(p.id));
    imprimirPadrao(filtrados);
}
window.imprimirPadraoSelecionado = imprimirPadraoSelecionado;

function toggleAllProcessos(el) {
    const checkboxes = document.querySelectorAll('.check-processo');
    checkboxes.forEach(cb => cb.checked = el.checked);
}
window.toggleAllProcessos = toggleAllProcessos;

window._processosInconsistentesParaCorrigir = [];

function normalizarEspacos(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/\s+/g, ' ').trim();
}

function verificarInconsistenciasPlanilha() {
  const container = document.getElementById('status-padronizacao-container');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  const btnExecutar = document.getElementById('btn-executar-padronizacao');
  const progContainer = document.getElementById('bar-prog-container');

  if (container) container.style.display = 'block';
  if (labelStatus) labelStatus.textContent = '🔎 Realizando varredura completa em todos os registros do sistema...';
  if (logDiv) logDiv.innerHTML = '';
  if (btnExecutar) btnExecutar.style.display = 'none';
  if (progContainer) progContainer.style.display = 'none';

  if (!window.processosCache || window.processosCache.length === 0) {
    if (labelStatus) labelStatus.textContent = '❌ Erro: Nenhum registro carregado no sistema para análise.';
    return;
  }

  let inconsistentes = [];

  window.processosCache.forEach(p => {
    let mudou = false;
    let atualizacoes = {};
    let descricoes = [];

        // A pedido do usuario, o padronizador agora MEXE SOMENTE NOS NOMES (Interessado)
    // usando Jaro-Winkler com +90% de certeza com base na lista de escolas.
    if (p.interessado) {
      let intNorm = normalizarEspacos(p.interessado);
      const matchEscola = encontrarEscolaSemelhante(intNorm);
      if (matchEscola && matchEscola !== p.interessado) {
        atualizacoes.interessado = matchEscola;
        descricoes.push("NOME: " + p.interessado + " -> " + matchEscola);
        mudou = true;
      }
    }

    if (mudou && (p.aba !== 'PARAMETROS' && p.aba !== 'parametro_combo')) {
      inconsistentes.push({
        id: p.id,
        rowNumber: p.rowNumber,
        aba: p.aba,
        numero: p.numero || p.id,
        atualizacoes: atualizacoes,
        descricao: descricoes.join(' | ')
      });
    }
  });

  window._processosInconsistentesParaCorrigir = inconsistentes;

  if (inconsistentes.length === 0) {
    if (labelStatus) labelStatus.innerHTML = '<span style="color:#34d399; font-weight:700;">✅ Varredura Concluída: Todos os registros estão 100% padronizados! Nenhuma divergência encontrada.</span>';
    return;
  }

  if (labelStatus) labelStatus.innerHTML = `<span style="color:#fbbf24; font-weight:700;">⚠️ Varredura Concluída: Encontrados ${inconsistentes.length} registros com divergências de formatação/padronização no sistema.</span>`;
  
  let html = `<table style="width:100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; color: #cbd5e1; background: rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.08); text-align: left;">
        <th style="padding: 8px 12px; color: #94a3b8;">Nº Processo / ID</th>
        <th style="padding: 8px 12px; color: #94a3b8;">Divergências Detectadas (Espaços Extras, Caixas ou Termos)</th>
      </tr>
    </thead>
    <tbody>`;
  
  inconsistentes.slice(0, 150).forEach(inc => {
    html += `<tr style="border-bottom: 1px dashed rgba(255,255,255,0.05);">
      <td style="padding: 8px 12px; font-weight: bold; color: #60a5fa; font-family: monospace;">${inc.numero}</td>
      <td style="padding: 8px 12px; color: #34d399;">${inc.descricao}</td>
    </tr>`;
  });
  
  if (inconsistentes.length > 150) {
    html += `<tr><td colspan="2" style="padding: 10px; text-align: center; color: #fbbf24; font-weight: 600;">... e mais ${inconsistentes.length - 150} registros pendentes no lote ...</td></tr>`;
  }
  
  html += '</tbody></table>';
  if (logDiv) logDiv.innerHTML = html;
  if (btnExecutar) {
    btnExecutar.style.display = 'inline-flex';
    btnExecutar.disabled = false;
  }
  const btnCancelar = document.getElementById('btn-cancelar-padronizacao');
  if (btnCancelar) btnCancelar.style.display = 'inline-flex';
}

async function executarPadronizacaoPlanilha() {
  const btnExecutar = document.getElementById('btn-executar-padronizacao');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const btnVerificar = document.getElementById('btn-verificar-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  
  if (btnExecutar) btnExecutar.style.display = 'none';
  if (btnVerificar) btnVerificar.disabled = true;
  
  const inconsistentes = window._processosInconsistentesParaCorrigir || [];
  let total = inconsistentes.length;

  if (total === 0) return;

  // Barra de progresso interativa
  let progContainer = document.getElementById('bar-prog-container');
  if (!progContainer) {
    progContainer = document.createElement('div');
    progContainer.id = 'bar-prog-container';
    progContainer.style.cssText = 'width: 100%; margin-top: 14px; margin-bottom: 14px; background: rgba(15,23,42,0.6); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);';
    logDiv.parentNode.insertBefore(progContainer, logDiv);
  } else {
    progContainer.style.display = 'block';
  }

  progContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">
      <span id="prog-text-status">⚙️ Aplicando correções na planilha em lote...</span>
      <span id="prog-pct" style="color: #10b981; font-family: monospace; font-size: 13px;">0%</span>
    </div>
    <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);">
      <div id="bar-prog-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 5px; transition: width 0.15s ease-out; box-shadow: 0 0 10px rgba(16,185,129,0.5);"></div>
    </div>
    <div style="display: flex; gap: 15px; margin-top: 8px; font-size: 11px; color: #94a3b8;">
      <span id="prog-count-suc" style="color: #34d399;">✅ Sucesso: 0</span>
      <span id="prog-count-err" style="color: #f87171;">❌ Falhas: 0</span>
      <span id="prog-count-rem">Total: ${total}</span>
    </div>
  `;

  const barFill = document.getElementById('bar-prog-fill');
  const progPct = document.getElementById('prog-pct');
  const progSuc = document.getElementById('prog-count-suc');
  const progErr = document.getElementById('prog-count-err');
  const progText = document.getElementById('prog-text-status');

  logDiv.innerHTML = '<div id="live-log-box" style="display:flex; flex-direction:column; gap:4px;"></div>';
  const liveBox = document.getElementById('live-log-box');

  let sucesso = 0;
  let falhas = 0;
  const token = sessionStorage.getItem('sap_session_token');

  for (let i = 0; i < total; i++) {
    const inc = inconsistentes[i];
    const currentNum = i + 1;
    const pct = Math.round((currentNum / total) * 100);

    if (barFill) barFill.style.width = `${pct}%`;
    if (progPct) progPct.textContent = `${pct}%`;
    if (labelStatus) labelStatus.textContent = `Processando registro ${currentNum} de ${total}...`;

    try {
      const res = await fetch(API_BASE + '/api/registros/' + inc.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ ...(window._dadosPlanilhaCache ? window._dadosPlanilhaCache.find(p => p.id === inc.id) : {}), ...inc.atualizacoes })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      sucesso++;
      if (progSuc) progSuc.textContent = `✅ Sucesso: ${sucesso}`;

      if (liveBox) {
        const item = document.createElement('div');
        item.style.cssText = 'color: #34d399; font-size: 11px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.03);';
        item.textContent = `✅ Processo ${inc.numero}: ${inc.descricao}`;
        liveBox.appendChild(item);
        logDiv.scrollTop = logDiv.scrollHeight;
      }
    } catch (err) {
      falhas++;
      if (progErr) progErr.textContent = `❌ Falhas: ${falhas}`;

      if (liveBox) {
        const item = document.createElement('div');
        item.style.cssText = 'color: #f87171; font-size: 11px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.03);';
        item.textContent = `❌ Erro no Processo ${inc.numero}: ${err.message}`;
        liveBox.appendChild(item);
        logDiv.scrollTop = logDiv.scrollHeight;
      }
    }

    await new Promise(r => setTimeout(r, 150));
  }

  if (progText) progText.textContent = '🎉 Padronização concluída!';
  if (labelStatus) labelStatus.innerHTML = `<span style="color:#34d399; font-weight:700;">✅ Padronização Concluída! ${sucesso} registros corrigidos com sucesso (${falhas} falhas).</span>`;
  if (btnVerificar) btnVerificar.disabled = false;

  if (typeof recarregarDadosGlobais === 'function') {
    recarregarDadosGlobais();
  }
}

window.verificarInconsistenciasPlanilha = verificarInconsistenciasPlanilha;
window.executarPadronizacaoPlanilha = executarPadronizacaoPlanilha;

function selectSegment(group, value) {
  const hiddenInput = document.getElementById(`form-${group}`);
  if (!hiddenInput) return;
  
  const isSelected = hiddenInput.value === value;
  hiddenInput.value = isSelected ? '' : value;
  
  updateSegmentControl(group, hiddenInput.value);
}

function updateSegmentControl(group, activeValue) {
  const control = document.getElementById(`control-${group}`);
  if (!control) return;
  const buttons = control.querySelectorAll('.segment-btn');
  buttons.forEach(btn => {
    const val = btn.getAttribute('data-value');
    if (val === activeValue) {
      btn.style.background = getActiveBgColor(group, val);
      btn.style.borderColor = getActiveBorderColor(group, val);
      btn.style.border = `1px solid ${getActiveBorderColor(group, val)}`;
      btn.style.color = (val === 'OB' || val === 'MC') ? '#0f172a' : '#fff';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    } else {
      btn.style.background = 'none';
      btn.style.border = '1px solid transparent';
      btn.style.color = 'var(--text-secondary)';
      btn.style.boxShadow = 'none';
    }
  });
}

function getActiveBgColor(group, val) {
  if (group === 'categoria') {
    if (val === 'F') return '#3b82f6';
    if (val === 'C') return '#10b981';
    if (val === 'O' || val === 'T') return '#8b5cf6';
  } else if (group === 'tipo') {
    if (val === 'OB') return '#06b6d4';
    if (val === 'MP') return '#f97316';
    if (val === 'MC') return '#f59e0b';
    if (val === 'SI') return '#a855f7';
    if (val === 'TR') return '#10b981';
    if (val === 'OUT') return '#f43f5e';
  }
  return 'rgba(255, 255, 255, 0.1)';
}

function getActiveBorderColor(group, val) {
  return getActiveBgColor(group, val);
}

function getCategoryBadge(categoria) {
  if (!categoria) return '';
  const char = String(categoria).trim().toUpperCase()[0];
  if (char === 'F') {
    return `<span class="badge-cat badge-cat-f" title="Categoria: Fomento" style="margin-left: 4px; padding: 2px 6px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">F</span>`;
  }
  if (char === 'C') {
    return `<span class="badge-cat badge-cat-c" title="Categoria: Convênio" style="margin-left: 4px; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">C</span>`;
  }
  if (char === 'O') {
    return `<span class="badge-cat badge-cat-o" title="Categoria: Outro" style="margin-left: 4px; padding: 2px 6px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">O</span>`;
  }
  if (char === 'T') {
    return `<span class="badge-cat badge-cat-t" title="Categoria: Termo de Cooperação" style="margin-left: 4px; padding: 2px 6px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">T</span>`;
  }
  return '';
}

function getTypeBadge(tipo) {
  if (!tipo) return '';
  const char = String(tipo).trim().toUpperCase();
  if (char === 'OB') {
    return `<span class="badge-tipo badge-tipo-ob" title="Tipo: Obras" style="margin-left: 4px; padding: 2px 6px; background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">OB</span>`;
  }
  if (char === 'MP') {
    return `<span class="badge-tipo badge-tipo-mp" title="Tipo: Material Permanente" style="margin-left: 4px; padding: 2px 6px; background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">MP</span>`;
  }
  if (char === 'MC') {
    return `<span class="badge-tipo badge-tipo-mc" title="Tipo: Material de Consumo" style="margin-left: 4px; padding: 2px 6px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">MC</span>`;
  }
  if (char === 'SI') {
    return `<span class="badge-tipo badge-tipo-si" title="Tipo: Sistema" style="margin-left: 4px; padding: 2px 6px; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">SI</span>`;
  }
  if (char === 'TR') {
    return `<span class="badge-tipo badge-tipo-tr" title="Tipo: Treinamento" style="margin-left: 4px; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">TR</span>`;
  }
  if (char === 'OUT' || char === 'OU') {
    return `<span class="badge-tipo badge-tipo-out" title="Tipo: Outros" style="margin-left: 4px; padding: 2px 6px; background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">OUT</span>`;
  }
  return '';
}

window.selectSegment = selectSegment;
window.updateSegmentControl = updateSegmentControl;
window.getActiveBgColor = getActiveBgColor;
window.getActiveBorderColor = getActiveBorderColor;
window.getCategoryBadge = getCategoryBadge;
window.getTypeBadge = getTypeBadge;















// =========================================================================
// PAINEL DE INFORMAÇÕES DO SISTEMA, DIAGNÓSTICO & MÉTRICAS (GBZ - v1.2.85)
// =========================================================================

let _sysInfoTimer = null;

function atualizarMetricasSistemaInfo() {
  // 1. GDSM
  const poolGDSM = window.processosCache || (typeof state !== 'undefined' && state.processos) || [];
  const elTotalGDSM = document.getElementById('metric-gdsm-total');
  const elRepGDSM = document.getElementById('metric-gdsm-repetidos');
  if (elTotalGDSM) elTotalGDSM.textContent = poolGDSM.length;

  if (elRepGDSM) {
    const mapaRep = {};
    poolGDSM.forEach(p => {
      const num = (p.numero || '').trim();
      if (num && num !== '-' && num !== 'S/N') {
        mapaRep[num] = (mapaRep[num] || 0) + 1;
      }
    });
    let repetidos = 0;
    Object.values(mapaRep).forEach(qtd => {
      if (qtd > 1) repetidos += (qtd - 1);
    });
    elRepGDSM.textContent = repetidos;
  }

  // 2. GMAC
  const gmac = window.gmacCache || {};
  const setElText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setElText('metric-gmac-aee', (gmac.aee || []).length);
  setElText('metric-gmac-onibus', (gmac.onibus || []).length);
  setElText('metric-gmac-veiculos', (gmac.veiculos || []).length);
  setElText('metric-gmac-reord', (gmac.reordenamento || []).length);
  setElText('metric-gmac-coop', (gmac.cooperacao || []).length);

  // 3. Escolas de Rondônia
  const escolas = window._escolasCache || (typeof _escolasCache !== 'undefined' ? _escolasCache : []) || [];
  const munEsc = escolas.filter(e => {
    const c = String(e.competencia || e.rede || '').toUpperCase();
    return c.includes('MUN');
  }).length;
  const estEsc = escolas.filter(e => {
    const c = String(e.competencia || e.rede || '').toUpperCase();
    return c.includes('EST');
  }).length;
  const fedEsc = escolas.filter(e => {
    const c = String(e.competencia || e.rede || '').toUpperCase();
    return c.includes('FED');
  }).length;
  setElText('metric-escolas-mun', munEsc);
  setElText('metric-escolas-est', estEsc);
  setElText('metric-escolas-fed', fedEsc);

  // 4. PROALFA / CENSO
  const pData = window.proalfaData || (typeof proalfaData !== 'undefined' ? proalfaData : null) || {};
  let profMun = 0, profEst = 0, alunMun = 0, alunEst = 0;
  if (pData['Docentes_Rede_Municipal_2025']) {
    pData['Docentes_Rede_Municipal_2025'].forEach(r => { profMun += (Number(r[8]) || 0); });
  }
  if (pData['Docentes_Rede_Est.2025-EF-AI']) {
    pData['Docentes_Rede_Est.2025-EF-AI'].forEach(r => { profEst += (Number(r[8]) || 0); });
  }
  if (pData['Matrículas_Municipal_2025']) {
    pData['Matrículas_Municipal_2025'].forEach(r => {
      alunMun += ((Number(r[9])||0) + (Number(r[10])||0) + (Number(r[11])||0) + (Number(r[12])||0) + (Number(r[13])||0));
    });
  }
  if (pData['Matrículas_Estadual_2025-EF-AI']) {
    pData['Matrículas_Estadual_2025-EF-AI'].forEach(r => {
      alunEst += ((Number(r[9])||0) + (Number(r[10])||0) + (Number(r[11])||0) + (Number(r[12])||0) + (Number(r[13])||0));
    });
  }
  setElText('metric-proalfa-prof-mun', profMun.toLocaleString('pt-BR'));
  setElText('metric-proalfa-prof-est', profEst.toLocaleString('pt-BR'));
  setElText('metric-proalfa-alun-mun', alunMun.toLocaleString('pt-BR'));
  setElText('metric-proalfa-alun-est', alunEst.toLocaleString('pt-BR'));

  // 5. Orçamento CAM (Execução)
  const orcList = window._orcFiltrado || window.ORCAMENTO_DATA || (typeof _orcFiltrado !== 'undefined' ? _orcFiltrado : []) || [];
  const totalExec = orcList.reduce((s, r) => s + (Number(r.executado) || 0), 0);
  const totalEmp  = orcList.reduce((s, r) => s + (Number(r.empenhado) || 0), 0);
  const totalSal  = orcList.reduce((s, r) => s + (Number(r.saldoLiquido) || 0), 0);
  const fmtBRL = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  setElText('metric-orc-executado', fmtBRL(totalExec));
  setElText('metric-orc-empenhado', fmtBRL(totalEmp));
  setElText('metric-orc-saldo', fmtBRL(totalSal));

  // 6. Controle de Diárias
  const diarias = window.DIARIAS_DATA || (typeof DIARIAS_DATA !== 'undefined' ? DIARIAS_DATA : []) || [];
  let dPagos = 0, dAnalise = 0, dEncerrados = 0, dAguardando = 0;
  diarias.forEach(d => {
    const s = String(d.status || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (s.includes('PAGO')) dPagos++;
    else if (s.includes('ANALIS')) dAnalise++;
    else if (s.includes('ENCERR')) dEncerrados++;
    else if (s.includes('AGUARD')) dAguardando++;
  });
  setElText('metric-diarias-pagos', dPagos);
  setElText('metric-diarias-analise', dAnalise);
  setElText('metric-diarias-encerrados', dEncerrados);
  setElText('metric-diarias-aguardando', dAguardando);
}
window.atualizarMetricasSistemaInfo = atualizarMetricasSistemaInfo;

window.atualizarPainelSistemaCompleto = async function(btn) {
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerHTML = '<span style="display:inline-block; animation:spin 1s linear infinite;">🔄</span> Atualizando...';
  }
  try {
    if (typeof recarregarDadosGlobais === 'function') {
      await recarregarDadosGlobais();
    } else {
      if (typeof inicializarDados === 'function') await inicializarDados();
      if (typeof carregarAcessos === 'function') await carregarAcessos();
      if (typeof carregarPainelSistemaInfo === 'function') await carregarPainelSistemaInfo();
    }
    if (typeof carregarPainelSistemaInfo === 'function') {
      await carregarPainelSistemaInfo();
    }
    if (typeof toast === 'function') {
      toast('Painel e sistema atualizados com sucesso!', 'success');
    }
  } catch(err) {
    console.error('Erro ao atualizar painel:', err);
    if (typeof toast === 'function') {
      toast('Erro ao atualizar: ' + (err.message || err), 'error');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.innerHTML = originalHtml || '🔄 Atualizar Painel';
    }
  }
};

async function carregarPainelSistemaInfo() {
  // 1. Dados do Usuário Ativo
  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem('sap_user_data') || localStorage.getItem('sap_user_data') || '{}');
  } catch(e) {}
  
  const topUserName = document.getElementById('user-name')?.textContent?.trim();
  const userName = user?.nome || topUserName || 'Elton';
  const userWhats = user?.whatsapp || '69993186415';
  const userNivel = user?.nivel || 'admin';
  const userSetor = user?.setor || 'CAM / SEDUC-RO';

  const formatTel = (w) => {
    if (!w) return 'Não informado';
    if (typeof maskCelular === 'function') return maskCelular(String(w));
    const clean = String(w).replace(/\D/g, '');
    if (clean.length === 11) return '(' + clean.slice(0,2) + ') ' + clean.slice(2,7) + '-' + clean.slice(7);
    return w;
  };

  const elNome = document.getElementById('sysinfo-user-nome');
  const elWhats = document.getElementById('sysinfo-user-whats');
  const elRole = document.getElementById('sysinfo-user-role');
  const elSetor = document.getElementById('sysinfo-user-setor');
  const elEntrada = document.getElementById('sysinfo-user-entrada');

  if (elNome) {
    elNome.textContent = userName;
  }
  if (elWhats) {
    const cleanNum = String(userWhats).replace(/\D/g, '');
    elWhats.innerHTML = '<a href="https://wa.me/55' + cleanNum + '" target="_blank" rel="noopener" style="color:#60a5fa; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">📱 WhatsApp: ' + formatTel(userWhats) + ' ↗</a>';
  }
  if (elRole) {
    const perfil = String(userNivel).toUpperCase();
    elRole.textContent = (perfil === 'ADM' || perfil === 'ADMIN') ? 'Admin (Acesso Total)' : perfil;
  }
  if (elSetor) {
    elSetor.textContent = userSetor;
  }

  // Data e hora de entrada da sessão
  let entradaISO = sessionStorage.getItem('sap_session_start_time');
  if (!entradaISO) {
    entradaISO = new Date().toISOString();
    sessionStorage.setItem('sap_session_start_time', entradaISO);
  }
  const dtEntrada = new Date(entradaISO);
  if (elEntrada) {
    elEntrada.textContent = dtEntrada.toLocaleDateString('pt-BR') + ' ' + dtEntrada.toLocaleTimeString('pt-BR');
  }

  // Cronômetro da sessão ativa (GBZ - v1.2.85)
  const elTempo = document.getElementById('sysinfo-tempo-sessao');
  if (_sysInfoTimer) clearInterval(_sysInfoTimer);
  const formatarTempoAtivo = () => {
    if (!elTempo) return;
    const diffMs = Math.max(0, Date.now() - dtEntrada.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    elTempo.innerHTML = '⏱️ Tempo Ativo: <strong>' + hrs + ':' + mins + ':' + secs + '</strong>';
  };
  formatarTempoAtivo();
  _sysInfoTimer = setInterval(formatarTempoAtivo, 1000);

  // Renderizar tabela de conexões/usuários com detecção de usuários ativos em tempo real (GBZ - v1.2.85)
  const isUsuarioAtivoAgora = (dataStr, isCurrent, u) => {
    if (isCurrent) return true;
    
    // 1. Verificar lista em tempo real do servidor (heartbeat ativo nos últimos 2 min)
    if (window._usuariosOnlineAtivos && Array.isArray(window._usuariosOnlineAtivos)) {
      const uWhatsClean = String(u.whatsapp || u.whats || '').replace(/\D/g, '');
      const uNomeClean = String(u.nome || '').trim().toLowerCase();
      const matchHb = window._usuariosOnlineAtivos.some(online => {
        const oWhatsClean = String(online.whatsapp || '').replace(/\D/g, '');
        const oNomeClean = String(online.nome || '').trim().toLowerCase();
        if (uWhatsClean && oWhatsClean && uWhatsClean === oWhatsClean) return true;
        if (uNomeClean && oNomeClean && uNomeClean === oNomeClean) return true;
        return false;
      });
      if (matchHb) return true;
    }
    
    // 2. Se não há heartbeat recente, verificar se o registro de acesso na planilha ocorreu nos últimos 5 minutos
    if (!dataStr) return false;
    const str = String(dataStr).trim();
    const m = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (m && m[4] && m[5]) {
      const uDate = new Date(
        parseInt(m[3], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[1], 10),
        parseInt(m[4], 10),
        parseInt(m[5], 10),
        m[6] ? parseInt(m[6], 10) : 0
      );
      const diffMin = (Date.now() - uDate.getTime()) / 60000;
      // Considera online se o acesso foi há menos de 5 minutos
      if (diffMin >= 0 && diffMin <= 5) {
        return true;
      }
    }
    
    return false;
  };

  const renderTabelaUsuarios = (lista) => {
    const tbodyLogados = document.getElementById('sysinfo-tbody-logados');
    if (!tbodyLogados) return;

    if (!lista || lista.length === 0) {
      tbodyLogados.innerHTML = 
        '<tr style="border-bottom:1px solid rgba(255,255,255,0.04); background:rgba(245,158,11,0.14); border-left:4px solid #f59e0b;">' +
          '<td style="padding:8px 12px; font-weight:800; color:#fbbf24;">👑 ' + userName + ' (Você)</td>' +
          '<td style="padding:8px 12px; color:#60a5fa; font-family:monospace;">' + formatTel(userWhats) + '</td>' +
          '<td style="padding:8px 12px;"><span style="background:rgba(245,158,11,0.2); color:#fbbf24; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:800; border:1px solid rgba(245,158,11,0.4);">' + String(userNivel).toUpperCase() + '</span></td>' +
          '<td style="padding:8px 12px; color:#fbbf24; font-family:monospace;">' + dtEntrada.toLocaleDateString('pt-BR') + ' ' + dtEntrada.toLocaleTimeString('pt-BR') + '<div style="font-size:10.5px; color:#fbbf24; font-weight:700;">(ativo agora)</div></td>' +
          '<td style="padding:8px 12px;"><span style="color:#fbbf24; font-weight:800; background:rgba(245,158,11,0.22); padding:4px 12px; border-radius:6px; border:1px solid #f59e0b; display:inline-flex; align-items:center; gap:6px; box-shadow:0 0 12px rgba(245,158,11,0.35); font-size:11.5px;">👑 Online (Você)</span></td>' +
        '</tr>';
      return;
    }

    // Ordena: usuário atual (Você) primeiro, depois outros online, depois offline
    const ordenados = [...lista].sort((a, b) => {
      const isCurA = (a.nome && a.nome.toLowerCase() === userName.toLowerCase()) || 
                     (a.whatsapp && String(a.whatsapp).replace(/\D/g,'') === String(userWhats).replace(/\D/g,''));
      const isCurB = (b.nome && b.nome.toLowerCase() === userName.toLowerCase()) || 
                     (b.whatsapp && String(b.whatsapp).replace(/\D/g,'') === String(userWhats).replace(/\D/g,''));
      if (isCurA && !isCurB) return -1;
      if (!isCurA && isCurB) return 1;

      const ativA = isUsuarioAtivoAgora(a.data, isCurA, a) ? 1 : 0;
      const ativB = isUsuarioAtivoAgora(b.data, isCurB, b) ? 1 : 0;
      if (ativA !== ativB) return ativB - ativA;

      return 0;
    });

    tbodyLogados.innerHTML = ordenados.map((u) => {
      const isCurrent = (u.nome && u.nome.toLowerCase() === userName.toLowerCase()) || 
                        (u.whatsapp && String(u.whatsapp).replace(/\D/g,'') === String(userWhats).replace(/\D/g,''));
      const ativo = isUsuarioAtivoAgora(u.data, isCurrent, u);

      let statusBadge = '';
      if (isCurrent) {
        // Destaque amarelo ouro exclusivo para Você / Elton (GBZ - v1.2.85)
        statusBadge = '<span style="color:#fbbf24; font-weight:800; background:rgba(245,158,11,0.22); padding:4px 12px; border-radius:6px; border:1px solid #f59e0b; display:inline-flex; align-items:center; gap:6px; box-shadow:0 0 12px rgba(245,158,11,0.35); font-size:11.5px;">👑 Online (Você)</span>';
      } else if (ativo) {
        statusBadge = '<span style="color:#10b981; font-weight:800; background:rgba(16,185,129,0.2); padding:4px 12px; border-radius:6px; border:1px solid #10b981; display:inline-flex; align-items:center; gap:6px; box-shadow:0 0 10px rgba(16,185,129,0.3); font-size:11.5px;">🟢 Online</span>';
      } else {
        statusBadge = '<span style="color:#ef4444; font-weight:800; background:rgba(239,68,68,0.15); padding:4px 12px; border-radius:6px; border:1px solid rgba(239,68,68,0.4); display:inline-flex; align-items:center; gap:6px; font-size:11px;">🔴 Offline</span>';
      }
      
      const horaAcesso = isCurrent 
        ? (dtEntrada.toLocaleDateString('pt-BR') + ' ' + dtEntrada.toLocaleTimeString('pt-BR'))
        : (u.data || u.ultimoAcesso || '--/--/---- --:--:--');

      // Calcular tempo decorrido desde o login
      let tempoRelativo = '';
      if (isCurrent) {
        const diffMin = Math.floor(Math.max(0, Date.now() - dtEntrada.getTime()) / 60000);
        if (diffMin < 1) tempoRelativo = '<div style="font-size:10.5px; color:#fbbf24; font-weight:700;">(ativo agora)</div>';
        else if (diffMin < 60) tempoRelativo = '<div style="font-size:10.5px; color:#fbbf24; font-weight:700;">(ativo há ' + diffMin + ' min)</div>';
        else tempoRelativo = '<div style="font-size:10.5px; color:#fbbf24; font-weight:700;">(ativo há ' + Math.floor(diffMin/60) + 'h ' + (diffMin%60) + 'm)</div>';
      } else if (u.data) {
        const m = String(u.data).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
        if (m && m[4] && m[5]) {
          const uDate = new Date(parseInt(m[3],10), parseInt(m[2],10)-1, parseInt(m[1],10), parseInt(m[4],10), parseInt(m[5],10), m[6]?parseInt(m[6],10):0);
          const diffMin = Math.floor(Math.max(0, Date.now() - uDate.getTime()) / 60000);
          if (ativo) {
            if (diffMin < 1) tempoRelativo = '<div style="font-size:10.5px; color:#10b981; font-weight:600;">(ativo agora)</div>';
            else tempoRelativo = '<div style="font-size:10.5px; color:#10b981; font-weight:600;">(ativo há ' + diffMin + ' min)</div>';
          } else {
            if (diffMin < 60) tempoRelativo = '<div style="font-size:10.5px; color:#94a3b8;">(acesso há ' + diffMin + ' min)</div>';
            else if (diffMin < 1440) tempoRelativo = '<div style="font-size:10.5px; color:#94a3b8;">(acesso há ' + Math.floor(diffMin/60) + 'h ' + (diffMin%60) + 'm)</div>';
            else tempoRelativo = '<div style="font-size:10.5px; color:#94a3b8;">(acesso há ' + Math.floor(diffMin/1440) + ' d)</div>';
          }
        }
      }

      // Estilização diferenciada da linha: Amarelo ouro para Você/Elton
      const trBg = isCurrent ? 'rgba(245,158,11,0.12)' : (ativo ? 'rgba(16,185,129,0.08)' : 'transparent');
      const trBorder = isCurrent ? 'border-left:4px solid #f59e0b;' : (ativo ? 'border-left:4px solid #10b981;' : 'border-left:4px solid transparent;');
      const nameColor = isCurrent ? '#fbbf24' : (ativo ? '#34d399' : '#cbd5e1');
      const displayName = isCurrent ? ('👑 ' + (u.nome || userName) + ' (Você)') : (u.nome || 'Usuário');

      return (
        '<tr style="border-bottom:1px solid rgba(255,255,255,0.04); background:' + trBg + '; ' + trBorder + '">' +
          '<td style="padding:8px 12px; font-weight:700; color:' + nameColor + ';">' + displayName + '</td>' +
          '<td style="padding:8px 12px; color:#60a5fa; font-family:monospace;">' + formatTel(u.whatsapp || u.whats) + '</td>' +
          '<td style="padding:8px 12px;"><span style="background:' + (isCurrent ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.15)') + '; color:' + (isCurrent ? '#fbbf24' : '#60a5fa') + '; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;' + (isCurrent ? 'border:1px solid rgba(245,158,11,0.4);' : '') + '">' + String(u.nivel || u.perfil || 'EDITOR').toUpperCase() + '</span></td>' +
          '<td style="padding:8px 12px; color:#fbbf24; font-family:monospace;">' + horaAcesso + tempoRelativo + '</td>' +
          '<td style="padding:8px 12px;">' + statusBadge + '</td>' +
        '</tr>'
      );
    }).join('');
  };

  const atualizarListaEConexoes = async () => {
    if (typeof window.buscarUsuariosOnline === 'function') {
      try { await window.buscarUsuariosOnline(); } catch(e) {}
    }
    const token = sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token');
    if (token && typeof API_BASE !== 'undefined') {
      try {
        const res = await fetch(API_BASE + '/api/acessos', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            window.listaAcessos = data;
            renderTabelaUsuarios(data);
            return;
          }
        }
      } catch(e) {}
    }
    renderTabelaUsuarios(window.listaAcessos || []);
  };
  atualizarListaEConexoes();

  // 2. Atualizar Métricas Imediatamente
  atualizarMetricasSistemaInfo();
  atualizarBadgeBackupPadronizacao();

  // 3. Proativamente carregar dados dos módulos se ainda estiverem vazios
  try {
    const promises = [];
    if (!window.processosCache || window.processosCache.length === 0) {
      if (typeof inicializarDados === 'function') promises.push(inicializarDados());
      else if (typeof carregarProcessos === 'function') promises.push(carregarProcessos());
      else if (typeof buscarDados === 'function') promises.push(buscarDados());
    }
    const modulosGMAC = ['aee', 'onibus', 'veiculos', 'reordenamento', 'cooperacao'];
    const precisaGMAC = !window.gmacCache || modulosGMAC.some(m => !window.gmacCache[m] || window.gmacCache[m].length === 0);
    if (precisaGMAC && typeof carregarGMAC === 'function') {
      modulosGMAC.forEach(m => promises.push(carregarGMAC(m, true)));
    }
    if ((!window._escolasCache || window._escolasCache.length === 0) && typeof carregarEscolasAPI === 'function') {
      promises.push(carregarEscolasAPI(true));
    }
    if (!window.proalfaData && typeof carregarProalfa === 'function') {
      promises.push(carregarProalfa());
    }
    if ((!window._orcFiltrado || window._orcFiltrado.length === 0) && typeof carregarOrcamentoData === 'function') {
      promises.push(carregarOrcamentoData());
    }
    if ((!window.DIARIAS_DATA || window.DIARIAS_DATA.length === 0) && typeof carregarDiariasData === 'function') {
      promises.push(carregarDiariasData());
    }
    if (promises.length > 0) {
      Promise.allSettled(promises).then(() => {
        atualizarMetricasSistemaInfo();
      });
    }
  } catch(err) {
    console.warn('Carregamento proativo de métricas:', err);
    atualizarMetricasSistemaInfo();
  }
}
window.carregarPainelSistemaInfo = carregarPainelSistemaInfo;

function atualizarBadgeBackupPadronizacao() {
  const badge = document.getElementById('sysinfo-backup-badge');
  if (!badge) return;
  const raw = localStorage.getItem('padronizacao_backup');
  if (!raw) {
    badge.textContent = 'Último Backup: Nenhum registrado';
    badge.style.color = '#94a3b8';
    return;
  }
  try {
    const b = JSON.parse(raw);
    const regs = (b.registros || []).length;
    badge.textContent = 'Último Backup: ' + (b.dataHora || 'Gravado') + ' (' + regs + ' regs)';
    badge.style.color = '#00ff66';
  } catch(e) {
    badge.textContent = 'Último Backup: Gravado';
  }
}
window.atualizarBadgeBackupPadronizacao = atualizarBadgeBackupPadronizacao;

// =========================================================================
// PADRONIZADOR & CORRETOR ORTOGRÁFICO (TERMINAL CMD VERDE FÓSFORO)
// =========================================================================

let _divergenciasDetectadasCMD = [];

function normalizarTextoSeguro(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\s+/g, ' ').trim();
}

function formatarProcessosColuna(numeroStr) {
  if (!numeroStr) return '<span style="color:#64748b;">S/N</span>';
  const raw = String(numeroStr).trim();
  
  // Captura processos no formato 0000.000000/0000-00 (com ou sem asterisco)
  const regexProc = /(\d{4}\.\d{6}\/\d{4}-\d{2}\*?)/g;
  const matches = raw.match(regexProc);
  if (matches && matches.length > 0) {
    if (matches.length === 1 && matches[0] === raw) {
      return '<span style="display:inline-block; white-space:nowrap; font-family:monospace; font-size:12px; color:#60a5fa; font-weight:700;">' + raw + '</span>';
    }
    return matches.map(proc => 
      '<div style="white-space:nowrap; font-family:monospace; font-size:11.5px; color:#60a5fa; font-weight:700; background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.25); border-radius:4px; padding:2px 6px; margin:2px 0; display:inline-block;">' + proc + '</div>'
    ).join('<br>');
  }
  
  // Se houver mais de um token separado por espaço/vírgula/ponto-e-vírgula
  const partes = raw.split(/[\s,;]+/).filter(Boolean);
  if (partes.length > 1) {
    return partes.map(p => {
      const d = p.replace(/\D/g, '');
      let fmt = p;
      if (d.length === 16) {
        fmt = d.replace(/^(\d{4})(\d{6})(\d{4})(\d{2})$/, '$1.$2/$3-$4') + (p.endsWith('*') ? '*' : '');
      }
      return '<div style="white-space:nowrap; font-family:monospace; font-size:11.5px; color:#60a5fa; font-weight:700; background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.25); border-radius:4px; padding:2px 6px; margin:2px 0; display:inline-block;">' + fmt + '</div>';
    }).join('<br>');
  }
  
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 16) {
    const fmt = digits.replace(/^(\d{4})(\d{6})(\d{4})(\d{2})$/, '$1.$2/$3-$4') + (raw.endsWith('*') ? '*' : '');
    return '<span style="display:inline-block; white-space:nowrap; font-family:monospace; font-size:12px; color:#60a5fa; font-weight:700;">' + fmt + '</span>';
  }
  
  return '<span style="display:inline-block; font-family:monospace; font-size:12px; color:#60a5fa; font-weight:700; word-break:break-word;">' + raw + '</span>';
}
if (typeof window !== 'undefined') window.formatarProcessosColuna = formatarProcessosColuna;

window.verificarInconsistenciasPlanilhaCMD = async function() {
  const output = document.getElementById('cmd-output-area');
  const btnAutorizar = document.getElementById('btn-cmd-autorizar');
  const btnCancelar = document.getElementById('btn-cmd-cancelar');
  const indStatus = document.getElementById('cmd-status-indicator');
  const progBox = document.getElementById('cmd-progress-container');

  if (progBox) progBox.style.display = 'none';
  if (indStatus) indStatus.textContent = 'STATUS: ESCANEANDO...';
  if (output) {
    output.innerHTML = '<div style="color:#00ff66;">> Iniciando varredura ortográfica e estrutural nas planilhas do sistema...</div><div style="color:#94a3b8;">> Verificando campos: Número, Status, Localização, Município, Objeto, Interessado, Categoria, Tipo, Prefixo e Agrupamento...</div>';
  }

  let pool = window.processosCache || (typeof state !== 'undefined' && state.processos) || [];
  if (!pool || pool.length === 0) {
    if (output) output.innerHTML = '<div style="color:#fbbf24;">> [AVISO] Cache de processos local vazio. Carregando dados do servidor...</div>';
    if (indStatus) indStatus.textContent = 'STATUS: CARREGANDO DADOS...';
    try {
      if (typeof inicializarDados === 'function') await inicializarDados();
      else if (typeof carregarProcessos === 'function') await carregarProcessos();
      pool = window.processosCache || (typeof state !== 'undefined' && state.processos) || [];
    } catch(e) {
      console.error(e);
    }
  }

  if (!pool || pool.length === 0) {
    if (output) output.innerHTML += '<div style="color:#f87171;">> [ERRO] Nenhum registro carregado da planilha. Verifique a conexão com o servidor.</div>';
    if (indStatus) indStatus.textContent = 'STATUS: ERRO CONEXAO';
    return;
  }

  const divergencias = [];

  // Campos a verificar estritamente ortográficos (NUNCA VALORES NEM DATAS)
  const camposTexto = [
    { key: 'numero', label: 'Número Processo' },
    { key: 'status', label: 'Status' },
    { key: 'localizacao', label: 'Localização' },
    { key: 'municipio', label: 'Município' },
    { key: 'objeto', label: 'Objeto' },
    { key: 'interessado', label: 'Interessado' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'prefixo', label: 'Prefixo' },
    { key: 'agrupamento', label: 'Agrupamento' }
  ];

  pool.forEach(p => {
    if (p.aba === 'PARAMETROS' || p.aba === 'parametro_combo') return;

    let updates = {};
    let diffs = [];

    camposTexto.forEach(({ key, label }) => {
      const valAtual = p[key];
      if (typeof valAtual === 'string' && valAtual.length > 0) {
        let valSugerido = normalizarTextoSeguro(valAtual);

        // Ajuste inteligente por campo
        if (key === 'status') {
          valSugerido = valSugerido.toUpperCase();
        } else if (key === 'prefixo') {
          valSugerido = valSugerido.toUpperCase();
        } else if (key === 'interessado' && typeof encontrarEscolaSemelhante === 'function') {
          const matchEscola = encontrarEscolaSemelhante(valSugerido);
          if (matchEscola && matchEscola !== valAtual) {
            valSugerido = matchEscola;
          }
        }

        if (valSugerido !== valAtual) {
          updates[key] = valSugerido;
          diffs.push({
            campo: label,
            key: key,
            anterior: valAtual,
            sugerido: valSugerido
          });
        }
      }
    });

    if (diffs.length > 0) {
      divergencias.push({
        id: p.id,
        rowNumber: p.rowNumber,
        aba: p.aba,
        numero: p.numero || p.id,
        registroOriginal: { ...p },
        updates: updates,
        diffs: diffs
      });
    }
  });

  _divergenciasDetectadasCMD = divergencias;

  if (divergencias.length === 0) {
    if (indStatus) indStatus.textContent = 'STATUS: 100% PADRONIZADO';
    if (output) {
      output.innerHTML += '<div style="color:#00ff66; margin-top:10px; font-weight:bold;">> [SUCESSO] Varredura Concluída! Todas as células analisadas estão 100% padronizadas. Nenhuma divergência detectada.</div>';
    }
    if (btnAutorizar) btnAutorizar.style.display = 'none';
    if (btnCancelar) btnCancelar.style.display = 'none';
    return;
  }

  if (indStatus) indStatus.textContent = `STATUS: ${divergencias.length} DIVERGÊNCIAS DETECTADAS`;

  let tableHtml = `
    <div style="margin-top:10px; color:#fbbf24; font-weight:bold; font-size:13px;">
      > [ATENÇÃO] Encontrados ${divergencias.length} registro(s) com divergências ortográficas / espaços extras / caixa.
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin:12px 0 8px; font-size:12px; color:#94a3b8; flex-wrap:wrap; gap:10px;">
      <span>Selecione as linhas que deseja autorizar para correção:</span>
      <label style="cursor:pointer; display:flex; align-items:center; gap:8px; color:#00ff66; font-weight:bold; background:rgba(0,255,102,0.1); padding:5px 12px; border-radius:6px; border:1px solid rgba(0,255,102,0.3);">
        <input type="checkbox" id="cmd-check-all" onchange="toggleAllCmdCheckboxes(this.checked)" checked style="cursor:pointer; transform:scale(1.2);">
        Selecionar Todos / Nenhum
      </label>
    </div>
    <div class="cmd-scrollable-table" style="max-height:550px; overflow-y:scroll; overflow-x:auto; border:1px solid rgba(0,255,102,0.3); border-radius:8px; background:rgba(0,0,0,0.7); box-shadow:inset 0 0 15px rgba(0,0,0,0.9);">
      <table style="width:100%; border-collapse:collapse; font-size:11.5px; text-align:left;">
        <thead>
          <tr style="position:sticky; top:0; z-index:10; border-bottom:2px solid rgba(0,255,102,0.4); background:#06140b; color:#00ff66;">
            <th style="padding:10px 12px; width:50px; text-align:center;">Sel.</th>
            <th style="padding:10px 14px; width:230px; min-width:210px;">Processo / ID</th>
            <th style="padding:10px 14px; width:140px; min-width:130px;">Campo</th>
            <th style="padding:10px 14px; min-width:240px;">Valor Atual</th>
            <th style="padding:10px 14px; min-width:240px; color:#34d399;">Sugestão Padronizada</th>
          </tr>
        </thead>
        <tbody>
  `;

  divergencias.forEach((d, idx) => {
    d.diffs.forEach((diff) => {
      tableHtml += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06); background:${idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
          <td style="padding:8px 12px; text-align:center;">
            <input type="checkbox" class="cmd-row-check" data-idx="${idx}" onchange="atualizarContadorSelecaoCMD()" checked style="cursor:pointer; transform:scale(1.15);">
          </td>
          <td style="padding:8px 12px; min-width:210px; max-width:260px; vertical-align:middle; word-break:break-word;">${formatarProcessosColuna(d.numero)}</td>
          <td style="padding:8px 14px; color:#fbbf24; font-weight:600;">${diff.campo}</td>
          <td style="padding:8px 14px; color:#f87171; text-decoration:line-through; word-break:break-word;">${diff.key === "numero" ? formatarProcessosColuna(diff.anterior) : diff.anterior}</td>
          <td style="padding:8px 14px; color:#00ff66; font-weight:bold; word-break:break-word;">${diff.key === "numero" ? formatarProcessosColuna(diff.sugerido) : diff.sugerido}</td>
        </tr>
      `;
    });
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
    <div style="margin-top:8px; font-size:11px; color:#64748b; text-align:right;">
      Mostrando todas as ${divergencias.length} divergências detectadas no sistema.
    </div>`;

  if (output) output.innerHTML = tableHtml;

  if (btnAutorizar) {
    btnAutorizar.style.display = 'inline-flex';
    document.getElementById('cmd-qtd-selecionados').textContent = divergencias.length;
  }
  if (btnCancelar) btnCancelar.style.display = 'inline-flex';
};

window.toggleAllCmdCheckboxes = function(check) {
  document.querySelectorAll('.cmd-row-check').forEach(cb => {
    cb.checked = check;
  });
  atualizarContadorSelecaoCMD();
};

window.atualizarContadorSelecaoCMD = function() {
  const checks = document.querySelectorAll('.cmd-row-check:checked');
  const countSpan = document.getElementById('cmd-qtd-selecionados');
  if (countSpan) countSpan.textContent = checks.length;

  const btnAutorizar = document.getElementById('btn-cmd-autorizar');
  if (btnAutorizar) {
    btnAutorizar.disabled = checks.length === 0;
    btnAutorizar.style.opacity = checks.length === 0 ? '0.5' : '1';
  }
};

window.cancelarPadronizacaoCMD = function() {
  _divergenciasDetectadasCMD = [];
  const output = document.getElementById('cmd-output-area');
  const btnAutorizar = document.getElementById('btn-cmd-autorizar');
  const btnCancelar = document.getElementById('btn-cmd-cancelar');
  const indStatus = document.getElementById('cmd-status-indicator');
  const progBox = document.getElementById('cmd-progress-container');

  if (progBox) progBox.style.display = 'none';
  if (btnAutorizar) btnAutorizar.style.display = 'none';
  if (btnCancelar) btnCancelar.style.display = 'none';
  if (indStatus) indStatus.textContent = 'STATUS: CANCELADO';
  if (output) {
    output.innerHTML = '<div style="color:#64748b;">> Operação cancelada pelo usuário. Nenhuma célula foi alterada.</div>';
  }
};

// =========================================================================
// CONTRA-NOTIFICAÇÃO & CONFIRMAÇÃO DE SEGURANÇA
// =========================================================================

window.confirmarContraNotificacaoPadronizacao = function() {
  const selectedIndices = new Set();
  document.querySelectorAll('.cmd-row-check:checked').forEach(cb => {
    const idx = parseInt(cb.getAttribute('data-idx'), 10);
    if (!isNaN(idx)) selectedIndices.add(idx);
  });

  if (selectedIndices.size === 0) {
    alert("Nenhuma linha selecionada. Marque ao menos um registro para autorizar a correção.");
    return;
  }

  const modal = document.getElementById('modal-contra-notificacao');
  const qtdEl = document.getElementById('modal-contra-qtd');
  const checkContra = document.getElementById('check-contra-notificacao');
  const btnExec = document.getElementById('btn-confirmar-contra-execucao');

  if (qtdEl) qtdEl.textContent = selectedIndices.size;
  if (checkContra) checkContra.checked = false;
  if (btnExec) {
    btnExec.style.opacity = '0.5';
    btnExec.style.pointerEvents = 'none';
  }
  if (modal) {
    modal.classList.add('open');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
  }
};

window.fecharContraNotificacao = function() {
  const modal = document.getElementById('modal-contra-notificacao');
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }
};

window.toggleBotaoContraExecucao = function(isChecked) {
  const btn = document.getElementById('btn-confirmar-contra-execucao');
  if (btn) {
    btn.style.opacity = isChecked ? '1' : '0.5';
    btn.style.pointerEvents = isChecked ? 'auto' : 'none';
  }
};

// =========================================================================
// EXECUÇÃO EM LOTE COM PROGRESSO DINÂMICO & BACKUP DE ESTORNO
// =========================================================================

window.executarPadronizacaoPlanilhaCMD = async function() {
  fecharContraNotificacao();

  const selectedIndices = new Set();
  document.querySelectorAll('.cmd-row-check:checked').forEach(cb => {
    const idx = parseInt(cb.getAttribute('data-idx'), 10);
    if (!isNaN(idx)) selectedIndices.add(idx);
  });

  const fila = _divergenciasDetectadasCMD.filter((_, i) => selectedIndices.has(i));
  const total = fila.length;
  if (total === 0) return;

  // 1. Criar ponto de restauração (BACKUP PARA ESTORNO)
  const backupSnapshot = {
    timestamp: new Date().toISOString(),
    dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
    registros: fila.map(item => ({
      id: item.id,
      numero: item.numero,
      valoresAnteriores: Object.keys(item.updates).reduce((acc, k) => {
        acc[k] = item.registroOriginal[k];
        return acc;
      }, {})
    }))
  };

  try {
    localStorage.setItem('padronizacao_backup', JSON.stringify(backupSnapshot));
    if (typeof atualizarBadgeBackupPadronizacao === 'function') {
      atualizarBadgeBackupPadronizacao();
    }
  } catch(e) {
    console.warn('Não foi possível salvar backup em localStorage:', e);
  }

  // 2. Exibir barra de progresso no terminal
  const progBox = document.getElementById('cmd-progress-container');
  const bar = document.getElementById('cmd-progress-bar');
  const pctText = document.getElementById('cmd-progress-pct');
  const msgText = document.getElementById('cmd-progress-msg');
  const sucText = document.getElementById('cmd-count-sucesso');
  const errText = document.getElementById('cmd-count-falhas');
  const totText = document.getElementById('cmd-count-total');
  const indStatus = document.getElementById('cmd-status-indicator');
  const output = document.getElementById('cmd-output-area');

  if (progBox) progBox.style.display = 'block';
  if (totText) totText.textContent = 'Total no lote: ' + total;
  if (indStatus) indStatus.textContent = 'STATUS: GRAVANDO NA PLANILHA...';

  const btnVarredura = document.getElementById('btn-cmd-varredura');
  const btnAutorizar = document.getElementById('btn-cmd-autorizar');
  const btnCancelar = document.getElementById('btn-cmd-cancelar');
  if (btnVarredura) btnVarredura.disabled = true;
  if (btnAutorizar) btnAutorizar.style.display = 'none';
  if (btnCancelar) btnCancelar.style.display = 'none';

  output.innerHTML = '<div style="color:#00ff66;">> [INÍCIO] Gravando correções ortográficas autorizadas...</div>';

  let sucesso = 0;
  let falhas = 0;
  const token = sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token');
  const base = typeof API_BASE !== 'undefined' ? API_BASE : 'https://seduc-backend.onrender.com';

  for (let i = 0; i < total; i++) {
    const item = fila[i];
    const curr = i + 1;
    const pct = Math.round((curr / total) * 100);

    if (bar) bar.style.width = pct + '%';
    if (pctText) pctText.textContent = pct + '%';
    if (msgText) msgText.textContent = `⚙️ Gravando registro ${curr} de ${total} (Nº ${item.numero})...`;

    try {
      const payloadOriginal = (window._dadosPlanilhaCache ? window._dadosPlanilhaCache.find(p => p.id === item.id) : null) || item.registroOriginal;
      const payloadFinal = { ...payloadOriginal, ...item.updates };

      const res = await fetch(base + '/api/registros/' + item.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payloadFinal)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      sucesso++;
      if (sucText) sucText.textContent = '✅ Sucesso: ' + sucesso;
      output.innerHTML += `<div style="color:#34d399; font-size:11px;">> [OK ${curr}/${total}] Processo ${item.numero}: Atualizado com sucesso.</div>`;
    } catch(err) {
      falhas++;
      if (errText) errText.textContent = '❌ Falhas: ' + falhas;
      output.innerHTML += `<div style="color:#f87171; font-size:11px;">> [FALHA ${curr}/${total}] Processo ${item.numero}: ${err.message}</div>`;
    }

    output.scrollTop = output.scrollHeight;
    await new Promise(r => setTimeout(r, 120));
  }

  if (indStatus) indStatus.textContent = `STATUS: CONCLUÍDO (${sucesso} SUCESSOS, ${falhas} FALHAS)`;
  if (msgText) msgText.textContent = '🎉 Padronização concluída com sucesso!';
  output.innerHTML += `<div style="color:#00ff66; font-weight:bold; margin-top:10px;">> [CONCLUÍDO] Lote finalizado! ${sucesso} registros corrigidos. Ponto de restauração disponível para estorno.</div>`;

  if (btnVarredura) btnVarredura.disabled = false;
  if (typeof recarregarDadosGlobais === 'function') {
    recarregarDadosGlobais();
  }
};

// =========================================================================
// ESTORNO DA ÚLTIMA ATUALIZAÇÃO (UNDO COM DATA E HORA)
// =========================================================================

window.estornarUltimaPadronizacao = async function() {
  const raw = localStorage.getItem('padronizacao_backup');
  if (!raw) {
    alert("Nenhum backup de padronização encontrado para estornar.");
    return;
  }

  let backup;
  try {
    backup = JSON.parse(raw);
  } catch(e) {
    alert("Erro ao ler dados do backup de estorno.");
    return;
  }

  if (!backup.registros || backup.registros.length === 0) {
    alert("O backup de padronização está vazio.");
    return;
  }

  const confirma = confirm(`⚠️ ATENÇÃO: Deseja realmente estornar (reverter) a última padronização realizada em ${backup.dataHora}?

Total de registros a restaurar: ${backup.registros.length}`);
  if (!confirma) return;

  const output = document.getElementById('cmd-output-area');
  const indStatus = document.getElementById('cmd-status-indicator');
  const progBox = document.getElementById('cmd-progress-container');
  const bar = document.getElementById('cmd-progress-bar');
  const pctText = document.getElementById('cmd-progress-pct');
  const msgText = document.getElementById('cmd-progress-msg');

  if (progBox) progBox.style.display = 'block';
  if (indStatus) indStatus.textContent = 'STATUS: EXECUTANDO ESTORNO...';
  if (output) {
    output.innerHTML = `<div style="color:#fbbf24; font-weight:bold;">> [ESTORNO] Iniciando reversão dos valores para o estado de ${backup.dataHora}...</div>`;
  }

  const token = sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token');
  const base = typeof API_BASE !== 'undefined' ? API_BASE : 'https://seduc-backend.onrender.com';

  const total = backup.registros.length;
  let sucesso = 0;
  let falhas = 0;

  for (let i = 0; i < total; i++) {
    const item = backup.registros[i];
    const curr = i + 1;
    const pct = Math.round((curr / total) * 100);

    if (bar) bar.style.width = pct + '%';
    if (pctText) pctText.textContent = pct + '%';
    if (msgText) msgText.textContent = `↺ Restaurando registro ${curr} de ${total}...`;

    try {
      const res = await fetch(base + '/api/registros/' + item.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(item.valoresAnteriores)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      sucesso++;
      if (output) output.innerHTML += `<div style="color:#34d399; font-size:11px;">> [RESTORE OK] Processo ${item.numero}: Valores restaurados com sucesso.</div>`;
    } catch(err) {
      falhas++;
      if (output) output.innerHTML += `<div style="color:#f87171; font-size:11px;">> [RESTORE FALHA] Processo ${item.numero}: ${err.message}</div>`;
    }

    if (output) output.scrollTop = output.scrollHeight;
    await new Promise(r => setTimeout(r, 120));
  }

  if (indStatus) indStatus.textContent = `STATUS: ESTORNO CONCLUÍDO (${sucesso}/${total})`;
  if (output) {
    output.innerHTML += `<div style="color:#00ff66; font-weight:bold; margin-top:10px;">> [ESTORNO FINALIZADO] ${sucesso} registros revertidos com sucesso para a versão de ${backup.dataHora}.</div>`;
  }

  if (typeof recarregarDadosGlobais === 'function') {
    recarregarDadosGlobais();
  }
};


// ====== TELA FINANCEIRA ======
window.carregarFinanceiro = function() {
  const form = document.getElementById('form-financeiro');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const firstInput = form.querySelector('input, select');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }
  if (typeof window.carregarOrcamentoData === 'function') {
    window.carregarOrcamentoData();
  }
};



// =========================================================================
// MÓDULO DE COMPARTILHAMENTO INTELIGENTE (WHATSAPP / PADRÃO / ADM 2 DETALHADO)
// =========================================================================

/**
 * Formata data/hora para nomenclatura oficial: AAAAMMDDHHMMSS
 */
function getFormattedTimestampCompacto() {
  const agora = new Date();
  const aaaa = agora.getFullYear();
  const mm = String(agora.getMonth() + 1).padStart(2, '0');
  const dd = String(agora.getDate()).padStart(2, '0');
  const hh = String(agora.getHours()).padStart(2, '0');
  const min = String(agora.getMinutes()).padStart(2, '0');
  const ss = String(agora.getSeconds()).padStart(2, '0');
  return `${aaaa}${mm}${dd}${hh}${min}${ss}`;
}

/**
 * Renderiza o Relatório Padrão Oficial em um Canvas e retorna { canvas, imgUrl, dynamicHeight, canvasWidth }
 */
window.renderizarCanvasRelatorioPadrao = function(lista, isSelecao) {
  const totalQtd = lista.length;
  let totalValor = 0;
  lista.forEach(p => {
    let v = p.valor || p.valorOficial || p.valorOf || 0;
    if (typeof v === 'string') {
      v = parseFloat(v.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
    }
    totalValor += Number(v) || 0;
  });

  const totalFmt = totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const horaHoje = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dataHoraFull = dataHoje + ', ' + new Date().toLocaleTimeString('pt-BR');

  const cols = [
    { label: 'Nº', width: 36, align: 'center' },
    { label: 'PREFIXO', width: 86, align: 'left' },
    { label: 'MUNICÍPIO', width: 130, align: 'left' },
    { label: 'PROCESSO SEI', width: 144, align: 'left' },
    { label: 'INTERESSADO', width: 174, align: 'left' },
    { label: 'OBJETO / FINALIDADE', width: 260, align: 'left' },
    { label: 'STATUS', width: 105, align: 'left' },
    { label: 'LOCAL', width: 85, align: 'left' },
    { label: 'DATA', width: 75, align: 'center' },
    { label: 'VALOR R$', width: 105, align: 'right' }
  ];

  const rowHeight = 44;
  const headerHeight = 94;
  const colHeaderHeight = 32;
  const totalRowHeight = 32;
  const footerHeight = 65;
  const maxRowsToDraw = Math.min(lista.length, 50);
  const canvasWidth = 1280;
  const tableWidth = 1200;
  const startX = 40;
  const dynamicHeight = Math.max(380, headerHeight + colHeaderHeight + (maxRowsToDraw * rowHeight) + totalRowHeight + footerHeight);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = dynamicHeight;
  const ctx = canvas.getContext('2d');

  // 1. Fundo branco do papel oficial
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, dynamicHeight);

  // 2. Borda externa suave igual ao layout oficial
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 14, canvasWidth - 40, dynamicHeight - 28);

  // 3. Cabeçalho Institucional Oficial
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GOVERNO DO ESTADO DE RONDÔNIA', startX, 38);

  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('SEDUC - SECRETARIA DE ESTADO DA EDUCAÇÃO', startX, 54);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px Arial, sans-serif';
  ctx.fillText('CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS', startX, 69);

  // Box Título
  const tituloBox = isSelecao ? 'LISTA DE PROCESSOS SELECIONADOS' : 'LISTA DE PROCESSOS';
  ctx.font = 'bold 11px Arial, sans-serif';
  const titWidth = ctx.measureText(tituloBox).width + 24;
  const titX = startX + tableWidth - titWidth;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(titX, 30, titWidth, 28);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(titX, 30, titWidth, 28);
  ctx.fillStyle = '#0284c7';
  ctx.textAlign = 'center';
  ctx.fillText(tituloBox, titX + (titWidth / 2), 48);

  // Linha divisória
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, 82);
  ctx.lineTo(startX + tableWidth, 82);
  ctx.stroke();

  // 4. Cabeçalho das Colunas
  let headerY = headerHeight;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(startX, headerY, tableWidth, colHeaderHeight);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, headerY, tableWidth, colHeaderHeight);

  let curX = startX;
  cols.forEach(c => {
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(curX, headerY, c.width, colHeaderHeight);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = c.align;
    let tx = curX + (c.width / 2);
    if (c.align === 'left') tx = curX + 6;
    if (c.align === 'right') tx = curX + c.width - 6;
    ctx.fillText(c.label, tx, headerY + 20);

    curX += c.width;
  });

  // 5. Linhas da Tabela
  let y = headerY + colHeaderHeight;
  lista.slice(0, maxRowsToDraw).forEach((p, idx) => {
    ctx.fillStyle = (idx % 2 === 1) ? '#f8fafc' : '#ffffff';
    ctx.fillRect(startX, y, tableWidth, rowHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(startX, y, tableWidth, rowHeight);

    let cellX = startX;
    cols.forEach(c => {
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(cellX, y, c.width, rowHeight);

      let textX = cellX + (c.width / 2);
      if (c.align === 'left') textX = cellX + 6;
      if (c.align === 'right') textX = cellX + c.width - 6;
      ctx.textAlign = c.align;

      if (c.label === 'Nº') {
        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(String(idx + 1), textX, y + 26);
      } else if (c.label === 'PREFIXO') {
        ctx.font = 'bold 9.5px Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText((p.prefixo || '-').substring(0, 14), textX, y + 17);

        ctx.font = '8px Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        const subPref = ((p.categoria || '-') + ' ' + (p.tipo || '-')).trim().substring(0, 8);
        ctx.fillText(subPref, textX, y + 31);

        const circX = textX + 46;
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = p.CAM === '1' ? '#0f172a' : '#cbd5e1';
        ctx.fillText('●', circX, y + 31);
        ctx.fillStyle = p.GAB === '1' ? '#0f172a' : '#cbd5e1';
        ctx.fillText('●', circX + 9, y + 31);
        ctx.fillStyle = p.CC === '1' ? '#0f172a' : '#cbd5e1';
        ctx.fillText('●', circX + 18, y + 31);
      } else if (c.label === 'MUNICÍPIO') {
        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
        let val = (p.municipio || '-').trim();
        if (val.length > 18) {
          ctx.fillText(val.substring(0, 16), textX, y + 17);
          ctx.fillText(val.substring(16, 32), textX, y + 31);
        } else {
          ctx.fillText(val, textX, y + 26);
        }
      } else if (c.label === 'PROCESSO SEI') {
        ctx.font = '9.5px Arial, sans-serif';
        ctx.fillStyle = '#0284c7';
        let val = (p.numero || p.processo || '-').trim();
        if (val.length > 16) {
          ctx.fillText(val.substring(0, 15), textX, y + 17);
          ctx.fillText(val.substring(15, 30), textX, y + 31);
        } else {
          ctx.fillText(val, textX, y + 26);
        }
      } else if (c.label === 'INTERESSADO') {
        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
        let val = (p.interessado || '-').trim();
        if (val.includes(' - ')) {
          const parts = val.split(' - ');
          ctx.fillText(parts[0].substring(0, 26), textX, y + 17);
          ctx.fillText(('- ' + parts.slice(1).join(' - ')).substring(0, 26), textX, y + 31);
        } else if (val.includes(' | ')) {
          const parts = val.split(' | ');
          ctx.fillText(parts[0].substring(0, 26), textX, y + 17);
          ctx.fillText(('| ' + parts.slice(1).join(' | ')).substring(0, 26), textX, y + 31);
        } else if (val.length > 24) {
          ctx.fillText(val.substring(0, 24), textX, y + 17);
          ctx.fillText(val.substring(24, 48), textX, y + 31);
        } else {
          ctx.fillText(val, textX, y + 26);
        }
      } else if (c.label === 'OBJETO / FINALIDADE') {
        ctx.font = '9.5px Arial, sans-serif';
        ctx.fillStyle = '#1e293b';
        let val = (p.objeto || '-').trim();
        if (val.length > 36) {
          const mid = val.lastIndexOf(' ', 35);
          const splitIdx = mid > 15 ? mid : 35;
          ctx.fillText(val.substring(0, splitIdx).trim(), textX, y + 17);
          ctx.fillText(val.substring(splitIdx).trim().substring(0, 36), textX, y + 31);
        } else {
          ctx.fillText(val, textX, y + 26);
        }
      } else if (c.label === 'STATUS') {
        ctx.font = 'bold 9.5px Arial, sans-serif';
        let val = (p.status || '-').trim().toUpperCase();
        if (val.includes('AUTORIZADO') || val.includes('PAGO') || val.includes('CONCLU')) {
          ctx.fillStyle = '#047857';
        } else if (val.includes('NOTIFICADO') || val.includes('AGUARD') || val.includes('PEND')) {
          ctx.fillStyle = '#c2410c';
        } else if (val.includes('DUPLICADO') || val.includes('CANCEL')) {
          ctx.fillStyle = '#b91c1c';
        } else {
          ctx.fillStyle = '#475569';
        }

        if (val.startsWith('N/') || val.startsWith('N/ ')) {
          ctx.fillText('N/', textX, y + 17);
          ctx.fillText(val.substring(2).trim().substring(0, 12), textX, y + 31);
        } else if (val.startsWith('P/') || val.startsWith('P/ ')) {
          ctx.fillText('P/', textX, y + 17);
          ctx.fillText(val.substring(2).trim().substring(0, 12), textX, y + 31);
        } else if (val.length > 13) {
          ctx.fillText(val.substring(0, 12), textX, y + 17);
          ctx.fillText(val.substring(12, 24), textX, y + 31);
        } else {
          ctx.fillText(val, textX, y + 26);
        }
      } else if (c.label === 'LOCAL') {
        ctx.font = '9.5px Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
        let val = (p.local || p.localizacao || '-').trim();
        if (val.includes('|')) {
          const parts = val.split('|');
          ctx.fillText(parts[0].trim().substring(0, 13), textX, y + 17);
          ctx.fillText(('| ' + parts.slice(1).join('|').trim()).substring(0, 13), textX, y + 31);
        } else if (val.length > 12) {
          ctx.fillText(val.substring(0, 11), textX, y + 17);
          ctx.fillText(val.substring(11, 23), textX, y + 31);
        } else {
          ctx.fillText(val, textX, y + 26);
        }
      } else if (c.label === 'DATA') {
        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#334155';
        let val = p.data ? formatDate(p.data) : '-';
        ctx.fillText(val, textX, y + 26);
      } else if (c.label === 'VALOR R$') {
        ctx.font = 'bold 10.5px Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
        let v = p.valor || p.valorOficial || p.valorOf || 0;
        if (typeof v === 'string') v = parseFloat(v.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
        let val = Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        ctx.fillText(val, textX, y + 26);
      }

      cellX += c.width;
    });

    y += rowHeight;
  });

  // 6. Linha de TOTAL GERAL
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(startX, y, tableWidth, totalRowHeight);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, y, tableWidth, totalRowHeight);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('TOTAL GERAL (' + totalQtd + ' processos):', startX + tableWidth - 115, y + 20);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(totalFmt.replace('R$', '').trim(), startX + tableWidth - 8, y + 20);

  // 7. Rodapé Oficial
  const footerY = y + totalRowHeight + 22;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, footerY);
  ctx.lineTo(startX + tableWidth, footerY);
  ctx.stroke();

  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'left';
  ctx.fillText('GDSM - GERÊNCIA DE DIAGNÓSTICO SITUACIONAL DOS MUNICÍPIOS', startX, footerY + 18);

  ctx.textAlign = 'center';
  ctx.fillText('Página 1 de 1', startX + (tableWidth / 2), footerY + 18);

  ctx.textAlign = 'right';
  ctx.fillText('Documento gerado eletronicamente em ' + dataHoraFull, startX + tableWidth, footerY + 18);

  const imgUrl = canvas.toDataURL('image/png');
  return { canvas, imgUrl, dynamicHeight, canvasWidth };
};

/**
 * Renderiza o Relatório ADM 2 (Agrupado por Dígito c/ Memorando) via HTML e html2canvas
 * e retorna { canvas, imgUrl, dynamicHeight, canvasWidth }
 */
window.renderizarCanvasRelatorioAdm2 = async function(lista) {
  // Agrupamento por Dígito
  const grupos = {};
  lista.forEach(p => {
    const dRaw = typeof window.limparDigitoValor === 'function' 
      ? window.limparDigitoValor(p.digito || p.DIGITO || '') 
      : String(p.digito || p.DIGITO || '').trim();
    const chave = dRaw || 'SEM DÍGITO';
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(p);
  });

  const chavesOrdenadas = Object.keys(grupos).sort((a, b) => {
    if (a === 'SEM DÍGITO') return 1;
    if (b === 'SEM DÍGITO') return -1;
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  let globalIndex = 0;
  let rowsHtml = '';

  chavesOrdenadas.forEach(chave => {
    const procs = grupos[chave];
    const totalGrupo = procs.reduce((acc, p) => acc + (p.valorOf || 0), 0);

    rowsHtml += `
      <tr style="background-color: #008080 !important; color: #ffffff !important;">
        <td colspan="10" style="border: 1px solid #005f5f; background-color: #008080 !important; color: #ffffff !important; padding: 5px 8px; font-size: 10px; font-weight: normal; text-transform: uppercase;">
          <span style="color: #ffffff !important; font-weight: normal; letter-spacing: 0.5px;">${chave}</span>
          <span style="margin-left: 12px; font-weight: normal; font-size: 9px; color: #ffffff !important;">(${procs.length} PROCESSOS &bull; R$ ${formatNumberOnly(totalGrupo)})</span>
        </td>
      </tr>
    `;

    procs.forEach(p => {
      globalIndex++;
      const prefixoFormatado = `
        <div style="font-family: Arial, sans-serif; line-height: 1.2;">
          <div style="font-size: 7px; font-weight: normal; margin-bottom: 2px; color: #0f172a;">${p.prefixo || '-'}</div>
          <div style="display: flex; align-items: center; white-space: nowrap; gap: 2px; font-size: 8px;">
            <span style="font-weight:normal;">${p.categoria || '-'}</span><span style="color:#94a3b8;">|</span><span style="font-weight:normal;">${p.tipo || '-'}</span><span style="color:#94a3b8;">|</span>
            <div style="display: flex; font-size: 14px; line-height: 1; color: #0f172a; align-items: center; margin-left: 1px;">
              <span title="CAM">${p.CAM === '1' ? '&#9679;' : '&#9675;'}</span>
              <span title="GABINETE" style="margin-left: -2px;">${p.GAB === '1' ? '&#9679;' : '&#9675;'}</span>
              <span title="CASA CIVIL" style="margin-left: -2px;">${p.CC === '1' ? '&#9679;' : '&#9675;'}</span>
            </div>
          </div>
        </div>
      `;
      const zebraBg = globalIndex % 2 === 1 ? 'background-color:#f8fafc;' : 'background-color:#ffffff;';

      rowsHtml += `
        <tr style="${zebraBg}">
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-align:center; font-size:9.5px; font-weight:normal; color:#475569; width:3%;">${globalIndex}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:7%;">${prefixoFormatado}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:11%;">${p.municipio || '-'}</td>
          <td class="col-numero" style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; white-space:normal; word-wrap:break-word; width:12%;">${(p.numero || '-').replace(/\s+/g, '<br>')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:14%;">${p.interessado || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; white-space:normal; word-wrap:break-word; width:19%;">${p.objeto || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-transform: uppercase; font-size:9.5px; font-weight:normal; width:8%;">${p.status || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; font-size:9.5px; font-weight:normal; width:7%;">${p.localizacao || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 2px; text-align:center; font-size:9.5px; font-weight:normal; width:7%;">${formatDate(p.data)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 3px 4px; text-align:right; font-size:9.5px; font-weight:normal; width:12%; white-space:nowrap;">${formatNumberOnly(p.valorOf)}</td>
        </tr>
      `;

      const partesMemo = [];
      if (p.agrupamento && String(p.agrupamento).trim()) partesMemo.push(String(p.agrupamento).trim());
      if (p.anotacao && String(p.anotacao).trim()) partesMemo.push(String(p.anotacao).trim());

      if (partesMemo.length > 0) {
        const memoTexto = partesMemo.join(' - ');
        rowsHtml += `
          <tr style="background-color: #fff9f9;">
            <td colspan="10" style="border: 1px solid #cbd5e1; border-top: none; padding: 2px 8px 3px 12px; font-size: 8.5px; font-style: italic; color: #dc2626; line-height: 1.3;">
              ${memoTexto}
            </td>
          </tr>
        `;
      }
    });
  });

  const totalValor = lista.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  const totalRow = `
    <tr style="background:#f1f5f9; border-top:2px solid #0f172a; border-bottom:2px solid #0f172a;">
      <td colspan="9" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align:right; font-size:11.5px; color:#0f172a; text-transform:uppercase; font-weight:bold; white-space:nowrap;">TOTAL GERAL (${lista.length} processos):</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align:right; font-size:12.5px; color:#0f172a; font-weight:bold; white-space:nowrap !important;">${formatNumberOnly(totalValor)}</td>
    </tr>`;
  rowsHtml += totalRow;

  const html = `
    <div style="width:1200px; padding:20px; background:#fff; font-family:Arial,sans-serif;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #0f172a; padding-bottom:6px; margin-bottom:14px; width:100%;">
        <div style="text-align:left;">
          <div style="font-size:14px; font-weight:800; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px; line-height:1.2;">LISTA DE PROCESSO | GRUPO</div>
        </div>
        <div style="text-align:right; font-size:11px; color:#334155; font-family:Arial,sans-serif;">
          <span>Total: <b>${lista.length} processos</b></span> &nbsp;|&nbsp; <span>Valor Total: <b>R$ ${formatNumberOnly(totalValor)}</b></span>
        </div>
      </div>
      <table style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word;">
        <colgroup>
          <col style="width: 3%;"><col style="width: 7%;"><col style="width: 11%;"><col style="width: 12%;"><col style="width: 14%;">
          <col style="width: 19%;"><col style="width: 8%;"><col style="width: 7%;"><col style="width: 7%;"><col style="width: 12%;">
        </colgroup>
        <thead>
          <tr style="background-color:#0f172a; color:#ffffff;">
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:center; font-size:9.5px; font-weight:bold; color:#ffffff;">Nº</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:left; font-size:9.5px; font-weight:bold; color:#ffffff;">PREFIXO</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:left; font-size:9.5px; font-weight:bold; color:#ffffff;">MUNICÍPIO</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:left; font-size:9.5px; font-weight:bold; color:#ffffff;">PROCESSO SEI</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:left; font-size:9.5px; font-weight:bold; color:#ffffff;">INTERESSADO</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:left; font-size:9.5px; font-weight:bold; color:#ffffff;">OBJETO / FINALIDADE</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:left; font-size:9.5px; font-weight:bold; color:#ffffff;">STATUS</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:left; font-size:9.5px; font-weight:bold; color:#ffffff;">LOCAL</th>
            <th style="border: 1px solid #1e293b; padding: 6px 2px; text-align:center; font-size:9.5px; font-weight:bold; color:#ffffff;">DATA</th>
            <th style="border: 1px solid #1e293b; padding: 6px 4px; text-align:right; font-size:9.5px; font-weight:bold; color:#ffffff;">VALOR R$</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div style="border-top:1px solid #cbd5e1; padding-top:6px; margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:8px; color:#64748b;">
        <div>LEGENDA: C = Convênio | F = Fomento | OB = Obras | MP = Material Permanente | MC = Material Consumo</div>
        <div>AUTORIZAÇÕES: (1º CAM | 2º GAB SEDUC | 3º CASA CIVIL) &bull; Autorizado | ○ Pendente</div>
      </div>
    </div>
  `;

  if (typeof html2canvas !== 'function') {
    throw new Error('Biblioteca html2canvas não encontrada.');
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container.firstElementChild, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    const imgUrl = canvas.toDataURL('image/png');
    return { canvas, imgUrl, dynamicHeight: canvas.height, canvasWidth: canvas.width };
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * Função Principal de Compartilhamento via Modal WhatsApp com pré-renderização em background e troca instantânea
 */
window.compartilharWhatsAppRelatorio = function(somenteSelecionados = false) {
  // Animação de Ampulheta no botão Compartilhar (Imagem 2 / Imagem 5)
  const btnComp = document.getElementById('btn-compartilhar-topo');
  let btnCompOriginalHtml = '';
  if (btnComp) {
    btnCompOriginalHtml = btnComp.innerHTML;
    btnComp.innerHTML = '<span class="anim-ampulheta" style="font-size:14px; margin-right:4px;">⏳</span> <span class="btn-text">Compartilhar</span>';
    btnComp.style.opacity = '0.85';
    btnComp.style.pointerEvents = 'none';
  }
  const restaurarBtnComp = () => {
    if (btnComp && btnCompOriginalHtml) {
      btnComp.innerHTML = btnCompOriginalHtml;
      btnComp.style.opacity = '1';
      btnComp.style.pointerEvents = 'auto';
    }
  };

  let lista = [];
  const checks = Array.from(document.querySelectorAll('.check-processo:checked')).map(cb => cb.value);
  const temSelecionados = checks.length > 0;

  if (somenteSelecionados || temSelecionados) {
    const base = (typeof getFiltrados === 'function') ? getFiltrados() : (state.processos || []);
    lista = base.filter(p => checks.includes(p.id));
    if (lista.length === 0 && temSelecionados) {
      lista = (typeof carregarProcessos === 'function' ? carregarProcessos() : []).filter(p => checks.includes(p.id));
    }
  }

  if (!lista || lista.length === 0) {
    lista = (typeof getFiltrados === 'function') ? getFiltrados() : (state.processos || []);
  }

  if (!lista || lista.length === 0) {
    alert('Nenhum processo selecionado ou disponível para compartilhamento.');
    return;
  }

  const isSelecao = checks.length > 0 && lista.length === checks.length;
  const totalQtd = lista.length;

  let totalValor = 0;
  lista.forEach(p => {
    let v = p.valor || p.valorOficial || p.valorOf || 0;
    if (typeof v === 'string') {
      v = parseFloat(v.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
    }
    totalValor += Number(v) || 0;
  });
  const totalFmt = totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const horaHoje = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Distribuição por Status
  const porStatus = {};
  lista.forEach(p => {
    const s = (p.status || 'OUTROS').trim().toUpperCase();
    porStatus[s] = (porStatus[s] || 0) + 1;
  });
  const statusStr = Object.entries(porStatus)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([st, qtd]) => ' • ' + st + ': ' + qtd)
    .join('\n');

  // Agrupamento por PREFIXO
  const porPrefixo = {};
  lista.forEach(p => {
    const pref = (p.prefixo || 'SEM PREFIXO').trim();
    if (!porPrefixo[pref]) porPrefixo[pref] = [];
    porPrefixo[pref].push(p);
  });

  let textoGrupos = '';
  Object.keys(porPrefixo).sort().forEach(pref => {
    textoGrupos += '*' + pref + '*\n';
    porPrefixo[pref].forEach((p, idx) => {
      const mun = p.municipio || '-';
      const escola = p.interessado || '-';
      const processoSei = p.numero || p.processo || '-';
      let v = p.valor || p.valorOficial || p.valorOf || 0;
      if (typeof v === 'string') v = parseFloat(v.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
      const valorFmt = Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      textoGrupos += (idx + 1) + ' - ' + mun + ' | ' + escola + ' | ' + processoSei + ' | ' + valorFmt + '\n';
    });
    textoGrupos += '\n';
  });

  const tituloMsg = isSelecao ? '📋 *SEDUC/RO — CAM: PROCESSOS SELECIONADOS*' : '📊 *SEDUC/RO — CAM: RELATÓRIO EXECUTIVO*';
  const textoWhatsApp = 
`${tituloMsg}
📅 *Data:* ${dataHoje} às ${horaHoje}
📂 *Processos:* ${totalQtd} selecionado(s)
💰 *Valor Total:* ${totalFmt}

📌 *Status:*
${statusStr}

${textoGrupos.trim()}`;

  // Estado atual do layout no modal (inicialmente sem layout selecionado)
  let currentLayout = null;
  let activeCanvas = null;
  let activeImgUrl = '';
  let activeHeight = 0;
  let activeWidth = 1280;

  // Cache das imagens pré-geradas em background
  let cachePadrao = null;
  let cacheDetalhado = null;
  let isGerandoDetalhado = true;

  // Pré-gera imediatamente o layout Padrão em background
  try {
    cachePadrao = window.renderizarCanvasRelatorioPadrao(lista, isSelecao);
  } catch (err) {
    console.error('Erro ao pré-gerar relatório padrão:', err);
  }

  // Pré-gera em background o layout Detalhado para ficar pronto imediatamente
  window.renderizarCanvasRelatorioAdm2(lista).then(res => {
    cacheDetalhado = res;
    isGerandoDetalhado = false;
    // Se o usuário já tiver clicado enquanto gerava, atualiza a tela
    if (currentLayout === 'detalhado' && !activeImgUrl) {
      aplicarLayoutDetalhado(res);
    }
  }).catch(err => {
    console.warn('Erro ao pré-gerar relatório detalhado em background:', err);
    isGerandoDetalhado = false;
  });

  // Modal Container
  let modalOverlay = document.getElementById('modal-whatsapp-relatorio');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'modal-whatsapp-relatorio';
    modalOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:999999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <style>
      .btn-modal-action {
        color: #fff;
        border: 2px solid transparent;
        padding: 11px 14px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.15s ease-in-out;
        user-select: none;
      }
      .btn-modal-action:hover, .btn-modal-action:focus {
        font-weight: 900 !important;
        filter: brightness(1.15);
        transform: translateY(-1px);
        outline: none;
      }
      .btn-modal-action:active {
        background: transparent !important;
        box-shadow: none !important;
        transform: scale(0.97);
      }
      .btn-modal-action.disabled-action {
        opacity: 0.35 !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
        filter: grayscale(0.8) !important;
      }

      /* No clique (:active), fundo sem cor e borda/texto destacados */
      #btn-env-whatsapp:active { border-color: #25D366 !important; color: #25D366 !important; }
      #btn-copiar-imagem:active { border-color: #0284c7 !important; color: #38bdf8 !important; }
      #btn-copiar-texto:active { border-color: #94a3b8 !important; color: #f1f5f9 !important; }
      #btn-baixar-imagem:active { border-color: #0d9488 !important; color: #2dd4bf !important; }
      #btn-baixar-pdf-rapido:active { border-color: #dc2626 !important; color: #f87171 !important; }
      #btn-gere-padrao:active { border-color: #0284c7 !important; color: #38bdf8 !important; }
      #btn-gere-detalhado:active { border-color: #0d9488 !important; color: #2dd4bf !important; }

      @keyframes girarAmpulhetaModal {
        0% { transform: rotate(0deg); }
        50% { transform: rotate(180deg); }
        100% { transform: rotate(360deg); }
      }
      .anim-ampulheta-modal {
        animation: girarAmpulhetaModal 2.5s infinite ease-in-out;
      }
    </style>

    <div class="modal-whatsapp-share" style="background:#0f172a; border:1px solid #334155; border-radius:14px; box-shadow:0 25px 50px rgba(0,0,0,0.7); max-width:1080px; width:95%; max-height:94vh; overflow-y:auto; padding:22px; color:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #334155; padding-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="background:#0284c7; width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#38bdf8;">Compartilhar</h3>
            <span id="modal-subtitulo-layout" style="display:none; font-size:11px; color:#94a3b8; font-weight:600;"></span>
          </div>
        </div>
        <button onclick="document.getElementById('modal-whatsapp-relatorio').style.display='none'" style="background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer; padding:4px 8px;">&times;</button>
      </div>

      <!-- Preview Dinâmico da Imagem Centralizado -->
      <div style="margin-bottom:16px; background:#020617; padding:16px; border-radius:8px; border:1px solid #1e293b; min-height:240px; max-height:60vh; overflow:auto; position:relative; display:flex; align-items:center; justify-content:center; text-align:center;">
        
        <!-- Indicador de Processamento com Ampulheta -->
        <div id="loading-preview-msg" style="display:none; position:absolute; inset:0; background:rgba(2,6,23,0.9); align-items:center; justify-content:center; flex-direction:column; gap:12px; z-index:15; border-radius:8px;">
          <img src="data:image/png;base64,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" class="anim-ampulheta-modal" style="width:52px; height:52px;" alt="Processando...">
          <span style="color:#f59e0b; font-weight:700; font-size:14px; letter-spacing:0.5px;">Gerando relatório...</span>
        </div>

        <!-- Placeholder Inicial Centralizado -->
        <div id="placeholder-tela-imagem" style="display:flex; flex-direction:column; align-items:center; justify-content:center; margin:auto; text-align:center; padding:30px 20px; color:#94a3b8; gap:12px;">
          <div style="font-size:42px; opacity:0.85;">🖼️</div>
          <div style="font-size:16px; font-weight:700; color:#f1f5f9; letter-spacing:0.5px;">GERE UMA IMAGEM - PADRÃO / DETALHADO</div>
          <div style="font-size:12px; color:#64748b; max-width:440px; line-height:1.5;">Clique em <b>Gere padrão</b> ou <b>Gere detalhado</b> abaixo para visualizar, copiar e baixar o relatório oficial.</div>
        </div>

        <!-- Imagem do Preview (sem textos quebrados) -->
        <img id="img-preview-relatorio" src="" style="display:none; max-width:100%; height:auto; margin:0 auto; border-radius:4px; box-shadow:0 8px 24px rgba(0,0,0,0.6); cursor:zoom-in;" title="Clique para abrir imagem em tamanho original" onclick="if(this.src) window.open(this.src, '_blank')" alt="">
      </div>

      <!-- Linha 1 de Botões de Ação (Capitalizados) -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(165px, 1fr)); gap:10px; margin-bottom:12px;">
        
        <!-- 1. Enviar (WhatsApp) -->
        <button id="btn-env-whatsapp" class="btn-modal-action disabled-action" style="background:linear-gradient(135deg, #25D366 0%, #128C7E 100%); box-shadow:0 4px 12px rgba(37,211,102,0.25);" title="Enviar pelo WhatsApp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.076-2.146-.523-1.611-.666-2.651-2.298-2.733-2.406-.083-.109-.652-.868-.652-1.652 0-.785.411-1.17.559-1.328.147-.158.322-.198.43-.198.107 0 .214.002.308.007.098.005.231-.038.361.275.134.322.457 1.115.498 1.197.04.082.067.177.013.286-.055.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.333.094.162.417.688.894 1.114.614.548 1.132.718 1.293.799.162.081.256.068.351-.041.095-.108.405-.472.513-.634.108-.162.216-.135.364-.081.148.054.945.446 1.107.527.162.081.27.121.31.189.04.068.04.392-.104.797z"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.396A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.16 8.16 0 0 1-4.38-1.267l-.314-.187-2.953.826.837-2.88-.205-.326A8.16 8.16 0 0 1 3.8 12c0-4.529 3.671-8.2 8.2-8.2s8.2 3.671 8.2 8.2-3.671 8.2-8.2 8.2z"/>
          </svg>
          <span>Enviar</span>
        </button>

        <!-- 2. Copiar Imagem -->
        <button id="btn-copiar-imagem" class="btn-modal-action disabled-action" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); box-shadow:0 4px 12px rgba(2,132,199,0.25);" title="Copiar Imagem diretamente para colar (Ctrl+V) no WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copiar imagem</span>
        </button>

        <!-- 3. Copiar Para Texto - NASCE ATIVADO -->
        <button id="btn-copiar-texto" class="btn-modal-action" style="background:linear-gradient(135deg, #475569 0%, #334155 100%); box-shadow:0 4px 12px rgba(71,85,105,0.25);" title="Copiar Texto estruturado por Prefixo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <line x1="8" y1="11" x2="16" y2="11"></line>
            <line x1="8" y1="15" x2="13" y2="15"></line>
          </svg>
          <span>Copiar para texto</span>
        </button>

        <!-- 4. Baixar (PNG) -->
        <button id="btn-baixar-imagem" class="btn-modal-action disabled-action" style="background:linear-gradient(135deg, #0d9488 0%, #0f766e 100%); box-shadow:0 4px 12px rgba(13,148,136,0.25);" title="Baixar Imagem PNG da visualização ativa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
            <path d="M12 12v5m2.5-2.5L12 17l-2.5-2.5"></path>
          </svg>
          <span>Baixar (PNG)</span>
        </button>

        <!-- 5. Baixar (PDF) -->
        <button id="btn-baixar-pdf-rapido" class="btn-modal-action disabled-action" style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%); box-shadow:0 4px 12px rgba(220,38,38,0.25);" title="Baixar Relatório em PDF da visualização ativa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15h6M12 12v6" stroke-width="2.2"></path>
          </svg>
          <span>Baixar (PDF)</span>
        </button>
      </div>

      <!-- Linha 2 de Botões: DEFINIÇÃO / GERAÇÃO COM ÍCONES DE IMAGEM -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; background:rgba(30,41,59,0.5); padding:10px; border-radius:10px; border:1px solid #334155;">
        
        <!-- Botão Gere padrão (com ícone de imagem) -->
        <button id="btn-gere-padrao" class="btn-modal-action" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border:2px solid #38bdf8; padding:12px 16px; box-shadow:0 4px 14px rgba(2,132,199,0.35);" title="Gerar e alternar para o Layout Padrão Oficial">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Gere padrão</span>
        </button>

        <!-- Botão Gere detalhado (com ícone de imagem) -->
        <button id="btn-gere-detalhado" class="btn-modal-action" style="background:linear-gradient(135deg, #0d9488 0%, #0f766e 100%); border:2px solid transparent; padding:12px 16px; box-shadow:0 4px 14px rgba(13,148,136,0.35);" title="Gerar e alternar para o Layout Detalhado (Relatório ADM 2)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Gere detalhado</span>
        </button>

      </div>

      <!-- Dica Rápida com texto padronizado -->
      <div style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:10px; font-size:12px; color:#bae6fd; display:flex; align-items:center; gap:8px;">
        <span>💡</span>
        <span><b>Dica Rápida:</b> Clique em <b>"Copiar imagem"</b> ou <b>"Copiar para texto"</b> e pressione <b>Ctrl+V</b> direto na conversa do WhatsApp Web para enviar instantaneamente sem precisar baixar arquivos!</span>
      </div>
    </div>
  `;

  if (typeof restaurarBtnComp === 'function') restaurarBtnComp();
  modalOverlay.style.display = 'flex';

  


  const previewImg = document.getElementById('img-preview-relatorio');
  const placeholderTela = document.getElementById('placeholder-tela-imagem');
  const subTit = document.getElementById('modal-subtitulo-layout');
  const btnPadrao = document.getElementById('btn-gere-padrao');
  const btnDetalhado = document.getElementById('btn-gere-detalhado');

  // Regra de Ouro: Botão "Gere detalhado" só visível para Admin
  const ehAdmin = (typeof window.isUsuarioAdmin === 'function' && window.isUsuarioAdmin());
  if (btnDetalhado) {
    if (ehAdmin) {
      btnDetalhado.style.display = 'flex';
      const containerBotoesGere = btnDetalhado.parentElement;
      if (containerBotoesGere) {
        containerBotoesGere.style.gridTemplateColumns = '1fr 1fr';
      }
    } else {
      btnDetalhado.style.display = 'none';
      const containerBotoesGere = btnDetalhado.parentElement;
      if (containerBotoesGere) {
        containerBotoesGere.style.gridTemplateColumns = '1fr';
      }
    }
  }
  const loadingMsg = document.getElementById('loading-preview-msg');

  const btnEnvWhatsapp = document.getElementById('btn-env-whatsapp');
  const btnCopiarImagem = document.getElementById('btn-copiar-imagem');
  const btnBaixarImagem = document.getElementById('btn-baixar-imagem');
  const btnBaixarPdf = document.getElementById('btn-baixar-pdf-rapido');

  // Liberar botões após gerar uma imagem
  function liberarBotoesAcao() {
    [btnEnvWhatsapp, btnCopiarImagem, btnBaixarImagem, btnBaixarPdf].forEach(btn => {
      if (btn) btn.classList.remove('disabled-action');
    });
  }

  function aplicarLayoutDetalhado(res) {
    activeCanvas = res.canvas;
    activeImgUrl = res.imgUrl;
    activeHeight = res.dynamicHeight;
    activeWidth = res.canvasWidth;

    placeholderTela.style.display = 'none';
    previewImg.src = activeImgUrl;
    previewImg.style.display = 'block';

    subTit.style.display = 'inline-block';
    subTit.textContent = 'Layout Atual: Detalhado';

    liberarBotoesAcao();
  }

  // Ação: Gere padrão
  btnPadrao.onclick = () => {
    currentLayout = 'padrao';
    subTit.style.display = 'inline-block';
    subTit.textContent = 'Layout Atual: Padrão';
    btnPadrao.style.border = '2px solid #38bdf8';
    btnDetalhado.style.border = '2px solid transparent';

    if (!cachePadrao) {
      cachePadrao = window.renderizarCanvasRelatorioPadrao(lista, isSelecao);
    }
    activeCanvas = cachePadrao.canvas;
    activeImgUrl = cachePadrao.imgUrl;
    activeHeight = cachePadrao.dynamicHeight;
    activeWidth = cachePadrao.canvasWidth;

    placeholderTela.style.display = 'none';
    previewImg.src = activeImgUrl;
    previewImg.style.display = 'block';

    liberarBotoesAcao();
    if (typeof showToast === 'function') showToast('IMAGEM GERADA PADRAO', 'info');
  };

  // Ação: Gere detalhado
  btnDetalhado.onclick = async () => {
    currentLayout = 'detalhado';
    btnDetalhado.style.border = '2px solid #2dd4bf';
    btnPadrao.style.border = '2px solid transparent';

    if (cacheDetalhado) {
      aplicarLayoutDetalhado(cacheDetalhado);
      if (typeof showToast === 'function') showToast('IMAGEM GERADA DETALHADA', 'success');
    } else {
      try {
        if (loadingMsg) loadingMsg.style.display = 'flex';
        cacheDetalhado = await window.renderizarCanvasRelatorioAdm2(lista);
        aplicarLayoutDetalhado(cacheDetalhado);
        if (typeof showToast === 'function') showToast('IMAGEM GERADA DETALHADA', 'success');
      } catch (err) {
        console.error('Erro ao gerar Relatório Detalhado:', err);
        alert('Erro ao gerar imagem detalhada: ' + err.message);
      } finally {
        if (loadingMsg) loadingMsg.style.display = 'none';
      }
    }
  };

  // 1. Enviar WhatsApp
  btnEnvWhatsapp.onclick = () => {
    const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(textoWhatsApp);
    window.open(url, '_blank');
  };

  // 2. Copiar Imagem ativa
  btnCopiarImagem.onclick = async () => {
    try {
      if (!activeCanvas) throw new Error('Nenhuma imagem ativa para copiar. Gere uma imagem primeiro.');
      activeCanvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Falha ao gerar blob da imagem');
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          if (typeof showToast === 'function') showToast('Imagem copiada! Cole com Ctrl+V no WhatsApp.', 'success');
          else alert('Imagem copiada para a área de transferência! Pressione Ctrl+V no WhatsApp.');
        } else {
          throw new Error('Área de transferência de imagem não suportada');
        }
      }, 'image/png');
    } catch (err) {
      console.warn('Fallback para download da imagem:', err);
      const ts = getFormattedTimestampCompacto();
      const nomeArquivo = (currentLayout === 'detalhado' ? `DCAM(${ts}).png` : (isSelecao ? `SCAM(${ts}).png` : `PCAM(${ts}).png`));
      const a = document.createElement('a');
      a.href = activeImgUrl;
      a.download = nomeArquivo;
      a.click();
      if (typeof showToast === 'function') showToast('Imagem baixada para envio!', 'info');
    }
  };

  // 3. Copiar Para Texto
  document.getElementById('btn-copiar-texto').onclick = () => {
    navigator.clipboard.writeText(textoWhatsApp);
    if (typeof showToast === 'function') showToast('Texto copiado com sucesso!', 'success');
    else alert('Texto copiado com sucesso!');
  };

  // 4. Baixar (PNG) ativo
  btnBaixarImagem.onclick = () => {
    if (!activeImgUrl) return;
    const ts = getFormattedTimestampCompacto();
    const nomeArquivo = (currentLayout === 'detalhado' ? `DCAM(${ts}).png` : (isSelecao ? `SCAM(${ts}).png` : `PCAM(${ts}).png`));
    const a = document.createElement('a');
    a.href = activeImgUrl;
    a.download = nomeArquivo;
    a.click();
    if (typeof showToast === 'function') showToast('Imagem PNG baixada com sucesso!', 'success');
  };

  // 5. Baixar (PDF) ativo
  btnBaixarPdf.onclick = () => {
    if (!activeImgUrl) return;
    const ts = getFormattedTimestampCompacto();
    const nomeArquivo = (currentLayout === 'detalhado' ? `DCAM(${ts}).pdf` : (isSelecao ? `DCAM(${ts}).pdf` : `PCAM(${ts}).pdf`));
    if (window.jspdf) {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('landscape', 'pt', [activeWidth, activeHeight]);
      pdf.addImage(activeImgUrl, 'PNG', 0, 0, activeWidth, activeHeight);
      pdf.save(nomeArquivo);
      if (typeof showToast === 'function') showToast('PDF baixado com sucesso!', 'success');
    } else if (typeof window.imprimirPadraoSelecionado === 'function' && isSelecao) {
      window.imprimirPadraoSelecionado();
    } else if (typeof window.imprimirPadrao === 'function') {
      window.imprimirPadrao();
    }
  };
};
