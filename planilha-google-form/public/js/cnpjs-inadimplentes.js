// ============================================================
// SEDUC PROCESSOS — MÓDULO CNPJs INADIMPLENTES & RELATÓRIO
// Versão: v1.149
// ============================================================

(function () {
  let _filtroTipoCnpjAtual = 'inadimplentes'; // 'inadimplentes', 'adimplentes', 'todos'
  let _cnpjsDistintosCache = [];
  let _estadoChecksImpressao = new Map(); // cnpj -> boolean
  let _expandidosProcessos = new Set(); // cnpjs com sub-tabela aberta
  let _edicoesAtivas = new Set(); // cnpjs com input de edição aberto

  // Auditoria de alterações (Data, Hora e Login do usuário)
  function carregarAuditoriaCNPJs() {
    try {
      return JSON.parse(localStorage.getItem('siscam_cnpj_inad_auditoria') || '{}');
    } catch (e) {
      return {};
    }
  }

  function salvarAuditoriaCNPJ(cnpjLimpo, acaoDescricao) {
    const audit = carregarAuditoriaCNPJs();
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, '0');
    const min = String(agora.getMinutes()).padStart(2, '0');
    const dataHoraFormatada = `${dia}/${mes}/${ano} ${hora}:${min}`;

    let usuario = 'Usuário';
    try {
      const raw = sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data");
      if (raw) {
        const u = JSON.parse(raw);
        usuario = u.nome || u.login || u.usuario || u.email || 'Admin';
      }
    } catch (e) {}

    audit[cnpjLimpo] = {
      timestamp: Date.now(),
      dataHora: dataHoraFormatada,
      usuario: usuario,
      acao: acaoDescricao || 'Atualizado'
    };

    try {
      localStorage.setItem('siscam_cnpj_inad_auditoria', JSON.stringify(audit));
    } catch (e) {}

    return audit[cnpjLimpo];
  }

  // Função DISTINCT para extrair CNPJs únicos da lista de processos
  function extrairCnpjsDistintos(processos) {
    const mapa = new Map();
    const lista = Array.isArray(processos) ? processos : [];
    const auditMap = carregarAuditoriaCNPJs();

    lista.forEach(p => {
      const rawCnpj = p.cnpj ? String(p.cnpj).trim() : '';
      const limpo = rawCnpj.replace(/\D/g, '');
      if (limpo.length !== 14 || /^0+$/.test(limpo)) return;

      const isInad = (p.inadimplente === '1' || p.inadimplente === 1 || p.inadimplente === true || p.CONTAS === '1' || p.CONTAS === 1);

      if (!mapa.has(limpo)) {
        // Formata CNPJ
        let fmt = rawCnpj;
        if (typeof formatCNPJ === 'function') fmt = formatCNPJ(limpo);
        else if (limpo.length === 14) {
          fmt = limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        }

        const nomeEntidade = (p.interessado || p.entidade || '').trim() || '—';
        const mun = (p.municipio || '').trim() || '—';

        // Preserva seleção anterior de impressão se já houver
        const checkImp = _estadoChecksImpressao.has(limpo) ? _estadoChecksImpressao.get(limpo) : true;

        mapa.set(limpo, {
          cnpj: limpo,
          cnpjFormatado: fmt,
          entidade: nomeEntidade,
          municipio: mun,
          inadimplente: isInad,
          imprimir: checkImp,
          ultimaAuditoria: auditMap[limpo] || null,
          processos: [p]
        });
      } else {
        const item = mapa.get(limpo);
        item.processos.push(p);
        if (isInad) {
          item.inadimplente = true;
        }
        if ((!item.entidade || item.entidade === '—') && (p.interessado || p.entidade)) {
          item.entidade = (p.interessado || p.entidade).trim();
        }
        if ((!item.municipio || item.municipio === '—') && p.municipio) {
          item.municipio = p.municipio.trim();
        }
      }
    });

    // "Mande para o início da fila":
    // Itens que sofreram alterações recentes (com timestamp na auditoria) vão primeiro para o topo da fila!
    return Array.from(mapa.values()).sort((a, b) => {
      const tA = a.ultimaAuditoria ? a.ultimaAuditoria.timestamp : 0;
      const tB = b.ultimaAuditoria ? b.ultimaAuditoria.timestamp : 0;

      if (tA !== tB) {
        return tB - tA; // Mais recente no início da fila!
      }

      // Ordenação padrão: inadimplentes primeiro, depois por nome de entidade
      if (a.inadimplente !== b.inadimplente) return a.inadimplente ? -1 : 1;
      return a.entidade.localeCompare(b.entidade, 'pt-BR');
    });
  }

  // Carrega e renderiza a tela
  function carregarCnpjsInadimplentes() {
    const procs = window.processosCache || (typeof state !== 'undefined' && state ? state.processos : []) || [];
    _cnpjsDistintosCache = extrairCnpjsDistintos(procs);
    atualizarBadgesTotais();
    renderTabelaCnpjsInadimplentes();
  }
  window.carregarCnpjsInadimplentes = carregarCnpjsInadimplentes;

  function atualizarBadgesTotais() {
    const totalDistintos = _cnpjsDistintosCache.length;
    const totalInad = _cnpjsDistintosCache.filter(c => c.inadimplente).length;
    const totalAdim = totalDistintos - totalInad;

    const elInad = document.getElementById('txt-count-inadimplentes');
    if (elInad) elInad.textContent = `${totalInad} Inadimplente${totalInad !== 1 ? 's' : ''}`;

    const elAdim = document.getElementById('txt-count-adimplentes');
    if (elAdim) elAdim.textContent = `${totalAdim} Regular${totalAdim !== 1 ? 'es' : ''}`;

    const elDist = document.getElementById('txt-count-distintos');
    if (elDist) elDist.textContent = `${totalDistintos} CNPJ${totalDistintos !== 1 ? 's' : ''} Único${totalDistintos !== 1 ? 's' : ''}`;
  }

  // Alterna o filtro de abas (Inadimplentes / Regulares / Todos)
  function setFiltroTipoCnpj(tipo, btnEl) {
    _filtroTipoCnpjAtual = tipo;
    document.querySelectorAll('.btn-filtro-cnpj-tipo').forEach(b => {
      b.classList.remove('active');
      b.style.background = 'rgba(255,255,255,0.05)';
      b.style.borderColor = 'rgba(255,255,255,0.15)';
      b.style.color = '#cbd5e1';
    });

    if (btnEl) {
      btnEl.classList.add('active');
      if (tipo === 'inadimplentes') {
        btnEl.style.background = 'rgba(239,68,68,0.2)';
        btnEl.style.borderColor = '#ef4444';
        btnEl.style.color = '#fca5a5';
      } else if (tipo === 'adimplentes') {
        btnEl.style.background = 'rgba(16,185,129,0.2)';
        btnEl.style.borderColor = '#10b981';
        btnEl.style.color = '#86efac';
      } else {
        btnEl.style.background = 'rgba(56,189,248,0.2)';
        btnEl.style.borderColor = '#38bdf8';
        btnEl.style.color = '#7dd3fc';
      }
    }

    renderTabelaCnpjsInadimplentes();
  }
  window.setFiltroTipoCnpj = setFiltroTipoCnpj;

  function filtrarTabelaCnpjsInadimplentes() {
    renderTabelaCnpjsInadimplentes();
  }
  window.filtrarTabelaCnpjsInadimplentes = filtrarTabelaCnpjsInadimplentes;

  // Renderiza as linhas da tabela
  function renderTabelaCnpjsInadimplentes() {
    const tbody = document.getElementById('table-cnpjs-inadimplentes-body');
    if (!tbody) return;

    const termo = (document.getElementById('filtro-busca-cnpjs')?.value || '').toLowerCase().trim();

    let itens = _cnpjsDistintosCache.filter(item => {
      // Filtro de tipo
      if (_filtroTipoCnpjAtual === 'inadimplentes' && !item.inadimplente) return false;
      if (_filtroTipoCnpjAtual === 'adimplentes' && item.inadimplente) return false;

      // Filtro de busca textual
      if (termo) {
        const matchCnpj = item.cnpj.includes(termo) || item.cnpjFormatado.includes(termo);
        const matchEnt = item.entidade.toLowerCase().includes(termo);
        const matchMun = item.municipio.toLowerCase().includes(termo);
        return matchCnpj || matchEnt || matchMun;
      }
      return true;
    });

    if (itens.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="padding:48px 16px; text-align:center; color:#94a3b8; font-size:14px; background:rgba(0,0,0,0.15);">
            <div style="font-size:32px; margin-bottom:8px;">🔍</div>
            <div style="font-weight:700; color:#cbd5e1; margin-bottom:4px;">Nenhum CNPJ encontrado</div>
            <div style="font-size:12px; color:#64748b;">Nenhum registro corresponde aos filtros selecionados.</div>
          </td>
        </tr>
      `;
      return;
    }

    const html = itens.map((item, idx) => {
      const isExp = _expandidosProcessos.has(item.cnpj);
      const isCheckedImp = item.imprimir !== false;
      const isInad = item.inadimplente;
      const isEditando = _edicoesAtivas.has(item.cnpj);

      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06); background:${idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.1)'}; transition:background 0.15s;" onmouseover="this.style.background='rgba(56,189,248,0.05)';" onmouseout="this.style.background='${idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.1)'}';">
          <!-- 1. Check de Impressão -->
          <td style="padding:10px 8px; text-align:center; vertical-align:middle;">
            <input type="checkbox" class="check-imp-item" data-cnpj="${item.cnpj}" ${isCheckedImp ? 'checked' : ''} onchange="toggleCheckImpressao('${item.cnpj}', this.checked)" style="width:16px; height:16px; cursor:pointer; accent-color:#0284c7;" title="Incluir ou remover este CNPJ do relatório impresso">
          </td>

          <!-- 2. CNPJ com botão de checagem da Receita Federal padrão e copiar (Marcação Amarela Imagem 2) -->
          <td style="padding:10px 12px; vertical-align:middle; font-family:monospace; font-weight:700; font-size:12.5px; color:${isInad ? '#fca5a5' : '#38bdf8'}; white-space:nowrap;">
            <div style="display:inline-flex; align-items:center; gap:6px;">
              <span style="border-bottom:1px dashed ${isInad ? '#ef4444' : '#38bdf8'}; cursor:pointer;" onclick="editarCNPJVinculado('${item.cnpj}')" title="Clique para editar este CNPJ em todos os processos vinculados">${item.cnpjFormatado}</span>
              
              <!-- Botão Copiar -->
              <button type="button" onclick="navigator.clipboard.writeText('${item.cnpjFormatado}'); if(typeof toast==='function') toast('CNPJ copiado!', 'info');" style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:12px; padding:2px;" title="Copiar CNPJ">📋</button>
              
              <!-- MARCAÇÃO AMARELA IMAGEM 2: BOTÃO CHECAGEM RECEITA FEDERAL PADRÃO -->
              <button type="button" class="btn-receita-cnpj" onclick="abrirChecagemReceitaCNPJ('${item.cnpj}', '${item.cnpjFormatado}')" style="background:linear-gradient(135deg,rgba(16,185,129,0.22),rgba(5,150,105,0.35)); border:1px solid #10b981; color:#6ee7b7; cursor:pointer; font-size:11px; font-weight:800; padding:3px 7px; border-radius:5px; display:inline-flex; align-items:center; gap:4px; box-shadow:0 0 8px rgba(16,185,129,0.25); transition:all 0.2s;" title="Checagem oficial na Receita Federal (abre Receita Federal e copia CNPJ automaticamente)">
                <span>🏛️</span>
                <span style="font-size:10.5px; letter-spacing:0.3px;">Receita</span>
              </button>
            </div>
          </td>

          <!-- 3. Entidade / Escola (Linha Vermelha Editável + Marcação Verde Imagem 2: Data, Hora e Usuário) -->
          <td style="padding:10px 12px; vertical-align:middle;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
              
              <!-- Modo Visualização / Edição -->
              ${!isEditando ? `
                <div style="display:inline-flex; align-items:center; gap:8px; flex:1; min-width:200px;">
                  <span style="font-weight:600; font-size:12.5px; color:#f8fafc; line-height:1.35; border-bottom:1.5px dashed rgba(239,68,68,0.45); padding-bottom:1px; cursor:pointer;" onclick="iniciarEdicaoEntidadeCNPJ('${item.cnpj}')" title="Clique no botão de lápis para editar o nome da entidade em todos os processos">${item.entidade}</span>
                  <button type="button" onclick="iniciarEdicaoEntidadeCNPJ('${item.cnpj}')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#cbd5e1; cursor:pointer; font-size:11px; padding:2px 6px; border-radius:4px; display:inline-flex; align-items:center; gap:3px;" title="Editar nome da entidade/escola em todos os ${item.processos.length} processos vinculados">
                    <span>✏️</span>
                    <span style="font-size:10px;">Editar</span>
                  </button>
                </div>
              ` : `
                <div style="display:inline-flex; align-items:center; gap:6px; flex:1; min-width:280px;">
                  <input type="text" id="input-entidade-${item.cnpj}" value="${(item.entidade || '').replace(/"/g, '&quot;')}" style="background:#0f172a; border:1.5px solid #38bdf8; color:#fff; padding:5px 8px; border-radius:5px; font-size:12px; font-weight:600; flex:1;" onkeydown="if(event.key==='Enter') salvarEdicaoEntidadeCNPJ('${item.cnpj}'); if(event.key==='Escape') cancelarEdicaoEntidadeCNPJ('${item.cnpj}');" placeholder="Nome da entidade / escola">
                  <button type="button" onclick="salvarEdicaoEntidadeCNPJ('${item.cnpj}')" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; padding:5px 10px; border-radius:5px; font-size:11px; font-weight:700; cursor:pointer;" title="Confirmar e salvar alteração em todos os processos vinculados">✔️ Salvar</button>
                  <button type="button" onclick="cancelarEdicaoEntidadeCNPJ('${item.cnpj}')" style="background:rgba(255,255,255,0.1); color:#cbd5e1; border:none; padding:5px 8px; border-radius:5px; font-size:11px; cursor:pointer;" title="Cancelar edição">✕</button>
                </div>
              `}

              <!-- MARCAÇÃO VERDE IMAGEM 2: DATA, HORA E USUÁRIO QUE FEZ A INFORMAÇÃO -->
              ${item.ultimaAuditoria ? `
                <div style="background:rgba(34,197,94,0.14); border:1px solid rgba(34,197,94,0.45); color:#86efac; border-radius:6px; padding:3px 8px; font-size:10.5px; font-family:monospace; display:inline-flex; align-items:center; gap:5px; white-space:nowrap; box-shadow:0 0 10px rgba(34,197,94,0.18);" title="Última informação/alteração: ${item.ultimaAuditoria.acao}">
                  <span>🕒</span>
                  <span>${item.ultimaAuditoria.dataHora}</span>
                  <span style="color:rgba(255,255,255,0.35);">|</span>
                  <span style="font-weight:700; color:#4ade80;">${item.ultimaAuditoria.usuario}</span>
                </div>
              ` : `
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); color:#64748b; border-radius:6px; padding:3px 8px; font-size:10px; font-family:monospace; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;" title="Sem alteração recente registrada">
                  <span>🕒</span>
                  <span>—</span>
                </div>
              `}
            </div>
          </td>

          <!-- 4. Município -->
          <td style="padding:10px 12px; vertical-align:middle; font-size:12px; color:#cbd5e1; white-space:nowrap;">
            ${item.municipio}
          </td>

          <!-- 5. Situação - Check/Toggle com Confirmação Prévia Obrigatória (Círculos Vermelhos Imagem 1) -->
          <td style="padding:10px 12px; vertical-align:middle; text-align:center; white-space:nowrap;">
            ${isInad ? `
              <label onclick="solicitarConfirmacaoInadimplencia('${item.cnpj}', false); return false;" style="display:inline-flex; align-items:center; gap:7px; cursor:pointer; background:rgba(239,68,68,0.18); border:1.5px solid #ef4444; border-radius:6px; padding:4px 10px; color:#fca5a5; font-weight:800; font-size:11.5px; box-shadow:0 0 10px rgba(239,68,68,0.3); transition:all 0.2s;" title="Clique para TIRAR A INADIMPLÊNCIA em todos os ${item.processos.length} processos vinculados">
                <input type="checkbox" checked onclick="event.stopPropagation(); solicitarConfirmacaoInadimplencia('${item.cnpj}', false); return false;" style="width:16px; height:16px; cursor:pointer; accent-color:#ef4444;">
                <span>⚠️ INADIMPLENTE</span>
              </label>
            ` : `
              <label onclick="solicitarConfirmacaoInadimplencia('${item.cnpj}', true); return false;" style="display:inline-flex; align-items:center; gap:7px; cursor:pointer; background:rgba(34,197,94,0.12); border:1.5px solid rgba(34,197,94,0.4); border-radius:6px; padding:4px 10px; color:#86efac; font-weight:700; font-size:11.5px; transition:all 0.2s;" title="Clique para NEGATIVAR (marcar como INADIMPLENTE) em todos os ${item.processos.length} processos vinculados">
                <input type="checkbox" onclick="event.stopPropagation(); solicitarConfirmacaoInadimplencia('${item.cnpj}', true); return false;" style="width:16px; height:16px; cursor:pointer; accent-color:#22c55e;">
                <span>🟢 REGULAR</span>
              </label>
            `}
          </td>

          <!-- 6. Processos Vinculados & Botão Expandir -->
          <td style="padding:10px 12px; vertical-align:middle; text-align:center; white-space:nowrap;">
            <button type="button" onclick="toggleExpandirProcessosCNPJ('${item.cnpj}')" style="background:${isExp ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)'}; color:${isExp ? '#38bdf8' : '#cbd5e1'}; border:1px solid ${isExp ? '#38bdf8' : 'rgba(255,255,255,0.15)'}; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" title="Ver processos vinculados a este CNPJ">
              <span>${isExp ? '▲' : '▼'}</span>
              <span>${item.processos.length} proc.</span>
            </button>
          </td>
        </tr>

        <!-- Sub-linha expansível de processos -->
        ${isExp ? `
        <tr style="background:rgba(0,0,0,0.35); border-bottom:1px solid rgba(56,189,248,0.25);">
          <td colspan="6" style="padding:10px 16px 14px 24px;">
            <div style="font-size:11.5px; font-weight:700; color:#38bdf8; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
              <span>📁 Processos cadastrados com o CNPJ ${item.cnpjFormatado}:</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${item.processos.map(p => `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); padding:6px 12px; border-radius:6px; font-size:12px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-family:monospace; font-weight:700; color:#f8fafc;">${p.numero || 'Sem número'}</span>
                    <span style="background:rgba(56,189,248,0.15); color:#7dd3fc; padding:2px 6px; border-radius:4px; font-size:10.5px; font-weight:600;">${p.prefixo || 'CAM'}</span>
                    <span style="color:#cbd5e1;">${p.objeto || '—'}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:700; color:#6ee7b7;">${(typeof formatCurrency === 'function') ? formatCurrency(p.valorOf) : (p.valorOf || 'R$ 0,00')}</span>
                    <button type="button" onclick="editarProcesso('${p.id}')" style="background:#10b981; color:#fff; border:none; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:700; cursor:pointer;" title="Abrir formulário de edição deste processo">Editar</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </td>
        </tr>
        ` : ''}
      `;
    }).join('');

    tbody.innerHTML = html;
  }

  // Traz / fecha os processos do CNPJ
  function toggleExpandirProcessosCNPJ(cnpj) {
    if (_expandidosProcessos.has(cnpj)) {
      _expandidosProcessos.delete(cnpj);
    } else {
      _expandidosProcessos.add(cnpj);
    }
    renderTabelaCnpjsInadimplentes();
  }
  window.toggleExpandirProcessosCNPJ = toggleExpandirProcessosCNPJ;

  // Toggle do check de impressão de um CNPJ individual
  function toggleCheckImpressao(cnpj, checked) {
    _estadoChecksImpressao.set(cnpj, checked);
    const item = _cnpjsDistintosCache.find(c => c.cnpj === cnpj);
    if (item) item.imprimir = checked;
  }
  window.toggleCheckImpressao = toggleCheckImpressao;

  // Master check de impressão (marcar / desmarcar todos)
  function toggleMasterImpressao(checked) {
    _cnpjsDistintosCache.forEach(item => {
      item.imprimir = checked;
      _estadoChecksImpressao.set(item.cnpj, checked);
    });
    const btnTxt = document.getElementById('btn-txt-marcar-todos-impressao');
    if (btnTxt) btnTxt.textContent = checked ? 'Desmarcar Todos p/ Impressão' : 'Marcar Todos p/ Impressão';
    renderTabelaCnpjsInadimplentes();
  }
  window.toggleMasterImpressao = toggleMasterImpressao;

  function alternarTodosChecksImpressao() {
    const master = document.getElementById('check-imprimir-master');
    const novoStatus = master ? !master.checked : true;
    if (master) master.checked = novoStatus;
    toggleMasterImpressao(novoStatus);
  }
  window.alternarTodosChecksImpressao = alternarTodosChecksImpressao;

  // MARCAÇÃO AMARELA: BOTÃO CHECAGEM RECEITA FEDERAL PADRÃO
  function abrirChecagemReceitaCNPJ(cnpjLimpo, cnpjFmt) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cnpjFmt || cnpjLimpo).catch(() => {});
    }
    window.open('https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/', '_blank', 'noopener,noreferrer');
    if (typeof toast === 'function') {
      toast(`🏛️ CNPJ ${cnpjFmt} copiado! Abrindo checagem oficial na Receita Federal...`, 'info');
    }
  }
  window.abrirChecagemReceitaCNPJ = abrirChecagemReceitaCNPJ;

  // EDIÇÃO DE ENTIDADE / ESCOLA EM TODOS OS PROCESSOS VINCULADOS
  function iniciarEdicaoEntidadeCNPJ(cnpjLimpo) {
    _edicoesAtivas.add(cnpjLimpo);
    renderTabelaCnpjsInadimplentes();
    setTimeout(() => {
      const inp = document.getElementById(`input-entidade-${cnpjLimpo}`);
      if (inp) {
        inp.focus();
        inp.select();
      }
    }, 50);
  }
  window.iniciarEdicaoEntidadeCNPJ = iniciarEdicaoEntidadeCNPJ;

  function cancelarEdicaoEntidadeCNPJ(cnpjLimpo) {
    _edicoesAtivas.delete(cnpjLimpo);
    renderTabelaCnpjsInadimplentes();
  }
  window.cancelarEdicaoEntidadeCNPJ = cancelarEdicaoEntidadeCNPJ;

  async function salvarEdicaoEntidadeCNPJ(cnpjLimpo) {
    const item = _cnpjsDistintosCache.find(c => c.cnpj === cnpjLimpo);
    if (!item) return;

    const input = document.getElementById(`input-entidade-${cnpjLimpo}`);
    const novoNome = input ? input.value.trim() : '';

    if (!novoNome) {
      if (typeof toast === 'function') toast('O nome da entidade não pode ficar vazio.', 'warning');
      return;
    }

    if (novoNome === item.entidade) {
      cancelarEdicaoEntidadeCNPJ(cnpjLimpo);
      return;
    }

    const procs = item.processos || [];
    const qtdProcessos = procs.length;

    let confirmado = false;
    const msgConfirm = `
      <div style="font-size:13.5px; line-height:1.5; color:#cbd5e1;">
        <p style="margin-bottom:12px; font-size:14px; font-weight:700; color:#38bdf8;">
          Deseja atualizar o nome da entidade em <u>TODOS</u> os processos vinculados?
        </p>
        <div style="background:rgba(56,189,248,0.1); border:1.5px solid rgba(56,189,248,0.35); border-radius:8px; padding:10px 14px; margin-bottom:12px;">
          <div style="font-size:11.5px; color:#94a3b8;">Nome anterior:</div>
          <div style="text-decoration:line-through; color:#cbd5e1; margin-bottom:6px;">${item.entidade}</div>
          <div style="font-size:11.5px; color:#38bdf8; font-weight:700;">Novo nome:</div>
          <div style="font-size:13.5px; font-weight:800; color:#ffffff;">${novoNome}</div>
        </div>
        <div style="background:rgba(255,255,255,0.04); border-left:4px solid #38bdf8; padding:8px 12px; border-radius:4px; font-size:12.5px;">
          Esta alteração será aplicada em <strong style="color:#38bdf8; font-size:13.5px;">${qtdProcessos} processo(s)</strong> vinculados a este CNPJ.
        </div>
      </div>
    `;

    if (typeof exibirMensagemSiSCAM === 'function') {
      confirmado = await exibirMensagemSiSCAM(msgConfirm, {
        titulo: '✏️ Confirmar Alteração de Nome',
        tipo: 'confirm',
        confirmacao: true,
        btnTexto: `Sim, Atualizar ${qtdProcessos} Processo(s)`,
        btnCancelarTexto: 'Cancelar'
      });
    } else {
      confirmado = window.confirm(`Deseja alterar o nome da entidade para "${novoNome}" em todos os ${qtdProcessos} processo(s) vinculados?`);
    }

    if (!confirmado) {
      cancelarEdicaoEntidadeCNPJ(cnpjLimpo);
      return;
    }

    // 1. Atualiza nos processos locais
    const todosProcs = window.processosCache || (typeof state !== 'undefined' && state ? state.processos : []) || [];
    const afetados = todosProcs.filter(p => String(p.cnpj || '').replace(/\D/g, '') === cnpjLimpo);

    afetados.forEach(p => {
      p.interessado = novoNome;
      p.entidade = novoNome;
    });

    item.entidade = novoNome;
    _edicoesAtivas.delete(cnpjLimpo);

    // 2. Salva localmente
    if (typeof salvarProcessos === 'function') {
      salvarProcessos(todosProcs);
    }

    // 3. Salva auditoria (data, hora, login)
    salvarAuditoriaCNPJ(cnpjLimpo, 'Nome Editado');

    // 4. Sincroniza assincronamente com a API/Planilha
    afetados.forEach(p => {
      if (p.id && !String(p.id).startsWith('temp-') && typeof atualizarProcesso === 'function') {
        atualizarProcesso(p.id, {
          interessado: novoNome
        }).catch(err => console.warn('Erro ao atualizar interessado remoto:', p.id, err));
      }
    });

    if (typeof toast === 'function') {
      toast(`✅ Nome atualizado para "${novoNome}" em ${afetados.length} processo(s)!`, 'success');
    }

    // 5. Recarrega dados -> "Mande para o início da fila"!
    carregarCnpjsInadimplentes();
  }
  window.salvarEdicaoEntidadeCNPJ = salvarEdicaoEntidadeCNPJ;

  // EDIÇÃO DE CNPJ EM TODOS OS PROCESSOS VINCULADOS
  async function editarCNPJVinculado(cnpjLimpo) {
    const item = _cnpjsDistintosCache.find(c => c.cnpj === cnpjLimpo);
    if (!item) return;

    const procs = item.processos || [];
    const cnpjAtualFmt = item.cnpjFormatado || cnpjLimpo;

    const novoCnpjRaw = window.prompt(`Informe o novo CNPJ para substituir ${cnpjAtualFmt} em todos os ${procs.length} processo(s) vinculados:`, cnpjAtualFmt);
    if (!novoCnpjRaw) return;

    const novoLimpo = novoCnpjRaw.replace(/\D/g, '');
    if (novoLimpo.length !== 14 || /^0+$/.test(novoLimpo)) {
      if (typeof toast === 'function') toast('CNPJ inválido! Deve conter 14 dígitos.', 'warning');
      else alert('CNPJ inválido! Deve conter 14 dígitos.');
      return;
    }

    if (novoLimpo === cnpjLimpo) return;

    let fmtNovo = novoLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    if (typeof formatCNPJ === 'function') fmtNovo = formatCNPJ(novoLimpo);

    const confirmado = window.confirm(`Deseja realmente alterar o CNPJ de:\n${cnpjAtualFmt}\npara:\n${fmtNovo}\nem todos os ${procs.length} processo(s) vinculados?`);
    if (!confirmado) return;

    const todosProcs = window.processosCache || (typeof state !== 'undefined' && state ? state.processos : []) || [];
    const afetados = todosProcs.filter(p => String(p.cnpj || '').replace(/\D/g, '') === cnpjLimpo);

    afetados.forEach(p => {
      p.cnpj = fmtNovo;
    });

    if (typeof salvarProcessos === 'function') {
      salvarProcessos(todosProcs);
    }

    salvarAuditoriaCNPJ(novoLimpo, 'CNPJ Alterado');

    afetados.forEach(p => {
      if (p.id && !String(p.id).startsWith('temp-') && typeof atualizarProcesso === 'function') {
        atualizarProcesso(p.id, {
          cnpj: fmtNovo
        }).catch(err => console.warn('Erro ao atualizar cnpj remoto:', p.id, err));
      }
    });

    if (typeof toast === 'function') toast(`CNPJ atualizado para ${fmtNovo} em ${afetados.length} processo(s)!`, 'success');
    carregarCnpjsInadimplentes();
  }
  window.editarCNPJVinculado = editarCNPJVinculado;

  // CONFIRMAÇÃO PRÉVIA ANTES DE MUDANÇA DE STATUS (CÍRCULOS VERMELHOS IMAGEM 1)
  async function solicitarConfirmacaoInadimplencia(cnpjLimpo, novoStatusInadimplente) {
    const item = _cnpjsDistintosCache.find(c => c.cnpj === cnpjLimpo);
    if (!item) return;

    const procs = item.processos || [];
    const qtdProcessos = procs.length;
    const cnpjFmt = item.cnpjFormatado || cnpjLimpo;
    const nomeEntidade = item.entidade || 'Entidade';

    let titulo = '';
    let mensagemHtml = '';
    let btnTexto = '';

    if (novoStatusInadimplente) {
      // Negativar / Marcar Inadimplente
      titulo = '⚠️ Confirmação: Negativar CNPJ';
      btnTexto = `Sim, Negativar ${qtdProcessos} Processo(s)`;
      mensagemHtml = `
        <div style="font-size:13.5px; line-height:1.5; color:#cbd5e1;">
          <p style="margin-bottom:12px; font-size:14.5px; font-weight:700; color:#fca5a5;">
            Deseja realmente <u>NEGATIVAR</u> e marcar como <strong>INADIMPLENTE</strong> o CNPJ abaixo?
          </p>
          <div style="background:rgba(239,68,68,0.12); border:1.5px solid rgba(239,68,68,0.4); border-radius:8px; padding:10px 14px; margin-bottom:14px;">
            <div style="font-family:monospace; font-weight:800; font-size:14px; color:#f87171; margin-bottom:4px;">${cnpjFmt}</div>
            <div style="font-weight:700; color:#ffffff;">${nomeEntidade}</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:2px;">${item.municipio}</div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border-left:4px solid #ef4444; padding:8px 12px; border-radius:4px; font-size:12.5px; color:#f8fafc;">
            Esta ação tornará <strong>INADIMPLENTE</strong> um total de <strong style="color:#ef4444; font-size:14px;">${qtdProcessos} processo(s)</strong> vinculados a este CNPJ em todo o sistema.
          </div>
        </div>
      `;
    } else {
      // Tirar inadimplência / Regularizar
      titulo = '🟢 Confirmação: Regularizar CNPJ';
      btnTexto = `Sim, Tirar Inadimplência (${qtdProcessos} Proc.)`;
      mensagemHtml = `
        <div style="font-size:13.5px; line-height:1.5; color:#cbd5e1;">
          <p style="margin-bottom:12px; font-size:14.5px; font-weight:700; color:#86efac;">
            Deseja realmente <u>TIRAR A INADIMPLÊNCIA</u> e marcar como <strong>REGULAR</strong> o CNPJ abaixo?
          </p>
          <div style="background:rgba(34,197,94,0.12); border:1.5px solid rgba(34,197,94,0.4); border-radius:8px; padding:10px 14px; margin-bottom:14px;">
            <div style="font-family:monospace; font-weight:800; font-size:14px; color:#4ade80; margin-bottom:4px;">${cnpjFmt}</div>
            <div style="font-weight:700; color:#ffffff;">${nomeEntidade}</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:2px;">${item.municipio}</div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border-left:4px solid #10b981; padding:8px 12px; border-radius:4px; font-size:12.5px; color:#f8fafc;">
            Esta ação irá <strong>REGULARIZAR</strong> e remover o bloqueio de pendência em <strong style="color:#34d399; font-size:14px;">${qtdProcessos} processo(s)</strong> vinculados a este CNPJ em todo o sistema.
          </div>
        </div>
      `;
    }

    let confirmado = false;
    if (typeof exibirMensagemSiSCAM === 'function') {
      confirmado = await exibirMensagemSiSCAM(mensagemHtml, {
        titulo: titulo,
        tipo: 'confirm',
        confirmacao: true,
        btnTexto: btnTexto,
        btnCancelarTexto: 'Cancelar'
      });
    } else {
      const acaoTexto = novoStatusInadimplente ? 'NEGATIVAR (marcar como INADIMPLENTE)' : 'TIRAR A INADIMPLÊNCIA (marcar como REGULAR)';
      confirmado = window.confirm(`Atenção:\n\nDeseja realmente ${acaoTexto} o CNPJ ${cnpjFmt} (${nomeEntidade})?\n\nEsta alteração afetará ${qtdProcessos} processo(s) vinculado(s)!`);
    }

    if (!confirmado) {
      renderTabelaCnpjsInadimplentes();
      return;
    }

    // Executa a alteração
    await alternarInadimplenciaCNPJ(cnpjLimpo, novoStatusInadimplente);
  }
  window.solicitarConfirmacaoInadimplencia = solicitarConfirmacaoInadimplencia;

  // Alterna inadimplência de um CNPJ em TODOS os processos vinculados
  async function alternarInadimplenciaCNPJ(cnpjLimpo, novoStatusInadimplente) {
    const procs = window.processosCache || (typeof state !== 'undefined' && state ? state.processos : []) || [];
    const statusStr = novoStatusInadimplente ? '1' : '0';

    const afetados = procs.filter(p => {
      const c = String(p.cnpj || '').replace(/\D/g, '');
      return c === cnpjLimpo;
    });

    if (afetados.length === 0) {
      if (typeof toast === 'function') toast('Nenhum processo vinculado a este CNPJ.', 'warning');
      return;
    }

    // 1. Atualiza imediatamente na memória local em todos os processos vinculados
    afetados.forEach(p => {
      p.inadimplente = statusStr;
      p.CONTAS = statusStr;
      p.INADIMPLENTE = statusStr;
    });

    // 2. Atualiza no cache de CNPJs distintos da tela
    const itemDist = _cnpjsDistintosCache.find(c => c.cnpj === cnpjLimpo);
    if (itemDist) {
      itemDist.inadimplente = novoStatusInadimplente;
    }

    // 3. Persiste no localStorage/memória global
    if (typeof salvarProcessos === 'function') {
      salvarProcessos(procs);
    }

    // 4. Salva auditoria (data, hora, login)
    salvarAuditoriaCNPJ(cnpjLimpo, novoStatusInadimplente ? 'Negativado' : 'Regularizado');

    // 5. Notifica o usuário com feedback rápido e claro
    const cnpjFmt = (itemDist ? itemDist.cnpjFormatado : cnpjLimpo);
    const msg = novoStatusInadimplente
      ? `⚠️ CNPJ ${cnpjFmt} negativado em ${afetados.length} processo(s)!`
      : `✅ Inadimplência retirada! CNPJ ${cnpjFmt} regularizado em todos os ${afetados.length} processo(s).`;
    if (typeof toast === 'function') toast(msg, novoStatusInadimplente ? 'warning' : 'success');

    // 6. Envia sincronização assíncrona com a API/Planilha para cada processo
    afetados.forEach(p => {
      if (p.id && !String(p.id).startsWith('temp-') && typeof atualizarProcesso === 'function') {
        atualizarProcesso(p.id, {
          inadimplente: statusStr,
          CONTAS: statusStr
        }).catch(err => console.warn('Erro ao atualizar processo remoto:', p.id, err));
      }
    });

    // 7. Recarrega dados -> "Mande para o início da fila"!
    carregarCnpjsInadimplentes();
  }
  window.alternarInadimplenciaCNPJ = alternarInadimplenciaCNPJ;

  // GERA E IMPRIME O RELATÓRIO PROFISSIONAL A4
  function imprimirRelatorioCNPJs() {
    // Filtra apenas os CNPJs marcados para impressão
    const itensImpressao = _cnpjsDistintosCache.filter(c => c.imprimir !== false);

    if (itensImpressao.length === 0) {
      if (typeof toast === 'function') toast('Nenhum CNPJ selecionado para impressão! Marque a caixa "IMPRIMIR" dos registros desejados.', 'warning');
      return;
    }

    const totalInad = itensImpressao.filter(c => c.inadimplente).length;
    const totalReg = itensImpressao.length - totalInad;
    const dataHora = new Date().toLocaleString('pt-BR');

    const htmlRelatorio = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatório de Adimplência e Inadimplência de CNPJs — SEDUC/RO</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 12mm 14mm 12mm;
          }
          body {
            font-family: Arial, sans-serif;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.35;
          }
          .rel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .rel-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .rel-title-block h1 {
            font-size: 15px;
            font-weight: 800;
            margin: 0;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .rel-title-block h2 {
            font-size: 12px;
            font-weight: 700;
            margin: 2px 0 0 0;
            color: #334155;
          }
          .rel-meta {
            text-align: right;
            font-size: 10px;
            color: #64748b;
          }
          .rel-resumo {
            display: flex;
            gap: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 14px;
            margin-bottom: 14px;
            font-size: 11px;
          }
          .rel-resumo span {
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
          }
          th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 800;
            text-align: left;
            padding: 6px 8px;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1.5px solid #0f172a;
            font-size: 10.5px;
            text-transform: uppercase;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
          }
          tr:nth-child(even) td {
            background: #fcfcfd;
          }
          .badge-inad {
            display: inline-block;
            background: #fee2e2;
            color: #b91c1c;
            border: 1px solid #ef4444;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 800;
            font-size: 9.5px;
          }
          .badge-reg {
            display: inline-block;
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #22c55e;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 9.5px;
          }
          .rel-footer {
            margin-top: 18px;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 9.5px;
            color: #64748b;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="rel-header">
          <div class="rel-logo">
            <div class="rel-title-block">
              <h1>Governo de Rondônia • SEDUC</h1>
              <h2>CAM • Coordenadoria de Articulação com os Municípios • GDSM</h2>
              <div style="font-size:11px; font-weight:700; color:#0284c7; margin-top:2px;">RELATÓRIO DE SITUAÇÃO DE ADIMPLÊNCIA / INADIMPLÊNCIA DE CNPJs</div>
            </div>
          </div>
          <div class="rel-meta">
            <div><strong>Emissão:</strong> ${dataHora}</div>
            <div><strong>Sistema:</strong> SiSCAM v1.149</div>
          </div>
        </div>

        <div class="rel-resumo">
          <div>Total de Entidades Selecionadas: <span>${itensImpressao.length}</span></div>
          <div>• Inadimplentes: <span style="color:#b91c1c;">${totalInad}</span></div>
          <div>• Regulares / Adimplentes: <span style="color:#15803d;">${totalReg}</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:28px; text-align:center;">#</th>
              <th style="width:130px;">CNPJ</th>
              <th>Entidade / Escola</th>
              <th style="width:140px;">Município</th>
              <th style="width:105px; text-align:center;">Situação</th>
            </tr>
          </thead>
          <tbody>
            ${itensImpressao.map((item, idx) => `
              <tr>
                <td style="text-align:center; color:#64748b; font-size:10px;">${idx + 1}</td>
                <td style="font-family:monospace; font-weight:700;">${item.cnpjFormatado}</td>
                <td><strong>${item.entidade}</strong></td>
                <td>${item.municipio}</td>
                <td style="text-align:center;">
                  ${item.inadimplente ? '<span class="badge-inad">INADIMPLENTE</span>' : '<span class="badge-reg">REGULAR</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="rel-footer">
          <div>Documento gerado eletronicamente através do sistema SiSCAM • SEDUC/RO</div>
          <div>Página 1</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlRelatorio);
      printWin.document.close();
    } else {
      let iframe = document.getElementById('iframe-impressao-cnpjs');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'iframe-impressao-cnpjs';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
      }
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlRelatorio);
      doc.close();
    }
  }
  window.imprimirRelatorioCNPJs = imprimirRelatorioCNPJs;
})();
