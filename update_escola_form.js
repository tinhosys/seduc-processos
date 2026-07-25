const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add Nova Escola button in header of page-escolas
const oldHeader = '<button onclick="recarregarEscolas()"';
const newHeader = '<button onclick="abrirModalFormEscola()" style="background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.2));border:1px solid rgba(16,185,129,0.4);color:#34d399;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:6px;">➕ Nova Escola</button> <button onclick="recarregarEscolas()"';

if (!html.includes('abrirModalFormEscola()') && html.includes(oldHeader)) {
  html = html.replace(oldHeader, newHeader);
  console.log('Button Nova Escola added to page-escolas header.');
}

// 2. Make all school form inputs editable in modal-form-escola
html = html.replace('🔒 Dados Institucionais (Somente Leitura - Não Editável)', '🏫 Dados Institucionais da Escola (Editável)');
html = html.replace('id="form-escola-nome" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-nome" class="form-control" placeholder="Nome da Escola" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-municipio" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-municipio" class="form-control" placeholder="Município" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-localizacao" class="form-control" disabled style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-localizacao" class="form-control" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-inep" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-inep" class="form-control" placeholder="Código INEP" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-codigoSuper" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-codigoSuper" class="form-control" placeholder="Cod. Super" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-super" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-super" class="form-control" placeholder="Supervisão" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-cep" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-cep" class="form-control" placeholder="Ex: 76800-000" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-matriculas" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-matriculas" class="form-control" placeholder="0" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');
html = html.replace('id="form-escola-salas" class="form-control" readonly style="opacity:0.7; cursor:not-allowed; background:rgba(255,255,255,0.03);"', 'id="form-escola-salas" class="form-control" placeholder="0" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;"');

fs.writeFileSync(filePath, html, 'utf8');
console.log('index.html updated successfully.');
