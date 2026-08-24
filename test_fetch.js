fetch("https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/export?format=csv&gid=807660383")
  .then(res => console.log('Status:', res.status, 'Headers:', res.headers.get('content-type')))
  .catch(err => console.error(err));
