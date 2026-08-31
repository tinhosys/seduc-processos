const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

// Replace the fill logic for Status to ignore PARAM_STATUS
content = content.replace(
    /fill\('diaria-filtro-status', PARAM_STATUS\.length > 0 \? PARAM_STATUS : \[\.\.\.new Set\(DIARIAS_DATA\.map\(d => d\.status\)\)\]\.filter\(x => x\)\);/,
    "fill('diaria-filtro-status', [...new Set(DIARIAS_DATA.map(d => d.status))].filter(x => x).sort());"
);

// Do the same for Setores just in case, though they didn't mention it. Actually, I'll just change Status.
fs.writeFileSync('js/diarias.js', content);
console.log('Status dropdown dynamic link patched');
