const fs = require('fs');
fetch('https://seduc-backend.onrender.com/api/registros?refresh=true')
  .then(r => r.json())
  .then(data => {
    const massRows = data.rows.filter(r => r._tabName === 'Mass');
    console.log(Object.keys(massRows[0]));
  });
