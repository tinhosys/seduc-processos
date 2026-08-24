const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

appJs = appJs.replace(/\$\{p\.([A-Z]+) === '1' \? '#10b981' : '#ef4444' \? '&#9679;' : '&#9675;'\}/g, "${p.$1 === '1' ? '&#9679;' : '&#9675;'}");

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('Fixed dots part 2');
