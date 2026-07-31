const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'fortunei');
const file = '5. Anexa 1 - angajament de plata.docx';
const content = fs.readFileSync(path.join(dir, file));
const zip = new PizZip(content);
let text = '';
zip.file(/word\/document\.xml/).forEach(f => { text += f.asText(); });
const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
const plainText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';

let pos = 0;
let count = 0;
while ((pos = plainText.indexOf('{DATA_CONTRACT}', pos)) !== -1) {
  count++;
  const context = plainText.substring(Math.max(0, pos - 60), pos + 60);
  console.log('Occurrence ' + count + ': ...' + context + '...\n');
  pos += 15;
}
console.log('Total: ' + count);
