class MultiSelect {
  constructor(selectElement) {
    this.select = selectElement;
    this.options = Array.from(this.select.options);
    this.placeholder = (this.options.find(o => o.value === "") || this.options[0])?.text || "Selecione...";

    this.wrapper = document.createElement("div");
    this.wrapper.className = "custom-multiselect" + (this.select.classList.contains("action-adm") ? " action-adm" : "");

    this.button = document.createElement("div");
    this.button.className = "custom-multiselect-btn";
    this.button.setAttribute("tabindex", "0");
    this.button.setAttribute("role", "combobox");
    this.button.setAttribute("aria-expanded", "false");
    this.button.setAttribute("aria-haspopup", "listbox");

    this.btnText = document.createElement("span");
    this.btnText.className = "custom-multiselect-text";
    this.btnText.textContent = this.placeholder;
    this.button.appendChild(this.btnText);

    const arrow = document.createElement("span");
    arrow.innerHTML = "&#9662;";
    arrow.className = "custom-multiselect-arrow";
    this.button.appendChild(arrow);

    this.dropdown = document.createElement("div");
    this.dropdown.className = "custom-multiselect-dropdown";
    this.dropdown.style.display = "none";

    this.buildOptions();

    this.wrapper.appendChild(this.button);
    this.wrapper.appendChild(this.dropdown);

    this.select.parentNode.insertBefore(this.wrapper, this.select.nextSibling);
    this.select.style.setProperty("display", "none", "important");
    this.select.classList.add("custom-multiselect-hidden");

    // Abrir / fechar dropdown
    this.button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Acessibilidade por Teclado no Botão
    this.button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        this.openDropdown();
      } else if (e.key === "Escape") {
        this.closeDropdown();
      }
    });

    // Impede que cliques dentro do dropdown fechem ele
    this.dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
      if (!this.wrapper.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });
  }

  toggleDropdown() {
    if (this.dropdown.style.display === "block") {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    // Fechar todos os outros dropdowns abertos
    document.querySelectorAll(".custom-multiselect-dropdown").forEach(el => {
      el.style.display = "none";
    });
    document.querySelectorAll(".custom-multiselect-btn").forEach(el => {
      el.setAttribute("aria-expanded", "false");
    });

    const isTouchOrMobile = ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0) || 
                            (window.innerWidth <= 1024) || 
                            document.body.classList.contains('funcao-mobile-ativa');

    const rect = this.button.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Largura adequada ao mobile sem estourar a tela
    const minW = isTouchOrMobile ? Math.min(Math.max(rect.width, 260), viewportW - 16) : Math.max(rect.width, 240);
    this.dropdown.style.position = "fixed";
    this.dropdown.style.width = minW + "px";
    this.dropdown.style.minWidth = minW + "px";
    this.dropdown.style.maxWidth = (viewportW - 16) + "px";
    this.dropdown.style.zIndex = "999999";
    this.dropdown.style.display = "block";
    this.button.setAttribute("aria-expanded", "true");

    // Posição horizontal segura
    let left = rect.left;
    if (left + minW > viewportW - 8) {
      left = Math.max(8, viewportW - minW - 8);
    }
    this.dropdown.style.left = left + "px";

    // Posição vertical segura: calcular espaço disponível acima e abaixo
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const itemsContainer = this.dropdown.querySelector(".custom-multiselect-items-container");

    // Limitar altura dos itens no mobile para nunca forçar scroll de tela
    if (itemsContainer) {
      const maxContainerHeight = isTouchOrMobile ? Math.min(220, Math.max(120, Math.max(spaceBelow, spaceAbove) - 100)) : 210;
      itemsContainer.style.maxHeight = maxContainerHeight + "px";
    }

    const dropHeight = this.dropdown.offsetHeight || 260;
    if (spaceBelow >= dropHeight || spaceBelow >= spaceAbove) {
      // Abre para baixo
      this.dropdown.style.top = (rect.bottom + 4) + "px";
    } else {
      // Abre para cima com segurança
      this.dropdown.style.top = Math.max(8, rect.top - dropHeight - 4) + "px";
    }

    // Focar no campo de busca para digitação imediata APENAS em desktop com teclado físico (evita teclado virtual abrir e fechar no mobile)
    if (!isTouchOrMobile) {
      const searchInput = this.dropdown.querySelector(".custom-multiselect-search");
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 50);
      }
    }
  }

  closeDropdown() {
    this.dropdown.style.display = "none";
    this.button.setAttribute("aria-expanded", "false");
    window._dropdownJustClosed = Date.now();
  }

  buildOptions() {
    this.dropdown.innerHTML = "";
    this.options = Array.from(this.select.options);
    const dataOptions = this.options.filter(opt => opt.value !== "");

    if (dataOptions.length === 0) {
      const empty = document.createElement("div");
      empty.className = "custom-multiselect-empty";
      empty.textContent = "Sem opções";
      this.dropdown.appendChild(empty);
      this.updateButtonText();
      return;
    }

    // Cabeçalho fixo do Dropdown
    const header = document.createElement("div");
    header.className = "custom-multiselect-header";

    const titleSpan = document.createElement("span");
    titleSpan.className = "custom-multiselect-title";
    titleSpan.style.cssText = "font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; display:flex; align-items:center; gap:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
    titleSpan.innerHTML = '<span style="font-size:11px; color:#38bdf8;">📌</span> <span>' + this.placeholder + '</span>';

    const actionsDiv = document.createElement("div");
    actionsDiv.style.cssText = "display:flex; align-items:center; flex-shrink:0; font-size:11px;";

    const spanTodos = document.createElement("span");
    spanTodos.className = "custom-multiselect-action";
    spanTodos.setAttribute("data-action", "all");
    spanTodos.textContent = "Todos";

    const spanSep = document.createElement("span");
    spanSep.style.cssText = "color:#475569; margin:0 5px;";
    spanSep.textContent = "|";

    const spanNenhum = document.createElement("span");
    spanNenhum.className = "custom-multiselect-action";
    spanNenhum.setAttribute("data-action", "none");
    spanNenhum.textContent = "Nenhum";

    actionsDiv.appendChild(spanTodos);
    actionsDiv.appendChild(spanSep);
    actionsDiv.appendChild(spanNenhum);

    header.appendChild(titleSpan);
    header.appendChild(actionsDiv);
    this.dropdown.appendChild(header);

    // Barra de Busca Rápida (Foco no combobox)
    const searchWrap = document.createElement("div");
    searchWrap.className = "custom-multiselect-search-wrap";
    searchWrap.style.cssText = "padding: 5px 8px 7px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #1e293b;";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "custom-multiselect-search";
    searchInput.placeholder = 'Buscar em ' + this.placeholder.toLowerCase() + '...';
    searchInput.style.cssText = "width: 100%; box-sizing: border-box; padding: 6px 10px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f8fafc; font-size: 11.5px; outline: none; transition: border-color 0.2s;";
    searchInput.addEventListener("focus", () => {
      searchInput.style.borderColor = "#38bdf8";
      searchInput.style.boxShadow = "0 0 0 2px rgba(56, 189, 248, 0.2)";
    });
    searchInput.addEventListener("blur", () => {
      searchInput.style.borderColor = "#334155";
      searchInput.style.boxShadow = "none";
    });

    searchWrap.appendChild(searchInput);
    this.dropdown.appendChild(searchWrap);

    // Container rolável com suporte total a scroll
    const itemsContainer = document.createElement("div");
    itemsContainer.className = "custom-multiselect-items-container";
    itemsContainer.style.cssText = "max-height: 210px; overflow-y: auto; overflow-x: hidden; padding: 4px 0;";

    // Filtrar opções em tempo real
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase().trim();
      const items = itemsContainer.querySelectorAll(".custom-multiselect-item");
      items.forEach(it => {
        const txt = it.textContent.toLowerCase();
        it.style.display = txt.includes(term) ? "flex" : "none";
      });
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDropdown();
      }
    });

    // Ações Todos / Nenhum
    header.addEventListener("click", (e) => {
      e.stopPropagation();
      const actionEl = e.target.closest(".custom-multiselect-action");
      if (actionEl) {
        const action = actionEl.getAttribute("data-action");
        const visibleItems = itemsContainer.querySelectorAll(".custom-multiselect-item");
        visibleItems.forEach(item => {
          if (item.style.display !== "none") {
            const cb = item.querySelector("input[type=\"checkbox\"]");
            if (cb) {
              cb.checked = (action === "all");
              const targetOpt = dataOptions.find(o => o.value === cb.value);
              if (targetOpt) targetOpt.selected = (action === "all");
            }
          }
        });
        this.updateButtonText();
        this.select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    dataOptions.forEach(opt => {
      const item = document.createElement("label");
      item.className = "custom-multiselect-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = opt.value;
      checkbox.checked = opt.selected;

      checkbox.addEventListener("change", () => {
        opt.selected = checkbox.checked;
        this.updateButtonText();
        this.select.dispatchEvent(new Event("change", { bubbles: true }));
      });

      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(opt.text));
      itemsContainer.appendChild(item);
    });

    this.dropdown.appendChild(itemsContainer);
    this.updateButtonText();
  }

  updateButtonText() {
    const selected = this.options.filter(opt => opt.selected && opt.value !== "");
    if (selected.length === 0) {
      this.btnText.textContent = this.placeholder;
      this.button.classList.remove("has-selection");
    } else if (selected.length === 1) {
      this.btnText.textContent = selected[0].text;
      this.button.classList.add("has-selection");
    } else {
      this.btnText.textContent = selected.length + " selecionados";
      this.button.classList.add("has-selection");
    }
  }

  update() {
    this.buildOptions();
  }

  destroy() {
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
    this.select.style.display = "";
    this.select._multiSelectInstance = null;
  }
}

window.initMultiSelect = function(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  if (!select.multiple) select.multiple = true;
  if (select._multiSelectInstance) {
    select._multiSelectInstance.destroy();
  }
  select._multiSelectInstance = new MultiSelect(select);
};

// Fechar dropdowns ao rolar ou redimensionar a página EXTERNA, mas NÃO ao rolar dentro do dropdown nem por teclado virtual
let _lastWindowWidth = window.innerWidth;

window.addEventListener("scroll", (e) => {
  const target = e.target;
  // Não fechar se estiver rolando dentro de qualquer parte do dropdown, itens ou wrapper
  if (target && target.nodeType === 1) {
    if (target.closest?.(".custom-multiselect-dropdown") ||
        target.closest?.(".custom-multiselect") ||
        target.closest?.(".custom-multiselect-items-container")) {
      return;
    }
  }

  // Não fechar se o usuário estiver focado no campo de busca da multiselect
  const active = document.activeElement;
  if (active && (active.classList?.contains("custom-multiselect-search") || active.closest?.(".custom-multiselect-dropdown"))) {
    return;
  }

  // Se não houver nenhum dropdown aberto, não precisa processar
  const openDropdowns = document.querySelectorAll(".custom-multiselect-dropdown[style*='display: block']");
  if (openDropdowns.length === 0) return;

  // Em mobile/touch, evitar fechar por micro-scroll acidental de toque na tela
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
  if (isTouch && (target === document || target === window)) {
    return;
  }

  document.querySelectorAll(".custom-multiselect-dropdown").forEach(el => {
    el.style.display = "none";
  });
  document.querySelectorAll(".custom-multiselect-btn").forEach(el => {
    el.setAttribute("aria-expanded", "false");
  });
  window._dropdownJustClosed = Date.now();
}, true);

window.addEventListener("resize", () => {
  // Ignorar resize se for apenas variação de altura (abertura/fechamento do teclado virtual no mobile)
  if (Math.abs(window.innerWidth - _lastWindowWidth) < 35) {
    return;
  }
  _lastWindowWidth = window.innerWidth;

  // Não fechar se o usuário estiver interagindo com um campo de busca
  const active = document.activeElement;
  if (active && (active.classList?.contains("custom-multiselect-search") || active.closest?.(".custom-multiselect-dropdown"))) {
    return;
  }

  document.querySelectorAll(".custom-multiselect-dropdown").forEach(el => {
    el.style.display = "none";
  });
  document.querySelectorAll(".custom-multiselect-btn").forEach(el => {
    el.setAttribute("aria-expanded", "false");
  });
  window._dropdownJustClosed = Date.now();
});
