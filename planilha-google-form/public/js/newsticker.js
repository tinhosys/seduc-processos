/* ==============================================================================
   SEDUC-PROCESSOS - Monitor de Notícias On-Line & RSS Feed Ticker Dinâmico
   Adaptado com layout flex nativo de rodapé, suporte a portais (G1, Folha, CNN,
   Globo, Jovem Pan, Rondônia ao Vivo, UOL, Terra, Último Minuto e Roxo News),
   com rotação contínua e modal de configuração completo.
   ============================================================================== */

window.newsTickerModule = {
  feedUrl: '',
  newsItems: [],
  intervalId: null,
  clockIntervalId: null,
  animationFrameId: null,
  scrollOffset: 0,
  scrollSpeed: 0.85,
  isPaused: false,
  hoverListenersAttached: false,
  isHidden: false,
  STORAGE_PREF_KEY: 'seduc_news_ticker_pinned',
  STORAGE_FEED_KEY_PREFIX: 'seduc_news_feed_url',
  DEFAULT_FEED: 'https://g1.globo.com/rss/g1/ro/rondonia/',

  // Portais e Feeds RSS Homologados
  FEEDS_HOMOLOGADOS: {
    rondoniaovivo: 'https://www.rondoniaovivo.com/rss.xml',
    g1_ro: 'https://g1.globo.com/rss/g1/ro/rondonia/',
    g1_brasil: 'https://g1.globo.com/rss/g1/brasil/',
    globo_educacao: 'https://g1.globo.com/rss/g1/educacao/',
    cnn_brasil: 'https://www.cnnbrasil.com.br/feed/',
    jovempan: 'https://jovempan.com.br/feed',
    uol_noticias: 'https://rss.uol.com.br/feed/noticias.xml',
    terra_noticias: 'https://www.terra.com.br/rss/feed/',
    folha_mercado: 'https://feeds.folha.uol.com.br/mercado/rss091.xml',
    ultimominuto: 'https://ultimosegundo.ig.com.br/rss.xml',
    roxo_news: 'https://roxo.news/feed/'
  },

  // Notícias Iniciais Pré-Carregadas (Execução Imediata e Fallback)
  FALLBACK_NEWS: [
    {
      title: 'SEDUC-RO avança no regime de colaboração pedagógica e financeira com os municípios',
      link: 'https://rondonia.ro.gov.br/seduc/',
      category: 'EDUCAÇÃO RO'
    },
    {
      title: 'Programa Proalfa Rondônia impulsiona investimentos na infraestrutura de escolas municipais',
      link: 'https://rondonia.ro.gov.br/seduc/',
      category: 'PROALFA'
    },
    {
      title: 'FUNDEB: portaria estabelece novas diretrizes para repasses e cooperação interfederativa',
      link: 'https://g1.globo.com/educacao/',
      category: 'LEGISLAÇÃO'
    },
    {
      title: 'Rondônia ao Vivo: Notícias em tempo real sobre desenvolvimento e gestão pública no Estado',
      link: 'https://www.rondoniaovivo.com',
      category: 'RONDÔNIA'
    },
    {
      title: 'CNN Brasil: Análise econômica e os impactos fiscais nas transferências aos municípios',
      link: 'https://www.cnnbrasil.com.br',
      category: 'ECONOMIA'
    },
    {
      title: 'G1 Rondônia: Acompanhe as principais informações sobre educação e municípios em RO',
      link: 'https://g1.globo.com/ro/rondonia/',
      category: 'G1 RO'
    }
  ],

  init() {
    console.log('Iniciando Monitor de Notícias RSS Ticker...');
    this.loadSavedFeedUrl();
    this.createDomElements();
    this.fetchNews();
    this.startClock();

    // Atualiza o feed RSS periodicamente a cada 5 minutos
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.fetchNews(), 5 * 60 * 1000);
  },

  loadSavedFeedUrl() {
    try {
      const saved = localStorage.getItem(this.STORAGE_FEED_KEY_PREFIX);
      this.feedUrl = saved || this.DEFAULT_FEED;
    } catch (e) {
      this.feedUrl = this.DEFAULT_FEED;
    }
  },

  saveFeedUrl(url) {
    if (!url) return;
    this.feedUrl = url.trim();
    try {
      localStorage.setItem(this.STORAGE_FEED_KEY_PREFIX, this.feedUrl);
      if (typeof toast === 'function') {
        toast('Fonte de Notícias (RSS) atualizada!', 'success');
      }
    } catch (e) {}
    this.fetchNews();
  },

  createDomElements() {
    if (document.getElementById('seduc-news-ticker-container')) return;

    const tickerHtml = `
      <div id="seduc-news-ticker-container" style="position:fixed; bottom:0; left:0; right:0; height:38px; background:linear-gradient(90deg, #0f172a, #1e293b); border-top:1px solid rgba(56,189,248,0.3); z-index:9999; display:flex; align-items:center; justify-content:space-between; padding:0 12px; font-family:system-ui,-apple-system,sans-serif; box-shadow:0 -4px 15px rgba(0,0,0,0.4); box-sizing:border-box;">
        
        <!-- LADO ESQUERDO: RELÓGIO & BADGE DESTAQUES -->
        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); padding:3px 8px; border-radius:6px;">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 6px #10b981;"></span>
            <span id="seduc-ticker-clock">--/--/---- --:--:--</span>
          </div>

          <button type="button" onclick="newsTickerModule.openConfigModal()" style="display:inline-flex; align-items:center; gap:5px; background:linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.2)); color:#c084fc; border:1px solid rgba(168,85,247,0.4); padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800; cursor:pointer;" title="Clique para configurar o Feed RSS de Notícias">
            <span>⚡</span>
            <span>Destaques</span>
          </button>
        </div>

        <!-- CENTRO: MARQUEE SCROLL CONTÍNUO DE NOTÍCIAS -->
        <div id="seduc-ticker-marquee-track" style="flex:1; overflow:hidden; position:relative; height:100%; display:flex; align-items:center; margin:0 14px; cursor:pointer;" onmouseenter="newsTickerModule.isPaused=true" onmouseleave="newsTickerModule.isPaused=false">
          <div id="seduc-ticker-content" style="display:flex; align-items:center; gap:28px; white-space:nowrap; will-change:transform; font-size:12px; color:#f1f5f9;">
            <span style="color:#94a3b8;">Carregando últimas notícias em tempo real...</span>
          </div>
        </div>

        <!-- LADO DIREITO: CONFIGURAR & OCULTAR -->
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          <button type="button" onclick="newsTickerModule.openConfigModal()" style="background:none; border:none; color:#94a3b8; hover:color:#38bdf8; font-size:14px; cursor:pointer; padding:4px;" title="Configurar Feeds de Notícias (RSS)">
            ⚙️
          </button>
          <button type="button" onclick="newsTickerModule.toggleVisibilidade()" id="btn-toggle-ticker-view" style="display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); padding:3px 8px; border-radius:5px; font-size:10.5px; font-weight:700; cursor:pointer;" title="Ocultar barra de notícias">
            <span>📌</span>
            <span id="label-ticker-toggle">Ocultar</span>
          </button>
        </div>

      </div>

      <!-- BOTÃO FLUTUANTE PARA RESTAURAR / REMOSTRAR O TICKER QUANDO OCULTO (IMAGEM 1) -->
      <button type="button" id="btn-restore-news-ticker" onclick="newsTickerModule.toggleVisibilidade()" style="display:none; position:fixed; bottom:8px; right:12px; z-index:9998; background:linear-gradient(135deg, #0f172a, #1e293b); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:6px 14px; border-radius:20px; font-size:11.5px; font-weight:800; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.6); align-items:center; gap:6px; font-family:system-ui,-apple-system,sans-serif; transition:all 0.2s;" title="Clique para exibir novamente a barra de notícias em tempo real">
        <span>⚡</span>
        <span>Notícias</span>
        <span style="font-size:12px;">▲</span>
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', tickerHtml);
  },

  startClock() {
    const el = document.getElementById('seduc-ticker-clock');
    if (!el) return;
    const upd = () => {
      const now = new Date();
      el.textContent = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    };
    upd();
    if (this.clockIntervalId) clearInterval(this.clockIntervalId);
    this.clockIntervalId = setInterval(upd, 1000);
  },

  async fetchNews() {
    const url = this.feedUrl || this.DEFAULT_FEED;
    try {
      // Usa serviços proxy públicos CORS amigáveis para leitura do RSS XML
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
      const res = await fetch(proxyUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Falha HTTP proxy');
      const text = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const items = Array.from(xmlDoc.querySelectorAll('item'));

      if (items.length > 0) {
        this.newsItems = items.slice(0, 15).map(it => {
          const title = it.querySelector('title')?.textContent || '';
          const link = it.querySelector('link')?.textContent || '';
          const category = it.querySelector('category')?.textContent || 'NOTÍCIAS';
          return { title, link, category: category.toUpperCase() };
        });
      } else {
        this.newsItems = this.FALLBACK_NEWS;
      }
    } catch (e) {
      console.warn('Uso do fallback de notícias devido a restrição de rede/CORS:', e.message);
      this.newsItems = this.FALLBACK_NEWS;
    }
    this.renderNews();
  },

  renderNews() {
    const container = document.getElementById('seduc-ticker-content');
    if (!container) return;

    if (!this.newsItems || this.newsItems.length === 0) {
      this.newsItems = this.FALLBACK_NEWS;
    }

    // Duplica os itens para criar o efeito contínuo infinito sem gaps
    const itemsDoubled = this.newsItems.concat(this.newsItems);

    container.innerHTML = itemsDoubled.map((item, idx) => {
      return `
        <a href="${item.link || '#'}" target="_blank" rel="noopener noreferrer" style="color:#e2e8f0; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#e2e8f0'">
          <span style="background:rgba(56,189,248,0.18); color:#38bdf8; font-size:9.5px; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid rgba(56,189,248,0.3); text-transform:uppercase;">${item.category || 'DESTAQUE'}</span>
          <span style="font-weight:600; font-size:11.5px;">${item.title}</span>
          <span style="color:#64748b; font-size:10px;">•</span>
        </a>
      `;
    }).join('');

    this.startMarqueeEngine();
  },

  startMarqueeEngine() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    const container = document.getElementById('seduc-ticker-content');
    if (!container) return;

    this.scrollOffset = 0;

    const animate = () => {
      if (!this.isPaused && container) {
        this.scrollOffset -= this.scrollSpeed;
        const totalWidth = container.scrollWidth / 2;
        if (Math.abs(this.scrollOffset) >= totalWidth) {
          this.scrollOffset = 0;
        }
        container.style.transform = `translateX(${this.scrollOffset}px)`;
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  },

  toggleVisibilidade() {
    const box = document.getElementById('seduc-news-ticker-container');
    const restoreBtn = document.getElementById('btn-restore-news-ticker');
    const lbl = document.getElementById('label-ticker-toggle');
    if (!box) return;
    this.isHidden = !this.isHidden;
    if (this.isHidden) {
      box.style.transform = 'translateY(100%)';
      box.style.transition = 'transform 0.3s ease';
      if (lbl) lbl.textContent = 'Mostrar';
      if (restoreBtn) restoreBtn.style.display = 'inline-flex';
    } else {
      box.style.transform = 'translateY(0)';
      box.style.transition = 'transform 0.3s ease';
      if (lbl) lbl.textContent = 'Ocultar';
      if (restoreBtn) restoreBtn.style.display = 'none';
    }
  },

  openConfigModal() {
    const currentUrl = this.feedUrl || this.DEFAULT_FEED;
    const modalHtml = `
      <div id="news-feed-config-modal" style="position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,0.75); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:16px;">
        <div style="background:#0f172a; border:1px solid rgba(56,189,248,0.35); border-radius:16px; max-width:560px; width:100%; padding:24px; box-shadow:0 12px 36px rgba(0,0,0,0.8); color:#f8fafc; font-family:system-ui,-apple-system,sans-serif;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:22px;">📡</span>
              <h3 style="margin:0; font-size:15px; font-weight:800; color:#fff;">Configurar Feed de Notícias (RSS)</h3>
            </div>
            <button onclick="document.getElementById('news-feed-config-modal').remove()" style="background:none; border:none; color:#94a3b8; font-size:24px; font-weight:bold; cursor:pointer;">&times;</button>
          </div>

          <div style="font-size:12px; line-height:1.5; color:#cbd5e1; margin-bottom:16px;">
            <p style="margin:0 0 10px 0;">
              O feed de notícias é dinâmico e pode exibir informações em tempo real dos maiores portais do Brasil e de Rondônia. Selecione um dos portais recomendados ou insira uma URL RSS personalizada:
            </p>

            <div style="margin-bottom:12px;">
              <label style="display:block; font-weight:800; color:#38bdf8; margin-bottom:4px;">URL do Feed RSS / Notícias:</label>
              <input type="url" id="input-rss-feed-url" value="${currentUrl}" placeholder="Ex: https://g1.globo.com/rss/g1/ro/rondonia/" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:#1e293b; color:#fff; font-size:11.5px; box-sizing:border-box;">
            </div>

            <div>
              <span style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; display:block; margin-bottom:6px;">Portais Recomendados:</span>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://www.rondoniaovivo.com/rss.xml'" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  🟢 Rondônia ao Vivo
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://g1.globo.com/rss/g1/ro/rondonia/'" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  🔵 G1 Rondônia
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://g1.globo.com/rss/g1/educacao/'" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  📚 G1 Educação
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://www.cnnbrasil.com.br/feed/'" style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  🔴 CNN Brasil
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://jovempan.com.br/feed'" style="background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  📻 Jovem Pan
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://rss.uol.com.br/feed/noticias.xml'" style="background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  🟡 UOL Notícias
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://www.terra.com.br/rss/feed/'" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  🌍 Terra Notícias
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://ultimosegundo.ig.com.br/rss.xml'" style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  ⏱️ Último Minuto
                </button>
                <button type="button" onclick="document.getElementById('input-rss-feed-url').value='https://roxo.news/feed/'" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.4); padding:5px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer;">
                  ⚡ Roxo News
                </button>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
            <button onclick="document.getElementById('news-feed-config-modal').remove()" style="padding:6px 14px; background:rgba(255,255,255,0.08); color:#cbd5e1; border:1px solid rgba(255,255,255,0.15); border-radius:6px; font-size:12px; cursor:pointer;">
              Cancelar
            </button>
            <button onclick="
              const val = document.getElementById('input-rss-feed-url')?.value;
              if (val) {
                newsTickerModule.saveFeedUrl(val);
                document.getElementById('news-feed-config-modal').remove();
              }
            " style="padding:6px 16px; background:linear-gradient(135deg,#38bdf8,#0284c7); color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 2px 8px rgba(56,189,248,0.4);">
              Salvar Fonte RSS
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
};

// Inicializa automaticamente quando o DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => newsTickerModule.init());
} else {
  newsTickerModule.init();
}
