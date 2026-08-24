const fs = require('fs');
let js = fs.readFileSync('js/proalfa.js', 'utf8');

const oldRenderTabs = `function renderProalfaTabs() {
  const container = document.getElementById('proalfa-tabs');
  container.innerHTML = '';
  
  TAB_CONFIG.forEach(tab => {
    const rows = proalfaData[tab.id] || [];
    let sum = 0;
    const isDoc = tab.type === 'docentes';
    const sumIdx = isDoc ? 10 : 9; 
    rows.forEach(r => {
      const v = Number(r[sumIdx]);
      if(!isNaN(v)) sum += v;
    });

    const btn = document.createElement('button');
    btn.className = 'tab-btn proalfa-tab-btn';
    btn.dataset.tab = tab.id;
    btn.style.padding = '10px 20px';
    btn.style.border = '1px solid var(--border-color)';
    btn.style.borderRadius = '8px';
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    btn.innerHTML = \`\${tab.title} <br><span style="font-size:16px; color:#10b981;">\${sum.toLocaleString('pt-BR')}</span>\`;
    
    btn.onclick = () => selecionarTabProalfa(tab.id);
    container.appendChild(btn);
  });
}`;

const newRenderTabs = `function renderProalfaTabs() {
  const container = document.getElementById('proalfa-tabs');
  container.innerHTML = '';
  container.style.flexDirection = 'column';
  
  const row1 = document.createElement('div');
  row1.style.display = 'flex';
  row1.style.gap = '10px';
  row1.style.flex = '1';
  
  const row2 = document.createElement('div');
  row2.style.display = 'flex';
  row2.style.gap = '10px';
  row2.style.flex = '1';

  TAB_CONFIG.forEach((tab, idx) => {
    const rows = proalfaData[tab.id] || [];
    let sum = 0;
    const isDoc = tab.type === 'docentes';
    const sumIdx = isDoc ? 10 : 9; 
    rows.forEach(r => {
      const v = Number(r[sumIdx]);
      if(!isNaN(v)) sum += v;
    });

    const btn = document.createElement('button');
    btn.className = 'tab-btn proalfa-tab-btn';
    btn.dataset.tab = tab.id;
    btn.style.padding = '8px 10px';
    btn.style.border = '1px solid var(--border-color)';
    btn.style.borderRadius = '8px';
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    btn.style.flex = '1';
    btn.innerHTML = \`\${tab.title} <br><span style="font-size:16px; color:#10b981;">\${sum.toLocaleString('pt-BR')}</span>\`;
    
    btn.onclick = () => selecionarTabProalfa(tab.id);
    
    if (idx < 2) row1.appendChild(btn);
    else row2.appendChild(btn);
  });
  
  container.appendChild(row1);
  container.appendChild(row2);
}`;

js = js.replace(oldRenderTabs, newRenderTabs);

fs.writeFileSync('js/proalfa.js', js, 'utf8');
console.log('js/proalfa.js tabs updated');
