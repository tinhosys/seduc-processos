const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

js = js.replace(/window\.executarPadronizacaoPlanilha = async function\(\) \{[\s\S]*?\}\s*catch\s*\(e\)\s*\{[\s\S]*?\}\s*\};/m, `window.executarPadronizacaoPlanilha = async function() {
  const btnExecutar = document.getElementById('btn-executar-padronizacao');
  const labelStatus = document.getElementById('label-status-padronizacao');
  const btnVerificar = document.getElementById('btn-verificar-padronizacao');
  const logDiv = document.getElementById('log-status-padronizacao');
  
  if (btnExecutar) btnExecutar.style.display = 'none';
  if (btnVerificar) btnVerificar.disabled = true;
  
  const inconsistentes = window._processosInconsistentesParaCorrigir || [];
  let total = inconsistentes.length;
  
  if (labelStatus) labelStatus.textContent = \`Corrigindo 0 de \${total} divergências...\`;
  
  // Create progress bar
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
      
      const payload = {
        action: 'updateProcesso',
        token: token,
        data: {
          id: inc.id,
          aba: inc.aba,
          status: inc.statusNovo,
          localizacao: inc.locNova
        }
      };
      
      await fetch(API_BASE, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
};`);

fs.writeFileSync('js/app.js', js);
console.log('progress bar added');
