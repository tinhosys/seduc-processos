// ============================================================
// SEDUC — Auditoria e Logs de Ações
// ============================================================

const LOGS_DB_KEY = 'seduc_logs_v1';

const Logger = {
  getLogs: function() {
    try {
      const raw = localStorage.getItem(LOGS_DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  saveLogs: function(logs) {
    localStorage.setItem(LOGS_DB_KEY, JSON.stringify(logs));
  },

  /**
   * Loga uma ação no sistema
   * @param {string} acao - "CRIOU_PROCESSO", "EDITOU_PROCESSO", "EXCLUIU_PROCESSO", "LOGIN", etc.
   * @param {string} detalhe - Texto explicativo ou id do alvo
   */
  log: function(acao, detalhe = '') {
    const user = Auth.getCurrentUser();
    const logs = this.getLogs();
    
    const novoLog = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      userId: user ? user.id : 'Sistema',
      userName: user ? user.nome : 'Desconhecido',
      acao: acao,
      detalhe: detalhe,
      timestamp: new Date().toISOString()
    };

    // Adiciona no topo (mais recente primeiro)
    logs.unshift(novoLog);
    
    // Mantém no máximo 500 logs para não pesar no localStorage
    if (logs.length > 500) logs.pop();

    this.saveLogs(logs);
  }
};
