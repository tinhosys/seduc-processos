const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The form is <form id="form-acesso"
const startForm = html.indexOf('<form id="form-acesso"');
const endForm = html.indexOf('</form>', startForm) + 7;

if (startForm > -1 && endForm > -1) {
  let formHtml = html.substring(startForm, endForm);

  // Replace styles of inputs and select
  const commonStyle = `width:100%; height:40px; box-sizing:border-box; padding:10px 12px; border:1px solid rgba(255,255,255,0.1); border-radius:6px; font-size:14px; background:#1e293b; color:white; outline:none; transition: border-color 0.2s;`;
  
  formHtml = formHtml.replace(/style="width:100%; padding:10px 12px; border:1px solid\s*var\(--border\); border-radius:6px; font-size:14px; background:#475569; color:white; outline:none;"/g, `style="${commonStyle}"`);
  formHtml = formHtml.replace(/style="width:100%; padding:10px 12px; border:1px solid\s*var\(--border\); border-radius:6px; font-size:14px; background:var\(--bg-secondary\); color:var\(--text-primary\);\s*outline:none; height: 40px; box-sizing: border-box;"/g, `style="${commonStyle}"`);
  formHtml = formHtml.replace(/style="width:100%; padding:10px 12px; border:1px solid\s*var\(--border\); border-radius:6px; font-size:14px; background:#475569; color:white; outline:none; height: 40px;\s*box-sizing: border-box;"/g, `style="${commonStyle}"`);
  formHtml = formHtml.replace(/style="width:100%; padding:10px 12px; border:1px solid\s*var\(--border\); border-radius:6px; font-size:14px;\s*background:#475569; color:white; outline:none; text-align: center; letter-spacing: 2px; height: 40px; box-sizing:\s*border-box;"/g, `style="${commonStyle} text-align:center; letter-spacing:2px;"`);
  
  // also fix Nvel text
  formHtml = formHtml.replace(/Nvel/g, 'Nível');
  formHtml = formHtml.replace(/nǧmeros/g, 'números');

  html = html.substring(0, startForm) + formHtml + html.substring(endForm);
  fs.writeFileSync('index.html', html);
  console.log('patched form ui');
}
