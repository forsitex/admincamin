const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'clinceni');
const filesToCheck = [
  '10. Anexa 8 - Acord de închidere centru (2).docx',
  '4. Anexa 1.docx',
  '8. Anexa 5 - Acord schimbare schema de tratament.docx',
  '9. Anexa 7 - Acord in cazul schimbarii starii de sanatate (2).docx',
];

let output = '';

for (const f of filesToCheck) {
  const content = fs.readFileSync(path.join(dir, f));
  const zip = new PizZip(content);
  let text = '';
  zip.file(/word\/document\.xml/).forEach(file => { text += file.asText(); });
  const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  const plainText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';
  
  output += '================================================================\n';
  output += 'FILE: ' + f + '\n';
  output += '================================================================\n';
  output += plainText + '\n\n\n';
}

fs.writeFileSync(path.join(__dirname, 'clinceni-no-date-files.txt'), output);
console.log('Written ' + output.length + ' chars');
