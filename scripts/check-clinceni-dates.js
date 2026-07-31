const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'clinceni');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
let output = '';

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f));
  const zip = new PizZip(content);
  let text = '';
  zip.file(/word\/document\.xml/).forEach(file => { text += file.asText(); });
  
  const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  const plainText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';
  
  output += '================================================================\n';
  output += 'FILE: ' + f + '\n';
  output += '================================================================\n';
  
  // Show all {DATA_CONTRACT} occurrences with context
  let pos = 0;
  let count = 0;
  while ((pos = plainText.indexOf('{DATA_CONTRACT}', pos)) !== -1) {
    count++;
    const context = plainText.substring(Math.max(0, pos - 70), pos + 70);
    output += '  Occurrence ' + count + ': ...' + context + '...\n';
    pos += 15;
  }
  if (count === 0) output += '  NO {DATA_CONTRACT} FOUND!\n';
  output += '  Total: ' + count + '\n';
  
  // Also check for hardcoded dates (2024, 2025, 2026)
  const dateMatches = plainText.match(/\d{2}\.\d{2}\.20\d{2}/g);
  if (dateMatches) {
    output += '  HARDCODED DATES: ' + dateMatches.join(', ') + '\n';
  }
  
  output += '\n';
}

fs.writeFileSync(path.join(__dirname, 'clinceni-dates-check.txt'), output);
console.log('Written to scripts/clinceni-dates-check.txt');
