const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<a href="#" class="nav-item sub-item" data-page="contatos" onclick="navegar\('contatos'\)".*?<\/a>/);
console.log(match ? match[0] : 'Not found');
