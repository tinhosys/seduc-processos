const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

// Find the second occurrence of window.executarPadronizacaoPlanilha and remove it
const parts = content.split('window.executarPadronizacaoPlanilha = async function() {');
if (parts.length > 2) {
  // We have duplicates! The first one is mine, the second one is the old one.
  // The old one looks like this:
  // window.executarPadronizacaoPlanilha = async function() {
  //   const processos = carregarProcessos();
  //   ...
  // }; // wait, it might end with a catch or something.
  
  // Let's just completely cut out everything from the second occurrence to the end of that block.
  // The old block ends when a new global variable/function starts, or end of file.
  const oldCodeStart = 'window.executarPadronizacaoPlanilha = async function() {\n  const processos = carregarProcessos();';
  
  // I will use regex to remove the old one.
  const oldRegex = /window\.executarPadronizacaoPlanilha = async function\(\) \{\s*const processos = carregarProcessos\(\);[\s\S]*?\};/g;
  content = content.replace(oldRegex, '');
  
  fs.writeFileSync('js/app.js', content);
  console.log('removed duplicate');
} else {
  console.log('no duplicate found');
}
