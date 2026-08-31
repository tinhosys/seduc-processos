const https = require('https');

const base = "1V28g";
const chars = ['I', 'l', '1'];
const end = "Vd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz";
const lasts = ['08', 'O8', 'o8'];

async function check(id) {
  return new Promise((resolve) => {
    https.get(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json`, (res) => {
      resolve({id, code: res.statusCode});
    }).on('error', () => resolve({id, code: 500}));
  });
}

async function run() {
  for(let c of chars) {
    for(let l of lasts) {
      const id = `${base}${c}${end}${l}`;
      const res = await check(id);
      console.log(res);
    }
  }
}
run();
