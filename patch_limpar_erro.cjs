const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

const old1 = "document.getElementById('diaria-natureza').value = '';";
const new1 = "document.getElementById('diaria-nd').value = '';";

const old2 = "document.getElementById('diaria-empenho-info').innerHTML = '<span style=\"color:#94a3b8;\">Aguardando seleção...</span>';";
const new2 = `
    const aviso = document.getElementById('diaria-saldo-aviso');
    if (aviso) {
      aviso.style.background = 'rgba(59,130,246,0.1)';
      aviso.style.borderColor = 'rgba(59,130,246,0.3)';
      aviso.style.color = '#60a5fa';
      aviso.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> Selecione os parâmetros acima para verificar a disponibilidade de saldo.';
    }
`;

content = content.replace(old1, new1);
content = content.replace(old2, new2);

// Also need to reset the btn se estiver bloqueado
const injectButtonReset = `
    const btn = document.querySelector('.btn-primary[onclick="inserirDiaria()"]');
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Bloqueado - Sem Saldo';
      btn.style.background = 'rgba(255,255,255,0.1)';
    }
`;
// Wait, the button original state is disabled if not valid. We should call `verificarSaldoDiaria()` to reset the UI fully?
// If we set values to '', calling `verificarSaldoDiaria()` will automatically reset the message and disable the button!
// Let's do that!

const cleanNewLogic = `
// Função para limpar o formulário de Nova Diária
window.limparFormNovaDiaria = function() {
  if (confirm("Tem certeza que deseja limpar todos os dados do formulário?")) {
    if(document.getElementById('diaria-pa')) document.getElementById('diaria-pa').value = '';
    if(document.getElementById('diaria-fonte')) document.getElementById('diaria-fonte').value = '';
    if(document.getElementById('diaria-nd')) document.getElementById('diaria-nd').value = '';
    
    if (typeof verificarSaldoDiaria === 'function') verificarSaldoDiaria();
    
    if(document.getElementById('diaria-nome')) document.getElementById('diaria-nome').value = '';
    if(document.getElementById('diaria-cpf')) document.getElementById('diaria-cpf').value = '';
    if(document.getElementById('diaria-cidade')) document.getElementById('diaria-cidade').value = '';
    if(document.getElementById('diaria-proc')) document.getElementById('diaria-proc').value = '';
    if(document.getElementById('diaria-motivo')) document.getElementById('diaria-motivo').value = '';
    if(document.getElementById('diaria-data-saida')) document.getElementById('diaria-data-saida').value = '';
    if(document.getElementById('diaria-qtde')) document.getElementById('diaria-qtde').value = '';
    if(document.getElementById('diaria-valor-unit')) document.getElementById('diaria-valor-unit').value = '';
    if(document.getElementById('diaria-valor-total')) document.getElementById('diaria-valor-total').value = '';
    
    if (typeof toast === 'function') toast('Formulário limpo', 'info');
  }
};
`;

// Replace the entire function
content = content.replace(/\/\/ Função para limpar o formulário de Nova Diária[\s\S]*?toast\('Formulário limpo', 'info'\);\n  \}\n\};\n/, cleanNewLogic + "\n");

// If it's corrupted due to encoding, use a simpler regex
const fallbackRegex = /window\.limparFormNovaDiaria = function\(\) \{[\s\S]*?\};/m;
content = fs.readFileSync('js/diarias.js', 'utf8');
content = content.replace(fallbackRegex, cleanNewLogic.trim());

fs.writeFileSync('js/diarias.js', content);
console.log('Fixed js error');
