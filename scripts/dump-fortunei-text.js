const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'fortunei');
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
  output += plainText + '\n\n\n';
}

fs.writeFileSync(path.join(__dirname, 'fortunei-text-dump.txt'), output);
console.log('Written to scripts/fortunei-text-dump.txt (' + output.length + ' chars)');
