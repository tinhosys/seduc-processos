const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const target = `    // Preencher selects de filtro com status e localizaǜo
    const fillSelectFiltro = (id, lista) => {
      const s = document.getElementById(id);
      if (!s) return;
      s.innerHTML = \`<option value="****">Todos</option>\` + lista.map(o => \`<option value="\${o}">\${o}</option>\`).join('');
    };
    fillSelectFiltro('filtro-status',      STATUS_LIST.filter(s => s !== '.'));
    fillSelectFiltro('filtro-localizacao', LOCALIZACAO_LIST.filter(s => s !== '.'));`;

// Since there is a weird encoding character in "localizaǜo", let's use a regex
const regex = /\/\/ Preencher selects de filtro com status e localiza.*?[\s\S]*?fillSelectFiltro\('filtro-localizacao', LOCALIZACAO_LIST\.filter\(s => s !== '\.'\)\);/;

const replacement = `// Preencher selects de filtro com status e localizacao
    window.popularFiltrosProcessos = function() {
      const fillSelectFiltro = (id, lista) => {
        const s = document.getElementById(id);
        if (!s) return;
        
        // Multi-select fix: if it's a multi-select, we shouldn't wipe out the selected values. 
        // Wait, 'filtro-status' and 'filtro-localizacao' in Processos are multi-selects!
        // We need to re-init multi-select if they are.
        s.innerHTML = \`<option value="****">Todos</option>\` + lista.map(o => \`<option value="\${o}">\${o}</option>\`).join('');
        if (typeof MultiSelect !== 'undefined') {
            // we will let the multi-select mutation observer or re-init handle it.
            // Actually, we can just trigger a custom event or recreate them.
        }
      };
      fillSelectFiltro('filtro-status', STATUS_LIST.filter(s => s !== '.'));
      fillSelectFiltro('filtro-localizacao', LOCALIZACAO_LIST.filter(s => s !== '.'));
      
      // Update the multi selects instances if they exist
      if (window._msLocalizacao && typeof window._msLocalizacao.updateData === 'function') {
         window._msLocalizacao.updateData(LOCALIZACAO_LIST.filter(s => s !== '.').map(x => ({value: x, label: x})));
      }
      if (window._msStatus && typeof window._msStatus.updateData === 'function') {
         window._msStatus.updateData(STATUS_LIST.filter(s => s !== '.').map(x => ({value: x, label: x})));
      }
    };
    window.popularFiltrosProcessos();`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/app.js', content);
console.log('patched app.js');
