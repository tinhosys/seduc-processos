const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsDir = path.join(__dirname, 'js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
let hasError = false;

for (const f of files) {
  const full = path.join(jsDir, f);
  try {
    execSync(`"${process.execPath}" -c "${full}"`);
    console.log(`OK: ${f}`);
  } catch (err) {
    console.error(`ERRO no arquivo ${f}:`, err.message);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('Todos os arquivos JS estão com sintaxe 100% válida!');
}
