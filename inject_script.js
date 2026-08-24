const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Inject the script tag for print-proalfa.js
if (!html.includes('print-proalfa.js')) {
    html = html.replace('<script src="js/proalfa.js"></script>', '<script src="js/print-proalfa.js"></script>\n  <script src="js/proalfa.js"></script>');
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Injected print-proalfa.js script tag');
}
