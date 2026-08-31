const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const cpfValidation = `
  function validarCPF(cpf) {
    cpf = cpf.replace(/\\D/g, '');
    if(cpf.length !== 11 || /^(\\d)\\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for(let i=1; i<=9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if((resto === 10) || (resto === 11)) resto = 0;
    if(resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for(let i=1; i<=10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if((resto === 10) || (resto === 11)) resto = 0;
    if(resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }
`;

const regex = /window\.inserirDiaria = function\(\) \{/;
content = content.replace(regex, cpfValidation + '\nwindow.inserirDiaria = function() {\n');

content = content.replace(/if \(\!nome \|\| \!valor \|\| \!motivo \|\| \!cpf \|\| \!cidade\) \{/, `if (!validarCPF(cpf)) {
    alert("CPF Inválido! Verifique o número digitado.");
    return;
  }
  
  if (!nome || !valor || !motivo || !cpf || !cidade) {`);

fs.writeFileSync(file, content);
console.log('CPF Validation Patched');
