const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'public', 'templates-clean');
const folders = ['cetinei', 'clinceni', 'orhideelor'];

// Personal data that should NOT appear anymore
const personalData = {
  cetinei: ['BUCUR MARIA', '2590621293160', 'PX', '580201', 'MITILĂ ȘTEFĂNIȚĂ', '1850419297321'],
  clinceni: ['COMAN ANETA', '2580104044440', 'COMAN NICOLETA', '2770922044441'],
  orhideelor: ['DARIE MARIA', '24911199400081', 'ION ATHENA', '240518420071'],
};

let allClean = true;

for (const folder of folders) {
  console.log('\n=== ' + folder.toUpperCase() + ' ===');
  const dir = path.join(baseDir, folder);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
  let folderClean = true;
  
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f));
    const zip = new PizZip(content);
    let text = '';
    zip.file(/word\/document\.xml/).forEach(file => { text += file.asText(); });
    
    const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    const plainText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';
    
    for (const term of personalData[folder]) {
      if (plainText.includes(term)) {
        console.log('  PROBLEM: ' + f + ' still contains "' + term + '"');
        folderClean = false;
        allClean = false;
      }
    }
  }
  
  if (folderClean) {
    console.log('  OK - all ' + files.length + ' files clean');
  }
}

console.log('\n' + (allClean ? 'ALL CLEAN' : 'PROBLEMS FOUND'));
