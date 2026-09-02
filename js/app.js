
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
    escolas: '�� Escolas',
    'mapa-escolas': '��️ Mapa de Escolas de Rondônia',
    'todas-escolas': '�� Todas as Escolas'
  };
  document.getElementById('topbar-title').textContent = titles[pagina] || pagina;

  // Atualizar conteúdo
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
  if (pagina === 'todas-escolas') iniciarPaginaTodasEscolas();
  if (pagina === 'orcamento' && typeof carregarOrcamento === 'function') carregarOrcamento();
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
             onmouseout="this.style.background='rgba(59,130,246,0.15)'">�� VER</a>
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

  // Tabela
  const tbody = document.getElementById('table-processos');
  const busca = state.filtros.busca;

  tbody.innerHTML = pagina.map(p => `
    <tr onclick="abrirDetalhe('${p.id}')" class="${p.alerta === '1' ? 'linha-alerta' : ''} ${p.marca === '1' || p.marca === 'SIM' ? 'linha-marcada' : ''} process-row ${p.CAM === '1' && p.GAB === '1' && p.CC === '1' ? 'border-autorizado' : 'border-pendente'}">
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
            ${p.marca === '1' || p.marca === 'SIM' ? '<span class="badge-marca" title="Processo Marcado - Ver Observações" style="margin-left:4px; font-size:12px; line-height: 1; flex-shrink: 0;">��</span>' : ''}
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
        ${p.numero ? p.numero.split(/\s+/).map(n => hl(n, busca)).join('<br>') : '—'}
      </td>
      <td class="col-interessado" title="${p.interessado}">${hl(p.interessado, busca) || '—'}</td>
      <td class="col-objeto" title="${p.objeto}">${p.objeto || '—'}</td>
      <td style="text-align: center;"><span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span></td>
      <td style="text-align: center;">${p.localizacao ? p.localizacao.replace(/\//g, '/<wbr>') : '—'}</td>
      <td class="col-valor">${formatCurrency(p.valorOf)}</td>
      <td style="text-align: center;">${formatDate(p.data)}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="editarProcesso('${p.id}')" title="Editar">✏️</button>
        
      </td>
    </tr>
  `).join('') || `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td colspan="11">
      <div class="empty-state">
        <div class="empty-icon">��</div>
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

  // Pegar valores selecionados atualmente via state (não via DOM, que pode estar destrudo)
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
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;" value="${val}">
    <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding:0 8px;height:40px;" title="Remover">-</button>
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
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;" value="${num}">
            <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 8px;height:40px;border:1px solid var(--border);" title="Adicionar número">+</button>
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
        <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 8px;height:40px;border:1px solid var(--border);" title="Adicionar número">+</button>
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
    if (legendDiv) legendDiv.style.display = 'block';
    const nomeEdicao = p.ultimaEdicao || '';
    const dataEdicao = p.dataHoraEdicao || '';
    
    if (nomeEdicao || dataEdicao) {
      if (nomeDiv) nomeDiv.innerHTML = `�� ${nomeEdicao}`;
      if (dataDiv) dataDiv.innerHTML = `�� ${dataEdicao}`;
    } else {
      if (nomeDiv) nomeDiv.innerHTML = `<span style="font-style: italic; color: var(--text-muted);">Sem registros</span>`;
      if (dataDiv) dataDiv.innerHTML = '—';
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
        <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">�� Contatos</h4>
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
        <h4 style="font-size:12px;text-transform:uppercase;color:#22c55e;letter-spacing:.5px;margin-bottom:8px">�� Novo Apontamento</h4>
        <textarea id="modal-apontamento-texto" placeholder="Digite seu apontamento..." style="width:100%; min-height:80px; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); color:#fff; font-size:13px; outline:none; margin-bottom:12px;"></textarea>
        <button onclick="salvarApontamentoModal('${p.id}')" id="btn-salvar-apont" style="width:100%; padding:10px; border-radius:6px; border:none; background:#22c55e; color:#fff; font-weight:bold; cursor:pointer;">Salvar Apontamento</button>
      </div>
    `;
  } else if (userNivel === 'adm' && p.apontamento) {
    apontamentoHtml = `
      <div class="card" style="margin-bottom:16px; border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.05);">
        <h4 style="font-size:12px;text-transform:uppercase;color:#f59e0b;letter-spacing:.5px;margin-bottom:8px">�� Histórico de Apontamentos</h4>
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
      <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">�� Execução Financeira</h4>
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
        <span style="font-size: 24px;">��</span>
        <div>
          <strong style="color: var(--blue); font-size: 14px;">Processo Marcado para Atenção!</strong>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-secondary);">Por favor, verifique as observações abaixo.</p>
        </div>
      </div>
    ` : ''}

    ${p.obs ? `
      <div class="card" style="margin-bottom:16px; ${p.marca === '1' || p.marca === 'SIM' ? 'border: 1px solid var(--blue); background: rgba(59, 130, 246, 0.03);' : ''}">
        <h4 style="font-size:12px;text-transform:uppercase;color:${p.marca === '1' || p.marca === 'SIM' ? 'var(--blue)' : 'var(--text-muted)'};letter-spacing:.5px;margin-bottom:8px">�� Observações</h4>
        <p style="color:var(--text-secondary);font-size:14px">${p.obs}</p>
      </div>
    ` : ''}
    ${p.anotacao ? `<div class="card" style="margin-bottom:16px"><h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:8px">��️ Anotação</h4><p style="color:var(--text-secondary);font-size:14px">${p.anotacao}</p></div>` : ''}

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
      btn.innerHTML = '<span>��</span> Gravar';
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
      btn.innerHTML = '<span>��</span> Gravar';
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
    state.filtros = { busca: '', status: [], localizacao: [], municipio: [], super: [], objeto: [], prefixo: [], alerta: '', marca: '', categoria: [], tipo: [], autorizacao: '', ano: [], agrupamento: [] };
    state.paginaAtual = 1;
    document.getElementById('filtro-busca').value = '';

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

  // Preencher selects de filtro com status e localizacao
    window.popularFiltrosProcessos = function() {
      const fillSelectFiltro = (id, lista) => {
        const s = document.getElementById(id);
        if (!s) return;
        
        s.innerHTML = `<option value="****">Todos</option>` + lista.map(o => `<option value="${o}">${o}</option>`).join('');
        
        if (typeof window.initMultiSelect === 'function' && s.multiple) {
           window.initMultiSelect(id);
        }
      };
      fillSelectFiltro('filtro-status', STATUS_LIST.filter(s => s !== '.'));
      fillSelectFiltro('filtro-localizacao', LOCALIZACAO_LIST.filter(s => s !== '.'));
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
  const filtrados = getFiltrados();
  if (filtrados.length === 0) {
    toast('Nenhum processo para exportar.', 'error');
    return;
  }

  const data = filtrados.map(p => ({
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
      "<span style=\"font-weight:600; color:var(--text-primary); font-size:13px;\">�� " + whatsappFormatado + "</span>" +
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
    <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:15px; width:100%; font-family: Arial, sans-serif;">
      <div style="text-align:left;">
        <h2 style="margin:0; font-size:11px; color:#000; font-weight:bold;">CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS | SEDUC - RO</h2>
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

window.imprimirPadrao = function(filtrados = getFiltrados()) {
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
                <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:3%; font-size:10.5px; font-weight:bold;">Nº</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">PREFIXO</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:11%; font-size:10.5px; font-weight:bold;">MUNICÍPIO</th>
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
        <div style="font-size:7px; color:#000;">${filtrados.length} processos úúnicos</div>
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
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:3%; font-size:10.5px; font-weight:bold;">Nº</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:10.5px; font-weight:bold;">PREFIXO</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:11%; font-size:10.5px; font-weight:bold;">MUNICÍPIO</th>
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
  if (fLocalizacao && fLocalizacao !== 'Todos') filtrosAplicados.push("Localização: " + fLocalizacao);
  if (fPrefixo && fPrefixo !== 'Todos') filtrosAplicados.push("Prefixo: " + fPrefixo);
  if (fMunicipio && fMunicipio !== 'Todos') filtrosAplicados.push("Município: " + fMunicipio);
  
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
          <h3>�� Nenhum processo repetido encontrado!</h3>
          <p style="margin-top: 6px;">Todos os números de processos válidos na planilha são úúnicos.</p>
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
    '<div class="hdr-gov">Governo do Estado de Rond&ocirc;nia</div>' +
    '<div class="hdr-sec">Secretaria de Estado da Educa&ccedil;&atilde;o &mdash; SEDUC-RO</div>' +
    '<div class="hdr-dep">Coordenadoria de Articula&ccedil;&atilde;o com os Munic&iacute;pios &mdash; CAM</div></div></div>' +
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
       '<div class="ft"><span class="ft-logo">SEDUC-RO / CAM</span><span>Relat&oacute;rio Gerencial de Monitoramento</span><span>Emitido em: ' + today + '</span></div>' +
       '</div>'; // end bottom-container

  h += '<script>window.onload=function(){setTimeout(function(){window.print();},500);};</script></body></html>';

  var win = window.open('', '_blank');
  if (!win) { alert('Permita popups para gerar o relat\u00f3rio.'); return; }
  win.document.write(h);
  win.document.close();
}window.gerarRelatorioMonitoramento    = gerarRelatorioMonitoramento;
window.abrirModalManifestoTCEById     = abrirModalManifestoTCEById;
window.abrirModalManifestoTCE         = abrirModalManifestoTCE;
window.fecharModalManifestoTCE        = fecharModalManifestoTCE;
window.copiarManifestoTCE             = copiarManifestoTCE;
window.imprimirManifestoTCE           = imprimirManifestoTCE;



// ============================================================
// MÓDULO: TODAS ESCOLAS — Multi-aba Google Sheets (v1.0.47)
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
// Popular filtros com valores úúnicos de TODOS os dados
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
    abasBadge.textContent = '�� ' + _teAbas.length + ' planilhas';
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
  if (badgeTotal)  badgeTotal.textContent  = '�� ' + total.toLocaleString('pt-BR') + ' Escolas';
  if (badgeAlunos) badgeAlunos.textContent = '�� ' + totalAlunos.toLocaleString('pt-BR') + ' Alunos';

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


window.imprimirPadraoSelecionado = function() {
    const idsSelecionados = Array.from(document.querySelectorAll('.check-processo:checked')).map(cb => cb.value);
    if (idsSelecionados.length === 0) {
        alert('Nenhum processo selecionado.');
        return;
    }
    const filtrados = getFiltrados().filter(p => idsSelecionados.includes(p.id));
    imprimirPadrao(filtrados);
};

window.toggleAllProcessos = function(el) {
    const checkboxes = document.querySelectorAll('.check-processo');
    checkboxes.forEach(cb => cb.checked = el.checked);
};

window._processosInconsistentesParaCorrigir = [];

window.verificarInconsistenciasPlanilha = function() {
  const container = document.getElementById('status-padronizacao-container');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  const btnExecutar = document.getElementById('btn-executar-padronizacao');

  if (container) container.style.display = 'block';
  if (labelStatus) labelStatus.textContent = 'Verificando todos os campos...';
  if (logDiv) logDiv.innerHTML = '';
  if (btnExecutar) btnExecutar.style.display = 'none';

  if (!window.processosCache || window.processosCache.length === 0) {
    if (labelStatus) labelStatus.textContent = 'Erro: Planilha vazia ou não carregada.';
    return;
  }

  let inconsistentes = [];

  const padronizarString = (str) => {
    if (!str) return '';
    return String(str).trim().replace(/\s+/g, ' ').toUpperCase();
  };

  const camposParaVerificar = ['status', 'localizacao', 'municipio', 'prefixo', 'categoria', 'tipo', 'agrupamento', 'interessado', 'objeto'];

  window.processosCache.forEach(p => {
    let mudou = false;
    let atualizacoes = {};
    let descricoes = [];

    camposParaVerificar.forEach(campo => {
      if (p[campo]) {
        const ps = padronizarString(p[campo]);
        if (p[campo] !== ps) {
          atualizacoes[campo] = ps;
          descricoes.push(`${campo.toUpperCase()}: "${p[campo]}" ➔ "${ps}"`);
          mudou = true;
        }
      }
    });

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
    if (labelStatus) labelStatus.textContent = '✓ Tudo perfeito! Nenhuma divergência encontrada em nenhum campo.';
    return;
  }

  if (labelStatus) labelStatus.textContent = `Atenção: ${inconsistentes.length} registros com divergências (espaços extras ou minúsculas).`;
  
  let html = `<table style="width:100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; color: #cbd5e1; background: rgba(0,0,0,0.2);">
    <thead>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); text-align: left;">
        <th style="padding: 6px;">ID / Processo</th>
        <th style="padding: 6px;">Alterações Necessárias</th>
      </tr>
    </thead>
    <tbody>`;
  
  inconsistentes.slice(0, 100).forEach(inc => {
    html += `<tr style="border-bottom: 1px dashed rgba(255,255,255,0.05);">
      <td style="padding: 6px; font-weight: bold; color: #94a3b8;">${inc.numero}</td>
      <td style="padding: 6px; color: #34d399;">${inc.descricao}</td>
    </tr>`;
  });
  
  if (inconsistentes.length > 100) {
    html += `<tr><td colspan="2" style="padding: 6px; text-align: center; color: #fbbf24;">... e mais ${inconsistentes.length - 100} registros ocultos ...</td></tr>`;
  }
  
  html += '</tbody></table>';
  if (logDiv) logDiv.innerHTML = html;
  if (btnExecutar) btnExecutar.style.display = 'inline-flex';
};

window.executarPadronizacaoPlanilha = async function() {
  const btnExecutar = document.getElementById('btn-executar-padronizacao');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const btnVerificar = document.getElementById('btn-verificar-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  
  if (btnExecutar) btnExecutar.style.display = 'none';
  if (btnVerificar) btnVerificar.disabled = true;
  
  const inconsistentes = window._processosInconsistentesParaCorrigir || [];
  let total = inconsistentes.length;
  
  if (labelStatus) labelStatus.textContent = `Corrigindo 0 de ${total} registros...`;
  
  let progContainer = document.getElementById('bar-prog-container');
  if (!progContainer) {
    progContainer = document.createElement('div');
    progContainer.id = 'bar-prog-container';
    progContainer.style = 'width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-top: 10px; margin-bottom: 10px;';
    const bar = document.createElement('div');
    bar.id = 'bar-prog-fill';
    bar.style = 'width: 0%; height: 100%; background: #10b981; transition: width 0.2s ease;';
    progContainer.appendChild(bar);
    logDiv.parentNode.insertBefore(progContainer, logDiv);
  }
  
  const barFill = document.getElementById('bar-prog-fill');
  barFill.style.width = '0%';

  try {
    const token = sessionStorage.getItem('sap_session_token');
    let count = 0;
    
    for (let inc of inconsistentes) {
      count++;
      if (labelStatus) labelStatus.textContent = `Corrigindo ${count} de ${total}...`;
      if (barFill) barFill.style.width = `${Math.round((count / total) * 100)}%`;
      
      await fetch(API_BASE + '/api/registros/' + inc.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(inc.atualizacoes)
      });
    }
    
    if (labelStatus) labelStatus.textContent = '✓ Correções aplicadas com sucesso!';
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (e) {
    console.error(e);
    if (labelStatus) labelStatus.textContent = 'Erro ao aplicar correções. Tente novamente.';
    if (btnVerificar) btnVerificar.disabled = false;
  }
};

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
};

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
};
