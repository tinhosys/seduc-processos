const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const p = content.indexOf('diarias-tab-consolidado"');
if(p !== -1) console.log(content.substring(p - 100, p + 100));
else console.log("Not found!");
