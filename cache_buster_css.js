const fs = require('fs');
const indexPaths = [
  'c:/Users/Elton/SEDUC/planilha-google-form/public/index.html',
  'c:/Users/Elton/SEDUC/index.html'
];

indexPaths.forEach(indexPath => {
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    // Bump style.css cache buster
    if (html.includes('css/style.css?v=')) {
      html = html.replace(/css\/style\.css\?v=\d+/g, `css/style.css?v=${Date.now()}`);
    } else {
      html = html.replace('css/style.css', `css/style.css?v=${Date.now()}`);
    }
    // Also bump app.js cache buster again just in case
    html = html.replace(/js\/app\.js\?v=\d+/g, `js/app.js?v=${Date.now()}`);
    fs.writeFileSync(indexPath, html, 'utf8');
  }
});

console.log('Cache busters updated');
