const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regexMap = /return \{\s*data: row\[0\].*?valorText: row\[8\] \|\| '0,00'\s*\};\s*\}\)\.filter/s;

const replacementMap = `return {
            pa: row[0] || '',
            fonte: row[1] || '',
            despesa: row[2] || '',
            tipo: row[3] || '',
            processo: row[4] || '',
            data: row[5] || '',
            setor: row[6] || '',
            descricao: row[7] || '',
            valorText: row[8] || '0,00'
          };
        }).filter`;

content = content.replace(regexMap, replacementMap);

// Add the renderDespesasRealizadas function
const renderCode = `
window.popularFiltrosDespesas = function() {
  const paSet = new Set(), setorSet = new Set(), tipoSet = new Set();
  _crmData.forEach(r => {
    if(r.pa) paSet.add(r.pa);
    if(r.setor) setorSet.add(r.setor);
    if(r.tipo) tipoSet.add(r.tipo);
  });
  
  const fill = (id, set) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = '<option value="">Todos</option>' + Array.from(set).sort().map(v => \`<option value="\${v}">\${v}</option>\`).join('');
  };
  
  fill('orc-desp-filtro-pa', paSet);
  fill('orc-desp-filtro-setor', setorSet);
  fill('orc-desp-filtro-tipo', tipoSet);

  document.getElementById('orc-desp-filtro-pa').addEventListener('change', window.renderDespesasRealizadas);
  document.getElementById('orc-desp-filtro-setor').addEventListener('change', window.renderDespesasRealizadas);
  document.getElementById('orc-desp-filtro-tipo').addEventListener('change', window.renderDespesasRealizadas);
};

window.renderDespesasRealizadas = function() {
  const tbody = document.getElementById('orc-desp-table-body');
  if(!tbody) return;

  const pa = document.getElementById('orc-desp-filtro-pa')?.value || '';
  const setor = document.getElementById('orc-desp-filtro-setor')?.value || '';
  const tipo = document.getElementById('orc-desp-filtro-tipo')?.value || '';
  const busca = (document.getElementById('orc-desp-filtro-busca')?.value || '').toLowerCase();

  const filtrado = _crmData.filter(r => {
    if (pa && r.pa !== pa) return false;
    if (setor && r.setor !== setor) return false;
    if (tipo && r.tipo !== tipo) return false;
    if (busca) {
      const match = (r.processo.toLowerCase().includes(busca) || r.descricao.toLowerCase().includes(busca));
      if (!match) return false;
    }
    return true;
  });

  tbody.innerHTML = filtrado.map(p => {
    let badgeCor = '#64748b';
    if(p.tipo === 'Empenhado') badgeCor = '#f59e0b';
    if(p.tipo === 'Reserva') badgeCor = '#60a5fa';
    if(p.tipo === 'Anulação') badgeCor = '#f87171';
    
    return \`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
        <td style="padding: 10px 16px; color: #cbd5e1; white-space: nowrap;">\${p.data}</td>
        <td style="padding: 10px 16px; font-family: monospace; font-size: 13px; font-weight: 700; color: #e2e8f0; white-space: nowrap;">\${p.processo}</td>
        <td style="padding: 10px 16px; color: #94a3b8;">\${p.pa}</td>
        <td style="padding: 10px 16px; color: #94a3b8;">\${p.setor}</td>
        <td style="padding: 10px 16px; color: #94a3b8;">\${p.despesa}</td>
        <td style="padding: 10px 16px;">
          <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:\${badgeCor}; background:\${badgeCor}22; padding:2px 6px; border-radius:4px; border:1px solid \${badgeCor}44;">\${p.tipo}</span>
        </td>
        <td style="padding: 10px 16px; color: #94a3b8; line-height: 1.4; min-width: 200px;">
          <div style="font-weight: 600; color: #cbd5e1;">\${p.descricao}</div>
        </td>
        <td style="padding: 10px 16px; text-align: right; font-family: monospace; font-weight: 700; color: \${p.tipo === 'Anulação' ? '#f87171' : '#10b981'}; white-space: nowrap;">
          \${p.tipo === 'Anulação' ? '-' : ''} R$ \${p.valorText}
        </td>
      </tr>
    \`;
  }).join('');
};
`;

content += '\n' + renderCode;

fs.writeFileSync(file, content);
console.log('Patched orcamento part 2');
