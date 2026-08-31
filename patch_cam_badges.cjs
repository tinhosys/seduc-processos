const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const badgeHtml = `<span style="font-size:9px; background:rgba(234,179,8,0.2); color:#eab308; padding:2px 6px; border-radius:4px; margin-left:8px; font-weight:bold; letter-spacing:0.5px;">EM CONSTRUÇÃO</span>`;

content = content.replace(
    /<span>GDSM \(Em Construção\)<\/span>/,
    `<span style="display:flex; align-items:center;">GDSM ${badgeHtml}</span>`
);
content = content.replace(
    /<span>GMAC \(Em Construção\)<\/span>/,
    `<span style="display:flex; align-items:center;">GMAC ${badgeHtml}</span>`
);
// Handle the encoding issue just in case
content = content.replace(
    /<span>GDSM \(Em Constru[^<]+?\)<\/span>/,
    `<span style="display:flex; align-items:center;">GDSM ${badgeHtml}</span>`
);
content = content.replace(
    /<span>GMAC \(Em Constru[^<]+?\)<\/span>/,
    `<span style="display:flex; align-items:center;">GMAC ${badgeHtml}</span>`
);

fs.writeFileSync('index.html', content);
console.log('Badges applied!');
