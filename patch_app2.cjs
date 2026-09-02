const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const replacement = `// Preencher selects de filtro com status e localizacao
    window.popularFiltrosProcessos = function() {
      const fillSelectFiltro = (id, lista) => {
        const s = document.getElementById(id);
        if (!s) return;
        
        s.innerHTML = \`<option value="****">Todos</option>\` + lista.map(o => \`<option value="\${o}">\${o}</option>\`).join('');
        
        if (typeof window.initMultiSelect === 'function' && s.multiple) {
           window.initMultiSelect(id);
        }
      };
      fillSelectFiltro('filtro-status', STATUS_LIST.filter(s => s !== '.'));
      fillSelectFiltro('filtro-localizacao', LOCALIZACAO_LIST.filter(s => s !== '.'));
    };
    window.popularFiltrosProcessos();`;

content = content.replace(/\/\/ Preencher selects de filtro com status e localizacao[\s\S]*?window\.popularFiltrosProcessos\(\);/, replacement);
fs.writeFileSync('js/app.js', content);
console.log('Patched MultiSelect refresh correctly in app.js');
