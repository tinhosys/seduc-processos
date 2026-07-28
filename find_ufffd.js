const fs = require('fs');
const files = ['index.html', 'js/app.js', 'js/dados.js', 'js/mapa.js', 'js/escolas.js'];
const c = '\uFFFD';

files.forEach(f => {
    if (fs.existsSync(f)) {
        let text = fs.readFileSync(f, 'utf8');
        let regex = new RegExp(`.{0,15}${c}.{0,15}`, 'g');
        let matches = text.match(regex);
        if (matches) {
            let unique = [...new Set(matches)];
            console.log(`\nMatches in ${f}:`);
            unique.forEach(m => console.log(`- ${m}`));
        }
    }
});
