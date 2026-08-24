const fs = require('fs');
let js = fs.readFileSync('js/proalfa.js', 'utf8');

const newRenderCode = `
  if(dados.length > 0) {
    const topContainer = document.getElementById('proalfa-totals-top');
    if (topContainer) {
      let topHtml = \`<div style="color:#10b981; font-weight:bold; font-size:12px; display:flex; align-items:center; margin-right:10px;">TOTAIS DA BUSCA:</div>\`;
      
      const statStyle = 'display:flex; flex-direction:column; align-items:center; min-width:60px;';
      const labelStyle = 'font-size:10px; color:var(--text-muted); text-transform:uppercase;';
      const valStyle = 'font-size:14px; font-weight:bold; color:#fff;';
      const valGreen = 'font-size:14px; font-weight:bold; color:#10b981;';
      
      if (isDoc) {
         topHtml += \`<div style="\${statStyle}"><span style="\${labelStyle}">DOCENTES</span><span style="\${valStyle}">\${sumDocentes.toLocaleString('pt-BR')}</span></div>\`;
      }
      
      topHtml += \`
        <div style="\${statStyle}"><span style="\${labelStyle}">E.F</span><span style="\${valStyle}">\${sumEF.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">A.I</span><span style="\${valGreen}">\${sumAI.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">1º</span><span style="\${valStyle}">\${sum1.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">2º</span><span style="\${valStyle}">\${sum2.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">3º</span><span style="\${valStyle}">\${sum3.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">4º</span><span style="\${valStyle}">\${sum4.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">5º</span><span style="\${valStyle}">\${sum5.toLocaleString('pt-BR')}</span></div>
      \`;
      topContainer.innerHTML = topHtml;
      topContainer.style.display = 'flex';
    }
    tfoot.innerHTML = '';
  } else {
    tfoot.innerHTML = '';
    const topContainer = document.getElementById('proalfa-totals-top');
    if (topContainer) topContainer.style.display = 'none';
  }
}
`;

js = js.replace(/if\(dados\.length > 0\) {[\s\S]*?tfoot\.innerHTML = '';\n  }\n}/, newRenderCode);

fs.writeFileSync('js/proalfa.js', js, 'utf8');
console.log('js/proalfa.js updated successfully');
