
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
// SEDUC â€” App Principal (Router + UI)
// ============================================================

// ---- Estado global ----
let state = {
  page: 'dashboard',
  filtros: {
    busca: '',
    status: '',
    localizacao: '',
    municipio: '',
    objeto: '',
    prefixo: '',
    apontamento: false,
    alerta: '',
    marca: '',
    categoria: '',
    tipo: '',
    autorizacao: '',
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
      <p style="color: #f0f4ff; margin-bottom: 16px; font-size: 14px;">VocÃª tem <strong>${comAlerta.length}</strong> processo(s) com apontamento pendente:</p>
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

// ---- NAVEGAÃ‡ÃƒO ----
function navegar(pagina) {
  state.page = pagina;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pagina);
  });
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === 'page-' + pagina);
  });

  const titles = {
    dashboard: 'Dashboard',
    processos: 'Processos',
    novo: state.editandoId ? 'Editar Processo' : 'Novo Processo',
    importar: 'Importar Planilha',
    acessos: 'Gerenciamento de Acessos',
    repetidos: 'Processos Repetidos',
    escolas: 'ðŸ« Escolas',
    'mapa-escolas': 'ðŸ—ºï¸ Mapa de Escolas de RondÃ´nia'
  };
  document.getElementById('topbar-title').textContent = titles[pagina] || pagina;

  // Atualizar conteÃºdo
  if (pagina === 'dashboard') renderDashboard();
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
}

// ---- TOAST ----
function toast(msg, tipo = 'info') {
  const icons = { success: 'âœ…', error: 'âŒ', info: 'â„¹ï¸' };
  const div = document.createElement('div');
  div.className = `toast ${tipo}`;
  div.innerHTML = `<span>${icons[tipo]}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

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
    // Apenas considerar processos nÃ£o encerrados/concluÃ­dos para o alerta de data antiga
    const isEncerrado = ['pago', 'encerrado', 'concluÃ­do', 'cancelado', 'duplicado'].includes(normalizar(p.status));
    
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
        // Link que abre a tela de processos filtrando pelo nÃºmero
        const encodedNum = encodeURIComponent(d.num || '');
        return `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; border-bottom:1px solid rgba(255,255,255,0.06); padding:5px 0;">
          <span style="color:#94a3b8; min-width:90px;">${d.original}</span>
          <span style="color:#f8fafc; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.municipio || 'S/ MunicÃ­pio'}</span>
          <span style="color:#60a5fa; font-weight:700; min-width:60px; text-align:center;">${d.prefixo || '-'}</span>
          <a href="#" onclick="event.preventDefault(); state.filtros.busca='${(d.num||'').replace(/'/g,'')}'; navegar('processos');" 
             style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); border-radius:6px; padding:2px 10px; font-size:11px; font-weight:700; text-decoration:none; white-space:nowrap; transition:background 0.2s;" 
             onmouseover="this.style.background='rgba(59,130,246,0.35)'" 
             onmouseout="this.style.background='rgba(59,130,246,0.15)'">ðŸ”— VER</a>
        </div>`;
      }).join('');
    }
  } else if (elDataAntiga) {
    elDataAntiga.textContent = '--/--/----';
    if (elDataAntigaList) elDataAntigaList.innerHTML = '';
  }

  // --- GrÃ¡fico de Acessos ---
  renderChartAcessosDashboard();

  // GrÃ¡fico: Status
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

  // GrÃ¡fico: Categoria
  const catCounts = {};
  processos.forEach(p => {
    let c = String(p.categoria || '').trim().toUpperCase();
    if (!c) {
      c = 'NÃƒO INFORMADO';
    } else {
      if (c === 'F') c = 'FOMENTO';
      else if (c === 'C') c = 'CONVÃŠNIO';
      else if (c === 'T') c = 'TERMO DE COOPERAÃ‡ÃƒO';
      else if (c === 'O') c = 'OUTRO';
    }
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const catLabels = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a]);
  const catValues = catLabels.map(k => catCounts[k]);
  const totalCat = catValues.reduce((sum, v) => sum + v, 0) || 1;

  const colorsCatMap = {
    'FOMENTO': '#3b82f6',
    'CONVÃŠNIO': '#10b981',
    'TERMO DE COOPERAÃ‡ÃƒO': '#8b5cf6',
    'OUTRO': '#06b6d4',
    'NÃƒO INFORMADO': '#64748b'
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

  // GrÃ¡fico: Tipo
  const tipoCounts = {};
  processos.forEach(p => {
    let t = String(p.tipo || '').trim().toUpperCase();
    if (!t) {
      t = 'NÃƒO INFORMADO';
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
    'NÃƒO INFORMADO': '#64748b'
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

  // GrÃ¡fico: Todos MunicÃ­pios por valor
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

  const ctxMun = document.getElementById('chart-municipio').getContext('2d');
  if (chartMunicipio) chartMunicipio.destroy();
  chartMunicipio = new Chart(ctxMun, {
    type: 'bar',
    data: {
      labels: allMun.map(([m]) => m.length > 18 ? m.slice(0,18)+'â€¦' : m),
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

  // GrÃ¡fico: Prefixo (LT, Cgoi, IeCH, ClJs...)
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

    // LocalizaÃ§Ã£o
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
  // Pizza removida â€” apenas grÃ¡fico de barras proporcional
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
    // Parsing robusto: trata string vazia, ponto, vÃ­rgula decimal
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

    console.log('[ACESSOS] UsuÃ¡rios processados:', usuarios);

    // Totais por categoria (contagem real)
    const totalAcessos = usuarios.reduce((s, u) => s + u.contagem, 0) || 1;
    const totalEditor  = usuarios.filter(u => u.nivel === 'editor').reduce((s, u) => s + u.contagem, 0);
    const totalLeitor  = usuarios.filter(u => u.nivel === 'leitor').reduce((s, u) => s + u.contagem, 0);

    // ---- Limpar lista de badges (nÃ£o usada) ----
    const elNomes = document.getElementById('lista-nomes-acessos');
    if (elNomes) elNomes.innerHTML = '';

    // ---- GrÃ¡fico de barras VERTICAL proporcional (100% = total) ----
    // Cada barra tem altura proporcional Ã  sua participaÃ§Ã£o no total de acessos
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
              display: false // usa plugin chartjs-plugin-datalabels se disponÃ­vel
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
  if (status)      lista = lista.filter(p => normalizar(p.status)      === normalizar(status));
  if (localizacao) lista = lista.filter(p => normalizar(p.localizacao) === normalizar(localizacao));
  if (municipio)   lista = lista.filter(p => normalizar(p.municipio)   === normalizar(municipio));
  if (objeto)      lista = lista.filter(p => normalizar(p.objeto)      === normalizar(objeto));
  if (categoria)   lista = lista.filter(p => normalizar(p.categoria)   === normalizar(categoria));
  if (tipo)        lista = lista.filter(p => normalizar(p.tipo)        === normalizar(tipo));
  if (ano)         lista = lista.filter(p => String(p.ano)             === String(ano));
  if (state.filtros.agrupamento) lista = lista.filter(p => normalizar(p.agrupamento) === normalizar(state.filtros.agrupamento));
  if (state.filtros.prefixo) lista = lista.filter(p => normalizar(p.prefixo).includes(normalizar(state.filtros.prefixo)));

  // Filtros individuais de autorizaÃ§Ã£o
  if (state.filtros.cam) lista = lista.filter(p => p.CAM === '1');
  if (state.filtros.gab) lista = lista.filter(p => p.GAB === '1');
  if (state.filtros.cc)  lista = lista.filter(p => p.CC  === '1');


  // OrdenaÃ§Ã£o
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

function renderProcessos() {
  const processos = carregarProcessos();
  const filtrados = getFiltrados();
  const total = filtrados.length;
  const totalPags = Math.ceil(total / state.itensPorPagina);
  if (state.paginaAtual > totalPags) state.paginaAtual = Math.max(1, totalPags);

  const inicio = (state.paginaAtual - 1) * state.itensPorPagina;
  const pagina = filtrados.slice(inicio, inicio + state.itensPorPagina);

  // Preencher filtros dinÃ¢micos
  preencherSelectFiltro('filtro-ano',         [...new Set(carregarProcessos().map(p => p.ano).filter(Boolean))].sort((a,b)=>b-a));
  preencherSelectFiltro('filtro-agrupamento', [...new Set(carregarProcessos().map(p => p.agrupamento).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-status',      [...new Set(carregarProcessos().map(p => p.status).filter(s => s && s !== '.'))].sort());
  preencherSelectFiltro('filtro-localizacao', [...new Set(carregarProcessos().map(p => p.localizacao).filter(l => l && l !== '.'))].sort());
  preencherSelectFiltro('filtro-municipio',   [...new Set(carregarProcessos().map(p => p.municipio).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-objeto',      [...new Set(carregarProcessos().map(p => p.objeto).filter(Boolean))].sort());

  // Preencher datalist do filtro de prefixo
  const dlFiltroPfx = document.getElementById('list-filtro-prefixos');
  if (dlFiltroPfx) {
    const pfxs = [...new Set(carregarProcessos().map(p => p.prefixo).filter(Boolean))].sort();
    dlFiltroPfx.innerHTML = pfxs.map(v => `<option value="${v}">`).join('');
  }

  // Preencher datalists do formulÃ¡rio
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

  // Tabela
  const tbody = document.getElementById('table-processos');
  const busca = state.filtros.busca;

  tbody.innerHTML = pagina.map(p => `
    <tr onclick="abrirDetalhe('${p.id}')" class="${p.alerta === '1' ? 'linha-alerta' : ''} ${p.marca === '1' || p.marca === 'SIM' ? 'linha-marcada' : ''} process-row ${p.CAM === '1' && p.GAB === '1' && p.CC === '1' ? 'border-autorizado' : 'border-pendente'}">
      <td class="col-prefixo" title="${p.prefixo}">
        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
          <!-- Linha 1: PREFIXO -->
          <div style="display: flex; align-items: center; white-space: nowrap;">
            <span class="badge ${p.alerta === '1' ? 'badge-prefixo-alert' : 'badge-prefixo-normal'}" style="flex-shrink: 0; font-size: 11px; padding: 2px 6px;">
              ${p.prefixo || 'â€”'}
            </span>
          </div>
          <!-- Linha 2: CATEGORIA; TIPO; MARCAÃ‡ÃƒO -->
          <div style="display: flex; flex-wrap: nowrap; gap: 4px; align-items: center; white-space: nowrap; margin-left: -4px;">
            ${getCategoryBadge(p.categoria)}
            ${getTypeBadge(p.tipo)}
            ${p.marca === '1' || p.marca === 'SIM' ? '<span class="badge-marca" title="Processo Marcado - Ver ObservaÃ§Ãµes" style="margin-left:4px; font-size:12px; line-height: 1; flex-shrink: 0;">ðŸ“Œ</span>' : ''}
          </div>
          <!-- Linha 3: CAM; GAB; CC -->
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 1px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.CAM === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 3px rgba(0,0,0,0.3);" title="CAM"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.GAB === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 3px rgba(0,0,0,0.3);" title="GABINETE"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${p.CC === '1' ? '#10b981' : '#ef4444'}; box-shadow: 0 0 3px rgba(0,0,0,0.3);" title="CASA CIVIL"></div>
          </div>
        </div>
      </td>
      <td class="col-municipio">${hl(p.municipio, busca)}</td>
      <td class="col-numero">
        ${hl(p.numero, busca) || 'â€”'}
        ${p.ano ? `<span style="margin-left: 4px; padding: 2px 6px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 10px; color: #cbd5e1;">${p.ano}</span>` : ''}
      </td>
      <td class="col-interessado" title="${p.interessado}">${hl(p.interessado, busca) || 'â€”'}</td>
      <td class="col-objeto" title="${p.objeto}">${p.objeto || 'â€”'}</td>
      <td><span class="badge ${getStatusBadgeClass(p.status)}">${p.status || 'â€”'}</span></td>
      <td>${p.localizacao || 'â€”'}</td>
      <td class="col-valor">${formatCurrency(p.valorOf)}</td>
      <td>${formatDate(p.data)}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="editarProcesso('${p.id}')" title="Editar">âœï¸</button>
        <button class="btn btn-ghost btn-sm" onclick="confirmarExcluir('${p.id}')" title="Excluir" style="color: var(--red); margin-left: 4px;">ðŸ—‘ï¸</button>
      </td>
    </tr>
  `).join('') || `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td colspan="9">
      <div class="empty-state">
        <div class="empty-icon">ðŸ”</div>
        <h3>Nenhum resultado encontrado</h3>
        <p>Tente ajustar os filtros</p>
      </div>
    </tr>`;

  // Info paginaÃ§Ã£o
  document.getElementById('pg-info').textContent = total === 0
    ? 'Nenhum resultado'
    : `Exibindo ${inicio + 1}â€“${Math.min(inicio + state.itensPorPagina, total)} de ${total} processos`;

  // Controles paginaÃ§Ã£o
  renderPaginacao(totalPags);

  // Total valor filtrado
  const valorTotal = filtrados.reduce((a, p) => a + (p.valorOf || 0), 0);
  const el = document.getElementById('valor-filtrado');
  if (el) el.textContent = `Total: ${formatCurrency(valorTotal)}`;

  const elQtd = document.getElementById('qtd-registros-filtrados');
  if (elQtd) elQtd.textContent = `${total.toLocaleString('pt-BR')} ${total === 1 ? 'registro' : 'registros'}`;

  // BotÃ£o exportar
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

function preencherSelectFiltro(id, opcoes) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const atual = sel.value;
  let placeholder = 'Todos';
  if (id === 'filtro-status') placeholder = 'Status';
  else if (id === 'filtro-localizacao') placeholder = 'LocalizaÃ§Ã£o';
  else if (id === 'filtro-municipio') placeholder = 'MunicÃ­pio';
  else if (id === 'filtro-objeto') placeholder = 'Objeto';
  else if (id === 'filtro-ano') placeholder = 'Ano';

  sel.innerHTML = `<option value="">${placeholder}</option>` + opcoes.map(o => `<option value="${o}" ${o === atual ? 'selected' : ''}>${o}</option>`).join('');
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

  addBtn('â€¹', state.paginaAtual - 1, state.paginaAtual === 1);

  let start = Math.max(1, state.paginaAtual - 2);
  let end   = Math.min(totalPags, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) addBtn(i, i, false, i === state.paginaAtual);

  addBtn('â€º', state.paginaAtual + 1, state.paginaAtual === totalPags || totalPags === 0);
}

// ---- FORMULÃRIO / MÃSCARAS ----
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
  v = (parseInt(v, 10) / 100).toFixed(2) + "";
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
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;" value="${val}">
    <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding:0 8px;height:40px;" title="Remover">-</button>
  `;
  container.appendChild(div);
}

// ---- FORMULÃRIO ----
function renderFormulario() {
  const processo = state.editandoId ? buscarProcessoPorId(state.editandoId) : null;
  const p = processo || {};

  // Preencher selects do formulÃ¡rio
  const fillSelect = (id, lista, val) => {
    const s = document.getElementById(id);
    if (!s) return;
    s.innerHTML = lista.map(o => `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`).join('');
  };

  fillSelect('form-status',      STATUS_LIST,      p.status      || '');
  fillSelect('form-localizacao', LOCALIZACAO_LIST, p.localizacao || '');
  
  const anos_list = [...new Set(carregarProcessos().map(x => String(x.ano || '')).filter(Boolean))].sort((a,b)=>b-a);
  fillSelect('list-anos', anos_list, '');
  const agrupamentos_list = [...new Set(carregarProcessos().map(x => String(x.agrupamento || '')).filter(Boolean))].sort();
  fillSelect('list-agrupamentos', agrupamentos_list, '');

  if (processo) {
    document.getElementById('form-ano').value         = p.ano          || '';
    document.getElementById('form-agrupamento').value = p.agrupamento  || '';
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

    // Processar array de nÃºmeros
    const containerNum = document.getElementById('container-numeros');
    containerNum.innerHTML = '';
    const numeros = p.numero ? p.numero.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (numeros.length === 0) numeros.push(''); // add at least one empty
    
    numeros.forEach((num, i) => {
      if (i === 0) {
        containerNum.innerHTML = `
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;" value="${num}">
            <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 8px;height:40px;border:1px solid var(--border);" title="Adicionar nÃºmero">+</button>
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
    document.getElementById('form-categoria').value   = '';
    document.getElementById('form-tipo').value        = '';
    updateSegmentControl('categoria', '');
    updateSegmentControl('tipo', '');
    document.getElementById('container-numeros').innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;">
        <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 8px;height:40px;border:1px solid var(--border);" title="Adicionar nÃºmero">+</button>
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

  // LÃ³gica de Apontamento e HistÃ³rico
  const currentSessao = typeof getSessaoAtual === 'function' ? getSessaoAtual() : null;
  const userNivel = currentSessao ? currentSessao.nivel : 'leitor';

  const legendDiv = document.getElementById('legend-ultima-edicao');
  const nomeDiv = document.getElementById('ultima-edicao-nome');
  const dataDiv = document.getElementById('ultima-edicao-data');
  
  if (processo) {
    if (legendDiv) legendDiv.style.display = 'block';
    const nomeEdicao = p.ultimaEdicao || '';
    const dataEdicao = p.dataHoraEdicao || '';
    
    if (nomeEdicao || dataEdicao) {
      if (nomeDiv) nomeDiv.innerHTML = `ðŸ‘¤ ${nomeEdicao}`;
      if (dataDiv) dataDiv.innerHTML = `ðŸ“… ${dataEdicao}`;
    } else {
      if (nomeDiv) nomeDiv.innerHTML = `<span style="font-style: italic; color: var(--text-muted);">Sem registros</span>`;
      if (dataDiv) dataDiv.innerHTML = 'â€”';
    }
  } else {
    if (legendDiv) legendDiv.style.display = 'none';
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
  
  // Obter todos os nÃºmeros preenchidos
  const inputsNum = Array.from(document.querySelectorAll('input[name="numero[]"]'));
  const numerosJoined = inputsNum.map(i => i.value.trim()).filter(Boolean).join(', ');

  // Capturar contato digitado mas nÃ£o adicionado (sem clicar no '+')
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
    toast('Informe ao menos o NÂº do Processo ou o Interessado.', 'error');
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
        <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">ðŸ“ž Contatos</h4>
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
        <h4 style="font-size:12px;text-transform:uppercase;color:#22c55e;letter-spacing:.5px;margin-bottom:8px">ðŸ“ Novo Apontamento</h4>
        <textarea id="modal-apontamento-texto" placeholder="Digite seu apontamento..." style="width:100%; min-height:80px; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:#fff; font-size:13px; outline:none; margin-bottom:12px;"></textarea>
        <button onclick="salvarApontamentoModal('${p.id}')" id="btn-salvar-apont" style="width:100%; padding:10px; border-radius:6px; border:none; background:#22c55e; color:#fff; font-weight:bold; cursor:pointer;">Salvar Apontamento</button>
      </div>
    `;
  } else if (userNivel === 'adm' && p.apontamento) {
    apontamentoHtml = `
      <div class="card" style="margin-bottom:16px; border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.05);">
        <h4 style="font-size:12px;text-transform:uppercase;color:#f59e0b;letter-spacing:.5px;margin-bottom:8px">ðŸ“ HistÃ³rico de Apontamentos</h4>
        <div style="font-size:13px; color:#cbd5e1; background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; white-space:pre-wrap; min-height:60px;">${p.apontamento}</div>
      </div>
    `;
  }

  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-content').innerHTML = `
    <div class="detail-header" style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; gap:12px; width:100%;">
        ${p.numero ? `
        <button style="flex:1; padding:12px; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:6px; background:#3b82f6; color:#ffffff; cursor:pointer;" onclick="copiarProcessoSelecionado()" title="Copiar NÃºmero">
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

      <!-- Indicadores de AutorizaÃ§Ã£o (Estilo Moderno) -->
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
            return '<span style="font-size:14px;font-weight:600">Sem nÃºmero</span>';
          })()}
        </div>
        <div class="detail-nome" style="font-size:18px; margin-bottom:8px;">${p.interessado || 'â€”'}</div>
        <div>
          <span class="badge ${getStatusBadgeClass(p.status)}">${p.status || 'â€”'}</span>
        </div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-item"><label>MunicÃ­pio</label><p>${p.municipio || 'â€”'}</p></div>
      <div class="info-item"><label>Objeto</label><p>${p.objeto || 'â€”'}</p></div>
      <div class="info-item"><label>LocalizaÃ§Ã£o</label><p>${p.localizacao || 'â€”'}</p></div>
      <div class="info-item"><label>Data</label><p>${formatDate(p.data)}</p></div>
    </div>


    <div class="card" style="margin-bottom:16px">
      <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">ðŸ’° ExecuÃ§Ã£o Financeira</h4>
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
          <div style="font-size:11px;color:var(--text-muted)">DiferenÃ§a</div>
          <div style="font-size:18px;font-weight:700;color:${(p.diferenca||0) < 0 ? 'var(--red)' : 'var(--yellow)'}">${formatCurrency(p.diferenca)}</div>
        </div>
      </div>
    </div>

    ${p.marca === '1' || p.marca === 'SIM' ? `
      <div class="card" style="margin-bottom:16px; border: 2px solid var(--blue); background: rgba(59, 130, 246, 0.08); display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(59,130,246,0.15);">
        <span style="font-size: 24px;">ðŸ“Œ</span>
        <div>
          <strong style="color: var(--blue); font-size: 14px;">Processo Marcado para AtenÃ§Ã£o!</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-secondary);">Por favor, verifique as observaÃ§Ãµes abaixo.</p>
        </div>
      </div>
    ` : ''}

    ${p.obs ? `
      <div class="card" style="margin-bottom:16px; ${p.marca === '1' || p.marca === 'SIM' ? 'border: 1px solid var(--blue); background: rgba(59, 130, 246, 0.03);' : ''}">
        <h4 style="font-size:12px;text-transform:uppercase;color:${p.marca === '1' || p.marca === 'SIM' ? 'var(--blue)' : 'var(--text-muted)'};letter-spacing:.5px;margin-bottom:8px">ðŸ“ ObservaÃ§Ãµes</h4>
        <p style="color:var(--text-secondary);font-size:14px">${p.obs}</p>
      </div>
    ` : ''}
    ${p.anotacao ? `<div class="card" style="margin-bottom:16px"><h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:8px">ðŸ—’ï¸ AnotaÃ§Ã£o</h4><p style="color:var(--text-secondary);font-size:14px">${p.anotacao}</p></div>` : ''}

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
      toast('Erro de conexÃ£o.', 'error');
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
    btn.innerHTML = '<span>â³</span> Gravando...';
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
      btn.innerHTML = '<span>ðŸ’¾</span> Gravar';
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
      btn.innerHTML = '<span>ðŸ’¾</span> Gravar';
    }
    toast('Erro de conexÃ£o ao gravar apontamento.', 'error');
  });
};

window.limparApontamentoEdicao = function() {
  if (confirm('Tem certeza de que deseja limpar todo o histÃ³rico de apontamentos deste processo?')) {
    const txtHistorico = document.getElementById('form-historico-acumulado-texto');
    if (txtHistorico) {
      txtHistorico.value = '';
    }

    const chk = document.getElementById('form-alerta-toggle');
    if (chk) chk.checked = false;

    toast('HistÃ³rico limpo localmente. Clique em Salvar Processo para confirmar a limpeza na planilha.', 'info');
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
  const ident = p.numero || p.interessado || 'Sem IdentificaÃ§Ã£o';
  if (confirm(`DESEJA EXCLUIR REGISTRO "${ident}"?`)) {
    if (confirm(`âš ï¸ ATENÃ‡ÃƒO: ISSO Ã‰ IRREVERSÃVEL!\n\nEste registro serÃ¡ excluÃ­do permanentemente da planilha do Google e nÃ£o poderÃ¡ ser recuperado. Deseja realmente prosseguir?`)) {
      excluirProcesso(id);
      toast('Processo excluÃ­do com sucesso.', 'info');
      navegar('processos');
    }
  }
}

// ---- IMPORTAÃ‡ÃƒO ----
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
        <h3 style="color:var(--green);margin-bottom:12px">âœ… ImportaÃ§Ã£o concluÃ­da!</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:14px">
          <div><span style="color:var(--text-muted)">Total na planilha:</span><br><strong>${result.total}</strong></div>
          <div><span style="color:var(--text-muted)">Novos importados:</span><br><strong style="color:var(--green)">${result.novos}</strong></div>
          <div><span style="color:var(--text-muted)">Duplicados ignorados:</span><br><strong style="color:var(--yellow)">${result.duplicados}</strong></div>
        </div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navegar('processos')">Ver Processos â†’</button>
      </div>`;
    toast(`${result.novos} processos importados!`, 'success');
  } catch (err) {
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(239,68,68,0.3)">
        <h3 style="color:var(--red)">âŒ Erro na importaÃ§Ã£o</h3>
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
        <h3 style="color:var(--green);margin-bottom:12px">âœ… ImportaÃ§Ã£o do GSheets concluÃ­da!</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:14px">
          <div><span style="color:var(--text-muted)">Total lidos:</span><br><strong>${result.total}</strong></div>
          <div><span style="color:var(--text-muted)">Novos importados:</span><br><strong style="color:var(--green)">${result.novos}</strong></div>
          <div><span style="color:var(--text-muted)">Duplicados ignorados:</span><br><strong style="color:var(--yellow)">${result.duplicados}</strong></div>
        </div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navegar('processos')">Ver Processos â†’</button>
      </div>`;
    toast(`${result.novos} processos importados do GSheets!`, 'success');
  } catch (err) {
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(239,68,68,0.3)">
        <h3 style="color:var(--red)">âŒ Erro no Google Sheets</h3>
        <p style="color:var(--text-muted);margin-top:8px">${err.message}</p>
      </div>`;
    toast('Erro ao importar Google Sheets.', 'error');
  }
}

// ---- INICIALIZAÃ‡ÃƒO ----
document.addEventListener('DOMContentLoaded', () => {
  // NavegaÃ§Ã£o
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.page === 'novo') novoProcesso();
      else navegar(el.dataset.page);
    });
  });

  // FormulÃ¡rio
  
  // Listeners filtros autorizaÃ§Ã£o individuais
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
    state.filtros[campo] = valor;
    state.paginaAtual = 1;
    renderProcessos();
  };

  document.getElementById('filtro-busca').addEventListener('input', e => aplicarFiltro('busca', e.target.value));
  document.getElementById('filtro-status').addEventListener('change', e => aplicarFiltro('status', e.target.value));
  document.getElementById('filtro-localizacao').addEventListener('change', e => aplicarFiltro('localizacao', e.target.value));
  document.getElementById('filtro-municipio').addEventListener('change', e => aplicarFiltro('municipio', e.target.value));
  document.getElementById('filtro-objeto').addEventListener('change', e => aplicarFiltro('objeto', e.target.value));
  document.getElementById('filtro-categoria').addEventListener('change', e => aplicarFiltro('categoria', e.target.value));
  document.getElementById('filtro-tipo').addEventListener('change', e => aplicarFiltro('tipo', e.target.value));
  const filtroAnoEl = document.getElementById('filtro-ano');
  if (filtroAnoEl) {
    filtroAnoEl.addEventListener('change', e => aplicarFiltro('ano', e.target.value));
  }
  const filtroAgrupEl = document.getElementById('filtro-agrupamento');
  if (filtroAgrupEl) {
    filtroAgrupEl.addEventListener('change', e => aplicarFiltro('agrupamento', e.target.value));
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
    state.filtros = { busca: '', status: '', localizacao: '', municipio: '', objeto: '', prefixo: '', alerta: '', marca: '', categoria: '', tipo: '', autorizacao: '', ano: '', agrupamento: '' };
    state.paginaAtual = 1;
    document.getElementById('filtro-busca').value = '';
    document.getElementById('filtro-status').value = '';
    document.getElementById('filtro-localizacao').value = '';
    document.getElementById('filtro-municipio').value = '';
    document.getElementById('filtro-objeto').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-prefixo').value = '';
    const fAno = document.getElementById('filtro-ano');
    if (fAno) fAno.value = '';
    const fAgr = document.getElementById('filtro-agrupamento');
    if (fAgr) fAgr.value = '';
    const fa = document.getElementById('filtro-alerta');
    if (fa) fa.value = '';
    const fm = document.getElementById('filtro-marca');
    if (fm) fm.value = '';
    renderProcessos();
  });

  // Filtro prefixo â€” input em tempo real
  document.getElementById('filtro-prefixo').addEventListener('input', e => aplicarFiltro('prefixo', e.target.value.trim()));

  // OrdenaÃ§Ã£o por coluna
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortCol === col) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortCol = col;
        state.sortDir = 'asc';
      }
      document.querySelectorAll('th[data-sort]').forEach(t => t.textContent = t.textContent.replace(/ [â–²â–¼]$/,''));
      th.textContent += state.sortDir === 'asc' ? ' â–²' : ' â–¼';
      renderProcessos();
    });
  });

  // ImportaÃ§Ã£o
  setupImportacao();

  // Preencher selects de filtro com status e localizaÃ§Ã£o
  const fillSelectFiltro = (id, lista) => {
    const s = document.getElementById(id);
    if (!s) return;
    s.innerHTML = `<option value="">Todos</option>` + lista.map(o => `<option value="${o}">${o}</option>`).join('');
  };
  fillSelectFiltro('filtro-status',      STATUS_LIST.filter(s => s !== '.'));
  fillSelectFiltro('filtro-localizacao', LOCALIZACAO_LIST.filter(s => s !== '.'));

  // MÃ¡scara de Celular (WhatsApp)
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

  // PÃ¡gina inicial
  navegar('dashboard');
});

// ---- EXPORTAÃ‡ÃƒO ----
function exportarExcel() {
  const filtrados = getFiltrados();
  if (filtrados.length === 0) {
    toast('Nenhum processo para exportar.', 'error');
    return;
  }

  const data = filtrados.map(p => ({
    "Prefixo": p.prefixo || '',
    "MunicÃ­pio": p.municipio || '',
    "NÂº Processo": p.numero || '',
    "Interessado": p.interessado || '',
    "Objeto": p.objeto || '',
    "Status": p.status || '',
    "LocalizaÃ§Ã£o": p.localizacao || '',
    "Valor Oficial": p.valorOf || 0,
    "Valor Planilha": p.valorPlan || 0,
    "Data": p.data ? formatDate(p.data) : ''
  }));

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
  const dateTimeStr = "Impresso em: " + dateStr + " Ã s " + timeStr + " | UsuÃ¡rio: " + userName;

  const tableColumn = ["Prefixo", "MunicÃ­pio", "NÂº Processo", "Interessado", "Objeto", "Status", "LocalizaÃ§Ã£o", "Valor Oficial", "Data"];
  
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
      doc.text("CAM - COORDENADORIA DE ARTICULAÃ‡ÃƒO COM OS MUNICÃPIOS | SEDUC - RO", 14, 20);
      
      const str = "PÃ¡gina " + data.pageNumber + " de " + totalPagesExp;
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
    el.innerHTML = "Emitido em: " + dateStr + ", Ã s " + timeStr;
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
    toast('Preencha o nÃºmero do WhatsApp', 'error');
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
      "<span style=\"font-weight:600; color:var(--text-primary); font-size:13px;\">ðŸ“ž " + whatsappFormatado + "</span>" +
      (c.detalhes ? "<span style=\"color:var(--text-secondary); font-size:12px;\">" + c.detalhes + "</span>" : "") +
      "</div>" +
      "<button type=\"button\" class=\"btn btn-ghost btn-sm\" onclick=\"removerContato(" + idx + ")\" style=\"color:var(--red); padding: 2px;\">âŒ</button>";
      
    container.appendChild(div);
  });
}




// ---- FUNï¿½ï¿½O PARA COPIAR PROCESSO SELECIONADO ----
window.copiarProcessoSelecionado = function() {
  const radio = document.querySelector('input[name="modal_processo_radio"]:checked');
  if (radio) {
    navigator.clipboard.writeText(radio.value);
    toast('Nï¿½mero copiado!', 'success');
  } else {
    toast('Nenhum nï¿½mero selecionado', 'error');
  }
};



// ==================== IMPRESSÃ•ES ====================


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
    <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:15px; width:100%; font-family: Arial, sans-serif;">
      <div style="text-align:left;">
        <h2 style="margin:0; font-size:11px; color:#000; font-weight:bold;">CAM - COORDENADORIA DE ARTICULAÃ‡ÃƒO COM OS MUNICÃPIOS | SEDUC - RO</h2>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px; color:#000; font-weight:bold;">${subtitle.toUpperCase()}</div>
      </div>
    </div>
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
function getCommonFooter() {
  return `
    <div style="border-top:1px solid #ccc; padding-top:4px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:9px; font-weight:normal; color:#333; font-family: Arial, sans-serif; width:100%;">
      <div style="flex:1; text-align:left; font-weight:bold; color:#000;">GBZ</div>
      <div style="flex:1; text-align:right;" class="print-date-time-rodape"></div>
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

window.imprimirPadrao = function() {
      updatePrintDateTime();
      updatePrintDateTime();
      const filtrados = getFiltrados();
      
      let rowsHtml = filtrados.map((p, index) => {
        const prefixoFormatado = `
          <div style="font-family: monospace, Courier, sans-serif; white-space: nowrap; font-size: 9px;">
            <span style="display:inline-block; width:34px; text-align:left;">${p.prefixo || '-'}</span> | 
            <span style="display:inline-block; width:10px; text-align:center;">${p.categoria || '-'}</span> | 
            <span style="display:inline-block; width:16px; text-align:center;">${p.tipo || '-'}</span>
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
                <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:3%; font-size:10.5px; font-weight:bold;">NÂº</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">PREFIXO</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:11%; font-size:10.5px; font-weight:bold;">MUNICÃPIO</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:12%; font-size:10.5px; font-weight:bold;">PROCESSO SEI</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:15%; font-size:10.5px; font-weight:bold;">INTERESSADO</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:22%; font-size:10.5px; font-weight:bold;">OBJETO / FINALIDADE</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:8%; font-size:10.5px; font-weight:bold;">STATUS</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">LOCAL</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:7%; font-size:10.5px; font-weight:bold;">DATA</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:right; width:8%; font-size:10.5px; font-weight:bold;">VALOR R$</th>
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
      style.innerHTML = '@media print { @page { size: A4 landscape !important; } }';
      document.head.appendChild(style);

      window.print();

      setTimeout(() => {
        document.title = origTitle;
        if (document.head.contains(style)) document.head.removeChild(style);
        document.body.classList.remove('print-mode-padrao');
        container.style.display = 'none';
      }, 1000);
    };

window.imprimirDetalhado = function() {
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
        <div style="font-size:7px; color:#000;">${filtrados.length} processos Ãºnicos</div>
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
      <div style="font-family: monospace, Courier, sans-serif; white-space: nowrap; font-size: 9px;">
        <span style="display:inline-block; width:34px; text-align:left;">${p.prefixo || '-'}</span> | 
        <span style="display:inline-block; width:10px; text-align:center;">${p.categoria || '-'}</span> | 
        <span style="display:inline-block; width:16px; text-align:center;">${p.tipo || '-'}</span>
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
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:3%; font-size:10.5px; font-weight:bold;">NÂº</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">PREFIXO</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:11%; font-size:10.5px; font-weight:bold;">MUNICÃPIO</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:12%; font-size:10.5px; font-weight:bold;">PROCESSO SEI</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:15%; font-size:10.5px; font-weight:bold;">INTERESSADO</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:22%; font-size:10.5px; font-weight:bold;">OBJETO / FINALIDADE</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:8%; font-size:10.5px; font-weight:bold;">STATUS</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">LOCAL</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:7%; font-size:10.5px; font-weight:bold;">DATA</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:right; width:8%; font-size:10.5px; font-weight:bold;">VALOR R$</th>
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
        â€¢ ${(valAutorizados / (total||1) * 100).toFixed(1)}% do valor consolidado jÃ¡ consta como AUTORIZADO.<br>
        â€¢ ${qtdReabertos > 0 ? 'Reabertos: ' + formatCurrency(valReabertos) + '.' : 'NÃ£o hÃ¡ processos reabertos nesta seleÃ§Ã£o.'}<br>
        â€¢ ${qtdOutros > 0 ? 'Existem ' + qtdOutros + ' processos em outras situaÃ§Ãµes.' : 'Todos os processos estÃ£o resolvidos.'}
      </div>
    </div>
  `;

  const html = `
    <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
      <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('RELATÃ“RIO DETALHADO DE PROCESSOS')}</td></tr></thead>
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

window.imprimirAnalise = function() {
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
  if (fLocalizacao && fLocalizacao !== 'Todos') filtrosAplicados.push("LocalizaÃ§Ã£o: " + fLocalizacao);
  if (fPrefixo && fPrefixo !== 'Todos') filtrosAplicados.push("Prefixo: " + fPrefixo);
  if (fMunicipio && fMunicipio !== 'Todos') filtrosAplicados.push("MunicÃ­pio: " + fMunicipio);
  
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
      <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('ANÃLISE GERENCIAL')}</td></tr></thead>
      <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
        
        <div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; margin-bottom:20px; font-size:12px; text-align:justify; line-height:1.6; padding:10px; border:1px solid #ccc;">
          <strong>SÃNTESE ANALÃTICA:</strong> ParÃ¢metros buscados: <em>${filtrosTexto}</em>.<br>O presente cenÃ¡rio totaliza <strong>${formatCurrency(total)}</strong> distribuÃ­dos em <strong>${filtrados.length}</strong> processos. 
          Abaixo detalhamos a concentraÃ§Ã£o de recursos por status, cruzando com a localizaÃ§Ã£o, 
          permitindo identificar os principais setores responsÃ¡veis pela retenÃ§Ã£o de processos.
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

// ---- GERENCIAMENTO DE ACESSOS (CRUD) ----

let listaAcessos = [];

function abrirModalAcesso(index = null) {
  const title = document.getElementById('cadastro-acesso-title');
  const rowInput = document.getElementById('acesso-row');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const senhaInput = document.getElementById('acesso-senha');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-acesso');

  if (!rowInput) return;

  if (index !== null) {
    const user = listaAcessos[index];
    title.innerHTML = '<span>âœï¸</span> Editar Registro de Acesso';
    rowInput.value = user._rowNumber;
    nomeInput.value = user.nome;
    whatsappInput.value = user.whatsapp || '';
    nivelInput.value = user.nivel;
    senhaInput.value = user.senha || '';

    // Habilitar campos
    nomeInput.disabled = false;
    whatsappInput.disabled = true; // WhatsApp nÃ£o pode ser alterado na ediÃ§Ã£o
    nivelInput.disabled = false;
    senhaInput.disabled = false;

    if (btnSalvar) btnSalvar.disabled = false;
    if (btnCancelar) btnCancelar.style.display = 'inline-flex';
    
    nomeInput.focus();
  } else {
    cancelarEdicaoAcesso();
  }
}

function cancelarEdicaoAcesso() {
  const title = document.getElementById('cadastro-acesso-title');
  const form = document.getElementById('form-acesso');
  const rowInput = document.getElementById('acesso-row');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const senhaInput = document.getElementById('acesso-senha');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-acesso');

  if (form) form.reset();
  if (rowInput) rowInput.value = '';
  if (title) title.innerHTML = '<span>ðŸ‘¤</span> Registro de Acesso';

  // Limpar e Desabilitar campos
  if (nomeInput) { nomeInput.value = ''; nomeInput.disabled = true; }
  if (whatsappInput) { whatsappInput.value = ''; whatsappInput.disabled = true; }
  if (nivelInput) { nivelInput.selectedIndex = -1; nivelInput.disabled = true; }
  if (senhaInput) { senhaInput.value = ''; senhaInput.disabled = true; }

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

  if (title) title.innerHTML = '<span>âž•</span> Novo Registro de Acesso';

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
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum usuÃ¡rio cadastrado.</td></tr>`;
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
      `
    }[user.nivel] || `<span style="font-size:12px; font-weight:600; color:var(--text-primary);">${user.nivel}</span>`;

    const whatsappDisplay = user.whatsapp || 'â€”';
    const senhaDisplay = user.senha || 'â€”';
    const contagemDisplay = user.contagem || '0';
    const dataDisplay = user.data || 'â€”';

    return `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:12px 16px; font-size:14px; font-weight:600; color:var(--text-primary);">${user.nome}</td>
        <td style="padding:12px 16px; font-size:14px; color:var(--text-secondary);">${whatsappDisplay}</td>
        <td style="padding:12px 16px; font-size:14px; color:var(--text-secondary);">${nivelDisplay}</td>
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
          <button class="btn btn-danger btn-sm" onclick="deletarAcesso(${user._rowNumber}, '${user.whatsapp}')" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; font-size:12px; margin-left:6px; background:rgba(239, 68, 68, 0.08); color:#f87171; border:1px solid rgba(239, 68, 68, 0.2); border-radius:6px; font-weight:600; cursor:pointer; transition:var(--transition);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Excluir
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
    if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado.');

    const payload = {
      nome: user.nome,
      whatsapp: user.whatsapp,
      nivel: user.nivel,
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

    toast(`Acesso do usuÃ¡rio ${user.nome} foi ${status === 'liberado' ? 'ativado' : 'inativado'}!`, 'info');
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
  const senha = document.getElementById('acesso-senha').value;
  
  let status = 'liberado';
  if (row) {
    const user = listaAcessos.find(u => u._rowNumber === Number(row));
    if (user) {
      status = user.status;
    }
  }

  const payload = { nome, whatsapp, nivel, status, senha };
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

    toast(row ? 'UsuÃ¡rio atualizado!' : 'UsuÃ¡rio cadastrado!', 'success');
    cancelarEdicaoAcesso();
    carregarAcessos();
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
  }
}

async function deletarAcesso(rowNumber, whatsapp) {
  if (!confirm(`Deseja realmente excluir o acesso do usuÃ¡rio ${whatsapp}?`)) {
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

    toast('UsuÃ¡rio removido com sucesso!', 'info');
    carregarAcessos();
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
  }
}

// ---- MÃSCARA E ENVIAR WHATSAPP ----

function maskCelular(v) {
  v = v.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  
  if (v.length > 10) {
    return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3, 7)}-${v.substring(7)}`;
  } else if (v.length > 6) {
    return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
  } else if (v.length > 2) {
    return `(${v.substring(0, 2)}) ${v.substring(2)}`;
  } else if (v.length > 0) {
    return `(${v}`;
  }
  return v;
}

function enviarLinkWhatsApp() {
  const inputVal = document.getElementById('share-whatsapp-number').value;
  const digits = inputVal.replace(/\D/g, "");

  if (digits.length < 10) {
    toast('Por favor, informe um nÃºmero de celular vÃ¡lido com DDD.', 'error');
    return;
  }

  const phoneFormatted = digits.startsWith('55') ? digits : '55' + digits;
  const textMsg = encodeURIComponent("OlÃ¡! Segue o link de acesso ao sistema de Acompanhamento de Processos da SEDUC-RO:\n\nhttps://tinhosys.github.io/seduc-processos/");

  const url = `https://web.whatsapp.com/send?phone=${phoneFormatted}&text=${textMsg}`;
  window.open(url, 'whatsapp_tab');
}

// ---- PROCESSOS REPETIDOS ----
function renderProcessosRepetidos() {
  const badge = document.getElementById('total-repetidos-badge');
  const tbody = document.getElementById('table-repetidos-body');
  if (!tbody) return;

  const processos = carregarProcessos();

  // Agrupar processos pelo nÃºmero
  const grupos = {};
  processos.forEach(p => {
    if (!p.numero) return;
    const numClean = p.numero.trim();
    
    // Ignorar processos sem nÃºmero ou com marcaÃ§Ãµes genÃ©ricas de vazio
    if (
      numClean === "" || 
      numClean === "-" || 
      numClean === "â€”" || 
      numClean.toLowerCase() === "s/n" || 
      numClean.toLowerCase() === "s/nÂº" ||
      numClean.toLowerCase() === "s/nÂ°"
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
    badge.textContent = `${repetidos.length} NÃºmeros com OcorrÃªncias Repetidas`;
  }

  if (repetidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 14px;">
          <h3>ðŸŽ‰ Nenhum processo repetido encontrado!</h3>
          <p style="margin-top: 6px;">Todos os nÃºmeros de processos vÃ¡lidos na planilha sÃ£o Ãºnicos.</p>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  repetidos.forEach((grp, idx) => {
    const totalOcorrencias = grp.itens.length;
    const safeNumClass = grp.numero.replace(/[^a-zA-Z0-9]/g, '_');
    
    // 1. Linha Pai: Exibe apenas o botÃ£o de expansÃ£o e o nÃºmero do processo
    html += `
      <tr style="background: rgba(30, 41, 59, 0.85); border-bottom: 1px solid var(--border);">
        <td style="padding: 12px; text-align: center; cursor: pointer; user-select: none; font-size: 14px; font-weight: 900; color: var(--blue);" onclick="toggleGrupoRepetidoTabela('${grp.numero}', this)">
          âž•
        </td>
        <td colspan="6" style="padding: 12px; font-weight: 700; font-family: monospace; color: var(--text-primary); font-size: 14px;">
          NÂº PROCESSO: <span style="color: #60a5fa; letter-spacing: 0.5px;">${grp.numero}</span>
          <span style="font-size: 11px; font-weight: 700; margin-left: 12px; padding: 3px 8px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); text-transform: uppercase;">${totalOcorrencias} OcorrÃªncias</span>
        </td>
      </tr>
    `;
    
    // 2. Linhas Filhas: Listadas abaixo em linha, uma abaixo da outra
    grp.itens.forEach(p => {
      html += `
        <tr class="filha-repetido-${safeNumClass}" style="display: none; background: rgba(0, 0, 0, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.03); cursor: pointer; transition: background 0.15s;" onclick="editarProcesso('${p.id}')" title="Clique para editar este processo">
          <td style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 11px; font-weight: bold;">
            â€”
          </td>
          <td style="padding: 12px; font-weight: 600; color: var(--text-primary);">${p.prefixo || 'â€”'}</td>
          <td style="padding: 12px; color: var(--text-primary);">${p.municipio || 'â€”'}</td>
          <td style="padding: 12px; color: var(--text-primary); font-weight: 500;" title="${p.interessado || ''}">
            ${p.interessado ? (p.interessado.length > 40 ? p.interessado.substring(0, 37) + '...' : p.interessado) : 'â€”'}
          </td>
          <td style="padding: 12px; color: var(--text-secondary);" title="${p.objeto || ''}">
            ${p.objeto ? (p.objeto.length > 55 ? p.objeto.substring(0, 52) + '...' : p.objeto) : 'â€”'}
          </td>
          <td style="padding: 12px;">
            <span class="badge ${getStatusBadgeClass(p.status)}">${p.status || 'â€”'}</span>
          </td>
          <td style="padding: 12px; font-family: monospace; font-weight: 600; color: var(--green); text-align: right; padding-right: 16px;">
            R$ ${formatCurrency(p.valorOf)}
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
  
  btnElement.textContent = estaOculto ? 'âž–' : 'âž•';
}

async function excluirProcessoDireto(id) {
  if (confirm("Tem certeza de que deseja excluir este processo repetido? Esta aÃ§Ã£o nÃ£o pode ser desfeita e removerÃ¡ o registro na planilha.")) {
    try {
      await excluirProcesso(id);
      toast("Processo excluÃ­do com sucesso!", "success");
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

// ---- CONTROLE DE OCULTAR/MOSTRAR FILTROS E FORMULÃRIOS (PIN/ALFINETE) ----
function toggleFiltros() {
  const bar = document.querySelector('#page-processos .filters-bar');
  const btn = document.getElementById('btn-toggle-filtros');
  if (!bar || !btn) return;
  const isCollapsed = bar.classList.toggle('collapsed');
  
  if (isCollapsed) {
    btn.innerHTML = 'ðŸ“Œ <span class="btn-text">Mostrar Filtros</span>';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
    localStorage.setItem('filters_collapsed', '1');
  } else {
    btn.innerHTML = 'ðŸ“Œ <span class="btn-text">Ocultar Filtros</span>';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = '';
    localStorage.removeItem('filters_collapsed');
  }
}

function toggleFormAcesso() {
  const card = document.getElementById('card-form-acesso');
  const btn = document.getElementById('btn-toggle-form-acesso');
  if (!card || !btn) return;
  const isCollapsed = card.classList.toggle('collapsed');
  
  if (isCollapsed) {
    btn.innerHTML = 'ðŸ“Œ <span class="btn-text">Mostrar</span>';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
    localStorage.setItem('form_acesso_collapsed', '1');
  } else {
    btn.innerHTML = 'ðŸ“Œ <span class="btn-text">Ocultar</span>';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = '';
    localStorage.removeItem('form_acesso_collapsed');
  }
}

function toggleFormProcesso() {
  const card = document.getElementById('card-form-processo');
  const btn = document.getElementById('btn-toggle-form-processo');
  if (!card || !btn) return;
  const isCollapsed = card.classList.toggle('collapsed');
  
  if (isCollapsed) {
    btn.innerHTML = 'ðŸ“Œ <span class="btn-text">Mostrar FormulÃ¡rio</span>';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
  } else {
    btn.innerHTML = 'ðŸ“Œ <span class="btn-text">Ocultar FormulÃ¡rio</span>';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = '';
  }
}

async function recarregarDadosGlobais() {
  toast('Recarregando dados do servidor...', 'info');
  try {
    await inicializarDados();
    toast('Dados atualizados com sucesso!', 'success');
    
    // Atualizar tela atual
    if (state.page === 'dashboard') renderDashboard();
    else if (state.page === 'processos') renderProcessos();
    else if (state.page === 'repetidos') renderProcessosRepetidos();
    else if (state.page === 'acessos') carregarAcessos();
    
    // Atualizar contador sidebar
    if (typeof atualizarContador === 'function') atualizarContador();
  } catch (err) {
    console.error(err);
    toast('Erro ao recarregar dados.', 'error');
  }
}

// InicializaÃ§Ã£o dos estados colapsados de acordo com tela (mobile ou localStorage)
function inicializarEstadosColapsaveis() {
  const isMobile = window.innerWidth <= 768;
  
  // 1. Filtros
  const savedFiltersCollapse = localStorage.getItem('filters_collapsed');
  const bar = document.querySelector('#page-processos .filters-bar');
  const btnFilters = document.getElementById('btn-toggle-filtros');
  if (bar && btnFilters) {
    if (savedFiltersCollapse === '1' || (savedFiltersCollapse === null && isMobile)) {
      bar.classList.add('collapsed');
      btnFilters.innerHTML = 'ðŸ“Œ <span class="btn-text">Mostrar Filtros</span>';
      btnFilters.style.borderColor = 'var(--blue)';
      btnFilters.style.color = 'var(--blue)';
    }
  }
  
  // 2. FormulÃ¡rio Acessos
  const savedAcessosCollapse = localStorage.getItem('form_acesso_collapsed');
  const cardAcessos = document.getElementById('card-form-acesso');
  const btnAcessos = document.getElementById('btn-toggle-form-acesso');
  if (cardAcessos && btnAcessos) {
    if (savedAcessosCollapse === '1' || (savedAcessosCollapse === null && isMobile)) {
      cardAcessos.classList.add('collapsed');
      btnAcessos.innerHTML = 'ðŸ“Œ <span class="btn-text">Mostrar</span>';
      btnAcessos.style.borderColor = 'var(--blue)';
      btnAcessos.style.color = 'var(--blue)';
    }
  }
}

// Chamar inicializaÃ§Ã£o no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  inicializarEstadosColapsaveis();
});

window.toggleFiltros = toggleFiltros;
window.toggleFormAcesso = toggleFormAcesso;
window.toggleFormProcesso = toggleFormProcesso;
window.recarregarDadosGlobais = recarregarDadosGlobais;

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
    if (val === 'F') return '#3b82f6'; // Fomento - Solid Blue
    if (val === 'C') return '#10b981'; // ConvÃªnio - Solid Green
    if (val === 'O' || val === 'T') return '#8b5cf6'; // Termo de CooperaÃ§Ã£o - Solid Purple
  } else if (group === 'tipo') {
    if (val === 'OB') return '#06b6d4'; // Obras - Solid Cyan
    if (val === 'MP') return '#f97316'; // Mat. Permanente - Solid Orange
    if (val === 'MC') return '#f59e0b'; // Mat. Consumo - Solid Yellow/Amber
    if (val === 'SI') return '#a855f7'; // Sistema - Solid Purple
    if (val === 'TR') return '#10b981'; // Treinamento - Solid Emerald
    if (val === 'OUT') return '#f43f5e'; // Outros - Solid Rose
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
    return `<span class="badge-cat badge-cat-c" title="Categoria: ConvÃªnio" style="margin-left: 4px; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">C</span>`;
  }
  if (char === 'O') {
    return `<span class="badge-cat badge-cat-o" title="Categoria: Outro" style="margin-left: 4px; padding: 2px 6px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">O</span>`;
  }
  if (char === 'T') {
    return `<span class="badge-cat badge-cat-t" title="Categoria: Termo de CooperaÃ§Ã£o" style="margin-left: 4px; padding: 2px 6px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">T</span>`;
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
window.getCategoryBadge = getCategoryBadge;
window.getTypeBadge = getTypeBadge;

// ============================================================
// MÃ“DULO: ESCOLAS (ADM ONLY)
// ============================================================

var _escolasCache = [];         // Todos os dados carregados
var _escolasFiltradas = [];     // Dados apÃ³s filtros
var _escolasPaginaAtual = 1;
var _escolasItensPorPagina = 50;

// Inicializa a pÃ¡gina
function iniciarPaginaEscolas() {
  if (_escolasCache.length > 0) {
    _escolasAtualizarUI();
    return;
  }
  buscarEscolasSheet(true);
}

// Recarrega forÃ§ando nova busca
function recarregarEscolas() {
  _escolasCache = [];
  _escolasFiltradas = [];
  buscarEscolasSheet(false);
}

// Busca dados da aba "escolas" via API Backend
async function buscarEscolasSheet(silencioso) {
  const emptyEl = document.getElementById('escolas-empty');
  const tableWrap = document.getElementById('escolas-table-wrap');
  
  if (!silencioso) showToast("Buscando dados das escolas...", "info");
  
  try {
    const res = await fetch(API_BASE + '/api/escolas', { headers: getHeaders() });
    if (!res.ok) throw new Error('Status ' + res.status);
    const data = await res.json();

    _escolasCache = data.rows || [];
    
    if (!silencioso) showToast(_escolasCache.length + " escolas carregadas!", "success");

    _escolasPopularFiltros();
    _escolasFiltradas = [..._escolasCache];
    _escolasPaginaAtual = 1;
    _escolasAtualizarUI();
  } catch (err) {
    console.error('[Escolas]', err);
    showToast("Erro ao buscar escolas: " + err.message, "error");
    _escolasEsconderTabela();
  }
}

// Parser CSV com suporte a campos entre aspas
function _parseCsvEscolas(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const fields = [];
    let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === ',' && !inQuote) {
        fields.push(cur); cur = '';
      } else { cur += ch; }
    }
    fields.push(cur);
    rows.push(fields);
  }
  return rows;
}

// Popula selects de filtro
function _escolasPopularFiltros() {
  const selMun = document.getElementById('escolas-filtro-municipio');
  const selLoc = document.getElementById('escolas-filtro-localizacao');
  if (!selMun || !selLoc) return;
  const municipios   = [...new Set(_escolasCache.map(e => e.municipio).filter(Boolean))].sort();
  const localizacoes = [...new Set(_escolasCache.map(e => e.localizacao).filter(Boolean))].sort();
  selMun.innerHTML = '<option value="">MunicÃ­pio</option>' + municipios.map(m => '<option value="' + m + '">' + m + '</option>').join('');
  selLoc.innerHTML = '<option value="">LocalizaÃ§Ã£o</option>' + localizacoes.map(l => '<option value="' + l + '">' + l + '</option>').join('');
}

// Aplica filtros
function filtrarEscolas() {
  const busca = normalizar(document.getElementById('escolas-busca')?.value || '');
  const mun   = document.getElementById('escolas-filtro-municipio')?.value || '';
  const loc   = document.getElementById('escolas-filtro-localizacao')?.value || '';
  _escolasFiltradas = _escolasCache.filter(e => {
    if (mun && e.municipio !== mun) return false;
    if (loc && e.localizacao !== loc) return false;
    if (busca) {
      const texto = normalizar([e.nome, e.municipio, e.codigoInep, e.super, e.bairro].join(' '));
      if (!texto.includes(busca)) return false;
    }
    return true;
  });
  _escolasPaginaAtual = 1;
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

// Limpa filtros
function limparFiltrosEscolas() {
  ['escolas-busca', 'escolas-filtro-municipio', 'escolas-filtro-localizacao'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _escolasFiltradas = [..._escolasCache];
  _escolasPaginaAtual = 1;
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

// Atualiza toda a UI
function _escolasAtualizarUI() {
  const temDados  = _escolasCache.length > 0;
  const filtrosEl = document.getElementById('escolas-filtros');
  const tableWrap = document.getElementById('escolas-table-wrap');
  const pagination = document.getElementById('escolas-pagination');
  const badgeEl   = document.getElementById('escolas-badge');
  const emptyEl   = document.getElementById('escolas-empty');

  if (filtrosEl) filtrosEl.style.display  = temDados ? 'flex' : 'none';
  if (tableWrap) tableWrap.style.display  = temDados ? '' : 'none';
  if (pagination) pagination.style.display = temDados ? '' : 'none';
  if (emptyEl) emptyEl.style.display      = temDados ? 'none' : 'block';

  if (!temDados) return;
  if (badgeEl) badgeEl.textContent = 'ðŸ« ' + _escolasCache.length.toLocaleString('pt-BR') + ' Escolas';
  if (_escolasFiltradas.length === 0) _escolasFiltradas = [..._escolasCache];
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}
function inserirDataHoje() {
  const dateInput = document.getElementById('form-data');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }
}
window.inserirDataHoje = inserirDataHoje;


// ============================================================
// SEDUC â€” Gerador de ManifestaÃ§Ã£o TÃ©cnica & RelatÃ³rio SintÃ©tico TCE-RO
// ============================================================


// ============================================================
// SEDUC â€” Gerador de ManifestaÃ§Ã£o TÃ©cnica & RelatÃ³rio A4/PDF (TCE-RO)
// ============================================================

window._manifestoProcessoAtual = null;

function gerarTextoManifestoTCE(p) {
  p = p || {};

  const municipio = p.municipio || 'MunicÃ­pio nÃ£o informado';
  const interessado = p.interessado || 'Unidade Escolar / Conselho Escolar';
  const numeroProcesso = p.numero || 'Sem nÃºmero';
  const oficioNum = p.oficioNumero || 'XX - XXX';
  
  let diretorNome = 'XXX';
  if (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache)) {
    const esc = _escolasCache.find(e => 
      (e.nome && p.interessado && e.nome.toLowerCase().includes(p.interessado.toLowerCase())) ||
      (e.municipio && p.municipio && e.municipio.toLowerCase() === p.municipio.toLowerCase())
    );
    if (esc && esc.diretor) diretorNome = esc.diretor;
  }

  const tipoCod = (p.tipo || '').toUpperCase();
  const tipoDesc = {
    'OB': 'Obras e Infraestrutura FÃ­sica',
    'MP': 'AquisiÃ§Ã£o de Material Permanente',
    'MC': 'AquisiÃ§Ã£o de Material de Consumo',
    'SI': 'Sistemas e Tecnologias da InformaÃ§Ã£o',
    'TR': 'Treinamento e CapacitaÃ§Ã£o',
    'OU': 'Outros Investimentos'
  }[tipoCod] || p.tipo || 'Investimento em Infraestrutura/Material';

  let detalheObj = '';
  if (p.detalhamentoItens && p.detalhamentoItens.trim()) {
    detalheObj = p.detalhamentoItens.trim();
  } else {
    let partes = [];
    if (p.objeto) partes.push(p.objeto);
    if (p.metragemM2) partes.push('metragem aproximada de ' + p.metragemM2 + ' mÂ²');
    if (p.qtdeSala) partes.push(p.qtdeSala + ' salas de aula');
    if (p.auditorio) partes.push('auditÃ³rio (' + (p.tipoAuditorio || 'padrÃ£o') + ')');
    if (p.quadra) partes.push('quadra (' + p.quadra + ')');
    if (p.refeitorio) partes.push('refeitÃ³rio (' + p.refeitorio + ')');
    if (p.banheiros) partes.push('instalaÃ§Ãµes sanitÃ¡rias (' + p.banheiros + ')');
    detalheObj = partes.length > 0 ? partes.join(', ') : (tipoDesc.toLowerCase() + ', compreendendo mobiliÃ¡rios, equipamentos e adequaÃ§Ãµes necessÃ¡rias');
  }

  let textoObjetoConstruido = '';
  if (tipoCod === 'OB' && p.metragemM2) {
    textoObjetoConstruido = 'a execuÃ§Ã£o de obras/serviÃ§os de engenharia com metragem total de ' + p.metragemM2 + ' mÂ², abrangendo ' + detalheObj;
  } else {
    textoObjetoConstruido = (p.objeto ? p.objeto.toLowerCase() : 'aquisiÃ§Ã£o e instalaÃ§Ã£o de materiais') + ', compreendendo ' + detalheObj;
  }

  const dataAtualExtenso = new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});

  return `ManifestaÃ§Ã£o

A legislaÃ§Ã£o educacional brasileira, em seus diversos nÃ­veis, estabelece um complexo de deveres e colaboraÃ§Ãµes para a garantia do direito Ã  educaÃ§Ã£o. A ConstituiÃ§Ã£o Federal, em seu artigo 205, consagra a educaÃ§Ã£o como um direito de todos e um dever do Estado e da famÃ­lia, a ser promovida com a colaboraÃ§Ã£o da sociedade, visando o pleno desenvolvimento da pessoa, seu preparo para a cidadania e sua qualificaÃ§Ã£o para o trabalho. Complementarmente, o artigo 30, inciso VI, atribui aos municÃ­pios a competÃªncia para manter, com a cooperaÃ§Ã£o tÃ©cnica e financeira da UniÃ£o e do Estado, programas de educaÃ§Ã£o infantil e de ensino fundamental. O regime de colaboraÃ§Ã£o entre os entes federados Ã© reforÃ§ado pelo artigo 211, Â§ 4Âº, que determina a definiÃ§Ã£o de formas de colaboraÃ§Ã£o entre UniÃ£o, Estados, Distrito Federal e MunicÃ­pios para assegurar a universalizaÃ§Ã£o do ensino obrigatÃ³rio.

A Lei de Diretrizes e Bases da EducaÃ§Ã£o Nacional (Lei nÂº 9.394/1996) reitera e detalha essa estrutura colaborativa, estabelecendo em seu artigo 8Âº que a UniÃ£o, os Estados, o Distrito Federal e os MunicÃ­pios organizarÃ£o, em regime de colaboraÃ§Ã£o, seus respectivos sistemas de ensino. O artigo 10 da mesma lei incumbe os Estados de organizar, manter e desenvolver os Ã³rgÃ£os e instituiÃ§Ãµes oficiais de seus sistemas de ensino, definindo, com os MunicÃ­pios, formas de colaboraÃ§Ã£o na oferta do ensino fundamental (inciso II), e de baixar normas complementares para seu sistema de ensino (inciso VI).

A Lei nÂº 14.113/2020, que regulamenta o Fundeb, fortalece a cooperaÃ§Ã£o entre os entes federativos. O artigo 14, Â§ 1Âº, inciso IV, condiciona o recebimento de complementaÃ§Ã£o de recursos federais Ã  existÃªncia de um regime de colaboraÃ§Ã£o entre Estado e MunicÃ­pios formalizado na legislaÃ§Ã£o estadual. Ademais, o artigo 50, em seu parÃ¡grafo Ãºnico, estabelece que a UniÃ£o, os Estados e o Distrito Federal desenvolverÃ£o, em regime de colaboraÃ§Ã£o, programas de apoio para a conclusÃ£o da educaÃ§Ã£o bÃ¡sica por alunos matriculados no sistema pÃºblico.

No Ã¢mbito estadual, a ConstituiÃ§Ã£o do Estado de RondÃ´nia, em seus artigos 187 e 188, detalha as responsabilidades do poder pÃºblico com a educaÃ§Ã£o, estabelecendo que o ensino serÃ¡ ministrado com base em princÃ­pios como a igualdade de condiÃ§Ãµes para o acesso e permanÃªncia na escola e a gestÃ£o democrÃ¡tica do ensino pÃºblico, e define as atribuiÃ§Ãµes do sistema estadual de ensino.

Ainda no Ã¢mbito estadual, a Lei nÂº. 5.735/2024 institui o Programa de AlfabetizaÃ§Ã£o do Estado de RondÃ´nia, em regime de colaboraÃ§Ã£o com os municÃ­pios, cabendo ao Estado prestar cooperaÃ§Ã£o tÃ©cnica e financeira aos municÃ­pios. Dentre os eixos do programa, hÃ¡ o Eixo 2 que trata da infraestrutura fÃ­sica e pedagÃ³gica. Desta feita, compulsando o OfÃ­cio ${oficioNum}, s.m.j., verifica-se que o objeto proposto consiste na ${textoObjetoConstruido}, destinados Ã  organizaÃ§Ã£o, equipagem e melhoria dos espaÃ§os pedagÃ³gicos da unidade escolar, visando aprimorar as condiÃ§Ãµes de trabalho dos profissionais da educaÃ§Ã£o e qualificar os espaÃ§os escolares, por meio da disponibilizaÃ§Ã£o de mobiliÃ¡rio e equipamentos adequados, contribuindo para o fortalecimento das prÃ¡ticas pedagÃ³gicas e assegurando maior organizaÃ§Ã£o, conforto, seguranÃ§a e funcionalidade aos ambientes educacionais.

Em atendimento Ã  solicitaÃ§Ã£o do(a) Sr(a). ${diretorNome}, Diretora/Presidente do Conselho Escolar, nos termos do OfÃ­cio ${oficioNum}, manifestamo-nos favoravelmente Ã  solicitaÃ§Ã£o do municÃ­pio, no que tange ao regime de colaboraÃ§Ã£o regulamentado pela Lei Estadual nÂº. 5.735/2024.

Nestes termos, submeto os autos Ã  apreciaÃ§Ã£o superior, para deliberaÃ§Ã£o acerca da oportunidade e conveniÃªncia administrativa.

Porto Velho - RO, ${dataAtualExtenso}.`;
}

function gerarRelatorioMonitoramento() {
  var g  = function(id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
  var gb = function(id) { var el = document.getElementById(id); return el ? el.checked : false; };

  // NÃºmeros do processo (campo mÃºltiplo)
  var inputsNum  = Array.from(document.querySelectorAll('input[name="numero[]"]'));
  var numeroProc = inputsNum.map(function(i){ return i.value.trim(); }).filter(Boolean).join(', ') || 'Sem nÃºmero';

  // Valores financeiros
  var parseMon = function(v) {
    if (!v) return 0;
    var s = String(v).replace(/[R$\s]/g,'').replace(/\./g,'').replace(',','.');
    return parseFloat(s) || 0;
  };
  var valPlan = (typeof parseCurrency === 'function') ? parseCurrency(g('form-valorPlan')) : parseMon(g('form-valorPlan'));
  var valOf   = (typeof parseCurrency === 'function') ? parseCurrency(g('form-valorOf'))   : parseMon(g('form-valorOf'));

  // Categoria / Tipo (segment buttons)
  var catEl  = document.querySelector('#control-categoria .segment-btn.active') || {};
  var tipoEl = document.querySelector('#control-tipo .segment-btn.active')      || {};

  // Montar objeto com TODOS os campos das duas abas
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

  // Complementar com dados jÃ¡ salvos se estiver editando
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

  // Gerar PDF diretamente (sem modal intermediÃ¡rio)
  window._manifestoProcessoAtual = p;
  imprimirManifestoTCE();
}

// Compatibilidade com referÃªncias antigas
function gerarEExibirManifestoTCEAtual() {
  gerarRelatorioMonitoramento();
}
function abrirModalManifestoTCEById(id) {
  const p = (state.processos || []).find(item => item.id === id);
  if (!p) {
    if (typeof toast === 'function') toast('Processo nÃ£o encontrado para gerar manifesto', 'error');
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
    if (typeof toast === 'function') toast('Texto da ManifestaÃ§Ã£o TCE-RO copiado para a Ã¡rea de transferÃªncia!', 'success');
  }).catch(() => {
    if (typeof toast === 'function') toast('Erro ao copiar texto', 'error');
  });
}

function imprimirManifestoTCE() {
  var p = window._manifestoProcessoAtual || {};

  var ff = function(v) { return (v && String(v).trim()) ? String(v).trim() : ''; };
  var fv = function(v) {
    var n = parseFloat(String(v || 0).replace(/[R$\s]/g,'').replace(/\./g,'').replace(',','.'));
    return (n > 0) ? 'R$&nbsp;' + n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '';
  };
  var isOn = function(v) { return v===true||v===1||v==='1'||v==='true'; };

  var today     = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'});
  var todayLong = new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'});

  var numero    = ff(p.numero)      || 'S/N';
  var municipio = ff(p.municipio)   || '&mdash;';
  var escola    = ff(p.interessado) || '&mdash;';
  var objeto    = ff(p.objeto)      || '&mdash;';
  var ano       = ff(p.ano);
  var agrup     = ff(p.agrupamento);
  var dataProc  = ff(p.data) ? new Date(p.data+'T12:00:00').toLocaleDateString('pt-BR') : '';
  var status    = ff(p.status);
  var obs       = ff(p.obs);
  var detItens  = ff(p.detalhamentoItens);
  var demaisObs = ff(p.demaisObservacoes);
  var valorOf   = fv(p.valorOf);
  var valorPlan = fv(p.valorPlan);

  var categMap = {FO:'Fomento',CV:'Conv&ecirc;nio',TC:'Termo de Coopera&ccedil;&atilde;o'};
  var tipoMap  = {OB:'Obras',MP:'Mat. Permanente',MC:'Mat. Consumo',SI:'Sistema',TR:'Treinamento',OU:'Outros'};
  var categ = categMap[ff(p.categoria)] || ff(p.categoria) || '&mdash;';
  var tipo  = tipoMap[(ff(p.tipo)||'').toUpperCase()] || ff(p.tipo) || '&mdash;';

  var simNao = function(v) {
    return isOn(v)
      ? '<span style="color:#15803d;font-weight:700">&#10004; Sim</span>'
      : '<span style="color:#dc2626;font-weight:700">&#10008; N&atilde;o</span>';
  };

  // Infraestrutura em linha
  var infra = [];
  if (ff(p.qtdeSala))   infra.push('<b>'+ff(p.qtdeSala)+'</b> sala(s) &ndash; '+( ff(p.tipoSala)||'padr&atilde;o'));
  if (ff(p.auditorio))  infra.push('Audit&oacute;rio: '+ff(p.auditorio)+(ff(p.tipoAuditorio)?' ('+ff(p.tipoAuditorio)+')':''));
  if (ff(p.quadra))     infra.push('Quadra: '+ff(p.quadra));
  if (ff(p.patio))      infra.push('P&aacute;tio: '+ff(p.patio));
  if (ff(p.refeitorio)) infra.push('Refeit&oacute;rio: '+ff(p.refeitorio));
  if (ff(p.banheiros))  infra.push('Banheiros: '+ff(p.banheiros));
  if (ff(p.metragemM2)) infra.push('Metragem: <b>'+ff(p.metragemM2)+'</b>');
  var infraTxt = infra.join(' &nbsp;&bull;&nbsp; ');

  // Diretor
  var diretor = '';
  if (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache)) {
    var esc = _escolasCache.find(function(e){
      return (e.nome&&p.interessado&&e.nome.toLowerCase().includes(p.interessado.toLowerCase()))||
             (e.municipio&&p.municipio&&e.municipio.toLowerCase()===p.municipio.toLowerCase());
    });
    if (esc && esc.diretor) diretor = esc.diretor;
  }

  // Texto legal simplificado (construÃ­do com entidades HTML para evitar encoding)
  var textoLegal =
    'A legisla&ccedil;&atilde;o brasileira, em especial a Constitui&ccedil;&atilde;o Federal (arts.&nbsp;205 e 211), a Lei de Diretrizes e Bases da Educa&ccedil;&atilde;o (Lei n&ordm;&nbsp;9.394/1996) e a Lei do Fundeb (Lei n&ordm;&nbsp;14.113/2020), consagram o regime de colabora&ccedil;&atilde;o entre os entes federados para a garantia do direito &agrave; educa&ccedil;&atilde;o de qualidade. No &acirc;mbito estadual, a Lei n&ordm;&nbsp;5.735/2024 institui o Programa de Alfabetiza&ccedil;&atilde;o de Rond&ocirc;nia em coopera&ccedil;&atilde;o com os munic&iacute;pios, contemplando o Eixo 2 de infraestrutura f&iacute;sica e pedag&oacute;gica.' +
    '<br><br>' +
    'Compulsando os autos, verifica-se que o objeto proposto &mdash; <em>'+objeto+'</em> &mdash;, destinado &agrave; unidade escolar <strong>'+escola+'</strong>, munic&iacute;pio de <strong>'+municipio+'</strong>, visa aprimorar as condi&ccedil;&otilde;es pedag&oacute;gicas e estruturais, em conformidade com o regime de colabora&ccedil;&atilde;o regulamentado pela Lei Estadual n&ordm;&nbsp;5.735/2024. Diante do exposto, manifestamo-nos <strong>favoravelmente</strong> &agrave; solicita&ccedil;&atilde;o, submetendo os autos &agrave; aprecia&ccedil;&atilde;o superior para delibera&ccedil;&atilde;o acerca da oportunidade e conveni&ecirc;ncia administrativa.';

  // â”€â”€ HTML FINAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  var css =
    '@page{size:A4 portrait;margin:12mm 14mm 12mm 16mm}' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    'body{font-family:"Times New Roman",Times,serif;font-size:9pt;color:#1a1a1a;background:#fff;line-height:1.4}' +
    // Header
    '.hdr{display:flex;align-items:flex-start;gap:10px;border-bottom:3px solid #1a3a6b;padding-bottom:8px;margin-bottom:10px}' +
    '.logo{width:40px;height:40px;min-width:40px;border-radius:50%;background:linear-gradient(135deg,#1a3a6b,#0d265c);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:10pt;font-family:Arial,sans-serif}' +
    '.hdr-txt{flex:1}' +
    '.hdr-gov{font-size:6.5pt;color:#555;text-transform:uppercase;letter-spacing:.5px;font-family:Arial,sans-serif}' +
    '.hdr-sec{font-size:10pt;font-weight:800;color:#1a3a6b;text-transform:uppercase;font-family:Arial,sans-serif}' +
    '.hdr-dep{font-size:7pt;color:#666;font-family:Arial,sans-serif}' +
    // Auth box (top right)
    '.auth-box{min-width:130px;background:#f8faff;border:1px solid #c7d2fe;border-radius:5px;padding:5px 10px;font-family:Arial,sans-serif;font-size:7.5pt}' +
    '.auth-box .auth-title{font-weight:800;color:#1a3a6b;font-size:7pt;text-transform:uppercase;border-bottom:1px solid #c7d2fe;padding-bottom:3px;margin-bottom:4px;letter-spacing:.4px}' +
    '.auth-row{display:flex;justify-content:space-between;gap:6px;margin-bottom:2px}' +
    '.auth-row span:first-child{color:#444;font-weight:600}' +
    // Title bar
    '.tbar{background:linear-gradient(135deg,#1a3a6b,#0d265c);color:#fff;text-align:center;padding:6px 12px;border-radius:4px;margin-bottom:8px;font-size:9.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.6px;font-family:Arial,sans-serif}' +
    // Proc info strip
    '.proc-strip{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px;font-size:7.5pt;font-family:Arial,sans-serif;color:#333;border-bottom:1px solid #ddd;padding-bottom:6px}' +
    '.ps-item{display:flex;gap:4px;align-items:center}' +
    '.ps-label{font-weight:700;color:#1a3a6b}' +
    // Section
    '.sec-title{font-size:8pt;font-weight:800;color:#1a3a6b;text-transform:uppercase;letter-spacing:.5px;border-left:3px solid #1a3a6b;padding-left:6px;margin:9px 0 4px;font-family:Arial,sans-serif}' +
    // Table
    '.dt{width:100%;border-collapse:collapse;font-size:8.5pt}' +
    '.dt th,.dt td{border:1px solid #c8d3e8;padding:3.5px 8px;vertical-align:top}' +
    '.dt th{background:#eef2ff;font-weight:700;color:#1a3a6b;width:30%;white-space:nowrap;font-family:Arial,sans-serif;font-size:8pt}' +
    '.dt tr:nth-child(even) td{background:#f8faff}' +
    // Valor
    '.vbox{display:inline-block;background:#f0f9ff;border:1px solid #93c5fd;border-radius:3px;padding:1px 7px;font-weight:700;color:#0c4a6e;font-family:Arial,sans-serif;font-size:8.5pt}' +
    // Infra pill
    '.infra{background:#f0fdf4;border:1px solid #86efac;border-radius:3px;padding:5px 8px;font-size:8pt;color:#1a3a1a;line-height:1.6;font-family:Arial,sans-serif}' +
    // Det / Obs
    '.det{background:#fffbf0;border-left:3px solid #f59e0b;padding:5px 8px;font-size:8.5pt;white-space:pre-wrap;line-height:1.4;margin-bottom:4px}' +
    '.obs-b{background:#f0fdf4;border-left:3px solid #16a34a;padding:5px 8px;font-size:8.5pt;white-space:pre-wrap;line-height:1.4;margin-bottom:4px}' +
    // Legal text
    '.legal{font-size:9pt;line-height:1.55;text-align:justify;text-indent:1.2cm;margin-bottom:4px;color:#1a1a1a}' +
    '.legal-box{border-top:1px solid #ccc;padding-top:7px;margin-top:9px}' +
    // Signature
    '.sig{margin-top:12px;display:flex;justify-content:space-between;align-items:flex-end;font-family:Arial,sans-serif}' +
    '.sig-city{font-size:8pt;color:#333}' +
    '.sig-box{text-align:center;min-width:230px}' +
    '.sig-line{border-top:1px solid #333;margin:0 16px 4px}' +
    '.sig-name{font-size:8pt;font-weight:700;color:#1a1a1a}' +
    '.sig-role{font-size:7pt;color:#555}' +
    // Footer
    '.ft{margin-top:9px;border-top:2px solid #1a3a6b;padding-top:4px;display:flex;justify-content:space-between;align-items:center;font-size:6.5pt;color:#666;font-family:Arial,sans-serif}' +
    '.ft-logo{font-weight:800;color:#1a3a6b;font-size:7.5pt}' +
    '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';

  var h = '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n' +
    '<title>Relat&oacute;rio de Monitoramento &mdash; ' + numero + '</title>\n' +
    '<style>' + css + '</style>\n</head>\n<body>\n';

  // â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  h += '<div class="hdr">';
  h += '<div class="logo">RO</div>';
  h += '<div class="hdr-txt">';
  h += '<div class="hdr-gov">Governo do Estado de Rond&ocirc;nia</div>';
  h += '<div class="hdr-sec">Secretaria de Estado da Educa&ccedil;&atilde;o &mdash; SEDUC-RO</div>';
  h += '<div class="hdr-dep">Coordenadoria de Articula&ccedil;&atilde;o com os Munic&iacute;pios &mdash; CAM / GDSM</div>';
  h += '</div>';

  // AUTH BOX â€” top right
  h += '<div class="auth-box">';
  h += '<div class="auth-title">&#128274; Autoriza&ccedil;&atilde;o</div>';
  h += '<div class="auth-row"><span>CAM:</span>' + simNao(p.cam) + '</div>';
  h += '<div class="auth-row"><span>Gabinete:</span>' + simNao(p.gab) + '</div>';
  h += '<div class="auth-row"><span>Casa Civil:</span>' + simNao(p.cc) + '</div>';
  h += '</div>';
  h += '</div>'; // end hdr

  // â”€â”€ TITLE BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  h += '<div class="tbar">&#128202; Relat&oacute;rio de Monitoramento &mdash; SEDUC / CAM</div>';

  // â”€â”€ PROCESS STRIP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  h += '<div class="proc-strip">';
  h += '<div class="ps-item"><span class="ps-label">Proc.&nbsp;N&ordm;</span><strong>' + numero + '</strong></div>';
  h += '<div class="ps-item"><span class="ps-label">Munic&iacute;pio:</span>' + municipio + '</div>';
  h += '<div class="ps-item"><span class="ps-label">Categoria:</span>' + categ + '</div>';
  h += '<div class="ps-item"><span class="ps-label">Tipo:</span>' + tipo + '</div>';
  if (status) h += '<div class="ps-item"><span class="ps-label">Status:</span>' + status + '</div>';
  if (ano)    h += '<div class="ps-item"><span class="ps-label">Ano:</span>' + ano + '</div>';
  if (agrup)  h += '<div class="ps-item"><span class="ps-label">Agrup.:</span>' + agrup + '</div>';
  if (dataProc) h += '<div class="ps-item"><span class="ps-label">Data:</span>' + dataProc + '</div>';
  h += '<div class="ps-item"><span class="ps-label">Emiss&atilde;o:</span>' + today + '</div>';
  h += '</div>';

  // â”€â”€ IDENTIFICATION TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  h += '<div class="sec-title">&#128194; Identifica&ccedil;&atilde;o do Processo</div>';
  h += '<table class="dt">';
  h += '<tr><th>Entidade / Escola</th><td><strong>' + escola + '</strong></td></tr>';
  if (diretor) h += '<tr><th>Diretor(a)</th><td>' + diretor + '</td></tr>';
  h += '<tr><th>Objeto</th><td>' + objeto + '</td></tr>';
  if (valorOf || valorPlan) {
    h += '<tr><th>Valores</th><td>';
    if (valorOf)   h += 'Oficial: <span class="vbox">' + valorOf + '</span>';
    if (valorOf && valorPlan) h += ' &nbsp;&nbsp; ';
    if (valorPlan) h += 'Planilha: <span class="vbox">' + valorPlan + '</span>';
    h += '</td></tr>';
  }
  h += '</table>';

  // â”€â”€ INFRAESTRUTURA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (infraTxt) {
    h += '<div class="sec-title">&#127979; Infraestrutura</div>';
    h += '<div class="infra">' + infraTxt + '</div>';
  }

  // â”€â”€ ITENS SOLICITADOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (detItens) {
    h += '<div class="sec-title">&#128230; Itens Solicitados</div>';
    h += '<div class="det">' + detItens + '</div>';
  }

  // â”€â”€ OBSERVAÃ‡Ã•ES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  var obsAll = [obs, demaisObs].filter(Boolean).join('\n');
  if (obsAll) {
    h += '<div class="sec-title">&#128221; Observa&ccedil;&otilde;es</div>';
    h += '<div class="obs-b">' + obsAll + '</div>';
  }

  // â”€â”€ TEXTO LEGAL SIMPLIFICADO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  h += '<div class="legal-box">';
  h += '<div class="sec-title">&#9878;&#65039; Manifesta&ccedil;&atilde;o Fundamentada</div>';
  h += '<p class="legal">' + textoLegal + '</p>';
  h += '</div>';

  // â”€â”€ ASSINATURA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  h += '<div class="sig">';
  h += '<div class="sig-city">Porto Velho &ndash; RO, ' + todayLong + '</div>';
  h += '<div class="sig-box"><div class="sig-line"></div>';
  h += '<div class="sig-name">Coordenadoria de Articula&ccedil;&atilde;o com os Munic&iacute;pios (CAM)</div>';
  h += '<div class="sig-role">SEDUC-RO / Governo do Estado de Rond&ocirc;nia</div>';
  h += '</div></div>';

  // â”€â”€ RODAPÃ‰ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  h += '<div class="ft">';
  h += '<span class="ft-logo">SEDUC-RO &middot; CAM</span>';
  h += '<span>Relat&oacute;rio Gerencial de Monitoramento &mdash; Lei Est. n&ordm;&nbsp;5.735/2024 &mdash; Regime de Colabora&ccedil;&atilde;o</span>';
  h += '<span>' + today + '</span>';
  h += '</div>';

  h += '</body></html>';

  var win = window.open('', '_blank');
  if (!win) { alert('Permita popups para gerar o relat\u00f3rio.'); return; }
  win.document.write(h);
  win.document.close();
}
window.gerarTextoManifestoTCE         = gerarTextoManifestoTCE;
window.gerarEExibirManifestoTCEAtual  = gerarEExibirManifestoTCEAtual;
window.gerarRelatorioMonitoramento    = gerarRelatorioMonitoramento;
window.abrirModalManifestoTCEById     = abrirModalManifestoTCEById;
window.abrirModalManifestoTCE         = abrirModalManifestoTCE;
window.fecharModalManifestoTCE        = fecharModalManifestoTCE;
window.copiarManifestoTCE             = copiarManifestoTCE;
window.imprimirManifestoTCE           = imprimirManifestoTCE;

