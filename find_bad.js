const fs = require('fs');
const files = ['index.html', 'js/app.js'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    let idx = content.indexOf('\uFFFD');
    while (idx !== -1) {
      console.log(`${file}: ...${content.substring(Math.max(0, idx - 15), Math.min(content.length, idx + 15))}...`);
      idx = content.indexOf('\uFFFD', idx + 1);
    }
  }
});
