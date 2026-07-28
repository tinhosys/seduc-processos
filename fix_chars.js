const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    // Read the file as a buffer to avoid encoding mangling if it's mixed
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The broken sequences observed:
    // MUNIC?PIOS -> MUNICÍPIOS
    // ARTICULAǟO -> ARTICULAÇÃO
    // Municpio -> Município
    // Cd.Super -> Cód.Super
    // N Processo -> Nº Processo
    // Localizao / Localizaǜo -> Localização
    // Endereo -> Endereço
    // Matrculas -> Matrículas
    // Aes -> Ações
    // observaes -> observações
    // especficas -> específicas
    // Y?T? -> 📊 (or just remove/replace with standard emoji if needed)
    
    const replacements = {
        'MUNIC?PIOS': 'MUNICÍPIOS',
        'ARTICULAǟO': 'ARTICULAÇÃO',
        'Municpio': 'Município',
        'Cd.Super': 'Cód.Super',
        'N Processo': 'Nº Processo',
        'Localizao': 'Localização',
        'Localizaǜo': 'Localização',
        'Endereo': 'Endereço',
        'Matrculas': 'Matrículas',
        'Aes': 'Ações',
        'observaes': 'observações',
        'especficas': 'específicas',
        'Y?T?': '📊',
        '': 'ã', // Fallback for some, but risky
    };
    
    let original = content;
    for (const [bad, good] of Object.entries(replacements)) {
        if (bad === '') continue; // do this last if needed
        content = content.split(bad).join(good);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    } else {
        console.log(`No changes for ${filePath}`);
    }
}

fixFile('index.html');
fixFile('js/app.js');
