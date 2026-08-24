const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((line, i) => {
  if (line.includes('??')) {
    console.log(`Question marks at line ${i+1}: ${line.trim()}`);
  }
});
