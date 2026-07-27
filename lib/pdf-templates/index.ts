/**
 * Generator complet pentru toate cele 16 documente PDF
 * Replicare IDENTICĂ a documentelor din "model contracte"
 */

import jsPDF from 'jspdf';
import { Resident } from '@/types/resident';
import { COMPANIES, CAMINE, CONTACT_PHONE, getCompanyForCamin } from '../constants';

export interface PDFDocument {
  name: string;
  filename: string;
  blob: Blob;
}

export class DocumentGenerator {
  private resident: Resident;
  private company: any;
  private camin: any;
  private contractDate: string;

  constructor(resident: Resident) {
    this.resident = resident;
    this.company = COMPANIES.find(c => c.cui === resident.companyCui);
    this.camin = CAMINE.find(c => c.id === resident.caminId);
    this.contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');
  }

  // Helper: Creează antet standard cu logo
  private createHeader(doc: jsPDF, title: string, y: number = 20): number {
    // TODO: Adaugă logo Empathy (va fi implementat cu imagine)
    doc.setFontSize(10);
    doc.text(this.company?.name || '', 20, y);
    y += 5;
    doc.text(this.camin?.name || '', 20, y);
    y += 5;
    doc.text(`Telefon: ${CONTACT_PHONE}`, 20, y);
    y += 15;

    // Titlu
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const pageWidth = doc.internal.pageSize.width;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    return y;
  }

  // Helper: Footer standard
  private addFooter(doc: jsPDF, pageNum: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(`Pagina nr. ${pageNum}`, 20, pageHeight - 15);
    doc.text(
      'Document generat prin aplicatia de gestiune inteligenta pentru servicii sociale www.iCamin.ro',
      20,
      pageHeight - 10
    );
  }

  // DOCUMENT 1: Contract Principal
  async generateContractPrincipal(): Promise<Blob> {
    const doc = new jsPDF();
    let y = this.createHeader(doc, 'CONTRACT DE SERVICII SOCIALE');

    // Subtitlu
    doc.setFontSize(10);
    const subtitle = 'încheiat între furnizorul de servicii sociale si beneficiar sau, dupa caz, reprezentantul legal al acestuia';
    doc.text(subtitle, 20, y, { maxWidth: 170 });
    y += 10;

    // Număr contract
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.resident.numarDosar} NR. ${this.resident.numarContract} / ${this.contractDate}`, 20, y);
    y += 10;
    doc.setFont('helvetica', 'normal');

    // Conținut contract (va fi completat cu tot textul)
    // ... (continuare cu toate secțiunile)

    this.addFooter(doc, 1);
    return doc.output('blob');
  }

  // DOCUMENT 2: Cerere de Admitere
  async generateCerereAdmitere(): Promise<Blob> {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(10);
    doc.text(this.company?.name || '', 20, y);
    y += 5;
    doc.text(`Telefon: ${CONTACT_PHONE}`, 20, y);
    y += 10;

    doc.text(`Nr. ${this.resident.numarContract}/${this.contractDate}`, 20, y);
    y += 15;

    // Titlu
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const pageWidth = doc.internal.pageSize.width;
    doc.text('CERERE DE ADMITERE', (pageWidth - doc.getTextWidth('CERERE DE ADMITERE')) / 2, y);
    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const cerereText = `Subsemnatul ${this.resident.beneficiarNumeComplet}, si ${this.resident.apartinatorNumeComplet}, în calitate de ${this.resident.apartinatorRelatie} al beneficiarului, solicit acordarea de servicii sociale în baza încheierii unui contract, în ${this.camin?.name}.`;
    
    doc.text(cerereText, 20, y, { maxWidth: 170 });
    y += 20;

    const motivText = 'Mentionez ca motivul internarii este: lipsa adaptarii în cadrul acordarii serviciilor de îngrijire la domiciliu / imposibilitatea familiei (reprezentantilor legali) de a putea acorda îngrijirea necesara si raspunsul adecvat la nevoilor existente.';
    
    doc.text(motivText, 20, y, { maxWidth: 170 });
    y += 30;

    doc.text(`Data: ${this.contractDate}`, 20, y);
    y += 15;
    doc.text('Semnatura:', 20, y);

    this.addFooter(doc, 1);
    return doc.output('blob');
  }

  // DOCUMENT 3: Fișa de Intrare
  async generateFisaIntrare(): Promise<Blob> {
    const doc = new jsPDF();
    let y = this.createHeader(doc, 'FISA DE INTRARE');

    doc.text(`NR.${this.resident.numarContract}/${this.contractDate}`, 20, y);
    y += 10;

    // Date beneficiar
    doc.text(`Nume: ${this.resident.beneficiarNumeComplet.split(' ')[0]}`, 20, y);
    y += 5;
    doc.text(`Prenume: ${this.resident.beneficiarNumeComplet.split(' ').slice(1).join(' ')}`, 20, y);
    y += 5;
    doc.text(`Data nasterii: ${this.resident.beneficiarDataNasterii}`, 20, y);
    y += 5;
    doc.text(`CNP: ${this.resident.beneficiarCnp}`, 20, y);
    y += 5;
    doc.text(`Adresa: ${this.resident.beneficiarAdresa}`, 20, y, { maxWidth: 170 });
    y += 15;

    // Date medicale
    if (this.resident.provenienta) {
      doc.text(`De unde provine: ${this.resident.provenienta}`, 20, y);
      y += 5;
    }
    
    // ... continuare cu toate câmpurile

    this.addFooter(doc, 1);
    return doc.output('blob');
  }

  // Metodă principală: Generează TOATE cele 16 documente
  async generateAllDocuments(): Promise<PDFDocument[]> {
    const documents: PDFDocument[] = [];

    try {
      // 1. Contract Principal
      documents.push({
        name: 'Contract model-cadru Ordin 1126-2025',
        filename: `Contract_${this.resident.beneficiarCnp}_${this.resident.numarDosar}.pdf`,
        blob: await this.generateContractPrincipal()
      });

      // 2. Cerere de Admitere
      documents.push({
        name: 'Cerere de admitere',
        filename: `Cerere_admitere_${this.resident.beneficiarCnp}.pdf`,
        blob: await this.generateCerereAdmitere()
      });

      // 3. Fișa de Intrare
      documents.push({
        name: 'Fișa de intrare',
        filename: `Fisa_intrare_${this.resident.beneficiarCnp}.pdf`,
        blob: await this.generateFisaIntrare()
      });

      // TODO: Adaugă restul celor 13 documente
      // 4. Acord de internare
      // 5. Acord închidere centru
      // 6. Adresă primărie
      // 7. Declarație urgență
      // 8. PV card sănătate
      // 9-16. Anexele 1-8

    } catch (error) {
      console.error('Error generating documents:', error);
      throw error;
    }

    return documents;
  }
}

// Export funcție helper
export async function generateAllPDFsForResident(resident: Resident): Promise<PDFDocument[]> {
  const generator = new DocumentGenerator(resident);
  return await generator.generateAllDocuments();
}
