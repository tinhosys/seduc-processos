const fs = require('fs');
let js = fs.readFileSync('js/auth-sap.js', 'utf8');
js = js.replace(/getSessaoLocal\(\)\?\.token/g, 'sessionStorage.getItem("sap_session_token") || localStorage.getItem("sap_session_token")');
fs.writeFileSync('js/auth-sap.js', js);
console.log('patched getSessaoLocal');
