const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const regex = /window\.verificarInconsistenciasPlanilha = function\(\) \{[\s\S]*?if \(typeof recarregarDadosGlobais === 'function'\) \{\s*recarregarDadosGlobais\(\);\s*\}\s*\};/g;

const newLogic = `window._processosInconsistentesParaCorrigir = [];

window.verificarInconsistenciasPlanilha = function() {
  const container = document.getElementById('status-padronizacao-container');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  const btnExecutar = document.getElementById('btn-executar-padronizacao');

  if (container) container.style.display = 'block';
  if (labelStatus) labelStatus.textContent = 'Verificando...';
  if (logDiv) logDiv.innerHTML = '';
  if (btnExecutar) btnExecutar.style.display = 'none';

  if (!window.processosCache || window.processosCache.length === 0) {
    if (labelStatus) labelStatus.textContent = 'Erro: Planilha vazia ou nǜo carregada.';
    return;
  }

  let inconsistentes = [];

  const padronizarString = (str) => {
    if (!str) return '';
    return str.trim().replace(/\\s+/g, ' ').toUpperCase();
  };

  window.processosCache.forEach(p => {
    let mudou = false;
    let novoStatus = p.status;
    let novaLocalizacao = p.localizacao;

    if (p.status) {
      const ps = padronizarString(p.status);
      if (p.status !== ps) {
        novoStatus = ps;
        mudou = true;
      }
    }

    if (p.localizacao) {
      const pl = padronizarString(p.localizacao);
      if (p.localizacao !== pl) {
        novaLocalizacao = pl;
        mudou = true;
      }
    }

    if (mudou && (p.aba !== 'PARAMETROS' && p.aba !== 'parametro_combo')) {
      inconsistentes.push({
        id: p.id,
        rowNumber: p.rowNumber,
        aba: p.aba,
        numero: p.numero,
        statusAntigo: p.status || '-',
        statusNovo: novoStatus || '-',
        locAntiga: p.localizacao || '-',
        locNova: novaLocalizacao || '-'
      });
    }
  });

  window._processosInconsistentesParaCorrigir = inconsistentes;

  if (inconsistentes.length === 0) {
    if (labelStatus) labelStatus.textContent = '✓ Planilha estǭ 100% padronizada! Nenhuma divergǦncia encontrada.';
    if (logDiv) logDiv.innerHTML = '<div>Sem erros ortogrǭficos ou de espaçamento.</div>';
  } else {
    if (labelStatus) labelStatus.textContent = \`Atenção: \${inconsistentes.length} divergências encontradas. Por favor, autorize as mudanças abaixo:\`;
    
    let htmlTable = '<table style="width:100%; border-collapse:collapse; margin-top:10px;">';
    htmlTable += '<tr style="border-bottom:1px solid rgba(255,255,255,0.2);"><th style="padding:4px; text-align:left;">Processo</th><th style="padding:4px; text-align:left;">Status (Antes -> Depois)</th><th style="padding:4px; text-align:left;">Localização (Antes -> Depois)</th></tr>';
    
    inconsistentes.forEach(inc => {
      let stDiff = inc.statusAntigo !== inc.statusNovo ? \`<span style="color:#ef4444">\${inc.statusAntigo}</span> &rarr; <span style="color:#10b981">\${inc.statusNovo}</span>\` : \`<span style="color:#94a3b8">\${inc.statusAntigo}</span>\`;
      let locDiff = inc.locAntiga !== inc.locNova ? \`<span style="color:#ef4444">\${inc.locAntiga}</span> &rarr; <span style="color:#10b981">\${inc.locNova}</span>\` : \`<span style="color:#94a3b8">\${inc.locAntiga}</span>\`;
      htmlTable += \`<tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:4px;">\${inc.numero || inc.id}</td><td style="padding:4px;">\${stDiff}</td><td style="padding:4px;">\${locDiff}</td></tr>\`;
    });
    htmlTable += '</table>';
    
    if (logDiv) logDiv.innerHTML = htmlTable;
    if (btnExecutar) btnExecutar.style.display = 'flex';
  }
};

window.executarPadronizacaoPlanilha = async function() {
  const btnExecutar = document.getElementById('btn-executar-padronizacao');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const btnVerificar = document.getElementById('btn-verificar-padronizacao');
  
  if (btnExecutar) btnExecutar.style.display = 'none';
  if (btnVerificar) btnVerificar.disabled = true;
  if (labelStatus) labelStatus.textContent = 'Enviando correes para a planilha... Isso pode levar alguns segundos.';

  try {
    const token = sessionStorage.getItem('sap_session_token');
    const inconsistentes = window._processosInconsistentesParaCorrigir || [];
    let count = 0;
    
    for (let inc of inconsistentes) {
      if (labelStatus) labelStatus.textContent = \`Corrigindo \${count + 1} de \${inconsistentes.length}...\`;
      const payload = { action: 'updateProcesso', token: token, data: { id: inc.id, aba: inc.aba, status: inc.statusNovo, localizacao: inc.locNova } };
      await fetch(API_BASE, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      count++;
    }
    
    if (labelStatus) labelStatus.textContent = '✓ Correções aplicadas com sucesso!';
    setTimeout(() => { window.location.reload(); }, 2000);
  } catch (e) {
    console.error(e);
    if (labelStatus) labelStatus.textContent = 'Erro ao aplicar correes. Tente novamente.';
    if (btnVerificar) btnVerificar.disabled = false;
  }
};`;

content = content.replace(regex, newLogic);
fs.writeFileSync('js/app.js', content);
console.log('patched regex padronizacao');
