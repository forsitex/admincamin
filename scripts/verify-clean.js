const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const folders = ['cetinei', 'clinceni', 'orhideelor'];
const baseDir = path.join(__dirname, '..', 'public', 'templates-clean');

const checks = [
  'BUCUR MARIA', '2590621293160', 'MIȚILĂ', '1850419297321',
  'COMAN ANETA', '2580104044440', 'COMAN NICOLETA', '2770922044441',
  'DARIE MARIA', '24911199400081', 'ION ATHENA', '240518420071',
];

let found = 0;
for (const folder of folders) {
  const dir = path.join(baseDir, folder);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f));
    const zip = new PizZip(content);
    let text = '';
    zip.file(/word\/document\.xml/).forEach(doc => { text += doc.asText(); });
    const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    for (const c of checks) {
      if (clean.includes(c)) {
        console.log('⚠️ ' + folder + '/' + f + ' → ' + c);
        found++;
      }
    }
  }
}

if (found === 0) console.log('✅ Curat - niciun datum personal ramas!');
else console.log('Total probleme: ' + found);
