const fs = require('fs');
eval(fs.readFileSync('js/open-location-code.js', 'utf8'));

const olc = new OpenLocationCode();
console.log('Short code test:', olc.isShort('53X7+22'));
console.log('Full code test:', olc.recoverNearest('53X7+22', -10.8828, -61.9519));
