const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<span id="sidebar-total-count" style="color:var\(--blue\);font-weight:600"><\/span>/, `<span id="sidebar-total-count" style="display:none; color:var(--blue);font-weight:600"></span>`);

fs.writeFileSync(file, content);
console.log('Patched index.html sidebar again 3');
