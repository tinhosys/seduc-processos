const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'escolas.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08/g, '1V28gIVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08');

fs.writeFileSync(file, content);
console.log('Fixed SHEET_ID');
