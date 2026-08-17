const fs = require('fs');

let content = fs.readFileSync('./index.html', 'utf8');

// Replace any corrupted strings in the IDs, classes, and variable access
content = content.replace(/(id|for|list)="([^"]*)(MUNICÍPIO|Município|MUNICPIO|Municpio)([^"]*)"/g, (match, p1, p2, p3, p4) => {
    return `${p1}="${p2}municipio${p4}"`;
});

content = content.replace(/(id|for)="([^"]*)(COMPETÊNCIA|Competência|COMPETNCIA|Competncia)([^"]*)"/g, (match, p1, p2, p3, p4) => {
    return `${p1}="${p2}competencia${p4}"`;
});

content = content.replace(/(id|for)="([^"]*)(LOCALIZAÇÃO|Localização|LOCALIZAO|Localizao)([^"]*)"/g, (match, p1, p2, p3, p4) => {
    return `${p1}="${p2}localizacao${p4}"`;
});

// Also fix p.MUNICÍPIO inside the JS embedded in HTML
content = content.replace(/p\.(MUNICÍPIO|Município|MUNICPIO|Municpio)/g, 'p.municipio');

// Also fix any hardcoded id strings in getElementById
content = content.replace(/getElementById\('([^']*)(MUNICÍPIO|Município|MUNICPIO|Municpio)([^']*)'\)/g, (match, p1, p2, p3) => {
    return `getElementById('${p1}municipio${p3}')`;
});

fs.writeFileSync('./index.html', content, 'utf8');
console.log('Fixed IDs!');
