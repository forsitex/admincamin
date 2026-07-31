const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'fortunei');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));

// Personal data from clean-templates-per-camin.js for fortunei
const personalData = [
  'FLOREA EUGENIA', '2481225400874', 'FLOREA DOINA-MARIA', 'FLOREA DOINA - MARIA',
  '2851006460160', 'RT', '796919', 'RZ', '037720',
  '263', '254', '262', '261', '264', '266', '265', '267',
];

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
  
  let found = false;
  
  // Check for personal data
  for (const term of personalData) {
    if (plainText.includes(term)) {
      const pos = plainText.indexOf(term);
      const context = plainText.substring(Math.max(0, pos - 50), pos + term.length + 50);
      output += '  PROBLEM: "' + term + '" -> ...' + context + '...\n';
      found = true;
    }
  }
  
  // Check for hardcoded dates (any DD.MM.YYYY except 25.05.2018)
  const dateMatches = plainText.match(/\d{2}\.\d{2}\.?\s*\.?\s*20\d{2}/g);
  if (dateMatches) {
    for (const d of dateMatches) {
      if (d !== '25.05.2018') {
        const pos = plainText.indexOf(d);
        const context = plainText.substring(Math.max(0, pos - 50), pos + d.length + 50);
        output += '  HARDCODED DATE: "' + d + '" -> ...' + context + '...\n';
        found = true;
      }
    }
  }
  
  // Count {DATA_CONTRACT}
  let dcCount = 0;
  let pos = 0;
  while ((pos = plainText.indexOf('{DATA_CONTRACT}', pos)) !== -1) {
    dcCount++;
    pos += 15;
  }
  output += '  {DATA_CONTRACT} count: ' + dcCount + '\n';
  
  if (!found) {
    output += '  CLEAN\n';
  }
  
  output += '\n';
}

fs.writeFileSync(path.join(__dirname, 'fortunei-full-check.txt'), output);
console.log('Written ' + output.length + ' chars for ' + files.length + ' files');
