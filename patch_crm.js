const fs = require('fs');
let js = fs.readFileSync('js/orcamento.js', 'utf8');

// The new CRM data URL
const CRM_CSV_URL = 'https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/export?format=csv&gid=807660383';

const crmCode = `
// ============================================================
// ACOMPANHAMENTO CRM - PROCESSOS SEI
// ============================================================
let _crmData = [];

async function carregarCRM() {
  try {
    const el = document.getElementById('orc-crm-container');
    if (!el) return;
    el.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">Carregando acompanhamento CRM...</div>';

    const response = await fetch('${CRM_CSV_URL}');
    const text = await response.text();
    
    // Parse simple CSV
    const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
    const headers = lines[0].split(',').map(h => h.trim());
    
    _crmData = lines.slice(1).map(line => {
      // Handle quoted values for "Valor" and "Descrição"
      const row = [];
      let inQuotes = false;
      let current = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          row.push(current);
          current = '';
        } else {
          current += c;
        }
      }
      row.push(current);
      
      return {
        pa: row[0],
        fonte: row[1],
        despesa: row[2],
        tipo: row[3],
        processo: row[4],
        data: row[5],
        setor: row[6],
        descricao: row[7]?.replace(/^"|"$/g, '').trim() || '',
        valorText: row[8]?.replace(/^"|"$/g, '').trim() || '0,00'
      };
    });
    
    renderCRM();
  } catch (err) {
    console.error('Erro ao carregar CRM:', err);
    document.getElementById('orc-crm-container').innerHTML = '<div style="padding: 20px; color: #ef4444;">Erro ao carregar dados do CRM.</div>';
  }
}

function classificarProcesso(p) {
  const t = (p.pa + ' ' + p.descricao).toUpperCase();
  if (t.includes('PROALFA') || t.includes('ALFABETIZAÇÃO') || p.pa === '4097') return 'PROALFA';
  if (t.includes('SAERO') || t.includes('AVALIAÇÃO') || p.pa === '4100') return 'GMAC';
  if (t.includes('PREMIA') || t.includes('FOMENTO') || p.pa === '4185') return 'GDSM';
  return 'CAM';
}

function renderCRM() {
  const container = document.getElementById('orc-crm-container');
  if (!container) return;

  const grouped = { CAM: [], GDSM: [], GMAC: [], PROALFA: [] };
  
  _crmData.forEach(p => {
    const grupo = classificarProcesso(p);
    if (grouped[grupo]) grouped[grupo].push(p);
  });

  let html = '';
  
  Object.keys(grouped).forEach(grupo => {
    const procs = grouped[grupo];
    const totalValor = procs.reduce((acc, p) => {
      const v = parseFloat(p.valorText.replace(/\\./g, '').replace(',', '.')) || 0;
      // Subtract if Anulação? The CSV has Tipo "Anulação"
      if (p.tipo === 'Anulação') return acc - v;
      return acc + v;
    }, 0);
    
    const count = procs.length;
    
    html += \`
      <div style="margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: #1e293b; overflow: hidden;">
        
        <!-- Accordion Header -->
        <div onclick="toggleCRM('\${grupo}')" style="display:flex; justify-content:space-between; align-items:center; padding: 14px 20px; background: rgba(0,0,0,0.2); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
          <div style="display:flex; align-items:center; gap: 12px;">
            <div style="font-size: 16px; font-weight: 800; color: #e2e8f0;">\${grupo}</div>
            <div style="font-size: 11px; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 99px; color: #94a3b8;">\${count} registros</div>
          </div>
          <div style="display:flex; align-items:center; gap: 16px;">
            <div style="font-size: 14px; font-weight: 700; color: #34d399; font-family: monospace;">\${_fmtBRL(totalValor)}</div>
            <svg id="icon-crm-\${grupo}" style="transition: transform 0.3s;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        
        <!-- Accordion Body -->
        <div id="body-crm-\${grupo}" style="display: none; padding: 0;">
          \${procs.length === 0 ? '<div style="padding:20px; color:#64748b; font-size:12px;">Nenhum processo classificado neste setor.</div>' : ''}
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: rgba(255,255,255,0.02);">
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Data</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Processo SEI</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Tipo</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Ações SEI</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Descrição / Detalhamento</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase; text-align: right;">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                \${procs.map(p => {
                  let badgeCor = '#64748b';
                  if(p.tipo === 'Empenhado') badgeCor = '#f59e0b';
                  if(p.tipo === 'Reserva') badgeCor = '#60a5fa';
                  if(p.tipo === 'Anulação') badgeCor = '#f87171';
                  
                  return \`
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 10px 16px; color: #cbd5e1; white-space: nowrap;">\${p.data}</td>
                      <td style="padding: 10px 16px; font-family: monospace; font-size: 13px; font-weight: 700; color: #e2e8f0; white-space: nowrap;">\${p.processo}</td>
                      <td style="padding: 10px 16px;">
                        <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:\${badgeCor}; background:\${badgeCor}22; padding:2px 6px; border-radius:4px; border:1px solid \${badgeCor}44;">\${p.tipo}</span>
                      </td>
                      <td style="padding: 10px 16px; white-space: nowrap;">
                        <div style="display:flex; gap: 6px;">
                          <button onclick="navigator.clipboard.writeText('\${p.processo}'); showToast('Processo SEI copiado!');" style="background:#334155; border:none; color:#e2e8f0; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:11px; display:flex; align-items:center; gap:4px; transition:0.2s;" onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#334155'" title="Copiar Nº SEI">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar
                          </button>
                          <button onclick="window.open('https://sei.ro.gov.br/sei/modulos/pesquisa/md_pesq_processo_pesquisar.php?acao_externa=protocolo_pesquisar&acao_origem_externa=protocolo_pesquisar&id_orgao_acesso_externo=0', '_blank')" style="background:#2563eb; border:none; color:white; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:11px; display:flex; align-items:center; gap:4px; transition:0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'" title="Pesquisar SEI">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Abrir SEI
                          </button>
                        </div>
                      </td>
                      <td style="padding: 10px 16px; color: #94a3b8; line-height: 1.4; min-width: 200px;">
                        <div style="font-weight: 600; color: #cbd5e1;">\${p.descricao}</div>
                        <div style="font-size: 10px; color: #475569; margin-top: 2px;">PA: \${p.pa} | Fonte: \${p.fonte} | Nat: \${p.despesa}</div>
                      </td>
                      <td style="padding: 10px 16px; text-align: right; font-family: monospace; font-weight: 700; color: \${p.tipo === 'Anulação' ? '#f87171' : '#10b981'}; white-space: nowrap;">
                        \${p.tipo === 'Anulação' ? '-' : ''} R$ \${p.valorText}
                      </td>
                    </tr>
                  \`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    \`;
  });

  container.innerHTML = html;
}

window.toggleCRM = function(grupo) {
  const body = document.getElementById('body-crm-' + grupo);
  const icon = document.getElementById('icon-crm-' + grupo);
  if (!body || !icon) return;
  
  if (body.style.display === 'none') {
    body.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    body.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
};
`;

js = js + '\n' + crmCode;

// Inject carregarCRM() call into carregarOrcamento()
js = js.replace(
  `function carregarOrcamento() {
  inicializarFiltrosOrcamento();
  filtrarOrcamento();
}`,
  `function carregarOrcamento() {
  inicializarFiltrosOrcamento();
  filtrarOrcamento();
  carregarCRM();
}`
);

fs.writeFileSync('js/orcamento.js', js, 'utf8');
console.log('orcamento.js patched with CRM logic');
