const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'fortunei');

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

// === File 4: Contract === Fix "{DATA_CONTRACT}6" -> "{DATA_CONTRACT}"
console.log('\n--- 4. Contract prestare servicii.docx ---');
total += processFile('4. Contract prestare servicii.docx', [
  { find: '{DATA_CONTRACT}6', replace: '{DATA_CONTRACT}' },
]);

// === File 5: Anexa 1 === Fix duplicated {DATA_CONTRACT} and missing date in header
console.log('\n--- 5. Anexa 1 - angajament de plata.docx ---');
total += processFile('5. Anexa 1 - angajament de plata.docx', [
  // Fix: "Nr.{NUMAR_CONTRACT}/{DATA_CONTRACT}/{DATA_CONTRACT}" -> "Nr.{NUMAR_CONTRACT}/{DATA_CONTRACT}"
  { find: '{NUMAR_CONTRACT}/{DATA_CONTRACT}/{DATA_CONTRACT}', replace: '{NUMAR_CONTRACT}/{DATA_CONTRACT}' },
  // Fix: "Nr. {NUMAR_CONTRACT} Nr. Angajament" -> "Nr. {NUMAR_CONTRACT}/{DATA_CONTRACT}Angajament"
  { find: '{NUMAR_CONTRACT} Nr. Angajament', replace: '{NUMAR_CONTRACT}/{DATA_CONTRACT}Angajament' },
]);

console.log('\n=== TOTAL FIXES: ' + total + ' ===');
