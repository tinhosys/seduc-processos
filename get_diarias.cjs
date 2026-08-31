const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
const content = fs.readFileSync(file, 'utf8');
const start = content.indexOf('window.carregarDiariasData =');
const end = content.indexOf('window.popularSelectsDiarias =');
console.log(content.substring(start, end));
