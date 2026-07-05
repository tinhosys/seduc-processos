const fs = require('fs');

function fixBug() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // The actual HTML headers
  const headersHtml = `
            <tr style="background:#1a2b4c; color:white;">
              <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:3%; font-size:12px; font-weight:bold;">Nº</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:5%; font-size:12px; font-weight:bold;">PREF.</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:12%; font-size:12px; font-weight:bold;">PROCESSO SEI</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:18%; font-size:12px; font-weight:bold;">INTERESSADO</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:31%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:9%; font-size:12px; font-weight:bold;">STATUS</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:left; width:7%; font-size:12px; font-weight:bold;">LOCAL</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:center; width:7%; font-size:12px; font-weight:bold;">DATA</th>
              <th style="border: 1px solid #ccc; padding: 2px; text-align:right; width:8%; font-size:12px; font-weight:bold;">VALOR R$</th>
            </tr>`;

  // The actual HTML row mapper for Padrao (which uses index)
  const rowMapperPadraoHtml = `
        <tr>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${index + 1}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.prefixo || '-'}</td>
          <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap;">\${p.numero || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.interessado || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word;">\${p.objeto || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>\${p.status || '-'}</b></td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.localizacao || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${formatDate(p.data)}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatNumberOnly(p.valorOf)}</td>
        </tr>`;

  // The actual HTML row mapper for Detalhado (which uses i)
  const rowMapperDetalhadoHtml = `
        <tr>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${i + 1}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.prefixo || '-'}</td>
          <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:nowrap;">\${p.numero || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.interessado || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word;">\${p.objeto || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px;"><b>\${p.status || '-'}</b></td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px;">\${p.localizacao || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px;">\${formatDate(p.data)}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">\${formatNumberOnly(p.valorOf)}</td>
        </tr>`;

  // Fix Padrao table headers
  app = app.replace(/\$\{buildHeaders\(\)\}/g, headersHtml);

  // Fix Padrao mapping
  app = app.replace(/\$\{buildRowMapper\(\)\}/g, rowMapperPadraoHtml);

  // Fix Detalhado mapping
  app = app.replace(/\$\{buildRowMapperDetalhado\(\)\}/g, rowMapperDetalhadoHtml);

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Fixed the literal injection bug');
}

fixBug();
