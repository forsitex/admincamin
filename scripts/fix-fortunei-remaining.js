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
      console.log('  OK "' + find.substring(0, 60) + '" -> "' + replace + '" (' + n + 'x)');
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
        let searchPos = 0;
        while (true) {
          const pos = fullText.indexOf(find, searchPos);
          if (pos === -1) break;
          
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
            console.log('  OK (frag) "' + find.substring(0, 60) + '" -> "' + replace + '" (1x)');
          }
          searchPos = pos + find.length;
          
          // Re-read tElements for next iteration since xml changed
          // Actually break after first fragmented replacement to avoid issues
          break;
        }
      } else {
        console.log('  SKIP "' + find.substring(0, 60) + '" (not found)');
      }
    }
  }

  zip.file('word/document.xml', xml);
  const output = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(filePath, output);
  return count;
}

let total = 0;

// === File 1: Cerere de admitere ===
console.log('\n--- 1. Cerere de admitere.docx ---');
total += processFile('1. Cerere de admitere.docx', [
  // Hardcoded number
  { find: 'Nr.260/', replace: 'Nr.{NUMAR_CERERE}/' },
  // NR 037720 -> nr. {APARTINATOR_CI_NUMAR}
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
  // Fix swapped: beneficiar has {APARTINATOR_ADRESA}, should be {BENEFICIAR_ADRESA}
  // The pattern: "de către {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}"
  // -> "de către {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}"
  { find: '{BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}', replace: '{BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}' },
  // Fix swapped: apartinator has {BENEFICIAR_CI_ELIBERAT_DE}, should be {APARTINATOR_CI_ELIBERAT_DE}
  // Pattern: "de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}"
  // -> "de către  {APARTINATOR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}"
  { find: 'de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}', replace: 'de către  {APARTINATOR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}' },
]);

// === File 2: ACORD GDPR ===
console.log('\n--- 2. ACORD GDPR.docx ---');
total += processFile('2. ACORD GDPR.docx', [
  // Hardcoded number
  { find: 'Nr.261/', replace: 'Nr.{NUMAR_GDPR}/' },
  // NR 037720
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
]);

// === File 3: Decizie de admitere ===
console.log('\n--- 3. Decizie de admitere.docx ---');
total += processFile('3. Decizie de admitere.docx', [
  // NR 037720 (if any)
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
]);

// === File 4: Contract prestare servicii ===
console.log('\n--- 4. Contract prestare servicii.docx ---');
total += processFile('4. Contract prestare servicii.docx', [
  // Hardcoded name
  { find: 'FLOREA DOINA-MARIA', replace: '{APARTINATOR_NUME}' },
  // NR 037720
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
  // Fix swapped: apartinator has {BENEFICIAR_CI_ELIBERAT_DE}, should be {APARTINATOR_CI_ELIBERAT_DE}
  // Pattern: "de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}"
  { find: 'de cățre  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}', replace: 'de cățre  {APARTINATOR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}' },
  { find: 'de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}', replace: 'de către  {APARTINATOR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}' },
]);

// === File 5: Anexa 1 - angajament de plata ===
console.log('\n--- 5. Anexa 1 - angajament de plata.docx ---');
total += processFile('5. Anexa 1 - angajament de plata.docx', [
  // Hardcoded contract number
  { find: 'Nr.263/', replace: 'Nr.{NUMAR_CONTRACT}/' },
  // NR 037720
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
  // Fix swapped: apartinator section has {BENEFICIAR_CI_ELIBERAT_DE} and {BENEFICIAR_ADRESA}
  // "de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}, declar"
  { find: 'de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}, declar', replace: 'de către  {APARTINATOR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}, declar' },
]);

// === File 6: Anexa 2 - acord tratament ===
console.log('\n--- 6. Anexa 2 - acord tratament.docx ---');
total += processFile('6. Anexa 2 - acord tratament.docx', [
  // NR 037720
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
  // Fix swapped: apartinator section
  // "de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA},  în calitate"
  { find: 'de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA},  în calitate', replace: 'de către  {APARTINATOR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA},  în calitate' },
]);

// === File 7: Anexa 3 ===
console.log('\n--- 7. Anexa 3 - Acord in cazul schimbarii starii de sanatate.docx ---');
total += processFile('7. Anexa 3 - Acord in cazul schimbarii starii de sanatate.docx', [
  // NR 037720 (if any)
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
]);

// === File 8: Anexa 4 - Funerare ===
console.log('\n--- 8. Anexa 4 - Funerare.docx ---');
total += processFile('8. Anexa 4 - Funerare.docx', [
  // NR 037720 (if any)
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
]);

// === File 9: DECLARATIE BUNURI ===
console.log('\n--- 9. DECLARAȚIE BUNURI DE VALOARE CLINCENI (1).docx ---');
total += processFile('9. DECLARAȚIE BUNURI DE VALOARE CLINCENI (1).docx', [
  // NR 037720
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
  // Fix swapped: apartinator section has {BENEFICIAR_CI_ELIBERAT_DE} and {BENEFICIAR_ADRESA}
  // "de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}, în calitate de aparținător"
  { find: 'de către  {BENEFICIAR_CI_ELIBERAT_DE}, cu domiciliul în România, {BENEFICIAR_ADRESA}, în calitate de aparținător', replace: 'de către  {APARTINATOR_CI_ELIBERAT_DE}, cu domiciliul în România, {APARTINATOR_ADRESA}, în calitate de aparținător' },
]);

// === File 10: PV predare-primire ===
console.log('\n--- 10. PV predare-primire.docx ---');
total += processFile('10. PV predare-primire.docx', [
  // Hardcoded number
  { find: 'Nr265/', replace: 'Nr.{NUMAR_PV}/' },
  // NR 037720
  { find: 'NR 037720', replace: 'nr. {APARTINATOR_CI_NUMAR}' },
]);

console.log('\n=== TOTAL FIXES: ' + total + ' ===');
