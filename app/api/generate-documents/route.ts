import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

// Lista tuturor template-urilor DOCX curate
const TEMPLATES = [
  'CONTRACT NOU.docx',
  '1. Cerere de admitere.docx',
  '2. Decizie de admitere.docx',
  '4. Anexa 1.docx',
  '5. Anexa 2 - angajament de plata.docx',
  '6. Anexa 3 - Acord privind prelucrarea datelor cu caracter personal.docx',
  '7. Anexa 4 - Acord utilizare imagine.docx',
  '8. Anexa 5 - Acord schimbare schema de tratament.docx',
  '9. Anexa 6 - Declarație de neasumare.docx',
  '10. Anexa 7 - Acord in cazul schimbarii starii de sanatate.docx',
  '11. Anexa 8 - Acord de închidere centru.docx',
  '11. Anexa 9 - Suspendarea contractului.docx',
  '13. PV predare-primire.docx',
  'ACORD GDPR.docx',
  'Adresă PRIMARIE- INTERNARE.docx',
  'DECLARAȚIE BUNURI DE VALOARE CLINCENI.docx',
  'DECLARAȚIE LUARE LA CUNOȘTINȚĂ ROF CLINCENI.docx',
];

interface ResidentData {
  // Beneficiar
  BENEFICIAR_NUME: string;
  BENEFICIAR_CNP: string;
  BENEFICIAR_ADRESA: string;
  BENEFICIAR_CI_SERIE: string;
  BENEFICIAR_CI_NUMAR: string;
  BENEFICIAR_CI_DATA: string;
  BENEFICIAR_CI_ELIBERAT_DE: string;
  BENEFICIAR_DATA_NASTERII: string;
  BENEFICIAR_LOC_NASTERII: string;
  BENEFICIAR_CI_VALABIL_PANA: string;

  // Apartinator
  APARTINATOR_NUME: string;
  APARTINATOR_CNP: string;
  APARTINATOR_ADRESA: string;
  APARTINATOR_CI_SERIE: string;
  APARTINATOR_CI_NUMAR: string;
  APARTINATOR_CI_DATA: string;
  APARTINATOR_CI_ELIBERAT_DE: string;
  APARTINATOR_CI_VALABIL_PANA: string;
  APARTINATOR_RELATIE: string;
  APARTINATOR_TELEFON: string;

  // Contract
  NUMAR_CONTRACT: string;
  DATA_CONTRACT: string;
  COST_SERVICIU: string;
  NUMAR_CERERE: string;
  NUMAR_DECIZIE: string;
  NUMAR_GDPR: string;
  NUMAR_PLAN_INTERVENTIE: string;
  NUMAR_PLAN_SERVICII: string;
  NUMAR_BUNURI: string;
  NUMAR_ROF: string;
  NUMAR_PV: string;
  NUMAR_PRIMARIE: string;
  DATA_ANEXA9: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { residentData } = body as { residentData: ResidentData };

    if (!residentData) {
      return NextResponse.json({ error: 'Lipsesc datele rezidentului' }, { status: 400 });
    }

    const templatesDir = path.join(process.cwd(), 'public', 'templates-clean');
    const documents: { name: string; filename: string; base64: string }[] = [];
    const errors: string[] = [];

    for (const templateFile of TEMPLATES) {
      try {
        const templatePath = path.join(templatesDir, templateFile);

        if (!fs.existsSync(templatePath)) {
          errors.push(`Template lipsă: ${templateFile}`);
          continue;
        }

        const content = fs.readFileSync(templatePath);
        const zip = new PizZip(content);

        const docx = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          delimiters: { start: '{', end: '}' },
        });

        docx.render(residentData);

        const buf = docx.getZip().generate({ type: 'base64' });

        // Nume fișier curat (fără numere și extensie)
        const cleanName = templateFile
          .replace(/^\d+\.\s*/, '')
          .replace(/\.docx$/, '');

        documents.push({
          name: cleanName,
          filename: templateFile,
          base64: buf,
        });
      } catch (err: any) {
        errors.push(`${templateFile}: ${err.message}`);
      }
    }

    return NextResponse.json({
      documents,
      errors,
      total: documents.length,
    });
  } catch (error: any) {
    console.error('Eroare generate-documents:', error);
    return NextResponse.json({
      error: error.message || 'Eroare la generarea documentelor',
    }, { status: 500 });
  }
}
