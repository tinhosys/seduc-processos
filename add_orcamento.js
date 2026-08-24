const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add nav item before </nav>
const navItemOrcamento = `
        <button class="nav-item" data-page="orcamento">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </span>
          Orçamento
        </button>
      </nav>`;

html = html.replace('</nav>', navItemOrcamento);

// 2. Add CSS for orc cards and sections before </style>
const orcCSS = `
    /* ---- Controle Orcamentario Styles ---- */
    .orc-summary-cards { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap:14px; margin-bottom:20px; }
    .orc-card { display:flex; align-items:center; gap:14px; padding:18px 20px; background:#1e293b; border-radius:12px; border:1px solid rgba(255,255,255,0.07); transition: box-shadow 0.2s; }
    .orc-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .orc-card-wide { grid-column: span 2; }
    @media (max-width:768px) { .orc-card-wide { grid-column: span 1; } }
    .orc-card-icon { font-size:28px; min-width:36px; text-align:center; }
    .orc-card-body { flex:1; min-width:0; }
    .orc-card-label { font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-bottom:4px; }
    .orc-card-value { font-size:18px; font-weight:800; font-family:monospace; margin-bottom:2px; }
    .orc-card-sub { font-size:10px; color:#475569; }
    .orc-filters-bar { display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end; margin-bottom:16px; padding:16px; background:#1e293b; border-radius:12px; border:1px solid rgba(255,255,255,0.07); }
    .orc-filters-bar select { flex:1; min-width:200px; padding:9px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.12); background:#0f172a; color:#e2e8f0; font-size:13px; font-weight:600; outline:none; cursor:pointer; }
    .orc-filters-bar select:focus { border-color:#60a5fa; }
    .orc-charts-row { display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-top:20px; }
    @media(max-width:900px) { .orc-charts-row { grid-template-columns:1fr; } }
    .orc-chart-card { background:#1e293b; border-radius:12px; border:1px solid rgba(255,255,255,0.07); padding:20px; }
    .orc-chart-title { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-bottom:14px; }
`;

html = html.replace('</style>', orcCSS + '\n    </style>');

// 3. Add the page section before </body> (before the LOGADOS modal script)
const orcPage = `
  <!-- ============= PAGE: CONTROLE ORCAMENTARIO ============= -->
  <section class="page" id="page-orcamento">

    <div class="section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
      <div>
        <h2 style="margin:0 0 4px; font-size:20px; font-weight:800;">Controle Orcamentario</h2>
        <p style="margin:0; font-size:13px; color:#64748b;">Execucao de Dotacao Orcamentaria - CAM SEDUC-RO</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <button onclick="exportarOrcamentoExcel()" style="display:flex; align-items:center; gap:6px; padding:10px 16px; height:40px; background:#16a34a; border:none; border-radius:8px; color:white; font-weight:700; font-size:13px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 3v5h5M8 13l4 4M12 17l4-4M12 11v6"/></svg>
          EXPORTAR CSV
        </button>
        <button onclick="window.open('https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/edit?gid=325984433','_blank')" style="display:flex; align-items:center; gap:6px; padding:10px 16px; height:40px; background:#10b981; border:none; border-radius:8px; color:white; font-weight:700; font-size:13px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
          PLANILHA
        </button>
      </div>
    </div>

    <!-- Cards -->
    <div class="orc-summary-cards" id="orc-cards"></div>

    <!-- Filtros -->
    <div class="orc-filters-bar">
      <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:200px;">
        <label style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Programa de Acao (PA)</label>
        <select id="orc-filtro-pa"></select>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:200px;">
        <label style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Fonte de Recurso</label>
        <select id="orc-filtro-fonte"></select>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:240px;">
        <label style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Natureza da Despesa</label>
        <select id="orc-filtro-despesa"></select>
      </div>
      <button onclick="limparFiltrosOrcamento()" style="height:40px;padding:0 16px;border-radius:8px;background:rgba(250,204,21,0.15);color:#facc15;border:1px solid #facc15;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;text-transform:uppercase;transition:background 0.2s;" onmouseover="this.style.background='rgba(250,204,21,0.3)'" onmouseout="this.style.background='rgba(250,204,21,0.15)'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        LIMPAR
      </button>
    </div>

    <!-- Legenda das colunas de natureza da despesa -->
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding:12px 16px;background:#1e293b;border-radius:10px;border:1px solid rgba(255,255,255,0.05);">
      <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;align-self:center;margin-right:4px;">Natureza:</span>
      <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(96,165,250,0.12);color:#60a5fa;border:1px solid rgba(96,165,250,0.3);">🏨 Diarias Pessoal</span>
      <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(251,191,36,0.12);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);">📦 Material Consumo</span>
      <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);">✈️ Passagens</span>
      <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(129,140,248,0.12);color:#818cf8;border:1px solid rgba(129,140,248,0.3);">🏢 Serv. Terceiros PJ</span>
      <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.3);">💳 Aux. Financeiro PF</span>
      <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(167,139,250,0.12);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);">🏆 Auxilios/Premio</span>
      <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(244,114,182,0.12);color:#f472b6;border:1px solid rgba(244,114,182,0.3);">🎁 Distrib. Gratuita</span>
    </div>

    <!-- Tabela -->
    <div class="table-wrap" style="overflow-x:auto; overflow-y:auto; max-height:calc(100vh - 380px); border-radius:12px; border:1px solid rgba(255,255,255,0.07);">
      <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;">
        <thead>
          <tr style="background:#0f172a; position:sticky; top:0; z-index:10;">
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">PA</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">Fonte</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">Cod.</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.07);">Natureza da Despesa</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#60a5fa; font-weight:700; text-align:right; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">Dotacao</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#f59e0b; font-weight:700; text-align:right; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">Empenhado</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#f87171; font-weight:700; text-align:right; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">Anulado</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#10b981; font-weight:700; text-align:right; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">Executado</th>
            <th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#a78bfa; font-weight:700; text-align:right; white-space:nowrap; border-bottom:1px solid rgba(255,255,255,0.07);">Saldo Liq.</th>
            <th style="padding:12px 16px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; min-width:120px; border-bottom:1px solid rgba(255,255,255,0.07);">% Exec</th>
          </tr>
        </thead>
        <tbody id="orc-tbody"></tbody>
      </table>
    </div>

    <!-- Graficos -->
    <div class="orc-charts-row">
      <div class="orc-chart-card">
        <div class="orc-chart-title">Execucao por Natureza da Despesa</div>
        <div style="height:240px;"><canvas id="orc-chart-bar"></canvas></div>
      </div>
      <div class="orc-chart-card">
        <div class="orc-chart-title">Distribuicao da Dotacao por Programa</div>
        <div style="height:240px;"><canvas id="orc-chart-donut"></canvas></div>
      </div>
    </div>

  </section>

`;

html = html.replace('<!-- ============= MODAL: LOGADOS =============', orcPage + '\n  <!-- ============= MODAL: LOGADOS =============');

// 4. Include orcamento.js script before </body>
html = html.replace('<script src="js/print-proalfa.js">', '<script src="js/orcamento.js"></script>\n  <script src="js/print-proalfa.js">');

// 5. Add carregarOrcamento() call on navegar
html = html.replace(/case 'orcamento':[^}]*}/g, `case 'orcamento': carregarOrcamento(); break;`);

// 6. Version bump
html = html.replace(/v1\.1\.01/g, 'v1.1.02');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with Orcamento page');
