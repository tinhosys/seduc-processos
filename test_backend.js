const fs = require('fs');
fetch('https://seduc-backend.onrender.com/api/registros?refresh=true')
  .then(r => r.json())
  .then(data => {
    fs.writeFileSync('backend_test.json', JSON.stringify(data, null, 2));
    console.log('Headers:', data.headers.slice(-10));
  });
