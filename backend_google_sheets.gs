/**
 * Script de Integração Backend - Google Apps Script
 * ================================================
 * Este script deve ser copiado para o Google Apps Script da sua planilha oficial.
 * Ele cria um endpoint (Web App) que recebe os dados enviados pela interface do sistema
 * e grava as informações em uma aba específica.
 * 
 * PASSO A PASSO PARA ATIVAR:
 * 1. Abra sua planilha do Google Sheets.
 * 2. Clique no menu superior "Extensões" > "Apps Script".
 * 3. Apague o código padrão (`function myFunction()...`) e cole TODO este código lá.
 * 4. Salve o projeto (ícone de disquete).
 * 5. No canto superior direito, clique em "Implantar" (Deploy) > "Nova implantação".
 * 6. Escolha o tipo "App da Web" (clicando na engrenagem se necessário).
 * 7. Configurações:
 *    - Executar como: "Eu" (Seu email)
 *    - Quem pode acessar: "Qualquer pessoa" (Isso é obrigatório para o fetch do frontend funcionar sem autenticação complexa).
 * 8. Clique em "Implantar". Autorize os acessos na janela do Google que abrir (Avançado > Acessar script).
 * 9. Copie a "URL do app da Web" gerada.
 * 10. Cole a URL copiada no arquivo `js/diarias.js` na variável `WEB_APP_URL` na função `window.inserirDiaria`.
 */

// Função que recebe as requisições POST do seu sistema (frontend)
function doPost(e) {
  try {
    // Acessa a planilha ativa
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Recurso Federal"); 
    // OBS: Substitua "Recurso Federal" pelo nome exato da aba onde deseja gravar.
    // Pode ser uma nova aba como "Novas Solicitações" para não misturar com o banco lido.

    if (!sheet) {
      return ContentService.createTextOutput("Erro: Aba da planilha não encontrada.");
    }

    // Processa os dados que vieram do JavaScript (JSON.stringify)
    var dados = JSON.parse(e.postData.contents);
    
    // Constrói a linha que será adicionada à planilha
    // A ordem dos itens no array deve corresponder à ordem das colunas na sua planilha!
    // Exemplo genérico:
    var novaLinha = [
      "Reserva",               // Coluna 1: Status
      "339014",                // Coluna 2: Elemento de Despesa
      dados.processo || "",    // Coluna 3: Processo
      "",                      // Coluna 4: Nota de Empenho (Vazio ao solicitar)
      dados.dataSaida || "",   // Coluna 5: Data Início
      "",                      // Coluna 6: Data Fim
      dados.nome || "",        // Coluna 7: Setor/Beneficiário (Nome)
      dados.motivo || "",      // Coluna 8: Descrição (Motivo)
      "",                      // Coluna 9: Qtd Pessoas
      dados.valor || 0,        // Coluna 10: Valor 
      dados.valor || 0,        // Coluna 11: Valor Total
      "Nova Solicitação",      // Coluna 12: Status real
      ""                       // Coluna 13: Mês de Pagamento
    ];

    // Adiciona os dados na primeira linha vazia no final da planilha
    sheet.appendRow(novaLinha);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "sucesso", 
      mensagem: "Diária gravada com sucesso!" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(erro) {
    // Em caso de falha, retorna a mensagem de erro
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "erro", 
      mensagem: erro.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
