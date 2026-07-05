const fs = require('fs');
let app = fs.readFileSync('public/js/app.js', 'utf8');

app = app.replace(
  '<a href="https://sei.sistemas.ro.gov.br/sei/controlador.php?acao=procedimento_trabalhar&acao_origem=protocolo_pesquisa_rapida&id_protocolo=68583100&infra_sistema=100000100&infra_unidade_atual=110008268&infra_hash=f9b3abfd3026a790adcd642bfe2596aa65059b96033f542d0d7ebbade2b950b1" target="_blank" class="btn btn-ghost" style="padding:6px 12px;display:flex;align-items:center;gap:6px;background:white;border:1px solid var(--border);border-radius:6px;font-size:13px;color:#1e293b;text-decoration:none;" title="Acessar SEI no link fornecido" onclick="navigator.clipboard.writeText(\\'\\\');toast(\\'Número copiado e abrindo SEI...\\', \\'success\\')">',
  '<a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI" target="_blank" class="btn btn-ghost" style="padding:6px 12px;display:flex;align-items:center;gap:6px;background:white;border:1px solid var(--border);border-radius:6px;font-size:13px;color:#1e293b;text-decoration:none;" title="Acessar SEI">'
);

fs.writeFileSync('public/js/app.js', app, 'utf8');
console.log('App.js SEI link reverted');
