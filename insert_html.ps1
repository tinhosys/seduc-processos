$targetFile = "C:\Users\ADM\Documents\GitHub\seduc-processos\index.html"
$content = [System.IO.File]::ReadAllText($targetFile)

$htmlContent = @"
  <!-- ============= ABA CONTATOS ============= -->
  <section class="page" id="page-contatos" style="display:none;">
    <div class="section-header" style="flex-wrap:wrap;gap:16px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span id="contatos-badge-total" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.3);font-family:monospace;letter-spacing:0.5px;">?? 0 Contatos</span>
        <span id="contatos-badge-status" style="display:inline-flex;align-items:center;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;background:rgba(251,191,36,0.12);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);letter-spacing:0.4px;">? Aguardando carregamento</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <button onclick="carregarContatos(true)" title="Recarregar dados"
          style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:var(--text-secondary);padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Recarregar
        </button>
        <a href="https://docs.google.com/spreadsheets/d/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08/edit?gid=1855271818#gid=1855271818"
          target="_blank" rel="noopener" class="action-editor action-adm"
          style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:white;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:6px;text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Acessar Planilha
        </a>
        <button class="action-editor action-adm" onclick="abrirModalContato()"
          style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.5);color:#60a5fa;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;">
          ? Novo Contato
        </button>
      </div>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
      <div style="display:flex; width:100%;">
        <div style="position:relative; flex:1;">
          <input type="text" id="contatos-busca"
            placeholder="Buscar por município, nome, email..."
            oninput="filtrarContatos()"
            style="width:100%;padding:10px 38px 10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text-primary);font-size:13px;outline:none;box-sizing:border-box;">
          <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:15px;pointer-events:none;">??</span>
        </div>
      </div>
    </div>

    <div class="card" style="padding:0; overflow-x:auto;">
      <table class="data-table" id="contatos-table">
        <thead>
          <tr>
            <th style="min-width:120px;">Município</th>
            <th style="min-width:180px;">Prefeito</th>
            <th style="min-width:180px;">Secretário</th>
            <th style="min-width:120px;">E-mail</th>
            <th style="min-width:80px;text-align:center;">Escolas</th>
            <th style="min-width:80px;text-align:center;">Alunos</th>
            <th style="min-width:60px;text-align:center;" class="action-editor action-adm">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted);">Carregando...</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ============= MODAL FORMULÁRIO CONTATO ============= -->
  <div class="modal-overlay" id="modal-contato-overlay" onclick="if(event.target===this)fecharModalContato()">
    <div class="modal" style="max-width:550px; width:95%;">
      <div class="modal-header">
        <h3 id="modal-contato-titulo" style="display:flex; align-items:center; gap:8px;"><span>??</span> Editar Contato</h3>
        <button class="modal-close" onclick="fecharModalContato()">?</button>
      </div>
      <div class="modal-body" style="padding:20px;">
        <form id="form-contato" onsubmit="salvarContato(event)">
          <input type="hidden" id="contato-id">
          
          <div class="form-group" style="margin-bottom:12px;">
            <label>Município</label>
            <input type="text" id="contato-municipio" required>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label>Nome do Prefeito</label>
              <input type="text" id="contato-prefeito">
            </div>
            <div class="form-group">
              <label>Celular Prefeito</label>
              <input type="text" id="contato-cel-prefeito" placeholder="(00) 00000-0000">
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label>Nome do Secretário</label>
              <input type="text" id="contato-secretario">
            </div>
            <div class="form-group">
              <label>Celular Secretário</label>
              <input type="text" id="contato-cel-secretario" placeholder="(00) 00000-0000">
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom:12px;">
            <label>E-mail</label>
            <input type="email" id="contato-email">
          </div>
          
          <div class="form-group" style="margin-bottom:12px;">
            <label>Observações</label>
            <textarea id="contato-obs" rows="3" style="width:100%;padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:var(--text-primary);"></textarea>
          </div>
          
          <div style="display:flex; gap:16px; margin-top:16px; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
             <div><strong>Qtd Escolas (INEP): </strong><span id="contato-qtde-escolas">-</span></div>
             <div><strong>Qtd Alunos: </strong><span id="contato-qtde-alunos">-</span></div>
          </div>
          
          <div id="btn-excluir-contato-container" style="display:none; margin-top:20px; border-top:1px solid rgba(239,68,68,0.25); padding-top:16px; text-align:right;">
             <button type="button" onclick="excluirContato()" class="btn" style="background:#dc2626; color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">Excluir Contato</button>
          </div>
          
          <div class="modal-footer" style="margin-top:20px; display:flex; justify-content:flex-end; gap:12px;">
            <button type="button" class="btn btn-outline" onclick="fecharModalContato()" style="background:transparent; border:1px solid var(--text-muted); color:var(--text-primary); padding:8px 16px; border-radius:8px; cursor:pointer;">Cancelar</button>
            <button type="submit" class="btn" id="btn-salvar-contato" style="background:var(--blue); border:none; color:white; padding:8px 16px; border-radius:8px; cursor:pointer;">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
"@

if (-not $content.Contains("page-contatos")) {
    $content = $content -replace "(?s)(<!-- ============= MODAL DETALHES ESCOLA ============= -->)", "`n$htmlContent`n`n`$1"
    
    # Add script tag
    $content = $content -replace "(?s)(<script src=`"js/mapa.js\?v=[^`"]*`"></script>)", "`$1`n  <script src=`"js/contatos.js`"></script>"
    
    [System.IO.File]::WriteAllText($targetFile, $content)
    Write-Output "HTML injetado"
} else {
    Write-Output "Ja injetado"
}
