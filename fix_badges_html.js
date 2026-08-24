const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the static legend section with clickable badge buttons
const oldLegend = /<!-- Legenda das colunas de natureza da despesa -->[\s\S]*?<\/div>/;

const newLegend = `<!-- Legenda das colunas de natureza da despesa – click to filter -->
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding:12px 16px;background:#1e293b;border-radius:10px;border:1px solid rgba(255,255,255,0.05);">
      <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;align-self:center;margin-right:4px;">Filtrar por Natureza:</span>
      <button class="orc-badge-filter" data-code="339014" data-cor="#60a5fa" onclick="filtrarOrcamentoPorNatureza('339014')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(96,165,250,0.12);color:#60a5fa;border:1px solid rgba(96,165,250,0.3);cursor:pointer;transition:all 0.2s;" title="Diárias Pessoal Civil">🏨 Diárias Pessoal</button>
      <button class="orc-badge-filter" data-code="339030" data-cor="#fbbf24" onclick="filtrarOrcamentoPorNatureza('339030')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(251,191,36,0.12);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);cursor:pointer;transition:all 0.2s;" title="Material de Consumo">📦 Material Consumo</button>
      <button class="orc-badge-filter" data-code="339033" data-cor="#38bdf8" onclick="filtrarOrcamentoPorNatureza('339033')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);cursor:pointer;transition:all 0.2s;" title="Passagens e Locomoção">✈️ Passagens</button>
      <button class="orc-badge-filter" data-code="339039" data-cor="#818cf8" onclick="filtrarOrcamentoPorNatureza('339039')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(129,140,248,0.12);color:#818cf8;border:1px solid rgba(129,140,248,0.3);cursor:pointer;transition:all 0.2s;" title="Outros Serviços de Terceiros - PJ">🏢 Serv. Terceiros PJ</button>
      <button class="orc-badge-filter" data-code="339048" data-cor="#4ade80" onclick="filtrarOrcamentoPorNatureza('339048')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(74,222,128,0.12);color:#4ade80;border:1px solid rgba(74,222,128,0.3);cursor:pointer;transition:all 0.2s;" title="Auxílio Financeiro a Pessoa Física">💳 Aux. Financeiro PF</button>
      <button class="orc-badge-filter" data-code="335031" data-cor="#a78bfa" onclick="filtrarOrcamentoPorNatureza('335031')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(167,139,250,0.12);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);cursor:pointer;transition:all 0.2s;" title="Auxílios / Premiação">🏆 Auxílios/Prêmio</button>
      <button class="orc-badge-filter" data-code="339032" data-cor="#f472b6" onclick="filtrarOrcamentoPorNatureza('339032')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(244,114,182,0.12);color:#f472b6;border:1px solid rgba(244,114,182,0.3);cursor:pointer;transition:all 0.2s;" title="Material de Distribuição Gratuita">🎁 Distrib. Gratuita</button>
      <button class="orc-badge-filter" data-code="339036" data-cor="#fb923c" onclick="filtrarOrcamentoPorNatureza('339036')" style="font-size:11px;padding:4px 10px;border-radius:99px;background:rgba(251,146,60,0.12);color:#fb923c;border:1px solid rgba(251,146,60,0.3);cursor:pointer;transition:all 0.2s;" title="Outros Serviços de Terceiros - PF">👤 Serv. Terceiros PF</button>
    </div>`;

html = html.replace(oldLegend, newLegend);

// Also fix the Fonte column in the table header TH
html = html.replace(
  /(<th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:\.5px; color:#64748b; font-weight:700; white-space:nowrap; border-bottom:1px solid rgba\(255,255,255,0\.07\);">Fonte<\/th>)/,
  '<th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; min-width:130px; border-bottom:1px solid rgba(255,255,255,0.07);">Fonte</th>'
);
html = html.replace(
  /(<th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:\.5px; color:#64748b; font-weight:700; white-space:nowrap; border-bottom:1px solid rgba\(255,255,255,0\.07\);">PA<\/th>)/,
  '<th style="padding:12px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; min-width:140px; border-bottom:1px solid rgba(255,255,255,0.07);">PA</th>'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with clickable badges and fixed headers');
