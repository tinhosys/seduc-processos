const fs = require('fs');
const files = ['js/app.js', 'js/dados.js', 'index.html'];

files.forEach(f => {
    let text = fs.readFileSync(f, 'utf8');
    
    let regex = /Localiza.{1,5}o|Munic.{1,5}pio|N.{1,3} Processo|A.{1,5}es|Exibindo.*processos|3.{1,3}/gi;
    let matches = text.match(regex);
    if (matches) {
        let unique = [...new Set(matches)];
        console.log(`\nMatches in ${f}:`);
        unique.forEach(m => console.log(`- ${m} (Hex: ${Buffer.from(m, 'utf8').toString('hex')})`));
    }
});
