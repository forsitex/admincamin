/**
 * GENERATOR CONTRACT PRINCIPAL - COMPLET (5 PAGINI)
 * Replicare IDENTICĂ 100% cu documentul original
 */

import jsPDF from 'jspdf';
import { Resident } from '@/types/resident';
import { COMPANIES, CAMINE, CONTACT_PHONE } from '../constants';

export async function generateContractPrincipalComplete(resident: Resident): Promise<Blob> {
  const doc = new jsPDF();
  const company = COMPANIES.find(c => c.cui === resident.companyCui);
  const camin = CAMINE.find(c => c.id === resident.caminId);
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');
  const contractNumber = `${resident.numarDosar} NR. ${resident.numarContract}`;
  
  let y = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const leftMargin = 20;
  const rightMargin = 20;
  const maxWidth = pageWidth - leftMargin - rightMargin;

  // Helper: Adaugă text cu wrap și verificare pagină nouă
  const addText = (text: string, fontSize: number = 10, bold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    
    lines.forEach((line: string) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, leftMargin + indent, y);
      y += fontSize * 0.4;
    });
  };

  // Helper: Footer
  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.text(`| Pagina nr. ${pageNum}`, leftMargin, pageHeight - 15);
    doc.text('Document generat prin aplicatia de gestiune inteligenta pentru servicii sociale www.iCamin.ro', leftMargin, pageHeight - 10);
  };

  // ==================== PAGINA 1 ====================
  
  // TODO: Logo (va fi adăugat)
  // doc.addImage(logoPath, 'PNG', 20, 20, 40, 40);
  
  // Antet
  doc.setFontSize(10);
  doc.text(company?.name || '', 70, 25);
  doc.text(camin?.name || '', 70, 30);
  doc.text('Adresa:', 70, 35);
  doc.text(`Tel: ${CONTACT_PHONE}`, 70, 40);
  doc.text('E-mail:', 70, 45);
  
  y = 70;
  
  // Titlu
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = 'CONTRACT DE SERVICII SOCIALE';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, y);
  y += 10;
  
  // Subtitlu
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const subtitle1 = 'încheiat între furnizorul de servicii sociale si beneficiar sau,';
  const subtitle2 = 'dupa caz, reprezentantul legal al acestuia';
  doc.text(subtitle1, (pageWidth - doc.getTextWidth(subtitle1)) / 2, y);
  y += 5;
  doc.text(subtitle2, (pageWidth - doc.getTextWidth(subtitle2)) / 2, y);
  y += 10;
  
  // Număr contract
  doc.setFont('helvetica', 'bold');
  const contractNum = `${contractNumber} / ${contractDate}`;
  doc.text(contractNum, (pageWidth - doc.getTextWidth(contractNum)) / 2, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  
  // 1. Părțile contractante
  addText('1. Partile contractante:', 10, true);
  y += 2;
  
  addText(`1.1. ${company?.name}, denumita în continuare furnizor de servicii sociale, reprezentata de catre ${company?.representative} în calitate de ${company?.position}`, 10, false, 0);
  y += 2;
  
  addText('si:', 10, false, 0);
  y += 2;
  
  const beneficiarText = `1.2. Dl. ${resident.beneficiarNumeComplet} cu date de identificare: CNP ${resident.beneficiarCnp} si CI seria ${resident.beneficiarCiSerie}${resident.beneficiarCiNumar}, nr.${resident.beneficiarCiNumar}, eliberat la data de ${resident.beneficiarCiEliberatData} de catre ${resident.beneficiarCiEliberatDe}, valabil pâna la ${resident.beneficiarCiValabilPana}, cu domiciliul în ${resident.beneficiarAdresa}, în calitate de beneficiar,`;
  addText(beneficiarText, 10, false, 0);
  y += 2;
  
  const apartinatorText = `${resident.apartinatorNumeComplet} cu date de identificare: CNP ${resident.apartinatorCnp} si CI seria ${resident.apartinatorCiSerie}${resident.apartinatorCiNumar}, nr.${resident.apartinatorCiNumar}, eliberat la data de ${resident.apartinatorCiEliberatData} de catre ${resident.apartinatorCiEliberatDe}, valabil pâna la ${resident.apartinatorCiValabilPana}, cu domiciliul în ${resident.apartinatorAdresa}, în calitate de ${resident.apartinatorRelatie} (denumit si apartinator)`;
  addText(apartinatorText, 10, false, 0);
  y += 2;
  
  addText('(Se precizeaza documentul.)', 10, false, 0);
  y += 5;
  
  // 2. având în vedere
  addText('2. având în vedere:', 10, true);
  y += 2;
  addText('2.1. Cererea de acordare a serviciului social;', 10, false, 0);
  y += 2;
  addText(`2.2. Planul de interventie/Planul individualizat de asistenta si îngrijire/Planul de servicii sociale/Planul individualizat de protectie/Planul de abilitare-reabilitare a copilului/Programul individual de reabilitare si integrare sociala ${contractNumber} / data ${contractDate}, denumit în continuare plan de servicii sociale;`, 10, false, 0);
  y += 2;
  addText('2.3. Dispozitia primarului/directorului serviciului public de asistenta sociala pentru stabilirea dreptului la servicii sociale nr. ............../.............;', 10, false, 0);
  y += 2;
  addText('2.4. Hotarârea comisiei pentru protectia copilului sau, dupa caz, sentinta judecatoreasca privind instituirea unei masuri de protectie speciala, în conditiile legii,', 10, false, 0);
  y += 2;
  addText('convin asupra urmatoarelor:', 10, true);
  y += 5;
  
  // 3. Definiții (începe pe pagina 1, continuă pe pagina 2)
  addText('3. Definitii aplicabile prezentului contract:', 10, true);
  y += 2;
  
  // 3.1
  addText('3.1. contractul pentru furnizarea de servicii sociale - actul juridic încheiat între un furnizor de servicii sociale si o persoana beneficiara de servicii sociale sau, dupa caz, parintii sau reprezentantul legal al copilului beneficiar de servicii sociale în conformitate cu prevederile art. 45 alin. (1) din Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare, care exprima acordul de vointa al acestora în vederea acordarii de servicii sociale;', 10, false, 0);
  y += 2;
  
  // 3.2
  addText('3.2. furnizor de servicii sociale - persoana fizica sau juridica, publica ori privata, acreditata în vederea acordarii de servicii sociale, care detine licenta de functionare pentru serviciile sociale care fac obiectul prezentului contract de servicii sociale, în conformitate cu prevederile Legii nr. 197/2012 privind asigurarea calitatii în domeniul serviciilor sociale, cu modificarile si completarile ulterioare;', 10, false, 0);
  y += 2;
  
  // 3.3
  addText('3.3. beneficiar de servicii sociale - persoana aflata în situatie de risc si/sau de dificultate sociala, care necesita servicii sociale, conform planului de interventie/planului de servicii sociale, si care are dreptul la servicii sociale ca masura de asistenta sociala; persoanele beneficiare de servicii sociale sunt înregistrate în Registrul national de evidenta a persoanelor beneficiare de servicii sociale, parte din sistemul integrat', 10, false, 0);
  
  addFooter(1);
  
  // ==================== PAGINA 2 ====================
  doc.addPage();
  y = 20;
  
  // Continuare 3.3 de pe pagina 1
  addText('informatic de asistenta sociala, în conformitate cu prevederile art. 44 alin. (5) din Legea nr. 292/2011, cu modificarile si completarile ulterioare;', 10, false, 0);
  y += 2;
  
  // 3.4-3.7
  addText('3.4. servicii sociale - ansamblul de masuri si actiuni realizate în cadrul serviciului social licentiat, prin personalul de specialitate pentru implementarea planului de servicii sociale în vederea atingerii obiectivelor prevazute în planul de interventie/planul de servicii sociale, în scopul prevenirii si depasirii unor situatii de dificultate, vulnerabilitate sau dependenta, prezervarii autonomiei si protectiei persoanei, prevenirii marginalizarii si excluziunii sociale, promovarii incluziunii sociale si cresterii calitatii vietii etc., cu respectarea standardelor minime obligatorii în baza carora a fost licentiat serviciul social;', 10, false, 0);
  y += 2;
  
  addText('3.5. plan de servicii sociale - concept care include documentul întocmit de asistentul social/echipa interdisciplinara cu acordul si participarea persoanei beneficiare si/sau a reprezentantului legal, dupa realizarea evaluarii complexe; în Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare, este mentionat ca plan de servicii sociale/plan individualizat de îngrijire si asistenta, iar în legile speciale este mentionat ca plan individualizat de protectie/plan de abilitare-reabilitare a copilului/program individual de reabilitare si integrare sociala etc.;', 10, false, 0);
  y += 2;
  
  addText('3.6. consimtamântul persoanei beneficiare - acordul exprimat de persoana beneficiara/parintele/reprezentantul legal si/sau, dupa caz, reprezentantul conventional, conform prevederilor legii, prin semnarea planului de servicii sociale si a contractului de servicii sociale cu privire la acordarea serviciilor sociale descrise în plan, anexa la contractul pentru furnizarea de servicii sociale;', 10, false, 0);
  y += 2;
  
  addText('3.7. forta majora - eveniment mai presus de controlul partilor, care nu putea fi prevazut în momentul încheierii contractului si care face imposibila executarea si, respectiv, îndeplinirea contractului, definit potrivit prevederilor art. 1.351 din Codul civil.', 10, false, 0);
  y += 5;
  
  // 4. Obiectul contractului
  addText('4. Obiectul contractului', 10, true);
  y += 2;
  addText('4.1. Obiectul contractului îl constituie acordarea serviciilor sociale, cod serviciu social 8710, prevazute în planul de servicii sociale anexat la prezentul contract.', 10, false, 0);
  y += 2;
  addText('4.2. Locul de acordare a serviciului social (conform licentei de functionare): .', 10, false, 0);
  y += 2;
  addText(`4.3. Costul total al serviciului social este de ${resident.costServiciu} RON/luna.`, 10, false, 0);
  y += 2;
  addText(`4.4. Contributia persoanei beneficiare, prevazuta în angajamentul de plata, anexa la prezentul contract, este de ${resident.contributieBeneficiar} RON/luna.`, 10, false, 0);
  y += 2;
  addText('4.5. Costul prevazut în dispozitia primarului/directorului serviciului public de asistenta sociala pentru stabilirea dreptului la servicii sociale .............................', 10, false, 0);
  y += 5;
  
  // 5. Durata contractului
  addText('5. Durata contractului', 10, true);
  y += 2;
  addText(`5.1. Durata contractului este de la data de ${resident.dataInceputContract} pâna la data de ${resident.dataSfarsitContract || '31.12.2025'} si poate fi prelungita în conditiile legii.`, 10, false, 0);
  y += 2;
  addText('5.2. Durata contractului poate fi prelungita sau redusa cu acordul partilor si numai dupa evaluarea rezultatelor serviciilor acordate beneficiarului de servicii sociale si, dupa caz, revizuirea planului de servicii sociale.', 10, false, 0);
  y += 2;
  addText('5.3. Durata contractului poate fi stabilita si pe perioada nedeterminata, pentru beneficiarii serviciilor sociale rezidentiale, care, potrivit cadrului legal, pot beneficia de serviciile sociale pe perioada nedeterminata.', 10, false, 0);
  y += 5;
  
  // 6. Furnizorul de servicii sociale (începe pe pag 2, continuă pe pag 3)
  addText('6. Furnizorul de servicii sociale:', 10, true);
  y += 2;
  addText('6.1. respecta drepturile si libertatile fundamentale ale beneficiarului în acordarea serviciilor sociale, rezultate din prezentul contract;', 10, false, 0);
  y += 2;
  addText('6.2. acorda serviciile sociale prevazute în planul de servicii, cu respectarea acestuia si a standardelor minime de calitate specifice serviciului;', 10, false, 0);
  y += 2;
  addText('6.3. depune toate diligentele pentru asigurarea continuitatii serviciilor sociale pentru beneficiar, inclusiv prin aplicarea planului de urgenta în situatia închiderii serviciului social;', 10, false, 0);
  y += 2;
  addText('6.4. informeaza beneficiarul cu privire la:', 10, false, 0);
  y += 2;
  addText('6.4.1. descrierea serviciilor sociale oferite si conditiile în care acestea sunt acordate, precum si activitatile specifice care se desfasoara în cadrul acestora;', 10, false, 5);
  y += 2;
  addText('6.4.2. regulamentul de ordine interna/regulile casei;', 10, false, 5);
  y += 2;
  addText('6.4.3. procedura de evaluare a satisfactiei persoanei beneficiare si de evaluare a gradului de încredere a', 10, false, 5);
  
  addFooter(2);
  
  // ==================== PAGINA 3 ====================
  doc.addPage();
  y = 20;
  
  // Continuare 6.4.3
  addText('beneficiarilor si a reprezentantilor legali ai acestora, dupa caz, cu privire la serviciile sociale acordate;', 10, false, 0);
  y += 2;
  addText('6.4.4. procedura de formulare a plângerilor si reclamatiilor cu privire la serviciile primite;', 10, false, 5);
  y += 2;
  addText('6.4.5. procedura privind identificarea, semnalarea si solutionarea cazurilor de abuz, neglijare, exploatare sau orice alta forma de violenta, inclusiv tratamente inumane sau degradante;', 10, false, 5);
  y += 2;
  addText('6.4.6. participarea persoanelor care au calitatea de student, intern, voluntar în procesul de acordare a serviciilor sociale;', 10, false, 5);
  y += 2;
  addText('6.5. reevalueaza periodic situatia beneficiarului de servicii sociale si, dupa caz, completeaza si/sau revizuieste planul exclusiv în interesul acestuia;', 10, false, 0);
  y += 2;
  addText('6.6. respecta confidentialitatea datelor si informatiilor referitoare la beneficiarul de servicii sociale, conform prevederilor standardelor minime de calitate si ale Regulamentului (UE) 2016/679 al Parlamentului European si al Consiliului din 27 aprilie 2016 privind protectia persoanelor fizice în ceea ce priveste prelucrarea datelor cu caracter personal si privind libera circulatie a acestor date si de abrogare a Directivei 95/46/CE;', 10, false, 0);
  y += 2;
  addText('6.7. utilizeaza contributia beneficiarului, daca este prevazuta în contractul de servicii sociale, exclusiv pentru acoperirea cheltuielilor direct legate de acordarea serviciilor sociale destinate beneficiarului;', 10, false, 0);
  y += 2;
  addText('6.8. informeaza serviciul public de asistenta în a carui raza administrativ-teritoriala îsi are domiciliul/resedinta sau locuieste beneficiarul asupra nevoilor identificate si serviciilor sociale propuse a fi acordate;', 10, false, 0);
  y += 2;
  addText('6.9. utilizeaza date rezultate din implementarea contractului în scopul întocmirii de statistici, pentru dezvoltarea serviciilor sociale, cu respectarea legislatiei privind protectia datelor cu caracter personal;', 10, false, 0);
  y += 2;
  addText('6.10. respecta obligatiile privind asigurarea calitatii serviciilor sociale prevazute în Legea nr. 197/2012 privind asigurarea calitatii în domeniul serviciilor sociale, cu modificarile si completarile ulterioare, prevederile legilor speciale si standardelor minime de calitate aplicabile.', 10, false, 0);
  y += 5;
  
  // 7. Persoana beneficiara (continuă pe pag 3 și 4)
  addText('7. Persoana beneficiara de servicii sociale', 10, true);
  y += 2;
  addText('7.1. Drepturile persoanei beneficiare sunt cele prevazute la art. 361 din Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare, în regulamentul de organizare si functionare al serviciului social, în standardele minime de calitate aplicabile, prevazute în carta drepturilor persoanelor beneficiare aprobata de furnizorul de servicii sociale si prezentata persoanei beneficiare odata cu încheierea prezentului contract, în principal:', 10, false, 0);
  y += 2;
  addText('7.1.1. sa i se respecte drepturile si libertatile fundamentale, fara discriminare;', 10, false, 0);
  y += 2;
  addText('7.1.2. sa fie informata asupra situatiilor de risc, precum si asupra drepturilor sociale;', 10, false, 0);
  y += 2;
  addText('7.1.3. sa i se comunice, în limbaj simplu, informatii accesibile privind drepturile fundamentale si masurile legale de protectie, precum si informatii privind conditiile care trebuie îndeplinite pentru a le obtine;', 10, false, 0);
  y += 2;
  addText('7.1.4. sa participe la procesul de luare a deciziilor cu privire la furnizarea serviciilor sociale;', 10, false, 0);
  y += 2;
  addText('7.1.5. sa i se asigure pastrarea confidentialitatii asupra informatiilor furnizate si primite;', 10, false, 0);
  y += 2;
  addText('7.1.6. sa i se asigure continuitatea serviciilor sociale furnizate, atât timp cât se mentin conditiile care au generat situatia de dificultate;', 10, false, 0);
  y += 2;
  addText('7.1.7. sa fie protejata de lege atât ea, cât si bunurile ei, atunci când nu are capacitate de decizie, chiar daca este îngrijita în familie sau într-o institutie;', 10, false, 0);
  y += 2;
  addText('7.1.8. sa i se respecte demnitatea si intimitatea;', 10, false, 0);
  y += 2;
  addText('7.1.9. sa participe la luarea deciziilor privind interventia sociala, putând alege variante de interventii, daca acestea exista;', 10, false, 0);
  y += 2;
  addText('7.1.10. sa participe la evaluarea serviciilor sociale primite;', 10, false, 0);
  y += 2;
  addText('7.1.11. sa participe în organismele de reprezentare ale furnizorilor de servicii sociale.', 10, false, 0);
  y += 2;
  addText('7.2. Acordul persoanei beneficiare pentru divulgarea informatiilor confidentiale se asuma numai în forma scrisa.', 10, false, 0);
  y += 2;
  addText('7.3. Informatiile confidentiale pot fi dezvaluite fara acordul beneficiarilor în urmatoarele situatii:', 10, false, 0);
  
  addFooter(3);
  
  // ==================== PAGINA 4 ====================
  doc.addPage();
  y = 20;
  
  // Continuare 7.3
  addText('7.3.1. atunci când dispozitiile legale o prevad în mod expres;', 10, false, 0);
  y += 2;
  addText('7.3.2. când este pusa în pericol viata persoanei beneficiare sau a membrilor unui grup social;', 10, false, 0);
  y += 2;
  addText('7.3.3. pentru protectia vietii, integritatii fizice sau a sanatatii persoanei, în cazul în care aceasta se afla în incapacitate fizica, psihica, senzoriala ori juridica de a-si da consimtamântul.', 10, false, 0);
  y += 2;
  addText('7.4. Prelucrarea datelor persoanelor beneficiare de servicii sociale, de catre toate entitatile implicate în toate etapele procesului de acordare a serviciilor sociale, se realizeaza cu respectarea prevederilor Regulamentului (UE) 2016/679 al Parlamentului European si al Consiliului din 27 aprilie 2016 privind protectia persoanelor fizice în ceea ce priveste prelucrarea datelor cu caracter personal si privind libera circulatie a acestor date si de abrogare a Directivei 95/46/CE.', 10, false, 0);
  y += 2;
  addText('7.5. Obligatiile persoanei beneficiare sunt cele prevazute la art. 362 din Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare, si în standardele minime de calitate aplicabile serviciului social care face obiectul contractului, în principal:', 10, false, 0);
  y += 2;
  addText('7.5.1. sa furnizeze informatii corecte cu privire la identitate, situatia familiala, sociala, medicala si economica;', 10, false, 0);
  y += 2;
  addText('7.5.2. sa participe la procesul de furnizare a serviciilor sociale;', 10, false, 0);
  y += 2;
  addText('7.5.3. sa contribuie, în conformitate cu legislatia în vigoare, la plata serviciilor sociale furnizate, în functie de tipul serviciului si de situatia ei materiala;', 10, false, 0);
  y += 2;
  addText('7.5.4. sa comunice orice modificare intervenita în legatura cu situatia ei personala;', 10, false, 0);
  y += 2;
  addText('7.5.5. sa respecte regulamentul de organizare si functionare al serviciului social si regulamentul de ordine interna/regulile casei.', 10, false, 0);
  y += 5;
  
  // 8-11 (Secțiuni scurte)
  addText('8. Solutionarea reclamatiilor', 10, true);
  y += 2;
  addText('8.1. Beneficiarul are dreptul de a formula verbal si/sau în scris reclamatii cu privire la acordarea serviciilor sociale si activitatea personalului, în conformitate cu procedura privind sesizarile si reclamatiile aprobata de furnizorul de servicii sociale si adusa la cunostinta persoanelor beneficiare.', 10, false, 0);
  y += 2;
  addText('8.2. Reclamatiile pot fi adresate furnizorului de servicii sociale direct sau prin intermediul oricarei persoane din cadrul echipei de implementare a planului de servicii sociale.', 10, false, 0);
  y += 2;
  addText('8.3. Furnizorul de servicii sociale are obligatia de a analiza continutul reclamatiilor, consultând atât beneficiarul de servicii sociale, cât si specialistii implicati în implementarea planului de servicii sociale, si de a formula raspuns în termen de maximum 10 zile de la primirea reclamatiei.', 10, false, 0);
  y += 2;
  addText('8.4. Beneficiarul are dreptul de a semnala orice suspiciune de abuz, neglijare, exploatare, tratament degradant sau orice alta forma de violenta conform procedurii specifice prevazute în standardul minim de calitate al serviciului social respectiv.', 10, false, 0);
  y += 5;
  
  addText('9. Rezilierea contractului', 10, true);
  y += 2;
  addText('Constituie motiv de reziliere a prezentului contract urmatoarele:', 10, false, 0);
  y += 2;
  addText('9.1. refuzul obiectiv al beneficiarului de servicii sociale de a mai primi serviciile sociale, exprimat în mod direct sau prin reprezentantul sau legal;', 10, false, 0);
  y += 2;
  addText('9.2. nerespectarea în mod repetat de catre beneficiarul adult de servicii sociale a regulamentului de ordine interna/regulilor casei.', 10, false, 0);
  y += 5;
  
  addText('10. Suspendarea contractului', 10, true);
  y += 2;
  addText('10.1. la solicitarea beneficiarului adult pe perioada spitalizarilor, pentru urmarea unor tratamente medicale, recuperare medicala;', 10, false, 0);
  y += 2;
  addText('10.2. la solicitarea beneficiarului adult pe perioada vacantelor/excursiilor/calatoriilor pentru o perioada de maximum 15 zile consecutive.', 10, false, 0);
  y += 5;
  
  addText('11. Încetarea contractului:', 10, true);
  y += 2;
  addText('11.1. la expirarea duratei contractului;', 10, false, 0);
  y += 2;
  addText('11.2. prin acordul partilor privind încetarea contractului, în situatia beneficiarului adult;', 10, false, 0);
  
  addFooter(4);
  
  // ==================== PAGINA 5 ====================
  doc.addPage();
  y = 20;
  
  // Continuare 11
  addText('11.3. când obiectivul planului de servicii sociale a fost atins;', 10, false, 0);
  y += 2;
  addText('11.4. în cazul retragerii licentei de functionare a serviciului social;', 10, false, 0);
  y += 2;
  addText('11.5. în cazuri de forta majora;', 10, false, 0);
  y += 2;
  addText('11.6. ....................................................................................................................................................', 10, false, 0);
  y += 2;
  addText('(Se mentioneaza alte situatii, în afara celor prevazute la pct. 11.1 - 11.4 si care sunt prevazute în Procedura privind încetarea acordarii serviciilor, elaborata de furnizorul de servicii sociale cu respectarea standardelor minime de calitate si care a fost adusa la cunostinta persoanei beneficiare înainte de semnarea contractului.)', 10, false, 0);
  y += 5;
  
  // 12-14
  addText('12. Dispozitii finale', 10, true);
  y += 2;
  addText('12.1. Partile contractante au dreptul, pe durata îndeplinirii prezentului contract, de a conveni modificarea clauzelor acestuia prin act aditional numai în cazul aparitiei unor circumstante care lezeaza interesele legitime ale acestora si care nu au putut fi prevazute la data încheierii prezentului contract.', 10, false, 0);
  y += 2;
  addText('12.2. Prevederile prezentului contract se completeaza cu prevederile legislatiei în vigoare în domeniu.', 10, false, 0);
  y += 2;
  addText('12.3. Prezentul contract va fi interpretat conform legilor din România.', 10, false, 0);
  y += 2;
  addText('12.4. Furnizorul de servicii sociale realizeaza monitorizarea si evaluarea serviciilor sociale acordate, în conformitate cu obligatiile prevazute la art. 261 alin. (1) lit. g) - i), alin. (2) si (3) din Legea nr. 197/2012, cu modificarile si completarile ulterioare, precum si în conformitate cu prevederile legilor speciale si ale standardelor minime de calitate aplicabile.', 10, false, 0);
  y += 2;
  addText('12.5. Masurile de implementare a planului de servicii sociale se comunica serviciului public de asistenta sociala, în conformitate cu prevederile art. 45 alin. (3) din Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare.', 10, false, 0);
  y += 5;
  
  addText('13. Documentele anexe ale contractului:', 10, true);
  y += 2;
  addText('13.1. planul de servicii sociale;', 10, false, 0);
  y += 2;
  addText('13.2. angajament de plata, dupa caz;', 10, false, 0);
  y += 2;
  addText('13.3. documentul cu privire la informarea persoanei beneficiare cu privire la regulamentul intern, procedurile operationale etc.', 10, false, 0);
  y += 5;
  
  addText('14. Arhivare si comunicare', 10, true);
  y += 2;
  addText('14.1. Un exemplar al contractului este pastrat în dosarul de caz.', 10, false, 0);
  y += 2;
  addText('14.2. Prezentul contract de furnizare a serviciilor sociale a fost încheiat la sediul serviciului social/domiciliul/resedinta persoanei beneficiare de servicii sociale în doua exemplare, câte unul pentru fiecare parte contractanta.', 10, false, 0);
  y += 2;
  addText('14.3. Datele privind încheierea contractului se înregistreaza în Registrul national unic al beneficiarilor de servicii sociale, prin grija furnizorului de servicii sociale, în termen de 24 de ore de la data încheierii acestuia.', 10, false, 0);
  y += 10;
  
  // SEMNĂTURI
  doc.text(contractDate, 20, y);
  y += 10;
  
  // Stânga: Beneficiar + Aparținător
  doc.text('Beneficiarul de servicii sociale,', 20, y);
  y += 10;
  doc.text(resident.beneficiarNumeComplet, 20, y);
  y += 10;
  doc.text('Reprezentant legal / Apartinator,', 20, y);
  y += 10;
  doc.text(resident.apartinatorNumeComplet, 20, y);
  
  // Dreapta: Furnizor + Semnătură
  y -= 40;
  doc.text('Furnizorul de servicii sociale,', 110, y);
  y += 10;
  doc.text(company?.name || '', 110, y);
  y += 10;
  // TODO: Adaugă ștampilă și semnătură
  doc.text('{{administrator_contract_signing_section}}', 110, y);
  
  addFooter(5);
  
  return doc.output('blob');
}
