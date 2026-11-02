/* ==========================================================================
   SEDUC/CAM - MÓDULO EXCLUSIVO DE RELATÓRIOS PARA IMPRESSÃO (A4 RETRATO)
   Totalmente isolado do formulário de cadastro.
   Acionado exclusivamente pelos botões de impressão:
   - "🖨️ Imprimir Lista" (Relatório consolidado de escolas sincronizadas)
   - "📄 Imprimir" (Ficha individual de cada linha da tabela de escolas)
   ========================================================================== */

(function(window) {
  'use strict';

  // 1. Função para filtrar SOMENTE os registros sincronizados aos parâmetros ativos
  function obterEscolasSincronizadasParametros() {
    let lista = (window._escolasMunicipioCache && window._escolasMunicipioCache.length > 0)
      ? [...window._escolasMunicipioCache]
      : [];

    if (lista.length === 0) {
      const pools = [];
      if (typeof window._escolasCache !== 'undefined' && Array.isArray(window._escolasCache) && window._escolasCache.length > 0) {
        pools.push(window._escolasCache);
      }
      try {
        const locais = JSON.parse(localStorage.getItem('seduc_entidades_cadastradas_local') || '[]');
        if (Array.isArray(locais) && locais.length > 0) pools.push(locais);
      } catch(e) {}

      const mapa = new Map();
      pools.forEach(arr => {
        arr.forEach(esc => {
          const key = (esc.id || esc.nome || '') + '_' + (esc.municipio || '');
          if (!mapa.has(key)) mapa.set(key, esc);
        });
      });
      lista = Array.from(mapa.values());
    }

    // Parâmetros vinculados ativos
    const munAtual = window._municipioAtual || '';
    const catAtual = window._categoriaAtual || '';
    const compAtual = window._competenciaAtual || '';
    const superAtual = window._superAtual || '';

    const nMun = munAtual.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nCat = catAtual.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nComp = compAtual.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nSuper = superAtual.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const isTodosMun = !nMun || nMun === 'todos' || nMun.includes('todos');
    const isTodosCat = !nCat || nCat === 'todos' || nCat.includes('todas');
    const isTodosComp = !nComp || nComp === 'todos' || nComp.includes('todas');
    const isTodosSuper = !nSuper || nSuper === 'todos' || nSuper.includes('todas');

    return lista.filter(esc => {
      const escMun = (esc.municipio || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const escCat = (esc.categoria || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const escComp = (esc.competencia || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const escSuper = (esc.super || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Filtro Município
      if (!isTodosMun) {
        const bateMun = window._municipiosPermitidos && window._municipiosPermitidos.length > 0
          ? window._municipiosPermitidos.some(m => {
              const mClean = m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return escMun === mClean || escMun.includes(mClean) || mClean.includes(escMun);
            })
          : (escMun.includes(nMun) || nMun.includes(escMun));
        if (!bateMun) return false;
      }

      // Filtro Categoria
      if (!isTodosCat) {
        if (nCat.includes('conselho')) {
          if (escCat && !escCat.includes('conselho') && !escCat.includes('escola')) return false;
        } else if (nCat.includes('prefeitura')) {
          if (!escCat.includes('prefeitura')) return false;
        } else if (nCat.includes('apae')) {
          if (!escCat.includes('apae')) return false;
        } else if (nCat.includes('efa') || nCat.includes('agricola') || nCat.includes('agrícola')) {
          if (!escCat.includes('efa') && !escCat.includes('agricola')) return false;
        }
      }

      // Filtro Competência
      if (!isTodosComp) {
        if (nComp.includes('municipal') && !escComp.includes('municipal')) return false;
        if (nComp.includes('estadual') && !escComp.includes('estadual')) return false;
        if (nComp.includes('federal') && !escComp.includes('federal')) return false;
        if (nComp.includes('privada') && !escComp.includes('privada')) return false;
      }

      // Filtro SUPER
      if (!isTodosSuper) {
        const cleanSup = nSuper.replace(/^super\s*-\s*/i, '').replace(/^super\s+/i, '').replace(/^cre\s*-\s*/i, '').trim();
        const cleanEscSup = escSuper.replace(/^super\s*-\s*/i, '').replace(/^super\s+/i, '').replace(/^cre\s*-\s*/i, '').trim();
        if (cleanSup && cleanEscSup && !cleanEscSup.includes(cleanSup) && !cleanSup.includes(cleanEscSup)) return false;
      }

      return true;
    });
  }

  // 2. Atalho para impressão individual a partir do clique na linha da tabela
  function imprimirRelatorioLinha(jsonEncoded) {
    try {
      const esc = JSON.parse(decodeURIComponent(jsonEncoded));
      imprimirRelatorioRegistroAtual(esc);
    } catch(e) {
      console.error('Erro ao decodificar dados da escola para impressão:', e);
      if (typeof window.exibirMensagemSiSCAM === 'function') {
        window.exibirMensagemSiSCAM('Não foi possível processar os dados desta escola para impressão.', { tipo: 'erro' });
      } else {
        alert('Não foi possível processar os dados desta escola para impressão.');
      }
    }
  }

  // 3. Ficha Cadastral Individual Completa (A4 - 1 Folha)
  function imprimirRelatorioRegistroAtual(escolaObj) {
    const esc = escolaObj || (typeof window.obterDadosEscolaAtual === 'function' ? window.obterDadosEscolaAtual() : null);
    if (!esc || !esc.nome) {
      const msg = 'Nenhuma escola selecionada ou preenchida no formulário.\nPreencha os dados da escola ou clique em ✏️ Editar na tabela para emitir a Ficha Cadastral Individual.';
      if (typeof window.exibirMensagemSiSCAM === 'function') {
        window.exibirMensagemSiSCAM(msg, { tipo: 'aviso', subtitulo: 'Ficha Cadastral Individual' });
      } else {
        alert(msg);
      }
      return;
    }

    const agora = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dataHoraStr = `${pad(agora.getDate())}/${pad(agora.getMonth() + 1)}/${agora.getFullYear()} às ${pad(agora.getHours())}:${pad(agora.getMinutes())}:${pad(agora.getSeconds())}`;
    const bannerUrl = new URL('img/banner-cam-topo.png?v=1.3.89', window.location.href).href;

    const pCodeLink = esc.plusCode
      ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(esc.plusCode)}" target="_blank" style="color:#0284c7; text-decoration:underline; font-weight:700;">${esc.plusCode} ↗ (Google Maps)</a>`
      : '-';

    const win = window.open('', '_blank');
    if (!win) {
      const msgPop = 'O navegador bloqueou a abertura da janela de impressão. Por favor, permita pop-ups para este site.';
      if (typeof window.exibirMensagemSiSCAM === 'function') {
        window.exibirMensagemSiSCAM(msgPop, { tipo: 'aviso', subtitulo: 'Bloqueio de Impressão' });
      } else {
        alert(msgPop);
      }
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>SEDUC/CAM - Ficha Cadastral - ${esc.nome}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, -apple-system, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      line-height: 1.25;
      font-size: 8.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 99999;
      background: #090e17;
      color: #ffffff;
      padding: 8px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    .btn-print {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-print:hover { background: #059669; }
    .btn-fechar {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11.5px;
      cursor: pointer;
    }
    .btn-fechar:hover { background: #ef4444; color: #fff; }

    /* CABEÇALHO OFICIAL: LOGO CAM 10cm COM PROPORÇÃO DE ALTURA (PNG SEM FUNDO PRETO) */
    .report-paper {
      width: 210mm;
      min-height: 297mm;
      max-width: 96vw;
      margin: 15px auto 30px auto;
      background: #ffffff;
      padding: 10mm 12mm 12mm 12mm;
      box-sizing: border-box;
      box-shadow: 0 4px 25px rgba(0,0,0,0.3);
      border-radius: 4px;
    }
    .report-banner-wrap {
      width: 100%;
      margin: 0 auto 6px auto;
      text-align: center;
      background: transparent;
    }
    .report-banner-img {
      width: 10cm !important;
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
      margin: 0 auto !important;
      object-fit: contain !important;
      background: transparent !important;
    }

    /* CARD DE TÍTULO SÓBRIO E PROFISSIONAL (SEM FUNDO PRETO) */
    .report-title-card {
      border-top: 2px solid #0284c7;
      border-bottom: 1.5px solid #cbd5e1;
      background: #f8fafc;
      padding: 5px 8px;
      margin-bottom: 6px;
      text-align: center;
    }
    .report-title-main {
      font-size: 10.5pt;
      font-weight: 900;
      letter-spacing: 0.3px;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .report-meta-text {
      font-size: 7.6pt;
      color: #334155;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .report-meta-text .sep {
      color: #94a3b8;
    }

    .section-block {
      margin-bottom: 5px;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .section-header {
      background: #f1f5f9;
      color: #0f172a;
      padding: 3px 8px;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border-bottom: 1.5px solid #cbd5e1;
      border-left: 4px solid #0284c7;
      display: flex;
      align-items: center;
    }
    .data-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: #cbd5e1;
      padding: 0;
    }
    .data-cell {
      background: #ffffff;
      padding: 2.5px 6px;
    }
    .data-cell.span-2 { grid-column: span 2; }
    .data-cell.span-3 { grid-column: span 3; }
    .data-cell.span-all { grid-column: 1 / -1; }
    .cell-label {
      font-size: 6pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 1px;
      display: block;
      line-height: 1.1;
    }
    .cell-val {
      font-size: 7.5pt;
      font-weight: 600;
      color: #0f172a;
      word-break: break-word;
      line-height: 1.2;
    }
    .cell-val.destaque {
      color: #0284c7;
      font-weight: 800;
      font-size: 8pt;
    }

    .signatures-block {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      margin-top: 32px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      gap: 30px;
    }
    .sig-box {
      flex: 1;
      max-width: 44%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .sig-space {
      height: 55px;
      width: 100%;
    }
    .sig-line {
      width: 100%;
      border-top: 1.5px solid #334155;
      padding-top: 5px;
      text-align: center;
    }
    .sig-name {
      font-size: 8.2pt;
      color: #0f172a;
      font-weight: 800;
      line-height: 1.2;
    }
    .sig-role {
      font-size: 7pt;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }

    /* RODAPÉ PADRÃO SEDUC / CAM */
    .report-footer {
      border-top: 1.5px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7pt;
      color: #475569;
      font-weight: 600;
    }

    @media print {
      .no-print-bar { display: none !important; }
      body {
        background: #ffffff !important;
        font-size: 7.5pt;
        line-height: 1.18;
      }
      html, body {
        background: #ffffff !important;
        font-size: 7.2pt;
        line-height: 1.15;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
      }
      .report-paper {
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
      }
      .report-banner-wrap {
        width: 100% !important;
        margin: 0 auto 5px auto !important;
        text-align: center !important;
        background: transparent !important;
      }
      .report-banner-img {
        width: 10cm !important;
        max-width: 10cm !important;
        height: auto !important;
        object-fit: contain !important;
        background: transparent !important;
      }
      .section-block {
        margin-bottom: 4px !important;
        page-break-inside: avoid !important;
      }
      .data-cell {
        padding: 2.2px 5px !important;
      }
      .cell-label {
        font-size: 5.8pt !important;
      }
      .cell-val {
        font-size: 7.3pt !important;
      }
      .signatures-block {
        margin-top: 26px !important;
        margin-bottom: 8px !important;
        gap: 25px !important;
      }
      .sig-space {
        height: 52px !important;
      }
      .sig-line {
        padding-top: 4px !important;
      }
      .sig-name {
        font-size: 8pt !important;
      }
      .sig-role {
        font-size: 6.8pt !important;
      }
      .report-footer {
        margin-top: 10px !important;
        padding-top: 3px !important;
      }
      @page {
        size: A4 portrait;
        margin: 8mm 10mm 10mm 10mm;
      }
    }
  </style>
</head>
<body>

  <!-- BARRA DE AÇÕES (NÃO IMPRIME) -->
  <div class="no-print-bar">
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:15px;">🏛️</span>
      <span style="font-weight:800; font-size:12px; color:#38bdf8;">SEDUC / CAM — FICHA CADASTRAL INDIVIDUAL (A4 - 1 FOLHA)</span>
    </div>
    <div style="display:flex; align-items:center; gap:10px;">
      <button type="button" class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
      <button type="button" class="btn-fechar" onclick="window.close()">✕ Fechar</button>
    </div>
  </div>

  <div class="report-paper">

    <!-- CABEÇALHO OFICIAL: BANNER 170mm COM PROPORÇÃO REAL (IMAGEM 3) -->
    <div class="report-banner-wrap">
      <img src="${bannerUrl}" alt="CAM SEDUC/RO - Coordenadoria de Articulação com os Municípios" class="report-banner-img">
    </div>

    <!-- TÍTULO INSTITUCIONAL E PARÂMETROS ESCRITOS -->
    <div class="report-title-card">
      <h1 class="report-title-main">FICHA CADASTRAL DA UNIDADE ESCOLAR</h1>
      <div class="report-meta-text">
        <span><strong>MUNICÍPIO:</strong> ${(esc.municipio || 'RONDÔNIA').toUpperCase()}</span>
        <span class="sep">•</span>
        <span><strong>CATEGORIA:</strong> ${esc.categoria || 'Conselho Escolar'}</span>
        <span class="sep">•</span>
        <span><strong>COMPETÊNCIA:</strong> ${esc.competencia || 'Municipal'}</span>
        <span class="sep">•</span>
        <span><strong>SUPER:</strong> ${esc.super || window._superAtual || 'Regional'}</span>
      </div>
    </div>

    <!-- 1. IDENTIFICAÇÃO DA ESCOLA / ENTIDADE -->
    <div class="section-block">
      <div class="section-header">🏫 1. Identificação da Entidade / Escola</div>
      <div class="data-grid">
        <div class="data-cell span-2">
          <span class="cell-label">Nome da Escola / Entidade</span>
          <span class="cell-val destaque">${esc.nome || 'Não informada'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Município / Distrito</span>
          <span class="cell-val">${esc.municipio || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Código INEP</span>
          <span class="cell-val" style="font-family:monospace; font-weight:800; color:#0284c7;">${esc.codigoInep || esc.inep || 'Não informado'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">CNPJ Oficial</span>
          <span class="cell-val" style="font-family:monospace; font-weight:700;">${esc.cnpj || 'Não informado'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Total de Matrícula (Alunos)</span>
          <span class="cell-val" style="font-weight:800; color:#059669;">${esc.totalMatricula || esc.alunos || '0'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Superintendência (SUPER)</span>
          <span class="cell-val">${esc.super || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Competência / Esfera</span>
          <span class="cell-val">${esc.competencia || 'Municipal'}</span>
        </div>
        <div class="data-cell span-2">
          <span class="cell-label">Categoria</span>
          <span class="cell-val">${esc.categoria || 'Conselho Escolar'}</span>
        </div>
        <div class="data-cell span-2">
          <span class="cell-label">Modalidades de Ensino Atendidas</span>
          <span class="cell-val">${esc.modalidades || esc.modalidade || 'Geral'}</span>
        </div>
        <div class="data-cell span-all">
          <span class="cell-label">Tipo de Parceria / Vinculação</span>
          <span class="cell-val">${esc.parceria || 'Fomento (Termo de Fomento - F)'}</span>
        </div>
      </div>
    </div>

    <!-- 2. GESTÃO & CONTATOS -->
    <div class="section-block">
      <div class="section-header">👥 2. Gestão, Direção & Contatos</div>
      <div class="data-grid">
        <div class="data-cell span-2">
          <span class="cell-label">Diretor(a) / Gestor(a) Geral</span>
          <span class="cell-val">${esc.diretor || 'Não informado'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Contato Diretor / WhatsApp</span>
          <span class="cell-val">${esc.contatoDiretor || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Telefone da Unidade / Sede</span>
          <span class="cell-val">${esc.telefone || '-'}</span>
        </div>
        <div class="data-cell span-2">
          <span class="cell-label">E-mail Institucional</span>
          <span class="cell-val">${esc.email || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Secretário(a) / SEMED</span>
          <span class="cell-val">${esc.secretario || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Contato do Secretário(a)</span>
          <span class="cell-val">${esc.contatoSecretario || '-'}</span>
        </div>
        <div class="data-cell span-all">
          <span class="cell-label">Redes Sociais Oficiais</span>
          <span class="cell-val">${esc.redesSociais || esc.redes || 'Não possui'}</span>
        </div>
      </div>
    </div>

    <!-- 3. ENDEREÇO & LOCALIZAÇÃO -->
    <div class="section-block">
      <div class="section-header">📍 3. Endereço & Localização Geográfica</div>
      <div class="data-grid">
        <div class="data-cell">
          <span class="cell-label">Localidade</span>
          <span class="cell-val" style="font-weight:700;">${esc.localidade || esc.localizacao || 'Urbana'}</span>
        </div>
        <div class="data-cell span-2">
          <span class="cell-label">Logradouro / Endereço</span>
          <span class="cell-val">${esc.endereco || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Bairro</span>
          <span class="cell-val">${esc.bairro || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">CEP</span>
          <span class="cell-val">${esc.cep || '-'}</span>
        </div>
        <div class="data-cell span-2">
          <span class="cell-label">Complemento / Ponto de Referência</span>
          <span class="cell-val">${esc.complemento || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Zona Rural</span>
          <span class="cell-val">Linha: ${esc.linha || '-'} | Km: ${esc.rodoviaKm || '-'}</span>
        </div>
        <div class="data-cell span-all">
          <span class="cell-label">Código Plus Code / Localização Georreferenciada</span>
          <span class="cell-val">${pCodeLink}</span>
        </div>
      </div>
    </div>

    <!-- 4. INFRAESTRUTURA & ESTRUTURA FÍSICA -->
    <div class="section-block">
      <div class="section-header">🏗️ 4. Infraestrutura & Sistemas Construtivos</div>
      <div class="data-grid">
        <div class="data-cell"><span class="cell-label">Salas de Aula</span><span class="cell-val">${esc.salasAula || esc.salas || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Salas Administrativas</span><span class="cell-val">${esc.salasAdm || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Banheiros</span><span class="cell-val">${esc.banheiros || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Sala de Recursos (AEE)</span><span class="cell-val">${esc.salaAEE || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Pátio Coberto</span><span class="cell-val">${esc.patioCoberto || esc.patio || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Refeitório</span><span class="cell-val">${esc.refeitorio || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Cozinha</span><span class="cell-val">${esc.cozinha || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Biblioteca</span><span class="cell-val">${esc.biblioteca || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Laboratório Info</span><span class="cell-val">${esc.labInfo || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Auditório</span><span class="cell-val">${esc.auditorio || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Depósito / DML</span><span class="cell-val">${esc.depositoGeral || esc.deposito || '0'}</span></div>
        <div class="data-cell"><span class="cell-label">Almoxarifado</span><span class="cell-val">${esc.almoxarifadoAdm || '0'}</span></div>
        <div class="data-cell span-2">
          <span class="cell-label">Quadra Poliesportiva</span>
          <span class="cell-val">${esc.quadra || 'Não possui'}${esc.quadraCoberta ? ' • ' + esc.quadraCoberta : ''}${esc.quadraPiso ? ' (' + esc.quadraPiso + ')' : ''}</span>
        </div>
        <div class="data-cell"><span class="cell-label">Fonte de Água</span><span class="cell-val">${esc.fonteAgua || 'Não informado'}</span></div>
        <div class="data-cell"><span class="cell-label">Energia Solar</span><span class="cell-val">${esc.energiaSolar || 'Não'}</span></div>
        <div class="data-cell"><span class="cell-label">Murada / Gradeada</span><span class="cell-val">${esc.muradaGradeada || 'Não informado'}</span></div>
        <div class="data-cell"><span class="cell-label">Acessibilidade</span><span class="cell-val">${esc.acessibilidade || 'Não informado'}</span></div>
        <div class="data-cell"><span class="cell-label">PPCI (Incêndio)</span><span class="cell-val">${esc.ppci || 'Não informado'}</span></div>
        <div class="data-cell"><span class="cell-label">Tipo de Aberturas</span><span class="cell-val">${esc.tipoAbertura || 'Padrão'}</span></div>
        <div class="data-cell"><span class="cell-label">Tipo de Forro</span><span class="cell-val">${esc.tipoForro || 'Padrão'}</span></div>
        <div class="data-cell"><span class="cell-label">Piso Predial</span><span class="cell-val">${esc.tipoPiso || 'Padrão'}</span></div>
        <div class="data-cell"><span class="cell-label">Cobertura / Telhado</span><span class="cell-val">${esc.tipoTelhado || 'Padrão'}</span></div>
        <div class="data-cell span-all">
          <span class="cell-label">Observações Gerais</span>
          <span class="cell-val">${esc.observacoes || esc.obs || 'Nenhuma observação registrada.'}</span>
        </div>
      </div>
    </div>

    <!-- 5. DADOS DO REGISTRADOR -->
    <div class="section-block">
      <div class="section-header">👤 5. Dados do Responsável pelo Preenchimento (Registrador)</div>
      <div class="data-grid">
        <div class="data-cell span-2">
          <span class="cell-label">Nome do Informante</span>
          <span class="cell-val">${esc.registradorNome || 'Não informado'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Cargo / Função</span>
          <span class="cell-val">${esc.registradorCargo || '-'}</span>
        </div>
        <div class="data-cell">
          <span class="cell-label">Telefone Celular</span>
          <span class="cell-val">${esc.registradorTelefone || '-'}</span>
        </div>
      </div>
    </div>

    <!-- TERMO & ASSINATURAS EXPANDIDAS (AUMENTO DO LOCAL DE ASSINATURA - IMAGEM 3) -->
    <div class="signatures-block">
      <div class="sig-box">
        <div class="sig-space"></div>
        <div class="sig-line">
          <div class="sig-name">${esc.diretor || 'Diretor(a) / Gestor(a) Geral'}</div>
          <div class="sig-role">Assinatura do Responsável pela Entidade / Escola</div>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-space"></div>
        <div class="sig-line">
          <div class="sig-name">${esc.registradorNome || 'Responsável pelo Preenchimento'}</div>
          <div class="sig-role">Validação do Cadastro • SEDUC/CAM</div>
        </div>
      </div>
    </div>

    <!-- RODAPÉ OFICIAL -->
    <div class="report-footer">
      <div>SEDUC / CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICIPIOS</div>
      <div>${dataHoraStr}</div>
      <div>Página 1 de 1</div>
    </div>

  </div>

</body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(function() {
      try {
        win.focus();
        win.print();
      } catch(e) {
        console.error('Erro ao acionar impressao automatica:', e);
      }
    }, 400);
  }

  // 4. Relatório Consolidado de Escolas Sincronizadas (A4 Retrato - Agrupado por Município) (IMAGEM 4 E IMAGEM 5)
  function imprimirRelatorioLista() {
    let lista = [];

    // 1. Coleta escolas prioritariamente a partir do checklist da tabela exibida (IMAGEM 4 / IMAGEM 5)
    const checkboxesLinha = document.querySelectorAll('#tbody-escolas .chk-escola-linha');
    if (checkboxesLinha && checkboxesLinha.length > 0) {
      const chksMarcados = document.querySelectorAll('#tbody-escolas .chk-escola-linha:checked');
      if (chksMarcados.length === 0) {
        const msgAviso = 'Nenhuma escola selecionada no checklist da tabela.\n\nPor favor, marque pelo menos uma escola na lista antes de imprimir.';
        if (typeof window.exibirMensagemSiSCAM === 'function') {
          window.exibirMensagemSiSCAM(msgAviso, { tipo: 'aviso', subtitulo: 'Checklist de Impressão' });
        } else {
          alert(msgAviso);
        }
        return;
      }
      chksMarcados.forEach(cb => {
        try {
          if (cb.dataset.escolaJson) {
            lista.push(JSON.parse(decodeURIComponent(cb.dataset.escolaJson)));
          }
        } catch (e) {
          console.error('Erro ao ler escola do checkbox:', e);
        }
      });
    }

    // 2. Se a tabela não tiver checkboxes ou lista vazia, recorre a obterEscolasSincronizadasParametros()
    if (lista.length === 0) {
      lista = obterEscolasSincronizadasParametros();
    }

    if (lista.length === 0) {
      const munTxt = window._municipioAtual || 'Todos';
      const catTxt = window._categoriaAtual || 'Conselho Escolar';
      const compTxt = window._competenciaAtual || 'Municipal';
      const superTxt = window._superAtual || 'Geral';

      const msgHtml = `
        <div style="margin-bottom:12px;">
          <div style="font-size:14px; font-weight:800; color:#38bdf8; margin-bottom:8px;">
            📋 Emissão de Relatório de Escolas
          </div>
          <div style="color:#cbd5e1; font-size:13px; line-height:1.5;">
            Nenhum registro cadastrado e sincronizado foi localizado para os parâmetros vinculados selecionados:
          </div>
        </div>
        <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:10px 14px; margin-bottom:12px; font-size:12.5px; line-height:1.8;">
          <div>• <strong style="color:#f8fafc;">Município:</strong> <span style="color:#fef08a; font-weight:700;">${munTxt}</span></div>
          <div>• <strong style="color:#f8fafc;">Categoria:</strong> <span style="color:#38bdf8; font-weight:700;">${catTxt}</span></div>
          <div>• <strong style="color:#f8fafc;">Competência:</strong> <span style="color:#34d399; font-weight:700;">${compTxt}</span></div>
          <div>• <strong style="color:#f8fafc;">Superintendência:</strong> <span style="color:#cbd5e1; font-weight:700;">${superTxt}</span></div>
        </div>
        <div style="color:#94a3b8; font-size:12px;">
          Cadastre as unidades vinculadas ou ajuste os parâmetros antes de emitir o relatório.
        </div>
      `;

      if (typeof window.exibirMensagemSiSCAM === 'function') {
        window.exibirMensagemSiSCAM(msgHtml, {
          titulo: '. : SiSCAM : .',
          subtitulo: 'Consulta de Registros Sincronizados',
          tipo: 'aviso'
        });
      } else {
        alert(
          'Nenhum registro cadastrado e sincronizado foi localizado para os parâmetros vinculados selecionados:\n\n' +
          `• Município: ${munTxt}\n` +
          `• Categoria: ${catTxt}\n` +
          `• Competência: ${compTxt}\n` +
          `• Superintendência: ${superTxt}\n\n` +
          'Cadastre as unidades vinculadas ou ajuste os parâmetros antes de emitir o relatório.'
        );
      }
      return;
    }

    const agora = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dataHoraStr = `${pad(agora.getDate())}/${pad(agora.getMonth() + 1)}/${agora.getFullYear()} às ${pad(agora.getHours())}:${pad(agora.getMinutes())}:${pad(agora.getSeconds())}`;
    const bannerUrl = new URL('img/banner-cam-topo.png?v=1.3.89', window.location.href).href;

    // Agrupa por Município (ACOMODE E INFORME MUNICÍPIO COMO GRUPO)
    const agrupadoPorMunicipio = {};
    lista.forEach(esc => {
      const mun = (esc.municipio || window._municipioAtual || 'RONDÔNIA').trim();
      if (!agrupadoPorMunicipio[mun]) agrupadoPorMunicipio[mun] = [];
      agrupadoPorMunicipio[mun].push(esc);
    });

    const munsNomes = Object.keys(agrupadoPorMunicipio).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const totalGeralAlunos = lista.reduce((acc, esc) => {
      const raw = esc.totalMatricula || esc.alunos || esc.matriculas || 0;
      const n = parseInt(String(raw).replace(/\D/g, ''), 10);
      return acc + (isNaN(n) ? 0 : n);
    }, 0);

    const win = window.open('', '_blank');
    if (!win) {
      const msgPop = 'O navegador bloqueou a abertura da janela de impressão. Por favor, permita pop-ups para este site.';
      if (typeof window.exibirMensagemSiSCAM === 'function') {
        window.exibirMensagemSiSCAM(msgPop, { tipo: 'aviso', subtitulo: 'Bloqueio de Impressão' });
      } else {
        alert(msgPop);
      }
      return;
    }

    // Constrói os grupos de municípios sequenciais (sem quebra de página, um abaixo do outro)
    let tabelaCorpoHtml = '';

    munsNomes.forEach((munNome) => {
      const mEscolas = agrupadoPorMunicipio[munNome];
      mEscolas.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));

      const totalAlunosMun = mEscolas.reduce((acc, esc) => {
        const raw = esc.totalMatricula || esc.alunos || esc.matriculas || 0;
        const n = parseInt(String(raw).replace(/\D/g, ''), 10);
        return acc + (isNaN(n) ? 0 : n);
      }, 0);

      const linhasEscolas = mEscolas.map((esc, sIdx) => {
        const seqMun = sIdx + 1;
        const inep = esc.codigoInep || esc.inep || '-';
        const diretor = esc.diretor || 'Não informado';
        const tel = esc.contatoDiretor || esc.telefone || '-';
        const loc = esc.localizacao || esc.localidade || 'Urbana';
        const alunos = esc.totalMatricula || esc.alunos || '0';
        const cnpjLinha = esc.cnpj ? `<span style="font-size:7pt; color:#64748b; font-family:monospace;">• CNPJ: ${esc.cnpj}</span>` : '';
        const endLinha = (esc.endereco || esc.linha)
          ? `<div style="font-size:7.2pt; color:#475569; margin-top:1px;">${esc.endereco || ('Linha: ' + esc.linha + (esc.rodoviaKm ? ' Km ' + esc.rodoviaKm : ''))}</div>`
          : '';

        return `
          <tr>
            <td style="text-align:center; font-weight:800; color:#64748b; font-size:8pt;">${seqMun}</td>
            <td>
              <div style="font-weight:800; color:#0f172a; font-size:8.5pt;">${esc.nome}</div>
              <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap; margin-top:1px;">
                <span style="font-size:7pt; color:#0284c7; font-family:monospace; font-weight:700;">INEP: ${inep}</span>
                ${cnpjLinha}
              </div>
            </td>
            <td style="font-size:7.2pt; vertical-align:middle;">
              <span class="badge-tag-loc">${loc}</span>
              ${endLinha}
            </td>
            <td style="font-size:7.2pt; vertical-align:middle;">
              <div style="font-weight:700; color:#1e293b;">${diretor}</div>
              <div style="font-size:7pt; color:#334155; font-family:monospace;">${tel}</div>
            </td>
            <td style="text-align:center; font-weight:800; color:#0f172a; font-size:8pt;">${alunos}</td>
          </tr>
        `;
      }).join('');

      // Grupo de Município Sequencial (sem quebra de página)
      tabelaCorpoHtml += `
        <div class="bloco-municipio">
          <div class="header-quebra-municipio">
            <div class="header-mun-title">
              MUNICÍPIO: ${munNome.toUpperCase()}
            </div>
            <div class="header-mun-info">
              ${mEscolas.length} ${mEscolas.length === 1 ? 'Unidade' : 'Unidades'} &nbsp;|&nbsp; ${totalAlunosMun.toLocaleString('pt-BR')} Matrículas
            </div>
          </div>

          <table class="tabela-escolas-todos">
            <thead>
              <tr>
                <th style="width:28px; text-align:center;">#</th>
                <th>Entidade / Unidade Escolar</th>
                <th style="width:145px;">Localidade / Endereço</th>
                <th style="width:150px;">Gestão & Contato</th>
                <th style="width:65px; text-align:center;">Alunos</th>
              </tr>
            </thead>
            <tbody>
              ${linhasEscolas}
            </tbody>
            <tfoot>
              <tr class="linha-subtotal">
                <td colspan="4" style="text-align:right; font-weight:800; padding:4px 8px; color:#1e293b; font-size:7.5pt;">
                  Subtotal (${munNome}): <span style="color:#64748b; font-weight:600;">${mEscolas.length} ${mEscolas.length === 1 ? 'unidade' : 'unidades'}</span>
                </td>
                <td style="text-align:center; font-weight:900; color:#0f172a; background:#f1f5f9; padding:4px; font-size:8pt;">
                  ${totalAlunosMun.toLocaleString('pt-BR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    });

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>SEDUC/CAM - Relação Geral Consolidada por Município (A4 Retrato)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, -apple-system, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      line-height: 1.25;
      font-size: 8.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 99999;
      background: #090e17;
      color: #ffffff;
      padding: 8px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    .btn-print {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-print:hover { background: #059669; }
    .btn-fechar {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11.5px;
      cursor: pointer;
    }
    .btn-fechar:hover { background: #ef4444; color: #fff; }

    /* CABEÇALHO OFICIAL: LOGO CAM 10cm COM PROPORÇÃO DE ALTURA (PNG SEM FUNDO PRETO) */
    .report-paper {
      width: 210mm;
      min-height: 297mm;
      max-width: 96vw;
      margin: 15px auto 30px auto;
      background: #ffffff;
      padding: 10mm 12mm 12mm 12mm;
      box-sizing: border-box;
      box-shadow: 0 4px 25px rgba(0,0,0,0.3);
      border-radius: 4px;
    }
    .report-banner-wrap {
      width: 100%;
      margin: 0 auto 6px auto;
      text-align: center;
      background: transparent;
    }
    .report-banner-img {
      width: 10cm !important;
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
      margin: 0 auto !important;
      object-fit: contain !important;
      background: transparent !important;
    }

    /* CARD DE TÍTULO SÓBRIO E PROFISSIONAL (SEM FUNDO PRETO) */
    .report-title-card {
      border-top: 2px solid #0284c7;
      border-bottom: 1.5px solid #cbd5e1;
      background: #f8fafc;
      padding: 5px 8px;
      margin-bottom: 6px;
      text-align: center;
    }
    .report-title-main {
      font-size: 10.5pt;
      font-weight: 900;
      letter-spacing: 0.3px;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .report-meta-text {
      font-size: 7.6pt;
      color: #334155;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .report-meta-text .sep {
      color: #94a3b8;
    }

    /* QUADRO RESUMO GERAL */
    .quadro-resumo-parametros {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: #cbd5e1;
      border: 1px solid #cbd5e1;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .resumo-card {
      background: #ffffff;
      padding: 4px 6px;
      text-align: center;
    }
    .resumo-num {
      font-size: 10pt;
      font-weight: 900;
      color: #0284c7;
      line-height: 1.1;
    }
    .resumo-label {
      font-size: 5.8pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-top: 1px;
    }

    /* BLOCOS DE MUNICÍPIO: SEQUENCIAIS, SEM QUEBRA DE PÁGINA */
    .bloco-municipio {
      margin-bottom: 8px;
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      overflow: hidden;
    }
    .header-quebra-municipio {
      background: #f1f5f9;
      color: #0f172a;
      padding: 3.5px 8px;
      font-size: 7.8pt;
      font-weight: 900;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #cbd5e1;
      border-left: 4.5px solid #0284c7;
      letter-spacing: 0.3px;
    }
    .header-mun-title {
      font-weight: 900;
      color: #0f172a;
    }
    .header-mun-info {
      font-size: 7pt;
      color: #475569;
      font-weight: 700;
    }

    /* TABELA DE ESCOLAS */
    .tabela-escolas-todos {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      background: #ffffff;
    }
    .tabela-escolas-todos th {
      background: #f8fafc;
      color: #334155;
      font-size: 6.5pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3px 6px;
      border-bottom: 1px solid #cbd5e1;
      letter-spacing: 0.2px;
      text-align: left;
    }
    .tabela-escolas-todos td {
      padding: 3px 6px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
      vertical-align: top;
      line-height: 1.2;
    }
    .tabela-escolas-todos tr:nth-child(even) td {
      background: #fcfdfe;
    }
    .badge-tag-loc {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 6.3pt;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }

    /* ASSINATURAS EXPANDIDAS (AUMENTO DO LOCAL DE ASSINATURA - IMAGEM 3) */
    .signatures-block {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 32px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      gap: 16px;
    }
    .sig-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .sig-space {
      height: 55px;
      width: 100%;
    }
    .sig-line {
      width: 100%;
      border-top: 1.5px solid #334155;
      padding-top: 5px;
      text-align: center;
    }
    .sig-name {
      font-size: 7.8pt;
      color: #0f172a;
      font-weight: 800;
      line-height: 1.2;
    }
    .sig-role {
      font-size: 6.6pt;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }

    /* RODAPÉ PADRÃO SEDUC / CAM */
    .report-footer {
      border-top: 1.5px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7pt;
      color: #475569;
      font-weight: 600;
    }

    @media print {
      .no-print-bar { display: none !important; }
      body {
        background: #ffffff !important;
        font-size: 7.5pt;
        line-height: 1.18;
      }
      html, body {
        background: #ffffff !important;
        font-size: 7.2pt;
        line-height: 1.15;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
      }
      .report-paper {
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
      }
      .report-banner-wrap {
        width: 100% !important;
        margin: 0 auto 5px auto !important;
        text-align: center !important;
        background: transparent !important;
      }
      .report-banner-img {
        width: 10cm !important;
        max-width: 10cm !important;
        height: auto !important;
        object-fit: contain !important;
        background: transparent !important;
      }
      .bloco-municipio {
        margin-bottom: 5px !important;
        page-break-inside: auto !important;
        border: 1px solid #cbd5e1 !important;
      }
      .header-quebra-municipio {
        padding: 3px 6px !important;
        page-break-after: avoid !important;
      }
      .tabela-escolas-todos thead {
        display: table-header-group !important;
      }
      .tabela-escolas-todos tr {
        page-break-inside: avoid !important;
      }
      .tabela-escolas-todos th {
        padding: 2.2px 4.5px !important;
        font-size: 6.4pt !important;
      }
      .tabela-escolas-todos td {
        padding: 2px 4.5px !important;
        font-size: 6.9pt !important;
        line-height: 1.15 !important;
      }
      .header-quebra-municipio {
        padding: 3px 6px !important;
      }
      .tabela-escolas-todos th {
        padding: 2.5px 5px !important;
      }
      .tabela-escolas-todos td {
        padding: 2.5px 5px !important;
      }
      .signatures-block {
        margin-top: 26px !important;
        margin-bottom: 8px !important;
        gap: 12px !important;
      }
      .sig-space {
        height: 52px !important;
      }
      .sig-line {
        padding-top: 4px !important;
      }
      .sig-name {
        font-size: 7.5pt !important;
      }
      .sig-role {
        font-size: 6.5pt !important;
      }
      .report-footer {
        margin-top: 10px !important;
        padding-top: 3px !important;
      }
      @page {
        size: A4 portrait;
        margin: 8mm 10mm 10mm 10mm;
      }
    }
  </style>
</head>
<body>

  <!-- BARRA DE AÇÕES (NÃO IMPRIME) -->
  <div class="no-print-bar">
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:15px;">🏛️</span>
      <span style="font-weight:800; font-size:12px; color:#38bdf8;">SEDUC / CAM — RELATÓRIO OFICIAL CONSOLIDADO (A4 RETRATO)</span>
    </div>
    <div style="display:flex; align-items:center; gap:10px;">
      <button type="button" class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
      <button type="button" class="btn-fechar" onclick="window.close()">✕ Fechar</button>
    </div>
  </div>

  <div class="report-paper">

    <!-- CABEÇALHO OFICIAL: BANNER 170mm COM PROPORÇÃO REAL (IMAGEM 3) -->
    <div class="report-banner-wrap">
      <img src="${bannerUrl}" alt="CAM SEDUC/RO - Coordenadoria de Articulação com os Municípios" class="report-banner-img">
    </div>

    <!-- TÍTULO INSTITUCIONAL E PARÂMETROS ESCRITOS -->
    <div class="report-title-card">
      <h1 class="report-title-main">RELAÇÃO GERAL DE ESCOLAS / ENTIDADES EDUCACIONAIS</h1>
      <div class="report-meta-text">
        <span><strong>MUNICÍPIO(S):</strong> ${(window._municipioAtual || 'TODOS OS MUNICÍPIOS').toUpperCase()}</span>
        <span class="sep">•</span>
        <span><strong>CATEGORIA:</strong> ${window._categoriaAtual || 'Conselho Escolar'}</span>
        <span class="sep">•</span>
        <span><strong>COMPETÊNCIA:</strong> ${window._competenciaAtual || 'Municipal'}</span>
        <span class="sep">•</span>
        <span><strong>SUPER:</strong> ${window._superAtual || 'Regional'}</span>
      </div>
    </div>

    <!-- QUADRO RESUMO GERAL -->
    <div class="quadro-resumo-parametros">
      <div class="resumo-card">
        <div class="resumo-num">${munsNomes.length}</div>
        <div class="resumo-label">Municípios</div>
      </div>
      <div class="resumo-card">
        <div class="resumo-num">${lista.length}</div>
        <div class="resumo-label">Unidades Sincronizadas</div>
      </div>
      <div class="resumo-card">
        <div class="resumo-num">${totalGeralAlunos.toLocaleString('pt-BR')}</div>
        <div class="resumo-label">Matrículas Totais</div>
      </div>
      <div class="resumo-card">
        <div class="resumo-num" style="font-size:8pt; line-height:1.4; color:#334155;">${window._superAtual || 'Regional'}</div>
        <div class="resumo-label">Superintendência</div>
      </div>
    </div>

    <!-- CORPO: GRUPOS DE MUNICÍPIOS SEQUENCIAIS -->
    ${tabelaCorpoHtml}



    <!-- RODAPÉ OFICIAL -->
    <div class="report-footer">
      <div>SEDUC / CAM - COORDENADORIA DE ARTICULAÇÃO COM OS MUNICIPIOS</div>
      <div>${dataHoraStr}</div>
      <div>Documento Oficial • Padrão A4 Retrato • SEDUC/RO</div>
    </div>

  </div>

</body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(function() {
      try {
        win.focus();
        win.print();
      } catch(e) {
        console.error('Erro ao acionar impressao automatica:', e);
      }
    }, 400);
  }

  // Exporta para o escopo global
  window.imprimirRelatorioLinha = imprimirRelatorioLinha;
  window.imprimirRelatorioRegistroAtual = imprimirRelatorioRegistroAtual;
  window.imprimirRelatorioTodosRegistros = imprimirRelatorioLista;
  window.imprimirRelatorioLista = imprimirRelatorioLista;

})(window);
