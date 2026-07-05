const fs = require('fs');

function fixAppJs(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Change "Principais Locais:" to "Locais:"
  content = content.replace(/<strong>Principais Locais:<\/strong>/g, '<strong>Locais:</strong>');

  // Update the footer generation
  const oldFooter = /<div style="flex:1;">SISTEMA DE ACOMPANHAMENTO DE PROCESSOS - SAP<\/div>[\s\S]*?<div style="flex:1; text-align:right;" class="page-number-css"><\/div>/;
  const newFooter = `<div style="flex:1;">SAP - SISTEMA DE ACOMPANHAMENTO DE PROCESSO</div>
        <div style="flex:1; text-align:right;">
          <span class="page-number-css"></span> - <span class="print-date-time-rodape"></span>
        </div>`;
  content = content.replace(oldFooter, newFooter);

  // Update imprimirAnalise with filters synthesis
  const analiseStart = /window\.imprimirAnalise = function\(\) \{[\s\S]*?let total = 0;/;
  
  if (content.match(analiseStart)) {
    const analiseMod = `window.imprimirAnalise = function() {
  injectFixedFooter();
  updatePrintDateTime();
  const filtrados = getFiltrados();
  let total = 0;
  
  // Extract active filters
  const fGeral = document.getElementById('filtro-geral') ? document.getElementById('filtro-geral').value : '';
  const fStatus = document.getElementById('filtro-status') ? document.getElementById('filtro-status').value : 'Todos';
  const fLocalizacao = document.getElementById('filtro-localizacao') ? document.getElementById('filtro-localizacao').value : 'Todos';
  const fPrefixo = document.getElementById('filtro-prefixo') ? document.getElementById('filtro-prefixo').value : 'Todos';
  const fMunicipio = document.getElementById('filtro-municipio') ? document.getElementById('filtro-municipio').value : 'Todos';
  
  let filtrosAplicados = [];
  if (fGeral) filtrosAplicados.push("Busca: '" + fGeral + "'");
  if (fStatus && fStatus !== 'Todos') filtrosAplicados.push("Status: " + fStatus);
  if (fLocalizacao && fLocalizacao !== 'Todos') filtrosAplicados.push("Localização: " + fLocalizacao);
  if (fPrefixo && fPrefixo !== 'Todos') filtrosAplicados.push("Prefixo: " + fPrefixo);
  if (fMunicipio && fMunicipio !== 'Todos') filtrosAplicados.push("Município: " + fMunicipio);
  
  const filtrosTexto = filtrosAplicados.length > 0 
    ? "Filtros aplicados (" + filtrosAplicados.join(', ') + ")" 
    : "Todos os processos (sem filtros aplicados)";
`;
    content = content.replace(analiseStart, analiseMod);

    const oldSintese = /<strong>SÍNTESE ANALÍTICA:<\/strong> O presente cenário totaliza <strong>\$\{formatCurrency\(total\)\}<\/strong> distribuídos em <strong>\$\{filtrados\.length\}<\/strong> processos\./;
    const newSintese = `<strong>SÍNTESE ANALÍTICA:</strong> Parâmetros buscados: <em>${"${filtrosTexto}"}</em>.<br>O presente cenário totaliza <strong>${"${formatCurrency(total)}"}</strong> distribuídos em <strong>${"${filtrados.length}"}</strong> processos.`;
    content = content.replace(oldSintese, newSintese);
  }

  // Also modify the footer text in updatePrintDateTime if needed
  const oldUpdatePrint = /el\.innerHTML = \`Impresso em \$\{d\} às \$\{t\}\`;/;
  const newUpdatePrint = 'el.innerHTML = `${d} / ${t}`;';
  content = content.replace(oldUpdatePrint, newUpdatePrint);

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed', filepath);
}

fixAppJs('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
fixAppJs('c:/Users/Elton/SEDUC/js/app.js');
