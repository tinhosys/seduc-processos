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
  aee: { busca: '', status: '' },
  onibus: { busca: '', status: '' },
  veiculos: { busca: '', status: '' },
  reordenamento: { busca: '', status: '' },
  cooperacao: { busca: '', status: '' }
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

// Renderizar tabela e filtros de um módulo GMAC
function renderizarGMAC(modulo) {
  const container = document.getElementById(`tabela-container-${modulo}`);
  if (!container) return;

  const rows = window.gmacCache[modulo] || [];
  const headers = window.gmacHeaders[modulo] || [];
  const filtro = window.gmacFiltros[modulo] || { busca: '', status: '' };

  // Atualizar contador badge
  const badge = document.getElementById(`badge-total-${modulo}`);
  if (badge) badge.textContent = `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}`;

  // Filtragem
  const filtrados = rows.filter(r => {
    // Busca por texto livre em todos os campos
    if (filtro.busca) {
      const termo = filtro.busca.toLowerCase();
      const match = Object.values(r).some(v => String(v || '').toLowerCase().includes(termo));
      if (!match) return false;
    }
    // Filtro por status
    if (filtro.status) {
      const st = (r.Status || r.STATUS || r.SITUACAO || '').toLowerCase();
      if (!st.includes(filtro.status.toLowerCase())) return false;
    }
    return true;
  });

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; color:#94a3b8;">
        <span style="font-size:36px; display:block; margin-bottom:12px;">🔍</span>
        <p style="font-size:15px; font-weight:600; color:#e2e8f0;">Nenhum registro encontrado</p>
        <p style="font-size:13px; margin-top:4px;">${filtro.busca ? 'Tente ajustar os termos da sua pesquisa.' : 'Clique no botão "+ Novo Registro" para cadastrar o primeiro item.'}</p>
      </div>`;
    return;
  }

  // Montar tabela
  let html = `
    <div style="overflow-x:auto; max-height: calc(100vh - 310px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
      <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;">
        <thead style="position:sticky; top:0; z-index:10; background:#0f172a; border-bottom:2px solid rgba(255,255,255,0.1);">
          <tr>
            <th style="padding:12px 14px; color:#94a3b8; font-weight:700; width:60px; text-align:center;">#</th>`;

  headers.forEach(h => {
    html += `<th style="padding:12px 14px; color:#cbd5e1; font-weight:700; white-space:nowrap;">${h}</th>`;
  });

  html += `
            <th style="padding:12px 14px; color:#94a3b8; font-weight:700; text-align:center; width:90px;">Ações</th>
          </tr>
        </thead>
        <tbody>`;

  filtrados.forEach((r, idx) => {
    const zebra = idx % 2 === 0 ? 'background:rgba(255,255,255,0.015);' : 'background:transparent;';
    html += `
          <tr style="${zebra} border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s;" onmouseover="this.style.background='rgba(59,130,246,0.08)'" onmouseout="this.style.background='${idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}'">
            <td style="padding:10px 14px; text-align:center; color:#64748b; font-size:11px; font-weight:600;">${idx + 1}</td>`;

    headers.forEach(h => {
      const val = r[h] !== undefined ? String(r[h]).trim() : '';
      let rendered = val;

      // Badges para status
      const hLow = h.toLowerCase();
      if (hLow.includes('status') || hLow.includes('situacao')) {
        rendered = renderBadgeStatusGMAC(val);
      } else if (hLow.includes('processo')) {
        rendered = `<span style="font-family:monospace; color:#38bdf8; font-weight:600;">${val || '-'}</span>`;
      } else if (hLow === 'item' || hLow === 'quant.') {
        rendered = `<span style="color:#94a3b8; font-weight:700;">${val}</span>`;
      } else if (hLow.includes('valor')) {
        rendered = `<span style="color:#34d399; font-weight:600;">${val}</span>`;
      }

      html += `<td style="padding:10px 14px; color:#e2e8f0;">${rendered || '-'}</td>`;
    });

    html += `
            <td style="padding:10px 14px; text-align:center;">
              <button type="button" onclick="abrirModalGMAC('${modulo}', ${r._rowNumber})" class="btn btn-ghost" style="padding:6px 10px; font-size:12px; border:1px solid rgba(255,255,255,0.12); color:#60a5fa; border-radius:6px;" title="Editar Registro">
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

// Badge visual para status no GMAC
function renderBadgeStatusGMAC(status) {
  if (!status) return `<span style="color:#64748b;">-</span>`;
  const s = status.toLowerCase();
  let bg = 'rgba(148,163,184,0.15)';
  let color = '#94a3b8';
  let border = 'rgba(148,163,184,0.3)';

  if (s.includes('finalizado') || s.includes('concluído') || s.includes('entregue') || s === 'ok' || s.includes('autorizo')) {
    bg = 'rgba(34,197,94,0.15)';
    color = '#4ade80';
    border = 'rgba(34,197,94,0.3)';
  } else if (s.includes('instrução') || s.includes('trâmite') || s.includes('andamento') || s.includes('análise') || s.includes('tramitação')) {
    bg = 'rgba(234,179,8,0.15)';
    color = '#facc15';
    border = 'rgba(234,179,8,0.3)';
  } else if (s.includes('não entregue') || s.includes('não assinaram') || s.includes('sem certidão') || s.includes('não tem interesse')) {
    bg = 'rgba(239,68,68,0.15)';
    color = '#f87171';
    border = 'rgba(239,68,68,0.3)';
  }

  return `<span style="display:inline-block; padding:3px 8px; font-size:11px; font-weight:700; border-radius:6px; background:${bg}; color:${color}; border:1px solid ${border}; white-space:nowrap;">${status}</span>`;
}

// Abrir modal de formulário (Novo ou Edição)
function abrirModalGMAC(modulo, rowNumber = null) {
  const cfg = GMAC_MODULOS[modulo];
  if (!cfg) return;

  window.gmacEditando = { modulo, rowNumber };
  const headers = window.gmacHeaders[modulo] || [];
  const rows = window.gmacCache[modulo] || [];
  const registro = rowNumber ? rows.find(r => r._rowNumber === rowNumber) : null;

  const modal = document.getElementById('modal-gmac-form');
  const tituloEl = document.getElementById('modal-gmac-titulo');
  const subEl = document.getElementById('modal-gmac-subtitulo');
  const fieldsContainer = document.getElementById('modal-gmac-fields');

  if (tituloEl) tituloEl.textContent = rowNumber ? `✏️ Editar: ${cfg.titulo}` : `✨ Novo Registro: ${cfg.titulo}`;
  if (subEl) subEl.textContent = rowNumber ? `Editando linha ${rowNumber} da planilha` : `Preencha os campos para salvar na planilha`;

  // Construir campos do formulário baseados nos cabeçalhos
  let fieldsHtml = '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">';

  headers.forEach(h => {
    const val = registro && registro[h] !== undefined ? registro[h] : '';
    const hLow = h.toLowerCase();
    const isAutoId = (hLow === 'item' || hLow === 'quant.') && !rowNumber;
    const placeholder = isAutoId ? 'Automático' : `Informe ${h}...`;

    fieldsHtml += `
      <div class="form-group" style="margin-bottom:0;">
        <label style="display:block; font-size:12.5px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">${h}</label>`;

    if (hLow === 'observacões' || hLow === 'documentos') {
      fieldsHtml += `
        <textarea name="${h}" class="input-gmac-field" rows="2" style="width:100%; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.12); border-radius:8px; color:#f8fafc; font-size:13px; outline:none; resize:vertical;">${val}</textarea>`;
    } else {
      fieldsHtml += `
        <input type="text" name="${h}" value="${val.replace(/"/g, '&quot;')}" placeholder="${placeholder}" class="input-gmac-field" style="width:100%; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.12); border-radius:8px; color:#f8fafc; font-size:13px; outline:none;" autocomplete="off">`;
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

// Filtro dinâmico por busca
function filtrarBuscaGMAC(modulo, texto) {
  if (!window.gmacFiltros[modulo]) window.gmacFiltros[modulo] = { busca: '', status: '' };
  window.gmacFiltros[modulo].busca = (texto || '').trim();
  renderizarGMAC(modulo);
}
