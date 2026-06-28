# SEDUC — Sistema de Acompanhamento de Convênios e Contratos

Sistema web para a **Secretaria de Estado de Educação de Rondônia (SEDUC-RO)** para acompanhamento de processos, convênios e contratos.

## ✨ Funcionalidades

- 📊 **Dashboard** com indicadores, gráficos por status e municípios
- 📋 **Lista de Processos** com filtros avançados (status, localização, prefixo, município, objeto)
- ➕ **Cadastro e edição** de processos
- 📥 **Importação de planilha Excel** (.xlsx)
- 📤 **Exportação** para Excel
- 🏷️ **Campo Prefixo** para classificação e priorização
- 🔍 **Busca em tempo real** por qualquer campo
- 💾 **Armazenamento local** via LocalStorage (sem servidor necessário)

## 🚀 Como usar

1. Abra o arquivo `index.html` no navegador
2. Clique em **Importar Planilha** e arraste seu arquivo `.xlsx`
3. Navegue entre as páginas pelo menu lateral

## 📋 Colunas esperadas na planilha

| Coluna | Descrição |
|---|---|
| Prefixo | Código de prioridade |
| Município | Município do processo |
| Processo | Número do processo |
| Interessado | Nome da escola/entidade |
| Objeto | Descrição do objeto |
| Valor Of. | Valor oficial |
| Valor/Planilha | Valor da planilha |
| Diferença | Diferença entre valores |
| Status | Status atual |
| Localização | Localização atual |
| Obs. | Observações |
| Data | Data do processo |
| Anotação | Anotações internas |

## 🛠️ Tecnologias

- **HTML5 + CSS3 + JavaScript** puro (sem framework)
- **SheetJS** — leitura e escrita de Excel
- **Chart.js** — gráficos do dashboard
- **Google Fonts** — tipografia Inter

## 📁 Estrutura

```
SEDUC/
├── index.html       # Aplicação principal
├── css/
│   └── style.css    # Design system completo
└── js/
    ├── dados.js     # CRUD, importação, exportação
    └── app.js       # Roteamento, UI, filtros
```

---

> Desenvolvido para SEDUC-RO · 2026
