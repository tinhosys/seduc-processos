const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /<div style="display:grid; grid-template-columns:repeat\(auto-fit, minmax\(200px, 1fr\)\); gap:15px; margin-bottom:20px;">[\s\S]*?<button id="btn-registrar-diaria"/;

const MUNICIPIOS_RO = [
  "Alta Floresta D'Oeste", "Alto Alegre dos Parecis", "Alto Paraíso", "Alvorada D'Oeste", "Ariquemes", 
  "Buritis", "Cabixi", "Cacaulândia", "Cacoal", "Campo Novo de Rondônia", "Candeias do Jamari", 
  "Castanheiras", "Cerejeiras", "Chupinguaia", "Colorado do Oeste", "Corumbiara", "Costa Marques", 
  "Cujubim", "Espigão D'Oeste", "Governador Jorge Teixeira", "Guajará-Mirim", "Itapuã do Oeste", 
  "Jaru", "Ji-Paraná", "Machadinho D'Oeste", "Ministro Andreazza", "Mirante da Serra", "Monte Negro", 
  "Nova Brasilândia D'Oeste", "Nova Mamoré", "Nova União", "Novo Horizonte do Oeste", "Ouro Preto do Oeste", 
  "Parecis", "Pimenta Bueno", "Pimenteiras do Oeste", "Porto Velho", "Presidente Médici", 
  "Primavera de Rondônia", "Rio Crespo", "Rolim de Moura", "Santa Luzia D'Oeste", "São Felipe D'Oeste", 
  "São Francisco do Guaporé", "São Miguel do Guaporé", "Seringueiras", "Teixeirópolis", "Theobroma", 
  "Urupá", "Vale do Anari", "Vale do Paraíso", "Vilhena"
];

let options = '';
for(let m of MUNICIPIOS_RO) {
  options += `<option value="${m}">${m}</option>`;
}

const replacement = `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:15px;">
            <div>
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Nome Completo do Beneficiário</label>
              <input type="text" id="diaria-nome" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="Ex: João da Silva">
            </div>
            <div>
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">CPF</label>
              <input type="text" id="diaria-cpf" maxlength="14" oninput="let v=this.value.replace(/\\D/g,'');if(v.length>3)v=v.replace(/^(\\d{3})(\\d)/,'$1.$2');if(v.length>6)v=v.replace(/^(\\d{3})\\.(\\d{3})(\\d)/,'$1.$2.$3');if(v.length>9)v=v.replace(/^(\\d{3})\\.(\\d{3})\\.(\\d{3})(\\d{1,2})$/,'$1.$2.$3-$4');this.value=v;" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="000.000.000-00">
            </div>
            <div>
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Cidade de Destino</label>
              <select id="diaria-cidade" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;">
                <option value="">Selecione a cidade...</option>
                ${options}
              </select>
            </div>
            <div>
              <label style="font-size:11px; color:#ef4444; text-transform:uppercase; font-weight:bold;">Data de Saída</label>
              <input type="date" id="diaria-data-saida" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;">
            </div>
            <div>
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Nº do Processo SEI</label>
              <input type="text" id="diaria-proc" maxlength="20" oninput="let v=this.value.replace(/\\D/g,'');if(v.length>4)v=v.replace(/^(\\d{4})(\\d)/,'$1.$2');if(v.length>10)v=v.replace(/^(\\d{4})\\.(\\d{6})(\\d)/,'$1.$2/$3');if(v.length>14)v=v.replace(/^(\\d{4})\\.(\\d{6})\\/(\\d{4})(\\d{1,2})$/,'$1.$2/$3-$4');this.value=v;" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="0000.000000/0000-00">
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 120px 150px 150px; gap:15px; margin-bottom:20px;">
            <div>
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Motivo da Viagem</label>
              <textarea id="diaria-motivo" rows="2" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc; resize:vertical; min-height:42px;" placeholder="Tipo Memorando..."></textarea>
            </div>
            <div>
              <label style="font-size:11px; color:#facc15; text-transform:uppercase; font-weight:bold;">Qtde Diárias</label>
              <input type="number" id="diaria-qtde" step="0.5" min="0" oninput="if(typeof calcularTotalDiaria==='function') calcularTotalDiaria()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ca8a04; background:#0f172a; color:#f8fafc;" placeholder="Ex: 1.5">
            </div>
            <div>
              <label style="font-size:11px; color:#22c55e; text-transform:uppercase; font-weight:bold;">Valor Unit. (R$)</label>
              <input type="number" id="diaria-valor-unit" step="0.01" min="0" oninput="if(typeof calcularTotalDiaria==='function') calcularTotalDiaria()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #16a34a; background:#0f172a; color:#f8fafc;" placeholder="0.00">
            </div>
            <div>
              <label style="font-size:11px; color:#a855f7; text-transform:uppercase; font-weight:bold;">Valor Total (R$)</label>
              <input type="text" id="diaria-valor-total" readonly style="width:100%; padding:10px; border-radius:6px; border:1px solid #9333ea; background:#1e1b4b; color:#c084fc; font-weight:bold;" placeholder="0.00">
            </div>
          </div>
          <script>
            function calcularTotalDiaria() {
              const qtde = parseFloat(document.getElementById('diaria-qtde').value) || 0;
              const unit = parseFloat(document.getElementById('diaria-valor-unit').value) || 0;
              const total = qtde * unit;
              document.getElementById('diaria-valor-total').value = total.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            }
          </script>
          <button id="btn-registrar-diaria"`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Patched index.html');
