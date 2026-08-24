const http = require('https');
const req = http.request("https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/gviz/tq?tqx=out:csv&gid=807660383", {method: 'GET'}, (res) => {
  console.log('GViz Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Data length:', data.length, 'Data snippet:', data.substring(0, 100)));
});
req.end();
