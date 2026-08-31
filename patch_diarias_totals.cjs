const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

content = content.replace("document.getElementById('diarias-total-filtrado')", "document.getElementById('diaria-total-pago')");
content = content.replace("document.getElementById('diarias-total-filtrado')", "document.getElementById('diaria-total-pago')");
content = content.replace("document.getElementById('diarias-count')", "document.getElementById('diaria-qtd-listadas')");
content = content.replace("document.getElementById('diarias-count')", "document.getElementById('diaria-qtd-listadas')");

fs.writeFileSync('js/diarias.js', content);
console.log("IDs replaced.");
