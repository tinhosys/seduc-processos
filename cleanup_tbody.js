const fs = require('fs');

function cleanupAndFix() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // ===== STEP 1: REMOVE ALL THE BROKEN tbody WRAPPING FROM LAST FIX =====
  
  // Remove <tbody class="no-page-break" ...><tr> and replace with just <tr class="no-page-break" ...>
  app = app.replace(/<tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr>/g, 
                    '<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">');
  
  app = app.replace(/<tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr style="font-weight:bold;/g, 
                    '<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold;');
  
  app = app.replace(/<tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr style="font-weight:bold; background:#f9fafb;">/g, 
                    '<tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold; background:#f9fafb;">');
  
  // Remove </tr></tbody>` back to just </tr>`
  app = app.replace(/<\/tr><\/tbody>`/g, '</tr>`');
  app = app.replace(/<\/tr><\/tbody>`\s*\)/g, '</tr>`)');
  app = app.replace(/<\/tr><\/tbody>`\s*;/g, '</tr>`;');
  
  // Fix nested tbodys like <tbody><tbody ...> -> just <tbody>
  app = app.replace(/<tbody><tbody class="no-page-break"[^>]*>/g, '<tbody>');
  
  // Fix thead/tbody corruption: <thead><tbody ...><tr><td> -> <thead><tr><td>
  app = app.replace(/<thead><tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr>/g, 
                    '<thead><tr>');
  
  // Fix tfoot/tbody corruption: <tfoot ...><tbody ...><tr><td> -> <tfoot ...><tr><td>
  app = app.replace(/<tfoot class="print-spacer-tfoot"><tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr>/g, 
                    '<tfoot class="print-spacer-tfoot"><tr>');
  
  // Fix the header row that also got wrapped wrongly: <tbody ...><tr>\n  <th -> should be <tr>\n  <th
  app = app.replace(/<tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr>\s*\n\s*<th/g, 
                    '<tr>\n                <th');

  // Fix the Detalhado header row: <tbody...><tr>\n <th ...> for the common header inside thead
  // The pattern: <tbody class="no-page-break" ...><tr><td colspan="9" ...>${getCommonHeader...}</td></tr>
  // This should be: <tr><td colspan="9" ...>${getCommonHeader...}</td></tr>
  app = app.replace(/<tbody class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><tr><td colspan="9" style="border:none;">/g, 
                    '<tr><td colspan="9" style="border:none;">');

  // ===== STEP 2: FIX THE THEAD TO REPEAT ON EVERY PAGE =====
  // The correct approach: put the COMMON HEADER inside a <thead> with display:table-header-group
  // CSS already handles this since we have the header in <thead> which repeats by default in print.
  // But we need to ensure thead is NOT wrapped in tbody.
  
  // Fix the Padrao and Detalhado thead corruption where the common header was a <tbody><tr>:
  // The pattern should be: <thead>\n<tr><td colspan="9" style="border:none;">${getCommonHeader('...')}</td></tr>\n<tr> (column headers)
  // Let's verify and clean up
  
  // Also fix the common pattern: </tr></tbody>`); -> </tr>`)
  app = app.replace(/<\/tr><\/tbody>`\)/g, '</tr>`)');
  
  // ===== STEP 3: ENSURE tr has page-break-inside: avoid in CSS, NOT via tbody wrapping =====
  // The CSS rule already has: tr, .no-page-break { page-break-inside: avoid !important; break-inside: avoid !important; }
  // So we just need clean HTML structure.
  
  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Cleanup done - removing corrupted tbody wrappers');
}

cleanupAndFix();
