const fs = require('fs');
const html = fs.readFileSync('test_html.html', 'utf8');
const regex = /name:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log(match[1]);
}
