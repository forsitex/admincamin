const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'clinceni');

function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeXml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function processFile(filename, replacements) {
  const filePath = path.join(dir, filename);
  const data = fs.readFileSync(filePath);
  const zip = new PizZip(data);
  let xml = zip.file('word/document.xml').asText();
  let count = 0;

  for (const { find, replace } of replacements) {
    if (xml.includes(find)) {
      const matches = xml.match(new RegExp(escapeRegex(find), 'g'));
      const n = matches ? matches.length : 0;
      xml = xml.split(find).join(replace);
      count += n;
      console.log('  OK "' + find.substring(0, 70) + '" -> "' + replace + '" (' + n + 'x)');
    } else {
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
        }
      } else {
        console.log('  SKIP "' + find.substring(0, 70) + '" (not found)');
      }
    }
  }

  zip.file('word/document.xml', xml);
  const output = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(filePath, output);
  return count;
}

let total = 0;

// === Anexa 8 ===
console.log('\n--- 10. Anexa 8 - Acord de închidere centru (2).docx ---');
total += processFile('10. Anexa 8 - Acord de închidere centru (2).docx', [
  { find: '15.04 .2026', replace: '{DATA_CONTRACT}' },
  { find: 'seria  RK   nr. 611070', replace: 'seria {APARTINATOR_CI_SERIE} nr. {APARTINATOR_CI_NUMAR}' },
]);

// === Anexa 1 ===
console.log('\n--- 4. Anexa 1.docx ---');
total += processFile('4. Anexa 1.docx', [
  { find: '15.04 .2026', replace: '{DATA_CONTRACT}' },
]);

// === Anexa 5 ===
console.log('\n--- 8. Anexa 5 - Acord schimbare schema de tratament.docx ---');
total += processFile('8. Anexa 5 - Acord schimbare schema de tratament.docx', [
  { find: '12.04.  2026', replace: '{DATA_CONTRACT}' },
  { find: 'seria  RK   nr. 611070', replace: 'seria {APARTINATOR_CI_SERIE} nr. {APARTINATOR_CI_NUMAR}' },
]);

// === Anexa 7 ===
console.log('\n--- 9. Anexa 7 - Acord in cazul schimbarii starii de sanatate (2).docx ---');
total += processFile('9. Anexa 7 - Acord in cazul schimbarii starii de sanatate (2).docx', [
  { find: '15.04 .2026', replace: '{DATA_CONTRACT}' },
]);

// === CONTRACT NOU ===
console.log('\n--- CONTRACT NOU.docx ---');
total += processFile('CONTRACT NOU.docx', [
  // Fix .2026 residual after {DATA_CONTRACT}
  { find: '{DATA_CONTRACT}.2026', replace: '{DATA_CONTRACT}' },
  // Replace all hardcoded 15.04.2026
  { find: '15.04.2026', replace: '{DATA_CONTRACT}' },
]);

console.log('\n=== TOTAL FIXES: ' + total + ' ===');
