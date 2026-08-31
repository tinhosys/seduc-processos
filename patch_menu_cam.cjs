const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove Municípios from Escolas
const munRegex = /<a href="#" class="nav-item sub-item" data-page="contatos"[\s\S]*?<\/a>/;
const munStrMatch = content.match(munRegex);
if(munStrMatch) {
    content = content.replace(munRegex, '');
} else {
    console.log("Municípios not found!");
}

// 2. Replace PROALFA with the new CAM group containing PROALFA, GDSM, GMAC, and Municípios
const proalfaRegex = /<a href="#" class="nav-item" data-page="proalfa"[\s\S]*?<\/a>/;
const proalfaStrMatch = content.match(proalfaRegex);

if(proalfaStrMatch) {
    // We convert the PROALFA top-level link to a sub-item format.
    // The PROALFA top-level link had an icon, but sub-items don't usually have icons.
    const proalfaSubItem = `<a href="#" class="nav-item sub-item" data-page="proalfa" onclick="navegar('proalfa')" style="font-size: 13px; padding: 10px 16px;"><span>PROALFA</span></a>`;
    const munSubItem = munStrMatch ? munStrMatch[0].trim() : '';

    const camGroupHtml = `
          <!-- Menu CAM -->
          <div class="nav-group">
            <a href="#" class="nav-item" onclick="toggleSubmenu('sub-cam', this)">
              <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg></span>
              <span style="flex:1">CAM</span>
              <svg class="submenu-indicator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
            <div class="nav-submenu" id="sub-cam" style="display: none; padding-left: 20px;">
              <a href="#" class="nav-item sub-item" onclick="alert('GDSM está em construção');" style="font-size: 13px; padding: 10px 16px;"><span>GDSM (Em Construção)</span></a>
              <a href="#" class="nav-item sub-item" onclick="alert('GMAC está em construção');" style="font-size: 13px; padding: 10px 16px;"><span>GMAC (Em Construção)</span></a>
              ${proalfaSubItem}
              ${munSubItem}
            </div>
          </div>
`;

    content = content.replace(proalfaRegex, camGroupHtml);
    fs.writeFileSync('index.html', content);
    console.log('CAM menu created successfully!');
} else {
    console.log("PROALFA not found!");
}
