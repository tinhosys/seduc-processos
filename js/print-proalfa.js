
function getFilteredProalfaData() {
  const filterSuper = document.getElementById('proalfa-super').value;
  const filterMun = document.getElementById('proalfa-municipio').value;
  const filterDist = document.getElementById('proalfa-distrito').value;
  const filterDep = document.getElementById('proalfa-dep').value;
  const busca = document.getElementById('proalfa-busca').value.toLowerCase();

  const applyFilters = (row) => {
    if(filterSuper && row[0] !== filterSuper) return false;
    if(filterMun && row[1] !== filterMun) return false;
    if(filterDist && row[2] !== filterDist) return false;
    if(filterDep && row[5] !== filterDep) return false;
    if(busca) {
      const text = row.join(' ').toLowerCase();
      if(!text.includes(busca)) return false;
    }
    return true;
  };

  return {
    docMun: (proalfaData['Docentes_Rede_Municipal_2025'] || []).filter(applyFilters),
    docEst: (proalfaData['Docentes_Rede_Est.2025-EF-AI'] || []).filter(applyFilters),
    aluMun: (proalfaData['Matrículas_Municipal_2025'] || []).filter(applyFilters),
    aluEst: (proalfaData['Matrículas_Estadual_2025-EF-AI'] || []).filter(applyFilters)
  };
}

function openPrintWindow(contentHtml, title) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>${title}</title>
      <style>
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th, td { border: 1px solid #ccc; padding: 6px 4px; text-align: right; }
        th { background-color: #e2e8f0; font-weight: bold; text-align: center; }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .header-title { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; font-size: 16px; font-weight: bold; }
        .sub-header { text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 5px; }
        .bg-blue { background-color: #93c5fd !important; }
        .bg-light-blue { background-color: #bfdbfe !important; }
        .striped tr:nth-child(even) { background-color: #f8fafc; }
      </style>
    </head>
    <body>
      ${contentHtml}
      <script>
        setTimeout(() => { window.print(); }, 500);
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function imprimirCenso() {
  const data = getFilteredProalfaData();
  const allAlunos = [...data.aluMun, ...data.aluEst];
  
  // Sort by Municipality, then School
  allAlunos.sort((a, b) => {
    if (a[1] !== b[1]) return (a[1] || '').localeCompare(b[1] || '');
    return (a[4] || '').localeCompare(b[4] || '');
  });

  let tableRows = '';
  let grandTotalEsc = 0;
  let grandTotalAlu = 0;
  
  contatosDataFiltrados.forEach(c => {
    let esc = 0; let alu = 0;
    if (typeof calcularAgregados === 'function') {
      const ag = calcularAgregados(c.municipio);
      esc = ag.escolas;
      alu = ag.alunos;
    }
    grandTotalEsc += esc;
    grandTotalAlu += alu;
    
    tableRows += `
      <tr>
        <td class="text-left" style="font-weight:bold;">${c.municipio || '-'}</td>
        <td class="text-left">
           <strong>${c.nomePrefeito || '-'}</strong><br>
           <span style="color:#555;">${c.celularPrefeito || 'Não informado'}</span>
        </td>
        <td class="text-left">
           <strong>${c.nomeSecretario || '-'}</strong><br>
           <span style="color:#555;">${c.celularSecretario || 'Não informado'}</span>
        </td>
        <td class="text-left">${c.email || '-'}</td>
        <td class="text-center">${esc}</td>
        <td class="text-center">${alu.toLocaleString('pt-BR')}</td>
      </tr>
    `;
  });
  
  // Total Row
  tableRows += `
    <tr style="background:#e2e8f0; font-weight:bold; font-size:14px; border-top: 2px solid #cbd5e1;">
      <td colspan="4" class="text-right" style="padding: 10px; text-transform: uppercase;">Total Geral:</td>
      <td class="text-center" style="padding: 10px;">${grandTotalEsc}</td>
      <td class="text-center" style="padding: 10px;">${grandTotalAlu.toLocaleString('pt-BR')}</td>
    </tr>
  `;
  
  const content = `
    <div style="text-align:center; margin-bottom:15px;"><img src="img/logos_proalfa.png" style="max-height: 60px;" /></div>
    <div class="header-title">
      <span>Memória Cálculo_ARP Mat Gráfico</span>
      <span>Censo Escolar 2025</span>
    </div>
    <div class="sub-header">ESCOLAS E ALUNOS ATENDIDOS</div>
    <table class="striped">
      <thead>
        <tr>
          <th class="bg-blue" rowspan="2">SUPER responsável</th>
          <th class="bg-blue" rowspan="2">Município</th>
          <th class="bg-blue" rowspan="2">Dependência Administrativa</th>
          <th class="bg-blue" rowspan="2">Localização</th>
          <th class="bg-blue" rowspan="2">Código da Escola</th>
          <th class="bg-blue" rowspan="2">Nome da Escola</th>
          <th class="bg-blue" rowspan="2">Tipo</th>
          <th class="bg-light-blue" colspan="6"></th>
        </tr>
        <tr>
          <th class="bg-light-blue">Total</th>
          <th class="bg-light-blue">1º ano</th>
          <th class="bg-light-blue">2º ano</th>
          <th class="bg-light-blue">3º ano</th>
          <th class="bg-light-blue">4º ano</th>
          <th class="bg-light-blue">5º ano</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.length > 0 ? tableRows : '<tr><td colspan="13" class="text-center">Nenhum dado encontrado</td></tr>'}
      </tbody>
    </table>
  `;

  openPrintWindow(content, 'I - CENSO ESCOLAR');
}

function imprimirProfessores() {
  const data = getFilteredProalfaData();
  
  // Aggregate by Municipality
  const agg = {};
  
  const processData = (arr, isMun) => {
    arr.forEach(r => {
      const mun = r[1] || 'INDEFINIDO';
      const superVal = r[0] || '-';
      if (!agg[mun]) {
        agg[mun] = {
          super: superVal,
          mun1: 0, mun2: 0, mun3: 0, mun4: 0, mun5: 0,
          est1: 0, est2: 0, est3: 0, est4: 0, est5: 0
        };
      }
      if (isMun) {
        agg[mun].mun1 += Number(r[11]||0);
        agg[mun].mun2 += Number(r[12]||0);
        agg[mun].mun3 += Number(r[13]||0);
        agg[mun].mun4 += Number(r[14]||0);
        agg[mun].mun5 += Number(r[15]||0);
      } else {
        agg[mun].est1 += Number(r[11]||0);
        agg[mun].est2 += Number(r[12]||0);
        agg[mun].est3 += Number(r[13]||0);
        agg[mun].est4 += Number(r[14]||0);
        agg[mun].est5 += Number(r[15]||0);
      }
    });
  };

  processData(data.docMun, true);
  processData(data.docEst, false);

  const sortedMuns = Object.keys(agg).sort();
  
  let totM1=0, totM2=0, totM3=0, totM4=0, totM5=0;
  let totE1=0, totE2=0, totE3=0, totE4=0, totE5=0;

  let tableRows = '';
  sortedMuns.forEach(mun => {
    const row = agg[mun];
    totM1 += row.mun1; totM2 += row.mun2; totM3 += row.mun3; totM4 += row.mun4; totM5 += row.mun5;
    totE1 += row.est1; totE2 += row.est2; totE3 += row.est3; totE4 += row.est4; totE5 += row.est5;
    
    tableRows += `
      <tr>
        <td class="text-left">${mun}</td>
        <td class="text-left">${row.super}</td>
        <td>${String(row.mun1).padStart(2,'0')}</td>
        <td>${String(row.mun2).padStart(2,'0')}</td>
        <td>${String(row.mun3).padStart(2,'0')}</td>
        <td>${String(row.mun4).padStart(2,'0')}</td>
        <td>${String(row.mun5).padStart(2,'0')}</td>
        <td>${String(row.est1).padStart(2,'0')}</td>
        <td>${String(row.est2).padStart(2,'0')}</td>
        <td>${String(row.est3).padStart(2,'0')}</td>
        <td>${String(row.est4).padStart(2,'0')}</td>
        <td>${String(row.est5).padStart(2,'0')}</td>
      </tr>
    `;
  });
  
  const grandTotal = totM1+totM2+totM3+totM4+totM5+totE1+totE2+totE3+totE4+totE5;

  const content = `
    <div style="text-align:center; margin-bottom:15px;"><img src="img/logos_proalfa.png" style="max-height: 60px;" /></div>
    <div class="header-title">
      <span>Memória Cálculo_ARP Mat Gráfico</span>
      <span>Professores - Levant 2025</span>
    </div>
    <table class="striped">
      <thead>
        <tr>
          <th class="bg-blue" rowspan="2" class="text-left">MUNICÍPIO</th>
          <th class="bg-blue" rowspan="2" class="text-left">SUPER</th>
          <th class="bg-light-blue" colspan="5">REDE MUNICIPAL</th>
          <th class="bg-light-blue" colspan="5">REDE ESTADUAL</th>
        </tr>
        <tr>
          <th class="bg-light-blue">PROF. 1º ANO</th>
          <th class="bg-light-blue">PROF. 2º ANO</th>
          <th class="bg-light-blue">PROF. 3º ANO</th>
          <th class="bg-light-blue">PROF. 4º ANO</th>
          <th class="bg-light-blue">PROF. 5º ANO</th>
          <th class="bg-light-blue">PROF. 1º ANO</th>
          <th class="bg-light-blue">PROF. 2º ANO</th>
          <th class="bg-light-blue">PROF. 3º ANO</th>
          <th class="bg-light-blue">PROF. 4º ANO</th>
          <th class="bg-light-blue">PROF. 5º ANO</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.length > 0 ? tableRows : '<tr><td colspan="12" class="text-center">Nenhum dado encontrado</td></tr>'}
        <tr style="font-weight:bold; background-color:#e2e8f0;">
          <td class="text-left" colspan="2">SUBTOTAL</td>
          <td>${totM1}</td>
          <td>${totM2}</td>
          <td>${totM3}</td>
          <td>${totM4}</td>
          <td>${totM5}</td>
          <td>${totE1}</td>
          <td>${totE2}</td>
          <td>${totE3}</td>
          <td>${totE4}</td>
          <td>${totE5}</td>
        </tr>
        <tr style="font-weight:bold; background-color:#fef08a;">
          <td class="text-left" colspan="2">TOTAL (Estado e Municípios)</td>
          <td>${totM1+totE1}</td>
          <td>${totM2+totE2}</td>
          <td>${totM3+totE3}</td>
          <td>${totM4+totE4}</td>
          <td>${totM5+totE5}</td>
          <td colspan="5" class="text-center">Total Geral: ${grandTotal}</td>
        </tr>
      </tbody>
    </table>
  `;

  openPrintWindow(content, 'II - RELAÇÃO DE PROFESSORES');
}

function imprimirMemoria() {
  const data = getFilteredProalfaData();
  
  const sumCol = (arr, idx) => arr.reduce((acc, r) => acc + Number(r[idx]||0), 0);
  
  // Alunos (idx 10 to 14 in Matrículas array)
  const a1 = sumCol(data.aluMun, 10) + sumCol(data.aluEst, 10);
  const a2 = sumCol(data.aluMun, 11) + sumCol(data.aluEst, 11);
  const a3 = sumCol(data.aluMun, 12) + sumCol(data.aluEst, 12);
  const a4 = sumCol(data.aluMun, 13) + sumCol(data.aluEst, 13);
  const a5 = sumCol(data.aluMun, 14) + sumCol(data.aluEst, 14);
  
  // Professores (idx 11 to 15 in Docentes array)
  const p1 = sumCol(data.docMun, 11) + sumCol(data.docEst, 11);
  const p2 = sumCol(data.docMun, 12) + sumCol(data.docEst, 12);
  const p3 = sumCol(data.docMun, 13) + sumCol(data.docEst, 13);
  const p4 = sumCol(data.docMun, 14) + sumCol(data.docEst, 14);
  const p5 = sumCol(data.docMun, 15) + sumCol(data.docEst, 15);
  
  const profAlf = p1 + p2 + p3;

  const rows = [
    { mat: 'Caderno de atividades - para casa', alvo: '1º ano - Alunos', pub: a1, pags: 124, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '1º ano - Alunos', pub: a1, pags: 144, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '1º ano - Alunos', pub: a1, pags: 104, ac: 'CANOA' },
    { mat: 'Caderno com descrições de aprendizagem', alvo: '1º ano - Professores', pub: p1, pags: 28, ac: 'CANOA' },
    { mat: 'Caderno de atividades - para casa', alvo: '1º ano - Professores', pub: p1, pags: 124, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '1º ano - Professores', pub: p1, pags: 144, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '1º ano - Professores', pub: p1, pags: 104, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno', alvo: '2º ano - Alunos', pub: a2, pags: 212, ac: 'CANOA' },
    { mat: 'Caderno com descrições de aprendizagem', alvo: '2º ano - Professores', pub: p2, pags: 28, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno', alvo: '2º ano - Professores', pub: p2, pags: 212, ac: 'CANOA' },
    { mat: 'Caderno de atividades - para casa', alvo: '3º ano - Alunos', pub: a3, pags: 124, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '3º ano - Alunos', pub: a3, pags: 144, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '3º ano - Alunos', pub: a3, pags: 104, ac: 'CANOA' },
    { mat: 'Caderno com descrições de aprendizagem', alvo: '3º ano - Professores', pub: p3, pags: 28, ac: 'CANOA' },
    { mat: 'Caderno de atividades - para casa', alvo: '3º ano - Professores', pub: p3, pags: 124, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '3º ano - Professores', pub: p3, pags: 144, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '3º ano - Professores', pub: p3, pags: 104, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '4º ano - Alunos', pub: a4, pags: 140, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '4º ano - Alunos', pub: a4, pags: 140, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '4º ano - Professores', pub: p4, pags: 48, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '4º ano - Professores', pub: p4, pags: 48, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '5º ano - Alunos', pub: a5, pags: 140, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '5º ano - Alunos', pub: a5, pags: 140, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - para casa', alvo: '5º ano - Alunos', pub: a5, pags: 140, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 1', alvo: '5º ano - Professores', pub: p5, pags: 48, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - livro 2', alvo: '5º ano - Professores', pub: p5, pags: 48, ac: 'CANOA' },
    { mat: 'Caderno de atividades do aluno - para casa', alvo: '5º ano - Professores', pub: p5, pags: 48, ac: 'CANOA' },
    { mat: 'Caderno de orientações didáticas + Leitura em Voz Alta', alvo: 'Professores alfabetizadores (1º ao 3º ano)', pub: profAlf, pags: 100, ac: 'PUR' }
  ];

  let tableRows = '';
  let totPub = 0, totPub30 = 0, totCapa = 0, totContra = 0, totMiolo = 0, totPur = 0, totCanoa = 0;

  rows.forEach(r => {
    const pub30 = Math.ceil(r.pub * 1.3);
    const capa = pub30;
    const contra = pub30;
    const miolo = pub30 * r.pags;
    const pur = r.ac === 'PUR' ? pub30 : 0;
    const canoa = r.ac === 'CANOA' ? pub30 : 0;

    totPub += r.pub;
    totPub30 += pub30;
    totCapa += capa;
    totContra += contra;
    totMiolo += miolo;
    totPur += pur;
    totCanoa += canoa;

    const f = (n) => n === 0 ? '' : n.toLocaleString('pt-BR');

    tableRows += `
      <tr>
        <td class="text-left">${r.mat}</td>
        <td class="text-left">${r.alvo}</td>
        <td>${f(r.pub)}</td>
        <td>${f(pub30)}</td>
        <td>${r.pags}</td>
        <td>${f(capa)}</td>
        <td>${f(contra)}</td>
        <td>${f(miolo)}</td>
        <td>${f(pur)}</td>
        <td>${f(canoa)}</td>
      </tr>
    `;
  });

  const f = (n) => n === 0 ? '' : n.toLocaleString('pt-BR');

  const content = `
    <div style="text-align:center; margin-bottom:15px;"><img src="img/logos_proalfa.png" style="max-height: 60px;" /></div>
    <div class="header-title">
      <span class="text-left" style="font-size:12px;">GOVERNO DO ESTADO DE RONDÔNIA<br>SECRETARIA DE ESTADO DA EDUCAÇÃO<br>COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS</span>
      <span style="font-size:16px;">Memória em 2025 p 2026</span>
    </div>
    <table class="striped">
      <thead>
        <tr>
          <th class="bg-blue" style="text-align:center;">Material</th>
          <th class="bg-blue" style="text-align:center;">Público alvo</th>
          <th class="bg-blue">Público</th>
          <th class="bg-blue">Público+30%</th>
          <th class="bg-blue">Qntd. páginas previstas</th>
          <th class="bg-blue">Capa</th>
          <th class="bg-blue">Contracapa</th>
          <th class="bg-blue">Página miolo</th>
          <th class="bg-blue">Acabamento PUR</th>
          <th class="bg-blue">Acabamento CANOA</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr style="font-weight:bold; background-color:#e2e8f0;">
          <td colspan="2" class="text-center">TOTAIS</td>
          <td>${f(totPub)}</td>
          <td>${f(totPub30)}</td>
          <td>-</td>
          <td>${f(totCapa)}</td>
          <td>${f(totContra)}</td>
          <td>${f(totMiolo)}</td>
          <td>${f(totPur)}</td>
          <td>${f(totCanoa)}</td>
        </tr>
      </tbody>
    </table>
    <div style="font-size:10px; margin-top:10px; font-weight:bold;">
      FONTE PRIMÁRIA: Alunos e Professores: Planilha '1º ao 5º ano - Rede Estadual e Municipal - Quantitativo de Matrículas e Docentes em 2025'.
    </div>
  `;

  openPrintWindow(content, 'III - MEMÓRIA DE CÁLCULO CONSOLIDADA');
}

function imprimirContatos() {
  if (typeof contatosDataFiltrados === 'undefined' || !contatosDataFiltrados) {
    alert("Dados não carregados ainda.");
    return;
  }
  
  let tableRows = '';
  
  contatosDataFiltrados.forEach(c => {
    // We calculate aggregations again, or assume they are stored.
    let esc = 0; let alu = 0;
    if (typeof calcularAgregados === 'function') {
      const ag = calcularAgregados(c.municipio);
      esc = ag.escolas;
      alu = ag.alunos;
    }
    
    tableRows += `
      <tr>
        <td class="text-left" style="font-weight:bold;">${c.municipio || '-'}</td>
        <td class="text-left">
           <strong>${c.nomePrefeito || '-'}</strong><br>
           <span style="color:#555;">${c.celularPrefeito || 'Não informado'}</span>
        </td>
        <td class="text-left">
           <strong>${c.nomeSecretario || '-'}</strong><br>
           <span style="color:#555;">${c.celularSecretario || 'Não informado'}</span>
        </td>
        <td class="text-left">${c.email || '-'}</td>
        <td class="text-center">${esc}</td>
        <td class="text-center">${alu.toLocaleString('pt-BR')}</td>
      </tr>
    `;
  });
  
  const content = `
    <div class="header-title">
      <span class="text-left" style="font-size:12px;">GOVERNO DO ESTADO DE RONDÔNIA<br>SECRETARIA DE ESTADO DA EDUCAÇÃO<br>COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS</span>
      </div>
    <table class="striped">
      <thead>
        <tr>
          <th class="bg-blue" style="width:15%; text-align:center;">Município</th>
          <th class="bg-blue" style="width:23%; text-align:center;">Prefeito(a)</th>
          <th class="bg-blue" style="width:23%; text-align:center;">Secretário(a)</th>
          <th class="bg-blue" style="width:23%; text-align:center;">E-mail</th>
          <th class="bg-blue" style="width:8%; text-align:center;">Escolas</th>
          <th class="bg-blue" style="width:8%; text-align:center;">Alunos</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.length > 0 ? tableRows : '<tr><td colspan="6" class="text-center">Nenhum dado encontrado</td></tr>'}
      </tbody>
    </table>
  `;

  openPrintWindow(content, 'Relatório Governo + CAM');
}
