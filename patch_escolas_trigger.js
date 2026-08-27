const fs = require('fs');
let js = fs.readFileSync('js/escolas.js', 'utf8');

const injection = `
  // Trigger update for other pages that depend on _escolasCache
  if (typeof renderContatos === 'function') {
    try { renderContatos(); } catch(e){}
  }
`;

js = js.replace(/if \(pagination\) pagination\.style\.display = temDados \? '' : 'none';\s*if \(emptyEl\) emptyEl\.style\.display      = temDados \? 'none' : 'block';/, "if (pagination) pagination.style.display = temDados ? '' : 'none';\n  if (emptyEl) emptyEl.style.display      = temDados ? 'none' : 'block';\n" + injection);

fs.writeFileSync('js/escolas.js', js, 'utf8');
console.log('Injected renderContatos trigger in escolas.js');
