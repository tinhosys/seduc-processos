const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /<!-- Guias Or[^\n]*?-->\s*<ul class="tabs"[^>]*>[\s\S]*?<\/ul>/;

const replacement = `<!-- Guias Orçamento -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; margin-bottom:20px; gap:15px;">
        
        <ul class="tabs" style="list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:8px;">
          <li class="tab-link active" onclick="mudarGuiaOrcamento('26 Execução Orçamentária', '325984433', this)" style="padding:10px 15px; background:#3b82f6; border-radius:8px; cursor:pointer; color:white; font-size:13px; font-weight:bold; border:1px solid #3b82f6;">26 Execução Orçamentária</li>
          <li class="tab-link" onclick="mudarGuiaOrcamento('1 Recurso Federal', '', this)" style="padding:10px 15px; background:#1e293b; border-radius:8px; cursor:pointer; color:#cbd5e1; font-size:13px; font-weight:bold; border:1px solid #334155;">1 Recurso Federal</li>
          <li class="tab-link" onclick="mudarGuiaOrcamento('Consolidado', '', this)" style="padding:10px 15px; background:#1e293b; border-radius:8px; cursor:pointer; color:#cbd5e1; font-size:13px; font-weight:bold; border:1px solid #334155;">Consolidado</li>
        </ul>
        
        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; background:#0f172a; padding:6px; border-radius:10px; border:1px solid #334155;">
          <span style="font-size:10px; color:#64748b; text-transform:uppercase; font-weight:bold; margin-right:5px; margin-left:5px;">Modelos de Relatórios (PDF/Impressão):</span>
          <button onclick="gerarRelatorioOrcamento(1)" title="Resumo Geral por Programa" class="btn-orc-report">R1</button>
          <button onclick="gerarRelatorioOrcamento(2)" title="Listagem Detalhada" class="btn-orc-report">R2</button>
          <button onclick="gerarRelatorioOrcamento(3)" title="Agrupado por Programa" class="btn-orc-report">R3</button>
          <button onclick="gerarRelatorioOrcamento(4)" title="Agrupado por Fonte" class="btn-orc-report">R4</button>
          <button onclick="gerarRelatorioOrcamento(5)" title="Agrupado por Natureza" class="btn-orc-report">R5</button>
          <button onclick="gerarRelatorioOrcamento(6)" title="Relatório de Saldos Críticos" class="btn-orc-report">R6</button>
          <button onclick="gerarRelatorioOrcamento(7)" title="Impressão Visual Rápida" class="btn-orc-report">R7</button>
          <button onclick="gerarRelatorioOrcamento(8)" title="Relatório Completo (Gráficos e Detalhes)" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:white; border:none; padding:8px 12px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:4px; box-shadow:0 2px 5px rgba(0,0,0,0.2);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            R8 (Detalhado com Gráficos)
          </button>
        </div>
      </div>
      
      <style>
      .btn-orc-report {
        background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer; transition:all 0.2s;
      }
      .btn-orc-report:hover {
        background:#3b82f6; color:white; border-color:#3b82f6;
      }
      </style>`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Orçamento header patched');
