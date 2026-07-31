const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'clinceni');

function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeXml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function processFileAll(filename, replacements) {
  const filePath = path.join(dir, filename);
  const data = fs.readFileSync(filePath);
  const zip = new PizZip(data);
  let xml = zip.file('word/document.xml').asText();
  let count = 0;

  for (const { find, replace } of replacements) {
    let safety = 0;
    while (safety < 30) {
      safety++;
      
      if (xml.includes(find)) {
        const matches = xml.match(new RegExp(escapeRegex(find), 'g'));
        const n = matches ? matches.length : 0;
        xml = xml.split(find).join(replace);
        count += n;
        console.log('  OK "' + find.substring(0, 70) + '" -> "' + replace + '" (' + n + 'x)');
        continue;
      }
      
      // Try fragmented search
      const wTPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let match;
      const tElements = [];
      while ((match = wTPattern.exec(xml)) !== null) {
        tElements.push({ fullTag: match[0], text: match[1] });
      }
      const fullText = tElements.map(t => t.text).join('');
      
      if (fullText.includes(find)) {
        const pos = fullText.indexOf(find);
        let currentPos = 0, startPos = -1, endPos = -1;
        for (let i = 0; i < tElements.length; i++) {
          const elemStart = currentPos;
          const elemEnd = currentPos + tElements[i].text.length;
          if (startPos === -1 && elemEnd > pos) startPos = i;
          if (elemEnd >= pos + find.length) { endPos = i; break; }
          currentPos = elemEnd;
        }
        
        if (startPos >= 0 && endPos >= 0) {
          const beforeText = fullText.substring(
            tElements.slice(0, startPos).reduce((sum, t) => sum + t.text.length, 0), pos
          );
          const afterText = fullText.substring(
            pos + find.length,
            tElements.slice(0, endPos + 1).reduce((sum, t) => sum + t.text.length, 0)
          );
          const firstTag = tElements[startPos].fullTag;
          const newFirstText = beforeText + replace + afterText;
          const newFirstTag = firstTag.replace(
            /<w:t([^>]*)>([^<]*)<\/w:t>/,
            '<w:t$1>' + escapeXml(newFirstText) + '</w:t>'
          );
          xml = xml.replace(firstTag, newFirstTag);
          for (let i = startPos + 1; i <= endPos; i++) {
            const emptyTag = tElements[i].fullTag.replace(
              /<w:t([^>]*)>([^<]*)<\/w:t>/, '<w:t$1></w:t>'
            );
            xml = xml.replace(tElements[i].fullTag, emptyTag);
          }
          count++;
          console.log('  OK (frag) "' + find.substring(0, 70) + '" -> "' + replace + '" (1x)');
          continue;
        }
      }
      
      break;
    }
  }

  zip.file('word/document.xml', xml);
  const output = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(filePath, output);
  return count;
}

let total = 0;

// Common replacement: seria  RK   nr. 611070
const ciFix = { find: 'seria  RK   nr. 611070', replace: 'seria {APARTINATOR_CI_SERIE} nr. {APARTINATOR_CI_NUMAR}' };

// === 1. Cerere de admitere ===
console.log('\n--- 1. Cerere de admitere.docx ---');
total += processFileAll('1. Cerere de admitere.docx', [
  ciFix,
  { find: 'Nr.508/', replace: 'Nr.{NUMAR_CERERE}/' },
]);

// === 2. Decizie de admitere ===
console.log('\n--- 2. Decizie de admitere.docx ---');
total += processFileAll('2. Decizie de admitere.docx', [
  { find: '15.042026', replace: '{DATA_CONTRACT}' },
]);

// === 5. Anexa 2 - angajament de plata ===
console.log('\n--- 5. Anexa 2 - angajament de plata.docx ---');
total += processFileAll('5. Anexa 2 - angajament de plata.docx', [ciFix]);

// === 6. Anexa 3 ===
console.log('\n--- 6. Anexa 3 - Acord privind prelucrarea datelor.docx ---');
total += processFileAll('6. Anexa 3 - Acord privind prelucrarea datelor cu caracter personal.docx', [ciFix]);

// === 7. Anexa 4 ===
console.log('\n--- 7. Anexa 4 - Acord utilizare imagine.docx ---');
total += processFileAll('7. Anexa 4 - Acord utilizare imagine.docx', [ciFix]);

// === 8. Anexa 6 ===
console.log('\n--- 8. Anexa 6 - Declarație de neasumare (2).docx ---');
total += processFileAll('8. Anexa 6 - Declarație de neasumare (2).docx', [ciFix]);

// === 13. PV predare-primire ===
console.log('\n--- 13. PV predare-primire.docx ---');
total += processFileAll('13. PV predare-primire.docx', [ciFix]);

// === CONTRACT NOU ===
console.log('\n--- CONTRACT NOU.docx ---');
total += processFileAll('CONTRACT NOU.docx', [
  ciFix,
  { find: 'nr.509/', replace: 'nr.{NUMAR_DECIZIE}/' },
  { find: 'nr. 515/', replace: 'nr. {NUMAR_PLAN_INTERVENTIE}/' },
  { find: 'nr. 516/', replace: 'nr. {NUMAR_PLAN_SERVICII}/' },
]);

// === DECLARAȚIE BUNURI ===
console.log('\n--- DECLARAȚIE BUNURI DE VALOARE CLINCENI.docx ---');
total += processFileAll('DECLARAȚIE BUNURI DE VALOARE CLINCENI.docx', [ciFix]);

// === DECLARAȚIE ROF ===
console.log('\n--- DECLARAȚIE_LUARE_LA_CUNOȘTINȚĂ_ROF_CLINCENI.docx ---');
total += processFileAll('DECLARAȚIE_LUARE_LA_CUNOȘTINȚĂ_ROF_CLINCENI.docx', [ciFix]);

console.log('\n=== TOTAL FIXES: ' + total + ' ===');
