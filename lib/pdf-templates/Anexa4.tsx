/**
 * ANEXA NR.4 - ACORD PENTRU GESTIONAREA ȘI UTILIZAREA IMAGINILOR ȘI SUPRAVEGHERII VIDEO
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Resident } from '@/types/resident';
import './fonts';
import { PDFHeader } from './PDFHeader';
import { PDFSignatures } from './PDFSignatures';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    textAlign: 'justify',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  bold: {
    fontWeight: 'bold',
  },
});

interface Anexa4Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa4: React.FC<Anexa4Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} Nr. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      {/* PAGINA 1 */}
      <Page size="A4" style={styles.page}>
        <PDFHeader company={company} />

        <Text style={styles.title}>ANEXA Nr.4 la CONTRACTUL {contractNumber}/{contractDate}</Text>
        <Text style={styles.subtitle}>Acord pentru gestionarea si utilizarea imaginilor si supravegherii video</Text>

        <Text style={styles.sectionTitle}>1. Partile acordului:</Text>
        <Text style={styles.text}>
          1.1. <Text style={styles.bold}>{company?.name}</Text>, denumita în continuare furnizor de servicii sociale, reprezentata 
          de catre în calitate de <Text style={styles.bold}>furnizor</Text>, pe de o parte,
        </Text>
        <Text style={[styles.text, { textAlign: 'center', fontWeight: 'bold' }]}>si:</Text>
        <Text style={styles.text}>
          1.2 <Text style={styles.bold}>{resident.beneficiarNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.beneficiarCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}</Text>, 
          eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
          valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
          în calitate de <Text style={styles.bold}>beneficiar</Text>, <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de 
          identificare: <Text style={styles.bold}>CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) , pe de alta parte.
        </Text>

        <Text style={styles.text}>
          În temeiul dispozitiilor art. 73 din Noul Cod civil, au înteles sa încheie prezentul acord cu 
          respectarea urmatoarelor clauze:
        </Text>

        <Text style={styles.sectionTitle}>2. Obiectul acordului:</Text>
        <Text style={styles.text}>
          2.1. <Text style={styles.bold}>{resident.beneficiarNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.beneficiarCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}</Text>, 
          eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
          valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
          în calitate de <Text style={styles.bold}>beneficiar</Text>, în baza dreptului meu 
          constitutional de a dispune asupra numai mele, voici si imaginii mele, declar ca sunt acord ca 
          {company?.name} / reprezentantii, propusii si colaboratorii sai precum si persoanele sau 
          societatile care actioneaza cu permisiunea {company?.name}, , sa foloseasca si sa publice 
          portretele sau imaginii fotografice care ma reprezinta pe mine, precum si tipariturile, diapozitivele 
          sau informatiile digitale aferente acestora, în care as putea fi înclus în totalitate sau partial, sau 
          modificate ca forma, sau reproduse sub diverse forme, color sau alfel, facute prin orice mijloc (în 
          studioul propriu sau în alta parte), ca forma de promovare comerciala sau orice alta forma legala, 
          în orice format, fotografie, simplu, multiplu, în miscare sau imagine video, indiferent de modul în 
          care imaginea va fi distribuita (publicata în presa, pliante de promovare, pe internet, retele de 
          socializare sau oriunde altundeva).
        </Text>

        <Text style={styles.text}>
          Termenul de imagine este considerat ca acopera toate atributele personalitatii domnului {resident.beneficiarNumeComplet} 
          (care include în special imaginea fixa sau mobila, portretul, silueta, vocea, 
          numele si prenumele sau semnatura acestuia).
        </Text>

        <Text style={styles.text}>
          Dau acest acord cu titlu gratuit fara sa am nicio pretentie baneasca sau de alta natura în prezent 
          sau în viitor, pentru materialele publicate de {company?.name} în considerarea acestei 
          autorizari.
        </Text>
      </Page>

      {/* PAGINA 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.text}>
          2.2. {company?.name} are dreptul de a prelucra imaginea si de a o folosi atât în întregime, 
          cât si parte din aceasta, în orice marime si pe orice suport, indiferent daca va obtine sau nu venit 
          din acestea.
        </Text>

        <Text style={styles.text}>
          Prezenta autorizatie este permisa fara limita în ceea ce priveste numarul de reproduceri, 
          reprezentari si adaptari realizate si fara niciun cost.
        </Text>

        <Text style={styles.text}>
          De asemenea, materialele realizate ca urmare a prezentului acord vor putea fi folosite oricând, 
          chiar si dupa data la care prezentul document îsi încheiaza efectele.
        </Text>

        <Text style={styles.text}>
          2.3. Prin prezentul document, Subsemnatul {resident.apartinatorNumeComplet} renunt la orice drept pe care îl am, 
          de a verinca si aproba modul de utilizare, care ar putea fi ales, al imaginilor respective. De 
          asemenea, scutesc {company?.name} de a celebra parti care actioneaza autorizate de catre 
          {company?.name} de orice revendicare de plata, asociata cu orice forma de dauna, fie 
          prevazuta, fie nu, legata de utilizarea artistica sau comerciala corespunzatoare acestor imagini.
        </Text>

        <Text style={styles.text}>
          2.4. În utilizarea imaginilor, {company?.name} se obliga sa respecte prevederile legale, sa 
          nu aduca atingere demnitatii, vietii familiale, intime si private a domnului {resident.beneficiarNumeComplet}.
        </Text>

        <Text style={styles.sectionTitle}>3. Dreptul de autor:</Text>
        <Text style={styles.text}>
          3.1. Fotografiile / filmarile / desenele / tablourile / schitele sau alte asemenea continând imaginea 
          domnului {resident.beneficiarNumeComplet} sunt considerate creatie si apartin autorului lor sau 
          {company?.name} daca sunt facute de acesta sau daca i s-au cedat drepturile de catre 
          fotograf / realizator.
        </Text>

        <Text style={styles.text}>
          3.2. Toate materialele realizate si/sau publicate în cadrul prezentei autorizatii vor ramâne în 
          proprietatea exclusiva a {company?.name}.
        </Text>

        <Text style={styles.sectionTitle}>4. Teritorialitate si durata:</Text>
        <Text style={styles.text}>
          4.1. Prezentul acord este valabil pe teritoriul României, dar si în orice alta tara în care 
          {company?.name} îsi desfasoara activitatea.
        </Text>

        <Text style={styles.text}>
          4.2. Durata prezentului acord este valabila pe toata perioada desfasurarii contractului de servicii 
          soaciale.
        </Text>

        <Text style={styles.sectionTitle}>5. Dispozitii finale:</Text>
        <Text style={styles.text}>
          5.1. Competenta în caz de litigii apartine instantelor de judecata de la sediul {company?.name}.
        </Text>

        <Text style={styles.text}>
          5.2. Subsemnatul {resident.apartinatorNumeComplet} declar ca nu sunt minor si ca sunt liber si pot sa dau un 
          asemenea consimtamânt în încheierea si executarea acestui conventii.
        </Text>

        <Text style={styles.text}>
          5.3. Subsemnatul {resident.apartinatorNumeComplet} ma angajez sa pastrez cu strictete confidentialitatea 
          prezentului document precum si a tuturor informatiilor, indiferent de natura acestora, obtinute cu 
          ocazia executarii materialelor care fac obiectul prezentei autorizatii.
        </Text>

        <Text style={styles.text}>
          5.4. Conform regulamentului (UE) 2016/679 al Parlamentului European si al Consiliului din 27 
          aprilie 2016 privind protectia persoanelor fizice în ceea ce priveste prelucrarea datelor cu 
          caracter personal si privind libera circulatie a acestor date si de abrogare a Directivei 95/46/CE, 
          {company?.name} se obliga sa administreze si sa prelucreze în conditii de siguranta 
          transparenta si numai în scopurile specificate, datele cu caracter personal ale domnului {resident.beneficiarNumeComplet}.
        </Text>

        <Text style={styles.text}>
          5.5. Daca o stipulare din prezentul document va fi declarata nula sau inaplicabila printr-o decizie 
          definitiva data de justitie, aceasta va fi considerata nescrisa si toate celelalte clauze vor ramane în 
          vigoare.
        </Text>

        <Text style={styles.text}>
          5.6. Prezentul acord a fost negociat si semnat de ambele parti, azi, <Text style={styles.bold}>{contractDate}</Text>.
        </Text>
      </Page>

      {/* PAGINA 3 - Semnături */}
      <Page size="A4" style={styles.page}>
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
