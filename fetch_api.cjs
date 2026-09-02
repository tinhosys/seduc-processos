const https = require('https');
const fs = require('fs');

const url = "https://script.google.com/macros/s/AKfycbyQ0pUe2wF0RkP7zQjR1kE-Z6Q2m3Q5Q_G52_Q/exec?action=getAcessos";

https.get(url, (res) => {
  let body = '';

  // Handle redirects
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        fs.writeFileSync('acessos_dump.json', body2);
        console.log('Done');
      });
    });
    return;
  }

  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    fs.writeFileSync('acessos_dump.json', body);
    console.log('Done');
  });
}).on('error', (e) => {
  console.error(e);
});
