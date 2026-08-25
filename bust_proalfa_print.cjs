const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const ts = Date.now();
html = html.replace(/src="js\/print-proalfa\.js(\?v=[^"]+)?"/g, 'src="js/print-proalfa.js?v=' + ts + '"');
html = html.replace(/GBZ - v[\d.]+/g, 'GBZ - v1.1.16');
fs.writeFileSync('index.html', html, 'utf8');
console.log('OK ts=' + ts + ' -> v1.1.16');
