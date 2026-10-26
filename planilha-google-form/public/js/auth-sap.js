
let _hbTimer = null;
window.iniciarHeartbeat = function() {
  if (_hbTimer) clearInterval(_hbTimer);
  const pulsar = async () => {
    const token = getSessionToken();
    if (!token) return;
    try {
      await fetch(API_BASE + '/api/heartbeat', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    } catch(e) {}
  };
  pulsar();
  _hbTimer = setInterval(pulsar, 25000);
};

window.buscarUsuariosOnline = async function() {
  try {
    const res = await fetch(API_BASE + '/api/usuarios-online');
    if (res.ok) {
      const data = await res.json();
      window._usuariosOnlineAtivos = data.usuariosOnline || [];
    }
  } catch(e) {}
};


// ====== REGRA RESTRITA: DASHBOARD EXCLUSIVO ADMIN ELTON (69) 9 9922-1336 ======
window.podeAcessarDashboard = function() {
  try {
    const uData = JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}");
    const nivel = String(uData.nivel || '').toLowerCase().trim();
    const isAdmin = (nivel === 'adm' || nivel === 'admin');
    if (!isAdmin) return false;

    const nome = String(uData.nome || '').toLowerCase().trim();
    const wa = String(uData.whatsapp || '').replace(/\D/g, '');

    // Somente perfil ADMIN/ADM, usuÃ¡rio Elton, telefone (69) 9 9922-1336
    const isElton = nome.includes('elton') || wa.includes('99221336') || wa === '69999221336' || wa === 'admin';
    return isElton;
  } catch (e) {
    return false;
  }
};


window.isUsuarioAdmin = function() {
  try {
    const raw = sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data");
    if (raw) {
      const uData = JSON.parse(raw);
      const nivel = String(uData.nivel || uData.role || '').toLowerCase().trim();
      return (nivel === 'admin' || nivel === 'adm' || nivel === 'administrador');
    }
    if (document.body && document.body.classList.contains('role-adm')) return true;
  } catch(e) {}
  return false;
};

// ============================================================
// SAP â€” MÃ³dulo de AutenticaÃ§Ã£o (Planilha Google Sheets)
// ============================================================

function maskCelular(v) {
  v = v.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 7) {
    return "(" + v.substring(0, 2) + ") " + v.substring(2, 3) + " " + v.substring(3, 7) + "-" + v.substring(7);
  } else if (v.length > 3) {
    return "(" + v.substring(0, 2) + ") " + v.substring(2, 3) + " " + v.substring(3);
  } else if (v.length > 2) {
    return "(" + v.substring(0, 2) + ") " + v.substring(2);
  } else if (v.length > 0) {
    return "(" + v;
  }
  return v;
}

const SAP_SESSION_KEY = 'sap_session_token';
const SAP_USER_KEY    = 'sap_user_data';

var API_BASE = 'https://seduc-backend.onrender.com';


// Retorna o usuÃ¡rio da sessÃ£o atual, ou null
function getSessaoAtual() {
  try {
    const raw = sessionStorage.getItem(SAP_USER_KEY) || localStorage.getItem(SAP_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// Retorna o token da sessÃ£o atual
function getSessionToken() {
  return sessionStorage.getItem(SAP_SESSION_KEY) || localStorage.getItem(SAP_SESSION_KEY);
}

// Salva sessÃ£o no sessionStorage ou localStorage dependendo de manterConectado
function salvarSessao(token, usuario, manterConectado = false) {
  limparSessao();
  if (manterConectado) {
    localStorage.setItem(SAP_SESSION_KEY, token);
    localStorage.setItem(SAP_USER_KEY, JSON.stringify(usuario));
  } else {
    sessionStorage.setItem(SAP_SESSION_KEY, token);
    sessionStorage.setItem(SAP_USER_KEY, JSON.stringify(usuario));
  }
}

// Limpa sessÃ£o em ambos
function limparSessao() {
  sessionStorage.removeItem(SAP_SESSION_KEY);
  sessionStorage.removeItem(SAP_USER_KEY);
  localStorage.removeItem(SAP_SESSION_KEY);
  localStorage.removeItem(SAP_USER_KEY);
}

// Aplica as restriÃ§Ãµes de UI baseadas no nÃ­vel do usuÃ¡rio
function aplicarPermissoes(nivel) {
  let uData = {};
  try {
    uData = JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}");
    const elNome = document.getElementById('senha-usuario-nome');
    const elWa = document.getElementById('senha-usuario-whatsapp');
    if (elNome) elNome.textContent = 'UsuÃ¡rio: ' + (uData.nome || 'Desconhecido');
    if (elWa) elWa.textContent = 'WhatsApp: ' + (uData.whatsapp || '');
  } catch(e) {}
  nivel = String(nivel || uData.nivel || '').toLowerCase().trim();
  const body = document.body;

  // Remove classes anteriores
  body.classList.remove('role-editor', 'role-leitor', 'role-adm', 'role-gerente');

  if (nivel === 'leitor') {
    body.classList.add('role-leitor');
  } else if (nivel === 'adm' || nivel === 'admin' || nivel === 'administrador') {
    body.classList.add('role-adm');
  } else if (nivel === 'gerente') {
    body.classList.add('role-gerente');
  } else {
    body.classList.add('role-editor');
  }

  const isAdminUser = (nivel === 'adm' || nivel === 'admin' || nivel === 'administrador');

  // Atualiza badge de perfil na topbar
  const elRole = document.getElementById('user-role');
  if (elRole) {
    if (isAdminUser) {
      elRole.innerHTML = '<span style="display:inline-flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polygon points="2 4 5 20 19 20 22 4 15 10 12 2 9 10 2 4"></polygon></svg> <span>Admin</span></span>';
      elRole.style.color = '#38bdf8';
    } else {
      let setorDisplay = uData.setor && uData.setor.trim() !== '' ? uData.setor : (nivel === 'gerente' ? 'Gerente' : (nivel === 'editor' ? 'Editor' : 'Leitor'));
      elRole.innerHTML = '<span style="display:inline-flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> <span>' + sanitizarTextoHTML(setorDisplay) + '</span></span>';
      elRole.style.color = nivel === 'gerente' ? '#a78bfa' : (nivel === 'editor' ? '#10b981' : '#f59e0b');
    }
  }

  if (typeof window.atualizarBotoesModulos === "function") window.atualizarBotoesModulos();
  document.querySelectorAll('.action-adm').forEach(el => {
    if (el.tagName === 'SELECT' && (el.classList.contains('custom-multiselect-hidden') || el.multiple)) {
      el.style.setProperty('display', 'none', 'important');
      return;
    }
    if (el.classList.contains('filtro-digito-container')) {
      el.style.setProperty('display', isAdminUser ? 'inline-flex' : 'none', 'important');
    } else {
      el.style.setProperty('display', isAdminUser ? '' : 'none', 'important');
    }
  });

  // Controle estrito do filtro e campo EXECUTIVO (exclusivo ADMIN)
  const containerFiltroExec = document.getElementById('container-filtro-executivo');
  if (containerFiltroExec) {
    containerFiltroExec.style.setProperty('display', isAdminUser ? 'block' : 'none', 'important');
  }
  const selFiltroExec = document.getElementById('filtro-executivo');
  if (selFiltroExec && selFiltroExec._multiSelectInstance && selFiltroExec._multiSelectInstance.wrapper) {
    selFiltroExec._multiSelectInstance.wrapper.style.setProperty('display', isAdminUser ? '' : 'none', 'important');
  }
  const groupFormExec = document.getElementById('group-form-executivo');
  if (groupFormExec) {
    groupFormExec.style.setProperty('display', isAdminUser ? '' : 'none', 'important');
  }
  const inputFormExec = document.getElementById('form-executivo');
  if (inputFormExec) {
    inputFormExec.disabled = !isAdminUser;
    if (!isAdminUser) inputFormExec.style.setProperty('display', 'none', 'important');
    else inputFormExec.style.removeProperty('display');
  }
  if (!isAdminUser && typeof state !== 'undefined' && state && state.filtros) {
    state.filtros.executivo = [];
  }

  // Controle restrito do Dashboard (somente Elton, Admin, 69 99922-1336)
  const canDash = typeof window.podeAcessarDashboard === 'function' ? window.podeAcessarDashboard() : false;
  if (canDash) {
    document.body.classList.add('can-access-dashboard');
  } else {
    document.body.classList.remove('can-access-dashboard');
  }

  document.querySelectorAll('.dashboard-only-elton').forEach(el => {
    el.style.setProperty('display', canDash ? '' : 'none', 'important');
  });

  // Se nÃ£o pode acessar Dashboard e estiver nele, redireciona para processos
  if (!canDash && typeof state !== 'undefined' && state && state.page === 'dashboard') {
    if (typeof navegar === 'function') navegar('processos');
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

// ====== CHAMADO PELO BOTÃƒO "ENTRAR" ======
async function realizarLogin() {
  const whatsappInput = document.getElementById('login-whatsapp');
  const senhaInput = document.getElementById('login-senha');
  const errDiv     = document.getElementById('login-error');
  const loadingDiv = document.getElementById('login-loading');
  const btnLogin   = document.getElementById('btn-login');

  const rawWhatsapp = whatsappInput ? whatsappInput.value.trim() : '';
  const whatsapp = rawWhatsapp.replace(/\D/g, '');
  const senha = senhaInput ? senhaInput.value.trim() : '';

  if (!whatsapp || whatsapp.length < 10 || whatsapp.length > 11) {
    if (errDiv) errDiv.textContent = 'Digite um WhatsApp vÃ¡lido com DDD.';
    return;
  }
  if (!senha || senha.length !== 4) {
    if (errDiv) errDiv.textContent = 'Digite a senha de 4 dÃ­gitos.';
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
      body: JSON.stringify({ whatsapp, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      const msgErroOriginal = (data.erro || '').toLowerCase();
      if (msgErroOriginal.includes('bloqueado') || res.status === 403) {
        if (errDiv) {
          errDiv.innerHTML = '<div style="display:inline-flex; align-items:center; justify-content:center; gap:8px; color:#94a3b8; font-size:12.5px;"><span style="display:inline-block; width:13px; height:13px; border:2px solid rgba(148,163,184,0.3); border-top-color:#38bdf8; border-radius:50%; animation:spin 1s linear infinite;"></span><span>Carregando dados do servidor...</span></div>';
        }
        if (btnLogin) btnLogin.disabled = true;

        if (window._timerConexaoBloqueado) clearTimeout(window._timerConexaoBloqueado);
        window._timerConexaoBloqueado = setTimeout(() => {
          if (errDiv) {
            errDiv.innerHTML = '<div style="color:#ef4444; font-size:12.5px; font-weight:600; display:inline-flex; align-items:center; justify-content:center; gap:6px;"><span>⚠️ Connection timed out. Try again.</span></div>';
          }
          if (btnLogin) btnLogin.disabled = false;
        }, 30000);
      } else {
        if (errDiv) errDiv.textContent = data.erro || 'Erro de conexão com o servidor.';
      }
      return;
    }

    // Sucesso: salvar sessÃ£o e carregar app
    const manterCheckbox = document.getElementById('login-manter');
    const manterConectado = manterCheckbox ? manterCheckbox.checked : false;
    salvarSessao(data.token, { whatsapp: data.whatsapp, nome: data.nome, nivel: String(data.nivel || '').toLowerCase().trim(), setor: data.setor || '' }, manterConectado);

    // Atualiza topbar
    const elName = document.getElementById('user-name');
    if (elName) elName.textContent = data.nome;

    aplicarPermissoes(data.nivel);
    ocultarLogin();

    // Carrega dados
    await inicializarDados();
    if (typeof window.popularFiltrosProcessos === 'function') window.popularFiltrosProcessos();
    if (typeof renderProcessos === 'function') renderProcessos();
    aplicarPermissoes(data.nivel);

    const isAdminLog = (data.nivel === 'adm' || data.nivel === 'admin');
    const canDashLog = typeof window.podeAcessarDashboard === 'function' ? window.podeAcessarDashboard() : false;
    if (typeof window.iniciarHeartbeat === 'function') window.iniciarHeartbeat();
    navegar(canDashLog ? 'dashboard' : 'processos');
    if (canDashLog && typeof renderDashboard === 'function') renderDashboard();
    if (typeof atualizarContador === 'function') atualizarContador();

  } catch (err) {
    if (errDiv) errDiv.textContent = 'Erro de conexÃ£o com o servidor.';
  } finally {
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (btnLogin) btnLogin.disabled = false;
  }
}

// ====== CHAMADO PELO BOTÃƒO "SAIR" ======
async function fazerLogout() {
  const token = getSessionToken();
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

// ====== INICIALIZAÃ‡ÃƒO: verifica se jÃ¡ tem sessÃ£o vÃ¡lida ======
document.addEventListener('DOMContentLoaded', async () => {
  // ====== VERIFICAÇÃO DE ACESSO VIA LINK PRÉ-DEFINIDO (SEM SENHA / PÁGINA ÚNICA) ======
  const urlParams = new URLSearchParams(window.location.search);
  const isCadastroExterno = urlParams.get('cadastro_entidade') === '1' || urlParams.get('cadastro') === '1';

  if (isCadastroExterno) {
    ocultarLogin();
    const loginOv = document.getElementById('login-overlay');
    if (loginOv) loginOv.style.display = 'none';

    sessionStorage.setItem('sap_session_token', 'link_externo_sem_senha');
    sessionStorage.setItem('sap_usuario', JSON.stringify({
      nome: 'Convidado (Cadastro)',
      whatsapp: 'externo',
      nivel: 'guest'
    }));

    setTimeout(() => {
      if (typeof window.iniciarModoCadastroExterno === 'function') {
        window.iniciarModoCadastroExterno(urlParams);
      }
    }, 150);
    return;
  }

  // Sempre inicie limpo (sem pre-enchimento)
  const whatsappInput = document.getElementById('login-whatsapp');
  const senhaInput = document.getElementById('login-senha');
  if (whatsappInput) whatsappInput.value = '';
  if (senhaInput) senhaInput.value = '';

  const usuario = getSessaoAtual();
  const token   = getSessionToken();

  if (usuario && token) {
    // SessÃ£o existente: valida no servidor
    try {
      const testRes = await fetch(API_BASE + '/api/registros', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (testRes.ok) {
        // SessÃ£o vÃ¡lida â€” atualiza UI e carrega dados
        const elName = document.getElementById('user-name');
        if (elName) elName.textContent = usuario.nome;

        aplicarPermissoes(usuario.nivel);
        ocultarLogin();

        if (typeof inicializarDados === 'function') {
          await inicializarDados();
        } else {
          const data = await testRes.json();
          if (data.rows) window.processosCache = data.rows.filter(r => r._tabName && !r._tabName.toLowerCase().includes('parametro')).map(mapToApp);
        }

        const dl = document.getElementById('list-municipios');
        if (dl) {
          const muns = [...new Set((window.processosCache || []).map(p => p.municipio).filter(Boolean))].sort();
          dl.innerHTML = muns.map(m => `<option value="${m}">`).join('');
        }
        if (typeof atualizarContador === 'function') atualizarContador();
        if (typeof window.popularFiltrosProcessos === 'function') window.popularFiltrosProcessos();
        if (typeof renderProcessos === 'function') renderProcessos();
        aplicarPermissoes(usuario.nivel);

        const isAdminSess = (usuario.nivel === 'adm' || usuario.nivel === 'admin');
        const canDashSess = typeof window.podeAcessarDashboard === 'function' ? window.podeAcessarDashboard() : false;
        if (typeof window.iniciarHeartbeat === 'function') window.iniciarHeartbeat();
        navegar(canDashSess ? 'dashboard' : 'processos');
        if (canDashSess && typeof renderDashboard === 'function') renderDashboard();
        
        if (typeof checkAlertasADM === 'function' && window.processosCache) {
           checkAlertasADM(window.processosCache);
        }
        return;
      }
    } catch (e) { /* cai no login */ }
  }

  // Sem sessÃ£o vÃ¡lida: mostra tela de login
  mostrarLogin();
});

// ====== TROCA DE SENHA ======
async function salvarNovaSenhaPage() {
  const senhaAtual = document.getElementById('page-senha-atual').value;
  const novaSenha = document.getElementById('page-nova-senha').value;
  const confirmaSenha = document.getElementById('page-confirma-senha').value;
  const msg = document.getElementById('page-senha-msg');

  msg.style.display = 'block';

  if (!senhaAtual || !novaSenha || !confirmaSenha) {
    msg.style.color = '#ef4444';
    msg.textContent = 'Preencha todos os campos.';
    return;
  }

  if (novaSenha !== confirmaSenha) {
    msg.style.color = '#ef4444';
    msg.textContent = 'A nova senha e a confirmaÃ§Ã£o nÃ£o conferem.';
    return;
  }

  if (!/^\d{4}$/.test(novaSenha)) {
    msg.style.color = '#ef4444';
    msg.textContent = 'A nova senha deve ter exatamente 4 nÃºmeros.';
    return;
  }

  if (novaSenha[0].repeat(4) === novaSenha) {
    msg.style.color = '#ef4444';
    msg.textContent = 'A nova senha nÃ£o pode ser nÃºmeros repetidos (ex: 1111).';
    return;
  }

  const token = sessionStorage.getItem("sap_session_token") || localStorage.getItem("sap_session_token");
  if (!token) {
    msg.style.color = '#ef4444';
    msg.textContent = 'Erro de sessÃ£o. FaÃ§a login novamente.';
    return;
  }

  msg.style.color = '#3b82f6';
  msg.textContent = 'Alterando senha...';

  try {
    const res = await fetch(`${API_BASE}/api/auth/senha`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ senhaAtual, novaSenha, whatsapp: (JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}")).whatsapp })
    });
    
    const data = await res.json();
    if (res.ok) {
      msg.style.color = '#10b981';
      msg.textContent = 'Senha atualizada com sucesso!';
      document.getElementById('page-senha-atual').value = '';
      document.getElementById('page-nova-senha').value = '';
      document.getElementById('page-confirma-senha').value = '';
      setTimeout(() => {
        navegar(typeof window.podeAcessarDashboard === 'function' && window.podeAcessarDashboard() ? 'dashboard' : 'processos');
        msg.textContent = '';
      }, 1500);
    } else {
      msg.style.color = '#ef4444';
      msg.textContent = data.erro || 'Erro ao alterar senha.';
    }
  } catch (error) {
    msg.style.color = '#ef4444';
    msg.textContent = 'Erro de conexÃ£o.';
  }
}







// ====== CONTROLE DE ACESSO POR MÃ“DULOS (GDSM, GMAC, PROALFA, ORÃ‡AMENTO) ======
window.podeAcessarModulo = function(modulo) {
  try {
    const uData = JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}");
    const nivel = String(uData.nivel || '').toLowerCase().trim();
    if (nivel === 'admin' || nivel === 'adm') return true;

    const mod = String(modulo || '').toLowerCase().trim();

    // OrÃ§amento Ã© restrito a Admin, Gerente ou quem tem setor OrÃ§amento
    if (mod === 'orcamento' || mod === 'orÃ§amento' || mod === 'financeiro') {
      if (nivel === 'gerente') return true;
      const setor = String(uData.setor || '').toLowerCase();
      return setor.includes('orcamento') || setor.includes('orÃ§amento') || setor.includes('financeiro');
    }

    // RestriÃ§Ãµes setoriais se o usuÃ¡rio tiver setor especÃ­fico
    const userSetor = String(uData.setor || '').toLowerCase().trim();
    if (userSetor && !['cam', 'seduc', 'todos', 'geral', ''].includes(userSetor)) {
      if (mod === 'gdsm' && !userSetor.includes('gdsm')) return false;
      if (mod === 'gmac' && !userSetor.includes('gmac')) return false;
      if (mod === 'proalfa' && !userSetor.includes('proalfa')) return false;
    }

    return true;
  } catch (e) {
    return true;
  }
};

window.atualizarBotoesModulos = function() {
  const modulos = [
    { id: 'btn-quick-gdsm', mod: 'gdsm' },
    { id: 'btn-quick-gmac', mod: 'gmac' },
    { id: 'btn-quick-proalfa', mod: 'proalfa' },
    { id: 'btn-quick-orcamento', mod: 'orcamento' }
  ];

  modulos.forEach(({ id, mod }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const temAcesso = window.podeAcessarModulo(mod);
    el.style.display = temAcesso ? 'flex' : 'none';
  });

  const elFin = document.querySelector('.item-financeiro');
  if (elFin) {
    elFin.style.display = window.podeAcessarModulo('orcamento') ? 'flex' : 'none';
  }
};
