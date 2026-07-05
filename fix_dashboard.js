const fs = require('fs');

function fixDashboard() {
  const htmlPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/index.html';
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace the "Lançamentos Recentes" card with a chart card for Prefixo
  const tableCardRegex = /<div class="card">\s*<div class="section-header" style="margin-bottom:16px">[\s\S]*?<h2 style="font-size:15px">Lançamentos Recentes<\/h2>[\s\S]*?<\/div>[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/;
  
  const newChartCard = `<div class="card">
            <div class="section-header" style="margin-bottom:16px">
              <div>
                <h2 style="font-size:15px">📊 Processos por Prefixo</h2>
                <p>Distribuição baseada no prefixo do processo</p>
              </div>
            </div>
            <div style="position: relative; height: 300px; width: 100%;">
              <canvas id="chart-prefixo"></canvas>
            </div>
          </div>`;

  if (html.match(tableCardRegex)) {
    html = html.replace(tableCardRegex, newChartCard);
    fs.writeFileSync(htmlPath, html, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/index.html', html, 'utf8'); // update copy
    console.log("Updated HTML");
  } else {
    console.log("Could not find table card in HTML");
  }

  const jsPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let js = fs.readFileSync(jsPath, 'utf8');

  // Replace tabela recentes JS logic with chart prefixo logic
  const tableJsRegex = /\/\/ Tabela recentes[\s\S]*?\/\/ Localização/i;
  
  const newChartJs = `// Gráfico: Prefixo
    const prefixoCounts = {};
    processos.forEach(p => {
      let pr = 'Outros';
      if (p.numero && p.numero.includes('.')) {
        pr = p.numero.split('.')[0];
      }
      prefixoCounts[pr] = (prefixoCounts[pr] || 0) + 1;
    });
    
    const prefixoLabels = Object.keys(prefixoCounts).sort((a,b) => prefixoCounts[b] - prefixoCounts[a]).slice(0, 10);
    const prefixoValues = prefixoLabels.map(k => prefixoCounts[k]);
    
    const colorsPrefixo = [
      '#6366f1','#ec4899','#14b8a6','#8b5cf6','#f97316',
      '#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'
    ];
    
    const ctxPrefixo = document.getElementById('chart-prefixo');
    if (ctxPrefixo) {
      if (window.chartPrefixoInstance) window.chartPrefixoInstance.destroy();
      window.chartPrefixoInstance = new Chart(ctxPrefixo.getContext('2d'), {
        type: 'bar',
        data: {
          labels: prefixoLabels,
          datasets: [{ 
            label: 'Processos',
            data: prefixoValues, 
            backgroundColor: colorsPrefixo, 
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#1f2937' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    // Localização`;

  if (js.match(tableJsRegex)) {
    js = js.replace(tableJsRegex, newChartJs);
    fs.writeFileSync(jsPath, js, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', js, 'utf8'); // update copy
    console.log("Updated JS");
  } else {
    console.log("Could not find table JS in app.js");
  }
}

fixDashboard();
