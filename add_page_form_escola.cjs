const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const targetTag = '</section>\n\n  <!-- \n  ============================================================\n  PAGE: MAPA DE ESCOLAS';
const fallbackTag = '</section>';

const pageEscolasIdx = html.indexOf('id="page-escolas"');
const sectionEndIdx = html.indexOf('</section>', pageEscolasIdx);

const pageFormEscolaHtml = `

  <!-- ============= PAGE: FORMULÁRIO INDIVIDUALIZADO DE ESCOLA ============= -->
  <section class="page action-adm" id="page-form-escola">

    <!-- Header / Nav bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <button type="button" onclick="navegar('escolas')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:var(--text-secondary); padding:8px 16px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; margin-bottom:10px; display:inline-flex; align-items:center; gap:6px;">← Voltar para Lista de Escolas</button>
        <h2 id="form-escola-page-titulo" style="margin:0; font-size:22px; color:#f0f4ff; display:flex; align-items:center; gap:10px;">🏫 Editar Cadastro da Escola</h2>
        <p id="form-escola-page-subtitulo" style="margin:4px 0 0 0; color:#a78bfa; font-weight:600; font-size:14px;">Preencha os dados individualizados da unidade escolar</p>
      </div>

      <div style="display:flex; gap:12px;">
        <button type="button" onclick="navegar('escolas')" class="btn btn-ghost" style="padding:10px 20px;">Cancelar</button>
        <button type="button" onclick="salvarFormularioEscolaPage(event)" class="btn btn-primary" id="btn-salvar-escola-page" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed); border:none; font-weight:700; padding:12px 28px; font-size:14px; box-shadow:0 4px 15px rgba(139,92,246,0.4);">💾 Salvar Escola</button>
      </div>
    </div>

    <!-- Form Container -->
    <div class="card" style="padding:28px; background:#0b0f19; border:1px solid rgba(139,92,246,0.3); border-radius:16px; box-shadow:0 12px 32px rgba(0,0,0,0.4);">
      <form id="form-escola-page-data" onsubmit="salvarFormularioEscolaPage(event)">
        <input type="hidden" id="page-escola-id">

        <!-- 1. IDENTIFICAÇÃO INSTITUCIONAL DA ESCOLA -->
        <div style="padding:22px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.25); border-radius:14px; margin-bottom:24px;">
          <div style="font-size:13px; font-weight:800; color:#a78bfa; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:18px; display:flex; align-items:center; gap:8px;">
            🏫 <span>1. Identificação Institucional da Escola</span>
          </div>

          <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:18px; margin-bottom:18px;">
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:700; font-size:14px; margin-bottom:6px; display:block;">Nome Completo da Escola *</label>
              <input type="text" id="page-escola-nome" class="form-control" required placeholder="Digite o nome oficial da escola" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.4); color:#fff; font-weight:700; font-size:15px; padding:12px 14px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:700; font-size:14px; margin-bottom:6px; display:block;">Município *</label>
              <input type="text" id="page-escola-municipio" class="form-control" required placeholder="Ex: Porto Velho, Ariquemes..." style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.4); color:#fff; font-weight:600; padding:12px 14px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:700; font-size:14px; margin-bottom:6px; display:block;">Localização</label>
              <select id="page-escola-localizacao" class="form-control" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.4); color:#fff; font-weight:600; padding:12px 14px;">
                <option value="">Selecione a localização...</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
                <option value="Indígena">Indígena</option>
                <option value="Quilombola">Quilombola</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:18px;">
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Código INEP</label>
              <input type="text" id="page-escola-inep" class="form-control" placeholder="Ex: 11000000" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#60a5fa; font-family:monospace; font-weight:700; padding:10px 12px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">Código Super</label>
              <input type="text" id="page-escola-codigoSuper" class="form-control" placeholder="Ex: 1" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#a78bfa; font-family:monospace; font-weight:700; padding:10px 12px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">SUPER / Regional</label>
              <input type="text" id="page-escola-super" class="form-control" placeholder="Ex: SUPER ARIQUEMES" style="border-color:rgba(139,92,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>
          </div>
        </div>

        <!-- 2. GESTÃO DA ESCOLA & DIREÇÃO -->
        <div style="padding:22px; background:linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06)); border:1px solid rgba(16,185,129,0.35); border-radius:14px; margin-bottom:24px;">
          <div style="font-size:13px; font-weight:800; color:#34d399; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:18px; display:flex; align-items:center; gap:8px;">
            👤 <span>2. Gestão da Escola & Contatos</span>
          </div>

          <div class="form-group" style="margin-bottom:18px;">
            <label style="color:#f0f4ff; font-weight:700; font-size:14px; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
              <span>👤</span> <span>Nome do Diretor(a) / Gestor(a)</span>
            </label>
            <input type="text" id="page-escola-diretor" class="form-control" placeholder="Digite o nome completo do diretor(a) responsável" style="border-color:rgba(16,185,129,0.5); background:rgba(0,0,0,0.4); color:#34d399; font-weight:700; font-size:16px; padding:12px 14px;">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📞 Contato do Diretor (WhatsApp / Celular)</label>
              <input type="text" id="page-escola-contatoDiretor" class="form-control" placeholder="Ex: (69) 99999-9999" style="border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:12px 14px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">☎️ Telefone Geral da Escola / Secretaria</label>
              <input type="text" id="page-escola-telefone" class="form-control" placeholder="Ex: (69) 3222-0000" style="border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:12px 14px;">
            </div>
          </div>
        </div>

        <!-- 3. ENDEREÇO & INFRAESTRUTURA -->
        <div style="padding:22px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:14px; margin-bottom:24px;">
          <div style="font-size:13px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:18px; display:flex; align-items:center; gap:8px;">
            📍 <span>3. Endereço & Capacidade de Infraestrutura</span>
          </div>

          <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:18px; margin-bottom:18px;">
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📍 Endereço e Nº</label>
              <input type="text" id="page-escola-endereco" class="form-control" placeholder="Ex: Av. Amazonas, 1234" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:12px 14px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🏙️ Bairro</label>
              <input type="text" id="page-escola-bairro" class="form-control" placeholder="Ex: Centro" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:12px 14px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🏢 Complemento</label>
              <input type="text" id="page-escola-complemento" class="form-control" placeholder="Ex: Próximo à praça central" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:12px 14px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:18px;">
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">CEP</label>
              <input type="text" id="page-escola-cep" class="form-control" placeholder="Ex: 76800-000" style="border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🎓 Total de Matrículas (Alunos)</label>
              <input type="number" id="page-escola-matriculas" class="form-control" placeholder="0" style="border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#34d399; font-weight:700; padding:10px 12px;">
            </div>
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🚪 Salas de Aula Utilizadas</label>
              <input type="number" id="page-escola-salas" class="form-control" placeholder="0" style="border-color:rgba(96,165,250,0.4); background:rgba(0,0,0,0.3); color:#60a5fa; font-weight:700; padding:10px 12px;">
            </div>
          </div>
        </div>

        <!-- 4. OBSERVAÇÕES INDIVIDUALIZADAS -->
        <div style="padding:22px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:14px; margin-bottom:24px;">
          <div style="font-size:13px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
            📝 <span>4. Observações Individualizadas da Escola</span>
          </div>
          <div class="form-group">
            <textarea id="page-escola-obs" class="form-control" rows="4" placeholder="Digite aqui observações adicionais específicas sobre esta unidade escolar..." style="width:100%; border-color:rgba(255,255,255,0.15); background:rgba(0,0,0,0.3); color:#fff; font-weight:500; padding:14px; border-radius:10px; line-height:1.5; box-sizing:border-box;"></textarea>
          </div>
        </div>

        <!-- Action Footer -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:20px; border-top:1px solid var(--border);">
          <button type="button" onclick="if(confirm('Deseja cancelar as alterações?')) navegar('escolas')" class="btn btn-ghost" style="padding:12px 24px;">Cancelar</button>
          <button type="submit" class="btn btn-primary" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed); border:none; font-weight:700; padding:12px 32px; font-size:15px; box-shadow:0 4px 18px rgba(139,92,246,0.45);">💾 Salvar Escola</button>
        </div>
      </form>
    </div>

  </section>
`;

if (!html.includes('id="page-form-escola"')) {
  const insertPos = sectionEndIdx + '</section>'.length;
  html = html.substring(0, insertPos) + pageFormEscolaHtml + html.substring(insertPos);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('index.html page-form-escola inserted successfully.');
} else {
  console.log('page-form-escola already present in index.html');
}
