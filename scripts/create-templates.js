/**
 * Script pentru crearea template-urilor DOCX din documentele completate
 * 
 * Înlocuiește datele personale cu placeholder-uri {NUME_VARIABILA}
 * Păstrează datele firmei (MOBIVIRO SRL / EMPATHY SUPPORT SRL) intacte
 * 
 * Date personale identificate în documente:
 * - Beneficiar: PITORAC ELENA, CNP 2400907214611, BI seria BK nr.654474
 * - Aparținător: MITAN CRISTINA ELENA, CNP 2810501410077, CI seria DP nr.184813
 * - Adrese, date CI, numere documente, costuri, data contract
 */

const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'templates');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'templates-clean');

// Datele personale care trebuie înlocuite cu placeholder-uri
// Atenție: ordinea contează - string-uri mai lungi primele pentru a evita potriviri parțiale
const REPLACEMENTS = [
  // === BENEFICIAR ===
  // Nume complet (poate apărea în mai multe forme)
  { find: 'PIT ORAC ELENA', replace: '{BENEFICIAR_NUME}' },
  { find: 'PITORAC ELENA', replace: '{BENEFICIAR_NUME}' },
  { find: 'PITORAC', replace: '{BENEFICIAR_NUME}' },
  
  // CNP beneficiar
  { find: '2400907214611', replace: '{BENEFICIAR_CNP}' },
  
  // CI/BI beneficiar - combinații
  { find: 'BK nr.654474', replace: '{BENEFICIAR_CI_SERIE} nr.{BENEFICIAR_CI_NUMAR}' },
  { find: 'BK  nr.654474', replace: '{BENEFICIAR_CI_SERIE} nr.{BENEFICIAR_CI_NUMAR}' },
  { find: 'seria BK nr.654474', replace: 'seria {BENEFICIAR_CI_SERIE} nr.{BENEFICIAR_CI_NUMAR}' },
  { find: 'seria BK  nr.654474', replace: 'seria {BENEFICIAR_CI_SERIE} nr.{BENEFICIAR_CI_NUMAR}' },
  { find: 'BI seria BK', replace: 'BI seria {BENEFICIAR_CI_SERIE}' },
  { find: 'BI seria BK nr.654474', replace: 'BI seria {BENEFICIAR_CI_SERIE} nr.{BENEFICIAR_CI_NUMAR}' },
  
  // Adresă beneficiar (încearcă mai multe variante - textul poate fi fragmentat)
  { find: 'Mun. Bucuresti, sector 5, str. Fat-Frumos nr. 8, bl. P16, sc 1, et. 7, ap.22', replace: '{BENEFICIAR_ADRESA}' },
  { find: 'Mun. Bucuresti,  sector 5, str. Fat-Frumos nr. 8, bl. P16, sc 1, et. 7, ap.22', replace: '{BENEFICIAR_ADRESA}' },
  { find: 'str. Fat-Frumos nr. 8, bl. P16, sc 1, et. 7, ap.22', replace: '{BENEFICIAR_ADRESA}' },
  { find: 'Fat-Frumos nr. 8, bl. P16, sc 1, et. 7, ap.22', replace: '{BENEFICIAR_ADRESA}' },
  
  // Data eliberării BI beneficiar
  { find: '11.06.2020', replace: '{BENEFICIAR_CI_DATA}' },
  
  // Eliberat de beneficiar
  { find: 'SPCEP Sector 5', replace: '{BENEFICIAR_CI_ELIBERAT_DE}' },
  { find: 'SPCEP  Sector 5', replace: '{BENEFICIAR_CI_ELIBERAT_DE}' },
  
  // === APARTINATOR ===
  // Nume complet
  { find: 'MITAN CRISTINA ELENA', replace: '{APARTINATOR_NUME}' },
  { find: 'MITAN  CRISTINA ELENA', replace: '{APARTINATOR_NUME}' },
  { find: 'MITAN CRISTINA', replace: '{APARTINATOR_NUME}' },
  
  // CNP apartinător
  { find: '2810501410077', replace: '{APARTINATOR_CNP}' },
  
  // CI apartinător
  { find: 'DP nr.184813', replace: '{APARTINATOR_CI_SERIE} nr.{APARTINATOR_CI_NUMAR}' },
  { find: 'DP  nr.184813', replace: '{APARTINATOR_CI_SERIE} nr.{APARTINATOR_CI_NUMAR}' },
  { find: 'seria DP nr.184813', replace: 'seria {APARTINATOR_CI_SERIE} nr.{APARTINATOR_CI_NUMAR}' },
  { find: 'seria DP  nr.184813', replace: 'seria {APARTINATOR_CI_SERIE} nr.{APARTINATOR_CI_NUMAR}' },
  { find: 'CI seria DP nr.184813', replace: 'CI seria {APARTINATOR_CI_SERIE} nr.{APARTINATOR_CI_NUMAR}' },
  { find: 'CI seria DP', replace: 'CI seria {APARTINATOR_CI_SERIE}' },
  
  // Adresă apartinător
  { find: 'Mun. București ,  Sector 6, Str. Ileana Cosânzeana, nr.1, bl.S31, sc.1, ap.3', replace: '{APARTINATOR_ADRESA}' },
  { find: 'Mun. București, Sector 6, Str. Ileana Cosânzeana, nr.1, bl.S31, sc.1, ap.3', replace: '{APARTINATOR_ADRESA}' },
  { find: 'Mun. București , Sector 6, Str. Ileana Cosânzeana, nr.1, bl.S31, sc.1, ap.3', replace: '{APARTINATOR_ADRESA}' },
  { find: 'Str. Ileana Cosânzeana, nr.1, bl.S31, sc.1, ap.3', replace: '{APARTINATOR_ADRESA}' },
  { find: 'Ileana Cosânzeana, nr.1, bl.S31, sc.1, ap.3', replace: '{APARTINATOR_ADRESA}' },
  
  // Data eliberării CI apartinător
  { find: '11.02.2020', replace: '{APARTINATOR_CI_DATA}' },
  
  // Eliberat de apartinător
  { find: 'DEPABD', replace: '{APARTINATOR_CI_ELIBERAT_DE}' },
  
  // === NUMERE DOCUMENTE ===
  // Numere care apar în documente - format: nr. XXX / data
  { find: 'Nr .  916', replace: 'Nr. {NUMAR_CONTRACT}' },
  { find: 'Nr. 916', replace: 'Nr. {NUMAR_CONTRACT}' },
  { find: 'nr.  916', replace: 'nr. {NUMAR_CONTRACT}' },
  { find: 'nr. 916', replace: 'nr. {NUMAR_CONTRACT}' },
  { find: 'Nr . 916', replace: 'Nr. {NUMAR_CONTRACT}' },
  { find: 'NR.  916', replace: 'NR. {NUMAR_CONTRACT}' },
  { find: 'NR. 916', replace: 'NR. {NUMAR_CONTRACT}' },
  { find: 'Contractul  nr .  916', replace: 'Contractul nr. {NUMAR_CONTRACT}' },
  { find: 'Contractul nr. 916', replace: 'Contractul nr. {NUMAR_CONTRACT}' },
  { find: 'Contractul  Nr .  916', replace: 'Contractul Nr. {NUMAR_CONTRACT}' },
  { find: 'Contractul Nr. 916', replace: 'Contractul Nr. {NUMAR_CONTRACT}' },
  { find: 'CONTRACTUL   Nr. 916', replace: 'CONTRACTUL Nr. {NUMAR_CONTRACT}' },
  { find: 'CONTRACTUL  Nr .  916', replace: 'CONTRACTUL Nr. {NUMAR_CONTRACT}' },
  
  // Număr cerere admitere
  { find: 'nr.  913', replace: 'nr. {NUMAR_CERERE}' },
  { find: 'nr. 913', replace: 'nr. {NUMAR_CERERE}' },
  { find: 'Nr.  913', replace: 'Nr. {NUMAR_CERERE}' },
  { find: 'Nr. 913', replace: 'Nr. {NUMAR_CERERE}' },
  
  // Număr decizie
  { find: 'N r.   915', replace: 'Nr. {NUMAR_DECIZIE}' },
  { find: 'Nr.  915', replace: 'Nr. {NUMAR_DECIZIE}' },
  { find: 'Nr. 915', replace: 'Nr. {NUMAR_DECIZIE}' },
  { find: 'nr.  915', replace: 'nr. {NUMAR_DECIZIE}' },
  { find: 'nr. 915', replace: 'nr. {NUMAR_DECIZIE}' },
  
  // Număr GDPR
  { find: 'N r.  914', replace: 'Nr. {NUMAR_GDPR}' },
  { find: 'Nr.  914', replace: 'Nr. {NUMAR_GDPR}' },
  { find: 'Nr. 914', replace: 'Nr. {NUMAR_GDPR}' },
  
  // Număr plan
  { find: 'nr.   920', replace: 'nr. {NUMAR_PLAN_INTERVENTIE}' },
  { find: 'nr.  920', replace: 'nr. {NUMAR_PLAN_INTERVENTIE}' },
  { find: 'nr. 920', replace: 'nr. {NUMAR_PLAN_INTERVENTIE}' },
  { find: 'Nr.  920', replace: 'Nr. {NUMAR_PLAN_INTERVENTIE}' },
  { find: 'Nr. 920', replace: 'Nr. {NUMAR_PLAN_INTERVENTIE}' },
  
  { find: 'nr.   921', replace: 'nr. {NUMAR_PLAN_SERVICII}' },
  { find: 'nr.  921', replace: 'nr. {NUMAR_PLAN_SERVICII}' },
  { find: 'nr. 921', replace: 'nr. {NUMAR_PLAN_SERVICII}' },
  { find: 'Nr.  921', replace: 'Nr. {NUMAR_PLAN_SERVICII}' },
  { find: 'Nr. 921', replace: 'Nr. {NUMAR_PLAN_SERVICII}' },
  
  // Număr bunuri
  { find: '922', replace: '{NUMAR_BUNURI}' },
  
  // Număr ROF
  { find: '923', replace: '{NUMAR_ROF}' },
  
  // Număr PV
  { find: '924', replace: '{NUMAR_PV}' },
  
  // Număr primărie
  { find: '925', replace: '{NUMAR_PRIMARIE}' },
  
  // === DATA CONTRACT ===
  // Data apare în mai multe formate din cauza fragmentării în XML
  { find: '30 .0 7 .202 6', replace: '{DATA_CONTRACT}' },
  { find: '30 .07 .202 6', replace: '{DATA_CONTRACT}' },
  { find: '30.0 7.202 6', replace: '{DATA_CONTRACT}' },
  { find: '30.07.202 6', replace: '{DATA_CONTRACT}' },
  { find: '30 .0 7.2026', replace: '{DATA_CONTRACT}' },
  { find: '30.07.2026', replace: '{DATA_CONTRACT}' },
  { find: '30 . 07 .202 6', replace: '{DATA_CONTRACT}' },
  { find: '30 . 07 . 202 6', replace: '{DATA_CONTRACT}' },
  { find: '30 .03 .202 6', replace: '{DATA_CONTRACT}' },
  { find: '30. 07 .03 .20 26', replace: '{DATA_CONTRACT}' },
  { find: '30 . 07 .03 .20 26', replace: '{DATA_CONTRACT}' },
  { find: '26.11.2025', replace: '{DATA_ANEXA9}' }, // Data specifică anexei 9
  
  // === COST SERVICIU ===
  { find: '5000', replace: '{COST_SERVICIU}' },
  
  // === CONTRIBUȚIE BENEFICIAR ===
  // Apare ca "0" în context specific - atenție să nu înlocuim alte "0"
  // Nu putem înlocui simplu "0" - prea periculos. Lăsăm așa sau facem manual.
  
  // === RELAȚIE APARTINĂTOR ===
  // Apare ca "plătitor" în contract - va fi înlocuit manual dacă e necesar
];

/**
 * Curăță un fișier DOCX: înlocuiește datele personale cu placeholder-uri
 */
function cleanDocx(inputPath, outputPath) {
  const data = fs.readFileSync(inputPath);
  const zip = new PizZip(data);
  
  // Citim document.xml
  let xml = zip.file('word/document.xml').asText();
  
  let replacementsMade = 0;
  const replacementsLog = [];
  
  // Aplicăm toate înlocuirile
  for (const { find, replace } of REPLACEMENTS) {
    // Căutăm în textul extras (fără tag-uri XML)
    // Dar înlocuim în XML-ul complet
    
    // Metoda 1: Căutare directă în XML (funcționează dacă textul nu e fragmentat)
    if (xml.includes(find)) {
      const count = (xml.match(new RegExp(escapeRegex(find), 'g')) || []).length;
      xml = xml.split(find).join(replace);
      replacementsMade += count;
      replacementsLog.push(`  ✓ "${find.substring(0, 40)}..." → "${replace}" (${count}x)`);
    } else {
      // Metoda 2: Căutare în text concatenat și reconstrucție
      // Extragem toate tag-urile <w:t>
      const wTPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let match;
      const tElements = [];
      while ((match = wTPattern.exec(xml)) !== null) {
        tElements.push({
          fullTag: match[0],
          text: match[1],
          start: match.index,
          end: match.index + match[0].length
        });
      }
      
      // Concatenăm tot textul
      const fullText = tElements.map(t => t.text).join('');
      
      if (fullText.includes(find)) {
        // Găsim poziția în textul concatenat
        const pos = fullText.indexOf(find);
        
        // Mapăm poziția înapoi la elementele <w:t>
        let currentPos = 0;
        let startPos = -1;
        let endPos = -1;
        
        for (let i = 0; i < tElements.length; i++) {
          const elemStart = currentPos;
          const elemEnd = currentPos + tElements[i].text.length;
          
          if (startPos === -1 && elemEnd > pos) {
            startPos = i;
          }
          
          if (elemEnd >= pos + find.length) {
            endPos = i;
            break;
          }
          
          currentPos = elemEnd;
        }
        
        if (startPos >= 0 && endPos >= 0) {
          // Reconstruim textul în elementele afectate
          // Primul element: păstrăm textul de dinainte + placeholder
          const beforeText = fullText.substring(
            tElements.slice(0, startPos).reduce((sum, t) => sum + t.text.length, 0),
            pos
          );
          
          const afterText = fullText.substring(
            pos + find.length,
            tElements.slice(0, endPos + 1).reduce((sum, t) => sum + t.text.length, 0)
          );
          
          // Înlocuim primul element
          const firstTag = tElements[startPos].fullTag;
          const newFirstText = beforeText + replace + afterText;
          const newFirstTag = firstTag.replace(
            /<w:t([^>]*)>([^<]*)<\/w:t>/,
            `<w:t$1>${escapeXml(newFirstText)}</w:t>`
          );
          xml = xml.replace(firstTag, newFirstTag);
          
          // Golim elementele intermediare și ultimul
          for (let i = startPos + 1; i <= endPos; i++) {
            const emptyTag = tElements[i].fullTag.replace(
              /<w:t([^>]*)>([^<]*)<\/w:t>/,
              `<w:t$1></w:t>`
            );
            xml = xml.replace(tElements[i].fullTag, emptyTag);
          }
          
          replacementsMade++;
          replacementsLog.push(`  ✓ (fragmented) "${find.substring(0, 40)}..." → "${replace}" (1x)`);
        }
      }
    }
  }
  
  // Salvăm XML-ul modificat înapoi în ZIP
  zip.file('word/document.xml', xml);
  
  // Generăm noul DOCX
  const output = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, output);
  
  return { replacementsMade, replacementsLog };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// === MAIN ===
console.log('🧹 Curățare template-uri DOCX...\n');

// Creăm directorul de output
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.docx'));

let totalReplacements = 0;

for (const file of files) {
  const inputPath = path.join(TEMPLATES_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, file);
  
  console.log(`📄 Procesare: ${file}`);
  
  try {
    const result = cleanDocx(inputPath, outputPath);
    totalReplacements += result.replacementsMade;
    
    if (result.replacementsLog.length > 0) {
      result.replacementsLog.forEach(line => console.log(line));
    } else {
      console.log('  ⚠️ Nicio înlocuire făcută - verifică manual');
    }
    
    console.log(`  Total înlocuiri: ${result.replacementsMade}\n`);
  } catch (error) {
    console.error(`  ❌ Eroare: ${error.message}\n`);
  }
}

console.log(`\n✅ Gata! Total înlocuiri: ${totalReplacements}`);
console.log(`📁 Template-uri curate salvate în: ${OUTPUT_DIR}`);
