const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\ADM\\.gemini\\antigravity\\brain\\7c37364e-e0de-4ab8-a783-d62ac1a2e0e2\\.system_generated\\logs\\transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"Create orcamento.js"')) {
    const json = JSON.parse(line);
    if (json.tool_calls) {
      json.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' && tc.args.TargetFile.endsWith('orcamento.js')) {
          fs.writeFileSync('js/orcamento.js', tc.args.CodeContent, 'utf8');
          console.log('Restored original orcamento.js! Length:', tc.args.CodeContent.length);
        }
      });
    }
  }
});
