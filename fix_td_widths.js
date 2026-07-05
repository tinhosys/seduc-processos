const fs = require('fs');

function applyWidthsToMiolo() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // We need to find the rowMapper logic for Padrao and Detalhado and add widths to their TDs.
  
  // Detalhado is inside: tableRows += ` <tr> ... </tr> `;
  const detalhadoRowRegex = /<td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap;">\$\{p\.numero \|\| '-'}<\/td>/g;
  
  // We'll replace the entire row string for Detalhado and Padrao. They are identical except for the loop variable `index` vs `i`.
  
  const oldPadraoTdRegex = /<td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\$\{index \+ 1\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\$\{p\.prefixo \|\| '-'\}<\/td>\s*<td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap;">\$\{p\.numero \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\$\{p\.interessado \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word;">\$\{p\.objeto \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;">\$\{p\.status \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\$\{p\.localizacao \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\$\{formatDate\(p\.data\)\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\$\{formatNumberOnly\(p\.valorOf\)\}<\/td>/g;

  const newPadraoTd = `<td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:3%;">\${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:5%;">\${p.prefixo || '-'}</td>
            <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap; width:12%;">\${p.numero || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:18%;">\${p.interessado || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:31%;">\${p.objeto || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px; width:9%;">\${p.status || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">\${p.localizacao || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:7%;">\${formatDate(p.data)}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px; width:8%;">\${formatNumberOnly(p.valorOf)}</td>`;

  app = app.replace(oldPadraoTdRegex, newPadraoTd);

  const oldDetalhadoTdRegex = /<td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\$\{i \+ 1\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\$\{p\.prefixo \|\| '-'\}<\/td>\s*<td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap;">\$\{p\.numero \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\$\{p\.interessado \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word;">\$\{p\.objeto \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;">\$\{p\.status \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\$\{p\.localizacao \|\| '-'\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\$\{formatDate\(p\.data\)\}<\/td>\s*<td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\$\{formatNumberOnly\(p\.valorOf\)\}<\/td>/g;

  const newDetalhadoTd = `<td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:3%;">\${i + 1}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:5%;">\${p.prefixo || '-'}</td>
          <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap; width:12%;">\${p.numero || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:18%;">\${p.interessado || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:31%;">\${p.objeto || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px; width:9%;">\${p.status || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">\${p.localizacao || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:7%;">\${formatDate(p.data)}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px; width:8%;">\${formatNumberOnly(p.valorOf)}</td>`;

  app = app.replace(oldDetalhadoTdRegex, newDetalhadoTd);
  
  // Let's also remove `table-layout: fixed;` if we are explicitly putting widths on all cells, it's safer but it's good to keep it to prevent pushing. Let's keep `table-layout: fixed;`.

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Applied widths explicitly to TDs');
}

applyWidthsToMiolo();
