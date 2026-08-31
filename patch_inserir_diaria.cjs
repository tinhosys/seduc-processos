const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

// 1. Remove the PDF line
content = content.replace(/doc\.text\('\* Para gravar na planilha oficial do Google Sheets.*?\);/, '');

// 2. Modify inserirDiaria to add the fetch request
const fetchBlock = `
    const novaDiaria = {
      nome, cpf, cidade, proc, dataSaida, qtde, unit, valor, motivo, timestamp: new Date().toISOString()
    };

    // --- INTEGRAÇÃO GOOGLE SHEETS (APPS SCRIPT) ---
    // URL gerada após você publicar o script no Google Apps Script como Web App.
    // Substitua 'URL_DO_SEU_WEB_APP' pelo link real gerado pelo Google.
    const WEB_APP_URL = 'URL_DO_SEU_WEB_APP';
    
    if (WEB_APP_URL !== 'URL_DO_SEU_WEB_APP') {
      const btnSalvar = document.querySelector('.btn-primary[onclick="inserirDiaria()"]');
      if (btnSalvar) {
        btnSalvar.innerText = 'Salvando...';
        btnSalvar.disabled = true;
      }
      
      fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires no-cors for simple inserts without preflight issues
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaDiaria)
      }).then(() => {
        alert("Diária enviada para a Planilha do Google com sucesso!");
        if (btnSalvar) {
          btnSalvar.innerText = 'Salvar Nova Diária';
          btnSalvar.disabled = false;
        }
        gerarRelatorioDiarias({ nome, cpf, cidade, proc, dataSaida, qtde, unit, valor, motivo });
        alternarNovaDiaria();
      }).catch(err => {
        alert("Erro ao salvar na planilha: " + err.message);
        if (btnSalvar) {
          btnSalvar.innerText = 'Salvar Nova Diária';
          btnSalvar.disabled = false;
        }
      });
    } else {
      // Funcionamento apenas local (sem integração)
      gerarRelatorioDiarias({ nome, cpf, cidade, proc, dataSaida, qtde, unit, valor, motivo });
      alternarNovaDiaria();
    }
    
    return; // Stop the rest of the old logic
`;

// Inject into inserirDiaria right after validation
const targetRegex = /alert\("Preencha todos os campos obrigatrios \(Nome, CPF, Cidade, Motivo, Qtde e Valor\)!"\);\s+return;\s+\}\s+gerarRelatorioDiarias\(\{ nome, cpf, proc, qtde, unit, valor, motivo, cidade, dataSaida \}\);\s+alternarNovaDiaria\(\);\s+\}/;

// Wait, looking at the code, it probably has:
// gerarRelatorioDiarias({ nome, cpf, proc, qtde, unit, valor, motivo, cidade, dataSaida });
// alternarNovaDiaria();
content = content.replace(/gerarRelatorioDiarias\(\{ nome, cpf, proc, qtde, unit, valor, motivo, cidade, dataSaida \}\);\s+alternarNovaDiaria\(\);/, fetchBlock);

fs.writeFileSync('js/diarias.js', content);
console.log('inserirDiaria updated!');
