const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regexProcessos = /(<!-- Menu Processos -->\s*<div class="nav-group">[\s\S]*?<\/div>\s*<\/div>\s*)/;
const matchProcessos = content.match(regexProcessos);

if (matchProcessos) {
    const processosBlock = matchProcessos[0];
    
    // Remove the original Processos block
    content = content.replace(regexProcessos, '');
    
    // Find the insertion point: right before <!-- Menu CAM -->
    const insertPoint = '<!-- Menu CAM -->';
    
    content = content.replace(insertPoint, processosBlock + '\n            ' + insertPoint);
    
    fs.writeFileSync('index.html', content);
    console.log('Moved Processos menu successfully');
} else {
    console.log('Could not find Processos menu block');
}
