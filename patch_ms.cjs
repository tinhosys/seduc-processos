const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const replacement = `// Preencher selects de filtro com status e localizacao
    window.popularFiltrosProcessos = function() {
      const fillSelectFiltro = (id, lista) => {
        const s = document.getElementById(id);
        if (!s) return;
        
        const oldVal = s.value;
        s.innerHTML = \`<option value="****">Todos</option>\` + lista.map(o => \`<option value="\${o}">\${o}</option>\`).join('');
        
        // Re-read options for MultiSelect if instantiated
        if (id === 'filtro-status' && window._msStatus) {
           window._msStatus.options = Array.from(s.options);
           window._msStatus.buildOptions();
           window._msStatus.updateButtonText();
        }
        if (id === 'filtro-localizacao' && window._msLocalizacao) {
           window._msLocalizacao.options = Array.from(s.options);
           window._msLocalizacao.buildOptions();
           window._msLocalizacao.updateButtonText();
        }
      };
      fillSelectFiltro('filtro-status', STATUS_LIST.filter(s => s !== '.'));
      fillSelectFiltro('filtro-localizacao', LOCALIZACAO_LIST.filter(s => s !== '.'));
    };
    window.popularFiltrosProcessos();`;

content = content.replace(/\/\/ Preencher selects de filtro com status e localizacao[\s\S]*?window\.popularFiltrosProcessos\(\);/, replacement);
fs.writeFileSync('js/app.js', content);
console.log('Patched multi-select refresh in app.js');
