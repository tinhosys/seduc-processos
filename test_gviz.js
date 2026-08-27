const http = require('https');
const req = http.request("https://docs.google.com/spreadsheets/d/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08/gviz/tq?tqx=out:json&headers=1&gid=1855271818", {method: 'GET'}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const jsonStr = data.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
    const json = JSON.parse(jsonStr);
    console.log('Cols:', json.table.cols.map(c => c ? c.label : 'null'));
    if(json.table.rows.length > 0) {
      console.log('Row 0:', json.table.rows[0].c.map(c => c ? c.v : 'null'));
      console.log('Row 1:', json.table.rows[1].c.map(c => c ? c.v : 'null'));
    }
  });
});
req.end();
