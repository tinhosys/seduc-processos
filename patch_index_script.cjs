const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /function mudarAbaDiarias\(aba, el\) \{[\s\S]*?\}\n<\/script>/;
const newScript = `function mudarAbaDiarias(aba, el) {
  document.querySelectorAll('#page-diarias .tabs .tab-link').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  
  const gerar = document.getElementById('diarias-tab-gerar');
  const lista = document.getElementById('diarias-tab-lista');
  
  if (gerar) gerar.style.display = aba === 'gerar' ? 'block' : 'none';
  if (lista) lista.style.display = aba !== 'gerar' ? 'block' : 'none';
  
  window._filtroDiariasAba = aba;
  if(typeof renderizarDiarias === 'function') renderizarDiarias();
}
</script>`;

content = content.replace(regex, newScript);
fs.writeFileSync(file, content);
console.log('Script patched');
