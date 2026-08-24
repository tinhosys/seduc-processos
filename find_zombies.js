const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
let found = false;
lines.forEach((line, i) => {
  if (line.includes('')) {
    console.log(`Zombie found at line ${i+1}: ${line.trim()}`);
    found = true;
  }
});
if (!found) console.log('No zombies found');
