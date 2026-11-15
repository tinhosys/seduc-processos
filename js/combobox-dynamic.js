/**
 * SISCAM - DYNAMIC COMBOBOX ENGINE (v1.146)
 * Combobox ultra-rápido, dinâmico e responsivo em tempo real para todos os campos e formulários.
 * Substitui o datalist nativo do navegador por um dropdown inteligente com:
 * 1. Filtragem instantânea (< 1ms) a cada tecla digitada (insensível a acentos e maiúsculas/minúsculas).
 * 2. Disponibilidade imediata de novos dados digitados ("Usar novo" nos campos permitidos).
 * 3. Restrição estrita aos 52 Municípios Oficiais de Rondônia (sem "+", sem duplicidades).
 * 4. Abertura filtrada pelo texto atual ao clicar na seta ou focar.
 * 5. Navegação completa por teclado (Setas, Enter, Esc, Tab).
 * 6. Compatibilidade total com os formulários e eventos do SiSCAM.
 */

(function() {
  'use strict';

  // 52 Municípios Oficiais de Rondônia (Lista Canônica Estrita - SEDUC/RO)
  const MUNICIPIOS_RO_PADRAO = [
    "Alta Floresta do Oeste",
    "Alto Alegre dos Parecis",
    "Alto Paraíso",
    "Alvorada do Oeste",
    "Ariquemes",
    "Buritis",
    "Cabixi",
    "Cacaulândia",
    "Cacoal",
    "Campo Novo de Rondônia",
    "Candeias do Jamari",
    "Castanheiras",
    "Cerejeiras",
    "Chupinguaia",
    "Colorado do Oeste",
    "Corumbiara",
    "Costa Marques",
    "Cujubim",
    "Espigão do Oeste",
    "Governador Jorge Teixeira",
    "Guajará-Mirim",
    "Itapuã do Oeste",
    "Jaru",
    "Ji-Paraná",
    "Machadinho do Oeste",
    "Ministro Andreazza",
    "Mirante da Serra",
    "Monte Negro",
    "Nova Brasilândia do Oeste",
    "Nova Mamoré",
    "Nova União",
    "Novo Horizonte do Oeste",
    "Ouro Preto do Oeste",
    "Parecis",
    "Pimenta Bueno",
    "Pimenteiras do Oeste",
    "Porto Velho",
    "Presidente Médici",
    "Primavera de Rondônia",
    "Rio Crespo",
    "Rolim de Moura",
    "Santa Luzia do Oeste",
    "São Felipe do Oeste",
    "São Francisco do Guaporé",
    "São Miguel do Guaporé",
    "Seringueiras",
    "Teixeirópolis",
    "Theobroma",
    "Urupá",
    "Vale do Anari",
    "Vale do Paraíso",
    "Vilhena"
  ];
  window.MUNICIPIOS_RO_PADRAO = MUNICIPIOS_RO_PADRAO;
  window.LISTA_52_MUNICIPIOS_RO = MUNICIPIOS_RO_PADRAO;

  // Armazenamento em memória de novos dados adicionados dinamicamente
  window._dynamicComboCustomData = window._dynamicComboCustomData || {};

  // Estado global do combobox aberto
  let activeCombobox = null;
  let activeDropdownEl = null;
  let highlightedIndex = -1;
  let currentFilteredList = [];

  // Injeção de estilos CSS para o Combobox
  function injectComboboxStyles() {
    if (document.getElementById('siscam-dynamic-combo-style')) return;
    const style = document.createElement('style');
    style.id = 'siscam-dynamic-combo-style';
    style.textContent = `
      .dynamic-combo-input {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 10px center !important;
        padding-right: 30px !important;
        cursor: text;
        transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
      }
      .dynamic-combo-input:focus {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2334d399' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
      }
      .siscam-combo-dropdown {
        position: fixed;
        background: #0f172a;
        border: 1.5px solid rgba(52, 211, 153, 0.6);
        border-radius: 8px;
        box-shadow: 0 12px 35px rgba(0,0,0,0.9), 0 0 18px rgba(16,185,129,0.25);
        max-height: 290px;
        overflow-y: auto;
        z-index: 100000;
        font-family: inherit;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        user-select: none;
        animation: siscamComboFadeIn 0.12s ease-out;
      }
      @keyframes siscamComboFadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .siscam-combo-dropdown::-webkit-scrollbar {
        width: 7px;
      }
      .siscam-combo-dropdown::-webkit-scrollbar-track {
        background: rgba(15,23,42,0.8);
      }
      .siscam-combo-dropdown::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 4px;
      }
      .siscam-combo-dropdown::-webkit-scrollbar-thumb:hover {
        background: #475569;
      }
      .siscam-combo-header {
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        letter-spacing: 0.3px;
        position: sticky;
        top: 0;
        background: #0f172a;
        z-index: 2;
      }
      .siscam-combo-item {
        padding: 9px 12px;
        font-size: 13px;
        color: #f1f5f9;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        transition: background 0.12s, color 0.12s;
      }
      .siscam-combo-item:last-child {
        border-bottom: none;
      }
      .siscam-combo-item:hover, .siscam-combo-item.highlighted {
        background: rgba(16, 185, 129, 0.22) !important;
        color: #34d399 !important;
      }
      .siscam-combo-item.new-item {
        background: rgba(56, 189, 248, 0.12);
        color: #38bdf8;
        font-weight: 700;
        border-bottom: 1.5px dashed rgba(56, 189, 248, 0.4);
      }
      .siscam-combo-item.new-item:hover, .siscam-combo-item.new-item.highlighted {
        background: rgba(56, 189, 248, 0.25) !important;
        color: #7dd3fc !important;
      }
      .siscam-combo-item-label {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
      }
      .siscam-combo-item:hover .siscam-combo-item-label,
      .siscam-combo-item.highlighted .siscam-combo-item-label {
        color: #6ee7b7;
      }
      .siscam-combo-match {
        color: #34d399;
        font-weight: 800;
        text-decoration: underline;
        background: transparent;
      }
      .siscam-combo-empty {
        padding: 12px;
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
        font-style: italic;
      }
      .siscam-toast-combo {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #064e3b;
        color: #34d399;
        border: 1px solid #10b981;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        z-index: 100001;
        animation: siscamComboFadeIn 0.2s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  // Normalização de texto: remove acentos e deixa minúsculo
  function norm(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim();
  }

  // Escapar HTML para renderização segura
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Destacar texto que deu match
  function highlightMatch(text, query) {
    if (!query || !query.trim() || !text) return escapeHTML(text);
    const words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return escapeHTML(text);

    // Expressão regular para destacar qualquer das palavras
    const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    return escapeHTML(text).replace(regex, '<span class="siscam-combo-match">$1</span>');
  }

  // Mostra pequeno aviso visual ao adicionar novo dado
  function showComboToast(msg) {
    const existing = document.querySelector('.siscam-toast-combo');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'siscam-toast-combo';
    t.innerHTML = `<span>⚡</span> <span>${escapeHTML(msg)}</span>`;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 2200);
  }

  // Verifica se o campo refere-se estritamente a Município (onde APENAS os 52 são permitidos, sem "+")
  function isMunicipioField(listId, inputEl) {
    const lid = (listId || '').toLowerCase();
    const iid = (inputEl?.id || '').toLowerCase();
    const iname = (inputEl?.name || '').toLowerCase();
    return lid.includes('municipio') || iid.includes('municipio') || iname.includes('municipio');
  }

  // Obtém todas as opções de uma lista / datalist
  function getRawOptionsForList(listId, inputEl) {
    // 1. Se for campo de município: utiliza ESTRITAMENTE e EXCLUSIVAMENTE os 52 municípios oficiais de Rondônia
    if (isMunicipioField(listId, inputEl)) {
      return MUNICIPIOS_RO_PADRAO.map(m => ({
        value: m,
        label: 'Município Oficial de RO',
        _normValue: norm(m),
        _normLabel: norm('Município Oficial de RO')
      }));
    }

    const optionsMap = new Map();

    // 2. Carrega do datalist no DOM se existir
    if (listId) {
      const dl = document.getElementById(listId);
      if (dl && dl.children) {
        Array.from(dl.children).forEach(child => {
          if (child.tagName === 'OPTION') {
            const val = (child.value || child.textContent || '').trim();
            const lbl = (child.label || child.textContent || '').trim();
            if (val) {
              optionsMap.set(val, {
                value: val,
                label: (lbl && lbl !== val) ? lbl : ''
              });
            }
          }
        });
      }
    }

    // 3. Se for lista de Interessados / Escolas do popup
    if (listId === 'popup-list-interessados' || inputEl?.id === 'popup-novo-interessado') {
      if (window._popupEntidadesCacheMap && window._popupEntidadesCacheMap.size > 0) {
        window._popupEntidadesCacheMap.forEach((item, nome) => {
          if (!optionsMap.has(nome)) {
            optionsMap.set(nome, {
              value: nome,
              label: item.tipoLabel ? `[${item.grupo || 'Entidade'} - ${item.tipoLabel}]` : ''
            });
          }
        });
      }
    }

    // 4. Carrega novos dados em memória adicionados nesta sessão (apenas se não for município)
    if (listId && window._dynamicComboCustomData[listId]) {
      window._dynamicComboCustomData[listId].forEach(val => {
        if (!optionsMap.has(val)) {
          optionsMap.set(val, { value: val, label: 'Novo dado cadastrado' });
        }
      });
    }

    // Pré-computa normalizações para filtro ultra-rápido
    const result = Array.from(optionsMap.values()).map(opt => ({
      value: opt.value,
      label: opt.label || '',
      _normValue: norm(opt.value),
      _normLabel: norm(opt.label || '')
    }));

    return result;
  }

  // Algoritmo de filtragem inteligente e ranqueamento
  function filterAndRankOptions(options, query, isMunicipio = false) {
    const qTrim = (query || '').trim();
    if (!qTrim) {
      return {
        items: options.slice(0, 120),
        totalCount: options.length,
        hasExactMatch: false,
        query: ''
      };
    }

    const qNorm = norm(qTrim);
    const words = qNorm.split(/\s+/).filter(Boolean);

    let exactMatch = false;
    const scoredList = [];

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const valN = opt._normValue;
      const lblN = opt._normLabel;
      const fullN = valN + ' ' + lblN;

      if (valN === qNorm) {
        exactMatch = true;
        scoredList.push({ ...opt, score: 5000 });
        continue;
      }

      // Nível 1: Todas as palavras aparecem no valor ou na etiqueta
      let allWordsFound = true;
      for (let j = 0; j < words.length; j++) {
        if (!fullN.includes(words[j])) {
          allWordsFound = false;
          break;
        }
      }

      if (allWordsFound) {
        let score = 1000;
        if (valN.startsWith(qNorm)) score += 800;
        else if (valN.includes(qNorm)) score += 400;
        scoredList.push({ ...opt, score });
        continue;
      }

      // Nível 2: Se tem mais de 1 palavra, pelo menos 1 palavra principal deu match
      if (words.length > 1) {
        let countWords = 0;
        for (let j = 0; j < words.length; j++) {
          if (fullN.includes(words[j])) countWords++;
        }
        if (countWords > 0) {
          scoredList.push({ ...opt, score: countWords * 100 });
        }
      }
    }

    // Ordenação decrescente por score e depois alfabética
    scoredList.sort((a, b) => b.score - a.score || a.value.localeCompare(b.value, 'pt-BR'));

    const items = scoredList.slice(0, 100);

    // Se não há match exato e NÃO for campo de município, insere a opção dinâmica no topo para uso imediato
    // ATENÇÃO: Para município NÃO EXISTE colocar "+" ou novo dado, somente os 52 oficiais de RO
    if (!isMunicipio && !exactMatch && qTrim.length > 0) {
      items.unshift({
        value: qTrim,
        label: 'Adicionar e usar este novo valor',
        isNew: true,
        _normValue: qNorm,
        _normLabel: ''
      });
    }

    return {
      items,
      totalCount: scoredList.length,
      hasExactMatch: exactMatch,
      query: qTrim
    };
  }

  // Criação ou atualização do menu flutuante do combobox
  function openComboDropdown(inputEl) {
    if (!inputEl) return;
    const listId = inputEl.dataset.dynamicList;
    const query = inputEl.value || '';
    const isMun = isMunicipioField(listId, inputEl);

    const allOptions = getRawOptionsForList(listId, inputEl);
    const { items, totalCount } = filterAndRankOptions(allOptions, query, isMun);

    currentFilteredList = items;
    highlightedIndex = items.length > 0 ? 0 : -1;

    // Se já existe um dropdown aberto para outro input, fecha
    if (activeDropdownEl && activeCombobox !== inputEl) {
      closeComboDropdown();
    }

    activeCombobox = inputEl;

    if (!activeDropdownEl) {
      activeDropdownEl = document.createElement('div');
      activeDropdownEl.className = 'siscam-combo-dropdown';
      document.body.appendChild(activeDropdownEl);
    }

    renderDropdownContent(items, query, totalCount, listId, isMun);
    positionDropdown(inputEl, activeDropdownEl);
  }

  // Renderiza o HTML interno do menu dropdown
  function renderDropdownContent(items, query, totalCount, listId, isMunicipio = false) {
    if (!activeDropdownEl) return;

    if (items.length === 0) {
      activeDropdownEl.innerHTML = `
        <div class="siscam-combo-header">
          <span>${isMunicipio ? '52 MUNICÍPIOS DE RO' : 'NENHUMA SUGESTÃO'}</span>
          <span>0 encontrados</span>
        </div>
        <div class="siscam-combo-empty">
          ${isMunicipio ? `Nenhum dos 52 municípios oficiais encontrado para "${escapeHTML(query)}".` : `Nenhuma opção encontrada para "${escapeHTML(query)}".`}
        </div>
      `;
      return;
    }

    const headerTitle = isMunicipio ? '52 MUNICÍPIOS OFICIAIS DE RONDÔNIA' : 'SUGESTÕES DINÂMICAS';
    const countLabel = isMunicipio
      ? (query.trim() ? `${items.length} de 52 encontrados` : '52 municípios oficiais')
      : (query.trim() ? `${items.length} de ${totalCount} encontrados` : `${items.length} disponíveis`);

    let html = `
      <div class="siscam-combo-header">
        <span>${headerTitle}</span>
        <span style="color:#34d399; font-weight:800;">${countLabel}</span>
      </div>
    `;

    items.forEach((item, index) => {
      const isHigh = (index === highlightedIndex);
      const isNew = item.isNew;
      const classList = ['siscam-combo-item'];
      if (isHigh) classList.push('highlighted');
      if (isNew) classList.push('new-item');

      const valHtml = isNew 
        ? `<span>➕ <strong>Usar novo:</strong> "${escapeHTML(item.value)}"</span>` 
        : highlightMatch(item.value, query);

      const lblHtml = item.label 
        ? `<span class="siscam-combo-item-label">${escapeHTML(item.label)}</span>` 
        : '';

      html += `
        <div class="${classList.join(' ')}" data-index="${index}">
          <div>${valHtml}</div>
          ${lblHtml}
        </div>
      `;
    });

    activeDropdownEl.innerHTML = html;

    // Adiciona eventos de clique e hover nas opções
    const itemEls = activeDropdownEl.querySelectorAll('.siscam-combo-item');
    itemEls.forEach((el, idx) => {
      el.addEventListener('mouseenter', () => {
        highlightedIndex = idx;
        itemEls.forEach(i => i.classList.remove('highlighted'));
        el.classList.add('highlighted');
      });

      el.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Evita perder o foco antes de selecionar
        selectOptionItem(activeCombobox, currentFilteredList[idx]);
      });
    });
  }

  // Posiciona o menu suspenso perfeitamente abaixo ou acima do input
  function positionDropdown(inputEl, dropdownEl) {
    if (!inputEl || !dropdownEl) return;
    const rect = inputEl.getBoundingClientRect();
    const dropdownHeight = 290;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    dropdownEl.style.width = Math.max(rect.width, 240) + 'px';
    dropdownEl.style.left = rect.left + 'px';

    // Se o espaço abaixo for insuficiente e acima houver mais espaço, abre para cima
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      dropdownEl.style.top = 'auto';
      dropdownEl.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
    } else {
      dropdownEl.style.top = (rect.bottom + 4) + 'px';
      dropdownEl.style.bottom = 'auto';
    }
  }

  // Seleciona um item do combobox e atualiza todos os dados reativos
  function selectOptionItem(inputEl, item) {
    if (!inputEl || !item) return;

    const val = item.value;
    inputEl.value = val;

    // Se for um novo dado dinâmico (e NÃO for município), registra imediatamente no pool em memória e no datalist
    if (item.isNew && !isMunicipioField(inputEl.dataset.dynamicList, inputEl)) {
      const listId = inputEl.dataset.dynamicList;
      if (listId) {
        if (!window._dynamicComboCustomData[listId]) {
          window._dynamicComboCustomData[listId] = new Set();
        }
        window._dynamicComboCustomData[listId].add(val);

        const dl = document.getElementById(listId);
        if (dl) {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          dl.appendChild(opt);
        }
      }
      showComboToast(`Novo dado "${val}" disponível instantaneamente!`);
    }

    closeComboDropdown();

    // Dispara eventos padrão input e change com bolha para acionar validações e listeners
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));

    // Executa handlers inline se existirem
    if (typeof inputEl.oninput === 'function') {
      try { inputEl.oninput(); } catch (err) {}
    }
    if (typeof inputEl.onchange === 'function') {
      try { inputEl.onchange(); } catch (err) {}
    }

    // Se for município do popup de novo processo, sincroniza imediatamente
    if (inputEl.id === 'popup-novo-municipio') {
      if (typeof window.atualizarEntidadesMunicipioPopup === 'function') {
        window.atualizarEntidadesMunicipioPopup();
      }
      if (typeof window.verificarDemandaRegistradaPopup === 'function') {
        window.verificarDemandaRegistradaPopup();
      }
      if (typeof window.sugerirDadosEscolaPopup === 'function') {
        window.sugerirDadosEscolaPopup();
      }
    }

    // Se for interessado do popup, sincroniza CNPJ e verificações
    if (inputEl.id === 'popup-novo-interessado') {
      if (typeof window.onSelecionarOuDigitarInteressadoPopup === 'function') {
        window.onSelecionarOuDigitarInteressadoPopup();
      }
      if (typeof window.verificarDemandaRegistradaPopup === 'function') {
        window.verificarDemandaRegistradaPopup();
      }
    }

    // Se for município ancorado do cadastro de entidades
    if (inputEl.id === 'entidade-municipio-ancorado') {
      if (typeof window.aoAlterarMunicipioAncorado === 'function') {
        window.aoAlterarMunicipioAncorado(val);
      }
    }
  }

  // Fecha o dropdown ativo
  function closeComboDropdown() {
    if (activeDropdownEl) {
      activeDropdownEl.remove();
      activeDropdownEl = null;
    }
    activeCombobox = null;
    highlightedIndex = -1;
    currentFilteredList = [];
  }

  // Configuração e vinculação de um input individual para transformá-lo em Dynamic Combobox
  function attachDynamicCombobox(input) {
    if (!input || input._isDynamicComboAttached) return;

    // Identifica o datalist vinculado (pelo atributo list ou data-dynamic-list)
    let listId = input.getAttribute('list') || input.dataset.dynamicList;
    if (!listId) {
      // Se não possui list mas é um campo conhecido (como municipio, interessado, prefixo, etc.)
      if (input.id === 'popup-novo-municipio' || input.id === 'form-municipio' || input.id === 'form-escola-municipio') {
        listId = 'list-municipios';
      } else if (input.id === 'popup-novo-interessado') {
        listId = 'popup-list-interessados';
      } else if (input.id === 'form-interessado') {
        listId = 'list-interessados';
      } else if (input.id === 'popup-novo-prefixo' || input.id === 'form-prefixo') {
        listId = 'list-prefixos';
      } else if (input.id === 'popup-novo-objeto' || input.id === 'form-objeto') {
        listId = 'list-objetos';
      } else if (input.id === 'popup-novo-analista' || input.id === 'form-analista') {
        listId = 'list-analistas';
      } else if (input.id === 'popup-novo-executivo' || input.id === 'form-executivo') {
        listId = 'list-executivos';
      } else if (input.id === 'entidade-municipio-ancorado' || input.id === 'entidade-municipio') {
        listId = 'list-municipios-ancorados';
      }
    }

    if (!listId) return;

    // Desativa o datalist nativo do navegador para impedir o popover antigo e travado
    input.dataset.dynamicList = listId;
    input.removeAttribute('list');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.classList.add('dynamic-combo-input');
    input._isDynamicComboAttached = true;

    // Evento de digitação em tempo real (instantâneo a cada tecla)
    input.addEventListener('input', () => {
      openComboDropdown(input);
    });

    // Evento ao receber foco: abre o combo filtrado pelo texto atual ou com todas opções se vazio
    input.addEventListener('focus', () => {
      openComboDropdown(input);
    });

    // Evento de clique: se clicar na área da setinha (lado direito), faz toggle do menu
    input.addEventListener('click', (e) => {
      const rect = input.getBoundingClientRect();
      const isRightArrow = (e.clientX >= rect.right - 35);
      if (isRightArrow) {
        if (activeDropdownEl && activeCombobox === input) {
          closeComboDropdown();
          return;
        }
      }
      openComboDropdown(input);
    });

    // Navegação por teclado dentro do combobox
    input.addEventListener('keydown', (e) => {
      if (!activeDropdownEl || activeCombobox !== input) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openComboDropdown(input);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentFilteredList.length > 0) {
          highlightedIndex = (highlightedIndex + 1) % currentFilteredList.length;
          updateHighlightUI();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentFilteredList.length > 0) {
          highlightedIndex = (highlightedIndex - 1 + currentFilteredList.length) % currentFilteredList.length;
          updateHighlightUI();
        }
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && highlightedIndex < currentFilteredList.length) {
          e.preventDefault();
          selectOptionItem(input, currentFilteredList[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeComboDropdown();
      } else if (e.key === 'Tab') {
        closeComboDropdown();
      }
    });

    // Atualiza o item destacado na navegação por teclado e faz scroll visível
    function updateHighlightUI() {
      if (!activeDropdownEl) return;
      const items = activeDropdownEl.querySelectorAll('.siscam-combo-item');
      items.forEach((itemEl, idx) => {
        if (idx === highlightedIndex) {
          itemEl.classList.add('highlighted');
          itemEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          itemEl.classList.remove('highlighted');
        }
      });
    }
  }

  // Varredura de todo o sistema em todos os formulários e campos
  function scanAndAttachAllCombos() {
    injectComboboxStyles();

    // Varre inputs com list, data-dynamic-list ou seletores específicos em todos os forms
    const selectors = [
      'input[list]',
      'input[data-dynamic-list]',
      '#popup-novo-prefixo',
      '#popup-novo-ano',
      '#popup-novo-municipio',
      '#popup-novo-interessado',
      '#popup-novo-objeto',
      '#popup-novo-analista',
      '#popup-novo-executivo',
      '#form-prefixo',
      '#form-ano',
      '#form-municipio',
      '#form-agrupamento',
      '#form-interessado',
      '#form-objeto',
      '#form-status',
      '#form-localizacao',
      '#form-analista',
      '#form-executivo',
      '#entidade-municipio-ancorado',
      '#entidade-municipio',
      '#form-escola-municipio',
      '#contato-municipio',
      '#filtro-prefixo'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(input => {
      attachDynamicCombobox(input);
    });
  }

  // Fecha o dropdown se clicar fora de qualquer combo ou do dropdown
  document.addEventListener('mousedown', (e) => {
    if (!activeDropdownEl) return;
    if (activeCombobox && activeCombobox.contains(e.target)) return;
    if (activeDropdownEl.contains(e.target)) return;
    closeComboDropdown();
  });

  // Reposiciona o dropdown ao rolar a tela ou redimensionar a janela
  window.addEventListener('scroll', () => {
    if (activeCombobox && activeDropdownEl) {
      positionDropdown(activeCombobox, activeDropdownEl);
    }
  }, true);

  window.addEventListener('resize', () => {
    if (activeCombobox && activeDropdownEl) {
      positionDropdown(activeCombobox, activeDropdownEl);
    }
  });

  // Observador de mutações para novos campos gerados dinamicamente em modais
  const domObserver = new MutationObserver(() => {
    scanAndAttachAllCombos();
  });

  if (document.body) {
    domObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      domObserver.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Inicialização no DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndAttachAllCombos);
  } else {
    scanAndAttachAllCombos();
  }

  // Exportação para o escopo global
  window.SiSCAMCombobox = {
    attach: attachDynamicCombobox,
    scanAll: scanAndAttachAllCombos,
    refreshAll: scanAndAttachAllCombos,
    close: closeComboDropdown,
    open: openComboDropdown,
    registerCustomDatum: (listId, value) => {
      if (!listId || !value) return;
      if (!window._dynamicComboCustomData[listId]) {
        window._dynamicComboCustomData[listId] = new Set();
      }
      window._dynamicComboCustomData[listId].add(value);
      scanAndAttachAllCombos();
    }
  };

  window.inicializarCombosDinamicos = scanAndAttachAllCombos;
  window.atualizarTodosCombosDinamicos = scanAndAttachAllCombos;

})();
