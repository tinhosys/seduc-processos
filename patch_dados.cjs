const fs = require('fs');
let content = fs.readFileSync('js/dados.js', 'utf8');

// Fix the filter to exclude anything that starts with "parametro" to be safe
content = content.replace(
    /window\.processosCache = data\.rows\.filter\(r => r\._tabName && r\._tabName\.toLowerCase\(\) !== 'parametro_combo' && r\._tabName\.toLowerCase\(\) !== 'parametros'\)\.map\(mapToApp\);/,
    `window.processosCache = data.rows.filter(r => r._tabName && !r._tabName.toLowerCase().includes('parametro')).map(mapToApp);`
);

// Add the trigger to update UI dropdowns
const updateHook = `
      STATUS_LIST.sort((a,b) => a.localeCompare(b));
      LOCALIZACAO_LIST.sort((a,b) => a.localeCompare(b));

      if (typeof window.popularFiltrosProcessos === 'function') {
         window.popularFiltrosProcessos();
      }
`;
content = content.replace(
    /STATUS_LIST\.sort\(\(a,b\) => a\.localeCompare\(b\)\);\s+LOCALIZACAO_LIST\.sort\(\(a,b\) => a\.localeCompare\(b\)\);/,
    updateHook
);

fs.writeFileSync('js/dados.js', content);
console.log('patched dados.js');
