const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix width for LOCALIZAÇÃO column in Processos table
html = html.replace(/<th data-sort="localizacao" style="width: 90px; text-align: center;">Localiza..o<\/th>/, '<th data-sort="localizacao" style="width: 110px; text-align: center;">LOCALIZAÇÃO</th>');

// 2. Adjust solid colors for the 3 buttons:
// OCULTAR FILTROS: Solid blue-slate
html = html.replace(/background:rgba\(255,255,255,0\.05\); color:var\(--text-primary\);/g, 'background:#475569; color:white;');
html = html.replace(/onmouseover="this\.style\.background='rgba\\(255,255,255,0\.1\\)'"/g, 'onmouseover="this.style.background=\'#334155\'"');
html = html.replace(/onmouseout="this\.style\.background='rgba\\(255,255,255,0\.05\\)'"/g, 'onmouseout="this.style.background=\'#475569\'"');

// PLANILHA: Solid emerald
html = html.replace(/background:rgba\(16, 185, 129, 0\.15\); border:1px solid rgba\(16, 185, 129, 0\.5\); color:#10b981;/g, 'background:#10b981; border:none; color:white;');
html = html.replace(/onmouseover="this\.style\.background='rgba\\(16, 185, 129, 0\.3\\)'"/g, 'onmouseover="this.style.background=\'#059669\'"');
html = html.replace(/onmouseout="this\.style\.background='rgba\\(16, 185, 129, 0\.15\\)'"/g, 'onmouseout="this.style.background=\'#10b981\'"');

// LIMPAR PARÂMETROS: Solid amber
html = html.replace(/background:rgba\(250, 204, 21, 0\.15\); color:#facc15; border:1px solid #facc15;/g, 'background:#f59e0b; border:none; color:white;');
html = html.replace(/onmouseover="this\.style\.background='rgba\\(250, 204, 21, 0\.3\\)'"/g, 'onmouseover="this.style.background=\'#d97706\'"');
html = html.replace(/onmouseout="this\.style\.background='rgba\\(250, 204, 21, 0\.15\\)'"/g, 'onmouseout="this.style.background=\'#f59e0b\'"');


// Version bump
html = html.replace(/v1\.0\.95/g, 'v1.0.96');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed index.html');
