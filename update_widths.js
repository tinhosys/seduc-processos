const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

// Change button text
html = html.replace(/Governo \+ CAM\s*<\/button>/g, 'Impressão\n        </button>');

// Adjust table column widths
const oldThead = `<tr>
            <th style="width:15%;">Município</th>
            <th style="width:25%;">Prefeito(a)</th>
            <th style="width:25%;">Secretário(a)</th>
            <th style="width:23%;">E-mail</th>
            <th style="width:6%;text-align:center;">Escolas</th>
            <th style="width:6%;text-align:center;">Alunos</th>
          </tr>`;
          
const newThead = `<tr>
            <th style="width:15%;">Município</th>
            <th style="width:23%;">Prefeito(a)</th>
            <th style="width:23%;">Secretário(a)</th>
            <th style="width:23%;">E-mail</th>
            <th style="width:8%;text-align:center;">Escolas</th>
            <th style="width:8%;text-align:center;">Alunos</th>
          </tr>`;

// Replace using a more robust regex just in case
html = html.replace(/<th style="width:15%;">Município<\/th>[\s\S]*?<th style="width:6%;text-align:center;">Alunos<\/th>/, `<th style="width:15%;">Município</th>
            <th style="width:23%;">Prefeito(a)</th>
            <th style="width:23%;">Secretário(a)</th>
            <th style="width:23%;">E-mail</th>
            <th style="width:8%;text-align:center;">Escolas</th>
            <th style="width:8%;text-align:center;">Alunos</th>`);

// Bump version
html = html.replace(/v1\.0\.91/g, 'v1.0.92');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated');


// 2. Update print-proalfa.js
let js = fs.readFileSync('js/print-proalfa.js', 'utf8');

js = js.replace(/<th class="bg-blue" style="width:25%; text-align:center;">Prefeito\(a\)<\/th>/, '<th class="bg-blue" style="width:23%; text-align:center;">Prefeito(a)</th>');
js = js.replace(/<th class="bg-blue" style="width:25%; text-align:center;">Secretário\(a\)<\/th>/, '<th class="bg-blue" style="width:23%; text-align:center;">Secretário(a)</th>');
js = js.replace(/<th class="bg-blue" style="width:23%; text-align:center;">E-mail<\/th>/, '<th class="bg-blue" style="width:23%; text-align:center;">E-mail</th>'); // keeps 23
js = js.replace(/<th class="bg-blue" style="width:6%; text-align:center;">Escolas<\/th>/, '<th class="bg-blue" style="width:8%; text-align:center;">Escolas</th>');
js = js.replace(/<th class="bg-blue" style="width:6%; text-align:center;">Alunos<\/th>/, '<th class="bg-blue" style="width:8%; text-align:center;">Alunos</th>');

fs.writeFileSync('js/print-proalfa.js', js, 'utf8');
console.log('print-proalfa.js updated');

