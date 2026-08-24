const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  /<th data-sort="valorOf" style="text-align:right; width: 110px;">Valor Oficial<\/th>/g,
  '<th data-sort="valorOf" style="text-align:right; width: 130px;">Valor Oficial</th>'
);
fs.writeFileSync('index.html', html, 'utf8');

let css = fs.readFileSync('css/style.css', 'utf8');
css = css.replace(
  /\.col-valor \{([^}]+)\}/,
  '.col-valor { font-family: monospace; font-weight: 600; color: var(--green); text-align: right; white-space: nowrap !important; }'
);
fs.writeFileSync('css/style.css', css, 'utf8');

console.log('Fixed valor Oficial width and wrap');
