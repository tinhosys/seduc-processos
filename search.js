const fs = require('fs');
const path = require('path');

const filesToFix = ['js/app.js', 'js/dados.js', 'index.html', 'js/escolas.js', 'js/mapa.js'];
for (const file of filesToFix) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Let's print out lines containing "Localiza", "Munic", "A€", "AÃ§Ãµes", "Excluir", etc.
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('LocalizaÃ§Ã£o') || line.includes('MunicÃpio') || line.includes('A€') || line.includes('AÃ§Ãµes') || line.includes('Excluir') || line.includes('3Âº')) {
                console.log(`[${file}:${i+1}] ${line.trim()}`);
            }
        });
    }
}
