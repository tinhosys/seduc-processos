const fs = require('fs');

const files = ['index.html', 'js/app.js', 'js/dados.js', 'js/mapa.js', 'js/escolas.js'];
const c = '\uFFFD';

const replacements = {
    [`NAVEGA${c}${c}O`]: `NAVEGAÇÃO`,
    [`Pedido ${c} Relat`]: `Pedido - Relat`,
    [`RELAT${c}RIO`]: `RELATÓRIO`,
    [`Amplia${c}${c}o`]: `Ampliação`,
    [`observa${c}${c}es`]: `observações`,
    [`usuários ${c} Planilha`]: `usuários à Planilha`,
    [`localiza${c}${c}o`]: `localização`,
    [`Próximo ${c} praça`]: `Próximo à praça`,
    [`Cont${c}iner`]: `Contêiner`,
    [`navega${c}${c}o`]: `navegação`,
    [`AN${c}LISE`]: `ANÁLISE`,
    [`Manifesta${c}${c}o`]: `Manifestação`,
    [`SEDUC ${c} M`]: `SEDUC - M`,
    [`${c}LTIMA`]: `ÚLTIMA`,
    [`IMPORTA${c}${c}O`]: `IMPORTAÇÃO`,
    [`EXPORTA${c}${c}O`]: `EXPORTAÇÃO`,
    [`EDI${c}AO`]: `EDIÇÃO`,
    [`SEDUC ${c} Módulo`]: `SEDUC - Módulo`,
    [`bairros ${c} coordenadas`]: `bairros - coordenadas`,
    [`concei${c}${c}o`]: `conceição`,
    [`urbano ${c} área`]: `urbano - área`,
    [`Urup${c}`]: `Urupá`,
    [`wa.me ${c} a`]: `wa.me é a`,
    [`WhatsApp ${c} abre`]: `WhatsApp - abre`,
    [`</a> ${c} SEDUC`]: `</a> - SEDUC`,
    [`Inst${c}ncia`]: `Instância`,
    [`J${c} tem`]: `Já tem`,
    [`137.5${c}`]: `137.5º`,
    [`) ${c} pequena`]: `) é pequena`,
    [`550m ${c} evita`]: `550m - evita`,
    [`SEDUC ${c} Formul`]: `SEDUC - Formul`,
    [`tamb${c}m`]: `também`,
    [`' ${c} '`]: `' - '`,
    [`P${c}GINA`]: `PÁGINA`,
    [`PAGINA${c}${c}O`]: `PAGINAÇÃO`,
    [`">${c}</button>`]: `">»</button>`,
    [`correspondente ${c} escola`]: `correspondente à escola`,
    [`formul${c}rio`]: `formulário`,
    [`pr${c}-preenchido`]: `pré-preenchido`,
    [`/ N${c}`]: `/ Nº`,
    [`a${c}${c}o`]: `ação`,
    [`"${c}${c}${c}${c}"`]: `"****"`,
    [`">${c}</div>`]: `">-</div>`,
    [`GBZ ${c} v1.0`]: `GBZ - v1.0`,
    [`>«</button>`]: `>«</button>`, // Just making sure left arrow is fixed. Actually ual - 1 was first in the log
    [`1) + ')">${c}</button>'`]: `1) + ')">«</button>'`,
    [`+ 1) + ')">${c}</button>'`]: `+ 1) + ')">»</button>'`
};

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;

        for (const [key, value] of Object.entries(replacements)) {
            content = content.split(key).join(value);
        }

        // Catch-all for stray UFFFD in case I missed any generic ones
        // If there's an isolated `\uFFFD`, we can just remove it or change it to `-` if it's safe
        // But doing a split-join is exact.

        if (content !== original) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Fixed ${file}`);
        } else {
            console.log(`No changes for ${file}`);
        }
    }
});
