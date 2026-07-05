const fs = require('fs');

function fixAnaliseLayout() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Find the exact block in imprimirAnalise
  const targetRegex = /const bgColor = \(idx % 2 === 0\) \? '#f2f2f2' : '#ffffff';([\s\S]*?)<div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:\$\{bgColor\}; \n?padding:10px;"/g;

  // Let's replace the loop logic slightly to define border color
  const newLogic = `const bgColor = (idx % 2 === 0) ? '#f2f2f2' : '#ffffff';
      const leftBorder = (idx % 2 === 0) ? '4px solid transparent' : '4px solid #000';
      const obj = analise[st];
      const pct = ((obj.valor / (total||1)) * 100).toFixed(1);
      
      const arrLocais = Object.entries(obj.locais).sort((a,b) => b[1]-a[1]);
      const topLocaisStr = arrLocais.slice(0,3).map(l => \`\${l[0]} (\${l[1]})\`).join(', ');
  
      conteudoStatus += \`
        <div style="border-left:\${leftBorder}; margin-bottom:0; background:\${bgColor}; padding:10px;"`;

  // Wait, let's just do a simple replacement of the string that builds the div, since we can match it perfectly.
  // The current app.js has:
  /*
  const bgColor = (idx % 2 === 0) ? '#f2f2f2' : '#ffffff'; // Cinza 15% (f2f2f2) and white zebrado
      const obj = analise[st];
      const pct = ((obj.valor / (total||1)) * 100).toFixed(1);
      
      const arrLocais = Object.entries(obj.locais).sort((a,b) => b[1]-a[1]);
      const topLocaisStr = arrLocais.slice(0,3).map(l => `${l[0]} (${l[1]})`).join(', ');
  
      conteudoStatus += `
        <div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:${bgColor}; padding:10px;">
  */
  
  const searchBlock = `const bgColor = (idx % 2 === 0) ? '#f2f2f2' : '#ffffff'; // Cinza 15% (f2f2f2) and white zebrado
      const obj = analise[st];
      const pct = ((obj.valor / (total||1)) * 100).toFixed(1);
      
      const arrLocais = Object.entries(obj.locais).sort((a,b) => b[1]-a[1]);
      const topLocaisStr = arrLocais.slice(0,3).map(l => \`\${l[0]} (\${l[1]})\`).join(', ');
  
      conteudoStatus += \`
        <div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:\${bgColor}; padding:10px;">`;

  const replaceBlock = `const bgColor = (idx % 2 === 0) ? '#f2f2f2' : '#ffffff'; // Cinza 15% (f2f2f2) and white zebrado
      const leftBorder = (idx % 2 === 0) ? '4px solid transparent' : '4px solid #000';
      const obj = analise[st];
      const pct = ((obj.valor / (total||1)) * 100).toFixed(1);
      
      const arrLocais = Object.entries(obj.locais).sort((a,b) => b[1]-a[1]);
      const topLocaisStr = arrLocais.slice(0,3).map(l => \`\${l[0]} (\${l[1]})\`).join(', ');
  
      conteudoStatus += \`
        <div style="border-left:\${leftBorder}; margin-bottom:0; background:\${bgColor}; padding:10px;">`;

  // Try exact replace first
  if (app.includes(searchBlock)) {
    app = app.replace(searchBlock, replaceBlock);
  } else {
    // Fallback using Regex
    app = app.replace(/<div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:\$\{bgColor\};/g, 
                      '<div style="border-left:${(idx % 2 === 0) ? \'4px solid transparent\' : \'4px solid #000\'}; margin-bottom:0; background:${bgColor};');
  }

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Analise layout updated');
}

fixAnaliseLayout();
