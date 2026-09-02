const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

const regex = /window\.verificarInconsistenciasPlanilha = function\(\) \{[\s\S]*?window\.executarPadronizacaoPlanilha = async function\(\) \{[\s\S]*?\}\s*catch\s*\(e\)\s*\{\s*console\.error\(e\);\s*if\s*\(labelStatus\)\s*labelStatus\.textContent = 'Erro ao aplicar correções\. Tente novamente\.';\s*if\s*\(btnVerificar\)\s*btnVerificar\.disabled = false;\s*\}\s*\};/m;

const replacement = `window.verificarInconsistenciasPlanilha = function() {
  const container = document.getElementById('status-padronizacao-container');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  const btnExecutar = document.getElementById('btn-executar-padronizacao');

  if (container) container.style.display = 'block';
  if (labelStatus) labelStatus.textContent = 'Verificando todos os campos...';
  if (logDiv) logDiv.innerHTML = '';
  if (btnExecutar) btnExecutar.style.display = 'none';

  if (!window.processosCache || window.processosCache.length === 0) {
    if (labelStatus) labelStatus.textContent = 'Erro: Planilha vazia ou não carregada.';
    return;
  }

  let inconsistentes = [];

  const padronizarString = (str) => {
    if (!str) return '';
    return String(str).trim().replace(/\\s+/g, ' ').toUpperCase();
  };

  const camposParaVerificar = ['status', 'localizacao', 'municipio', 'prefixo', 'categoria', 'tipo', 'agrupamento', 'interessado', 'objeto'];

  window.processosCache.forEach(p => {
    let mudou = false;
    let atualizacoes = {};
    let descricoes = [];

    camposParaVerificar.forEach(campo => {
      if (p[campo]) {
        const ps = padronizarString(p[campo]);
        if (p[campo] !== ps) {
          atualizacoes[campo] = ps;
          descricoes.push(\`\${campo.toUpperCase()}: "\${p[campo]}" ➔ "\${ps}"\`);
          mudou = true;
        }
      }
    });

    if (mudou && (p.aba !== 'PARAMETROS' && p.aba !== 'parametro_combo')) {
      inconsistentes.push({
        id: p.id,
        rowNumber: p.rowNumber,
        aba: p.aba,
        numero: p.numero || p.id,
        atualizacoes: atualizacoes,
        descricao: descricoes.join(' | ')
      });
    }
  });

  window._processosInconsistentesParaCorrigir = inconsistentes;

  if (inconsistentes.length === 0) {
    if (labelStatus) labelStatus.textContent = '✓ Tudo perfeito! Nenhuma divergência encontrada em nenhum campo.';
    return;
  }

  if (labelStatus) labelStatus.textContent = \`Atenção: \${inconsistentes.length} registros com divergências (espaços extras ou minúsculas).\`;
  
  let html = \`<table style="width:100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; color: #cbd5e1; background: rgba(0,0,0,0.2);">
    <thead>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); text-align: left;">
        <th style="padding: 6px;">ID / Processo</th>
        <th style="padding: 6px;">Alterações Necessárias</th>
      </tr>
    </thead>
    <tbody>\`;
  
  inconsistentes.slice(0, 100).forEach(inc => {
    html += \`<tr style="border-bottom: 1px dashed rgba(255,255,255,0.05);">
      <td style="padding: 6px; font-weight: bold; color: #94a3b8;">\${inc.numero}</td>
      <td style="padding: 6px; color: #34d399;">\${inc.descricao}</td>
    </tr>\`;
  });
  
  if (inconsistentes.length > 100) {
    html += \`<tr><td colspan="2" style="padding: 6px; text-align: center; color: #fbbf24;">... e mais \${inconsistentes.length - 100} registros ocultos ...</td></tr>\`;
  }
  
  html += '</tbody></table>';
  if (logDiv) logDiv.innerHTML = html;
  if (btnExecutar) btnExecutar.style.display = 'inline-flex';
};

window.executarPadronizacaoPlanilha = async function() {
  const btnExecutar = document.getElementById('btn-executar-padronizacao');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const btnVerificar = document.getElementById('btn-verificar-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  
  if (btnExecutar) btnExecutar.style.display = 'none';
  if (btnVerificar) btnVerificar.disabled = true;
  
  const inconsistentes = window._processosInconsistentesParaCorrigir || [];
  let total = inconsistentes.length;
  
  if (labelStatus) labelStatus.textContent = \`Corrigindo 0 de \${total} registros...\`;
  
  let progContainer = document.getElementById('bar-prog-container');
  if (!progContainer) {
    progContainer = document.createElement('div');
    progContainer.id = 'bar-prog-container';
    progContainer.style = 'width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-top: 10px; margin-bottom: 10px;';
    const bar = document.createElement('div');
    bar.id = 'bar-prog-fill';
    bar.style = 'width: 0%; height: 100%; background: #10b981; transition: width 0.2s ease;';
    progContainer.appendChild(bar);
    logDiv.parentNode.insertBefore(progContainer, logDiv);
  }
  
  const barFill = document.getElementById('bar-prog-fill');
  barFill.style.width = '0%';

  try {
    const token = sessionStorage.getItem('sap_session_token');
    let count = 0;
    
    for (let inc of inconsistentes) {
      count++;
      if (labelStatus) labelStatus.textContent = \`Corrigindo \${count} de \${total}...\`;
      if (barFill) barFill.style.width = \`\${Math.round((count / total) * 100)}%\`;
      
      await fetch(API_BASE + '/api/registros/' + inc.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(inc.atualizacoes)
      });
    }
    
    if (labelStatus) labelStatus.textContent = '✓ Correções aplicadas com sucesso!';
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (e) {
    console.error(e);
    if (labelStatus) labelStatus.textContent = 'Erro ao aplicar correções. Tente novamente.';
    if (btnVerificar) btnVerificar.disabled = false;
  }
};`;

if (!js.includes('executarPadronizacaoPlanilha = async function')) {
  console.log('Regex did not match!');
}

js = js.replace(regex, replacement);
fs.writeFileSync('js/app.js', js);
console.log('patched padronizador');
