const fs = require('fs');
let js = fs.readFileSync('js/proalfa.js', 'utf8');

js = js.replace(/<th style="width:(.*?);(.*?)">(.*?)<\/th>/g, '<th style="width:$1; border-bottom:1px solid rgba(255,255,255,0.1); padding:10px; background:var(--bg-secondary); color:#9ca3af; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px; text-align:left; $2">$3</th>');
js = js.replace(/<td(.*?)>/g, '<td$1 style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0; font-size:12px;">');
// Fix the style override issue
js = js.replace(/style="padding:10px; border-bottom:1px solid rgba\(255,255,255,0\.05\); color:#e2e8f0; font-size:12px;" style="(.*?)"/g, 'style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0; font-size:12px; $1"');

fs.writeFileSync('js/proalfa.js', js, 'utf8');
console.log('Fixed table cell styles');
