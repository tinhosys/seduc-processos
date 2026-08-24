const http = require('https');
const req = http.request("https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/export?format=csv&gid=807660383", {method: 'HEAD'}, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Location:', res.headers.location);
});
req.end();
