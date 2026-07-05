// ============================================================
// SEDUC — Autenticação e Usuários
// ============================================================

const USERS_DB_KEY = 'seduc_users_v1';
const SESSION_KEY = 'seduc_session_v1';

const PERFIS = {
  1: 'Administrador',
  2: 'Editor',
  3: 'Consultor'
};

const Auth = {
  // Inicializa o banco de usuários criando um admin padrão se estiver vazio
  init: function() {
    let users = this.getUsers();
    if (users.length === 0) {
      this.addUser({
        nome: 'Admin do Sistema',
        email: 'admin@seduc.ro',
        whatsapp: '69999999999',
        senha: '123',
        perfil: 1,
        foto: '',
        bloqueado: false
      });
    }
  },

  getUsers: function() {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  saveUsers: function(users) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  },

  addUser: function(dados) {
    const users = this.getUsers();
    const novo = { 
      id: Date.now().toString(36) + Math.random().toString(36).slice(2), 
      ...dados,
      createdAt: new Date().toISOString()
    };
    users.push(novo);
    this.saveUsers(users);
    return novo;
  },

  updateUser: function(id, dados) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...dados };
      this.saveUsers(users);
      return users[idx];
    }
    return null;
  },

  deleteUser: function(id) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    this.saveUsers(users);
  },

  login: function(email, senha) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
    if (!user) throw new Error('Credenciais inválidas.');
    if (user.bloqueado) throw new Error('Usuário bloqueado pelo Administrador.');
    
    // Inicia sessão
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, token: Date.now() }));
    return user;
  },

  logout: function() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: function() {
    // Retorna um administrador fixo para pular o login (Bypass temporário)
    return {
      id: 'admin_bypass',
      nome: 'Administrador (Acesso Direto)',
      email: 'admin@seduc.ro',
      perfil: 1,
      bloqueado: false
    };
  },

  isAdmin: function() {
    const u = this.getCurrentUser();
    return u && Number(u.perfil) === 1;
  },
  canEdit: function() {
    const u = this.getCurrentUser();
    return u && (Number(u.perfil) === 1 || Number(u.perfil) === 2);
  }
};

Auth.init();
