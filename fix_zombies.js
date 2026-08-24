const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Using regex to fix the corrupted strings safely.
html = html.replace(/AN.LISE/g, 'AN\u00C1LISE');
html = html.replace(/An.lise Gerencial/g, 'An\u00E1lise Gerencial');
html = html.replace(/PADR.O/g, 'PADR\u00C3O');
html = html.replace(/Padr.o/g, 'Padr\u00E3o');
html = html.replace(/Relat.rio Detalhado/g, 'Relat\u00F3rio Detalhado');
html = html.replace(/PAR.METROS/g, 'PAR\u00C2METROS');
html = html.replace(/PRINT LAYOUT: PADR.O/g, 'PRINT LAYOUT: PADR\u00C3O');
html = html.replace(/PRINT LAYOUT: AN.LISE/g, 'PRINT LAYOUT: AN\u00C1LISE');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed zombie characters');
