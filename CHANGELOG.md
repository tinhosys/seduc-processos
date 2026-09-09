# CHANGELOG — SEDUC Processos (CAM/SEDUC-RO)

> Sistema de Acompanhamento de Convênios, Contratos e Escolas
> Repositório: `seduc-processos` · Branch: `main`

## [v1.2.58] — 2026-09-08

**Tag:** `v1.2.58` · **Versão do Sistema:** `GBZ - v1.2.58`

### 🔄 Barra Horizontal Fixa nas Tabelas de Todos os Formulários & Fixação de Município

- **Barra de Rolagem Horizontal Destacada na Base da Tela:**
  - Implementada barra de rolagem horizontal destacada com altura de 12px, contraste acentuado e cursor ergonômico na base das tabelas em todos os formulários da seção GDSM e Processos.
  - Confinamento inteligente de viewport (`height: calc(100vh - 68px)` com `overflow: hidden`), garantindo que a barra de rolagem horizontal permaneça **sempre visível e fixada no rodapé da visualização**, sem que o usuário precise descer até o final dos 50 registros para rolar lateralmente.
- **Aplicação Universal nos Formulários Marcados:**
  - **Todos os Processos (`#page-processos`):** Largura mínima de 1400px com scroll horizontal e vertical integrados.
  - **Processos Repetidos (`#page-repetidos`):** Largura mínima de 1250px com scroll horizontal suave.
  - **Regime (`#page-gdsm-regimes`):** Acesso lateral completo a todas as 26 colunas originais da planilha.
  - **Demais Processos (`#page-gdsm-demais`):** Visualização integral das 15 colunas.
  - **Doações [Temporário] (`#page-gdsm-doacoes`):** Acesso a todas as 12 colunas cadastrais e financeiras.
  - **Novo Regime (`#page-gdsm-novoregime`):** Visualização completa das 16 colunas.
- **Coluna Município Fixa no Scroll Lateral:**
  - Adicionado congelamento institucional da primeira coluna (**Município**) com `position: sticky; left: 0` e sombra de profundidade (`box-shadow: 2px 0 6px rgba(0,0,0,0.4)`), permitindo navegar por dezenas de colunas à direita mantendo sempre visível o município de referência.

---

## [v1.2.57] — 2026-09-08

**Tag:** `v1.2.57` · **Versão do Sistema:** `GBZ - v1.2.57`

### 📊 Barra Horizontal de Ações na Base dos Formulários & Compensação com Scroll

- **Botões de Ação na Página:**
  - Realocados todos os botões de ação (`SIMPLIFICADO`, `DETALHADO`, `EXCEL`, `PLANILHA`, `ATUALIZAR`, `LIMPAR PARÂMETROS` e relatórios de `Processos`) do canto superior direito para uma **barra horizontal dedicada na base dos formulários** da seção, logo antes das tabelas.
  - Distribuição ampla ao longo da largura da página (`width: 100%`), melhorando a ergonomia de uso e visibilidade.
- **Garantia de Visibilidade & Compensação com Rolagem Horizontal (`overflow-x: auto`):**
  - Implementada a classe `.action-toolbar-scroll` com suporte a rolagem horizontal suave, garantindo que nenhum botão seja espremido ou cortado em telas menores, notebooks ou com zoom ativado.
  - Barra de rolagem estilizada na base do componente (`scrollbar-width: thin`, cor personalizada e efeito hover).
  - Adicionada compensação com barra horizontal nas seções de filtros (`.filters-bar`), evitando quebras no layout.
  - Aplicação universal nos formulários de **Processos** e em todas as abas **GDSM** (**Regime**, **Demais Processos**, **Doações [Temporário]** e **Novo Regime**).

---

## [v1.2.56] — 2026-09-08

**Tag:** `v1.2.56` · **Versão do Sistema:** `GBZ - v1.2.56`

### 🧭 Reorganização de Formulários, Rótulos e Menu GDSM

- **Município como Primeiro Campo:**
  - Em todas as abas GDSM, o filtro de Município foi posicionado estrategicamente no início para acelerar a busca municipalista.
- **Renomeação de Menu:**
  - Atualizado o rótulo do menu de `32 Regimes` para `Regime`.
- **Exclusão de Aba Parâmetros:**
  - Removido o item e formulário da aba `Parâmetros`, otimizando a interface.

---

**Tag:** `v1.2.55` · **Versão do Sistema:** `GBZ - v1.2.55`

### 📑 Integração das 5 Abas da Planilha GDSM (Regimes de Colaboração)

- **Novos Botões no Menu GDSM (Sidebar):**
  - **32 Regimes:** Consulta completa dos regimes de colaboração com somatório financeiro (`R# CHANGELOG — SEDUC Processos (CAM/SEDUC-RO)

> Sistema de Acompanhamento de Convênios, Contratos e Escolas
> Repositório: `seduc-processos` · Branch: `main`

) e badges de status.
  - **Parâmetros:** Tabelas de referência de municípios, tipos, formas, entidades, superintendências e situações.
  - **Demais Processos:** Acompanhamento de processos e solicitações municipalistas.
  - **Doações [Temporário]:** Processos de doações definitivas, equipamentos escolares e obras de ampliação.
  - **Novo Regime:** Gestão dos novos regimes de colaboração.
- **Formulários de Consulta com Padrão de Processos:**
  - Barra de parâmetros com busca textual geral e filtros suspensos dinâmicos (Município, Status, Tipo e Situação).
  - Tabela paginada (50 itens por página com navegação rápida) e ordenação dinâmica por clique nas colunas.
  - Formatação inteligente de valores monetários (`R$ 0,00`), status coloridos e processos SEI.
- **Acesso Direto à Planilha Google:**
  - Botão **PLANILHA** em cada aba direcionando exatamente para a respectiva guia por seu `gid` (`gid=0`, `gid=398820041`, `gid=1655419194`, `gid=810185720`, `gid=134249734`).
- **2 Relatórios por Aba (Simplificado e Detalhado):**
  - **Relatório Simplificado:** Formato paisagem A4 com colunas estratégicas condensadas e total geral.
  - **Relatório Detalhado:** Formato paisagem A4 contendo todas as colunas originais e dados cadastrais completos.
  - Botão de exportação **EXCEL** (.xlsx) em todas as abas.

## [v1.2.54] — 2026-09-08

**Tag:** `v1.2.54` · **Versão do Sistema:** `GBZ - v1.2.54`

### 🪙 Ícone de Moedas no Submenu Orçamento

- **Novo Ícone de Moedas de Ouro (`Coins`):**
  - Substituído o ícone do submenu **Orçamento** (`#sub-orcamento`) por um par de **moedas douradas estilizadas** (`#facc15`), proporcionando excelente legibilidade e harmonia com o **Baú de Tesouro** do menu principal.
  - Otimização do traçado vetorial em 14x14px para nitidez máxima na navegação lateral escura.

---

## [v1.2.53] — 2026-09-08

**Tag:** `v1.2.53` · **Versão do Sistema:** `GBZ - v1.2.53`

### 🔓 Acesso Universal ao "Limpar Parâmetros" & Novos Ícones de Orçamento

- **Acesso ao Botão "Limpar Parâmetros" para Todos os Perfis:**
  - O botão **LIMPAR PARÂMETROS** no painel de Processos agora está disponível para todos os perfis de usuário (**Leitor, Editor, Gerente e Administrador**).
  - Removida a restrição de classe que o ocultava para usuários sem perfil administrativo/gerencial.
- **Novos Ícones Temáticos no Menu Orçamento:**
  - **Menu Principal "Orçamento":** Novo ícone vetorial exclusivo em formato de **Baú de Tesouro** com fechadura central e tiras de reforço metálicas em tom dourado/âmbar (`#f59e0b`).
  - **Submenu "Orçamento":** Novo ícone vetorial temático em formato de **Barra de Ouro / Lingote** (`#eab308`), diferenciando visualmente o agrupador principal do item de execução orçamentária com as melhores práticas de SVG.

---

## [v1.2.52] — 2026-09-07

**Tag:** `v1.2.52` · **Versão do Sistema:** `GBZ - v1.2.52`

### 📊 Otimização do Total e Layout de Impressão (Relatórios ADM e ADM 2)

- **Total Geral sem Quebra de Linha (`white-space: nowrap`):**
  - Acomodado o valor total na linha sem quebra de dígitos (ex.: `211.414.202,72` exibido integralmente em linha única).
  - Largura da coluna `VALOR R$` expandida de 8% para **12%** (+50% de espaço útil).
  - Ajustada a proporção das colunas com texto longo (`INTERESSADO` para 14% e `OBJETO` para 19%).
- **Destaque e Aumento do Tamanho do Total:**
  - Aumentado o tamanho da fonte do total para **12.5px** com peso em negrito (`font-weight: bold`) e padding aprimorado para destaque visual.
  - O rótulo `TOTAL GERAL (X processos)` ampliado para **11.5px** em negrito com `white-space: nowrap`.
  - Regra CSS `white-space: nowrap !important` aplicada diretamente nas células e na folha de impressão `@media print`.

---

## [v1.2.51] — 2026-09-07

**Tag:** `v1.2.51` · **Versão do Sistema:** `GBZ - v1.2.51`

### 🚀 Campo Dígito / Grupo Livre & Expansão de Largura

- **Dígito / Grupo Livre sem Limite de Caracteres:**
  - Removida a restrição de 8 caracteres (`maxlength="8"` e `slice(0,8)`). Agora o campo aceita qualquer quantidade de caracteres livres (letras, números, códigos).
  - Rotulado como **Grupo (Dígito)** no formulário e filtro, comunicando-se perfeitamente com a coluna de dígito da planilha Google Sheets/Excel.
- **Aumento de Largura dos Campos:**
  - O campo de filtro de Dígito/Grupo foi ampliado (de 175px para 220px) mantendo os parâmetros rápidos `=` e `<>`.
  - O campo de **busca geral** (`#filtro-busca`) foi ampliado com flex aumentado e `min-width: 320px` para melhor visualização e digitação confortável.
  - No formulário de edição/criação de processo, o campo **Grupo (Dígito)** foi ampliado para `min-width: 200px` com flex expandido.

---

## [v1.2.50] — 2026-09-07

**Tag:** `v1.2.50` · **Versão do Sistema:** `GBZ - v1.2.50`

### 📑 Ajustes no Relatório ADM 2 (Lista de processo | Grupo)

- **Ajuste de Título:**
  - Substituído o título de `LISTA DE PROCESSOS (AGRUPADO POR DÍGITO)` para `LISTA DE PROCESSO | GRUPO`.
- **Remoção da Palavra "DÍGITO":**
  - Removido o prefixo `DÍGITO:` das faixas separadoras verdes (`#008080`), exibindo diretamente o nome/código do grupo (ex.: `ALINH (6 PROCESSOS • R$ 4.800.000,00)`, `CANCEL (20 PROCESSOS • R$ 11.711.850,00)`).
- **Remoção Geral de Negritos:**
  - Aplicada tipografia uniforme e sem negrito (`font-weight: normal`) no título, nos totais do cabeçalho, nas linhas de grupo, no cabeçalho das colunas (`th`), na linha de totais e na legenda do rodapé.

---


## [v1.2.49] — 2026-09-07 🟢 VERSÃO ATUAL

**Tag:** `v1.2.49` · **Versão do Sistema:** `GBZ - v1.2.49`

### 🎨 Ajuste Visual — Separador de Grupos no Relatório ADM 2

- **Cor Padrão #008080 com Letras Brancas:**
  - A linha separadora de cada grupo de `DÍGITO` (ex.: `DÍGITO: 31`, `DÍGITO: SEM DÍGITO`) agora utiliza fundo verde-azulado padrão (`#008080`) com tipografia 100% branca (`#ffffff`).
  - Forçado suporte a impressão exata com `-webkit-print-color-adjust: exact` para garantir fidelidade visual tanto em tela quanto em PDF impresso.

---


## [v1.2.48] — 2026-09-07 🟢 VERSÃO ATUAL

**Tag:** `v1.2.48` · **Versão do Sistema:** `GBZ - v1.2.48`

### 📊 Novo "RELATÓRIO ADM 2" (Agrupamento por Dígito + Linha Memorando)

- **Novo Botão no Painel de Processos:**
  - Botão **RELATÓRIO ADM 2** adicionado ao lado de **PADRÃO ADM**, visível exclusivamente ao perfil **Admin** (`action-adm`).
- **Agrupamento por Dígito:**
  - Processos organizados em grupos separados por `DÍGITO` (1, 2, 3... e sem dígito), com barra de subtotais (quantidade de processos e valor total do grupo).
- **Linha Memorando na Largura Total:**
  - Abaixo de cada processo com apontamento, é inserida uma linha dedicada em itálico vermelho (`#dc2626`) contendo `AGRUPAMENTO - ANOTAÇÃO INTERNA`.
- **Estrutura Visual:**
  - Mantém a identidade descaracterizada (sem cabeçalhos/rodapés de origem governamental), tabela sem negritos e legenda completa de prefixos e autorizações no rodapé.

---


## [v1.2.47] — 2026-09-07 🟢 VERSÃO ATUAL

**Tag:** `v1.2.47` · **Versão do Sistema:** `GBZ - v1.2.47`

### 📑 Melhorias no Relatório Padrão ADM

- **Remoção de Negritos nas Células:**
  - Removido o peso em negrito das colunas da tabela de processos (Nº, Categoria/Tipo, Município, Status, Valor), mantendo tipografia limpa, leve e uniforme (`font-weight: normal`).
- **Nova Legenda Completa no Rodapé (`tfoot`):**
  - **Prefixos:** `C = Convênio | F = Fomento | OB = Obras | MP = Material Permanente | MC = Material Consumo`
  - **Autorizações:** Detalhamento da ordem das 3 bolinhas: `(1ª CAM | 2ª GAB SEDUC | 3ª CASA CIVIL)` e indicação visual de status: `● Autorizado | ○ Pendente`.

---


## [v1.2.46] — 2026-09-07 🟢 VERSÃO ATUAL

**Tag:** `v1.2.46` · **Versão do Sistema:** `GBZ - v1.2.46`

### 🐛 Fix Crítico — Impressão do Relatório Padrão ADM

- **Correção da Folha em Branco:**
  - Corrigido o seletor de ocultamento na impressão: removido o bloqueio sobre `.app-layout` (que encapsulava o próprio container de impressão `#print-layout-padrao-adm`), permitindo que a tabela seja impressa corretamente.
  - Ocultamento direcionado estritamente ao elemento ativo `#page-processos` durante a chamada de impressão, garantindo que nenhuma página anterior residual seja gerada.
- **Correção de Travamento / Tela Escura ao Fechar Impressão:**
  - Adicionado listener para o evento nativo `afterprint`, restaurando a visibilidade da interface imediatamente assim que a janela de impressão é fechada ou confirmada.
  - Limpeza síncrona de estilos e classes de impressão.

---


## [v1.2.45] — 2026-09-07 🟢 VERSÃO ATUAL

**Tag:** `v1.2.45` · **Versão do Sistema:** `GBZ - v1.2.45`

### 🖨️ Ajustes no Relatório Padrão ADM

- **Eliminação da Página 1 residual na Impressão:**
  - Ocultamento explícito do container `.app-layout` e seus componentes na impressão (`@media print` e manipulação direta do layout).
  - Garante que a impressão inicie diretamente no relatório descaracterizado, sem folhas em branco ou telas do sistema residuais antes da tabela.
- **Ajuste Tipográfico na Coluna PREFIXO:**
  - Fonte do prefixo reduzida em -2px (para `7px`).
  - Remoção do estilo negrito (`font-weight: normal`), conforme solicitado.
- **Sincronização de CSS:**
  - Regras de impressão aplicadas tanto em `css/style.css` quanto em `style.css`.

---


## [v1.2.44] — 2026-09-07 🟢 VERSÃO ATUAL

**Tag:** `v1.2.44` · **Versão do Sistema:** `GBZ - v1.2.44`

### 📄 Novo Relatório Padrão sem Origem (Exclusivo Admin)

- **Novo Botão "PADRÃO ADM":**
  - Adicionado à barra de ações superiores de Processos (posicionado à esquerda de ANÁLISE, conforme solicitado).
  - Visibilidade restrita exclusivamente aos usuários com perfil **Admin** (classe `action-adm`).
- **Novo Layout de Impressão:**
  - Mantém a mesma amostragem de dados do relatório Padrão (Nº, PREFIXO com badges e indicadores, MUNICÍPIO, PROCESSO SEI, INTERESSADO, OBJETO/FINALIDADE, STATUS, LOCAL, DATA, VALOR R$ e TOTAL GERAL).
  - **Sem informações de origem:** Remoção de cabeçalhos e rodapés institucionais (Governo do Estado de Rondônia, SEDUC, CAM, SISEDU, GDSM e carimbo de documento eletrônico).
  - **Novo Design:** Estilo executivo clean, cabeçalho moderno com barra ardósia (`#0f172a`), zebrado alternado nas linhas (`#ffffff` / `#f8fafc`), bordas refinadas e linha de totais em destaque.

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

