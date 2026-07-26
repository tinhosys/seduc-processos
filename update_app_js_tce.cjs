const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'js', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. Add fields population in renderFormulario
const renderFormTarget = "setVal('form-demaisObservacoes', p.demaisObservacoes);";
const renderFormExtra = `
    setVal('form-oficioNumero', p.oficioNumero);
    setVal('form-metragemM2', p.metragemM2);
    setVal('form-detalhamentoItens', p.detalhamentoItens);`;

if (!code.includes("setVal('form-oficioNumero'")) {
  code = code.replace(renderFormTarget, renderFormTarget + renderFormExtra);
}

// 2. Add fields saving in salvarFormulario
const salvarFormTarget = "demaisObservacoes: document.getElementById('form-demaisObservacoes')?.value.trim() || '',";
const salvarFormExtra = `
    oficioNumero:       document.getElementById('form-oficioNumero')?.value.trim() || '',
    metragemM2:         document.getElementById('form-metragemM2')?.value.trim() || '',
    detalhamentoItens:  document.getElementById('form-detalhamentoItens')?.value.trim() || '',`;

if (!code.includes("oficioNumero:")) {
  code = code.replace(salvarFormTarget, salvarFormTarget + salvarFormExtra);
}

// 3. Add Manifesto TCE generator functions
const manifestoFunctions = `
// ============================================================
// SEDUC — Gerador de Manifestação Técnica & Relatório Sintético TCE-RO
// ============================================================

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
    banheiros: g('form-banheiros')
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
  const preview = document.getElementById('manifesto-tce-texto-preview');
  if (!preview) return;
  const win = window.open('', '_blank');
  win.document.write(\`
    <html>
      <head>
        <title>Manifestação Técnica TCE-RO</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; margin: 40px; color: #000; }
          .title { font-weight: bold; text-align: center; font-size: 16pt; margin-bottom: 30px; }
          .content { white-space: pre-wrap; text-align: justify; text-justify: inter-word; }
        </style>
      </head>
      <body>
        <div class="content">\${preview.textContent}</div>
        <script>window.print();</script>
      </body>
    </html>
  \`);
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

if (!code.includes('gerarTextoManifestoTCE')) {
  code = code + '\n' + manifestoFunctions;
}

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('js/app.js updated with Manifesto TCE-RO functions.');
