const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<table id="table-proalfa">', '<table id="table-proalfa" style="table-layout:fixed; width:100%; min-width:1100px; border-collapse:separate; border-spacing:0; font-size:13px;">');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed table style');
