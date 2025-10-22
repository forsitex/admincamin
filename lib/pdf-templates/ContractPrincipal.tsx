/**
 * CONTRACT PRINCIPAL - Template React PDF
 * Folosește @react-pdf/renderer pentru layout precis
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Resident } from '@/types/resident';
import './fonts';
import { PDFHeader } from './PDFHeader';
import { PDFSignatures } from './PDFSignatures';

// Stiluri - EXACT ca în PDF-ul original
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 50, // Păstrăm raportul 352:146 ≈ 2.4:1
    marginBottom: 10,
  },
  headerText: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 10,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 3,
  },
  contractNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  text: {
    fontSize: 10,
    textAlign: 'justify',
    marginBottom: 3,
  },
  indent: {
    marginLeft: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    fontSize: 8,
    borderTop: '1px solid #000',
    paddingTop: 5,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 10,
    marginTop: 10,
  },
  signatureImageOctavian: {
    width: 70,
    height: 40, // Raport 252:143 ≈ 1.76:1
    marginVertical: 5,
  },
  signatureImageRaluca: {
    width: 50,
    height: 64, // Raport 741:949 ≈ 0.78:1
    marginVertical: 5,
  },
});

interface ContractPrincipalProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const ContractPrincipal: React.FC<ContractPrincipalProps> = ({ resident, company, camin }) => {
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');
  const contractNumber = `${resident.numarDosar} NR. ${resident.numarContract}`;

  return (
    <Document>
      {/* PAGINA 1 */}
      <Page size="A4" style={styles.page}>
        {/* Header cu logo */}
        <View style={styles.header}>
          <Image
            src="/logo-empathy.png"
            style={styles.logo}
          />
          <View style={styles.headerText}>
            <Text style={styles.companyName}>{company?.name}</Text>
            <Text style={styles.companyName}>{camin?.name}</Text>
            <Text style={styles.companyName}>Adresa: {company?.address}</Text>
            <Text style={styles.companyName}>Tel: 0786300500</Text>
            <Text style={styles.companyName}>E-mail:</Text>
          </View>
        </View>

        {/* Titlu */}
        <Text style={styles.title}>CONTRACT DE SERVICII SOCIALE</Text>
        <Text style={styles.subtitle}>
          încheiat între furnizorul de servicii sociale si beneficiar sau,
        </Text>
        <Text style={styles.subtitle}>
          dupa caz, reprezentantul legal al acestuia
        </Text>
        <Text style={styles.contractNumber}>{contractNumber} / {contractDate}</Text>

        {/* 1. Părțile contractante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Partile contractante:</Text>
          <Text style={styles.text}>
            1.1. {company?.name}, denumita în continuare furnizor de servicii sociale, 
            reprezentata de catre {company?.representative} în calitate de {company?.position}
          </Text>
          <Text style={styles.text}>si:</Text>
          <Text style={styles.text}>
            1.2. Dl. {resident.beneficiarNumeComplet} cu date de identificare: CNP {resident.beneficiarCnp} 
            si CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}, 
            eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
            valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
            în calitate de beneficiar,
          </Text>
          <Text style={styles.text}>
            {resident.apartinatorNumeComplet} cu date de identificare: CNP {resident.apartinatorCnp} 
            si CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}, 
            eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
            valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
            în calitate de {resident.apartinatorRelatie} (denumit si apartinator)
          </Text>
          <Text style={styles.text}>(Se precizeaza documentul.)</Text>
        </View>

        {/* 2. având în vedere */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. având în vedere:</Text>
          <Text style={styles.text}>2.1. Cererea de acordare a serviciului social;</Text>
          <Text style={styles.text}>
            2.2. Planul de interventie/Planul individualizat de asistenta si îngrijire/Planul de servicii sociale/Planul 
            individualizat de protectie/Planul de abilitare-reabilitare a copilului/Programul individual de reabilitare si 
            integrare sociala {contractNumber} / data {contractDate}, denumit în continuare plan de servicii sociale;
          </Text>
          <Text style={styles.text}>
            2.3. Dispozitia primarului/directorului serviciului public de asistenta sociala pentru stabilirea dreptului la 
            servicii sociale nr. ............../.............;
          </Text>
          <Text style={styles.text}>
            2.4. Hotarârea comisiei pentru protectia copilului sau, dupa caz, sentinta judecatoreasca privind instituirea 
            unei masuri de protectie speciala, în conditiile legii,
          </Text>
          <Text style={styles.sectionTitle}>convin asupra urmatoarelor:</Text>
        </View>

        {/* 3. Definiții (început) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Definitii aplicabile prezentului contract:</Text>
          <Text style={styles.text}>
            3.1. contractul pentru furnizarea de servicii sociale - actul juridic încheiat între un furnizor de servicii 
            sociale si o persoana beneficiara de servicii sociale sau, dupa caz, parintii sau reprezentantul legal al 
            copilului beneficiar de servicii sociale în conformitate cu prevederile art. 45 alin. (1) din Legea asistentei 
            sociale nr. 292/2011, cu modificarile si completarile ulterioare, care exprima acordul de vointa al acestora în 
            vederea acordarii de servicii sociale;
          </Text>
          <Text style={styles.text}>
            3.2. furnizor de servicii sociale - persoana fizica sau juridica, publica ori privata, acreditata în vederea 
            acordarii de servicii sociale, care detine licenta de functionare pentru serviciile sociale care fac obiectul 
            prezentului contract de servicii sociale, în conformitate cu prevederile Legii nr. 197/2012 privind asigurarea 
            calitatii în domeniul serviciilor sociale, cu modificarile si completarile ulterioare;
          </Text>
          <Text style={styles.text}>
            3.3. beneficiar de servicii sociale - persoana aflata în situatie de risc si/sau de dificultate sociala, care 
            necesita servicii sociale, conform planului de interventie/planului de servicii sociale, si care are dreptul la 
            servicii sociale ca masura de asistenta sociala; persoanele beneficiare de servicii sociale sunt înregistrate în 
            Registrul national de evidenta a persoanelor beneficiare de servicii sociale, parte din sistemul integrat
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>| Pagina nr. 1</Text>
        </View>
      </Page>

      {/* PAGINA 2 */}
      <Page size="A4" style={styles.page}>
        {/* Continuare 3.3 */}
        <Text style={styles.text}>
          informatic de asistenta sociala, în conformitate cu prevederile art. 44 alin. (5) din Legea nr. 292/2011, cu modificarile si completarile ulterioare;
        </Text>

        {/* 3.4-3.7 */}
        <Text style={styles.text}>
          3.4. servicii sociale - ansamblul de masuri si actiuni realizate în cadrul serviciului social licentiat, prin personalul de specialitate pentru implementarea planului de servicii sociale în vederea atingerii obiectivelor prevazute în planul de interventie/planul de servicii sociale, în scopul prevenirii si depasirii unor situatii de dificultate, vulnerabilitate sau dependenta, prezervarii autonomiei si protectiei persoanei, prevenirii marginalizarii si excluziunii sociale, promovarii incluziunii sociale si cresterii calitatii vietii etc., cu respectarea standardelor minime obligatorii în baza carora a fost licentiat serviciul social;
        </Text>
        <Text style={styles.text}>
          3.5. plan de servicii sociale - concept care include documentul întocmit de asistentul social/echipa interdisciplinara cu acordul si participarea persoanei beneficiare si/sau a reprezentantului legal, dupa realizarea evaluarii complexe; în Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare, este mentionat ca plan de servicii sociale/plan individualizat de îngrijire si asistenta, iar în legile speciale este mentionat ca plan individualizat de protectie/plan de abilitare-reabilitare a copilului/program individual de reabilitare si integrare sociala etc.;
        </Text>
        <Text style={styles.text}>
          3.6. consimtamântul persoanei beneficiare - acordul exprimat de persoana beneficiara/parintele/reprezentantul legal si/sau, dupa caz, reprezentantul conventional, conform prevederilor legii, prin semnarea planului de servicii sociale si a contractului de servicii sociale cu privire la acordarea serviciilor sociale descrise în plan, anexa la contractul pentru furnizarea de servicii sociale;
        </Text>
        <Text style={styles.text}>
          3.7. forta majora - eveniment mai presus de controlul partilor, care nu putea fi prevazut în momentul încheierii contractului si care face imposibila executarea si, respectiv, îndeplinirea contractului, definit potrivit prevederilor art. 1.351 din Codul civil.
        </Text>

        {/* 4. Obiectul contractului */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Obiectul contractului</Text>
          <Text style={styles.text}>
            4.1. Obiectul contractului îl constituie acordarea serviciilor sociale, cod serviciu social 8710, prevazute în planul de servicii sociale anexat la prezentul contract.
          </Text>
          <Text style={styles.text}>4.2. Locul de acordare a serviciului social (conform licentei de functionare): .</Text>
          <Text style={styles.text}>4.3. Costul total al serviciului social este de {resident.costServiciu} RON/luna.</Text>
          <Text style={styles.text}>
            4.4. Contributia persoanei beneficiare, prevazuta în angajamentul de plata, anexa la prezentul contract, este de {resident.contributieBeneficiar} RON/luna.
          </Text>
          <Text style={styles.text}>
            4.5. Costul prevazut în dispozitia primarului/directorului serviciului public de asistenta sociala pentru stabilirea dreptului la servicii sociale .............................
          </Text>
        </View>

        {/* 5. Durata contractului */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Durata contractului</Text>
          <Text style={styles.text}>
            5.1. Durata contractului este de la data de {resident.dataInceputContract} pâna la data de {resident.dataSfarsitContract || '31.12.2025'} si poate fi prelungita în conditiile legii.
          </Text>
          <Text style={styles.text}>
            5.2. Durata contractului poate fi prelungita sau redusa cu acordul partilor si numai dupa evaluarea rezultatelor serviciilor acordate beneficiarului de servicii sociale si, dupa caz, revizuirea planului de servicii sociale.
          </Text>
          <Text style={styles.text}>
            5.3. Durata contractului poate fi stabilita si pe perioada nedeterminata, pentru beneficiarii serviciilor sociale rezidentiale, care, potrivit cadrului legal, pot beneficia de serviciile sociale pe perioada nedeterminata.
          </Text>
        </View>

        {/* 6. Furnizorul (început) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Furnizorul de servicii sociale:</Text>
          <Text style={styles.text}>
            6.1. respecta drepturile si libertatile fundamentale ale beneficiarului în acordarea serviciilor sociale, rezultate din prezentul contract;
          </Text>
          <Text style={styles.text}>
            6.2. acorda serviciile sociale prevazute în planul de servicii, cu respectarea acestuia si a standardelor minime de calitate specifice serviciului;
          </Text>
          <Text style={styles.text}>
            6.3. depune toate diligentele pentru asigurarea continuitatii serviciilor sociale pentru beneficiar, inclusiv prin aplicarea planului de urgenta în situatia închiderii serviciului social;
          </Text>
          <Text style={styles.text}>6.4. informeaza beneficiarul cu privire la:</Text>
          <Text style={[styles.text, styles.indent]}>
            6.4.1. descrierea serviciilor sociale oferite si conditiile în care acestea sunt acordate, precum si activitatile specifice care se desfasoara în cadrul acestora;
          </Text>
          <Text style={[styles.text, styles.indent]}>6.4.2. regulamentul de ordine interna/regulile casei;</Text>
          <Text style={[styles.text, styles.indent]}>
            6.4.3. procedura de evaluare a satisfactiei persoanei beneficiare si de evaluare a gradului de încredere a
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>| Pagina nr. 2</Text>
        </View>
      </Page>

      {/* PAGINA 3 */}
      <Page size="A4" style={styles.page}>
        {/* Continuare 6.4.3 */}
        <Text style={styles.text}>
          beneficiarilor si a reprezentantilor legali ai acestora, dupa caz, cu privire la serviciile sociale acordate;
        </Text>
        <Text style={[styles.text, styles.indent]}>
          6.4.4. procedura de formulare a plângerilor si reclamatiilor cu privire la serviciile primite;
        </Text>
        <Text style={[styles.text, styles.indent]}>
          6.4.5. procedura privind identificarea, semnalarea si solutionarea cazurilor de abuz, neglijare, exploatare sau orice alta forma de violenta, inclusiv tratamente inumane sau degradante;
        </Text>
        <Text style={[styles.text, styles.indent]}>
          6.4.6. participarea persoanelor care au calitatea de student, intern, voluntar în procesul de acordare a serviciilor sociale;
        </Text>
        <Text style={styles.text}>
          6.5. reevalueaza periodic situatia beneficiarului de servicii sociale si, dupa caz, completeaza si/sau revizuieste planul exclusiv în interesul acestuia;
        </Text>
        <Text style={styles.text}>
          6.6. respecta confidentialitatea datelor si informatiilor referitoare la beneficiarul de servicii sociale, conform prevederilor standardelor minime de calitate si ale Regulamentului (UE) 2016/679 al Parlamentului European si al Consiliului din 27 aprilie 2016 privind protectia persoanelor fizice în ceea ce priveste prelucrarea datelor cu caracter personal si privind libera circulatie a acestor date si de abrogare a Directivei 95/46/CE;
        </Text>
        <Text style={styles.text}>
          6.7. utilizeaza contributia beneficiarului, daca este prevazuta în contractul de servicii sociale, exclusiv pentru acoperirea cheltuielilor direct legate de acordarea serviciilor sociale destinate beneficiarului;
        </Text>
        <Text style={styles.text}>
          6.8. informeaza serviciul public de asistenta în a carui raza administrativ-teritoriala îsi are domiciliul/resedinta sau locuieste beneficiarul asupra nevoilor identificate si serviciilor sociale propuse a fi acordate;
        </Text>
        <Text style={styles.text}>
          6.9. utilizeaza date rezultate din implementarea contractului în scopul întocmirii de statistici, pentru dezvoltarea serviciilor sociale, cu respectarea legislatiei privind protectia datelor cu caracter personal;
        </Text>
        <Text style={styles.text}>
          6.10. respecta obligatiile privind asigurarea calitatii serviciilor sociale prevazute în Legea nr. 197/2012 privind asigurarea calitatii în domeniul serviciilor sociale, cu modificarile si completarile ulterioare, prevederile legilor speciale si standardelor minime de calitate aplicabile.
        </Text>

        {/* 7. Persoana beneficiara */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Persoana beneficiara de servicii sociale</Text>
          <Text style={styles.text}>
            7.1. Drepturile persoanei beneficiare sunt cele prevazute la art. 361 din Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare, în regulamentul de organizare si functionare al serviciului social, în standardele minime de calitate aplicabile, prevazute în carta drepturilor persoanelor beneficiare aprobata de furnizorul de servicii sociale si prezentata persoanei beneficiare odata cu încheierea prezentului contract, în principal:
          </Text>
          <Text style={[styles.text, styles.indent]}>7.1.1. sa i se respecte drepturile si libertatile fundamentale, fara discriminare;</Text>
          <Text style={[styles.text, styles.indent]}>7.1.2. sa fie informata asupra situatiilor de risc, precum si asupra drepturilor sociale;</Text>
          <Text style={[styles.text, styles.indent]}>
            7.1.3. sa i se comunice, în limbaj simplu, informatii accesibile privind drepturile fundamentale si masurile legale de protectie, precum si informatii privind conditiile care trebuie îndeplinite pentru a le obtine;
          </Text>
          <Text style={[styles.text, styles.indent]}>7.1.4. sa participe la procesul de luare a deciziilor cu privire la furnizarea serviciilor sociale;</Text>
          <Text style={[styles.text, styles.indent]}>7.1.5. sa i se asigure pastrarea confidentialitatii asupra informatiilor furnizate si primite;</Text>
          <Text style={[styles.text, styles.indent]}>
            7.1.6. sa i se asigure continuitatea serviciilor sociale furnizate, atât timp cât se mentin conditiile care au generat situatia de dificultate;
          </Text>
          <Text style={[styles.text, styles.indent]}>
            7.1.7. sa fie protejata de lege atât ea, cât si bunurile ei, atunci când nu are capacitate de decizie, chiar daca este îngrijita în familie sau într-o institutie;
          </Text>
          <Text style={[styles.text, styles.indent]}>7.1.8. sa i se respecte demnitatea si intimitatea;</Text>
          <Text style={[styles.text, styles.indent]}>
            7.1.9. sa participe la luarea deciziilor privind interventia sociala, putând alege variante de interventii, daca acestea exista;
          </Text>
          <Text style={[styles.text, styles.indent]}>7.1.10. sa participe la evaluarea serviciilor sociale primite;</Text>
          <Text style={[styles.text, styles.indent]}>7.1.11. sa participe în organismele de reprezentare ale furnizorilor de servicii sociale.</Text>
          <Text style={styles.text}>
            7.2. Acordul persoanei beneficiare pentru divulgarea informatiilor confidentiale se asuma numai în forma scrisa.
          </Text>
          <Text style={styles.text}>7.3. Informatiile confidentiale pot fi dezvaluite fara acordul beneficiarilor în urmatoarele situatii:</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>| Pagina nr. 3</Text>
        </View>
      </Page>

      {/* PAGINA 4 */}
      <Page size="A4" style={styles.page}>
        {/* Continuare 7.3 */}
        <Text style={[styles.text, styles.indent]}>7.3.1. atunci când dispozitiile legale o prevad în mod expres;</Text>
        <Text style={[styles.text, styles.indent]}>7.3.2. când este pusa în pericol viata persoanei beneficiare sau a membrilor unui grup social;</Text>
        <Text style={[styles.text, styles.indent]}>
          7.3.3. pentru protectia vietii, integritatii fizice sau a sanatatii persoanei, în cazul în care aceasta se afla în incapacitate fizica, psihica, senzoriala ori juridica de a-si da consimtamântul.
        </Text>
        <Text style={styles.text}>
          7.4. Prelucrarea datelor persoanelor beneficiare de servicii sociale, de catre toate entitatile implicate în toate etapele procesului de acordare a serviciilor sociale, se realizeaza cu respectarea prevederilor Regulamentului (UE) 2016/679 al Parlamentului European si al Consiliului din 27 aprilie 2016 privind protectia persoanelor fizice în ceea ce priveste prelucrarea datelor cu caracter personal si privind libera circulatie a acestor date si de abrogare a Directivei 95/46/CE.
        </Text>
        <Text style={styles.text}>
          7.5. Obligatiile persoanei beneficiare sunt cele prevazute la art. 362 din Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare, si în standardele minime de calitate aplicabile serviciului social care face obiectul contractului, în principal:
        </Text>
        <Text style={[styles.text, styles.indent]}>
          7.5.1. sa furnizeze informatii corecte cu privire la identitate, situatia familiala, sociala, medicala si economica;
        </Text>
        <Text style={[styles.text, styles.indent]}>7.5.2. sa participe la procesul de furnizare a serviciilor sociale;</Text>
        <Text style={[styles.text, styles.indent]}>
          7.5.3. sa contribuie, în conformitate cu legislatia în vigoare, la plata serviciilor sociale furnizate, în functie de tipul serviciului si de situatia ei materiala;
        </Text>
        <Text style={[styles.text, styles.indent]}>7.5.4. sa comunice orice modificare intervenita în legatura cu situatia ei personala;</Text>
        <Text style={[styles.text, styles.indent]}>
          7.5.5. sa respecte regulamentul de organizare si functionare al serviciului social si regulamentul de ordine interna/regulile casei.
        </Text>

        {/* Secțiunile 8-11 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Solutionarea reclamatiilor</Text>
          <Text style={styles.text}>
            8.1. Beneficiarul are dreptul de a formula verbal si/sau în scris reclamatii cu privire la acordarea serviciilor sociale si activitatea personalului, în conformitate cu procedura privind sesizarile si reclamatiile aprobata de furnizorul de servicii sociale si adusa la cunostinta persoanelor beneficiare.
          </Text>
          <Text style={styles.text}>
            8.2. Reclamatiile pot fi adresate furnizorului de servicii sociale direct sau prin intermediul oricarei persoane din cadrul echipei de implementare a planului de servicii sociale.
          </Text>
          <Text style={styles.text}>
            8.3. Furnizorul de servicii sociale are obligatia de a analiza continutul reclamatiilor, consultând atât beneficiarul de servicii sociale, cât si specialistii implicati în implementarea planului de servicii sociale, si de a formula raspuns în termen de maximum 10 zile de la primirea reclamatiei.
          </Text>
          <Text style={styles.text}>
            8.4. Beneficiarul are dreptul de a semnala orice suspiciune de abuz, neglijare, exploatare, tratament degradant sau orice alta forma de violenta conform procedurii specifice prevazute în standardul minim de calitate al serviciului social respectiv.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Rezilierea contractului</Text>
          <Text style={styles.text}>Constituie motiv de reziliere a prezentului contract urmatoarele:</Text>
          <Text style={styles.text}>
            9.1. refuzul obiectiv al beneficiarului de servicii sociale de a mai primi serviciile sociale, exprimat în mod direct sau prin reprezentantul sau legal;
          </Text>
          <Text style={styles.text}>
            9.2. nerespectarea în mod repetat de catre beneficiarul adult de servicii sociale a regulamentului de ordine interna/regulilor casei.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Suspendarea contractului</Text>
          <Text style={styles.text}>
            10.1. la solicitarea beneficiarului adult pe perioada spitalizarilor, pentru urmarea unor tratamente medicale, recuperare medicala;
          </Text>
          <Text style={styles.text}>
            10.2. la solicitarea beneficiarului adult pe perioada vacantelor/excursiilor/calatoriilor pentru o perioada de maximum 15 zile consecutive.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Încetarea contractului:</Text>
          <Text style={styles.text}>11.1. la expirarea duratei contractului;</Text>
          <Text style={styles.text}>11.2. prin acordul partilor privind încetarea contractului, în situatia beneficiarului adult;</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>| Pagina nr. 4</Text>
        </View>
      </Page>

      {/* PAGINA 5 */}
      <Page size="A4" style={styles.page}>
        {/* Continuare 11 */}
        <Text style={styles.text}>11.3. când obiectivul planului de servicii sociale a fost atins;</Text>
        <Text style={styles.text}>11.4. în cazul retragerii licentei de functionare a serviciului social;</Text>
        <Text style={styles.text}>11.5. în cazuri de forta majora;</Text>
        <Text style={styles.text}>
          11.6. ....................................................................................................................................................
        </Text>
        <Text style={styles.text}>
          (Se mentioneaza alte situatii, în afara celor prevazute la pct. 11.1 - 11.4 si care sunt prevazute în Procedura privind încetarea acordarii serviciilor, elaborata de furnizorul de servicii sociale cu respectarea standardelor minime de calitate si care a fost adusa la cunostinta persoanei beneficiare înainte de semnarea contractului.)
        </Text>

        {/* Secțiunile 12-14 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Dispozitii finale</Text>
          <Text style={styles.text}>
            12.1. Partile contractante au dreptul, pe durata îndeplinirii prezentului contract, de a conveni modificarea clauzelor acestuia prin act aditional numai în cazul aparitiei unor circumstante care lezeaza interesele legitime ale acestora si care nu au putut fi prevazute la data încheierii prezentului contract.
          </Text>
          <Text style={styles.text}>12.2. Prevederile prezentului contract se completeaza cu prevederile legislatiei în vigoare în domeniu.</Text>
          <Text style={styles.text}>12.3. Prezentul contract va fi interpretat conform legilor din România.</Text>
          <Text style={styles.text}>
            12.4. Furnizorul de servicii sociale realizeaza monitorizarea si evaluarea serviciilor sociale acordate, în conformitate cu obligatiile prevazute la art. 261 alin. (1) lit. g) - i), alin. (2) si (3) din Legea nr. 197/2012, cu modificarile si completarile ulterioare, precum si în conformitate cu prevederile legilor speciale si ale standardelor minime de calitate aplicabile.
          </Text>
          <Text style={styles.text}>
            12.5. Masurile de implementare a planului de servicii sociale se comunica serviciului public de asistenta sociala, în conformitate cu prevederile art. 45 alin. (3) din Legea asistentei sociale nr. 292/2011, cu modificarile si completarile ulterioare.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Documentele anexe ale contractului:</Text>
          <Text style={styles.text}>13.1. planul de servicii sociale;</Text>
          <Text style={styles.text}>13.2. angajament de plata, dupa caz;</Text>
          <Text style={styles.text}>
            13.3. documentul cu privire la informarea persoanei beneficiare cu privire la regulamentul intern, procedurile operationale etc.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Arhivare si comunicare</Text>
          <Text style={styles.text}>14.1. Un exemplar al contractului este pastrat în dosarul de caz.</Text>
          <Text style={styles.text}>
            14.2. Prezentul contract de furnizare a serviciilor sociale a fost încheiat la sediul serviciului social/domiciliul/resedinta persoanei beneficiare de servicii sociale în doua exemplare, câte unul pentru fiecare parte contractanta.
          </Text>
          <Text style={styles.text}>
            14.3. Datele privind încheierea contractului se înregistreaza în Registrul national unic al beneficiarilor de servicii sociale, prin grija furnizorului de servicii sociale, în termen de 24 de ore de la data încheierii acestuia.
          </Text>
        </View>

        {/* SEMNĂTURI */}
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>{contractDate}</Text>
            <Text style={styles.signatureLabel}>Beneficiarul de servicii sociale,</Text>
            <Text style={styles.signatureName}>{resident.beneficiarNumeComplet}</Text>
            <Text style={styles.signatureLabel}>Reprezentant legal / Apartinator,</Text>
            <Text style={styles.signatureName}>{resident.apartinatorNumeComplet}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Furnizorul de servicii sociale,</Text>
            <Text style={styles.signatureName}>{company?.name}</Text>
            {/* Semnătură administrator */}
            {company?.cui === '50780956' ? (
              <Image src="/signatures/semnatura-octavian.png" style={styles.signatureImageOctavian} />
            ) : (
              <Image src="/signatures/semnatura-raluca.png" style={styles.signatureImageRaluca} />
            )}
            <Text style={styles.signatureName}>{company?.position},</Text>
            <Text style={styles.signatureName}>{company?.representative}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>| Pagina nr. 5</Text>
        </View>
      </Page>
    </Document>
  );
};
