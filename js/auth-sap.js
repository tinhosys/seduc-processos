// ============================================================
// SAP — Módulo de Autenticação (Planilha Google Sheets)
// ============================================================

const SAP_SESSION_KEY = 'sap_session_token';
const SAP_USER_KEY    = 'sap_user_data';

var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://seduc-backend.onrender.com';


// Retorna o usuário da sessão atual, ou null
function getSessaoAtual() {
  try {
    const raw = sessionStorage.getItem(SAP_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// Salva sessão no sessionStorage (se fechar aba, perde o login)
function salvarSessao(token, usuario) {
  sessionStorage.setItem(SAP_SESSION_KEY, token);
  sessionStorage.setItem(SAP_USER_KEY, JSON.stringify(usuario));
}

// Limpa sessão
function limparSessao() {
  sessionStorage.removeItem(SAP_SESSION_KEY);
  sessionStorage.removeItem(SAP_USER_KEY);
}

// Aplica as restrições de UI baseadas no nível do usuário
function aplicarPermissoes(nivel) {
  const body = document.body;

  // Remove classes anteriores
  body.classList.remove('role-editor', 'role-leitor');

  if (nivel === 'leitor') {
    body.classList.add('role-leitor');
  } else {
    body.classList.add('role-editor');
  }

  // Atualiza badge de perfil na topbar
  const elRole = document.getElementById('user-role');
  if (elRole) {
    elRole.textContent = nivel === 'editor' ? '✏️ Editor' : '👁️ Leitor';
    elRole.style.color = nivel === 'editor' ? '#10b981' : '#f59e0b';
  }
}

// Exibe a tela de login
function mostrarLogin(mensagem) {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.style.display = 'flex';

  // Hide main app
  const app = document.querySelector('.app-layout');
  if (app) app.style.display = 'none';

  if (mensagem) {
    const errDiv = document.getElementById('login-error');
    if (errDiv) errDiv.textContent = mensagem;
  }
}

// Oculta a tela de login e mostra o app
function ocultarLogin() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.style.display = 'none';

  const app = document.querySelector('.app-layout');
  if (app) app.style.display = '';
}

// ====== CHAMADO PELO BOTÃO "ENTRAR" ======
async function realizarLogin() {
  const emailInput = document.getElementById('login-email');
  const errDiv     = document.getElementById('login-error');
  const loadingDiv = document.getElementById('login-loading');
  const btnLogin   = document.getElementById('btn-login');

  const email = emailInput ? emailInput.value.trim() : '';
  if (!email || !email.includes('@')) {
    if (errDiv) errDiv.textContent = 'Digite um e-mail válido.';
    return;
  }

  // UI: loading state
  if (errDiv) errDiv.textContent = '';
  if (loadingDiv) loadingDiv.style.display = 'block';
  if (btnLogin) btnLogin.disabled = true;

  try {
    const res = await fetch(API_BASE + '/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      if (errDiv) errDiv.textContent = data.erro || 'Acesso negado.';
      return;
    }

    // Sucesso: salvar sessão e carregar app
    salvarSessao(data.token, { email: data.email, nome: data.nome, nivel: data.nivel });

    // Atualiza topbar
    const elName = document.getElementById('user-name');
    if (elName) elName.textContent = data.nome;

    aplicarPermissoes(data.nivel);
    ocultarLogin();

    // Carrega dados
    await inicializarDados();
    navegar('dashboard');
    atualizarContador();

  } catch (err) {
    if (errDiv) errDiv.textContent = 'Erro de conexão com o servidor.';
  } finally {
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (btnLogin) btnLogin.disabled = false;
  }
}

// ====== CHAMADO PELO BOTÃO "SAIR" ======
async function fazerLogout() {
  const token = sessionStorage.getItem(SAP_SESSION_KEY);
  if (token) {
    try {
      await fetch(API_BASE + '/api/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    } catch (e) { /* ignora */ }
  }
  limparSessao();
  mostrarLogin();
}

// ====== INICIALIZAÇÃO: verifica se já tem sessão válida ======
document.addEventListener('DOMContentLoaded', async () => {
  const usuario = getSessaoAtual();
  const token   = sessionStorage.getItem(SAP_SESSION_KEY);

  if (usuario && token) {
    // Sessão existente: valida no servidor
    try {
      const testRes = await fetch(API_BASE + '/api/registros', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (testRes.ok) {
        // Sessão válida — atualiza UI e carrega dados
        const elName = document.getElementById('user-name');
        if (elName) elName.textContent = usuario.nome;

        aplicarPermissoes(usuario.nivel);
        ocultarLogin();

        const data = await testRes.json();
        if (data.rows) window.processosCache = data.rows.map(mapToApp);

        const dl = document.getElementById('list-municipios');
        if (dl) {
          const muns = [...new Set((window.processosCache || []).map(p => p.municipio).filter(Boolean))].sort();
          dl.innerHTML = muns.map(m => `<option value="${m}">`).join('');
        }
        atualizarContador();
        renderProcessos();
        return;
      }
    } catch (e) { /* cai no login */ }
  }

  // Sem sessão válida: mostra tela de login
  mostrarLogin();
});
