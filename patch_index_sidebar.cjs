const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// The line is: <div style="font-size:10px; color:#3b82f6; font-weight:bold; margin-top:2px;" id="sidebar-process-count">330 processos</div>
// Let's add display:none;
content = content.replace(/<div style="font-size:10px; color:#3b82f6; font-weight:bold; margin-top:2px;" id="sidebar-process-count">330 processos<\/div>/, `<div style="display:none;" id="sidebar-process-count">330 processos</div>`);

fs.writeFileSync(file, content);
console.log('Patched index.html sidebar');
