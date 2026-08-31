const https = require('https');
async function check(id) {
  return new Promise((resolve) => {
    https.get(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json`, (res) => {
      resolve({id, code: res.statusCode});
    }).on('error', () => resolve({id, code: 500}));
  });
}
check('1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08').then(console.log);
