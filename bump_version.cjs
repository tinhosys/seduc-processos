const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// Find current version
const match = content.match(/GBZ - v1\.1\.(\d+)/);
if (match) {
  const currentSub = parseInt(match[1], 10);
  const nextSub = currentSub + 1;
  const currentVer = `v1.1.${currentSub}`;
  const nextVer = `v1.1.${nextSub}`;
  
  // Replace version string
  const regexVer = new RegExp(`GBZ - ${currentVer.replace(/\./g, '\\.')}`, 'g');
  content = content.replace(regexVer, `GBZ - ${nextVer}`);
  
  // Cache bust JS files
  const ts = Date.now();
  content = content.replace(/(\.js\?v=)\d+/g, `$1${ts}`);
  
  fs.writeFileSync(file, content);
  console.log(`Version successfully bumped from ${currentVer} to ${nextVer}`);
} else {
  console.log('Version string not found!');
}
