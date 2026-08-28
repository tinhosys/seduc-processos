const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /<br><span style="color:#64748b; font-weight:normal; font-size:10px;">Proc: \\\$\\{d\.processo\\}<\/span>/g;
content = content.replace(regex, '');

fs.writeFileSync(file, content);
console.log('Removed processos from name column');
