const fs = require('fs');

function fixTableColgroup() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  const colgroupHtml = `
            <colgroup>
              <col style="width: 3%;">
              <col style="width: 5%;">
              <col style="width: 12%;">
              <col style="width: 18%;">
              <col style="width: 31%;">
              <col style="width: 9%;">
              <col style="width: 7%;">
              <col style="width: 7%;">
              <col style="width: 8%;">
            </colgroup>
  `;

  // Inject into Padrao
  // Find <table class="print-table-detalhado" ...>
  // Note: we can replace <table class="print-table-detalhado"([\s\S]*?)>
  app = app.replace(/<table class="print-table-detalhado"([\s\S]*?)>\s*<thead>/g, 
    `<table class="print-table-detalhado"$1 style="-webkit-print-color-adjust: exact; print-color-adjust: exact; width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">
${colgroupHtml}
            <thead>`);

  // To be safe, remove the old inline style since I just injected a cleaner one with print-color-adjust
  // Actually, my regex matched `([\s\S]*?)>` which includes the old style.
  // Wait, let's do a more precise replacement.
  
  // Let's reset the file from the last working state or just replace the specific table tag.
  // The table tags look like this:
  // <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word;">
  // or
  // <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">

  // Instead of complex regex, let's just replace all exact table tags:
  const exactTable1 = '<table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word;">';
  const exactTable2 = '<table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">';
  
  const replacementTable = `<table class="print-table-detalhado" style="-webkit-print-color-adjust: exact; print-color-adjust: exact; width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">
${colgroupHtml}`;

  app = app.replace(exactTable1, replacementTable);
  app = app.replace(exactTable2, replacementTable);

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Colgroup injected');
}

fixTableColgroup();
