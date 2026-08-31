const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const target = '<div id="diarias-tab-gerar" class="diarias-content-tab" style="display:none; margin-bottom:20px;">';
if (content.includes(target)) {
  const inject = `
    <!-- ABA CONSOLIDADO -->
    <div id="diarias-tab-consolidado" style="display:none;"></div>
  `;
  const replaced = content.replace(target, inject + '\n' + target);
  fs.writeFileSync('index.html', replaced);
  console.log('Injected diarias-tab-consolidado!');
} else {
  console.log('Target not found!');
}
