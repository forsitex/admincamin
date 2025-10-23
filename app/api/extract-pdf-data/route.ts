/**
 * API Route: Extragere Text + Coordonate din PDF
 * Folosește pdfjs-dist pentru a extrage text cu poziții exacte
 */

import { NextRequest, NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configurare pdfjs-dist worker pentru Node.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📄 Începe extragerea datelor din PDF...');
    
    // 1. Parse request
    const body = await request.json();
    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: 'PDF lipsește' }, { status: 400 });
    }

    // 2. Convertim Base64 → Uint8Array
    const pdfData = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    // 3. Încărcăm PDF-ul cu pdfjs-dist
    console.log('📖 Încărcare PDF cu pdfjs-dist...');
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    console.log(`📊 PDF încărcat: ${pdf.numPages} pagini`);

    // 4. Extragem text + coordonate din fiecare pagină
    const allTextItems: TextItem[] = [];
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      // Procesăm fiecare item de text
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          const transform = item.transform;
          const x = transform[4];
          const y = viewport.height - transform[5]; // Convertim Y (PDF e de jos în sus)

          allTextItems.push({
            text: item.str,
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(item.width),
            height: Math.round(item.height),
            page: pageNum
          });

          fullText += item.str + ' ';
        }
      });

      fullText += '\n';
    }

    console.log(`✅ Extras: ${allTextItems.length} elemente text`);
    console.log(`📝 Text total: ${fullText.length} caractere`);

    // 5. Identificăm label-urile (cuvinte care par a fi etichete de câmpuri)
    const labels = allTextItems.filter(item => {
      const text = item.text.toLowerCase();
      return (
        text.includes('nume') ||
        text.includes('cnp') ||
        text.includes('adres') ||
        text.includes('telefon') ||
        text.includes('email') ||
        text.includes('data') ||
        text.includes('domiciliu') ||
        text.includes('cod') ||
        text.includes('seria') ||
        text.includes('subsemnat') ||
        text.includes('beneficiar') ||
        text.includes('apartinator') ||
        text.endsWith(':')
      );
    });

    console.log(`🏷️ Label-uri detectate: ${labels.length}`);

    // 6. Returnăm rezultatul
    return NextResponse.json({
      success: true,
      data: {
        totalPages: pdf.numPages,
        fullText: fullText.substring(0, 5000), // Limităm pentru LLM
        textItems: allTextItems,
        labels: labels,
        stats: {
          totalTextItems: allTextItems.length,
          totalLabels: labels.length,
          textLength: fullText.length
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Eroare în extract-pdf-data:', error);
    return NextResponse.json(
      { 
        error: 'Eroare la extragerea datelor din PDF',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
