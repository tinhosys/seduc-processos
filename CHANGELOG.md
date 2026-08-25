# CHANGELOG — SEDUC Processos (CAM/SEDUC-RO)

> Sistema de Acompanhamento de Convênios, Contratos e Escolas
> Repositório: `seduc-processos` · Branch: `main`

---

## [v1.1.13] — 2026-08-24 🟢 VERSÃO ATUAL

**Tag:** `v1.1.13` · **Cache-buster:** `1787625716691`

### 🐛 Fix — Aba "Alunos Municipais" (Proalfa/CENSO)

#### Correções de colunas e índices
- **Removidas** colunas `E.F` e `A.I` da aba Matrículas (não existem na planilha)
- **Corrigidos** índices de anos: `1º=r[9]`, `2º=r[10]`, `3º=r[11]`, `4º=r[12]`, `5º=r[13]`
  - Antes: os valores estavam deslocados 1 coluna para a esquerda
  - O `5º` aparecia sempre `0` porque apontava para `r[14]` (inexistente)
- **Coluna TOTAL** calculada por soma dos 5 anos individuais (sem depender de `r[8]` da planilha)

#### Nova coluna Localização
- Adicionada coluna **LOCALIZAÇÃO** (`r[6]`: Urbana / Rural / Indígena / Quilombola)
  - Visível em ambas as abas: Matrículas e Docentes
  - Exibida com **badge colorido** (azul=Urbana, verde=Rural, âmbar=Indígena, roxo=Quilombola)
- Novo combo de filtro **LOCALIZAÇÃO** adicionado ao painel de filtros
  - Preenchido dinamicamente de acordo com a aba selecionada

#### Totais da busca
- Barra de totais corrigida para matrículas: mostra `TOTAL` + anos `1º` a `5º` (sem E.F/A.I)
- Docentes mantém: `DOCENTES`, `E.F`, `A.I`, `1º` a `5º`

#### Arquivos modificados
- `js/proalfa.js` — reescrita das funções `renderTableProalfa`, `preencherCombosProalfa`, `filtrarProalfa`, `renderProalfaTabs`
- `index.html` — adicionado combo `proalfa-localizacao` nos filtros

---

## [v1.1.12] — 2026-08-24

**Tag:** `v1.1.12` · **Cache-buster:** `1787588267609`

### 🔄 Recarregamento Geral de Assets

- Cache busters atualizados para todos os arquivos JS e CSS:
  - `js/dados.js`, `js/app.js`, `js/auth-sap.js`, `js/escolas.js`
  - `js/mapa.js`, `js/multi-select.js`, `js/orcamento.js`
  - `css/style.css`
- Versão do rodapé confirmada: `GBZ - v1.1.12`

---

## [v1.0.53] — 2026-08-16

**Tag:** `v1.0.53` · **Commit:** `957b674`

### ✨ Módulo de Escolas — Reestruturação Completa

#### 🏷️ Badge de Competência
- Nova coluna **Competência** na tabela de escolas com badge colorido:
  - 🟢 `Estadual` — verde
  - 🔴 `Municipal` — vermelho
  - 🔵 `Federal` — azul
- Normalização automática de capitalização (`"municipal"` → `"Municipal"`)

#### 📚 Grid de Modalidades (Escolas Municipais)
- Escolas **Municipais** exibem mini-grid de modalidades na coluna "Super/Modalidades"
  (ex: `23 Creche`, `20 Educação Infantil`, `15 EJA`)
- Formulário de edição ganha seção **"Modalidades e Matrículas"** visível apenas para competência Municipal
- Grid editável: selecionar modalidade, informar qtd de alunos, remover linha
- Botão "+ Adicionar Modalidade" com total calculado automaticamente
- Modalidades padrão: Creche, Educação Infantil, Ensino Fundamental, Ensino Médio, EJA (Fund.), EJA (Médio), AEE, Educação Profissional

#### 🐛 Correções
- **NaN no total de alunos** corrigido — `_calcTotalAlunos()` soma modalidades ou usa `totalMatricula`
- **Filtro de Competência** corrigido — antes não funcionava por incompatibilidade de capitalização
- **Busca** expandida para incluir INEP, diretor e competência normalizada
- **Badges de resumo** (total alunos, escolas, salas) agora usam soma correta das modalidades

#### 🏗️ Novas Funções em `js/escolas.js`
| Função | Descrição |
|---|---|
| `_normalizarCompetencia(v)` | Normaliza `"municipal"` → `"Municipal"` |
| `_calcTotalAlunos(escola)` | Soma modalidades ou usa `totalMatricula` |
| `_getModalidades(escola)` | Extrai array de modalidades (JSON ou array) |
| `_renderCompetenciaBadge(comp)` | Retorna HTML do badge colorido |
| `_renderModalidadesGrid(escola)` | Mini-grid de modalidades para tabela |
| `_renderFormModalidadesGrid(id, mods)` | Grid editável no formulário |
| `_adicionarModalidade(containerId)` | Adiciona linha ao grid |
| `_recalcTotalModalidades(containerId)` | Recalcula total em tempo real |

#### 📄 Arquivos Modificados
- `js/escolas.js` — 180 linhas adicionadas
- `index.html` — thead da tabela de escolas + seção de modalidades no modal de edição

---

## [v1.0.52] — 2026-08-15

**Tag:** `v1.0.52` · **Commits:** `4be54b2`, `19fd643`

### ✨ Módulo de Escolas — Mesclagem Estadual/Municipal

- Página unificada de escolas com competências Estadual e Municipal
- Filtro de competência na listagem de escolas
- Botões de planilha distintos para ADM e EDITOR
- Cores de marcadores corrigidas no Mapa de Escolas:
  - Municipal = vermelho · Estadual = verde · Federal = azul

### 🐛 Correções
- Removidos **19 blocos duplicados** de verificação `401/403` em `inicializarDados` (`dados.js`)
- Arquivo reduzido de 673 → 597 linhas

---

## [v1.0.49] — 2026-08-14

**Tag:** `v1.0.49` · **Commit:** `adf5a15`

### 🐛 Correções
- Corrigida view "Todas Escolas" com dados do Google Sheets
- Corrigidos erros de sintaxe no JavaScript

---

## [v1.0.46] — 2026-08-13

**Tag:** `v1.0.46` · **Commit:** `8f9d7ef`

### 🐛 Correções
- Corrigido `ReferenceError` fatal em `escolas.js` que impedia o registro da função de impressão

---

## [v1.0.45] — 2026-08-13

**Tag:** `v1.0.45` · **Commit:** `ca5815f`

### 🐛 Correções
- Corrigidos layouts dos diálogos de impressão
- Impressão síncrona implementada
- Ajustes de estilo na tela de login

---

## [Sem tag — Histórico anterior]

> Commits sem tag versionada, do mais recente ao mais antigo

| Commit | Descrição |
|---|---|
| `4644afc` | feat: seletores de Categoria e Tipo no formulário, gravação na planilha e selos coloridos na lista |
| `64a2722` | feat: exibição e gravação da última atualização com login e data/hora no formulário |
| `4d8ead1` | build: atualiza cache buster das folhas de estilo e scripts para produção |
| `187f4f4` | feat: CRUD completo, exclusão real na planilha e recurso de marcação de processos |
| `1655682` | style: colapso de filtros e formulários, melhoria do layout responsivo no celular |
| `94a2b9c` | feat: reestrutura processos repetidos em tree-grid com expansão e edição na linha |
| `324f6b6` | feat: aba de processos repetidos para admin, legenda de auditoria no form |
| `4272e09` | style: congela cabeçalho de parâmetros no topo e limita rolagem à tabela |
| `6df5809` | style: selo de branding, remoção de título da lista de processos |
| `bc8849f` | feat: controle completo de apontamentos e alarme para ADM no formulário de edição |
| `1c6d8a7` | feat: botão azul Gravar de salvamento imediato, histórico somente-leitura, fuso horário |
| `1ddcbec` | feat: sincroniza index.html com pasta public para GitHub Pages |
| `78c6c03` | refactor: atualiza versão do backend para 1.0.7 e renova cache buster |
| `ebf40f6` | feat: lógica de Apontamentos e Histórico de Edição |
| `c25d795` | feat: funcionalidade de troca de senha no perfil |
| `a28b2c0` | chore: atualiza nomenclatura para COORDENADORIA DE ARTICULAÇÃO COM OS MUNICÍPIOS |
| `5b315cb` | style: limpa campos de login, substitui emojis por SVGs no menu e tabela de acessos |
| `70afadc` | feat: formulário de acessos em linha, switch liga/desliga na tabela de acessos |
| `fe95580` | style: melhora visual e responsividade do dashboard |
| `2465a99` | feat: acesso por WhatsApp + senha de 4 dígitos, contagem e data de último acesso |
| `f07fbd5` | feat: login por WhatsApp, primeiro acesso com senha padrão 1234, troca obrigatória |
| `0385b9d` | feat: cadastro de acessos com WhatsApp e Senha, visível apenas para ADM |
| `a528965` | feat: sistema de gerenciamento de acessos (ADM), QR Code e envio de link via WhatsApp |
| `ea43b00` | feat: integração com Google Sheets no backend, autenticação e layouts de impressão |
| `0c5f120` | feat: inicialização do projeto SEDUC |

---

## Histórico de Tags

| Tag | Commit | Data | Descrição |
|---|---|---|---|
| `v1.1.12` | — | 2026-08-24 | Recarregamento geral de assets (cache busters) |
| `v1.0.53` | `957b674` | 2026-08-16 | Escolas: badges, modalidades, NaN fix |
| `v1.0.52` | `4be54b2` | 2026-08-15 | Mesclagem escolas estaduais/municipais |
| `v1.0.49` | `adf5a15` | 2026-08-14 | Fix Todas Escolas + erros de sintaxe JS |
| `v1.0.46` | `8f9d7ef` | 2026-08-13 | Fix ReferenceError em escolas.js |
| `v1.0.45` | `ca5815f` | 2026-08-13 | Fix impressão síncrona + login styling |

