const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

// We will replace the entire carregarDiariasData block and everything until popularSelectsDiarias
const start = content.indexOf('window.carregarDiariasData =');
const end = content.indexOf('window.inserirDiaria =');

let replacement = `let CONSOL_DATA_SETORES = [];
let CONSOL_DATA_NOTAS = [];
let PARAM_SETORES = [];
let PARAM_STATUS = [];

window.carregarDiariasData = async function() {
  try {
    const urlBase = 'https://docs.google.com/spreadsheets/d/1WunsuLAAIUAAo1q65qmSVMIH0qLJu_TjDsb_u9LO304/gviz/tq?tqx=out:csv&gid=';
    
    const [resEst, resFed, resConsol, resParam] = await Promise.all([
      fetch(urlBase + '807660383'),
      fetch(urlBase + '1893936129'),
      fetch(urlBase + '325984433'),
      fetch(urlBase + '24037202')
    ]);
    
    if(!resEst.ok) throw new Error('Falha ao carregar');
    
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
          else if (char === '\\n' || char === '\\r') {
            if (char === '\\r' && i + 1 < str.length && str[i + 1] === '\\n') i++;
            row.push(val); result.push(row); row = []; val = '';
          } else { val += char; }
        }
      }
      if (val || row.length > 0) { row.push(val); result.push(row); }
      return result;
    };

    DIARIAS_DATA = [];
    
    // Parse Estadual
    const rowsEst = parseCSV(await resEst.text());
    for (let i = 1; i < rowsEst.length; i++) {
      let cols = rowsEst[i];
      if (!cols || cols.length < 12) continue;
      const status = cols[0] ? cols[0].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const dataInicio = cols[3] ? cols[3].trim() : '';
      const setor = cols[5] ? cols[5].trim() : '';
      const motivo = cols[6] ? cols[6].trim().replace(/\\n/g, ' ') : '';
      const valorStr = cols[11] || '0';
      const valor = parseFloat(valorStr.replace(/R\\$|\\s/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
      const mes = cols[13] ? cols[13].trim() : '';
      DIARIAS_DATA.push({ origem: 'estadual', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor });
    }

    // Parse Federal
    const rowsFed = parseCSV(await resFed.text());
    for (let i = 1; i < rowsFed.length; i++) {
      let cols = rowsFed[i];
      if (!cols || cols.length < 11) continue;
      const status = cols[0] ? cols[0].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const dataInicio = cols[4] ? cols[4].trim() : '';
      const setor = cols[6] ? cols[6].trim() : '';
      const motivo = cols[7] ? cols[7].trim().replace(/\\n/g, ' ') : '';
      const valorStr = cols[10] || '0';
      const valor = parseFloat(valorStr.replace(/R\\$|\\s/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
      const mes = cols[12] ? cols[12].trim() : '';
      DIARIAS_DATA.push({ origem: 'federal', status, processo, data: dataInicio, nome: setor, motivo, valor, mes, setorOriginal: setor });
    }

    // Parse Consolidado
    CONSOL_DATA_SETORES = [];
    CONSOL_DATA_NOTAS = [];
    const rowsConsol = parseCSV(await resConsol.text());
    for (let i = 1; i < rowsConsol.length; i++) {
      let cols = rowsConsol[i];
      if (!cols || cols.length < 1) continue;
      if (cols[0] && cols[0].trim()) {
        CONSOL_DATA_SETORES.push({
          setor: cols[0],
          dentroAnulacao: cols[1] || 'R$ 0,00',
          dentroPago: cols[2] || 'R$ 0,00',
          dentroReserva: cols[3] || 'R$ 0,00',
          foraPago: cols[4] || 'R$ 0,00',
          foraReserva: cols[5] || 'R$ 0,00'
        });
      }
      if (cols[6] && cols[6].trim() && i <= 5) {
        CONSOL_DATA_NOTAS.push({
          nome: cols[6],
          empenhado: cols[7] || '',
          reforco: cols[8] || '',
          anulacao: cols[9] || '',
          valorAtualizado: cols[10] || '',
          pago: cols[11] || '',
          reserva: cols[12] || '',
          saldoLiquido: cols[13] || ''
        });
      }
    }

    // Parse Parâmetros
    PARAM_SETORES = [];
    PARAM_STATUS = [];
    const rowsParam = parseCSV(await resParam.text());
    for (let i = 1; i < rowsParam.length; i++) {
      let cols = rowsParam[i];
      if (cols && cols[0]) PARAM_SETORES.push(cols[0].trim());
      if (cols && cols[4]) PARAM_STATUS.push(cols[4].trim());
    }
    PARAM_SETORES = [...new Set(PARAM_SETORES)].filter(x => x);
    PARAM_STATUS = [...new Set(PARAM_STATUS)].filter(x => x);

    popularSelectsDiarias();
    renderizarDiarias();
    if(typeof renderConsolidadoDiarias === 'function') renderConsolidadoDiarias();

  } catch (e) {
    console.error(e);
    document.querySelector('#table-diarias tbody').innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#f87171;">Erro ao carregar dados.</td></tr>';
  }
};

window.popularSelectsDiarias = function() {
  const fill = (id, arr) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="Todos">Todos</option>' + arr.map(a => \`<option value="\${a}">\${a}</option>\`).join('');
  };
  fill('diaria-filtro-status', PARAM_STATUS.length ? PARAM_STATUS : [...new Set(DIARIAS_DATA.map(d => d.status))].filter(x => x));
  fill('diaria-filtro-setor', PARAM_SETORES.length ? PARAM_SETORES : [...new Set(DIARIAS_DATA.map(d => d.setorOriginal))].filter(x => x));
  fill('diaria-filtro-mes', [...new Set(DIARIAS_DATA.map(d => d.mes))].filter(x => x));
};

`;

content = content.substring(0, start) + replacement + content.substring(end);

fs.writeFileSync(file, content);
console.log('Patched carregarDiariasData in diarias.js');
