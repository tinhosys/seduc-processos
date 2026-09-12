# CHANGELOG — SEDUC Processos (CAM/SEDUC-RO)

> Sistema de Acompanhamento de Convênios, Contratos e Escolas
> Repositório: `seduc-processos` · Branch: `main`

## [v1.2.75] — 2026-09-12 🟢 VERSÃO ATUAL

**Tag:** `v1.2.75` · **Versão do Sistema:** `GBZ - v1.2.75`

### 📱 Visualização Otimizada para Mobile com Balão Pop-up (Imagem 1)
- **Truncamento Inteligente em 9 Dígitos**: Em telas menores/mobile (resolução <= 768px), as colunas com espaço restrito (`Nº PROCESSO`, `INTERESSADO`, `OBJETO`, `STATUS` e `LOCALIZAÇÃO`) exibem os 9 primeiros dígitos seguidos de reticências (`...`).
- **Botão Discreto de Lupa (`🔍`)**: Adicionado botão compacto em cada célula truncada no mobile que, ao ser clicado sem disparar a navegação da linha, abre um balão pop-up flutuante contendo o conteúdo completo legível e botão de cópia rápida.
- **Isolamento Completo Desktop**: No computador/desktop, a tabela preserva 100% da sua exibição original e marcações de busca sem qualquer alteração.

### 💬 Mensagens e Toasts à Frente do Modal de Compartilhar (Imagem 2)
- **Elevação do Z-Index das Notificações**: Ajustado o `#toast-container` com `z-index: 10000005 !important` e `pointer-events: all !important`. Agora, ao clicar em "Copiar Imagem", "Copiar Texto", "Baixar Imagem" ou "Enviar", o balão de confirmação aparece na frente da tela de Compartilhamento, perfeitamente visível.

### 🟢 Destaque em Verde Sólido para Linha e Status "PAGO" (Imagem 3)
- **Realce da Linha PAGO**: Linhas cujo status seja `PAGO` recebem classe `.linha-pago` com borda lateral verde sólida (`#10b981`) e fundo translúcido esmeralda.
- **Badge PAGO Sólido**: A etiqueta do status `PAGO` foi reformulada de ciano para verde sólido institucional vibrante (`background: #10b981 !important; color: #ffffff !important; box-shadow: 0 0 8px rgba(16,185,129,0.45);`), conferindo destaque imediato na listagem.

---

## [v1.2.74] — 2026-09-10

**Tag:** `v1.2.74` · **Versão do Sistema:** `GBZ - v1.2.74`

### 🐛 Correção de Exceção (Imagem 1)
- **Eliminação do Erro de Referência**: Resolvido `Promise Rejeitada: ReferenceError: busca is not defined` no módulo de mapas (`js/mapa.js`), encapsulando com segurança a busca inteligente apenas no escopo onde `busca` é declarada.

### 📐 Reorganização Harmônica no Topo (Imagem 2)
- **Botões Acomodados no Topo em 2 Linhas Harmônicas**:
  - **Linha 1**: Badges de Valor e Total de Processos + Botões de Relatório Principais (`COMPARTILHAR`, `ANÁLISE`, `DETALHADO`, `PADRÃO`, `PADRÃO SEL.`).
  - **Linha 2**: Relatórios Administrativos (`PADRÃO ADM`, `RELATÓRIO ADM 2`) + Ferramentas (`EXCEL`, `PLANILHA`) + **Botão `LIMPAR PARÂMETROS` à extrema direita**.
  - **Identidade Visual Uniforme**: Padronização de altura (34px), tipografia, espaçamentos e paleta sóbria em estilo vidro escuro com sutis acentos coloridos, eliminando a poluição visual anterior.
- **Encurtamento do Campo Objeto & Alinhamento com Dígito**:
  - O campo `OBJETO` foi encurtado e posicionado lado a lado na mesma linha com `GRUPO (DÍGITO)` e seus seletores de condição (`=`, `<>`), desocupando a linha dos filtros de municípios.
  - A linha seguinte agora abriga confortavelmente apenas os 5 filtros fundamentais: `MUNICÍPIO`, `SUPER`, `PREFIXO`, `LOCALIZAÇÃO` e `STATUS`.
- **Botão Limpar Parâmetros à Direita**:
  - Posicionado com destaque à direita da barra superior de ações (`margin-left: auto`), com gradiente âmbar e ícone nítido, sempre visível e acessível imediatamente para todos os usuários.

---

## [v1.2.73] — 2026-09-10

**Tag:** `v1.2.73` · **Versão do Sistema:** `GBZ - v1.2.73`

### 🗑️ Remoção dos Botões Inoperantes de Cadastro em GMAC (Imagens 1 e 2)
- **Exclusão de Botões `+ Novo Registro`**: Removidos os botões em todas as seções de GMAC onde estavam inoperantes ou desnecessários (`#page-gmac-aee`, `#page-gmac-onibus`, `#page-gmac-veiculos`, `#page-gmac-reordenamento` e `#page-gmac-cooperacao`).

### 📜 Regra de Ouro de Rolagem Vertical Sob Demanda (Imagem 4)
- **Ativação Inteligente de Rolagem**: Definido `overflow-y: auto !important` em `.page.active` e especialmente no painel de **Informações do Sistema & Diagnóstico Operacional** (`#page-sistema-info.active`).
- Sempre que o conteúdo ultrapassar a altura da viewport, a barra de rolagem vertical suave e estilizada é acionada automaticamente, permitindo visualização completa de sessões ativas e métricas globais sem cortes.

### 🗺️ Calibração Geográfica Avançada e Busca Inteligente no Mapa de Escolas (Imagem 3)
- **Resolução do Agrupamento Centralizado (Espiral Única)**: Corrigido o bug na resolução da chave municipal no dicionário de bairros que fazia com que todas as escolas caíssem em um único ponto em Porto Velho.
- **Mapeamento de Distritos e Bairros**: Adicionadas coordenadas exatas de distritos de Porto Velho (Jaci-Paraná, Nova Mutum, Extrema, Vista Alegre do Abunã, União Bandeirantes, Calama, etc.) e mais de 50 bairros urbanos.
- **Dispersão Geográfica Determinística**: Implementado cálculo de dispersão realista baseado no identificador único de cada escola, eliminando círculos artificiais compactados.
- **Busca com Foco Automático (`flyTo`)**: Ao pesquisar por nome da escola, INEP ou município, o mapa agora voa suavemente com zoom até a escola localizada e destaca o ponto no mapa.
- **Correção no Filtro de Competência**: Corrigida a validação para verificar `e.competencia` (Estadual/Municipal).

---

## [v1.2.72] — 2026-09-10

**Tag:** `v1.2.72` · **Versão do Sistema:** `GBZ - v1.2.72`

### 📐 Padronização Universal de Telas em 100% (Padrão Imagem 2)
- **Extinção de Formulários Estourados ou Desproporcionais:** Unificada a geometria de todos os formulários do sistema para **100% de largura contínua** (`width: 100%; box-sizing: border-box`), eliminando larguras forçadas (`1700px`, `1400px`) que deformavam a tela de processos em relação ao padrão ideal visto no GDSM.
- **Botões, Busca e Parâmetros SEMPRE Visíveis:** O cabeçalho de contadores/badges (`.section-header`), os campos de busca e filtros (`.filters-bar`) e a barra de ações (`.action-toolbar-scroll`) receberam travamento estrito (`flex-shrink: 0`), permanecendo permanentemente acessíveis e fixos no topo do viewport durante toda a navegação.

### 🔄 Rolagem Inteligente sob Demanda (Auxiliar Apenas Quando Necessário)
- **Eliminação do `overflow: scroll` Forçado:** Substituído por `overflow: auto` em todas as tabelas. Em telas de computador normais, a tabela se ajusta perfeitamente em 100% sem exibir nenhuma barra de rolagem horizontal desnecessária.
- **Ferramenta Auxiliar Elegante:** Em celulares, tablets ou visões com zoom, a barra de rolagem horizontal surge de forma fluida e discreta (8px) com controle deslizante azul (`#3b82f6`), sem quebrar a estrutura da página.

### 📱 Responsividade Completa (Celulares e Tablets)
- **Adaptação para Dispositivos Móveis:** Media queries dedicadas para telas de até 1024px e até 768px, reorganizando cards, quebrando parâmetros harmoniosamente e permitindo rolagem horizontal suave com aceleração de toque (`-webkit-overflow-scrolling: touch`).

---

## [v1.2.71] — 2026-09-10

**Tag:** `v1.2.71` · **Versão do Sistema:** `GBZ - v1.2.71`

### 🧼 Limpeza e Padronização de Relatórios e Cabeçalhos
- **Remoção de 'SISEDU':** A palavra 'SISEDU' foi suprimida do canto superior direito de absolutamente todos os relatórios impressos, telas de visualização e imagens de compartilhamento (Processos, Diárias, Escolas, GMAC, Orçamento, Proalfa e GDSM).
- **Cabeçalho Minimalista do Modal de Compartilhar:** O cabeçalho foi simplificado para exibir exclusivamente o título **"Compartilhar"**, eliminando subtítulos e textos poluídos conforme solicitado.

### 🛡️ Eliminação de Caracteres 'Zumbis' e Correções Ortográficas
- **Dashboard sem Zumbis (Imagem 2):** Substituídos todos os caracteres corrompidos (`â ³`, `â °`, etc.) por ícones vetoriais SVG de alta definição nos cards de *Pendentes/Aguardando*, título de *Alertas de Prazos (Datas)*, e nos alertas de *Processos sem Data* e *Data Mais Antiga*.
- **Ajuste de Menu (Imagem 3):** O item do menu lateral foi alterado de `Escolas & Mapas` para **`Escolas | Mapas`**.
- **Correção Ortográfica (Imagem 4):** Corrigido o termo `úúnicos` para **`únicos`** na mensagem de tela de processos repetidos.

### 📊 Restauração da Barra Horizontal de Extensão da Base nos Formulários de Dados
- **Barra de Rolagem Destacada (12px):** Recriada a barra horizontal com trilho em alto contraste e controle deslizante em gradiente azul (`#2563eb` a `#3b82f6`), permitindo ao usuário observar confortavelmente toda a extensão das colunas da base de dados em todos os formulários (GDSM Regimes, Demais, Doações, Novo Regime, Processos, Repetidos, etc.).
- **Preservação Estrita dos Parâmetros:** A barra de filtros e parâmetros de pesquisa permanece limpa e sem rolagem horizontal indesejada, atuando estritamente sobre a área que contém os registros e dados.

---

## [v1.2.70] — 2026-09-10

**Tag:** `v1.2.70` · **Versão do Sistema:** `GBZ - v1.2.70`

### 🔄 Inversão da Posição dos Botões no Modal de Compartilhamento
- **Nova Sequência de Ações:**
  1. `[Enviar]` (Ícone oficial do WhatsApp)
  2. `[Copiar Imagem]` (Ícone de cópia padrão Windows)
  3. `[Copiar Texto]` (Ícone de copiar documento/texto)
  4. `[Baixar Imagem (PNG)]` (Ícone de download de imagem)
  5. `[Baixar PDF]` (Ícone de arquivo PDF)
- **Troca Estratégica:** Os botões **Copiar Texto** e **Baixar Imagem (PNG)** tiveram suas posições invertidas conforme solicitado, agrupando as funções de cópia direta em sequência contígua.

### 💎 Novo Aspecto Visual dos Botões e Ícones Vetoriais Oficiais
- **Ícone Oficial do WhatsApp:** Substituído o emoji genérico pelo logo vetorial SVG oficial do WhatsApp com gradiente característico (`#25D366` / `#128C7E`).
- **Ícone Copiar Imagem Padrão Windows:** Implementado o ícone de folhas sobrepostas de recorte/cópia no estilo Fluent do Windows.
- **Ícone Copiar Texto:** Ícone de prancheta/documento com linhas de texto estruturado.
- **Ícone Baixar Imagem (PNG):** Ícone de arquivo de imagem com vetor de download.
- **Ícone Baixar PDF:** Ícone de documento com marca de dobra e cor vermelha/carmesim característica de PDF (`#dc2626`).
- **Efeitos de Transição e Sombreamento:** Botões com gradientes suaves, elevação dinâmica ao passar o mouse (`transform: translateY(-1px)`), brilho interativo e acessibilidade aprimorada.

---

## [v1.2.69] — 2026-09-09

**Tag:** `v1.2.69` · **Versão do Sistema:** `GBZ - v1.2.69`

### 💰 Exibição Completa da Coluna VALOR R$ no Relatório Canvas
- **Correção da Largura do Canvas e Proporções de Coluna:** Ajustada a geometria do canvas para 1280px de largura com tabela de 1200px exatos, eliminando qualquer corte no lado direito e assegurando que a coluna **VALOR R$** e seus valores fiquem 100% visíveis, nítidos e perfeitamente alinhados à direita.
- **Soma Rigorosa das Colunas (1200px):**
  - *Nº (36px)* | *PREFIXO (86px)* | *MUNICÍPIO (130px)* | *PROCESSO SEI (144px)* | *INTERESSADO (174px)* | *OBJETO / FINALIDADE (260px)* | *STATUS (105px)* | *LOCAL (85px)* | *DATA (75px)* | *VALOR R$ (105px)* = 1200px exatos.
- **Alinhamento do TOTAL GERAL:** O rótulo `TOTAL GERAL (X processos):` e o valor total em negrito estão alinhados rigorosamente sob a coluna do valor, com moldura e linhas de grade contínuas.

### 🎨 Refinamento Visual e Estética Aprimorada ("Capricho Visual")
- **Quebra Inteligente de Linhas:** Nomes de municípios, interessados e objetos longos são subdivididos de forma limpa em até duas linhas, evitando truncamentos com reticências.
- **Formatação de Status e Localização:** Status como `N/ AUTORIZADO` e locais com separador `|` são dispostos verticalmente com destaque de cores (verde para autorizados/pagos, laranja para notificados, vermelho para duplicados/cancelados).
- **Indicadores Visuais do Prefixo:** As esferas de acompanhamento (*CAM*, *GAB*, *CC*) contam com espaçamento simétrico e círculos perfeitamente preenchidos ou delineados.
- **Modal de Compartilhamento:** Adicionada capacidade de ampliação ao clicar na imagem (`cursor: zoom-in`), barra de rolagem suave e layout adaptado sem estouro de tela.

---

## [v1.2.68] — 2026-09-09

**Tag:** `v1.2.68` · **Versão do Sistema:** `GBZ - v1.2.68`

### 📝 Agrupamento por PREFIXO no "Copiar Texto" (Imagem 3)
- **Estrutura Solicitada:** O texto gerado para o WhatsApp agora agrupa rigorosamente os processos por **PREFIXO**:
  ```text
  "PREFIXO"
  1 - "MUNICIPIO" | "ESCOLA" | "PROCESSO SEI" | "VALOR"
  2 - ...
  ```
- **Eliminação de Links Supérfluos:** Removidos links e rodapés poluídos da mensagem, deixando o texto limpo, direto e profissional para envio aos contatos e secretários.

### 🖼️ Layout de Imagem Idêntico ao Relatório Padrão (Imagem 1 = Imagem 2)
- **Fidelidade Visual 100%:** A imagem gerada pelo botão **COMPARTILHAR** agora reproduz exatamente a mesma diagramação, cabeçalho e tabela do relatório padrão de impressão oficial:
  - Cabeçalho institucional do Governo de Rondônia / SEDUC / CAM e selo SISEDU.
  - Tabela completa de 10 colunas: *Nº, PREFIXO, MUNICÍPIO, PROCESSO SEI, INTERESSADO, OBJETO / FINALIDADE, STATUS, LOCAL, DATA, VALOR R$*.
  - Bloco do **PREFIXO** com categoria, tipo e os 3 indicadores de esferas (*CAM, GABINETE, CASA CIVIL*).
  - Linha de **TOTAL GERAL (X processos):** com valor oficial formatado à direita.
  - Rodapé com gerência GDSM, numeração de página e data/hora oficial de geração eletrônica.

### ⚡ Esquema Ultra-Rápido de Compartilhamento
- **Copiar Imagem Diretamente (Clipboard API):** Novo botão que permite colar a imagem do relatório diretamente com **Ctrl+V** em qualquer janela do WhatsApp Web, sem necessidade de baixar e anexar arquivo.
- **Responsividade Aprimorada:** Estilos de contêiner e imagem com max-width 100% e overflow-x hidden, garantindo que o modal não estoure a tela nem quebre o layout da página em nenhuma resolução.

---

## [v1.2.67] — 2026-09-09 🟢 VERSÃO ATUAL

**Tag:** `v1.2.67` · **Versão do Sistema:** `GBZ - v1.2.67`

### 🛡️ Correção de Erro de Execução (Bugfix PROALFA)
- **Causa Raiz Resolvida:** Tratamento contra leitura assíncrona de chaves antes do carregamento completo do `proalfa.json` (eliminando o erro `TypeError: Cannot read properties of null`).
- **Resiliência e Carregamento:** Inicialização de `proalfaData` como objeto seguro `{}` e mecanismo de recarga sob demanda transparente ao selecionar qualquer aba.
- **Preservação Visual:** Ao alternar abas, os 4 botões mantêm seus gradientes vivos (Docentes: azul/índigo; Alunos: esmeralda/verde).

### 📤 Novo Botão COMPARTILHAR com Ícone Oficial de Nós / Rede
- **Substituição Visual:** Removido o botão antigo e adicionado o botão azul **COMPARTILHAR** com o ícone oficial de rede / compartilhamento.
- **Compartilhamento de Processos Marcados (PADRÃO SELEÇÃO):** O botão detecta automaticamente os processos selecionados com check na tabela e gera instantaneamente a imagem em alta resolução com a diagramação oficial do relatório **PADRÃO SELEÇÃO** (cabeçalho oficial, grade com colunas completas e totais).
- **Esquema de Compartilhamento Rápido:** Modal interativo completo com preview da imagem, botão de disparo no WhatsApp com texto estruturado, download de PNG e PDF.

---

## [v1.2.66] — 2026-09-09

**Tag:** `v1.2.66` · **Versão do Sistema:** `GBZ - v1.2.66`

### 🪙 Ajuste no Menu Orçamento & Financeiro
- **Submenu:** Renomeado o primeiro item de 'Orçamento' para **Financeiro**, mantendo o ícone das moedas douradas, e removido o terceiro item duplicado.
- **Botões Rápidos da Barra Lateral:** Substituído o nome de 'ORÇAMENTO' para **FINANCEIRO** e removidas as setas indicadoras (`▶`) dos 4 botões para um visual limpo e moderno.

### 📐 Alinhamento do Grupo Dígito e Parâmetros (=, <>) na Mesma Linha
- Correção do container `.filtro-digito-container` para exibição forçada em linha única (`display: inline-flex !important; flex-wrap: nowrap !important; height: 38px;`), mantendo o campo de texto do Dígito e os seletores de comparação (`=` e `<>`) rigorosamente alinhados horizontalmente com os demais filtros.

### 🎓 Formulário Unificado PROALFA (Professores e Alunos na Mesma Tela)
- **4 Botões Simultâneos:** Painel superior de controle reformulado para exibir todos os 4 botões de forma simultânea em grade 2x2 com números expressivos:
  1. **Docentes Municipais** (Total e filtro)
  2. **Docentes Estaduais** (Total e filtro)
  3. **Alunos Municipais** (Total e filtro)
  4. **Alunos Estaduais** (Total e filtro)
- Ao clicar em qualquer um dos 4 botões, a tabela e as métricas são chaveadas instantaneamente, sem necessidade de navegar entre abas separadas.

### 📱 Compartilhamento Rápido no WhatsApp (PDF & Imagem)
- **Novo Botão WhatsApp na Barra de Ações:** Gera instantaneamente um **Card Visual em Alta Resolução (PNG)** desenhado em Canvas com fundo escuro, resumo de valores e processos filtrados, acompanhado de **PDF Rápido** para download e texto com emojis pronto para envio no WhatsApp.

---

## [v1.2.65] — 2026-09-09 🟢 VERSÃO ATUAL

**Tag:** `v1.2.65` · **Versão do Sistema:** `GBZ - v1.2.65`

### 🛠️ Correção Completa de Dropdowns/Comboboxes, Scroll Vertical, Foco e Busca
- **Correção da Rolagem Vertical (Causa Raiz Resolvida):** O ouvinte global de `scroll` em fase de captura (`useCapture = true`) em `multi-select.js` estava fechando o dropdown imediatamente ao clicar ou rolar a barra de rolagem interna. Agora rolagens originadas no próprio dropdown são permitidas normalmente.
- **Acessibilidade e Foco em Comboboxes:** Adição de `tabindex="0"`, roles ARIA (`combobox`, `listbox`), suporte a navegação por teclado (`Enter`, `Space`, `Escape`, setas) e estilização de foco com halo luminoso azul.
- **Barra de Busca Rápida Interna:** Cada dropdown agora possui um campo de pesquisa no topo (`custom-multiselect-search`) com foco automático ao abrir, facilitando a filtragem instantânea entre mais de 52 municípios, dezenas de prefixos e status.
- **Eliminação de Rolagem Horizontal:** Aplicação estrita de `overflow-x: hidden !important;`, largura mínima de 240px e alinhamento espaçado para evitar colisões entre o título e os botões "Todos | Nenhum".

### 🧹 Remoção Cirúrgica de Caracteres Zumbis em Todos os Formulários
- Correção de textos corrompidos por dupla codificação UTF-8 em botões, tabelas e cabeçalhos:
  - `RELATÓRIO ADM 2` (era exibido com caracteres corrompidos).
  - `ANÁLISE` (eliminado espaço fantasma e caractere corrompido).
  - `PADRÃO ADM`, `PADRÃO`, `PADRÃO SEL.`.
  - `LOCALIZAÇÃO`, `MULTI-SELEÇÃO`, `SEÇÃO`, `DOAÇÃO DO ÔNIBUS ESCOLAR`, `Nº`.

### 🔘 4 Botões de Módulos Rápidos na Barra Lateral ('GDSM', 'GMAC', 'PROALFA', 'ORÇAMENTO')
- Criação de container estilizado (`.sidebar-quick-modules`) em sequência vertical logo abaixo da logo da CAM.
- Cores temáticas, badges de alta definição e efeitos hover com elevação e brilho.
- **Respeito aos Acessos e Regras de Perfil:** Implementação de `podeAcessarModulo(modulo)` em `auth-sap.js`, garantindo que usuários Admin acessem todos os módulos, usuários de setores específicos visualizem apenas suas áreas atribuídas e usuários Leitor respeitem suas restrições operacionais.

### 💳 Novo Item 'Financeiro' no Menu Orçamento com Formulário Dedicado
- Adição da opção **Financeiro** no submenu `#sub-orcamento` com ícone vetorial monetário exclusivo (`item-financeiro`).
- Efeito de foco luminescente esmeralda no hover e estado ativo (`box-shadow` neon e transição suave).
- Nova tela e formulário integrado (`#page-financeiro`) para lançamento e consulta de despesas, processos SEI, naturezas e dotações orçamentárias.

---

## [v1.2.61] — 2026-09-08

**Tag:** `v1.2.61` · **Versão do Sistema:** `GBZ - v1.2.61`

### 📏 Confinamento Estrito no Limite da Tela (Borda Direita) e Barra de Rolagem Horizontal na Base dos Forms

- **Limite Estrito no Limite da Tela (Borda Direita / Linha Amarela):**
  - Aplicação de `max-width: calc(100vw - var(--sidebar-w)) !important` e `width: calc(100vw - var(--sidebar-w)) !important` em `.main-content`, com `overflow-x: hidden !important; min-width: 0 !important;`.
  - Fixação de `width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;` em todos os formulários (`#page-processos`, `#page-repetidos`, `#page-gdsm-regimes`, `#page-gdsm-demais`, `#page-gdsm-doacoes`, `#page-gdsm-novoregime`) e em seus containers de tabela (`#gdsm-table-container-*` e `.table-wrap`), eliminando qualquer vazamento lateral para fora da tela.
- **Barra de Rolagem Horizontal Perfeita na Base das Tabelas:**
  - Posicionamento da barra de rolagem horizontal exatamente na base da área de dados da tabela (`overflow-x: auto !important; overflow-y: auto !important`), com design de alto contraste e thumb gradiente azul (`#2563eb` a `#3b82f6`) com largura mínima de 50px para arrasto fácil e ágil.
  - Dimensionamento dinâmico da largura das tabelas (`min-width: Math.max(1600, colunasExibidas.length * 135)px`) para que todas as 15 a 26 colunas da planilha Google possam ser percorridas fluidamente de ponta a ponta.
  - Tabela de Processos com largura mínima garantida de 1700px e Repetidos com 1400px.
- **Coluna Município Fixa Lateralmente (Sticky):**
  - Mantém a identificação do município sempre visível à esquerda durante toda a navegação horizontal pelas colunas da planilha.
- **Conformidade em Todos os Formulários:**
  - `Todos os Processos`, `Processos Repetidos`, `Regime de Colaboração`, `Demais Processos`, `Doações [Temporário]` e `Novo Regime`.

---

## [v1.2.60] — 2026-09-08

**Tag:** `v1.2.60` · **Versão do Sistema:** `GBZ - v1.2.60`

### 📐 Limite e Confinamento na Tela com Otimização de Espaço Vertical e Colunas Proporcionais

- **Ajuste Estrito ao Limite da Tela (Viewport Confinado):**
  - Confinamento estrutural da área ativa (`height: calc(100vh - 68px)` com `overflow: hidden`), impedindo o estouro da janela principal do navegador e eliminando rolagem fantasma no body.
  - Redução cirúrgica dos paddings da página de `16px 28px` para `8px 20px 6px 20px`, liberando dezenas de pixels úteis verticalmente para a tabela.
- **Header e Badges em Linha Horizontal Compacta:**
  - Migração dos cards de Valor Filtrado e Qtd Registros de empilhamento vertical (que consumiam ~100px) para **linha horizontal única** com altura de 34px (`display: flex; flex-direction: row; gap: 10px; align-items: center;`).
  - Economia imediata de mais de 65px no cabeçalho dos formulários de `Processos`, `Regime`, `Demais Processos`, `Doações` e `Novo Regime`.
- **Dimensões e Proporções de Planilha Otimizadas (Mais Linhas e Mais Colunas Visíveis):**
  - **Altura de Linha Reduzida (Mais Linhas):** Padding das células recalculado para `6px 10px` e fonte `11.5px` (altura de linha ~31px), permitindo visualizar **15 a 20+ linhas diretamente na tela** (contra apenas 5 antes).
  - **Largura Proporcional das Colunas (Mais Colunas):** Calibração das colunas (`Município`: 130px com congelamento lateral, `Status`: 95px, `Processo SEI`: 150px, `Tipo`: 95px, `Quant`: 60px, `Objeto`: 220px, `Valores`: 115px, `Datas`: 90px), passando de apenas 5 colunas para **10 a 12 colunas simultâneas visíveis** sem necessidade de rolagem lateral imediata.
- **Navegação pelas Barras de Rolagem Gêmeas e Paginação Sempre Acessível:**
  - A barra de paginação agora fica perfeitamente visível e fixada no rodapé da visualização (`flex-shrink: 0; padding: 6px 14px`), sem ser cortada da tela.
  - Navegação suave e fluida pelas barras gêmeas azul elétrico (vertical e horizontal) em todos os formulários.

---

## [v1.2.59] — 2026-09-08

**Tag:** `v1.2.59` · **Versão do Sistema:** `GBZ - v1.2.59`

### ♊ Barras de Rolagem Gêmeas (Vertical e Horizontal Idênticas) e Responsividade Confinada

- **Barras de Rolagem Idênticas (Gêmeas):**
  - Implementada barra de rolagem horizontal perfeitamente idêntica à barra de rolagem vertical (ambas com 12px de largura/altura, cursor gradiente azul `#2563eb` a `#3b82f6`, borda refinada e trilho contrastante escuro `#090e1a`).
  - Rolagem horizontal permanente (`overflow-x: scroll !important`) em todas as tabelas, assegurando que o controle de scroll lateral esteja sempre visível e responsivo no rodapé.
- **Responsividade e Confinamento das Barras dentro da Página:**
  - O término inferior e lateral das barras respeita estritamente o layout e padding dos containers (`box-sizing: border-box; width: 100%; max-width: 100%`), com canto de junção (`::-webkit-scrollbar-corner`) limpo e escuro.
  - Largura mínima dinâmica com cálculo proporcional nas tabelas GDSM (`min-width: Math.max(1600, colunas * 150)px`), Processos (1500px), Repetidos (1350px) e GMAC, assegurando espaçamento confortável e legibilidade máxima.
- **Aplicação em Todos os Formulários Necessários:**
  - `Todos os Processos`, `Processos Repetidos`, `Regime`, `Demais Processos`, `Doações [Temporário]`, `Novo Regime` e módulos `GMAC`.

---

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

