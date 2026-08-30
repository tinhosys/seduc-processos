const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<div[^>]*?id="sidebar-process-count"[^>]*?>.*?<\/div>/, `<div style="display:none;" id="sidebar-process-count"></div>`);

fs.writeFileSync(file, content);
console.log('Patched index.html sidebar again');
