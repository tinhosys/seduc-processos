const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regexInserir = /window\.inserirDiaria = function\(\) \{[\s\S]*?else alert\('Registrado com sucesso!'\);\s*\};/;

const newInserir = `window.inserirDiaria = function() {
  const nome = document.getElementById('diaria-nome').value;
  const cpf = document.getElementById('diaria-cpf').value;
  const cidade = document.getElementById('diaria-cidade').value;
  const proc = document.getElementById('diaria-proc').value;
  const qtde = parseFloat(document.getElementById('diaria-qtde').value) || 0;
  const unit = parseFloat(document.getElementById('diaria-valor-unit').value) || 0;
  const valor = qtde * unit;
  const motivo = document.getElementById('diaria-motivo').value;
  const dataSaida = document.getElementById('diaria-data-saida').value;
  
  if (!nome || !valor || !motivo || !cpf || !cidade) {
    alert("Preencha todos os campos obrigatórios (Nome, CPF, Cidade, Motivo, Qtde e Valor)!");
    return;
  }
  
  DIARIAS_DATA.unshift({
    status: 'Reserva',
    data: dataSaida ? dataSaida.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR'),
    nome: nome,
    cpf: cpf,
    cidade: cidade,
    processo: proc,
    motivo: motivo,
    valor: valor,
    valorFederal: 0
  });
  
  document.getElementById('diaria-nome').value = '';
  document.getElementById('diaria-cpf').value = '';
  document.getElementById('diaria-cidade').value = '';
  document.getElementById('diaria-proc').value = '';
  document.getElementById('diaria-qtde').value = '';
  document.getElementById('diaria-valor-unit').value = '';
  document.getElementById('diaria-valor-total').value = '';
  document.getElementById('diaria-motivo').value = '';
  document.getElementById('diaria-data-saida').value = '';
  
  // Create simple report PDF
  if (window.jspdf) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Emissão de Diária', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiário: ' + nome, 14, 30);
    doc.text('CPF: ' + cpf, 14, 37);
    doc.text('Processo SEI: ' + proc, 14, 44);
    doc.text('Cidade de Destino: ' + cidade, 14, 51);
    doc.text('Data de Saída: ' + (dataSaida ? dataSaida.split('-').reverse().join('/') : 'N/A'), 14, 58);
    doc.text('Motivo da Viagem: ' + motivo, 14, 65, {maxWidth: 180});
    
    doc.setFont('helvetica', 'bold');
    doc.text('Quantidade de Diárias: ' + qtde.toFixed(1), 14, 85);
    doc.text('Valor Unitário: R$ ' + unit.toLocaleString('pt-BR', {minimumFractionDigits:2}), 14, 92);
    doc.text('Valor Total: R$ ' + valor.toLocaleString('pt-BR', {minimumFractionDigits:2}), 14, 99);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('* Este documento comprova o registro local da diária.', 14, 120);
    doc.text('* Para gravar na planilha oficial do Google Sheets, um script de integração backend é necessário.', 14, 127);
    
    window.open(doc.output('bloburl'), '_blank');
  }

  const tabConsolidado = Array.from(document.querySelectorAll('#page-diarias .tabs .tab-link')).find(t => t.innerText === 'Consolidado');
  if(tabConsolidado) tabConsolidado.click();
  else mudarAbaDiarias('consolidado', null);
  
  if (typeof toast === 'function') toast('Diária registrada localmente!', 'success');
  else alert('Registrado com sucesso!');
};`;

content = content.replace(regexInserir, newInserir);

// Also need to fix that DIARIAS_DATA rendering depends on these fields.
fs.writeFileSync(file, content);
console.log('Patched js/diarias.js');
