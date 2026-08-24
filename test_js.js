const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('js/orcamento.js', 'utf8');
if (js.includes('window.toggleCRM = function(grupo)')) {
  console.log('window.toggleCRM is defined');
} else {
  console.log('window.toggleCRM is MISSING!');
}

const match = js.match(/<div onclick="toggleCRM\('\\$\\{grupo\\}'\)"[^>]*>/);
if (match) {
  console.log('Found onclick header:', match[0]);
} else {
  console.log('onclick header NOT FOUND in js');
}
