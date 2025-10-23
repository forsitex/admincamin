/**
 * API Route: Completare PDF cu Date Rezident
 * 
 * Primește:
 * - PDF template (Base64)
 * - Mapping câmpuri + coordonate
 * - Date rezident
 * 
 * Returnează:
 * - PDF completat (Base64)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface FillPdfRequest {
  pdfBase64: string;
  fields: Array<{
    name: string;
    label: string;
    coordinates: {
      x: number;
      y: number;
      page: number;
    } | null;
  }>;
  residentData: {
    beneficiarNumeComplet: string;
    beneficiarCnp: string;
    beneficiarAdresa: string;
    beneficiarTelefon?: string;
    beneficiarEmail?: string;
    beneficiarDataNasterii: string;
    apartinatorNumeComplet: string;
    apartinatorTelefon: string;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Începe completarea PDF...');
    
    // 1. Parse request
    const body: FillPdfRequest = await request.json();
    const { pdfBase64, fields, residentData } = body;

    if (!pdfBase64 || !fields || !residentData) {
      return NextResponse.json(
        { error: 'Date incomplete' },
        { status: 400 }
      );
    }

    // 2. Încarcă PDF-ul
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // 3. Încarcă font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // 4. Mapping câmpuri → date rezident
    const fieldMapping: Record<string, string> = {
      'nume_complet': residentData.beneficiarNumeComplet,
      'nume': residentData.beneficiarNumeComplet,
      'cnp': residentData.beneficiarCnp,
      'adresa': residentData.beneficiarAdresa,
      'domiciliu': residentData.beneficiarAdresa,
      'telefon': residentData.beneficiarTelefon || '',
      'email': residentData.beneficiarEmail || '',
      'data_nasterii': residentData.beneficiarDataNasterii,
      'apartinator': residentData.apartinatorNumeComplet,
      'apartinator_telefon': residentData.apartinatorTelefon,
    };

    console.log(`📋 Completare ${fields.length} câmpuri...`);

    // 5. Completăm fiecare câmp
    let completedFields = 0;
    
    for (const field of fields) {
      if (!field.coordinates) {
        console.log(`⚠️ Câmp fără coordonate: ${field.name}`);
        continue;
      }

      // Găsim valoarea pentru acest câmp
      const value = fieldMapping[field.name] || 
                    residentData[field.name] || 
                    '';

      if (!value) {
        console.log(`⚠️ Lipsă valoare pentru: ${field.name}`);
        continue;
      }

      try {
        // Obținem pagina
        const pageIndex = (field.coordinates.page || 1) - 1;
        const page = pdfDoc.getPages()[pageIndex];
        
        if (!page) {
          console.log(`⚠️ Pagina ${field.coordinates.page} nu există`);
          continue;
        }

        const { height } = page.getSize();
        
        // PDF coordonatele sunt de jos în sus, OCR de sus în jos
        // Trebuie să convertim
        const yPosition = height - field.coordinates.y - 20;

        // Scriem textul
        page.drawText(value.toString(), {
          x: field.coordinates.x,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });

        completedFields++;
        console.log(`✅ Completat: ${field.name} = ${value}`);
        
      } catch (fieldError) {
        console.error(`❌ Eroare la câmpul ${field.name}:`, fieldError);
      }
    }

    console.log(`✅ Completate ${completedFields}/${fields.length} câmpuri`);

    // 6. Salvăm PDF-ul completat
    const pdfBytes = await pdfDoc.save();
    const pdfBase64Result = Buffer.from(pdfBytes).toString('base64');

    // 7. Returnăm rezultatul
    return NextResponse.json({
      success: true,
      data: {
        pdfBase64: pdfBase64Result,
        completedFields,
        totalFields: fields.length
      }
    });

  } catch (error: any) {
    console.error('❌ Eroare în fill-pdf:', error);
    return NextResponse.json(
      { 
        error: 'Eroare la completarea PDF',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
