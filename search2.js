const fs = require('fs');
const path = require('path');

const filesToFix = ['js/app.js', 'js/dados.js', 'index.html', 'js/escolas.js', 'js/mapa.js'];
for (const file of filesToFix) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('Exibindo')) {
                console.log(`[${file}:${i+1}] ${line.trim()}`);
            }
        });
    }
}
