import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API process-docx-template apelat');

    // 1. Primim fișierul și datele
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const residentDataStr = formData.get('residentData') as string;

    if (!file || !residentDataStr) {
      return NextResponse.json({ error: 'Lipsesc date' }, { status: 400 });
    }

    const residentData = JSON.parse(residentDataStr);
    console.log('📄 Fișier primit:', file.name);
    console.log('👤 Rezident:', residentData.beneficiarNumeComplet);

    // 2. Citim fișierul DOCX
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    // 3. Creăm docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 4. Pregătim datele pentru template
    // Extragem strada și numărul din adresă
    const beneficiarStrada = residentData.beneficiarAdresa?.split(' ')[0] || '';
    const beneficiarNumar = residentData.beneficiarAdresa?.match(/nr\.?\s*(\d+)/i)?.[1] || '';
    
    const apartinatorStrada = residentData.apartinatorAdresa?.split(' ')[0] || '';
    const apartinatorNumar = residentData.apartinatorAdresa?.match(/nr\.?\s*(\d+)/i)?.[1] || '';

    const templateData = {
      // BENEFICIAR
      beneficiarNumeComplet: (residentData.beneficiarNumeComplet || '').toUpperCase(),
      beneficiarCnp: residentData.beneficiarCnp || '',
      beneficiarDataNasterii: residentData.beneficiarDataNasterii || '',
      beneficiarAdresa: residentData.beneficiarAdresa || '',
      beneficiarStrada: beneficiarStrada,
      beneficiarNumar: beneficiarNumar,
      beneficiarCodPostal: residentData.beneficiarCodPostal || '',
      beneficiarTelefon: residentData.beneficiarTelefon || '',
      beneficiarCiSerie: residentData.beneficiarCiSerie || '',
      beneficiarCiNumar: residentData.beneficiarCiNumar || '',
      beneficiarCiEliberatData: residentData.beneficiarCiEliberatData || '',
      beneficiarCiEliberatDe: residentData.beneficiarCiEliberatDe || '',
      beneficiarCiValabilPana: residentData.beneficiarCiValabilPana || '',
      
      // APARȚINĂTOR
      apartinatorNumeComplet: (residentData.apartinatorNumeComplet || '').toUpperCase(),
      apartinatorCnp: residentData.apartinatorCnp || '',
      apartinatorRelatie: residentData.apartinatorRelatie || '',
      apartinatorTelefon: residentData.apartinatorTelefon || '',
      apartinatorEmail: residentData.apartinatorEmail || '',
      apartinatorAdresa: residentData.apartinatorAdresa || '',
      apartinatorStrada: apartinatorStrada,
      apartinatorNumar: apartinatorNumar,
      apartinatorCiSerie: residentData.apartinatorCiSerie || '',
      apartinatorCiNumar: residentData.apartinatorCiNumar || '',
      apartinatorCiEliberatData: residentData.apartinatorCiEliberatData || '',
      apartinatorCiEliberatDe: residentData.apartinatorCiEliberatDe || '',
      apartinatorCiValabilPana: residentData.apartinatorCiValabilPana || '',
      
      // CONTRACT
      costServiciu: residentData.costServiciu || '',
      contributieBeneficiar: residentData.contributieBeneficiar || '0',
      dataInceputContract: residentData.dataInceputContract || '',
      dataSfarsitContract: residentData.dataSfarsitContract || 'Nedeterminată',
      numarDosar: residentData.numarDosar || '',
      numarContract: residentData.numarContract || '',
      
      // MEDICAL
      provenienta: residentData.provenienta || '',
      diagnostic: residentData.diagnostic || '',
      alergii: residentData.alergii || '',
      alimentatie: residentData.alimentatie || '',
      incontinenta: residentData.incontinenta || '',
      mobilitate: residentData.mobilitate || '',
      greutate: residentData.greutate || '',
      comportament: residentData.comportament || '',
      
      // MEDIC FAMILIE
      medicFamilieNume: residentData.medicFamilieNume || '',
      medicFamilieTelefon: residentData.medicFamilieTelefon || '',
      medicFamilieEmail: residentData.medicFamilieEmail || '',
      
      // EXTRA
      judet: 'Sector 3', // Poate fi extras din adresă
      cont: 'RO49 AAAA 1B31 0075 9384 0000', // Poate fi din baza de date
    };

    console.log('📋 Template data pregătită cu', Object.keys(templateData).length, 'variabile');

    // 5. Înlocuim placeholders
    doc.render(templateData);

    // 6. Generăm DOCX-ul final
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    console.log('✅ DOCX generat cu succes!');

    // 7. Returnăm
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${file.name.replace('.docx', '')}_completat.docx"`,
      },
    });

  } catch (error: any) {
    console.error('❌ Eroare:', error);
    return NextResponse.json(
      { error: error.message || 'Eroare la procesare' },
      { status: 500 }
    );
  }
}
