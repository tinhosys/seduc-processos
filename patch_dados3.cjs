const fs = require('fs');
if(fs.existsSync('js/dados2.js')) {
    let content = fs.readFileSync('js/dados2.js', 'utf8');
    content = content.replace('const STATUS_LIST = [', 'let STATUS_LIST = [');
    content = content.replace('const LOCALIZACAO_LIST = [', 'let LOCALIZACAO_LIST = [');
    fs.writeFileSync('js/dados2.js', content);
}
