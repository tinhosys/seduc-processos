const fs = require('fs');

function updateDadosJs() {
  const file = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/dados.js';
  let content = fs.readFileSync(file, 'utf8');

  // Add helper for headers
  const helper = `
// Helper para incluir cabeçalho de autenticação
function getHeaders(extraHeaders = {}) {
  const token = sessionStorage.getItem('sap_session_token');
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': 'Bearer ' + token } : {})
  };
}
`;

  // Insert helper after DB_KEY definition
  content = content.replace("const DB_KEY = 'seduc_processos_v1';", "const DB_KEY = 'seduc_processos_v1';\n" + helper);

  // Update inicializarDados fetch
  content = content.replace("const res = await fetch('/api/registros');", "const res = await fetch('/api/registros', { headers: getHeaders() });");

  // Update adicionarProcesso fetch
  content = content.replace(
    "await fetch('/api/registros', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(dados)\n    });",
    "await fetch('/api/registros', {\n      method: 'POST',\n      headers: getHeaders({ 'Content-Type': 'application/json' }),\n      body: JSON.stringify(dados)\n    });"
  );

  // Update atualizarProcesso fetch
  content = content.replace(
    "await fetch(`/api/registros/${id}`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(dados)\n    });",
    "await fetch(`/api/registros/\${id}`, {\n      method: 'PUT',\n      headers: getHeaders({ 'Content-Type': 'application/json' }),\n      body: JSON.stringify(dados)\n    });"
  );

  // Update excluirProcesso fetch
  content = content.replace(
    "await fetch(`/api/registros/${id}`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ status: 'EXCLUÍDO' })\n    });",
    "await fetch(`/api/registros/\${id}`, {\n      method: 'PUT',\n      headers: getHeaders({ 'Content-Type': 'application/json' }),\n      body: JSON.stringify({ status: 'EXCLUÍDO' })\n    });"
  );

  // Add error handling wrapper for fetch to catch 401 Unauthorized
  // Let's add a global fetch interceptor or check response status in each request.
  // Actually, checking status in each is good.
  
  // Let's wrap inicializarDados check
  content = content.replace(
    "const data = await res.json();\n    if (data.rows) {",
    "if (res.status === 401 || res.status === 403) {\n      fazerLogout();\n      return;\n    }\n    const data = await res.json();\n    if (data.rows) {"
  );

  fs.writeFileSync(file, content, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/dados.js', content, 'utf8');
  console.log('dados.js updated successfully');
}

updateDadosJs();
