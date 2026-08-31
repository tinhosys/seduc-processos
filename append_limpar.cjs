const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

content += `

// Função para limpar o formulário de Nova Diária
window.limparFormNovaDiaria = function() {
  if (confirm("Tem certeza que deseja limpar todos os dados do formulário?")) {
    document.getElementById('diaria-pa').value = '';
    document.getElementById('diaria-fonte').value = '';
    document.getElementById('diaria-natureza').value = '';
    document.getElementById('diaria-empenho-info').innerHTML = '<span style="color:#94a3b8;">Aguardando seleção...</span>';
    
    document.getElementById('diaria-nome').value = '';
    document.getElementById('diaria-cpf').value = '';
    document.getElementById('diaria-cidade').value = '';
    document.getElementById('diaria-proc').value = '';
    document.getElementById('diaria-motivo').value = '';
    document.getElementById('diaria-data-saida').value = '';
    document.getElementById('diaria-qtde').value = '';
    document.getElementById('diaria-valor-unit').value = '';
    document.getElementById('diaria-valor-total').value = '';
    
    if (typeof toast === 'function') toast('Formulário limpo', 'info');
  }
};
`;

fs.writeFileSync('js/diarias.js', content);
console.log("Function appended");
