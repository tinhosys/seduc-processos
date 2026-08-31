const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
if(html.includes('width: 10%;')) console.log("OK!");
else console.log("NOT FOUND");
