import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

// Template-urile per locație — fallback la folderul root pentru compatibilitate
const VALID_CAMIN_IDS = ['cetinei', 'clinceni', 'orhideelor'];

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
    const { residentData, caminId } = body as { residentData: ResidentData; caminId?: string };

    if (!residentData) {
      return NextResponse.json({ error: 'Lipsesc datele rezidentului' }, { status: 400 });
    }

    // Determinăm folderul de template-uri în funcție de caminId
    let templatesDir: string;
    if (caminId && VALID_CAMIN_IDS.includes(caminId)) {
      templatesDir = path.join(process.cwd(), 'public', 'templates-clean', caminId);
    } else {
      // Fallback: folderul root (template-urile vechi)
      templatesDir = path.join(process.cwd(), 'public', 'templates-clean');
    }

    // Citim toate fișierele .docx din folderul respectiv
    const templateFiles = fs.existsSync(templatesDir)
      ? fs.readdirSync(templatesDir).filter(f => f.endsWith('.docx'))
      : [];

    const documents: { name: string; filename: string; base64: string }[] = [];
    const errors: string[] = [];

    for (const templateFile of templateFiles) {
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
