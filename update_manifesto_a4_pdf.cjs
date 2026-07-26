const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'js', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

const updatedFunctions = `
// ============================================================
// SEDUC — Gerador de Manifestação Técnica & Relatório A4/PDF (TCE-RO)
// ============================================================

window._manifestoProcessoAtual = null;

function gerarTextoManifestoTCE(p) {
  p = p || {};

  const municipio = p.municipio || 'Município não informado';
  const interessado = p.interessado || 'Unidade Escolar / Conselho Escolar';
  const numeroProcesso = p.numero || 'Sem número';
  const oficioNum = p.oficioNumero || 'XX - XXX';
  
  let diretorNome = 'XXX';
  if (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache)) {
    const esc = _escolasCache.find(e => 
      (e.nome && p.interessado && e.nome.toLowerCase().includes(p.interessado.toLowerCase())) ||
      (e.municipio && p.municipio && e.municipio.toLowerCase() === p.municipio.toLowerCase())
    );
    if (esc && esc.diretor) diretorNome = esc.diretor;
  }

  const tipoCod = (p.tipo || '').toUpperCase();
  const tipoDesc = {
    'OB': 'Obras e Infraestrutura Física',
    'MP': 'Aquisição de Material Permanente',
    'MC': 'Aquisição de Material de Consumo',
    'SI': 'Sistemas e Tecnologias da Informação',
    'TR': 'Treinamento e Capacitação',
    'OU': 'Outros Investimentos'
  }[tipoCod] || p.tipo || 'Investimento em Infraestrutura/Material';

  let detalheObj = '';
  if (p.detalhamentoItens && p.detalhamentoItens.trim()) {
    detalheObj = p.detalhamentoItens.trim();
  } else {
    let partes = [];
    if (p.objeto) partes.push(p.objeto);
    if (p.metragemM2) partes.push('metragem aproximada de ' + p.metragemM2 + ' m²');
    if (p.qtdeSala) partes.push(p.qtdeSala + ' salas de aula');
    if (p.auditorio) partes.push('auditório (' + (p.tipoAuditorio || 'padrão') + ')');
    if (p.quadra) partes.push('quadra (' + p.quadra + ')');
    if (p.refeitorio) partes.push('refeitório (' + p.refeitorio + ')');
    if (p.banheiros) partes.push('instalações sanitárias (' + p.banheiros + ')');
    detalheObj = partes.length > 0 ? partes.join(', ') : (tipoDesc.toLowerCase() + ', compreendendo mobiliários, equipamentos e adequações necessárias');
  }

  let textoObjetoConstruido = '';
  if (tipoCod === 'OB' && p.metragemM2) {
    textoObjetoConstruido = 'a execução de obras/serviços de engenharia com metragem total de ' + p.metragemM2 + ' m², abrangendo ' + detalheObj;
  } else {
    textoObjetoConstruido = (p.objeto ? p.objeto.toLowerCase() : 'aquisição e instalação de materiais') + ', compreendendo ' + detalheObj;
  }

  const dataAtualExtenso = new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});

  return \`Manifestação

A legislação educacional brasileira, em seus diversos níveis, estabelece um complexo de deveres e colaborações para a garantia do direito à educação. A Constituição Federal, em seu artigo 205, consagra a educação como um direito de todos e um dever do Estado e da família, a ser promovida com a colaboração da sociedade, visando o pleno desenvolvimento da pessoa, seu preparo para a cidadania e sua qualificação para o trabalho. Complementarmente, o artigo 30, inciso VI, atribui aos municípios a competência para manter, com a cooperação técnica e financeira da União e do Estado, programas de educação infantil e de ensino fundamental. O regime de colaboração entre os entes federados é reforçado pelo artigo 211, § 4º, que determina a definição de formas de colaboração entre União, Estados, Distrito Federal e Municípios para assegurar a universalização do ensino obrigatório.

A Lei de Diretrizes e Bases da Educação Nacional (Lei nº 9.394/1996) reitera e detalha essa estrutura colaborativa, estabelecendo em seu artigo 8º que a União, os Estados, o Distrito Federal e os Municípios organizarão, em regime de colaboração, seus respectivos sistemas de ensino. O artigo 10 da mesma lei incumbe os Estados de organizar, manter e desenvolver os órgãos e instituições oficiais de seus sistemas de ensino, definindo, com os Municípios, formas de colaboração na oferta do ensino fundamental (inciso II), e de baixar normas complementares para seu sistema de ensino (inciso VI).

A Lei nº 14.113/2020, que regulamenta o Fundeb, fortalece a cooperação entre os entes federativos. O artigo 14, § 1º, inciso IV, condiciona o recebimento de complementação de recursos federais à existência de um regime de colaboração entre Estado e Municípios formalizado na legislação estadual. Ademais, o artigo 50, em seu parágrafo único, estabelece que a União, os Estados e o Distrito Federal desenvolverão, em regime de colaboração, programas de apoio para a conclusão da educação básica por alunos matriculados no sistema público.

No âmbito estadual, a Constituição do Estado de Rondônia, em seus artigos 187 e 188, detalha as responsabilidades do poder público com a educação, estabelecendo que o ensino será ministrado com base em princípios como a igualdade de condições para o acesso e permanência na escola e a gestão democrática do ensino público, e define as atribuições do sistema estadual de ensino.

Ainda no âmbito estadual, a Lei nº. 5.735/2024 institui o Programa de Alfabetização do Estado de Rondônia, em regime de colaboração com os municípios, cabendo ao Estado prestar cooperação técnica e financeira aos municípios. Dentre os eixos do programa, há o Eixo 2 que trata da infraestrutura física e pedagógica. Desta feita, compulsando o Ofício \${oficioNum}, s.m.j., verifica-se que o objeto proposto consiste na \${textoObjetoConstruido}, destinados à organização, equipagem e melhoria dos espaços pedagógicos da unidade escolar, visando aprimorar as condições de trabalho dos profissionais da educação e qualificar os espaços escolares, por meio da disponibilização de mobiliário e equipamentos adequados, contribuindo para o fortalecimento das práticas pedagógicas e assegurando maior organização, conforto, segurança e funcionalidade aos ambientes educacionais.

Em atendimento à solicitação do(a) Sr(a). \${diretorNome}, Diretora/Presidente do Conselho Escolar, nos termos do Ofício \${oficioNum}, manifestamo-nos favoravelmente à solicitação do município, no que tange ao regime de colaboração regulamentado pela Lei Estadual nº. 5.735/2024.

Nestes termos, submeto os autos à apreciação superior, para deliberação acerca da oportunidade e conveniência administrativa.

Porto Velho - RO, \${dataAtualExtenso}.\`;
}

function gerarEExibirManifestoTCEAtual() {
  const g = (id) => (document.getElementById(id) || {}).value || '';
  const p = {
    numero: g('form-numero'),
    municipio: g('form-municipio'),
    interessado: g('form-interessado'),
    objeto: g('form-objeto'),
    tipo: (document.querySelector('#control-tipo .segment-btn.active') || {}).dataset?.value || g('form-tipo'),
    oficioNumero: g('form-oficioNumero'),
    metragemM2: g('form-metragemM2'),
    detalhamentoItens: g('form-detalhamentoItens'),
    qtdeSala: g('form-qtdeSala'),
    tipoSala: g('form-tipoSala'),
    auditorio: g('form-auditorio'),
    tipoAuditorio: g('form-tipoAuditorio'),
    quadra: g('form-quadra'),
    refeitorio: g('form-refeitorio'),
    banheiros: g('form-banheiros'),
    valorPlan: (typeof parseMoney === 'function') ? parseMoney(g('form-valorPlan')) : 0,
    valorOf: (typeof parseMoney === 'function') ? parseMoney(g('form-valorOf')) : 0
  };
  abrirModalManifestoTCE(p);
}

function abrirModalManifestoTCEById(id) {
  const p = (state.processos || []).find(item => item.id === id);
  if (!p) {
    if (typeof toast === 'function') toast('Processo não encontrado para gerar manifesto', 'error');
    return;
  }
  abrirModalManifestoTCE(p);
}

function abrirModalManifestoTCE(p) {
  window._manifestoProcessoAtual = p || {};
  const texto = gerarTextoManifestoTCE(p);
  const preview = document.getElementById('manifesto-tce-texto-preview');
  if (preview) preview.textContent = texto;

  const modal = document.getElementById('modal-manifesto-tce');
  if (modal) modal.style.display = 'flex';
}

function fecharModalManifestoTCE() {
  const modal = document.getElementById('modal-manifesto-tce');
  if (modal) modal.style.display = 'none';
}

function copiarManifestoTCE() {
  const preview = document.getElementById('manifesto-tce-texto-preview');
  if (!preview) return;
  navigator.clipboard.writeText(preview.textContent).then(() => {
    if (typeof toast === 'function') toast('Texto da Manifestação TCE-RO copiado para a área de transferência!', 'success');
  }).catch(() => {
    if (typeof toast === 'function') toast('Erro ao copiar texto', 'error');
  });
}

function imprimirManifestoTCE() {
  const p = window._manifestoProcessoAtual || {};
  const textoLegal = gerarTextoManifestoTCE(p);

  const municipio = p.municipio || 'NÃO INFORMADO';
  const escola = p.interessado || 'UNIDADE ESCOLAR';
  const numeroProc = p.numero || 'S/N';
  const oficioNum = p.oficioNumero || 'NÃO INFORMADO';
  const tipoDesc = (p.tipo || 'INVESTIMENTO').toUpperCase();
  const valor = (p.valorPlan || p.valorOf || 0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
  const dataHoje = new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});

  const htmlDoc = \`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Manifestação Técnica \${numeroProc} - SEDUC-RO</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 25mm 20mm 20mm 25mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .page-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .header-timbre {
      text-align: center;
      margin-bottom: 22px;
      border-bottom: 2px solid #000000;
      padding-bottom: 12px;
    }
    .header-timbre h1 {
      font-size: 12pt;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-timbre h2 {
      font-size: 11pt;
      font-weight: bold;
      margin: 3px 0;
      text-transform: uppercase;
    }
    .header-timbre p {
      font-size: 9.5pt;
      margin: 2px 0 0 0;
    }
    .doc-title {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      margin: 18px 0 14px 0;
      text-transform: uppercase;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .meta-table td, .meta-table th {
      border: 1px solid #000000;
      padding: 5px 8px;
    }
    .meta-table th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
      width: 28%;
    }
    .paragrafo {
      text-align: justify;
      text-indent: 1.25cm;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .assinatura-box {
      margin-top: 45px;
      text-align: center;
      page-break-inside: avoid;
    }
    .linha-assinatura {
      width: 280px;
      margin: 0 auto 6px auto;
      border-top: 1px solid #000000;
    }
    .rodape {
      margin-top: 35px;
      font-size: 8pt;
      text-align: center;
      color: #444;
      border-top: 1px solid #ddd;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="page-container">
    
    <!-- BANNER TIMBRE OFICIAL -->
    <div class="header-timbre">
      <h1>Governo do Estado de Rondônia</h1>
      <h2>Secretaria de Estado da Educação — SEDUC</h2>
      <p>Coordenadoria de Articulação com os Municípios — CAM / GDSM</p>
    </div>

    <!-- TÍTULO DA MANIFESTAÇÃO -->
    <div class="doc-title">
      MANIFESTAÇÃO TÉCNICA Nº \${numeroProc.replace(/[^0-9\\/]/g,'') || '2026'}/SEDUC-CAM
    </div>

    <!-- RESUMO DE DADOS DO PROCESSO / PRESTAÇÃO DE CONTAS TCE-RO -->
    <table class="meta-table">
      <tr>
        <th>PROCESSO Nº:</th>
        <td>\${numeroProc}</td>
        <th>MUNICÍPIO:</th>
        <td>\${municipio}</td>
      </tr>
      <tr>
        <th>INTERESSADO / ESCOLA:</th>
        <td colspan="3">\${escola}</td>
      </tr>
      <tr>
        <th>Nº OFÍCIO DA ESCOLA:</th>
        <td>\${oficioNum}</td>
        <th>CATEGORIA / TIPO:</th>
        <td>\${tipoDesc}</td>
      </tr>
      <tr>
        <th>VALOR PLANILHA:</th>
        <td>R$ \${valor}</td>
        <th>DATA DE EMISSÃO:</th>
        <td>\${dataHoje}</td>
      </tr>
    </table>

    <!-- CONTEÚDO LEGAL JUSTIFICADO DO MANIFESTO -->
    <div style="font-size: 11pt; line-height: 1.5;">
      \${textoLegal.split('\\n\\n').map(p => {
        if (p.startsWith('MANIFESTAÇÃO')) return '';
        return '<p class="paragrafo">' + p.trim() + '</p>';
      }).join('')}
    </div>

    <!-- ASSINATURA -->
    <div class="assinatura-box">
      <div class="linha-assinatura"></div>
      <div style="font-weight: bold; font-size: 11pt;">Coordenadoria de Articulação com os Municípios (CAM)</div>
      <div style="font-size: 10pt; color: #333;">SEDUC / Governo do Estado de Rondônia</div>
    </div>

    <!-- RODAPÉ -->
    <div class="rodape">
      Documento Oficial de Prestação de Contas — Aplicação do Percentual Constitucional de 25% na Educação (TCE-RO / Lei Est. 5.735/2024)
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>\`;

  const win = window.open('', '_blank');
  win.document.write(htmlDoc);
  win.document.close();
}

window.gerarTextoManifestoTCE         = gerarTextoManifestoTCE;
window.gerarEExibirManifestoTCEAtual  = gerarEExibirManifestoTCEAtual;
window.abrirModalManifestoTCEById     = abrirModalManifestoTCEById;
window.abrirModalManifestoTCE         = abrirModalManifestoTCE;
window.fecharModalManifestoTCE        = fecharModalManifestoTCE;
window.copiarManifestoTCE             = copiarManifestoTCE;
window.imprimirManifestoTCE           = imprimirManifestoTCE;
`;

const targetIdx = code.indexOf('function gerarTextoManifestoTCE');
if (targetIdx > -1) {
  code = code.substring(0, targetIdx) + updatedFunctions;
  fs.writeFileSync(appJsPath, code, 'utf8');
  console.log('js/app.js updated with official A4 document generation in imprimirManifestoTCE.');
}
