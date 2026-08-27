const fs = require('fs');
let transcript = fs.readFileSync('C:\\Users\\ADM\\.gemini\\antigravity\\brain\\7c37364e-e0de-4ab8-a783-d62ac1a2e0e2\\.system_generated\\logs\\transcript_full.jsonl', 'utf8');
const lines = transcript.split('\n');
let found = false;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('fix_nav_and_cols.js')) {
    // found my old script!
    console.log(lines[i].substring(0, 500));
  }
}
