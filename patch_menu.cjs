const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /<a href="#" class="nav-item sub-item" data-page="acessos"/;
const replacement = '<a href="#" class="nav-item sub-item action-adm" data-page="acessos"';

content = content.replace(regex, replacement);
fs.writeFileSync('index.html', content);
console.log('patched menu');
