const fs = require('fs');
function fixJs(file) {
  let js = fs.readFileSync(file, 'utf8');
  js = js.replace(/   \[\.\.\.new Set\(todosProcs\.map\(p => p\.digito \|\| p\.DIGITO\)\.filter\(Boolean\)\)\]\.sort\(\)\);\r?\n?/g, '');
  fs.writeFileSync(file, js, 'utf8');
}
fixJs('js/app.js');
fixJs('js/app_github.js');
