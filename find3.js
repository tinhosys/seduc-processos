const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const idx = html.lastIndexOf('</body>');
console.log(html.substring(idx - 1000, idx + 20));
