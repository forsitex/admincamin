/**
 * Curăță template-urile DOCX per locație (cetinei, clinceni, orhideelor)
 * Înlocuiește datele personale cu placeholder-uri {NUME_VARIABILA}
 * Păstrează datele firmei (MOBIVIRO SRL, adrese, CUI, conturi) intacte
 */

const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'public', 'templates-clean');

// Datele personale per locație
const PERSONAL_DATA = {
  cetinei: {
    beneficiar: {
      nume: ['BUCUR MARIA'],
      cnp: '2590621293160',
      ci_serie: 'PX',
      ci_numar: '580201',
      ci_data: '02.07.2018',
      ci_eliberat_de: 'SPCLEP Ploiești',
      adresa: 'Mun. Ploiești, Str. Merilor, nr.21, Județ Prahova',
    },
    apartinator: {
      nume: ['MIȚILĂ ȘTEFĂNIȚĂ'],
      cnp: '1850419297321',
      ci_serie: 'PX',
      ci_numar: '928460',
      ci_data: '08.02.2023',
      ci_eliberat_de: 'SPCLEP Ploiești',
      adresa: 'Mun. Ploiești, Str. Mândra, nr.10, bl.4, sc.B, et.1, ap.8, Jud. Prahova',
    },
    numere: {
      contract: '228',
      cerere: '226',
      decizie: '227',
      gdpr: '933',
      bunuri: '235',
      rof: '236',
      pv: '237',
      primarie: '238',
    },
    data_contract: '18.03.2026',
  },
  clinceni: {
    beneficiar: {
      nume: ['COMAN ANETA'],
      cnp: '2580104044440',
      ci_serie: 'ZC',
      ci_numar: '256717',
      ci_data: '22.05.2017',
      ci_eliberat_de: 'SPCLEP Onești',
      adresa: 'Jud. Bacău, Mun.Onești, Str. George Bacovia, nr.5, sc.A, ap. 1',
    },
    apartinator: {
      nume: ['COMAN NICOLETA'],
      cnp: '2770922044441',
      ci_serie: 'RK',
      ci_numar: '611070',
      ci_data: '21.09.2020',
      ci_eliberat_de: 'SPCEP Sector 4',
      adresa: 'Mun. București, Sec.4, Str. Ghimpați, nr.17, bl.3, sc.3, et.6, ap.89',
    },
    numere: {
      contract: '511',
      cerere: '508',
      decizie: '510',
      gdpr: '509',
      bunuri: '518',
      rof: '519',
      pv: '520',
      primarie: '521',
    },
    data_contract: '15.04.2026',
  },
  orhideelor: {
    beneficiar: {
      nume: ['DARIE MARIA'],
      cnp: '24911199400081',
      ci_serie: 'RK',
      ci_numar: '873591',
      ci_data: '02.02.2022',
      ci_eliberat_de: 'SPCEP Sector 5',
      adresa: 'Mun. București, Sector 5, Str. Cap. Petre Mișcă, nr.12, bl. M13, sc.3, et.1, ap.79',
    },
    apartinator: {
      nume: ['ION ATHENA-LILIARITA'],
      cnp: '240518420071',
      ci_serie: 'IF',
      ci_numar: '993471',
      ci_data: '22.01.2025',
      ci_eliberat_de: 'SPCLEP Chiajna',
      adresa: 'Jud. Ilfov, Sat. Dudu (Com. Chiajna), Str. Tiineretului, nr.77C, sc.3, et.2, ap.68',
    },
    numere: {
      contract: '796',
      cerere: '793',
      decizie: '795',
      gdpr: '794',
      bunuri: '802',
      rof: '803',
      pv: '804',
      primarie: '805',
    },
    data_contract: '12.07.2026',
  },
  fortunei: {
    beneficiar: {
      nume: ['FLOREA EUGENIA'],
      cnp: '2481225400874',
      ci_serie: 'RT',
      ci_numar: '796919',
      ci_data: '09.10.2012',
      ci_eliberat_de: 'SPCEP Sector 5',
      adresa: 'Mun. București, Sector 5, Drm. Dârvari, nr.20',
    },
    apartinator: {
      nume: ['FLOREA DOINA-MARIA', 'FLOREA DOINA - MARIA'],
      cnp: '2851006460160',
      ci_serie: 'RZ',
      ci_numar: '037720',
      ci_data: '22.09.2022',
      ci_eliberat_de: 'SPCEP Sector 5',
      adresa: 'Mun. București, Sector 5, Drm. Dârvari, nr.20',
    },
    numere: {
      contract: '263',
      cerere: '254',
      decizie: '262',
      gdpr: '261',
      bunuri: '264',
      rof: '266',
      pv: '265',
      primarie: '267',
    },
    data_contract: '07.06.2026',
  },
};

// Generează lista de înlocuiri pentru o locație
function getReplacements(data) {
  const r = [];

  // === BENEFICIAR ===
  for (const nume of data.beneficiar.nume) {
    r.push({ find: nume, replace: '{BENEFICIAR_NUME}' });
  }
  r.push({ find: data.beneficiar.cnp, replace: '{BENEFICIAR_CNP}' });
  r.push({ find: `${data.beneficiar.ci_serie} nr. ${data.beneficiar.ci_numar}`, replace: '{BENEFICIAR_CI_SERIE} nr. {BENEFICIAR_CI_NUMAR}' });
  r.push({ find: `${data.beneficiar.ci_serie} nr.${data.beneficiar.ci_numar}`, replace: '{BENEFICIAR_CI_SERIE} nr. {BENEFICIAR_CI_NUMAR}' });
  r.push({ find: `seria ${data.beneficiar.ci_serie} nr. ${data.beneficiar.ci_numar}`, replace: 'seria {BENEFICIAR_CI_SERIE} nr. {BENEFICIAR_CI_NUMAR}' });
  r.push({ find: `seria ${data.beneficiar.ci_serie} nr.${data.beneficiar.ci_numar}`, replace: 'seria {BENEFICIAR_CI_SERIE} nr. {BENEFICIAR_CI_NUMAR}' });
  r.push({ find: `CI seria ${data.beneficiar.ci_serie}`, replace: 'CI seria {BENEFICIAR_CI_SERIE}' });
  r.push({ find: `BI seria ${data.beneficiar.ci_serie}`, replace: 'BI seria {BENEFICIAR_CI_SERIE}' });
  r.push({ find: data.beneficiar.ci_data, replace: '{BENEFICIAR_CI_DATA}' });
  r.push({ find: data.beneficiar.ci_eliberat_de, replace: '{BENEFICIAR_CI_ELIBERAT_DE}' });
  // Adresa beneficiar - încercăm variante
  r.push({ find: data.beneficiar.adresa, replace: '{BENEFICIAR_ADRESA}' });

  // === APARTINATOR ===
  for (const nume of data.apartinator.nume) {
    r.push({ find: nume, replace: '{APARTINATOR_NUME}' });
  }
  r.push({ find: data.apartinator.cnp, replace: '{APARTINATOR_CNP}' });
  r.push({ find: `${data.apartinator.ci_serie} nr. ${data.apartinator.ci_numar}`, replace: '{APARTINATOR_CI_SERIE} nr. {APARTINATOR_CI_NUMAR}' });
  r.push({ find: `${data.apartinator.ci_serie} nr.${data.apartinator.ci_numar}`, replace: '{APARTINATOR_CI_SERIE} nr. {APARTINATOR_CI_NUMAR}' });
  r.push({ find: `seria ${data.apartinator.ci_serie} nr. ${data.apartinator.ci_numar}`, replace: 'seria {APARTINATOR_CI_SERIE} nr. {APARTINATOR_CI_NUMAR}' });
  r.push({ find: `seria ${data.apartinator.ci_serie} nr.${data.apartinator.ci_numar}`, replace: 'seria {APARTINATOR_CI_SERIE} nr. {APARTINATOR_CI_NUMAR}' });
  r.push({ find: `CI seria ${data.apartinator.ci_serie}`, replace: 'CI seria {APARTINATOR_CI_SERIE}' });
  r.push({ find: data.apartinator.ci_data, replace: '{APARTINATOR_CI_DATA}' });
  r.push({ find: data.apartinator.ci_eliberat_de, replace: '{APARTINATOR_CI_ELIBERAT_DE}' });
  r.push({ find: data.apartinator.adresa, replace: '{APARTINATOR_ADRESA}' });

  // === NUMERE DOCUMENTE ===
  const n = data.numere;
  // Contract - multiple formats
  for (const prefix of ['Nr.', 'nr.', 'NR.', 'Nr .', 'nr .', 'NR .']) {
    r.push({ find: `${prefix} ${n.contract}`, replace: `${prefix} {NUMAR_CONTRACT}` });
    r.push({ find: `${prefix}  ${n.contract}`, replace: `${prefix} {NUMAR_CONTRACT}` });
  }
  r.push({ find: `Contractul nr. ${n.contract}`, replace: 'Contractul nr. {NUMAR_CONTRACT}' });
  r.push({ find: `Contractul Nr. ${n.contract}`, replace: 'Contractul Nr. {NUMAR_CONTRACT}' });
  r.push({ find: `CONTRACTUL Nr. ${n.contract}`, replace: 'CONTRACTUL Nr. {NUMAR_CONTRACT}' });

  // Cerere
  for (const prefix of ['Nr.', 'nr.', 'Nr .', 'nr .']) {
    r.push({ find: `${prefix} ${n.cerere}`, replace: `${prefix} {NUMAR_CERERE}` });
  }
  // Decizie
  for (const prefix of ['Nr.', 'nr.', 'Nr .', 'nr .', 'N r.']) {
    r.push({ find: `${prefix} ${n.decizie}`, replace: `${prefix} {NUMAR_DECIZIE}` });
  }
  // GDPR
  for (const prefix of ['Nr.', 'nr.', 'Nr .', 'nr .', 'N r.']) {
    r.push({ find: `${prefix} ${n.gdpr}`, replace: `${prefix} {NUMAR_GDPR}` });
  }
  // Bunuri
  r.push({ find: n.bunuri, replace: '{NUMAR_BUNURI}' });
  // ROF
  r.push({ find: n.rof, replace: '{NUMAR_ROF}' });
  // PV
  r.push({ find: n.pv, replace: '{NUMAR_PV}' });
  // Primarie
  r.push({ find: n.primarie, replace: '{NUMAR_PRIMARIE}' });

  // === DATA CONTRACT ===
  r.push({ find: data.data_contract, replace: '{DATA_CONTRACT}' });

  // Sort by length descending (longer strings first to avoid partial matches)
  r.sort((a, b) => b.find.length - a.find.length);

  return r;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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
      log.push(`  ✓ "${find.substring(0, 50)}..." → "${replace}" (${count}x)`);
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
        let currentPos = 0;
        let startPos = -1;
        let endPos = -1;

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
            `<w:t$1>${escapeXml(newFirstText)}</w:t>`
          );
          xml = xml.replace(firstTag, newFirstTag);
          for (let i = startPos + 1; i <= endPos; i++) {
            const emptyTag = tElements[i].fullTag.replace(
              /<w:t([^>]*)>([^<]*)<\/w:t>/, `<w:t$1></w:t>`
            );
            xml = xml.replace(tElements[i].fullTag, emptyTag);
          }
          replacementsMade++;
          log.push(`  ✓ (frag) "${find.substring(0, 50)}..." → "${replace}" (1x)`);
        }
      }
    }
  }

  zip.file('word/document.xml', xml);
  const output = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, output);

  return { replacementsMade, log };
}

// === MAIN ===
const caminFolders = ['cetinei', 'clinceni', 'orhideelor', 'fortunei'];
let grandTotal = 0;

for (const folder of caminFolders) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧹 Curățare: ${folder.toUpperCase()}`);
  console.log('='.repeat(60));

  const dir = path.join(BASE_DIR, folder);
  const data = PERSONAL_DATA[folder];
  const replacements = getReplacements(data);

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx'));
  let folderTotal = 0;

  for (const file of files) {
    const inputPath = path.join(dir, file);
    console.log(`\n📄 ${file}`);

    try {
      const result = cleanDocx(inputPath, inputPath, replacements);
      folderTotal += result.replacementsMade;
      if (result.log.length > 0) {
        result.log.forEach(line => console.log(line));
      } else {
        console.log('  ⚠️ Nicio înlocuire');
      }
      console.log(`  Total: ${result.replacementsMade}`);
    } catch (error) {
      console.error(`  ❌ Eroare: ${error.message}`);
    }
  }

  console.log(`\n📊 Total ${folder}: ${folderTotal} înlocuiri`);
  grandTotal += folderTotal;
}

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ GATA! Total general: ${grandTotal} înlocuiri`);
