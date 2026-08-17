$file = ".\js\escolas.js"
$content = Get-Content $file -Raw

$pattern = "(?s)// ---- RENDERIZAR TABELA ----.*?function navegarEscolas\(pag\) \{"

$replacement = @"
// ---- RENDERIZAR TABELA ----
function _escolasRenderTabela() {
  const tbody    = document.getElementById('table-escolas');
  const emptyEl  = document.getElementById('escolas-empty');
  const tableWrap = document.getElementById('escolas-table-wrap');
  if (!tbody) return;

  if (_escolasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhuma escola encontrada com os filtros selecionados.</td></tr>';
    if (emptyEl) emptyEl.style.display = 'none';
    if (tableWrap) tableWrap.style.display = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (tableWrap) tableWrap.style.display = '';

  const start = (_escolasPaginaAtual - 1) * _escolasItensPorPagina;
  const slice = _escolasFiltradas.slice(start, start + _escolasItensPorPagina);

  tbody.innerHTML = slice.map((e, i) => {
    const gi = start + i;
    const locColor = {
      'Urbana': { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
      'Rural':  { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
      'Indígena': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
      'Quilombola': { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' }
    };
    const lc = locColor[e.localizacao] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: 'rgba(255,255,255,0.1)' };
    const locBadge = e.localizacao
      ? '<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:' + lc.bg + ';color:' + lc.color + ';border:1px solid ' + lc.border + '">' + e.localizacao + '</span>'
      : '<span style="color:var(--text-muted)">-</span>';

    const tel  = e.telefone  || '-';
    const _eCompT = _normalizarCompetencia(e.codigoSuper);
    const _totalA = _calcTotalAlunos(e);
    const mat  = _totalA > 0 ? _totalA.toLocaleString('pt-BR') : '-';
    const sal  = e.salas > 0 ? e.salas : '-';
    const dir  = e.diretor || '-';
    const inep = e.codigoInep || '-';

    return '<tr style="cursor:pointer;" onclick="abrirModalEscola(' + gi + ')" ondblclick="abrirFormEscola(' + gi + ')" title="Clique para ver detalhes | Duplo clique para editar"' +
      ' onmouseover="this.style.background=''rgba(139,92,246,0.07)''"' +
      ' onmouseout="this.style.background=''''">' +
      '<td>' + _renderCompetenciaBadge(e.codigoSuper) + '</td>' +
      '<td style="font-weight:600;color:var(--text-primary)">' + (e.municipio || '-') + '</td>' +
      '<td style="font-weight:600;color:#f0f4ff;white-space:normal;line-height:1.4;max-width:220px">' + (e.nome || '-') + '</td>' +
      '<td style="font-weight:600;color:var(--text-primary)">' + inep + '</td>' +
      '<td>' + locBadge + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary)">' + (e.super || '-') + '</td>' +
      '<td style="max-width:160px;vertical-align:middle;padding:6px 10px;">' + _renderModalidadesGrid(e) + '</td>' +
      '<td style="text-align:right;font-weight:700;color:#34d399">' + mat + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary);max-width:130px;white-space:normal;">' + dir + '</td>' +
      '<td style="font-size:12px">' + tel + '</td>' +
      '<td style="text-align:center;" onclick="event.stopPropagation()">' +
        '<div style="display:flex;gap:6px;justify-content:center;">' +
          '<button onclick="abrirFormEscola(' + gi + ')" title="Editar Dados da Escola" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);border:none;border-radius:6px;color:#ffffff;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(139,92,246,0.3);">✏️ Editar</button>' +
        '</div>' +
      '</td>' +
      '</tr>';
  }).join('');
}

// ---- PAGINAÇÃO ----
function _escolasRenderPaginacao() {
  const infoEl = document.getElementById('escolas-pg-info');
  const ctrlEl = document.getElementById('escolas-pg-controls');
  const pagEl  = document.getElementById('escolas-pagination');
  if (!infoEl || !ctrlEl) return;

  const total  = _escolasFiltradas.length;
  const totPag = Math.max(1, Math.ceil(total / _escolasItensPorPagina));
  const start  = (_escolasPaginaAtual - 1) * _escolasItensPorPagina + 1;
  const end    = Math.min(_escolasPaginaAtual * _escolasItensPorPagina, total);

  if (pagEl) pagEl.style.display = total > 0 ? '' : 'none';
  infoEl.textContent = total > 0
    ? 'Mostrando ' + start + '-' + end + ' de ' + total.toLocaleString('pt-BR') + ' escolas'
    : 'Nenhuma escola';

  const range = [];
  if (totPag <= 7) {
    for (let p = 1; p <= totPag; p++) range.push(p);
  } else if (_escolasPaginaAtual <= 4) {
    for (let p = 1; p <= 5; p++) range.push(p);
    range.push('...'); range.push(totPag);
  } else if (_escolasPaginaAtual >= totPag - 3) {
    range.push(1); range.push('...');
    for (let p = totPag - 4; p <= totPag; p++) range.push(p);
  } else {
    range.push(1); range.push('...');
    for (let p = _escolasPaginaAtual - 1; p <= _escolasPaginaAtual + 1; p++) range.push(p);
    range.push('...'); range.push(totPag);
  }

  let btns = '<button class="page-btn" ' + (_escolasPaginaAtual === 1 ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual - 1) + ')">»</button>';
  range.forEach(p => {
    if (p === '...') btns += '<span style="padding:0 6px;color:var(--text-muted)">-</span>';
    else btns += '<button class="page-btn ' + (p === _escolasPaginaAtual ? 'active' : '') + '" onclick="navegarEscolas(' + p + ')">' + p + '</button>';
  });
  btns += '<button class="page-btn" ' + (_escolasPaginaAtual === totPag ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual + 1) + ')">»</button>';
  ctrlEl.innerHTML = btns;
}

function navegarEscolas(pag) {
"@

$newContent = [regex]::Replace($content, $pattern, $replacement)
Set-Content -Path $file -Value $newContent -Encoding UTF8
Write-Host "Replaced successfully"
