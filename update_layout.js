const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The outer container for tabs and buttons currently:
// <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: stretch; justify-content: space-between;">
//   <div style="display: flex; gap: 10px; flex-wrap: wrap; flex: 1;" id="proalfa-tabs"></div>
//   <div style="display: flex; gap: 8px; align-items: stretch; flex-wrap: wrap;">

const outerRegex = /<div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: stretch; justify-content: space-between;">\s*<div style="display: flex; gap: 10px; flex-wrap: wrap; flex: 1;" id="proalfa-tabs"><\/div>\s*<div style="display: flex; gap: 8px; align-items: stretch; flex-wrap: wrap;">/g;

const newLayout = `<div style="display: flex; gap: 30px; margin-bottom: 20px; flex-wrap: wrap; align-items: stretch; justify-content: space-between;">
      <div style="display: flex; gap: 10px; flex-wrap: wrap; width: 450px;" id="proalfa-tabs"></div>
      
      <div style="display: flex; gap: 10px; align-items: stretch; flex-wrap: wrap; flex: 1;">`;

html = html.replace(outerRegex, newLayout);

// Now make the 4 buttons have flex: 1 so they have the EXACT same width
// We'll replace their style tags.
html = html.replace(/<button onclick="imprimirCenso\(\)" style="/, '<button onclick="imprimirCenso()" style="flex:1; min-width:130px; ');
html = html.replace(/<button onclick="imprimirProfessores\(\)" style="/, '<button onclick="imprimirProfessores()" style="flex:1; min-width:130px; ');
html = html.replace(/<button onclick="imprimirMemoria\(\)" style="/, '<button onclick="imprimirMemoria()" style="flex:1; min-width:130px; ');

// For PLANILHA button, it has a slightly different style:
html = html.replace(/<button onclick="window\.open\('https:\/\/docs\.google\.com\/spreadsheets.*?\)?" style="background:rgba\(16,185,129,0\.15\);/, `<button onclick="window.open('https://docs.google.com/spreadsheets/d/12w-tBU6lMlKR7mncvbfoKjKGcvCZftd12CFKxdtf7ac/edit?gid=392130906#gid=392130906', '_blank')" style="flex:1; min-width:130px; background:rgba(16,185,129,0.15);`);

// Version bump to v1.0.88
html = html.replace(/v1\.0\.87/g, 'v1.0.88');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully');
