const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'clinceni');
const file = 'CONTRACT NOU.docx';
const content = fs.readFileSync(path.join(dir, file));
const zip = new PizZip(content);
let text = '';
zip.file(/word\/document\.xml/).forEach(f => { text += f.asText(); });
const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
const plainText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';

// Show all date occurrences
const datePattern = /\d{2}\.\d{2}\.?\s*\.?\s*20\d{2}/g;
let match;
let count = 0;
while ((match = datePattern.exec(plainText)) !== null) {
  count++;
  const pos = match.index;
  const context = plainText.substring(Math.max(0, pos - 70), pos + match[0].length + 70);
  console.log('Date ' + count + ' ("' + match[0] + '"): ...' + context + '...\n');
}
console.log('Total date matches: ' + count);

// Also show {DATA_CONTRACT} occurrences
let pos2 = 0;
let count2 = 0;
while ((pos2 = plainText.indexOf('{DATA_CONTRACT}', pos2)) !== -1) {
  count2++;
  const context = plainText.substring(Math.max(0, pos2 - 70), pos2 + 70);
  console.log('DATA_CONTRACT ' + count2 + ': ...' + context + '...\n');
  pos2 += 15;
}
console.log('Total DATA_CONTRACT: ' + count2);
