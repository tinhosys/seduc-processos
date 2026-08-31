const { execSync } = require('child_process');
const content = execSync('"C:\\Users\\ADM\\AppData\\Local\\GitHubDesktop\\app-3.6.4\\resources\\app\\git\\cmd\\git.exe" show HEAD~1:js/diarias.js').toString();
console.log(content.substring(4330, 4500));
const windowProps = [];
const regex = /window\.[a-zA-Z0-9_]+/g;
let match;
while ((match = regex.exec(content)) !== null) {
  windowProps.push(match[0]);
}
console.log([...new Set(windowProps)]);
