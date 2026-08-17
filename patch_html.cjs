const fs = require('fs');
const file = 'C:/Users/ADM/.gemini/antigravity/scratch/seduc-processos/index.html';
let content = fs.readFileSync(file, 'utf8');

const startStr = '<section class="page" id="page-todas-escolas">';
const endStr = '</section>'; // Needs to find the corresponding closing section

const startIdx = content.indexOf(startStr);
if (startIdx !== -1) {
  // Find the next </section> after startIdx
  // Actually, since it's a section, let's find the closing section that precedes the next page.
  const nextSectionIdx = content.indexOf('<section class="page"', startIdx + 10);
  let endIdx = -1;
  if (nextSectionIdx !== -1) {
    endIdx = content.lastIndexOf('</section>', nextSectionIdx);
  } else {
    // If it's the last section
    endIdx = content.indexOf('</main>', startIdx);
    if (endIdx !== -1) endIdx = content.lastIndexOf('</section>', endIdx);
  }
  
  if (endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + content.substring(endIdx + 10);
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Removed page-todas-escolas from index.html');
  } else {
    console.log('Could not find end of section');
  }
} else {
  console.log('page-todas-escolas not found');
}
