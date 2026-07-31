const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'templates-clean', 'fortunei');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));

// All date variants to replace
const dateReplacements = [
  { find: '07.06.2026', replace: '{DATA_CONTRACT}' },
  { find: '07.02.2026', replace: '{DATA_CONTRACT}' },
  { find: '07.06.206', replace: '{DATA_CONTRACT}' }, // typo in Decizie
  { find: 'Nr.263/07.06.2026', replace: 'Nr.{NUMAR_CONTRACT}/{DATA_CONTRACT}' },
  { find: 'Nr.263/07.06.2026', replace: 'Nr.{NUMAR_CONTRACT}/{DATA_CONTRACT}' },
];

function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeXml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function cleanDocx(inputPath, outputPath, replacements) {
  const data = fs.readFileSync(inputPath);
  const zip = new PizZip(data);
  let xml = zip.file('word/document.xml').asText();
  let replacementsMade = 0;
  const log = [];

  for (const { find, replace } of replacements) {
    if (xml.includes(find)) {
      const count = (xml.match(new RegExp(escapeRegex(find), 'g')) || []).length;
      xml = xml.split(find).join(replace);
      replacementsMade += count;
      log.push('  OK "' + find + '" -> "' + replace + '" (' + count + 'x)');
    } else {
      // Try fragmented text search
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
          replacementsMade++;
          log.push('  OK (frag) "' + find + '" -> "' + replace + '" (1x)');
        }
      }
    }
  }

  zip.file('word/document.xml', xml);
  const output = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, output);
  return { replacementsMade, log };
}

let total = 0;
for (const f of files) {
  const inputPath = path.join(dir, f);
  console.log('\n' + f);
  try {
    const result = cleanDocx(inputPath, inputPath, dateReplacements);
    total += result.replacementsMade;
    if (result.log.length > 0) result.log.forEach(line => console.log(line));
    else console.log('  No replacements');
    console.log('  Total: ' + result.replacementsMade);
  } catch (error) {
    console.error('  Error: ' + error.message);
  }
}
console.log('\nGrand total: ' + total);
