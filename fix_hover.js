const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/onmouseover="this\.style\.background='rgba\(255,255,255,0\.1\)'"/g, 'onmouseover="this.style.background=\'#334155\'"');
html = html.replace(/onmouseout="this\.style\.background='rgba\(255,255,255,0\.05\)'"/g, 'onmouseout="this.style.background=\'#475569\'"');

html = html.replace(/onmouseover="this\.style\.background='rgba\(16, 185, 129, 0\.3\)'"/g, 'onmouseover="this.style.background=\'#059669\'"');
html = html.replace(/onmouseout="this\.style\.background='rgba\(16, 185, 129, 0\.15\)'"/g, 'onmouseout="this.style.background=\'#10b981\'"');

html = html.replace(/onmouseover="this\.style\.background='rgba\(250, 204, 21, 0\.3\)'"/g, 'onmouseover="this.style.background=\'#d97706\'"');
html = html.replace(/onmouseout="this\.style\.background='rgba\(250, 204, 21, 0\.15\)'"/g, 'onmouseout="this.style.background=\'#f59e0b\'"');

// And remove border from Ocultar filtros to match others
html = html.replace(/border:1px solid rgba\(255,255,255,0\.2\); /g, 'border:none; ');

fs.writeFileSync('index.html', html, 'utf8');
