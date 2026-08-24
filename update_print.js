const fs = require('fs');
let js = fs.readFileSync('js/print-proalfa.js', 'utf8');

const logoHtml = `<div style="text-align:center; margin-bottom:15px;"><img src="img/logos_proalfa.png" style="max-height: 60px;" /></div>`;

js = js.replace(/<div class="header-title">/g, logoHtml + '\n    <div class="header-title">');

fs.writeFileSync('js/print-proalfa.js', js, 'utf8');
console.log('Added logos to print-proalfa.js');
