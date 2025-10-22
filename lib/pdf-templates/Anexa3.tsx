/**
 * ANEXA NR.3 - ACORD PRIVIND PRELUCRAREA DATELOR CU CARACTER PERSONAL (GDPR)
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
  header: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  telefon: {
    fontSize: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
  italic: {
    fontStyle: 'italic',
  },
  listItem: {
    fontSize: 10,
    marginBottom: 6,
    marginLeft: 15,
  },
});

interface Anexa3Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa3: React.FC<Anexa3Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} Nr. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      {/* PAGINA 1 */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} />

        {/* Titlu */}
        <Text style={styles.title}>ANEXA Nr.3 la CONTRACTUL {contractNumber}/{contractDate}</Text>
        <Text style={styles.subtitle}>ACORD PRIVIND PRELUCRAREA DATELOR CU CARACTER PERSONAL</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          <Text style={styles.bold}>{company?.name}</Text>, denumita în continuare furnizor de servicii sociale, reprezentata 
          de catre în calitate de <Text style={styles.bold}>furnizor</Text> / prestator servicii, respectând prevederile Regulamentului 
          (UE)2016/679 al Parlamentului European si al Consiliului din 27 aprilie 2016 privind protectia 
          persoanelor fizice în ceea ce priveste prelucrarea datelor cu caracter personal si privind libera 
          circulatie a acestor date si de abrogare a Directivei 95/46/CE (Regulamentul general privind 
          protectia datelor) pus în aplicare prin Legea nr.190/2018 aduce la cunostinta domnului {resident.apartinatorNumeComplet} 
          IONUT urmatoarele:
        </Text>

        <Text style={styles.text}>
          1. Informatiile oferite de dumneavoastra ce contin date de identificare, vor fi folosite în scopul 
          întocmirii documentelor în vederea cazarii domnului {resident.beneficiarNumeComplet} în cadrul 
          <Text style={styles.italic}> {camin?.name}</Text>.
        </Text>

        <Text style={styles.text}>
          2. Stocarea datelor se va face numai pe durata desfasurarii activitatii în baza contractului 
          pentru acordarea de servicii sociale încheiat.
        </Text>

        <Text style={[styles.text, { fontWeight: 'bold', marginTop: 10 }]}>
          Potrivit normelor legale în vigoare:
        </Text>

        <Text style={styles.listItem}>
          • Date cu caracter personal înseamna orice informatii privind o persoana fizica identificata sau 
          identificabila ("persoana vizata"); o persoana fizica identificabila este o persoana care poate fi 
          identificata, direct sau indirect, în special prin referire la un element de identificare, cum ar fi un 
          nume, un numar de identificare, date de localizare, un identificator online, sau la unul sau mai 
          multe elemente specifice, proprii identitatii sale fizice, fiziologice, genetice, psihice, economice, 
          culturale sau sociale;
        </Text>

        <Text style={styles.listItem}>
          • Prin "prelucrare" se întelege orice operatiune sau set de operatiuni efectuate asupra datelor cu 
          caracter personal sau asupra seturilor de date cu caracter personal, cu sau fara utilizarea de 
          mijloace automatizate, cum ar fi: colectarea, înregistrarea, organizarea, structurarea, stocarea, 
          adaptarea sau modificarea, extragerea, consultarea, divulgarea prin transmitere, diseminarea sau 
          punerea la dispozitie în orice alt mod, alinierea sau combinarea, restrictionarea, stergerea sau 
          distrugerea;
        </Text>

        <Text style={styles.listItem}>
          • Prelucrarea datelor cu caracter personal este legala numai daca si în masura în care se aplica 
          cel putin una din urmatoarele conditii:
        </Text>

        <Text style={[styles.listItem, { marginLeft: 30 }]}>
          a. persoana vizata si-a dat consimtamântul pentru unul sau mai multe scopuri specifice;
        </Text>

        <Text style={[styles.listItem, { marginLeft: 30 }]}>
          b. prelucrarea este necesara pentru executarea unui contract la care persoana vizata este 
          parte ori în vederea încheierii unui astfel de contract;
        </Text>

        <Text style={[styles.listItem, { marginLeft: 30 }]}>
          c. preluarea este necesara în vederea îndeplinirii unei obligatii legale care revine societatii 
          {company?.name};
        </Text>

        <Text style={[styles.listItem, { marginLeft: 30 }]}>
          d. prelucrarea este necesara pentru a proteja interesele vitale ale persoanei vizate sau ale 
          altei persoane fizice;
        </Text>

        <Text style={[styles.listItem, { marginLeft: 30 }]}>
          e. prelucrarea este necesara pentru îndeplinirea unei sarcini care serveste unui interes public;
        </Text>
      </Page>

      {/* PAGINA 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.listItem, { marginLeft: 30 }]}>
          f. prelucrarea este necesara în scopul intereselor legitime urmarite de operator sau de o 
          persoana terta, cu exceptia cazului în care preleveaza interesele sau drepturile si libertatile 
          fundamentale ale personei vizate, care necesita protejarea datelor cu caracter personal, în 
          special atunci când persoana vizata este un copil.
        </Text>

        <Text style={styles.text}>
          De asemenea, {company?.name} se obliga sa respecte si urmatoarele obligatii specifice:
        </Text>

        <Text style={styles.text}>
          a. Sa nu utilizeze datele cu caracter personal în alte scopuri de cat cele care rezulta din 
          îndeplinirea atributiilor;
        </Text>

        <Text style={styles.text}>
          b. Sa nu divulge datele cu caracter personal de cat persoanelor autorizate în acest sens în mod 
          expres.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) al domnului {resident.beneficiarNumeComplet}, 
          îmi exprim în mod expres consimtamântul ca {company?.name} sa foloseasca datele 
          de identificare cu caracter personal, puse la dispozitie, numai pentru întocmirea documentelor 
          prin vederea cazarii în cadrul centrului rezidential <Text style={styles.italic}>{camin?.name}</Text>, situat în .
        </Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
