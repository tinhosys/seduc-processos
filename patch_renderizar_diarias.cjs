const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

const target = "const aba = window._filtroDiariasAba || 'estadual';";
const replacement = `const aba = window._filtroDiariasAba || 'estadual';

    // Toggle display of Nota Empenho based on tab
    const notaEmpenhoEl = document.getElementById('diaria-filtro-nota');
    if (notaEmpenhoEl && notaEmpenhoEl.parentElement) {
      notaEmpenhoEl.parentElement.style.display = (aba === 'estadual') ? 'none' : 'block';
    }

    // Dynamic Options Update for Status based on active tab
    const statusEl = document.getElementById('diaria-filtro-status');
    if (statusEl) {
       const oldVal = statusEl.value;
       const filteredByTab = DIARIAS_DATA.filter(d => (aba === 'estadual' ? d.origem === 'estadual' : d.origem === 'federal'));
       const uniqueStatuses = [...new Set(filteredByTab.map(d => d.status))].filter(x => x).sort();
       statusEl.innerHTML = '<option value="Todos">Todos</option>' + uniqueStatuses.map(a => \`<option value="\${a}">\${a}</option>\`).join('');
       if(uniqueStatuses.includes(oldVal)) statusEl.value = oldVal;
    }
`;

content = content.replace(target, replacement);
fs.writeFileSync('js/diarias.js', content);
console.log('patched renderizarDiarias to dynamic hide and populate');
