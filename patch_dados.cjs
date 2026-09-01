const fs = require('fs');
let content = fs.readFileSync('js/dados.js', 'utf8');

// Filter out parametro_combo tab
content = content.replace(
  'window.processosCache = data.rows.map(mapToApp);',
  `window.processosCache = data.rows.filter(r => r._tabName && r._tabName.toLowerCase() !== 'parametro_combo' && r._tabName.toLowerCase() !== 'parametros').map(mapToApp);`
);

fs.writeFileSync('js/dados.js', content);
console.log('patched processosCache filtering');
