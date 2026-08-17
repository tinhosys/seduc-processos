const fs = require('fs');
const file = 'C:/Users/ADM/.gemini/antigravity/scratch/seduc-processos/js/app.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ ==========================================\n\/\/ ABA: TODAS ESCOLAS \(Gviz API\)[\s\S]*?(?=\/\/ ==========================================|\n\n$)/;
const newContent = content.replace(regex, '');

if (newContent !== content) {
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Removed legacy todas escolas from app.js');
} else {
  console.log('Legacy block not found in app.js');
}
