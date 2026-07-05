const fs = require('fs');
const indexPaths = [
  'c:/Users/Elton/SEDUC/planilha-google-form/public/index.html',
  'c:/Users/Elton/SEDUC/index.html'
];

indexPaths.forEach(indexPath => {
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.replace(/js\/app\.js\?v=\d+/g, `js/app.js?v=${Date.now()}`);
    fs.writeFileSync(indexPath, html, 'utf8');
  }
});

console.log('Cache buster updated');
