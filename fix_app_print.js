const fs = require('fs');

function appendToAppJs(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const funcs = `
// ==================== IMPRESSÕES ====================

window.imprimirPadrao = function() {
  const agora = new Date();
  const d = agora.toLocaleDateString('pt-BR');
  const t = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.querySelectorAll('.print-date-time-rodape').forEach(el => el.innerHTML = 'Impresso em ' + d + ' às ' + t);
  
  document.getElementById('print-layout-detalhado').style.display = 'none';
  document.getElementById('print-layout-analise').style.display = 'none';
  document.body.classList.remove('print-mode-detalhado', 'print-mode-analise');
  
  window.print();
};

window.imprimirDetalhado = function() {
  const agora = new Date();
  const d = agora.toLocaleDateString('pt-BR');
  const t = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
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
      <div style="flex:1; border:2px solid #a5f3fc; background:#ecfeff; padding:12px; text-align:center;">
        <div style="font-size:10px; font-weight:bold; color:#0e7490;">VALOR TOTAL CONSOLIDADO</div>
        <div style="font-size:24px; font-weight:bold; color:#047857; margin:5px 0;">\${formatCurrency(total)}</div>
        <div style="font-size:10px; color:#555;">\${filtrados.length} processos únicos</div>
      </div>
      <div style="flex:1; border:2px solid #bbf7d0; background:#f0fdf4; padding:12px; text-align:center;">
        <div style="font-size:10px; font-weight:bold; color:#166534;">PROCESSOS AUTORIZADOS</div>
        <div style="font-size:20px; font-weight:bold; color:#15803d; margin:5px 0;">\${formatCurrency(valAutorizados)}</div>
        <div style="font-size:10px; color:#555;">\${qtdAutorizados} processos</div>
      </div>
      <div style="flex:1; border:2px solid #e9d5ff; background:#faf5ff; padding:12px; text-align:center;">
        <div style="font-size:10px; font-weight:bold; color:#6b21a8;">PROCESSOS REABERTOS</div>
        <div style="font-size:20px; font-weight:bold; color:#7e22ce; margin:5px 0;">\${formatCurrency(valReabertos)}</div>
        <div style="font-size:10px; color:#555;">\${qtdReabertos} processos</div>
      </div>
      <div style="flex:1; border:2px solid #fed7aa; background:#fff7ed; padding:12px; text-align:center;">
        <div style="font-size:10px; font-weight:bold; color:#c2410c;">PENDENTES/OUTROS</div>
        <div style="font-size:20px; font-weight:bold; color:#b45309; margin:5px 0;">\${formatCurrency(valOutros)}</div>
        <div style="font-size:10px; color:#555;">\${qtdOutros} processos</div>
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
        <td style="color:\${getStatusColor(p.status)};">\${p.status || '-'}</td>
        <td>\${p.localizacao || '-'}</td>
        <td style="text-align:right;">\${formatCurrency(p.valorOf)}</td>
        <td style="text-align:center;">\${formatDate(p.data)}</td>
      </tr>
    \`;
  });

  const tableHtml = \`
    <h3 style="color:#1e3a8a; border-bottom:2px solid #1e3a8a; padding-bottom:5px; margin-top:20px;">1. Detalhamento dos processos</h3>
    <table class="print-table-detalhado" style="width:100%; border-collapse:collapse; font-size:10px; margin-bottom:20px;">
      <thead>
        <tr style="background:#1e3a8a; color:white;">
          <th style="padding:6px; border:1px solid #ccc;">Nº</th>
          <th style="padding:6px; border:1px solid #ccc;">Prefixo</th>
          <th style="padding:6px; border:1px solid #ccc;">Processo</th>
          <th style="padding:6px; border:1px solid #ccc;">Interessado</th>
          <th style="padding:6px; border:1px solid #ccc;">Objeto / finalidade</th>
          <th style="padding:6px; border:1px solid #ccc;">Status</th>
          <th style="padding:6px; border:1px solid #ccc;">Localização</th>
          <th style="padding:6px; border:1px solid #ccc;">Valor oficial</th>
          <th style="padding:6px; border:1px solid #ccc;">Data</th>
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
        <td style="padding:4px; border:1px solid #ccc;">\${st}</td>
        <td style="padding:4px; border:1px solid #ccc; text-align:center;">\${statusSummary[st].qtde}</td>
        <td style="padding:4px; border:1px solid #ccc; text-align:right;">\${formatCurrency(statusSummary[st].valor)}</td>
        <td style="padding:4px; border:1px solid #ccc; text-align:center;">\${part}</td>
      </tr>
    \`;
  });
  sumRows += \`
    <tr style="background:#f1f5f9; font-weight:bold;">
      <td style="padding:4px; border:1px solid #ccc;">TOTAL GERAL</td>
      <td style="padding:4px; border:1px solid #ccc; text-align:center;">\${filtrados.length}</td>
      <td style="padding:4px; border:1px solid #ccc; text-align:right;">\${formatCurrency(total)}</td>
      <td style="padding:4px; border:1px solid #ccc; text-align:center;">100,0%</td>
    </tr>
  \`;

  const partAut = total > 0 ? (valAutorizados / total * 100).toFixed(1) : 0;
  const execSummaryHtml = \`
    <h3 style="color:#1e3a8a; border-bottom:2px solid #1e3a8a; padding-bottom:5px;">2. Resumo por status</h3>
    <div style="display:flex; gap:20px;">
      <div style="flex:1;">
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead>
            <tr style="background:#1e3a8a; color:white;">
              <th style="padding:4px; border:1px solid #ccc;">Status</th>
              <th style="padding:4px; border:1px solid #ccc;">Qtde.</th>
              <th style="padding:4px; border:1px solid #ccc;">Valor total</th>
              <th style="padding:4px; border:1px solid #ccc;">Part.</th>
            </tr>
          </thead>
          <tbody>\${sumRows}</tbody>
        </table>
      </div>
      <div style="flex:1; font-size:11px; line-height:1.5;">
        <strong>Leitura executiva:</strong><br>
        • \${partAut}% do valor consolidado já consta como AUTORIZADO.<br>
        • \${qtdReabertos > 0 ? 'Reabertos: ' + formatCurrency(valReabertos) + '.' : 'Não há processos reabertos nesta seleção.'}<br>
        • \${qtdOutros > 0 ? 'Existem ' + qtdOutros + ' processos aguardando ou em outras situações que requerem atenção.' : 'Todos os processos estão resolvidos.'}
      </div>
    </div>
  \`;

  const headerHtml = \`
    <div style="display:flex; align-items:center; border-bottom:3px solid #1e3a8a; padding-bottom:10px; margin-bottom:15px;">
      <div style="background:#0ea5e9; color:white; padding:15px 30px; font-weight:bold; font-size:24px;">SEDUC</div>
      <div style="margin-left:20px;">
        <h1 style="color:#1e3a8a; margin:0 0 5px 0; font-size:22px;">RELATÓRIO CONSOLIDADO DE PROCESSOS</h1>
        <div style="font-size:11px; color:#555;">Base de consulta: SAP/SEDUC - levantamento exibido em \${d}, às \${t}.</div>
      </div>
    </div>
  \`;

  const html = \`<div class="pdf-print-container">\${headerHtml}\${cardsHtml}\${tableHtml}\${execSummaryHtml}</div>\`;
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

function getStatusColor(status) {
  const s = normalizar(status);
  if (s.includes('autorizado')) return '#15803d';
  if (s.includes('reaberto')) return '#7e22ce';
  if (s.includes('notificado')) return '#c2410c';
  return '#475569';
}

window.imprimirAnalise = function() {
  const agora = new Date();
  const d = agora.toLocaleDateString('pt-BR');
  const t = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const filtrados = getFiltrados();
  
  let total = 0;
  const locs = {};
  filtrados.forEach(p => {
    total += p.valorOf;
    const l = p.localizacao || 'Sem Local';
    if(!locs[l]) locs[l] = 0;
    locs[l]++;
  });

  const locsArr = Object.entries(locs).sort((a,b) => b[1]-a[1]);
  let locsHtml = '';
  locsArr.forEach(([loc, qtde]) => {
    const pct = ((qtde / filtrados.length) * 100).toFixed(1);
    locsHtml += \`<div style="margin-bottom:8px;"><strong>\${loc}:</strong> \${qtde} processos (\${pct}%)</div>\`;
  });

  const html = \`
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h1 style="color: #6b21a8; border-bottom: 2px solid #6b21a8; padding-bottom: 10px;">Análise Gerencial de Processos</h1>
      <p style="font-size: 12px; color: #666;">Relatório emitido em \${d} às \${t}. Total de \${filtrados.length} processos correspondentes ao filtro.</p>
      
      <div style="margin-top: 30px; background: #faf5ff; border-left: 4px solid #9333ea; padding: 15px;">
        <h3 style="margin-top: 0; color: #6b21a8;">Comentário Analítico</h3>
        <p>A presente seleção totaliza <strong>\${formatCurrency(total)}</strong> em recursos oficiais. Observa-se que a maior concentração de processos está distribuída nos seguintes setores/localizações:</p>
        <div style="margin: 15px 0 15px 15px;">\${locsHtml}</div>
        <p>Recomenda-se acompanhamento direto junto aos setores com maior volume de retenção, de modo a otimizar o andamento dos trâmites.</p>
      </div>
      
      <div style="margin-top: 30px; display: flex; justify-content: space-between;">
        <div style="flex:1; border: 1px solid #ccc; padding: 15px; margin-right: 15px; border-radius: 8px;">
          <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Distribuição de Volume</h3>
          <p style="font-size:24px; font-weight:bold; color:#4f46e5; text-align:center;">\${filtrados.length}</p>
          <p style="text-align:center; font-size:12px; color:#555;">processos em análise</p>
        </div>
        <div style="flex:1; border: 1px solid #ccc; padding: 15px; border-radius: 8px;">
          <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Impacto Financeiro</h3>
          <p style="font-size:24px; font-weight:bold; color:#059669; text-align:center;">\${formatCurrency(total)}</p>
          <p style="text-align:center; font-size:12px; color:#555;">valor oficial acumulado</p>
        </div>
      </div>
    </div>
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

  if (!content.includes('imprimirDetalhado')) {
    content += funcs;
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Appended to', filepath);
  }
}

appendToAppJs('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
appendToAppJs('c:/Users/Elton/SEDUC/js/app.js');
