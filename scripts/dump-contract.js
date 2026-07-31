const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'fortunei');
const file = '4. Contract prestare servicii.docx';
const content = fs.readFileSync(path.join(dir, file));
const zip = new PizZip(content);
let text = '';
zip.file(/word\/document\.xml/).forEach(f => { text += f.asText(); });
const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
const plainText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';

// Write to file to avoid truncation
fs.writeFileSync(path.join(__dirname, 'contract-text.txt'), plainText);
console.log('Written ' + plainText.length + ' chars');

// Show all {DATA_CONTRACT} positions
let pos = 0;
let count = 0;
while ((pos = plainText.indexOf('{DATA_CONTRACT}', pos)) !== -1) {
  count++;
  const context = plainText.substring(Math.max(0, pos - 60), pos + 60);
  console.log('\nOccurrence ' + count + ': ...' + context + '...');
  pos += 15;
}
console.log('\nTotal: ' + count);
