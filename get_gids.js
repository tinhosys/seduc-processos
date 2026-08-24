const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/12w-tBU6lMlKR7mncvbfoKjKGcvCZftd12CFKxdtf7ac/edit', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const matches = [...data.matchAll(/\["([^"]+)",(\d+),/g)]; // usually ["Sheet Name", GID, ...
        console.log(matches.map(m => m[1] + ' -> ' + m[2]).join('\n'));
        const matches2 = [...data.matchAll(/\[(\d+),"([^"]+)"/g)];
        console.log(matches2.map(m => m[1] + ' -> ' + m[2]).join('\n'));
    });
});
