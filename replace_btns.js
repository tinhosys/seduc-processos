
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const logadosBtnMatch = html.match(/<button type="button" onclick="abrirLogados\(\)"[\s\S]*?<\/button>/);
const excelBtnMatch = html.match(/<button class="btn action-adm" onclick="exportarExcel\(\)"[\s\S]*?<\/button>/);

if (logadosBtnMatch && excelBtnMatch) {
    const logadosBtn = logadosBtnMatch[0];
    const excelBtn = excelBtnMatch[0];

    const padraoSelBtn = excelBtn.replace('exportarExcel()', 'imprimirPadraoSelecionado()')
                                 .replace(/#16a34a/g, '#475569')
                                 .replace(/#15803d/g, '#334155')
                                 .replace('Exportar para Excel', 'Imprimir Selecionados')
                                 .replace('EXCEL', 'PADRÃO SEL.')
                                 .replace(/<svg[^>]*>.*?<\/svg>/, '<svg width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2.5\'><polyline points=\'6 9 6 2 18 2 18 9\'/><path d=\'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\'/><rect x=\'6\' y=\'14\' width=\'12\' height=\'8\'/></svg>');

    html = html.replace(logadosBtn, excelBtn);
    html = html.replace(excelBtn, padraoSelBtn);

    fs.writeFileSync('index.html', html);
    console.log('Buttons replaced.');
} else {
    console.log('Could not find buttons');
}

