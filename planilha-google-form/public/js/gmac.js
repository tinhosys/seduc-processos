// ============================================================
// SEDUC - Módulo GMAC (Controle Processual e Formulários)
// ============================================================

window.gmacCache = {
  aee: [],
  onibus: [],
  veiculos: [],
  reordenamento: [],
  cooperacao: []
};

window.gmacHeaders = {};
window.gmacFiltros = {
  aee: { busca: '', municipio: '', status: '' },
  onibus: { busca: '', municipio: '', status: '' },
  veiculos: { busca: '', municipio: '', status: '' },
  reordenamento: { busca: '', municipio: '', status: '' },
  cooperacao: { busca: '', municipio: '', status: '' }
};

window.gmacEditando = {
  modulo: null,
  rowNumber: null
};

const GMAC_MODULOS = {
  'aee': {
    titulo: 'Equipamento - AEE',
    icone: '🎒',
    subtitulo: 'Doação de equipamento e mobiliário - AEE'
  },
  'onibus': {
    titulo: 'Doação do Ônibus Escolar',
    icone: '🚌',
    subtitulo: 'Controle de doação e regularização patrimonial de frotas escolares'
  },
  'veiculos': {
    titulo: 'Doação Definitiva de Veículos',
    icone: '🚗',
    subtitulo: 'Acompanhamento processual de doação definitiva de veículos'
  },
  'reordenamento': {
    titulo: 'Municipalização e Reordenamento',
    icone: '🏛️',
    subtitulo: 'Controle de processos de municipalização e reordenamento escolar'
  },
  'cooperacao': {
    titulo: 'Termo de Cooperação',
    icone: '🤝',
    subtitulo: 'Gestão de termos de cooperação técnica e administrativa com municípios'
  }
};

// Verifica se a coluna deve ser oculta (ex: marcadas de vermelho pelo usuário: #, Item, Quant.)
function isColunaOcultaGMAC(header) {
  if (!header) return true;
  const h = header.toString().trim().toLowerCase();
  return h === '#' || h === 'item' || h === 'quant.' || h === 'quant' || h === 'quantidade';
}

// Retorna cabeçalhos visíveis organizados:
// 1. 'MUNICÍPIO' sempre à primeira esquerda
// 2. 'ID'/'IDS' trazido para a esquerda (logo após Município)
// 3. 'TIPO OBJETO' trazido mais para o centro (logo após OBJETO)
function getVisibleHeadersGMAC(rawHeaders) {
  const visiveis = (rawHeaders || []).filter(h => !isColunaOcultaGMAC(h));
  
  // 1. Localizar a coluna de Município e colocar na primeira posição (índice 0)
  const munIdx = visiveis.findIndex(h => {
    const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm === 'municipio' || norm === 'municipios';
  });

  if (munIdx > 0) {
    const [colMun] = visiveis.splice(munIdx, 1);
    visiveis.unshift(colMun);
  }

  // 2. Trazer a coluna de ID / IDS para a esquerda (posição 1, logo após Município)
  const idIdx = visiveis.findIndex(h => {
    const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm === 'id' || norm === 'ids';
  });

  if (idIdx > 1) {
    const [colId] = visiveis.splice(idIdx, 1);
    visiveis.splice(1, 0, colId);
  }

  // 3. Trazer 'TIPO OBJETO' mais para o centro (logo após a coluna de OBJETO)
  const tipoObjIdx = visiveis.findIndex(h => {
    const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm.includes('tipo') && norm.includes('objeto');
  });

  if (tipoObjIdx !== -1) {
    const objIdx = visiveis.findIndex(h => {
      const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return norm === 'objeto' || (norm.includes('objeto') && !norm.includes('tipo'));
    });

    if (objIdx !== -1 && tipoObjIdx > objIdx) {
      const [colTipoObj] = visiveis.splice(tipoObjIdx, 1);
      const newObjIdx = visiveis.findIndex(h => {
        const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return norm === 'objeto' || (norm.includes('objeto') && !norm.includes('tipo'));
      });
      visiveis.splice(newObjIdx + 1, 0, colTipoObj);
    }
  }

  return visiveis;
}

// Estilização dinâmica e equilibrada por tipo de coluna (trazendo colunas para a esquerda e evitando vácuos)
function getColStyleGMAC(header) {
  const h = (header || '').toLowerCase().trim();
  const norm = h.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (norm === 'municipio' || norm === 'municipios') {
    return 'width:160px; min-width:140px; word-break:break-word; overflow-wrap:break-word; white-space:normal; font-weight:700; color:#f8fafc;';
  }
  if (norm === 'id' || norm === 'ids') {
    return 'width:85px; min-width:75px; text-align:center; font-family:ui-monospace, monospace; font-weight:700; color:#cbd5e1;';
  }
  if (norm.includes('processo') || norm.includes('sei')) {
    return 'width:245px; min-width:230px; white-space:nowrap;';
  }
  if (norm.includes('placa') || norm.includes('renavam') || norm.includes('chassi') || norm.includes('crlv')) {
    return 'width:110px; min-width:95px; white-space:nowrap; font-family:ui-monospace, monospace; font-weight:600; text-align:center;';
  }
  if (norm.includes('status')) {
    return 'width:145px; min-width:130px; text-align:center; word-break:break-word; overflow-wrap:break-word; white-space:normal;';
  }
  if (norm === 'situacao' || norm.includes('situacao')) {
    return 'width:230px; min-width:190px; text-align:center; white-space:normal; line-height:1.35; word-break:break-word; overflow-wrap:break-word;';
  }
  if (norm.includes('termo ass') || norm.includes('termo de doacao') || norm.includes('termo')) {
    return 'width:210px; min-width:170px; text-align:center; white-space:normal; line-height:1.35; word-break:break-word; overflow-wrap:break-word;';
  }
  if (norm === 'forma') {
    return 'width:90px; min-width:80px; text-align:center;';
  }
  if (norm.includes('tipo') && norm.includes('objeto')) {
    return 'width:150px; min-width:130px; text-align:center; word-break:break-word; overflow-wrap:break-word; white-space:normal;';
  }
  if (norm === 'objeto' || (norm.includes('objeto') && !norm.includes('tipo'))) {
    return 'width:230px; min-width:180px; line-height:1.35; white-space:normal; word-break:break-word; overflow-wrap:break-word;';
  }
  if (norm.includes('escola') || norm.includes('secretaria') || norm.includes('localizacao')) {
    return 'width:210px; min-width:170px; line-height:1.35; white-space:normal; word-break:break-word; overflow-wrap:break-word;';
  }
  if (norm.includes('data') || norm.includes('vigencia')) {
    return 'width:115px; min-width:105px; white-space:nowrap; text-align:center;';
  }
  if (norm.includes('valor')) {
    return 'width:120px; min-width:110px; white-space:nowrap; text-align:right;';
  }
  if (norm.includes('contato')) {
    return 'width:180px; min-width:150px; font-size:12px; line-height:1.35; white-space:normal; word-break:break-word; overflow-wrap:break-word;';
  }
  if (norm.includes('observ') || norm.includes('documento') || norm.includes('parecer')) {
    return 'width:220px; min-width:180px; line-height:1.35; white-space:normal; word-break:break-word; overflow-wrap:break-word;';
  }
  return 'width:170px; min-width:140px; line-height:1.35; white-space:normal; word-break:break-word; overflow-wrap:break-word;';
}

// Badge visual para status no GMAC com cores específicas por status (Imagem 1: Não Entregue Vermelho, Entregue Verde)
function renderBadgeStatusGMAC(status) {
  if (!status) return `<span style="color:#64748b;">-</span>`;
  const s = String(status).trim();
  const sLow = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let bg = 'rgba(148,163,184,0.12)';
  let color = '#cbd5e1';
  let border = 'rgba(148,163,184,0.25)';

  // 1. PRIMEIRO: Negativas / Pendências / Recusa / Alerta / Não Entregue (VERMELHO)
  if (sLow.includes('nao entregue') || sLow.includes('nao assinaram') || sLow.includes('sem certidao') || sLow.includes('nao tem interesse') || sLow.includes('cancelad') || sLow.includes('rejeit') || sLow.includes('recusad') || sLow.includes('indeferid') || sLow.includes('inativ')) {
    bg = 'rgba(239,68,68,0.2)';
    color = '#f87171';
    border = 'rgba(239,68,68,0.45)';
  }
  // 2. SEGUNDO: Positivas / Concluído / Regular / Entregue (VERDE)
  else if (sLow.includes('entregue') || sLow.includes('concluid') || sLow.includes('vigente') || sLow.includes('publicad') || sLow.includes('efetivad') || sLow.includes('aprovad') || sLow.includes('ativo') || sLow.includes('regular') || sLow.includes('assinado')) {
    bg = 'rgba(16,185,129,0.2)';
    color = '#34d399';
    border = 'rgba(16,185,129,0.45)';
  }
  // 3. TERCEIRO: Em Andamento / Análise / Pendente (AMARELO / LARANJA)
  else if (sLow.includes('analise') || sLow.includes('tramit') || sLow.includes('pendent') || sLow.includes('aguard') || sLow.includes('em andamento') || sLow.includes('solicitad')) {
    bg = 'rgba(245,158,11,0.2)';
    color = '#fbbf24';
    border = 'rgba(245,158,11,0.45)';
  }

  return `
    <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:700; border-radius:6px; background:${bg}; color:${color}; border:1px solid ${border}; box-shadow:0 1px 4px rgba(0,0,0,0.2); white-space:normal; word-break:break-word; overflow-wrap:break-word; max-width:100%; line-height:1.25; text-align:center; box-sizing:border-box;">
      ${s}
    </span>`;
}

// Função para copiar o número do processo para o clipboard com feedback
window.copiarTextoProcessoGMAC = function(texto) {
  if (!texto || texto === '-') return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(() => {
      if (typeof toast === 'function') toast('Processo copiado: ' + texto, 'success');
      else if (typeof showToast === 'function') showToast('Processo copiado: ' + texto, 'success');
      else alert('Processo copiado: ' + texto);
    }).catch(() => {
      copiarFallbackGMAC(texto);
    });
  } else {
    copiarFallbackGMAC(texto);
  }
};

function copiarFallbackGMAC(texto) {
  const ta = document.createElement('textarea');
  ta.value = texto;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    if (typeof toast === 'function') toast('Processo copiado: ' + texto, 'success');
    else alert('Processo copiado: ' + texto);
  } catch(e) {
    prompt('Copie o processo:', texto);
  }
  document.body.removeChild(ta);
}

// Carregar dados de um módulo GMAC
async function carregarGMAC(modulo, silencioso = false) {
  if (!GMAC_MODULOS[modulo]) return;
  const container = document.getElementById(`tabela-container-${modulo}`);
  if (!silencioso && container) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#94a3b8;">
        <div class="spinner" style="margin: 0 auto 16px;"></div>
        <p style="font-size:14px;">Carregando dados de ${GMAC_MODULOS[modulo].titulo} do Google Sheets...</p>
      </div>`;
  }

  try {
    const base = typeof API_BASE !== 'undefined' ? API_BASE : 'https://seduc-backend.onrender.com';
    const res = await fetch(`${base}/api/gmac/${modulo}`, {
      headers: typeof getHeaders === 'function' ? getHeaders() : {}
    });

    if (!res.ok) throw new Error(`Falha HTTP ${res.status}`);
    const data = await res.json();

    window.gmacCache[modulo] = data.rows || [];
    window.gmacHeaders[modulo] = data.headers || [];

    // Atualizar selects de filtros da tela
    atualizarFiltrosSelectGMAC(modulo);

    renderizarGMAC(modulo);
  } catch(err) {
    console.error(`Erro ao carregar GMAC (${modulo}):`, err);
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#ef4444; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); border-radius:12px;">
          <p style="font-size:16px; font-weight:700; margin-bottom:8px;">⚠️ Erro ao carregar dados</p>
          <p style="font-size:13px; color:#94a3b8; margin-bottom:16px;">${err.message || 'Verifique a conexão com a planilha do Google.'}</p>
          <button type="button" onclick="carregarGMAC('${modulo}')" class="btn btn-primary" style="padding:8px 18px; font-size:13px;">🔄 Tentar Novamente</button>
        </div>`;
    }
  }
}

// Popula os selects de Município e Status com opções únicas
function atualizarFiltrosSelectGMAC(modulo) {
  const rows = window.gmacCache[modulo] || [];
  const rawHeaders = window.gmacHeaders[modulo] || [];

  const munSelect = document.getElementById(`filtro-mun-${modulo}`);
  const statusSelect = document.getElementById(`filtro-status-${modulo}`);

  // 1. Identificar coluna de município
  const munCol = rawHeaders.find(h => {
    const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm === 'municipio' || norm === 'municipios';
  });

  if (munSelect && munCol) {
    const valAtual = munSelect.value;
    const municipios = [...new Set(rows.map(r => (r[munCol] || '').toString().trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    let opts = `<option value="">🏛️ Todos os Municípios (${municipios.length})</option>`;
    municipios.forEach(m => {
      opts += `<option value="${m.replace(/"/g, '&quot;')}" ${m === valAtual ? 'selected' : ''}>${m}</option>`;
    });
    munSelect.innerHTML = opts;
  }

  // 2. Identificar coluna de status / situação
  const statusCol = rawHeaders.find(h => {
    const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm.includes('status') || norm.includes('situacao');
  });

  if (statusSelect && statusCol) {
    const valAtual = statusSelect.value;
    const statuses = [...new Set(rows.map(r => (r[statusCol] || '').toString().trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    let opts = `<option value="">📌 Todos os Status (${statuses.length})</option>`;
    statuses.forEach(s => {
      opts += `<option value="${s.replace(/"/g, '&quot;')}" ${s === valAtual ? 'selected' : ''}>${s}</option>`;
    });
    statusSelect.innerHTML = opts;
  }
}

// Obter registros filtrados de acordo com os parâmetros em tela
function getRegistrosFiltradosGMAC(modulo) {
  const rows = window.gmacCache[modulo] || [];
  const rawHeaders = window.gmacHeaders[modulo] || [];
  const filtro = window.gmacFiltros[modulo] || { busca: '', municipio: '', status: '' };

  const munCol = rawHeaders.find(h => {
    const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm === 'municipio' || norm === 'municipios';
  });

  const statusCol = rawHeaders.find(h => {
    const norm = (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm.includes('status') || norm.includes('situacao');
  });

  return rows.filter(r => {
    // 1. Filtro por Município
    if (filtro.municipio && munCol) {
      const valMun = (r[munCol] || '').toString().trim();
      if (valMun.toLowerCase() !== filtro.municipio.toLowerCase()) return false;
    }

    // 2. Filtro por Status
    if (filtro.status && statusCol) {
      const valStatus = (r[statusCol] || '').toString().trim();
      if (valStatus.toLowerCase() !== filtro.status.toLowerCase()) return false;
    }

    // 3. Busca livre de texto em todos os campos
    if (filtro.busca) {
      const termo = filtro.busca.toLowerCase();
      const match = Object.values(r).some(v => String(v || '').toLowerCase().includes(termo));
      if (!match) return false;
    }

    return true;
  });
}

// Renderizar tabela de um módulo GMAC
function renderizarGMAC(modulo) {
  const container = document.getElementById(`tabela-container-${modulo}`);
  if (!container) return;

  const rawHeaders = window.gmacHeaders[modulo] || [];
  const headers = getVisibleHeadersGMAC(rawHeaders);
  const filtrados = getRegistrosFiltradosGMAC(modulo);
  const rowsTotal = window.gmacCache[modulo] || [];

  // Atualizar contador badge
  const badge = document.getElementById(`badge-total-${modulo}`);
  if (badge) {
    if (filtrados.length !== rowsTotal.length) {
      badge.textContent = `${filtrados.length} de ${rowsTotal.length} registros`;
    } else {
      badge.textContent = `${rowsTotal.length} ${rowsTotal.length === 1 ? 'registro' : 'registros'}`;
    }
  }

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; color:#94a3b8;">
        <span style="font-size:36px; display:block; margin-bottom:12px;">🔍</span>
        <p style="font-size:15px; font-weight:600; color:#e2e8f0;">Nenhum registro encontrado com os filtros atuais</p>
        <p style="font-size:13px; margin-top:4px;">Tente ajustar os parâmetros de pesquisa ou clique em "Limpar".</p>
      </div>`;
    return;
  }

  // Montar tabela sem as colunas ocultadas e com MUNICÍPIO na primeira coluna
  let html = `
    <div class="table-wrap gmac-table-wrap" style="overflow-x:scroll !important; overflow-y:auto !important; max-height: calc(100vh - 310px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; background: rgba(15,23,42,0.6); width:100%; box-sizing:border-box;">
      <table style="width:100%; min-width:1250px; table-layout:fixed; border-collapse:separate; border-spacing:0; text-align:left; font-size:13px;">
        <thead style="position:sticky; top:0; z-index:10; background:#0f172a; border-bottom:2px solid rgba(255,255,255,0.1);">
          <tr>`;

  headers.forEach(h => {
    const colStyle = getColStyleGMAC(h);
    html += `<th style="padding:12px 14px; color:#cbd5e1; font-weight:700; box-sizing:border-box; ${colStyle}">${h}</th>`;
  });

  html += `
            <th style="padding:12px 14px; color:#94a3b8; font-weight:700; text-align:center; width:85px; min-width:85px; box-sizing:border-box;">Ações</th>
          </tr>
        </thead>
        <tbody>`;

  filtrados.forEach((r, idx) => {
    const zebra = idx % 2 === 0 ? 'background:rgba(255,255,255,0.015);' : 'background:transparent;';
    html += `
          <tr style="${zebra} border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s;" onmouseover="this.style.background='rgba(59,130,246,0.08)'" onmouseout="this.style.background='${idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}'">`;

    headers.forEach(h => {
      const val = r[h] !== undefined ? String(r[h]).trim() : '';
      let rendered = val;

      const norm = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // 1. Colunas de Processo (com Botão Copiar e Botão SEI)
      if (norm.includes('processo') || norm.includes('sei')) {
        if (val && val !== '-') {
          const valEscaped = val.replace(/'/g, "\\'");
          rendered = `
            <div style="display:inline-flex; align-items:center; gap:6px; flex-wrap:nowrap;">
              <span style="font-family:ui-monospace, monospace; color:#38bdf8; font-weight:700; font-size:12px; white-space:nowrap;">${val}</span>
              <button type="button" onclick="copiarTextoProcessoGMAC('${valEscaped}')" style="padding:3px 7px; font-size:10px; display:inline-flex; align-items:center; gap:3px; border:none; border-radius:4px; background:#2563eb; color:#ffffff; cursor:pointer; font-weight:600; white-space:nowrap;" title="Copiar Número do Processo">
                📋 Copiar
              </button>
              <a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI" target="_blank" style="padding:2px 5px; height:19px; display:inline-flex; align-items:center; justify-content:center; background:#ffffff; border-radius:4px; text-decoration:none;" title="Acessar SEI Rondônia">
                <img src="img/logo-sei.png" style="height:13px; object-fit:contain;" alt="SEI">
              </a>
            </div>`;
        } else {
          rendered = `<span style="color:#64748b;">-</span>`;
        }
      }
      // 2. Colunas de Status
      else if (norm.includes('status')) {
        rendered = renderBadgeStatusGMAC(val);
      }
      // 3. Coluna de Situação (Imagem 2: quebra dentro da coluna e centralizada)
      else if (norm === 'situacao' || norm.includes('situacao')) {
        rendered = `
          <div style="display:inline-block; width:100%; max-width:210px; text-align:center; white-space:normal; word-break:break-word; font-size:12px; line-height:1.35; color:#cbd5e1;">
            ${val || '-'}
          </div>`;
      }
      // 4. Termo Ass. Pref. / Termo de Doação (Regra de Ouro: quebra dentro da coluna, sem sobrepor)
      else if (norm.includes('termo ass') || norm.includes('termo de doacao') || norm.includes('termo')) {
        if (val.toLowerCase() === 'ok') {
          rendered = `<span style="display:inline-block; padding:3px 8px; font-size:11px; font-weight:700; border-radius:6px; background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3);">OK</span>`;
        } else if (val && val !== '-') {
          rendered = `<div style="display:inline-block; width:100%; text-align:center; white-space:normal; word-break:break-word; overflow-wrap:break-word; font-size:12px; line-height:1.35; color:#cbd5e1;">${val}</div>`;
        } else {
          rendered = `<span style="color:#64748b;">-</span>`;
        }
      }
      // 5. Valores
      else if (norm.includes('valor')) {
        rendered = `<span style="color:#34d399; font-weight:600;">${val}</span>`;
      }

      const colStyle = getColStyleGMAC(h);
      html += `<td style="padding:10px 12px; color:#e2e8f0; vertical-align:middle; box-sizing:border-box; word-break:break-word; overflow-wrap:break-word; ${colStyle}">${rendered || '-'}</td>`;
    });

    html += `
            <td style="padding:10px 14px; text-align:center; width:85px; min-width:85px;">
              <button type="button" onclick="abrirModalGMAC('${modulo}', ${r._rowNumber})" class="btn btn-ghost" style="padding:6px 10px; font-size:12px; border:1px solid rgba(255,255,255,0.12); color:#60a5fa; border-radius:6px; cursor:pointer;" title="Editar Registro">
                ✏️ Editar
              </button>
            </td>
          </tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>`;

  container.innerHTML = html;
}

// Manipulador da busca e filtros por parâmetros
function filtrarParametrosGMAC(modulo) {
  if (!window.gmacFiltros[modulo]) {
    window.gmacFiltros[modulo] = { busca: '', municipio: '', status: '' };
  }

  const buscaInput = document.getElementById(`filtro-busca-${modulo}`);
  const munSelect = document.getElementById(`filtro-mun-${modulo}`);
  const statusSelect = document.getElementById(`filtro-status-${modulo}`);

  window.gmacFiltros[modulo].busca = buscaInput ? buscaInput.value.trim() : '';
  window.gmacFiltros[modulo].municipio = munSelect ? munSelect.value.trim() : '';
  window.gmacFiltros[modulo].status = statusSelect ? statusSelect.value.trim() : '';

  renderizarGMAC(modulo);
}

// Limpar todos os filtros daquele módulo
function limparFiltrosGMAC(modulo) {
  window.gmacFiltros[modulo] = { busca: '', municipio: '', status: '' };

  const buscaInput = document.getElementById(`filtro-busca-${modulo}`);
  const munSelect = document.getElementById(`filtro-mun-${modulo}`);
  const statusSelect = document.getElementById(`filtro-status-${modulo}`);

  if (buscaInput) buscaInput.value = '';
  if (munSelect) munSelect.value = '';
  if (statusSelect) statusSelect.value = '';

  renderizarGMAC(modulo);
}

// Compatibilidade com chamada simples de busca
function filtrarBuscaGMAC(modulo, texto) {
  if (!window.gmacFiltros[modulo]) window.gmacFiltros[modulo] = { busca: '', municipio: '', status: '' };
  window.gmacFiltros[modulo].busca = (texto || '').trim();
  renderizarGMAC(modulo);
}

// ============================================================
// RELATÓRIO PADRÁO DE IMPRESSÁO GMAC (A4 PAISAGEM)
// ============================================================
function imprimirRelatorioGMAC(modulo) {
  const cfg = GMAC_MODULOS[modulo];
  if (!cfg) return;

  const rawHeaders = window.gmacHeaders[modulo] || [];
  const headers = getVisibleHeadersGMAC(rawHeaders);
  const filtrados = getRegistrosFiltradosGMAC(modulo);
  const filtro = window.gmacFiltros[modulo] || {};

  if (filtrados.length === 0) {
    if (typeof toast === 'function') {
      toast('Não há registros filtrados para gerar o relatório.', 'error');
    } else {
      alert('Não há registros filtrados para gerar o relatório.');
    }
    return;
  }

  const agora = new Date();
  const dataHora = agora.toLocaleDateString('pt-BR') + ', ' + agora.toLocaleTimeString('pt-BR');
  const munTexto = filtro.municipio ? filtro.municipio : 'Todos os Municípios';
  const statusTexto = filtro.status ? filtro.status : 'Todos os Status';
  const buscaTexto = filtro.busca ? `"${filtro.busca}"` : 'Nenhum termo';

  let theadHtml = '<tr><th style="width:35px; text-align:center;">#</th>';
  headers.forEach(h => {
    theadHtml += `<th>${h}</th>`;
  });
  theadHtml += '</tr>';

  let tbodyHtml = '';
  filtrados.forEach((r, idx) => {
    tbodyHtml += `<tr><td style="text-align:center; font-weight:bold; color:#475569;">${idx + 1}</td>`;
    headers.forEach(h => {
      const val = r[h] !== undefined ? String(r[h]).trim() : '';
      tbodyHtml += `<td>${val || '-'}</td>`;
    });
    tbodyHtml += '</tr>';
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups no seu navegador para visualizar o relatório de impressão.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório - ${cfg.titulo} (SEDUC/RO)</title>
      <style>
        @media print {
          @page { size: A4 landscape !important; margin: 10mm !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 8.5pt;
          color: #0f172a;
          margin: 0;
          padding: 10mm;
          background: #ffffff;
        }
        .official-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 6px;
          margin-bottom: 10px;
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
        .filter-badge-bar {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          padding: 6px 12px;
          margin-bottom: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 8.5pt;
          color: #1e40af;
        }
        .filter-item strong {
          color: #1e3a8a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 5px 6px;
          text-align: left;
          vertical-align: middle;
          box-sizing: border-box;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        th {
          background-color: #1e3a8a !important;
          color: #ffffff !important;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 8pt;
          border: 1px solid #93c5fd !important;
        }
        tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
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

      <div style="font-size:11px; font-weight:700; color:#1e3a8a; text-transform:uppercase; margin-bottom:6px;">
        Relatório Gerencial de Controle: ${cfg.titulo}
      </div>

      <div class="filter-badge-bar">
        <div class="filter-item"><strong>Município:</strong> ${munTexto}</div>
        <div class="filter-item"><strong>Status:</strong> ${statusTexto}</div>
        <div class="filter-item"><strong>Busca Textual:</strong> ${buscaTexto}</div>
        <div class="filter-item"><strong>Total Filtrado:</strong> ${filtrados.length} item(ns)</div>
      </div>

      <table>
        <thead>${theadHtml}</thead>
        <tbody>${tbodyHtml}</tbody>
      </table>

      <div class="official-footer">
        <div class="f-left">GMAC - GERÊNCIA DE MONITORAMENTO DAS AÇÕES DE COOPERAÇÁO</div>
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
}

// ============================================================
// MODAL DE FORMULÁRIO (NOVO OU EDIÇÁO)
// ============================================================
function abrirModalGMAC(modulo, rowNumber = null) {
  const cfg = GMAC_MODULOS[modulo];
  if (!cfg) return;

  window.gmacEditando = { modulo, rowNumber };
  const rawHeaders = window.gmacHeaders[modulo] || [];
  const headers = getVisibleHeadersGMAC(rawHeaders);
  const rows = window.gmacCache[modulo] || [];
  const registro = rowNumber ? rows.find(r => r._rowNumber === rowNumber) : null;

  const modal = document.getElementById('modal-gmac-form');
  const tituloEl = document.getElementById('modal-gmac-titulo');
  const subEl = document.getElementById('modal-gmac-subtitulo');
  const fieldsContainer = document.getElementById('modal-gmac-fields');

  if (!modal || !fieldsContainer) {
    console.error('Modal ou container de campos do GMAC não encontrado no DOM.');
    return;
  }

  if (tituloEl) tituloEl.textContent = rowNumber ? `✏️ Editar: ${cfg.titulo}` : `✨ Novo Registro: ${cfg.titulo}`;
  if (subEl) subEl.textContent = rowNumber ? `Editando linha ${rowNumber} da planilha` : `Preencha os campos para salvar na planilha`;

  // Construir campos do formulário baseados nos cabeçalhos visíveis
  let fieldsHtml = '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">';

  headers.forEach(h => {
    const val = registro && registro[h] !== undefined ? registro[h] : '';
    const hLow = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    fieldsHtml += `
      <div class="form-group" style="margin-bottom:0;">
        <label style="display:block; font-size:12.5px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">${h}</label>`;

    if (hLow.includes('observacao') || hLow.includes('documento') || hLow.includes('parecer')) {
      fieldsHtml += `
        <textarea name="${h}" class="input-gmac-field" rows="2" style="width:100%; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.12); border-radius:8px; color:#f8fafc; font-size:13px; outline:none; resize:vertical;">${val}</textarea>`;
    } else {
      fieldsHtml += `
        <input type="text" name="${h}" value="${val.replace(/"/g, '&quot;')}" placeholder="Informe ${h}..." class="input-gmac-field" style="width:100%; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.12); border-radius:8px; color:#f8fafc; font-size:13px; outline:none;" autocomplete="off">`;
    }

    fieldsHtml += `</div>`;
  });

  fieldsHtml += '</div>';
  fieldsContainer.innerHTML = fieldsHtml;

  modal.style.display = 'flex';
}

function fecharModalGMAC() {
  const modal = document.getElementById('modal-gmac-form');
  if (modal) modal.style.display = 'none';
  window.gmacEditando = { modulo: null, rowNumber: null };
}

// Salvar formulário GMAC no backend
async function salvarFormularioGMAC(evt) {
  if (evt) evt.preventDefault();
  const { modulo, rowNumber } = window.gmacEditando;
  if (!modulo) return;

  const btn = document.getElementById('btn-salvar-gmac');
  const originalText = btn ? btn.innerHTML : 'Salvar';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Salvando...';
  }

  // Coletar campos
  const payload = {};
  document.querySelectorAll('.input-gmac-field').forEach(input => {
    payload[input.name] = input.value.trim();
  });

  try {
    const base = typeof API_BASE !== 'undefined' ? API_BASE : 'https://seduc-backend.onrender.com';
    const method = rowNumber ? 'PUT' : 'POST';
    const url = rowNumber ? `${base}/api/gmac/${modulo}/${rowNumber}` : `${base}/api/gmac/${modulo}`;

    const res = await fetch(url, {
      method,
      headers: typeof getHeaders === 'function' ? getHeaders({ 'Content-Type': 'application/json' }) : { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.erro || 'Falha ao salvar');

    if (typeof toast === 'function') {
      toast(rowNumber ? 'Registro atualizado na planilha!' : 'Novo registro cadastrado na planilha!', 'success');
    }

    fecharModalGMAC();
    await carregarGMAC(modulo, true);
  } catch(err) {
    console.error('Erro ao salvar formulário GMAC:', err);
    if (typeof toast === 'function') {
      toast(`Erro ao salvar: ${err.message}`, 'error');
    } else {
      alert(`Erro: ${err.message}`);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

// Inicialização automática caso página ativa seja GMAC
document.addEventListener('DOMContentLoaded', () => {
  const hash = (window.location.hash || '').replace('#', '');
  if (hash && hash.startsWith('gmac-')) {
    const mod = hash.replace('gmac-', '');
    carregarGMAC(mod);
  }

  // Fechar modal ao clicar fora ou apertar ESC
  const modalEl = document.getElementById('modal-gmac-form');
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) fecharModalGMAC();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModalGMAC();
  });
});
