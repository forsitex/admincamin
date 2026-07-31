const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'clinceni');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
let output = '';

// Personal data from clean-templates-per-camin.js for clinceni
const personalData = [
  'COMAN ANETA', '2580104044440', 'COMAN NICOLETA', '2770922044441',
  '611070', 'RK', '15.04.2026', '12.04.2026', '15.04 .2026', '12.04.  2026',
  '508', '509', '515', '516', '517', '518', '519', '520', '521',
];

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
      // Find context
      const pos = plainText.indexOf(term);
      const context = plainText.substring(Math.max(0, pos - 40), pos + term.length + 40);
      output += '  PROBLEM: "' + term + '" -> ...' + context + '...\n';
      found = true;
    }
  }
  
  // Check for hardcoded dates (any DD.MM.YYYY except 25.05.2018 which is GDPR)
  const dateMatches = plainText.match(/\d{2}\.\d{2}\.?\s*\.?\s*20\d{2}/g);
  if (dateMatches) {
    for (const d of dateMatches) {
      if (d !== '25.05.2018') {
        const pos = plainText.indexOf(d);
        const context = plainText.substring(Math.max(0, pos - 40), pos + d.length + 40);
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
    output += '  CLEAN - no personal data or hardcoded dates found\n';
  }
  
  output += '\n';
}

fs.writeFileSync(path.join(__dirname, 'clinceni-full-check.txt'), output);
console.log('Written ' + output.length + ' chars for ' + files.length + ' files');
