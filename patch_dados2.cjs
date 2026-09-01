const fs = require('fs');
let content = fs.readFileSync('js/dados.js', 'utf8');

content = content.replace('const STATUS_LIST = [', 'let STATUS_LIST = [');
content = content.replace('const LOCALIZACAO_LIST = [', 'let LOCALIZACAO_LIST = [');

const target = "window.processosCache = data.rows.filter(r => r._tabName && r._tabName.toLowerCase() !== 'parametro_combo' && r._tabName.toLowerCase() !== 'parametros').map(mapToApp);";
const replacement = target + `
      
      // Update global STATUS_LIST and LOCALIZACAO_LIST dynamically, ignoring the hardcoded ones completely
      STATUS_LIST = ['.', ...new Set(window.processosCache.map(p => p.status))].filter((item, i, ar) => ar.indexOf(item) === i && item && item.trim() !== '');
      LOCALIZACAO_LIST = ['.', ...new Set(window.processosCache.map(p => p.localizacao))].filter((item, i, ar) => ar.indexOf(item) === i && item && item.trim() !== '');
      
      // Ensure 'Todos' isn't added here, but keep '.' as placeholder if needed. Or just sort them
      STATUS_LIST.sort((a,b) => a.localeCompare(b));
      LOCALIZACAO_LIST.sort((a,b) => a.localeCompare(b));
`;

content = content.replace(target, replacement);

fs.writeFileSync('js/dados.js', content);
console.log('patched dados.js lets and dynamic update');
