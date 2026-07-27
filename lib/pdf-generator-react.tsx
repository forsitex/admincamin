/**
 * Generator PDF folosind @react-pdf/renderer
 * Mult mai precis și profesional decât jsPDF
 */

import { pdf } from '@react-pdf/renderer';
import { Resident } from '@/types/resident';
import { COMPANIES, CAMINE } from './constants';
import { ContractPrincipal } from './pdf-templates/ContractPrincipal';
import { CerereAdmitere } from './pdf-templates/CerereAdmitere';
import { FisaIntrare } from './pdf-templates/FisaIntrare';
import { AcordInternare } from './pdf-templates/AcordInternare';
import { AcordInchidereCentru } from './pdf-templates/AcordInchidereCentru';
import { AdresaPrimarie } from './pdf-templates/AdresaPrimarie';
import { DeclaratieUrgenta } from './pdf-templates/DeclaratieUrgenta';
import { PVCardSanatate } from './pdf-templates/PVCardSanatate';
import { Anexa1 } from './pdf-templates/Anexa1';
import { Anexa2 } from './pdf-templates/Anexa2';
import { Anexa3 } from './pdf-templates/Anexa3';
import { Anexa4 } from './pdf-templates/Anexa4';
import { Anexa5 } from './pdf-templates/Anexa5';
import { Anexa6 } from './pdf-templates/Anexa6';
import { Anexa7 } from './pdf-templates/Anexa7';
import { Anexa8 } from './pdf-templates/Anexa8';

export interface PDFDocument {
  name: string;
  filename: string;
  blob: Blob;
}

export async function generateContractPrincipalPDF(resident: Resident): Promise<Blob> {
  const company = COMPANIES.find(c => c.cui === resident.companyCui);
  const camin = CAMINE.find(c => c.id === resident.caminId);

  // Generează PDF din componenta React
  const blob = await pdf(
    <ContractPrincipal 
      resident={resident} 
      company={company} 
      camin={camin} 
    />
  ).toBlob();

  return blob;
}

export async function generateAllPDFsReact(resident: Resident): Promise<PDFDocument[]> {
  const documents: PDFDocument[] = [];
  const company = COMPANIES.find(c => c.cui === resident.companyCui);
  const camin = CAMINE.find(c => c.id === resident.caminId);

  // 1. Contract Principal
  const contractBlob = await generateContractPrincipalPDF(resident);
  documents.push({
    name: 'Contract model-cadru Ordin 1126-2025',
    filename: `1_Contract_${resident.beneficiarCnp}.pdf`,
    blob: contractBlob
  });

  // 2. Cerere de admitere
  const cerereBlob = await pdf(<CerereAdmitere resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Cerere de admitere',
    filename: `2_Cerere_Admitere_${resident.beneficiarCnp}.pdf`,
    blob: cerereBlob
  });

  // 3. Fișa de intrare
  const fisaBlob = await pdf(<FisaIntrare resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Fișa de intrare',
    filename: `3_Fisa_Intrare_${resident.beneficiarCnp}.pdf`,
    blob: fisaBlob
  });

  // 4. Acord internare
  const acordInternareBlob = await pdf(<AcordInternare resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Acord de internare în centru',
    filename: `4_Acord_Internare_${resident.beneficiarCnp}.pdf`,
    blob: acordInternareBlob
  });

  // 5. Acord închidere centru
  const acordInchidereBlob = await pdf(<AcordInchidereCentru resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Acord în eventualitatea închiderii centrului',
    filename: `5_Acord_Inchidere_${resident.beneficiarCnp}.pdf`,
    blob: acordInchidereBlob
  });

  // 6. Adresă primărie
  const adresaBlob = await pdf(<AdresaPrimarie resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Adresă beneficiar către primăria de domiciliu',
    filename: `6_Adresa_Primarie_${resident.beneficiarCnp}.pdf`,
    blob: adresaBlob
  });

  // 7. Declarație urgență
  const declaratieBlob = await pdf(<DeclaratieUrgenta resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Declarație privind asumarea planului de urgență',
    filename: `7_Declaratie_Urgenta_${resident.beneficiarCnp}.pdf`,
    blob: declaratieBlob
  });

  // 8. PV card sănătate
  const pvBlob = await pdf(<PVCardSanatate resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'PV predare-primire card sănătate',
    filename: `8_PV_Card_Sanatate_${resident.beneficiarCnp}.pdf`,
    blob: pvBlob
  });

  // 9. Anexa 1
  const anexa1Blob = await pdf(<Anexa1 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 1',
    filename: `9_Anexa_1_${resident.beneficiarCnp}.pdf`,
    blob: anexa1Blob
  });

  // 10. Anexa 2 - Angajament plată
  const anexa2Blob = await pdf(<Anexa2 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 2 - Angajament de plată',
    filename: `10_Anexa_2_Angajament_${resident.beneficiarCnp}.pdf`,
    blob: anexa2Blob
  });

  // 11. Anexa 3 - GDPR
  const anexa3Blob = await pdf(<Anexa3 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 3 - Acord GDPR',
    filename: `11_Anexa_3_GDPR_${resident.beneficiarCnp}.pdf`,
    blob: anexa3Blob
  });

  // 12. Anexa 4 - Imagini/Video
  const anexa4Blob = await pdf(<Anexa4 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 4 - Acord imagini și video',
    filename: `12_Anexa_4_Imagini_${resident.beneficiarCnp}.pdf`,
    blob: anexa4Blob
  });

  // 13. Anexa 5 - Administrare tratament
  const anexa5Blob = await pdf(<Anexa5 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 5 - Acord administrare tratament',
    filename: `13_Anexa_5_Tratament_${resident.beneficiarCnp}.pdf`,
    blob: anexa5Blob
  });

  // 14. Anexa 6 - Declarație neasumare
  const anexa6Blob = await pdf(<Anexa6 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 6 - Declarație de neasumare',
    filename: `14_Anexa_6_Neasumare_${resident.beneficiarCnp}.pdf`,
    blob: anexa6Blob
  });

  // 15. Anexa 7 - Schimbare stare sănătate
  const anexa7Blob = await pdf(<Anexa7 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 7 - Acord schimbare stare sănătate',
    filename: `15_Anexa_7_Schimbare_Sanatate_${resident.beneficiarCnp}.pdf`,
    blob: anexa7Blob
  });

  // 16. Anexa 8 - Închidere centru
  const anexa8Blob = await pdf(<Anexa8 resident={resident} company={company} camin={camin} />).toBlob();
  documents.push({
    name: 'Anexa 8 - Acord închidere centru',
    filename: `16_Anexa_8_Inchidere_${resident.beneficiarCnp}.pdf`,
    blob: anexa8Blob
  });

  return documents;
}
