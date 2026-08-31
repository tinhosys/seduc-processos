const fs = require('fs');
const content = fs.readFileSync('orig_diarias.js', 'utf8');
const regex = /(window\.\w+\s*=\s*function|function\s+\w+)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[0], 'at', match.index);
}
