const fs = require('fs');

function updateAppCharts() {
  const filePath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let js = fs.readFileSync(filePath, 'utf8');

  // Find the start of status aggregation
  const statusStartTag = '// Gráfico: Status';
  const statusStartIndex = js.indexOf(statusStartTag);
  
  // Find the end of prefixo chart instantiation (around line 242)
  // Let's search for "window.chartPrefixoInstance = new Chart(ctxPrefixo.getContext('2d'), {"
  const prefixoEndTag = 'window.chartPrefixoInstance = new Chart';
  const prefixoEndIndex = js.indexOf(prefixoEndTag);

  // Let's locate the exact target content to replace
  // We want to replace from lines 81 to 242
  const target = `  // Gráfico: Status
  const statusCounts = {};
  processos.forEach(p => {
    const s = p.status || 'Sem status';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusLabels = Object.keys(statusCounts).sort((a,b) => statusCounts[b] - statusCounts[a]).slice(0, 10);
  const statusValues = statusLabels.map(k => statusCounts[k]);
  const totalStatus = statusValues.reduce((sum, v) => sum + v, 0) || 1;

  const colorsStatus = [
    '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#f97316','#6366f1','#ec4899','#14b8a6'
  ];

  const ctxStatus = document.getElementById('chart-status').getContext('2d');
  if (chartStatus) chartStatus.destroy();
  chartStatus = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: colorsStatus, borderWidth: 2, borderColor: '#0a0f1e' }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { 
          position: 'right', 
          onClick: function(e, legendItem, legend) {
            const index = legendItem.index;
            const ci = legend.chart;
            ci.toggleDataVisibility(index);
            ci.update();
          },
          labels: { 
            color: '#f8fafc', 
            font: { size: 10 }, 
            padding: 10,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percent = ((value / totalStatus) * 100).toFixed(1) + '%';
                  const isHidden = !chart.getDataVisibility(i);
                  return {
                    text: \`\${label.toUpperCase()} (\${percent})\`,
                    fillStyle: isHidden ? 'rgba(255,255,255,0.05)' : style.backgroundColor,
                    strokeStyle: isHidden ? 'rgba(255,255,255,0.1)' : style.borderColor,
                    lineWidth: style.borderWidth,
                    fontColor: isHidden ? '#475569' : '#f7f7f7',
                    textDecoration: 'none',
                    hidden: false, // We handle the visual 'hidden' state manually now
                    index: i
                  };
                });
              }
              return [];
            }
          } 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = ((val / totalStatus) * 100).toFixed(1) + '%';
              return \` \${context.label.toUpperCase()}: \${val} (\${pct})\`;
            }
          }
        }
      }
    }
  });`;

  const replacement = `  // Gráfico: Status (Normalizado e Agrupado em Top 5 + Outros)
  const statusCounts = {};
  processos.forEach(p => {
    let s = (p.status || 'SEM STATUS').trim().toUpperCase();
    if (s === '.' || s === '') s = 'SEM STATUS';
    // Normalizar duplicatas comuns
    if (s === 'P/ AUTORIZO' || s === 'P/AUTORIZO' || s === 'PARA AUTORIZO') {
      s = 'P/ AUTORIZO';
    }
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  const sortedStatuses = Object.keys(statusCounts).sort((a,b) => statusCounts[b] - statusCounts[a]);
  const topStatuses = sortedStatuses.slice(0, 5);
  const restStatuses = sortedStatuses.slice(5);

  const statusLabels = [...topStatuses];
  const statusValues = topStatuses.map(k => statusCounts[k]);

  if (restStatuses.length > 0) {
    const restSum = restStatuses.reduce((sum, k) => sum + statusCounts[k], 0);
    if (restSum > 0) {
      statusLabels.push('OUTROS');
      statusValues.push(restSum);
    }
  }

  const totalStatus = statusValues.reduce((sum, v) => sum + v, 0) || 1;

  const colorsStatus = [
    '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#64748b' // Cinza neutro para 'OUTROS'
  ];

  const ctxStatus = document.getElementById('chart-status').getContext('2d');
  if (chartStatus) chartStatus.destroy();
  chartStatus = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: colorsStatus, borderWidth: 2, borderColor: '#0a0f1e' }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { 
          position: 'right', 
          onClick: function(e, legendItem, legend) {
            const index = legendItem.index;
            const ci = legend.chart;
            ci.toggleDataVisibility(index);
            ci.update();
          },
          labels: { 
            color: '#f8fafc', 
            font: { size: 11, weight: 'bold' }, 
            padding: 15,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percent = ((value / totalStatus) * 100).toFixed(1) + '%';
                  const isHidden = !chart.getDataVisibility(i);
                  return {
                    text: \`\${label} (\${percent})\`,
                    fillStyle: isHidden ? 'rgba(255,255,255,0.05)' : style.backgroundColor,
                    strokeStyle: isHidden ? 'rgba(255,255,255,0.1)' : style.borderColor,
                    lineWidth: style.borderWidth,
                    fontColor: isHidden ? '#475569' : '#f7f7f7',
                    textDecoration: 'none',
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          } 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = ((val / totalStatus) * 100).toFixed(1) + '%';
              return \` \${context.label}: \${val} (\${pct})\`;
            }
          }
        }
      }
    }
  });`;

  js = js.replace(target, replacement);

  // Now replace the Prefixo Chart logic
  const targetPrefixo = `  // Gráfico: Prefixo
    const prefixoCounts = {};
    processos.forEach(p => {
      let pr = 'Outros';
      if (p.numero && p.numero.includes('.')) {
        pr = p.numero.split('.')[0];
      }
      prefixoCounts[pr] = (prefixoCounts[pr] || 0) + 1;
    });`;

  const replacementPrefixo = `  // Gráfico: Prefixo (LT, Cgoi, IeCH, ClJs...)
    const prefixoCounts = {};
    processos.forEach(p => {
      const pr = (p.prefixo || 'OUTROS').trim().toUpperCase();
      prefixoCounts[pr] = (prefixoCounts[pr] || 0) + 1;
    });`;

  js = js.replace(targetPrefixo, replacementPrefixo);

  fs.writeFileSync(filePath, js, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', js, 'utf8');
  console.log('Charts updated successfully in app.js');
}

updateAppCharts();
