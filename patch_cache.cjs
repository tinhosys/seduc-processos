const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const v = Date.now();
content = content.replace(/<script src="js\/diarias\.js(?:[^"]*)"><\/script>/g, `<script src="js/diarias.js?v=${v}"></script>`);
content = content.replace(/<script src="js\/orcamento\.js(?:[^"]*)"><\/script>/g, `<script src="js/orcamento.js?v=${v}"></script>`);
content = content.replace(/<script src="js\/proalfa\.js(?:[^"]*)"><\/script>/g, `<script src="js/proalfa.js?v=${v}"></script>`);
content = content.replace(/<script src="js\/app\.js(?:[^"]*)"><\/script>/g, `<script src="js/app.js?v=${v}"></script>`);

fs.writeFileSync(file, content);
console.log('Cache busting applied.');
