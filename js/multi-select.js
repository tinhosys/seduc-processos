class MultiSelect {
  constructor(selectElement) {
    this.select = selectElement;
    this.options = Array.from(this.select.options);
    this.placeholder = (this.options.find(o => o.value === "") || this.options[0])?.text || "Selecione...";

    this.wrapper = document.createElement("div");
    this.wrapper.className = "custom-multiselect";

    this.button = document.createElement("div");
    this.button.className = "custom-multiselect-btn";

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
    this.select.style.display = "none";

    this.button.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = this.dropdown.style.display === "block";
      document.querySelectorAll(".custom-multiselect-dropdown").forEach(el => el.style.display = "none");
      if (!isVisible) this.dropdown.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (!this.wrapper.contains(e.target)) {
        this.dropdown.style.display = "none";
      }
    });
  }

  buildOptions() {
    this.dropdown.innerHTML = "";
    this.options = Array.from(this.select.options);
    const dataOptions = this.options.filter(opt => opt.value !== "");

    if (dataOptions.length === 0) {
      const empty = document.createElement("div");
      empty.className = "custom-multiselect-empty";
      empty.textContent = "Sem opcoes";
      this.dropdown.appendChild(empty);
      this.updateButtonText();
      return;
    }

    const header = document.createElement("div");
    header.className = "custom-multiselect-header";

    const titleSpan = document.createElement("span");
    titleSpan.className = "custom-multiselect-title";
    titleSpan.style.cssText = "font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; display:flex; align-items:center; gap:4px;";
    titleSpan.innerHTML = `<span style="font-size:10px; color:#38bdf8;">📌</span> ${this.placeholder}`;

    const actionsDiv = document.createElement("div");
    actionsDiv.style.cssText = "display:flex; align-items:center;";

    const spanTodos = document.createElement("span");
    spanTodos.className = "custom-multiselect-action";
    spanTodos.setAttribute("data-action", "all");
    spanTodos.textContent = "Todos";

    const spanSep = document.createElement("span");
    spanSep.style.cssText = "color:#475569; margin:0 6px;";
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

    header.addEventListener("click", (e) => {
      e.stopPropagation();
      const actionEl = e.target.closest(".custom-multiselect-action");
      if (actionEl) {
        const action = actionEl.getAttribute("data-action");
        const checkboxes = this.dropdown.querySelectorAll("input[type=\"checkbox\"]");
        checkboxes.forEach(cb => { cb.checked = (action === "all"); });
        dataOptions.forEach(opt => { opt.selected = (action === "all"); });
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
      this.dropdown.appendChild(item);
    });

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