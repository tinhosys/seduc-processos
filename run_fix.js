const fs = require('fs');

const files = ['index.html', 'js/app.js', 'js/dados.js', 'js/mapa.js', 'js/escolas.js'];
const c = '\uFFFD';

const replacements = {
    [`MUNIC${c}PIOS`]: "MUNICÍPIOS",
    [`ARTICULA${c}O`]: "ARTICULAÇÃO",
    [`Munic${c}pio`]: "Município",
    [`Localiza${c}${c}o`]: "Localização",
    [`Localiza${c}o`]: "Localização",
    [`Endere${c}o`]: "Endereço",
    [`C${c}d.Super`]: "Cód.Super",
    [`N${c} Processo`]: "Nº Processo",
    [`Matr${c}culas`]: "Matrículas",
    [`A${c}${c}es`]: "Ações",
    [`A${c}es`]: "Ações",
    [`observa${c}es`]: "observações",
    [`espec${c}ficas`]: "específicas",
    [`Exibindo \${inicio + 1}${c}\${Math`]: "Exibindo ${inicio + 1} a ${Math",
    [`${c}ltima`]: "Última",
    [`Pr${c}xima`]: "Próxima",
    [`Usu${c}rio`]: "Usuário",
    [`P${c}gina`]: "Página",
    [`S${c}o`]: "São",
    [`N${c}o`]: "Não",
    [`exclu${c}-lo!`]: "excluí-lo!",
    [`ATEN${c}O`]: "ATENÇÃO",
    [` irrevers${c}vel`]: "é irreversível",
    [`10${c}50`]: "10 a 50"
};

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;

        for (const [key, value] of Object.entries(replacements)) {
            content = content.split(key).join(value);
        }

        content = content.replace(/õç\|/g, "&laquo;");
        content = content.replace(/\|õç/g, "&raquo;");
        content = content.replace(new RegExp(`${c}${c}${c}\\|`, 'g'), "&laquo;");
        content = content.replace(new RegExp(`\\|${c}${c}${c}`, 'g'), "&raquo;");
        content = content.replace(new RegExp(`${c}Y\\?T${c}`, 'g'), "📊");

        if (content !== original) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Fixed ${file}`);
        } else {
            console.log(`No changes for ${file}`);
        }
    }
});
