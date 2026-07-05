const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');

// Remove double PDF buttons
const regex = /<button class="btn btn-ghost btn-sm action-editor" onclick="abrirModalPdf\(\)"[\s\S]*?PDF\s*<\/button>/;
index = index.replace(regex, ''); // Remove the first one (the one with action-editor)

fs.writeFileSync('index.html', index, 'utf8');
console.log('Fixed double PDF button');
