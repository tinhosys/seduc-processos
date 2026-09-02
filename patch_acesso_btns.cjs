const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace button styles in form-actions
html = html.replace(/<button type="button" class="btn" id="btn-novo-acesso" style="[^"]*"/, '<button type="button" class="btn" id="btn-novo-acesso" style="background:#f59e0b; border:none; padding:0 16px; border-radius:6px; font-weight:600; color:#fff; cursor:pointer; height:40px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:6px; margin:0;"');

html = html.replace(/<button type="submit" class="btn btn-primary" id="btn-salvar-acesso" style="[^"]*"/, '<button type="submit" class="btn btn-primary" id="btn-salvar-acesso" style="flex:1; background:#10b981; border:none; padding:0 16px; border-radius:6px; font-weight:600; color:#fff; cursor:pointer; height:40px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; margin:0;"');

html = html.replace(/<button type="button" id="btn-cancelar-edicao" class="btn btn-ghost" onclick="cancelarEdicaoAcesso\(\)" style="[^"]*"/, '<button type="button" id="btn-cancelar-edicao" class="btn btn-ghost" onclick="cancelarEdicaoAcesso()" style="background:rgba(255,255,255,0.05); border:1px solid var(--border); padding:0 12px; border-radius:6px; font-weight:600; color:var(--text-primary); cursor:pointer; height:40px; box-sizing:border-box; align-items:center; justify-content:center; display:none; margin:0;"');

// Ensure inputs have box-sizing
// already done in patch_acesso_form_ui.cjs

fs.writeFileSync('index.html', html);
console.log('patched btns');
