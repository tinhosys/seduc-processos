// ============================================================
// SEDUC PROCESSOS — MÓDULO CNPJs INADIMPLENTES & RELATÓRIO
// Versão: v1.148
// ============================================================

(function () {
  let _filtroTipoCnpjAtual = 'inadimplentes'; // 'inadimplentes', 'adimplentes', 'todos'
  let _cnpjsDistintosCache = [];
  let _estadoChecksImpressao = new Map(); // cnpj -> boolean
  let _expandidosProcessos = new Set(); // cnpjs com sub-tabela aberta

  // Função DISTINCT para extrair CNPJs únicos da lista de processos
  function extrairCnpjsDistintos(processos) {
    const mapa = new Map();
    const lista = Array.isArray(processos) ? processos : [];

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

        const nomeEntidade = (p.interessado || '').trim() || '—';
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
          processos: [p]
        });
      } else {
        const item = mapa.get(limpo);
        item.processos.push(p);
        if (isInad) {
          item.inadimplente = true;
        }
        if ((!item.entidade || item.entidade === '—') && p.interessado) {
          item.entidade = p.interessado.trim();
        }
        if ((!item.municipio || item.municipio === '—') && p.municipio) {
          item.municipio = p.municipio.trim();
        }
      }
    });

    return Array.from(mapa.values()).sort((a, b) => {
      // Ordena: primeiro inadimplentes, depois por nome de entidade
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

      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06); background:${idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.1)'}; transition:background 0.15s;" onmouseover="this.style.background='rgba(56,189,248,0.05)';" onmouseout="this.style.background='${idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.1)'}';">
          <!-- 1. Check de Impressão -->
          <td style="padding:10px 8px; text-align:center; vertical-align:middle;">
            <input type="checkbox" class="check-imp-item" data-cnpj="${item.cnpj}" ${isCheckedImp ? 'checked' : ''} onchange="toggleCheckImpressao('${item.cnpj}', this.checked)" style="width:16px; height:16px; cursor:pointer; accent-color:#0284c7;" title="Incluir ou remover este CNPJ do relatório impresso">
          </td>

          <!-- 2. CNPJ com botão de copiar -->
          <td style="padding:10px 12px; vertical-align:middle; font-family:monospace; font-weight:700; font-size:12.5px; color:${isInad ? '#fca5a5' : '#38bdf8'}; white-space:nowrap;">
            <div style="display:inline-flex; align-items:center; gap:6px;">
              <span>${item.cnpjFormatado}</span>
              <button type="button" onclick="navigator.clipboard.writeText('${item.cnpjFormatado}'); if(typeof toast==='function') toast('CNPJ copiado!', 'info');" style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:12px; padding:2px;" title="Copiar CNPJ">📋</button>
            </div>
          </td>

          <!-- 3. Entidade / Escola -->
          <td style="padding:10px 12px; vertical-align:middle; font-weight:600; font-size:12.5px; color:#f8fafc; line-height:1.35;">
            ${item.entidade}
          </td>

          <!-- 4. Município -->
          <td style="padding:10px 12px; vertical-align:middle; font-size:12px; color:#cbd5e1; white-space:nowrap;">
            ${item.municipio}
          </td>

          <!-- 5. Situação - Check/Toggle Adimplente vs Inadimplente (Desabilita/Habilita em todos os processos) -->
          <td style="padding:10px 12px; vertical-align:middle; text-align:center; white-space:nowrap;">
            ${isInad ? `
              <label style="display:inline-flex; align-items:center; gap:7px; cursor:pointer; background:rgba(239,68,68,0.18); border:1.5px solid #ef4444; border-radius:6px; padding:4px 10px; color:#fca5a5; font-weight:800; font-size:11.5px; box-shadow:0 0 10px rgba(239,68,68,0.3); transition:all 0.2s;" title="Clique para desabilitar inadimplência e tornar REGULAR em todos os processos vinculados">
                <input type="checkbox" checked onchange="alternarInadimplenciaCNPJ('${item.cnpj}', false)" style="width:16px; height:16px; cursor:pointer; accent-color:#ef4444;">
                <span>⚠️ INADIMPLENTE</span>
              </label>
            ` : `
              <label style="display:inline-flex; align-items:center; gap:7px; cursor:pointer; background:rgba(34,197,94,0.12); border:1.5px solid rgba(34,197,94,0.4); border-radius:6px; padding:4px 10px; color:#86efac; font-weight:700; font-size:11.5px; transition:all 0.2s;" title="Clique para marcar como INADIMPLENTE em todos os processos vinculados">
                <input type="checkbox" onchange="alternarInadimplenciaCNPJ('${item.cnpj}', true)" style="width:16px; height:16px; cursor:pointer; accent-color:#22c55e;">
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

    // 4. Notifica o usuário com feedback rápido e claro
    const cnpjFmt = (itemDist ? itemDist.cnpjFormatado : cnpjLimpo);
    const msg = novoStatusInadimplente
      ? `⚠️ CNPJ ${cnpjFmt} marcado como INADIMPLENTE em ${afetados.length} processo(s)!`
      : `✅ Inadimplência desabilitada! CNPJ ${cnpjFmt} atualizado para REGULAR em todos os ${afetados.length} processo(s).`;
    if (typeof toast === 'function') toast(msg, novoStatusInadimplente ? 'warning' : 'success');

    // 5. Envia sincronização assíncrona com a API/Planilha para cada processo
    afetados.forEach(p => {
      if (p.id && !String(p.id).startsWith('temp-') && typeof atualizarProcesso === 'function') {
        atualizarProcesso(p.id, {
          inadimplente: statusStr,
          CONTAS: statusStr
        }).catch(err => console.warn('Erro ao atualizar processo remoto:', p.id, err));
      }
    });

    // 6. Atualiza contadores e renderiza a tabela
    atualizarBadgesTotais();
    renderTabelaCnpjsInadimplentes();
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
            <div><strong>Sistema:</strong> SiSCAM v1.148</div>
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
      // Fallback em caso de bloqueio de popup: usa iframe invisível
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
