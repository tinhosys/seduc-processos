const fs = require('fs');

const processosList = [
  "0029.028413/2026-88",
  "0029.028809/2026-25",
  "0029.028834/2026-17",
  "0029.028159/2026-18",
  "0029.028287/2026-61",
  "0029.028763/2026-44",
  "0029.028326/2026-21",
  "0029.028567/2026-70",
  "0029.029912/2026-92",
  "0029.028319/2026-29"
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('Retentando 10 processos que falharam...');
  const res = await fetch('https://seduc-backend.onrender.com/api/registros?refresh=true');
  const json = await res.json();
  const dados = json.rows;
  
  let atualizados = 0;
  
  for (const item of dados) {
    const proc = String(item['Processo'] || '').trim();
    if (processosList.includes(proc)) {
      const id = item._tabName + '__' + item._rowNumber;
      console.log('Atualizando ' + proc + ' (' + id + ')...');
      
      const payload = Object.assign({}, item, { DIGITO: '501' });
      
      let success = false;
      for (let retries = 0; retries < 3 && !success; retries++) {
        try {
          const putRes = await fetch('https://seduc-backend.onrender.com/api/registros/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (putRes.ok) {
            console.log('[OK] ' + id + ' atualizado.');
            atualizados++;
            success = true;
          } else {
            console.log('[ERRO] status: ' + putRes.status + ' - Tentando novamente em 3s...');
            await sleep(3000);
          }
        } catch (err) {
          console.error('[ERRO] request falhou. Tentando de novo...');
          await sleep(3000);
        }
      }
    }
  }
  
  console.log('\nPronto! Retentativas OK: ' + atualizados + '/' + processosList.length);
}

run();
