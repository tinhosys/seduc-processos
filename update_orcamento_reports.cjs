const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexFile, 'utf8');

const buttonsHTML = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; background: rgba(30,41,59,0.5); padding: 4px; border-radius: 8px;">
          <button onclick="gerarRelatorioOrcamento(1)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Resumo Geral">1. RESUMO</button>
          <button onclick="gerarRelatorioOrcamento(2)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Listagem Detalhada">2. DETALHADO</button>
          <button onclick="gerarRelatorioOrcamento(3)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Agrupado por Programa de Ação">3. POR P.A.</button>
          <button onclick="gerarRelatorioOrcamento(4)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Agrupado por Fonte de Recurso">4. POR FONTE</button>
          <button onclick="gerarRelatorioOrcamento(5)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Agrupado por Natureza da Despesa">5. POR NATUREZA</button>
          <button onclick="gerarRelatorioOrcamento(6)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Saldos Críticos / Alta Execução">6. CRÍTICOS</button>
          <button onclick="if(typeof imprimirOrcamento==='function') imprimirOrcamento(); else window.print();" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#6366f1; color:white; border:none; border-radius:6px; cursor:pointer;" title="Impressão Visual da Tela">7. TELA</button>
        </div>
`;

let replaced = false;
const searchRegex = /<button onclick="if\(typeof imprimirOrcamento==='function'\) imprimirOrcamento\(\); else window\.print\(\);"[^>]*>[\s\S]*?<\/button>/;
if (searchRegex.test(indexContent)) {
  indexContent = indexContent.replace(searchRegex, buttonsHTML);
  replaced = true;
}

if (replaced) {
  fs.writeFileSync(indexFile, indexContent);
  console.log('index.html updated with 7 buttons.');
} else {
  console.log('Failed to find button in index.html');
}

const orcFile = path.join(__dirname, 'js', 'orcamento.js');
let orcContent = fs.readFileSync(orcFile, 'utf8');

const jsPDFLogic = `
window.gerarRelatorioOrcamento = function(modelo) {
  if (!window.jspdf) {
    alert("Biblioteca jsPDF não carregada.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF(modelo === 7 || modelo === 2 ? 'landscape' : 'portrait');
  
  doc.setFontSize(14);
  doc.text("RELATÓRIO DE EXECUÇÃO ORÇAMENTÁRIA - SEDUC/RO", 14, 15);
  doc.setFontSize(10);
  doc.text("Gerado em: " + new Date().toLocaleString('pt-BR'), 14, 21);
  
  const tInicial = _orcFiltrado.reduce((acc, r) => acc + (r.inicial || 0), 0);
  const tEmpenhado = _orcFiltrado.reduce((acc, r) => acc + (r.empenhado || 0), 0);
  const tExecutado = _orcFiltrado.reduce((acc, r) => acc + (r.executado || 0), 0);
  const tLiquido = _orcFiltrado.reduce((acc, r) => acc + (r.saldoLiquido || 0), 0);
  
  doc.text(\`Dotação Inicial: \${_fmtBRL(tInicial)}\`, 14, 27);
  doc.text(\`Empenhado: \${_fmtBRL(tEmpenhado)}\`, 70, 27);
  doc.text(\`Executado: \${_fmtBRL(tExecutado)}\`, 130, 27);
  doc.text(\`Saldo Líquido: \${_fmtBRL(tLiquido)}\`, 190, 27);

  let title = "Relatório";
  let head = [];
  let body = [];
  
  const baseHead = [['PA', 'Fonte', 'Natureza', 'Inicial', 'Empenhado', 'Executado', 'Saldo Líq.']];
  const formatRow = (r) => [
    r.pa, r.fonte, _naturezaNome(r.despesa), _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), _fmtBRL(r.saldoLiquido)
  ];

  if (modelo === 1) {
    title = "Resumo Geral por Programa";
    head = [['Programa', 'Inicial', 'Executado', 'Saldo Líquido', '%']];
    const grouped = {};
    _orcFiltrado.forEach(r => {
      if(!grouped[r.pa]) grouped[r.pa] = { inicial: 0, executado: 0, saldo: 0 };
      grouped[r.pa].inicial += r.inicial;
      grouped[r.pa].executado += r.executado;
      grouped[r.pa].saldo += r.saldoLiquido;
    });
    for(const [pa, vals] of Object.entries(grouped)) {
      body.push([pa, _fmtBRL(vals.inicial), _fmtBRL(vals.executado), _fmtBRL(vals.saldo), _pctExec(vals.inicial, vals.executado) + '%']);
    }
  } else if (modelo === 2) {
    title = "Listagem Detalhada";
    head = [['PA', 'Fonte', 'Natureza', 'Detalhe', 'Inicial', 'Empenhado', 'Executado', 'Saldo Líq.']];
    body = _orcFiltrado.map(r => [
      r.pa, r.fonte, _naturezaNome(r.despesa), r.detalhamento ? r.detalhamento.substring(0, 25) : '',
      _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), _fmtBRL(r.saldoLiquido)
    ]);
  } else if (modelo === 3) {
    title = "Agrupado por Programa de Ação";
    head = baseHead;
    const sorted = [..._orcFiltrado].sort((a,b) => a.pa.localeCompare(b.pa));
    body = sorted.map(formatRow);
  } else if (modelo === 4) {
    title = "Agrupado por Fonte de Recurso";
    head = baseHead;
    const sorted = [..._orcFiltrado].sort((a,b) => a.fonte.localeCompare(b.fonte));
    body = sorted.map(formatRow);
  } else if (modelo === 5) {
    title = "Agrupado por Natureza da Despesa";
    head = baseHead;
    const sorted = [..._orcFiltrado].sort((a,b) => a.despesa.localeCompare(b.despesa));
    body = sorted.map(formatRow);
  } else if (modelo === 6) {
    title = "Relatório de Saldos Críticos (Baixo Saldo ou Alta Execução)";
    head = baseHead;
    const crit = _orcFiltrado.filter(r => _pctExec(r.inicial, r.executado) >= 80 || r.saldoLiquido <= 10000);
    body = crit.map(formatRow);
  }

  doc.text(title, 14, 35);
  doc.autoTable({ startY: 40, head: head, body: body, styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] } });
  doc.save(\`Relatorio_Orcamento_Mod\${modelo}.pdf\`);
};
`;

if (!orcContent.includes('window.gerarRelatorioOrcamento')) {
  fs.appendFileSync(orcFile, '\n' + jsPDFLogic);
  console.log('js/orcamento.js updated.');
}
