// ============================================================
// SEDUC - Módulo GDSM (Regimes de Colaboração & Processos)
// Integração das Abas da Planilha Google de Regimes
// Versão Otimizada com Município Primeiro e Layout Responsivo
// ============================================================

const GDSM_SPREADSHEET_ID = '10v6t1Lma7AOfLn3XmlG85PMoOa2D_MzEONAeUgg0j6Q';

const GDSM_TABS = {
  'regimes': {
    key: 'regimes',
    gid: '0',
    titulo: 'Regime de Colaboração',
    subtitulo: 'Acompanhamento de convênios e termos de regime de colaboração',
    icone: '📋',
    temValor: true,
    colValor: 'Valor TOTAL do Convênio',
    colValorConcedente: 'Valor\nCONCEDENTE',
    colContrapartida: 'Contrapartida\nCONVENENTE',
    colunasSimplificado: [
      'Município', 'Processo SEI', 'Status', 'Tipo', 'Convenente', 'Objeto', 'Situação SEDUC', 'Vigência FINAL', 'Valor TOTAL do Convênio'
    ]
  },
  'demais': {
    key: 'demais',
    gid: '1655419194',
    titulo: 'Demais Processos',
    subtitulo: 'Controle de processos complementares e solicitações municipalistas',
    icone: '📁',
    temValor: false,
    colunasSimplificado: [
      'Municipio', 'Processo SEI', 'Status', 'Categoria', 'Objeto', 'Escola/Secretaria a ser atendida', 'Autorização', 'Data\nConsulta'
    ]
  },
  'doacoes': {
    key: 'doacoes',
    gid: '810185720',
    titulo: '[Temporário] Doações',
    subtitulo: 'Processos de doações definitivas, equipamentos e ampliações de escolas',
    icone: '🎁',
    temValor: true,
    colValor: 'Valor TOTAL do Convênio',
    colValorConcedente: 'Valor\nCONCEDENTE',
    colContrapartida: 'Contrapartida\nCONVENENTE',
    colunasSimplificado: [
      'Município', 'Processo SEI', 'Status', 'Convenente', 'Objeto', 'Situação SEDUC', 'Vigência FINAL', 'Valor TOTAL do Convênio', 'Técnico'
    ]
  },
  'novoregime': {
    key: 'novoregime',
    gid: '134249734',
    titulo: 'Novo Regime',
    subtitulo: 'Novos regimes de colaboração com municípios e instituições de ensino',
    icone: '🚀',
    temValor: true,
    colValor: 'Valor TOTAL do Convênio',
    colValorConcedente: 'Valor\nCONCEDENTE',
    colContrapartida: 'Contrapartida\nCONVENENTE',
    colunasSimplificado: [
      'Município', 'Processo SEI', 'Status', 'Tipo', 'Convenente', 'Objeto', 'Situação SEDUC', 'Vigência FINAL', 'Valor TOTAL do Convênio'
    ]
  }
};

window.gdsmData = {};
window.gdsmHeaders = {};
window.gdsmFiltros = {};

// Inicializa estado de filtros para cada aba
Object.keys(GDSM_TABS).forEach(k => {
  window.gdsmFiltros[k] = {
    busca: '',
    status: '',
    municipio: '',
    tipo: '',
    situacaoSeduc: '',
    pagina: 1,
    itensPorPagina: 50,
    sortCol: null,
    sortAsc: true
  };
});

// Parser CSV robusto para Google Sheets
function parseCSVGDSM(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let cur = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(cur.trim());
      cur = '';
      if (row.some(cell => cell !== '')) lines.push(row);
      row = [];
    } else {
      cur += c;
    }
  }
  if (cur || row.length) {
    row.push(cur.trim());
    if (row.some(cell => cell !== '')) lines.push(row);
  }
  return lines;
}

// Converte string monetária brasileira para número decimal
function parseMoedaGDSM(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const limpo = String(val).replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
}

function formatMoedaGDSM(num) {
  if (isNaN(num) || num === null || num === undefined) return 'R$ 0,00';
  return 'R$ ' + Number(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Reordena colunas para iniciar SEMPRE por Município
function reordenarColunasMunicipioPrimeiro(headers) {
  const munIdx = headers.findIndex(h => /^(munic[ií]pio|munic[ií]pios)$/i.test(String(h).trim()));
  if (munIdx > 0) {
    const munCol = headers[munIdx];
    const resto = headers.filter((_, idx) => idx !== munIdx);
    return [munCol, ...resto];
  }
  return headers;
}

// Retorna estilo e largura ideal por tipo de coluna
function getColunaStyleGDSM(colName) {
  const c = String(colName).toLowerCase();
  
  if (c.includes('munic')) {
    return { width: '130px', minWidth: '120px', align: 'left', whiteSpace: 'nowrap' };
  }
  if (c.includes('processo sei') || c === 'processo') {
    return { width: '150px', minWidth: '140px', align: 'left', whiteSpace: 'nowrap' };
  }
  if (c === 'status') {
    return { width: '95px', minWidth: '90px', align: 'center', whiteSpace: 'nowrap' };
  }
  if (c.includes('tipo objeto') || c === 'tipo' || c === 'categoria') {
    return { width: '95px', minWidth: '85px', align: 'left', whiteSpace: 'nowrap' };
  }
  if (c === 'quant' || c === 'qtd' || c === 'quantidade') {
    return { width: '60px', minWidth: '55px', align: 'center', whiteSpace: 'nowrap' };
  }
  if (c.includes('valor') || c.includes('contrapartida')) {
    return { width: '115px', minWidth: '110px', align: 'right', whiteSpace: 'nowrap' };
  }
  if (c.includes('data') || c.includes('vigência') || c.includes('vigencia')) {
    return { width: '90px', minWidth: '85px', align: 'center', whiteSpace: 'nowrap' };
  }
  if (c.includes('situação') || c.includes('situacao')) {
    return { width: '120px', minWidth: '110px', align: 'left', whiteSpace: 'normal' };
  }
  if (c.includes('convenente') || c.includes('escola') || c.includes('entidade')) {
    return { width: '170px', minWidth: '150px', align: 'left', whiteSpace: 'normal' };
  }
  if (c.includes('objeto')) {
    return { width: '220px', minWidth: '180px', align: 'left', whiteSpace: 'normal' };
  }
  if (c === 'autorização' || c === 'autorizacao') {
    return { width: '100px', minWidth: '90px', align: 'center', whiteSpace: 'nowrap' };
  }
  if (c === 'forma' || c.includes('forma de')) {
    return { width: '80px', minWidth: '75px', align: 'left', whiteSpace: 'nowrap' };
  }
  if (c === 'termo' || c === 'regional' || c === 'setor' || c === 'técnico' || c === 'tecnico') {
    return { width: '100px', minWidth: '90px', align: 'left', whiteSpace: 'nowrap' };
  }

  // Padrão compacto
  return { width: '120px', minWidth: '110px', align: 'left', whiteSpace: 'normal' };
}

// Abrir link direto na planilha oficial
function abrirPlanilhaGDSM(tabKey) {
  const tab = GDSM_TABS[tabKey];
  if (!tab) return;
  const url = `https://docs.google.com/spreadsheets/d/${GDSM_SPREADSHEET_ID}/edit#gid=${tab.gid}`;
  window.open(url, '_blank');
}

// Alternar visibilidade dos filtros
function toggleFiltrosGDSM(tabKey) {
  const bar = document.getElementById(`gdsm-filters-bar-${tabKey}`);
  if (bar) {
    const atual = bar.style.display;
    bar.style.display = (atual === 'none') ? 'flex' : 'none';
  }
}

// Carregar dados de uma aba específica
async function carregarGDSM(tabKey, forcar = false) {
  const tab = GDSM_TABS[tabKey];
  if (!tab) return;

  const container = document.getElementById(`gdsm-table-container-${tabKey}`);
  if (!container) return;

  // Se já tiver dados em cache e não forçar, reutiliza
  if (!forcar && window.gdsmData[tabKey] && window.gdsmData[tabKey].length > 0) {
    aplicarFiltrosGDSM(tabKey);
    return;
  }

  container.innerHTML = `
    <div style="text-align:center; padding:50px 20px; color:#94a3b8;">
      <div style="font-size:24px; margin-bottom:10px;">⏳</div>
      <p style="font-size:14px; margin:0;">Carregando dados da aba <strong>${tab.titulo}</strong>...</p>
    </div>
  `;

  try {
    const url = `https://docs.google.com/spreadsheets/d/${GDSM_SPREADSHEET_ID}/export?format=csv&gid=${tab.gid}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao carregar CSV (HTTP ${res.status})`);

    const text = await res.text();
    const rows = parseCSVGDSM(text);
    if (rows.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8;">Nenhum registro encontrado na planilha.</div>`;
      return;
    }

    // Identificar e limpar cabeçalhos
    const rawHeaders = rows[0];
    const headers = rawHeaders.map((h, i) => {
      const clean = h.replace(/\r?\n/g, ' ').trim();
      return clean !== '' ? clean : `Coluna_${i + 1}`;
    });

    // Reorganiza cabeçalhos: Município sempre em primeiro
    const headersOrdenados = reordenarColunasMunicipioPrimeiro(headers);
    window.gdsmHeaders[tabKey] = headersOrdenados;

    // Processar registros em objetos
    const dados = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length === 0 || !row.some(c => c !== '')) continue;
      const item = { _rawRow: r };
      headers.forEach((h, colIdx) => {
        item[h] = row[colIdx] || '';
      });
      dados.push(item);
    }

    window.gdsmData[tabKey] = dados;

    // Popula selects de filtros
    popularFiltrosSelectsGDSM(tabKey);

    // Aplica filtros e renderiza tabela
    aplicarFiltrosGDSM(tabKey);

  } catch (err) {
    console.error(`Erro ao carregar GDSM [${tabKey}]:`, err);
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#ef4444;">
        <div style="font-size:26px; margin-bottom:8px;">⚠️</div>
        <p style="font-weight:700; margin:0 0 6px;">Não foi possível carregar a aba ${tab.titulo}.</p>
        <p style="font-size:12px; color:#94a3b8; margin:0 0 16px;">Verifique sua conexão ou a permissão da planilha Google.</p>
        <button onclick="carregarGDSM('${tabKey}', true)" class="btn btn-primary" style="padding:8px 16px; font-size:12px;">Tentar Novamente</button>
      </div>
    `;
  }
}

// Popula opções dos dropdowns de filtros dinamicamente
function popularFiltrosSelectsGDSM(tabKey) {
  const dados = window.gdsmData[tabKey] || [];
  const selStatus = document.getElementById(`gdsm-filtro-status-${tabKey}`);
  const selMun = document.getElementById(`gdsm-filtro-mun-${tabKey}`);
  const selTipo = document.getElementById(`gdsm-filtro-tipo-${tabKey}`);
  const selSit = document.getElementById(`gdsm-filtro-sit-${tabKey}`);

  // Busca valores únicos
  const statusSet = new Set();
  const munSet = new Set();
  const tipoSet = new Set();
  const sitSet = new Set();

  dados.forEach(d => {
    // Status
    const st = d['Status'] || d['STATUS'] || '';
    if (st.trim()) statusSet.add(st.trim());

    // Município
    const mun = d['Município'] || d['Municipio'] || d['MUNICÍPIO'] || d['MUNICÍPIOS'] || '';
    if (mun.trim() && mun.length > 2 && !mun.toUpperCase().includes('TOTAL')) munSet.add(mun.trim());

    // Tipo / Categoria
    const tp = d['Tipo'] || d['TIPO'] || d['Categoria'] || d['Tipo Objeto'] || '';
    if (tp.trim()) tipoSet.add(tp.trim());

    // Situação SEDUC
    const sit = d['Situação SEDUC'] || d['SITUAÇÃO SEDUC'] || '';
    if (sit.trim()) sitSet.add(sit.trim());
  });

  if (selMun) {
    const valAtual = selMun.value;
    selMun.innerHTML = '<option value="">🏛️ Todos os Municípios</option>' + 
      Array.from(munSet).sort().map(m => `<option value="${m}">${m}</option>`).join('');
    selMun.value = valAtual;
  }

  if (selStatus) {
    const valAtual = selStatus.value;
    selStatus.innerHTML = '<option value="">📌 Todos os Status</option>' + 
      Array.from(statusSet).sort().map(s => `<option value="${s}">${s}</option>`).join('');
    selStatus.value = valAtual;
  }

  if (selTipo) {
    const valAtual = selTipo.value;
    selTipo.innerHTML = '<option value="">🏷️ Todos os Tipos</option>' + 
      Array.from(tipoSet).sort().map(t => `<option value="${t}">${t}</option>`).join('');
    selTipo.value = valAtual;
  }

  if (selSit) {
    const valAtual = selSit.value;
    selSit.innerHTML = '<option value="">📑 Todas as Situações</option>' + 
      Array.from(sitSet).sort().map(s => `<option value="${s}">${s}</option>`).join('');
    selSit.value = valAtual;
  }
}

// Aplica filtros e atualiza contadores/tabela
function aplicarFiltrosGDSM(tabKey) {
  const dados = window.gdsmData[tabKey] || [];
  const filtros = window.gdsmFiltros[tabKey];
  const tab = GDSM_TABS[tabKey];

  // Leitura dos inputs da interface
  const inpBusca = document.getElementById(`gdsm-filtro-busca-${tabKey}`);
  const selStatus = document.getElementById(`gdsm-filtro-status-${tabKey}`);
  const selMun = document.getElementById(`gdsm-filtro-mun-${tabKey}`);
  const selTipo = document.getElementById(`gdsm-filtro-tipo-${tabKey}`);
  const selSit = document.getElementById(`gdsm-filtro-sit-${tabKey}`);

  filtros.busca = (inpBusca ? inpBusca.value : '').toLowerCase().trim();
  filtros.status = (selStatus ? selStatus.value : '').toLowerCase().trim();
  filtros.municipio = (selMun ? selMun.value : '').toLowerCase().trim();
  filtros.tipo = (selTipo ? selTipo.value : '').toLowerCase().trim();
  filtros.situacaoSeduc = (selSit ? selSit.value : '').toLowerCase().trim();

  // Filtragem
  const filtrados = dados.filter(d => {
    // Busca textual geral
    if (filtros.busca) {
      const matchTexto = Object.values(d).some(v => String(v || '').toLowerCase().includes(filtros.busca));
      if (!matchTexto) return false;
    }

    // Município
    if (filtros.municipio) {
      const mun = String(d['Município'] || d['Municipio'] || d['MUNICÍPIO'] || d['MUNICÍPIOS'] || '').toLowerCase();
      if (mun !== filtros.municipio) return false;
    }

    // Status
    if (filtros.status) {
      const st = String(d['Status'] || d['STATUS'] || '').toLowerCase();
      if (st !== filtros.status) return false;
    }

    // Tipo / Categoria
    if (filtros.tipo) {
      const tp = String(d['Tipo'] || d['TIPO'] || d['Categoria'] || d['Tipo Objeto'] || '').toLowerCase();
      if (tp !== filtros.tipo) return false;
    }

    // Situação SEDUC
    if (filtros.situacaoSeduc) {
      const sit = String(d['Situação SEDUC'] || d['SITUAÇÃO SEDUC'] || '').toLowerCase();
      if (sit !== filtros.situacaoSeduc) return false;
    }

    return true;
  });

  // Ordenação
  if (filtros.sortCol) {
    filtrados.sort((a, b) => {
      let va = a[filtros.sortCol] || '';
      let vb = b[filtros.sortCol] || '';
      // Se for monetário
      if (tab.temValor && String(filtros.sortCol).toLowerCase().includes('valor')) {
        const na = parseMoedaGDSM(va);
        const nb = parseMoedaGDSM(vb);
        return filtros.sortAsc ? na - nb : nb - na;
      }
      return filtros.sortAsc ? String(va).localeCompare(String(vb), 'pt-BR') : String(vb).localeCompare(String(va), 'pt-BR');
    });
  }

  // Atualiza Badges de Totais
  const badgeQtd = document.getElementById(`gdsm-badge-qtd-${tabKey}`);
  if (badgeQtd) {
    badgeQtd.textContent = `${filtrados.length} Registros`;
  }

  if (tab.temValor) {
    const badgeValor = document.getElementById(`gdsm-badge-valor-${tabKey}`);
    if (badgeValor) {
      const colV = tab.colValor || 'Valor TOTAL do Convênio';
      const soma = filtrados.reduce((acc, item) => acc + parseMoedaGDSM(item[colV]), 0);
      badgeValor.innerHTML = `<span>R$</span> <span>${Number(soma).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  // Renderiza tabela com paginação
  renderTabelaGDSM(tabKey, filtrados);
}

// Renderiza a tabela paginada com colunas limpas e Município primeiro
function renderTabelaGDSM(tabKey, filtrados) {
  const container = document.getElementById(`gdsm-table-container-${tabKey}`);
  if (!container) return;

  const tab = GDSM_TABS[tabKey];
  const rawHeaders = window.gdsmHeaders[tabKey] || [];
  const filtros = window.gdsmFiltros[tabKey];

  if (!filtrados || filtrados.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#94a3b8;">
        <div style="font-size:28px; margin-bottom:8px;">🔍</div>
        <p style="font-size:15px; font-weight:700; margin:0 0 4px; color:#cbd5e1;">Nenhum registro encontrado</p>
        <p style="font-size:12px; margin:0;">Tente ajustar os parâmetros de busca ou limpar os filtros.</p>
      </div>
    `;
    return;
  }

  // Paginação
  const total = filtrados.length;
  const porPagina = filtros.itensPorPagina || 50;
  const totalPaginas = Math.ceil(total / porPagina);
  if (filtros.pagina > totalPaginas) filtros.pagina = totalPaginas;
  if (filtros.pagina < 1) filtros.pagina = 1;

  const inicio = (filtros.pagina - 1) * porPagina;
  const fim = Math.min(inicio + porPagina, total);
  const paginaDados = filtrados.slice(inicio, fim);

  // Determinar cabeçalhos filtrados (remove colunas vazias) e garante Município em primeiro
  const colunasExibidas = reordenarColunasMunicipioPrimeiro(
    rawHeaders.filter(h => !h.startsWith('Coluna_'))
  );

  let theadHtml = colunasExibidas.map(col => {
    const isSorted = filtros.sortCol === col;
    const arrow = isSorted ? (filtros.sortAsc ? ' ↑' : ' ↓') : '';
    const st = getColunaStyleGDSM(col);
    const styleAlign = `text-align:${st.align};`;
    const colDisplay = col.replace(/\n/g, ' ');
    const isMun = col.toLowerCase().includes('munic');
    const stickyClass = isMun ? 'class="col-municipio-sticky"' : '';

    return `
      <th ${stickyClass} onclick="ordenarGDSM('${tabKey}', '${col}')" style="padding:7px 10px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.08); position:sticky; top:0; z-index:${isMun ? 25 : 10}; cursor:pointer; user-select:none; width:${st.width}; min-width:${st.minWidth}; white-space:nowrap; ${styleAlign}" title="Clique para ordenar por ${colDisplay}">
        ${colDisplay}${arrow}
      </th>
    `;
  }).join('');

  let tbodyHtml = paginaDados.map((row, idx) => {
    const zebraBg = idx % 2 === 1 ? 'background-color:rgba(255,255,255,0.02);' : 'background-color:transparent;';
    const cells = colunasExibidas.map(col => {
      let val = row[col] || '-';
      const colNorm = col.toLowerCase();
      const st = getColunaStyleGDSM(col);

      // 1. MUNICÍPIO (Destaque institucional e fixação lateral)
      if (colNorm.includes('munic')) {
        return `
          <td class="col-municipio-sticky" style="padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:700; color:#f8fafc; font-size:12px; width:${st.width}; min-width:${st.minWidth}; white-space:nowrap;">
            ${val}
          </td>
        `;
      }

      // 2. STATUS (Badge estilizado)
      if (colNorm === 'status') {
        const stLower = String(val).toLowerCase();
        let badgeBg = 'background:rgba(148,163,184,0.15); color:#94a3b8; border:1px solid rgba(148,163,184,0.3);';
        if (stLower.includes('concluso') || stLower.includes('conclu')) badgeBg = 'background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3);';
        else if (stLower.includes('trâmite') || stLower.includes('tramite') || stLower.includes('andamento')) badgeBg = 'background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);';
        else if (stLower.includes('encerrado') || stLower.includes('cancelado')) badgeBg = 'background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3);';
        else if (stLower.includes('suspenso') || stLower.includes('notificar') || stLower.includes('pendente')) badgeBg = 'background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3);';
        return `
          <td style="padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center; width:${st.width}; min-width:${st.minWidth}; white-space:nowrap;">
            <span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.3px; ${badgeBg}">
              ${val}
            </span>
          </td>
        `;
      }

      // 3. PROCESSO SEI
      if (colNorm.includes('processo sei') || colNorm === 'processo') {
        return `
          <td style="padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.05); font-family:monospace; font-weight:700; color:#38bdf8; font-size:11.5px; width:${st.width}; min-width:${st.minWidth}; white-space:nowrap;">
            ${val}
          </td>
        `;
      }

      // 4. VALORES MONETÁRIOS
      if (colNorm.includes('valor') || colNorm.includes('contrapartida')) {
        const num = parseMoedaGDSM(val);
        const formatado = num > 0 ? formatMoedaGDSM(num) : (val.trim() === '0,00' ? 'R$ 0,00' : val);
        return `
          <td style="padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:right; font-family:monospace; font-weight:700; color:#34d399; font-size:11.5px; width:${st.width}; min-width:${st.minWidth}; white-space:nowrap;">
            ${formatado}
          </td>
        `;
      }

      // 5. AUTORIZAÇÃO
      if (colNorm === 'autorização' || colNorm === 'autorizacao') {
        const aut = String(val).toUpperCase();
        const autCor = aut.includes('AUTORIZADO') ? 'color:#34d399;' : (aut.includes('NÃO') || aut.includes('PENDENTE') ? 'color:#fbbf24;' : 'color:#94a3b8;');
        return `
          <td style="padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center; font-weight:700; font-size:10.5px; ${autCor} width:${st.width}; min-width:${st.minWidth}; white-space:nowrap;">
            ${val}
          </td>
        `;
      }

      // 6. DEMAIS COLUNAS DE TEXTO
      return `
        <td style="padding:6px 10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#cbd5e1; font-size:11.5px; line-height:1.35; width:${st.width}; min-width:${st.minWidth}; white-space:${st.whiteSpace};">
          ${val}
        </td>
      `;
    }).join('');

    return `<tr style="${zebraBg} transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='${idx % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent'}'">${cells}</tr>`;
  }).join('');

  // Barra de Paginação
  const paginacaoHtml = `
    <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:6px 14px; background:rgba(15,23,42,0.98); border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:#94a3b8; box-sizing:border-box;">
      <div>
        Exibindo <strong style="color:#f8fafc;">${inicio + 1}</strong> a <strong style="color:#f8fafc;">${fim}</strong> de <strong style="color:#f8fafc;">${total}</strong> registros
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button onclick="mudarPaginaGDSM('${tabKey}', 1)" ${filtros.pagina === 1 ? 'disabled' : ''} class="btn btn-ghost" style="padding:5px 10px; font-size:12px; cursor:pointer;" title="Primeira Página">«</button>
        <button onclick="mudarPaginaGDSM('${tabKey}', ${filtros.pagina - 1})" ${filtros.pagina === 1 ? 'disabled' : ''} class="btn btn-ghost" style="padding:5px 10px; font-size:12px; cursor:pointer;" title="Página Anterior">‹</button>
        <span style="color:#cbd5e1; padding:0 6px;">Página <strong>${filtros.pagina}</strong> de <strong>${totalPaginas}</strong></span>
        <button onclick="mudarPaginaGDSM('${tabKey}', ${filtros.pagina + 1})" ${filtros.pagina === totalPaginas ? 'disabled' : ''} class="btn btn-ghost" style="padding:5px 10px; font-size:12px; cursor:pointer;" title="Próxima Página">›</button>
        <button onclick="mudarPaginaGDSM('${tabKey}', ${totalPaginas})" ${filtros.pagina === totalPaginas ? 'disabled' : ''} class="btn btn-ghost" style="padding:5px 10px; font-size:12px; cursor:pointer;" title="Última Página">»</button>
      </div>
    </div>
  `;

  const minTableWidth = Math.max(1600, colunasExibidas.length * 135);

  container.innerHTML = `
    <div class="table-wrap gdsm-table-wrap" style="flex:1; min-height:0; overflow-x:auto !important; overflow-y:auto !important; width:100%; max-width:100%; box-sizing:border-box; border-radius:8px 8px 0 0;">
      <table style="width:100%; min-width:${minTableWidth}px; border-collapse:separate; border-spacing:0; text-align:left; font-size:11.5px;">
        <thead>
          <tr>${theadHtml}</tr>
        </thead>
        <tbody>
          ${tbodyHtml}
        </tbody>
      </table>
    </div>
    ${paginacaoHtml}
  `;
}

// Alteração de página
function mudarPaginaGDSM(tabKey, novaPagina) {
  const filtros = window.gdsmFiltros[tabKey];
  if (!filtros) return;
  filtros.pagina = novaPagina;
  aplicarFiltrosGDSM(tabKey);
}

// Ordenação dinâmica
function ordenarGDSM(tabKey, colName) {
  const filtros = window.gdsmFiltros[tabKey];
  if (!filtros) return;
  if (filtros.sortCol === colName) {
    filtros.sortAsc = !filtros.sortAsc;
  } else {
    filtros.sortCol = colName;
    filtros.sortAsc = true;
  }
  aplicarFiltrosGDSM(tabKey);
}

// Limpar todos os filtros da tela
function limparFiltrosGDSM(tabKey) {
  const filtros = window.gdsmFiltros[tabKey];
  if (!filtros) return;

  filtros.busca = '';
  filtros.status = '';
  filtros.municipio = '';
  filtros.tipo = '';
  filtros.situacaoSeduc = '';
  filtros.pagina = 1;
  filtros.sortCol = null;

  const inpBusca = document.getElementById(`gdsm-filtro-busca-${tabKey}`);
  const selStatus = document.getElementById(`gdsm-filtro-status-${tabKey}`);
  const selMun = document.getElementById(`gdsm-filtro-mun-${tabKey}`);
  const selTipo = document.getElementById(`gdsm-filtro-tipo-${tabKey}`);
  const selSit = document.getElementById(`gdsm-filtro-sit-${tabKey}`);

  if (inpBusca) inpBusca.value = '';
  if (selStatus) selStatus.value = '';
  if (selMun) selMun.value = '';
  if (selTipo) selTipo.value = '';
  if (selSit) selSit.value = '';

  aplicarFiltrosGDSM(tabKey);
}

// Exportar para Excel (.xlsx)
function exportarExcelGDSM(tabKey) {
  const tab = GDSM_TABS[tabKey];
  if (!tab) return;
  const dados = window.gdsmData[tabKey] || [];
  const rawHeaders = window.gdsmHeaders[tabKey] || [];

  if (dados.length === 0) {
    alert('Nenhum dado disponível para exportação.');
    return;
  }

  const headers = reordenarColunasMunicipioPrimeiro(
    rawHeaders.filter(h => !h.startsWith('Coluna_'))
  );

  // Coleta dados filtrados no momento
  const filtrados = obterDadosFiltradosGDSM(tabKey);

  if (typeof XLSX === 'undefined') {
    alert('Biblioteca XLSX não carregada no momento.');
    return;
  }

  const exportRows = filtrados.map(item => {
    const rowObj = {};
    headers.forEach(h => {
      rowObj[h] = item[h] || '';
    });
    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tab.titulo.substring(0, 30));

  const hoje = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `GDSM_${tabKey.toUpperCase()}_${hoje}.xlsx`);
}

// ============================================================
// RELATÓRIOS GDSM (1. Simplificado | 2. Detalhado)
// ============================================================

function obterDadosFiltradosGDSM(tabKey) {
  const dados = window.gdsmData[tabKey] || [];
  const filtros = window.gdsmFiltros[tabKey] || {};
  return dados.filter(d => {
    if (filtros.busca && !Object.values(d).some(v => String(v || '').toLowerCase().includes(filtros.busca))) return false;
    if (filtros.municipio && String(d['Município'] || d['Municipio'] || d['MUNICÍPIO'] || d['MUNICÍPIOS'] || '').toLowerCase() !== filtros.municipio) return false;
    if (filtros.status && String(d['Status'] || d['STATUS'] || '').toLowerCase() !== filtros.status) return false;
    if (filtros.tipo && String(d['Tipo'] || d['TIPO'] || d['Categoria'] || d['Tipo Objeto'] || '').toLowerCase() !== filtros.tipo) return false;
    if (filtros.situacaoSeduc && String(d['Situação SEDUC'] || d['SITUAÇÃO SEDUC'] || '').toLowerCase() !== filtros.situacaoSeduc) return false;
    return true;
  });
}

// RELATÓRIO 1: SIMPLIFICADO (MUNICÍPIO PRIMEIRO)
function imprimirGDSMSimplificado(tabKey) {
  const tab = GDSM_TABS[tabKey];
  if (!tab) return;
  const filtrados = obterDadosFiltradosGDSM(tabKey);
  if (filtrados.length === 0) {
    alert('Nenhum registro encontrado para emissão do relatório.');
    return;
  }

  const colunas = reordenarColunasMunicipioPrimeiro(
    tab.colunasSimplificado || (window.gdsmHeaders[tabKey] || []).slice(0, 8)
  );

  const totalValor = tab.temValor
    ? filtrados.reduce((acc, p) => acc + parseMoedaGDSM(p[tab.colValor]), 0)
    : 0;

  let theadHtml = '<th style="border: 1px solid #334155; padding: 4px 6px; font-size: 9px; text-align: center; width: 3%;">Nº</th>';
  colunas.forEach(col => {
    const isValor = String(col).toLowerCase().includes('valor');
    const isMun = String(col).toLowerCase().includes('munic');
    const textAlign = isValor ? 'right' : (isMun ? 'left; font-weight:bold;' : 'left');
    theadHtml += `<th style="border: 1px solid #334155; padding: 4px 6px; font-size: 9px; text-align: ${textAlign};">${col.replace(/\n/g, ' ')}</th>`;
  });

  let rowsHtml = filtrados.map((row, idx) => {
    const zebraBg = idx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
    let tds = `<td style="border: 1px solid #cbd5e1; padding: 3px 6px; font-size: 9px; text-align: center; color: #64748b;">${idx + 1}</td>`;
    colunas.forEach(col => {
      const isValor = String(col).toLowerCase().includes('valor');
      const isMun = String(col).toLowerCase().includes('munic');
      let val = row[col] || '-';
      if (isValor) {
        const num = parseMoedaGDSM(val);
        val = num > 0 ? formatMoedaGDSM(num) : val;
      }
      const fontStyle = isMun ? 'font-weight:bold; color:#0f172a;' : '';
      tds += `<td style="border: 1px solid #cbd5e1; padding: 3px 6px; font-size: 9px; text-align: ${isValor ? 'right; font-weight: bold; white-space: nowrap;' : 'left;'}; ${fontStyle}">${val}</td>`;
    });
    return `<tr style="${zebraBg} page-break-inside: avoid; break-inside: avoid;">${tds}</tr>`;
  }).join('');

  // Linha de total se houver valores monetários
  if (tab.temValor) {
    const colspan = colunas.length;
    rowsHtml += `
      <tr style="background:#f1f5f9; font-weight:bold; border-top:2px solid #0f172a; page-break-inside: avoid; break-inside: avoid;">
        <td colspan="${colspan}" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-size: 11px; text-transform: uppercase;">
          TOTAL GERAL (${filtrados.length} processos):
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-size: 11.5px; white-space: nowrap;">
          ${formatMoedaGDSM(totalValor)}
        </td>
      </tr>
    `;
  }

  const dataHoraEmissao = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <!-- Cabeçalho Institucional -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
            GDSM — ${tab.titulo.toUpperCase()} (RELATÓRIO SIMPLIFICADO)
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 2px;">
            Coordenadoria de Articulação com os Municípios (CAM) · SEDUC-RO
          </div>
        </div>
        <div style="text-align:right; font-size: 9.5px; color: #475569;">
          <span>Total: <strong>${filtrados.length} registros</strong></span>
          ${tab.temValor ? `<span style="margin: 0 8px; color: #cbd5e1;">|</span><span>Valor: <strong>${formatMoedaGDSM(totalValor)}</strong></span>` : ''}
          <div style="font-size: 8.5px; color: #94a3b8; margin-top: 2px;">Emitido em: ${dataHoraEmissao}</div>
        </div>
      </div>

      <!-- Tabela -->
      <table style="width:100%; border-collapse:collapse; font-size:9px; table-layout:fixed; word-wrap:break-word;">
        <thead>
          <tr style="background:#0f172a; color:#ffffff; page-break-inside: avoid; break-inside: avoid;">
            ${theadHtml}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Rodapé -->
      <div style="margin-top: 12px; border-top: 1.5px solid #cbd5e1; padding-top: 6px; font-size: 8.5px; color: #64748b; display:flex; justify-content:space-between;">
        <span>SEDUC Processos · CAM / GDSM · Relatório Oficial</span>
        <span>Aba: ${tab.titulo} · Ordenado por Município</span>
      </div>
    </div>
  `;

  executarImpressaoGDSM(html, `RELATORIO_SIMPLIFICADO_${tabKey.toUpperCase()}`);
}

// RELATÓRIO 2: DETALHADO (MUNICÍPIO PRIMEIRO)
function imprimirGDSMDetalhado(tabKey) {
  const tab = GDSM_TABS[tabKey];
  if (!tab) return;
  const filtrados = obterDadosFiltradosGDSM(tabKey);
  if (filtrados.length === 0) {
    alert('Nenhum registro encontrado para emissão do relatório.');
    return;
  }

  const rawHeaders = window.gdsmHeaders[tabKey] || [];
  const colunas = reordenarColunasMunicipioPrimeiro(
    rawHeaders.filter(h => !h.startsWith('Coluna_'))
  );

  const totalValor = tab.temValor
    ? filtrados.reduce((acc, p) => acc + parseMoedaGDSM(p[tab.colValor]), 0)
    : 0;

  let theadHtml = '<th style="border: 1px solid #334155; padding: 4px 4px; font-size: 8.5px; text-align: center; width: 2.5%;">Nº</th>';
  colunas.forEach(col => {
    const isValor = String(col).toLowerCase().includes('valor');
    const isMun = String(col).toLowerCase().includes('munic');
    const textAlign = isValor ? 'right' : (isMun ? 'left; font-weight:bold;' : 'left');
    theadHtml += `<th style="border: 1px solid #334155; padding: 4px 4px; font-size: 8.5px; text-align: ${textAlign};">${col.replace(/\n/g, ' ')}</th>`;
  });

  let rowsHtml = filtrados.map((row, idx) => {
    const zebraBg = idx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
    let tds = `<td style="border: 1px solid #cbd5e1; padding: 3px 4px; font-size: 8px; text-align: center; color: #64748b;">${idx + 1}</td>`;
    colunas.forEach(col => {
      const isValor = String(col).toLowerCase().includes('valor');
      const isMun = String(col).toLowerCase().includes('munic');
      let val = row[col] || '-';
      if (isValor) {
        const num = parseMoedaGDSM(val);
        val = num > 0 ? formatMoedaGDSM(num) : val;
      }
      const fontStyle = isMun ? 'font-weight:bold; color:#0f172a;' : '';
      tds += `<td style="border: 1px solid #cbd5e1; padding: 3px 4px; font-size: 8px; text-align: ${isValor ? 'right; font-weight: bold; white-space: nowrap;' : 'left;'}; ${fontStyle}">${val}</td>`;
    });
    return `<tr style="${zebraBg} page-break-inside: avoid; break-inside: avoid;">${tds}</tr>`;
  }).join('');

  if (tab.temValor) {
    const colspan = colunas.length;
    rowsHtml += `
      <tr style="background:#f1f5f9; font-weight:bold; border-top:2px solid #0f172a; page-break-inside: avoid; break-inside: avoid;">
        <td colspan="${colspan}" style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase;">
          TOTAL GERAL (${filtrados.length} registros):
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-size: 11px; white-space: nowrap;">
          ${formatMoedaGDSM(totalValor)}
        </td>
      </tr>
    `;
  }

  const dataHoraEmissao = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <!-- Cabeçalho Institucional -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2.5px solid #0f172a; padding-bottom: 6px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
            GDSM — ${tab.titulo.toUpperCase()} (RELATÓRIO DETALHADO)
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 2px;">
            Coordenadoria de Articulação com os Municípios (CAM) · SEDUC-RO
          </div>
        </div>
        <div style="text-align:right; font-size: 9.5px; color: #475569;">
          <span>Total: <strong>${filtrados.length} registros</strong></span>
          ${tab.temValor ? `<span style="margin: 0 8px; color: #cbd5e1;">|</span><span>Valor: <strong>${formatMoedaGDSM(totalValor)}</strong></span>` : ''}
          <div style="font-size: 8.5px; color: #94a3b8; margin-top: 2px;">Emitido em: ${dataHoraEmissao}</div>
        </div>
      </div>

      <!-- Tabela -->
      <table style="width:100%; border-collapse:collapse; font-size:8px; table-layout:fixed; word-wrap:break-word;">
        <thead>
          <tr style="background:#0f172a; color:#ffffff; page-break-inside: avoid; break-inside: avoid;">
            ${theadHtml}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Rodapé -->
      <div style="margin-top: 12px; border-top: 1.5px solid #cbd5e1; padding-top: 6px; font-size: 8.5px; color: #64748b; display:flex; justify-content:space-between;">
        <span>SEDUC Processos · CAM / GDSM · Relatório Detalhado de Auditoria</span>
        <span>Aba: ${tab.titulo} · Ordenado por Município</span>
      </div>
    </div>
  `;

  executarImpressaoGDSM(html, `RELATORIO_DETALHADO_${tabKey.toUpperCase()}`);
}

// Execução da Impressão em Janela Própria / Container com @media print
function executarImpressaoGDSM(htmlContent, reportTitle) {
  let container = document.getElementById('print-layout-gdsm');
  if (!container) {
    container = document.createElement('div');
    container.id = 'print-layout-gdsm';
    container.className = 'print-only-layout';
    document.body.appendChild(container);
  }
  container.innerHTML = htmlContent;

  // Oculta os outros layouts de impressão
  ['print-layout-padrao', 'print-layout-padrao-adm', 'print-layout-padrao-adm-2', 'print-layout-detalhado', 'print-layout-analise'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  container.style.display = 'block';

  // Esconder páginas em tela
  document.querySelectorAll('.page').forEach(p => { p.style.display = 'none'; });

  document.body.classList.add('print-mode-gdsm');

  const origTitle = document.title;
  const hoje = new Date().toISOString().split('T')[0];
  document.title = `${reportTitle}_${hoje}`;

  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      @page { size: A4 landscape !important; margin: 8mm !important; }
      .sidebar, .topbar, .section-header, .filters-bar, .table-wrap, .pagination, #export-buttons, .charts-grid, .dashboard, .modal-overlay, .page {
        display: none !important;
      }
      #print-layout-gdsm {
        display: block !important;
        position: static !important;
        width: 100% !important;
        background: white !important;
      }
      #print-layout-gdsm table th {
        background-color: #0f172a !important;
        color: #ffffff !important;
        border: 1px solid #334155 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      #print-layout-gdsm tr:nth-child(even) td {
        background-color: #f8fafc !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
  document.head.appendChild(style);

  const cleanupPrint = () => {
    document.title = origTitle;
    if (document.head.contains(style)) document.head.removeChild(style);
    document.body.classList.remove('print-mode-gdsm');
    container.style.display = 'none';
    document.querySelectorAll('.page.active').forEach(p => { p.style.display = ''; });
    window.removeEventListener('afterprint', cleanupPrint);
  };

  window.addEventListener('afterprint', cleanupPrint);
  window.print();
  setTimeout(cleanupPrint, 1000);
}

// Expõe globalmente
window.carregarGDSM = carregarGDSM;
window.aplicarFiltrosGDSM = aplicarFiltrosGDSM;
window.limparFiltrosGDSM = limparFiltrosGDSM;
window.exportarExcelGDSM = exportarExcelGDSM;
window.abrirPlanilhaGDSM = abrirPlanilhaGDSM;
window.imprimirGDSMSimplificado = imprimirGDSMSimplificado;
window.imprimirGDSMDetalhado = imprimirGDSMDetalhado;
window.toggleFiltrosGDSM = toggleFiltrosGDSM;
window.mudarPaginaGDSM = mudarPaginaGDSM;
window.ordenarGDSM = ordenarGDSM;
