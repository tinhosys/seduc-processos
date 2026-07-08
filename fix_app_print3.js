const fs = require('fs');

function fixAppJs(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const regex = /\/\/ ==================== IMPRESSÕES ====================[\s\S]*$/;
  
  const newFuncs = `
// ==================== IMPRESSÕES ====================

function getCommonHeader(subtitle) {
  return \`
    <div style="height:10mm; display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #000; padding-bottom:5px; margin-bottom:15px; width:100%; font-family: Arial, sans-serif;">
      <img src="img/logo-seduc.png" style="height:35px; margin-bottom:-5px;">
      <div style="text-align:right;">
        <h2 style="margin:0 0 2px 0; font-size:14px; color:#000;">CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS</h2>
        <div style="font-size:11px; color:#000; font-weight:bold;">\${subtitle.toUpperCase()}</div>
      </div>
    </div>
  \`;
}

function getCommonFooter() {
  // Retorna apenas um espaçador para a tabela. O footer fixo ficará no body.
  return \`\`;
}

function updatePrintDateTime() {
  const agora = new Date();
  const d = agora.toLocaleDateString('pt-BR');
  const t = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.querySelectorAll('.print-date-time-rodape').forEach(el => {
    el.innerHTML = \`Impresso em \${d} às \${t}\`;
  });
}

function injectFixedFooter() {
  let footer = document.getElementById('fixed-print-footer');
  if (!footer) {
    footer = document.createElement('div');
    footer.id = 'fixed-print-footer';
    footer.className = 'print-only fixed-footer';
    footer.innerHTML = \`
      <div style="border-top:1px solid #000; padding-top:2px; display:flex; justify-content:space-between; align-items:flex-start; font-size:9px; font-weight:bold; color:#000; font-family: Arial, sans-serif; height:10mm; width:100%;">
        <div style="flex:1;">SISTEMA DE ACOMPANHAMENTO DE PROCESSOS - SAP</div>
        <div style="flex:1; text-align:center;" class="print-date-time-rodape"></div>
        <div style="flex:1; text-align:right;" class="page-number-css"></div>
      </div>
    \`;
    document.body.appendChild(footer);
  }
}

window.imprimirPadrao = function() {
  injectFixedFooter();
  updatePrintDateTime();
  document.getElementById('print-layout-detalhado').style.display = 'none';
  document.getElementById('print-layout-analise').style.display = 'none';
  document.body.classList.remove('print-mode-detalhado', 'print-mode-analise');
  
  const hEl = document.getElementById('padrao-header-subtitle');
  if(hEl) hEl.innerHTML = getCommonHeader('Lista de Processos Oficial');

  window.print();
};

window.imprimirDetalhado = function() {
  injectFixedFooter();
  updatePrintDateTime();
  const filtrados = getFiltrados();
  
  let total = 0, qtdAutorizados = 0, valAutorizados = 0;
  let qtdReabertos = 0, valReabertos = 0;
  let qtdOutros = 0, valOutros = 0;
  const statusSummary = {};

  filtrados.forEach(p => {
    total += p.valorOf;
    const st = normalizar(p.status);
    
    if (!statusSummary[p.status]) statusSummary[p.status] = { qtde: 0, valor: 0 };
    statusSummary[p.status].qtde++;
    statusSummary[p.status].valor += p.valorOf;

    if (st.includes('autorizado')) {
      qtdAutorizados++;
      valAutorizados += p.valorOf;
    } else if (st.includes('reaberto')) {
      qtdReabertos++;
      valReabertos += p.valorOf;
    } else {
      qtdOutros++;
      valOutros += p.valorOf;
    }
  });

  const cardsHtml = \`
    <div style="display:flex; gap:10px; margin-bottom: 20px;">
      <div style="flex:1; border:2px solid #000; background:#f8fafc; padding:12px; text-align:center;">
        <div style="font-size:10px; font-weight:bold; color:#000;">VALOR TOTAL CONSOLIDADO</div>
        <div style="font-size:24px; font-weight:bold; color:#000; margin:5px 0;">\${formatCurrency(total)}</div>
        <div style="font-size:10px; color:#000;">\${filtrados.length} processos únicos</div>
      </div>
      <div style="flex:1; border:2px solid #000; background:#f0fdf4; padding:12px; text-align:center;">
        <div style="font-size:10px; font-weight:bold; color:#000;">PROCESSOS AUTORIZADOS</div>
        <div style="font-size:20px; font-weight:bold; color:#000; margin:5px 0;">\${formatCurrency(valAutorizados)}</div>
        <div style="font-size:10px; color:#000;">\${qtdAutorizados} processos</div>
      </div>
      <div style="flex:1; border:2px solid #000; background:#fef2f2; padding:12px; text-align:center;">
        <div style="font-size:10px; font-weight:bold; color:#000;">REABERTOS E PENDENTES</div>
        <div style="font-size:20px; font-weight:bold; color:#000; margin:5px 0;">\${formatCurrency(valReabertos + valOutros)}</div>
        <div style="font-size:10px; color:#000;">\${qtdReabertos + qtdOutros} processos</div>
      </div>
    </div>
  \`;

  let tableRows = '';
  filtrados.forEach((p, i) => {
    tableRows += \`
      <tr>
        <td style="text-align:center;">\${i + 1}</td>
        <td>\${p.prefixo || '-'}</td>
        <td>\${p.numero || '-'}</td>
        <td>\${p.interessado || '-'}</td>
        <td>\${p.objeto || '-'}</td>
        <td style="font-weight:bold;">\${p.status || '-'}</td>
        <td>\${p.localizacao || '-'}</td>
        <td style="text-align:right;">\${formatCurrency(p.valorOf)}</td>
        <td style="text-align:center;">\${formatDate(p.data)}</td>
      </tr>
    \`;
  });

  const tableHtml = \`
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; margin-top:20px; font-size:14px;">1. Detalhamento dos processos</h3>
    <table class="print-table-detalhado" style="width:100%; border-collapse:collapse; font-size:10px; margin-bottom:20px;">
      <thead>
        <tr style="background:#f1f5f9; color:#000; border-bottom:2px solid #000;">
          <th style="padding:6px; border:1px solid #000;">Nº</th>
          <th style="padding:6px; border:1px solid #000;">Prefixo</th>
          <th style="padding:6px; border:1px solid #000;">Processo</th>
          <th style="padding:6px; border:1px solid #000;">Interessado</th>
          <th style="padding:6px; border:1px solid #000;">Objeto / finalidade</th>
          <th style="padding:6px; border:1px solid #000;">Status</th>
          <th style="padding:6px; border:1px solid #000;">Localização</th>
          <th style="padding:6px; border:1px solid #000;">Valor oficial</th>
          <th style="padding:6px; border:1px solid #000;">Data</th>
        </tr>
      </thead>
      <tbody>\${tableRows}</tbody>
    </table>
  \`;

  let sumRows = '';
  Object.keys(statusSummary).forEach(st => {
    const part = total > 0 ? (statusSummary[st].valor / total * 100).toFixed(1) + '%' : '0%';
    sumRows += \`
      <tr>
        <td style="padding:4px; border:1px solid #000;">\${st}</td>
        <td style="padding:4px; border:1px solid #000; text-align:center;">\${statusSummary[st].qtde}</td>
        <td style="padding:4px; border:1px solid #000; text-align:right;">\${formatCurrency(statusSummary[st].valor)}</td>
        <td style="padding:4px; border:1px solid #000; text-align:center;">\${part}</td>
      </tr>
    \`;
  });
  sumRows += \`
    <tr style="background:#e2e8f0; font-weight:bold;">
      <td style="padding:4px; border:1px solid #000;">TOTAL GERAL</td>
      <td style="padding:4px; border:1px solid #000; text-align:center;">\${filtrados.length}</td>
      <td style="padding:4px; border:1px solid #000; text-align:right;">\${formatCurrency(total)}</td>
      <td style="padding:4px; border:1px solid #000; text-align:center;">100,0%</td>
    </tr>
  \`;

  const execSummaryHtml = \`
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; font-size:14px;">2. Resumo por status</h3>
    <div style="display:flex; gap:20px;">
      <div style="flex:1;">
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead>
            <tr style="background:#f1f5f9; color:#000; border-bottom:2px solid #000;">
              <th style="padding:4px; border:1px solid #000;">Status</th>
              <th style="padding:4px; border:1px solid #000;">Qtde.</th>
              <th style="padding:4px; border:1px solid #000;">Valor total</th>
              <th style="padding:4px; border:1px solid #000;">Part.</th>
            </tr>
          </thead>
          <tbody>\${sumRows}</tbody>
        </table>
      </div>
      <div style="flex:1; font-size:11px; line-height:1.5;">
        <strong>Leitura executiva:</strong><br>
        • \${(valAutorizados / (total||1) * 100).toFixed(1)}% do valor consolidado já consta como AUTORIZADO.<br>
        • \${qtdReabertos > 0 ? 'Reabertos: ' + formatCurrency(valReabertos) + '.' : 'Não há processos reabertos nesta seleção.'}<br>
        • \${qtdOutros > 0 ? 'Existem ' + qtdOutros + ' processos em outras situações.' : 'Todos os processos estão resolvidos.'}
      </div>
    </div>
  \`;

  const html = \`
    <table style="width:100%; font-family: Arial, sans-serif;">
      <thead><tr><td>\${getCommonHeader('RELATÓRIO CONSOLIDADO DE PROCESSOS')}</td></tr></thead>
      <tbody><tr><td>
        \${cardsHtml}
        \${tableHtml}
        \${execSummaryHtml}
      </td></tr></tbody>
      <tfoot class="print-spacer-tfoot"><tr><td></td></tr></tfoot>
    </table>
  \`;
  document.getElementById('print-layout-detalhado').innerHTML = html;
  
  document.getElementById('print-layout-detalhado').style.display = 'block';
  document.getElementById('print-layout-analise').style.display = 'none';
  document.body.classList.add('print-mode-detalhado');
  document.body.classList.remove('print-mode-analise');

  window.print();
  
  setTimeout(() => {
    document.body.classList.remove('print-mode-detalhado');
    document.getElementById('print-layout-detalhado').style.display = 'none';
  }, 1000);
};

window.imprimirAnalise = function() {
  injectFixedFooter();
  updatePrintDateTime();
  const filtrados = getFiltrados();
  let total = 0;
  
  const analise = {};
  
  filtrados.forEach(p => {
    total += p.valorOf;
    const st = p.status || 'SEM STATUS';
    const loc = p.localizacao || 'Sem Local';
    
    if(!analise[st]) analise[st] = { qtde: 0, valor: 0, locais: {} };
    analise[st].qtde++;
    analise[st].valor += p.valorOf;
    
    if(!analise[st].locais[loc]) analise[st].locais[loc] = 0;
    analise[st].locais[loc]++;
  });

  const arrStatus = Object.keys(analise).sort((a,b) => analise[b].valor - analise[a].valor);

  let conteudoStatus = '';
  arrStatus.forEach(st => {
    const obj = analise[st];
    const pct = ((obj.valor / (total||1)) * 100).toFixed(1);
    
    const arrLocais = Object.entries(obj.locais).sort((a,b) => b[1]-a[1]);
    const topLocaisStr = arrLocais.slice(0,3).map(l => \`\${l[0]} (\${l[1]})\`).join(', ');

    conteudoStatus += \`
      <div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:#f8fafc; padding:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px; color:#000;">\${st}</h4>
          <strong style="font-size:14px;">\${formatCurrency(obj.valor)} (\${pct}%)</strong>
        </div>
        <div style="font-size:11px; margin-top:5px; color:#333;">
          <strong>Quantidade:</strong> \${obj.qtde} processos.<br>
          <strong>Principais Locais:</strong> \${topLocaisStr}.
        </div>
      </div>
    \`;
  });

  const html = \`
    <table style="width:100%; font-family: Arial, sans-serif;">
      <thead><tr><td>\${getCommonHeader('ANÁLISE GERENCIAL E CRUZAMENTO DE DADOS')}</td></tr></thead>
      <tbody><tr><td>
        
        <div style="margin-bottom:20px; font-size:12px; text-align:justify; line-height:1.6; padding:10px; border:1px solid #ccc;">
          <strong>SÍNTESE ANALÍTICA:</strong> O presente cenário totaliza <strong>\${formatCurrency(total)}</strong> distribuídos em <strong>\${filtrados.length}</strong> processos. 
          Abaixo detalhamos a concentração de recursos por status oficial, cruzando com a localização física atual dos autos, 
          permitindo identificar os principais setores responsáveis pela retenção de processos.
        </div>

        \${conteudoStatus}

        <div style="margin-top:30px; border-top:2px solid #ea580c; padding-top:10px; text-align:right;">
          <div style="font-size:14px; font-weight:bold; color:#ea580c; display:inline-block;">TOTAL GERAL: \${formatCurrency(total)}</div>
        </div>
        
      </td></tr></tbody>
      <tfoot class="print-spacer-tfoot"><tr><td></td></tr></tfoot>
    </table>
  \`;
  
  document.getElementById('print-layout-analise').innerHTML = html;
  
  document.getElementById('print-layout-analise').style.display = 'block';
  document.getElementById('print-layout-detalhado').style.display = 'none';
  document.body.classList.add('print-mode-analise');
  document.body.classList.remove('print-mode-detalhado');

  window.print();
  
  setTimeout(() => {
    document.body.classList.remove('print-mode-analise');
    document.getElementById('print-layout-analise').style.display = 'none';
  }, 1000);
};
`;

  if (regex.test(content)) {
    content = content.replace(regex, newFuncs);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', filepath);
  } else {
    console.log('Regex did not match in', filepath);
  }
}

fixAppJs('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
fixAppJs('c:/Users/Elton/SEDUC/js/app.js');
