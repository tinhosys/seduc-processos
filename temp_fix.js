const fs = require('fs');

function fixCss(file) {
    if (!fs.existsSync(file)) return;
    let css = fs.readFileSync(file, 'utf8');

    // 1. Add table-layout: fixed to table { ... } block where width: 100% and border-collapse: collapse exists
    css = css.replace(/table\s*\{([^}]+width:\s*100%;[^}]+)\}/, (match, p1) => {
        if (!p1.includes('table-layout: fixed')) {
            return 'table {' + p1 + '  table-layout: fixed;\n}';
        }
        return match;
    });

    // 2. Remove white-space: nowrap from .col-numero, .col-interessado, .col-objeto
    css = css.replace(/\.col-numero\s*\{([^}]+)\}/, (match, p1) => {
        return '.col-numero {' + p1.replace(/white-space:\s*nowrap;?/, 'white-space: normal;') + '}';
    });
    css = css.replace(/\.col-interessado\s*\{([^}]+)\}/, (match, p1) => {
        return '.col-interessado {' + p1.replace(/white-space:\s*nowrap;?/, 'white-space: normal;').replace(/overflow:\s*hidden;?/, '').replace(/text-overflow:\s*ellipsis;?/, '') + ' word-wrap: break-word; overflow-wrap: break-word; word-break: normal; }';
    });
    css = css.replace(/\.col-objeto\s*\{([^}]+)\}/, (match, p1) => {
        return '.col-objeto {' + p1.replace(/white-space:\s*normal;?/, '') + ' word-wrap: break-word; overflow-wrap: break-word; word-break: normal; }';
    });

    // 3. Add global td wrapping
    // Find td { ... } block
    css = css.replace(/td\s*\{([^}]+)\}/, (match, p1) => {
        if (!p1.includes('word-wrap: break-word')) {
            return 'td {' + p1 + '\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  word-break: normal;\n}';
        }
        return match;
    });

    fs.writeFileSync(file, css);
    console.log('Fixed ' + file);
}

fixCss('css/style.css');
fixCss('css/style2.css');
