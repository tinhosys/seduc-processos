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

    const rect = this.button.getBoundingClientRect();
    const minW = Math.max(rect.width, 240);
    this.dropdown.style.position = "fixed";
    this.dropdown.style.top = (rect.bottom + 4) + "px";
    this.dropdown.style.left = rect.left + "px";
    this.dropdown.style.width = minW + "px";
    this.dropdown.style.minWidth = minW + "px";
    this.dropdown.style.zIndex = "99999";
    this.dropdown.style.display = "block";
    this.button.setAttribute("aria-expanded", "true");

    // Focar no campo de busca para digitação imediata
    const searchInput = this.dropdown.querySelector(".custom-multiselect-search");
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 30);
    }

    // Ajustar se sair da tela (viewport)
    requestAnimationFrame(() => {
      const dropRect = this.dropdown.getBoundingClientRect();
      if (dropRect.right > window.innerWidth - 8) {
        this.dropdown.style.left = Math.max(8, window.innerWidth - dropRect.width - 8) + "px";
      }
      if (dropRect.bottom > window.innerHeight - 8) {
        this.dropdown.style.top = Math.max(8, rect.top - dropRect.height - 4) + "px";
      }
    });
  }

  closeDropdown() {
    this.dropdown.style.display = "none";
    this.button.setAttribute("aria-expanded", "false");
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

// Fechar dropdowns ao rolar ou redimensionar a página EXTERNA, mas NÃO ao rolar dentro do dropdown
window.addEventListener("scroll", (e) => {
  if (e.target && (
    e.target.classList?.contains("custom-multiselect-dropdown") ||
    e.target.closest?.(".custom-multiselect-dropdown") ||
    e.target.classList?.contains("custom-multiselect-items-container") ||
    e.target.closest?.(".custom-multiselect-items-container")
  )) {
    return; // Permite a rolagem normal dentro do dropdown sem fechar!
  }
  document.querySelectorAll(".custom-multiselect-dropdown").forEach(el => {
    el.style.display = "none";
  });
  document.querySelectorAll(".custom-multiselect-btn").forEach(el => {
    el.setAttribute("aria-expanded", "false");
  });
}, true);

window.addEventListener("resize", () => {
  document.querySelectorAll(".custom-multiselect-dropdown").forEach(el => {
    el.style.display = "none";
  });
  document.querySelectorAll(".custom-multiselect-btn").forEach(el => {
    el.setAttribute("aria-expanded", "false");
  });
});
