const fs = require('fs');

function updateJS(file) {
  let js = fs.readFileSync(file, 'utf8');

  js = js.replace(
    "ano: [], agrupamento: []",
    "ano: [], agrupamento: [], digito: []"
  );
  
  js = js.replace(
    "filterByMultiple('agrupamento', state.filtros.agrupamento);",
    "filterByMultiple('agrupamento', state.filtros.agrupamento);\n  filterByMultiple('digito', state.filtros.digito);"
  );

  js = js.replace(
    "state.filtros = { busca: '', status: [], localizacao: [], municipio: [], super: [], objeto: [], prefixo: [], alerta: '', marca: '', categoria: [], tipo: [], autorizacao: '', ano: [], agrupamento: [] };",
    "state.filtros = { busca: '', status: [], localizacao: [], municipio: [], super: [], objeto: [], prefixo: [], alerta: '', marca: '', categoria: [], tipo: [], autorizacao: '', ano: [], agrupamento: [], digito: [] };"
  );

  fs.writeFileSync(file, js, 'utf8');
}

updateJS('js/app.js');
updateJS('js/app_github.js');
console.log('Done filtering logic');
