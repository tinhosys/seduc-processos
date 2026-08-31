const fs = require('fs');
const parseCSV = (str) => {
    let result = [];
    let row = [];
    let inQuotes = false;
    let val = '';
    for (let i = 0; i < str.length; i++) {
    let char = str[i];
    if (inQuotes) {
        if (char === '"') {
        if (i + 1 < str.length && str[i + 1] === '"') { val += '"'; i++; }
        else { inQuotes = false; }
        } else { val += char; }
    } else {
        if (char === '"') { inQuotes = true; }
        else if (char === ',') { row.push(val); val = ''; }
        else if (char === '\n' || char === '\r') {
        if (char === '\r' && i + 1 < str.length && str[i + 1] === '\n') i++;
        row.push(val); result.push(row); row = []; val = '';
        if (result.length >= 2) break;
        } else { val += char; }
    }
    }
    return result;
};
const est = parseCSV(fs.readFileSync('test_diarias_est.txt', 'utf8'));
const fed = parseCSV(fs.readFileSync('test_diarias_fed.txt', 'utf8'));
console.log('ESTADUAL:', est[0]);
console.log('FEDERAL:', fed[0]);
