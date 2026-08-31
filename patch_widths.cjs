const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /<th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba\(255,255,255,0\.05\); position:sticky; top:0; z-index:10; white-space:nowrap;">(Data|Processo SEI|PA|Setor|Natureza|Tipo)<\/th>/g;

content = content.replace(regex, (match, p1) => {
  let width = '';
  if(p1 === 'Data') width = 'width: 8%;';
  else if(p1 === 'Processo SEI') width = 'width: 14%;';
  else if(p1 === 'PA') width = 'width: 5%;';
  else if(p1 === 'Setor') width = 'width: 6%;';
  else if(p1 === 'Natureza') width = 'width: 24%;';
  else if(p1 === 'Tipo') width = 'width: 10%;';
  return `<th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; white-space:nowrap; ${width}">${p1}</th>`;
});

content = content.replace(/<th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba\(255,255,255,0\.05\); position:sticky; top:0; z-index:10;">Descri/g, `<th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; width: 23%;">Descri`);

content = content.replace(/<th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba\(255,255,255,0\.05\); position:sticky; top:0; z-index:10; text-align:right; white-space:nowrap;">Valor \(R\$\)<\/th>/g, `<th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; text-align:right; white-space:nowrap; width: 10%;">Valor (R$)</th>`);

fs.writeFileSync(file, content);
console.log('Patched index.html widths');
