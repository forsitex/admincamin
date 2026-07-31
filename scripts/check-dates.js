const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'fortunei');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f));
  const zip = new PizZip(content);
  let text = '';
  zip.file(/word\/document\.xml/).forEach(file => { text += file.asText(); });
  
  const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  const plainText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';
  
  if (plainText.includes('07.06') || plainText.includes('2026')) {
    console.log('=== ' + f + ' ===');
    
    let pos = 0;
    while ((pos = plainText.indexOf('07.06', pos)) !== -1) {
      console.log('  07.06: ...' + plainText.substring(Math.max(0, pos - 40), pos + 40) + '...');
      pos++;
    }
    
    pos = 0;
    while ((pos = plainText.indexOf('2026', pos)) !== -1) {
      console.log('  2026: ...' + plainText.substring(Math.max(0, pos - 40), pos + 40) + '...');
      pos++;
    }
    console.log('');
  }
}
