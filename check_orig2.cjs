const { execSync } = require('child_process');
const content = execSync('"C:\\Users\\ADM\\AppData\\Local\\GitHubDesktop\\app-3.6.4\\resources\\app\\git\\cmd\\git.exe" show HEAD~1:js/diarias.js').toString();
const p1 = content.indexOf('function renderizarDiarias');
const p2 = content.indexOf('window.limparFiltrosDiarias');
console.log('renderizarDiarias at:', p1);
console.log('limparFiltrosDiarias at:', p2);
