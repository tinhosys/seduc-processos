const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

const regex = /<span style="color: \$\{([^}]+)\};" title="([^"]+)">&#9679;<\/span>/g;
appJs = appJs.replace(regex, '<span style="color: ${$1};" title="$2">${$1 ? \'&#9679;\' : \'&#9675;\'}</span>');

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('Fixed dots');
