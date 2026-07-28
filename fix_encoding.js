const fs = require('fs');
const files = ['index.html', 'js/app.js', 'js/dados.js', 'js/mapa.js', 'js/escolas.js', 'css/style.css'];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let str = fs.readFileSync(f, 'utf8');
        let hasLargeChar = false;
        for(let i=0; i<str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                // If it's a character we inserted in fix_chars, skip it. But we just checked out the files!
                console.log(`${f} has char > 255: ${str[i]} at ${i} (code: ${str.charCodeAt(i)})`);
                hasLargeChar = true;
                break;
            }
        }
        if (!hasLargeChar) {
            console.log(`File ${f} is fully convertable via latin1 -> utf8`);
            let fixed = Buffer.from(str, 'latin1').toString('utf8');
            fs.writeFileSync(f, fixed, 'utf8');
            console.log(`Successfully fixed ${f}`);
        }
    }
});
