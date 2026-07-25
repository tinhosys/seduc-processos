const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const startIdx = html.indexOf('<div class="modal-overlay" id="modal-form-escola"');
const endIdx = html.indexOf('<section class="page action-adm" id="page-mapa-escolas">');

if (startIdx > -1 && endIdx > startIdx) {
  const newModalHtml = `<div class="modal-overlay" id="modal-form-escola" style="display:none; align-items:flex-start; padding-top:4vh; overflow-y:auto; z-index:99999;">
    <div class="modal card" style="width:95%; max-width:840px; margin:auto; margin-bottom:4vh; padding:0; border:1px solid rgba(139,92,246,0.35); border-radius:14px; overflow:hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.5);">
      
      <!-- Modal Header -->
      <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a); padding:20px 24px; border-bottom:1px solid rgba(139,92,246,0.25); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 id="form-escola-titulo" style="margin:0; font-size:18px; color:#f0f4ff; display:flex; align-items:center; gap:8px;">✏️ Editar Dados da Escola</h3>
          <span id="form-escola-subtitulo" style="font-size:13px; color:#a78bfa; font-weight:600;">Atualize as informações institucionais, contatos e gestão da unidade escolar</span>
        </div>
        <button class="modal-close" onclick="fecharModalFormEscola()" style="background:none; border:none; color:var(--text-muted); font-size:22px; cursor:pointer;">✕</button>
      </div>

      <!-- Modal Body -->
      <div style="padding:24px; background:#0b0f19;">
        <form id="form-escola-data" onsubmit="salvarEscola(event)">
          <input type="hidden" id="form-escola-id">
          
          <!-- SEÇÃO 1: IDENTIFICAÇÃO DA ESCOLA -->
          <div style="padding:18px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.2); border-radius:12px; margin-bottom:18px;">
            <div style="font-size:12px; font-weight:800; color:#a78bfa; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
              🏫 <span>Identificação da Escola</span>
            </div>

            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:14px; margin-bottom:14px;">
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Nome da Escola *</label>
                <input type="text" id="form-escola-nome" class="form-control" required placeholder="Digite o nome completo da escola" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Município *</label>
                <input type="text" id="form-escola-municipio" class="form-control" required placeholder="Município" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Localização</label>
                <select id="form-escola-localizacao" class="form-control" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
                  <option value="">Selecione...</option>
                  <option value="Urbana">Urbana</option>
                  <option value="Rural">Rural</option>
                  <option value="Indígena">Indígena</option>
                  <option value="Quilombola">Quilombola</option>
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:14px;">
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Código INEP</label>
                <input type="text" id="form-escola-inep" class="form-control" placeholder="Ex: 11000000" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#60a5fa; font-family:monospace; font-weight:600;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Código Super</label>
                <input type="text" id="form-escola-codigoSuper" class="form-control" placeholder="Ex: 1" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#a78bfa; font-family:monospace; font-weight:600;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">SUPER / Regional</label>
                <input type="text" id="form-escola-super" class="form-control" placeholder="Ex: SUPER ARIQUEMES" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;">
              </div>
            </div>
          </div>

          <!-- SEÇÃO 2: GESTÃO DA ESCOLA & CONTATOS -->
          <div style="padding:18px; background:linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06)); border:1px solid rgba(16,185,129,0.3); border-radius:12px; margin-bottom:18px;">
            <div style="font-size:12px; font-weight:800; color:#34d399; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
              👤 <span>Gestão da Escola & Contatos</span>
            </div>

            <div class="form-group" style="margin-bottom:14px;">
              <label style="color:#f0f4ff; font-weight:700; font-size:14px; display:flex; align-items:center; gap:6px;">
                <span>👤</span> <span>Nome do Diretor / Gestor</span>
              </label>
              <input type="text" id="form-escola-diretor" class="form-control" placeholder="Digite o nome completo do diretor(a) ou gestor(a)" style="border-color:rgba(16,185,129,0.5); background:rgba(0,0,0,0.4); color:#34d399; font-weight:700; font-size:15px; padding:12px 14px;">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📞 Contato do Diretor (WhatsApp)</label>
                <input type="text" id="form-escola-contatoDiretor" class="form-control" placeholder="Ex: (69) 99999-9999" style="border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">☎️ Telefone Geral da Escola</label>
                <input type="text" id="form-escola-telefone" class="form-control" placeholder="Ex: (69) 3222-0000" style="border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;">
              </div>
            </div>
          </div>

          <!-- SEÇÃO 3: ENDEREÇO & INFRAESTRUTURA -->
          <div style="padding:18px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:12px; margin-bottom:20px;">
            <div style="font-size:12px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
              📍 <span>Endereço & Infraestrutura</span>
            </div>

            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:14px; margin-bottom:14px;">
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📍 Endereço e Nº</label>
                <input type="text" id="form-escola-endereco" class="form-control" placeholder="Ex: Av. Amazonas, 1234" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🏙️ Bairro</label>
                <input type="text" id="form-escola-bairro" class="form-control" placeholder="Ex: Centro" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🏢 Complemento</label>
                <input type="text" id="form-escola-complemento" class="form-control" placeholder="Ex: Ao lado do posto" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;">
              </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:14px;">
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">CEP</label>
                <input type="text" id="form-escola-cep" class="form-control" placeholder="Ex: 76800-000" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Total Matrículas</label>
                <input type="number" id="form-escola-matriculas" class="form-control" placeholder="0" style="border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#34d399; font-weight:700;">
              </div>
              <div class="form-group">
                <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Salas Utilizadas</label>
                <input type="number" id="form-escola-salas" class="form-control" placeholder="0" style="border-color:rgba(96,165,250,0.4); background:rgba(0,0,0,0.3); color:#60a5fa; font-weight:700;">
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div style="display:flex; justify-content:flex-end; gap:12px; padding-top:16px; border-top:1px solid var(--border);">
            <button type="button" class="btn btn-ghost" onclick="fecharModalFormEscola()" style="padding:10px 20px;">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-salvar-escola" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed); border:none; font-weight:700; padding:10px 26px; font-size:14px; box-shadow:0 4px 15px rgba(139,92,246,0.4);">💾 Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  </div>\n\n  `;

  html = html.substring(0, startIdx) + newModalHtml + html.substring(endIdx);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('index.html modal-form-escola refined successfully.');
} else {
  console.error('Could not find modal-form-escola boundaries in index.html');
}
