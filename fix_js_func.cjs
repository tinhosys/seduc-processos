const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');

js = js.replace(/function toggleFormProcesso\(\) \{[\s\S]*?\}\s*function toggleFormAcesso\(\) \{/g, `function toggleFormProcesso() {
  const form = document.getElementById('form-novo-processo');
  const btn = document.getElementById('btn-toggle-form-processo');
  if (!form || !btn) return;
  
  if (form.style.display !== 'none') {
    form.style.display = 'none';
    btn.innerHTML = '&#10133; <span class="btn-text">Mostrar Formulário</span>';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
  } else {
    form.style.display = 'grid';
    btn.innerHTML = '&#128065; <span class="btn-text">Ocultar Formulário</span>';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = '';
  }
}

function toggleFormAcesso() {`);

js = js.replace(/function toggleFormAcesso\(\) \{[\s\S]*?\}\s*function abrirModalManifestoTCE/g, `function toggleFormAcesso() {
  const form = document.getElementById('form-acesso');
  const btn = document.getElementById('btn-toggle-form-acesso');
  if (!form || !btn) return;
  
  if (form.style.display !== 'none') {
    form.style.display = 'none';
    btn.innerHTML = '&#10133; <span class="btn-text">Mostrar</span>';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
    localStorage.setItem('form_acesso_collapsed', '1');
  } else {
    form.style.display = 'grid';
    btn.innerHTML = '&#128065; <span class="btn-text">Ocultar</span>';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = '';
    localStorage.removeItem('form_acesso_collapsed');
  }
}

function abrirModalManifestoTCE`);

fs.writeFileSync('js/app.js', js);
console.log('replaced functions');
