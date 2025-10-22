/**
 * ANEXA NR.6 - DECLARAȚIE DE NEASUMARE - Template React PDF
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
    textAlign: 'justify',
    marginBottom: 8,
    lineHeight: 1.4,
  },
});

interface Anexa6Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa6: React.FC<Anexa6Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} Nr. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      {/* PAGINA 1 */}
      <Page size="A4" style={styles.page}>
        <PDFHeader company={company} />

        <Text style={styles.title}>ANEXA Nr.6 la CONTRACTUL {contractNumber}/{contractDate}</Text>
        <Text style={styles.subtitle}>DECLARATIE DE NEASUMARE</Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>{resident.beneficiarNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.beneficiarCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}</Text>, 
          eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
          valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
          în calitate de <Text style={styles.bold}>beneficiar</Text>, si <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de 
          identificare: <Text style={styles.bold}>CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) a domnului 
          <Text style={styles.bold}> {resident.beneficiarNumeComplet}</Text>, rezident în cadrul Centrului 
          <Text style={styles.italic}>{camin?.name}</Text>, declar ca am citit si am înteles urmatoarele:
        </Text>

        <Text style={styles.listItem}>
          1. Centrul <Text style={styles.italic}>{camin?.name}</Text> nu poate fi tinut raspunzator de pierderea sau deteriorarea hainelor 
          sau a altor obiecte personale ale beneficiarilor data fiind natura activitatii. Bunurile de 
          valoare pe care beneficiarul le are asupra sa la momentul internarii în centru sau care sunt 
          introduse în centru pe parcursul derularii contractului de servicii sociale trebuie declarate 
          catre reprezentantul furnizorului de servicii sociale. Furnizorul nu încurajeaza purtarea si 
          detinerea în cadrul centrului de obiecte de valoare (bijuteri, bani, telefoane etc.).
        </Text>

        <Text style={styles.listItem}>
          2. Centrul <Text style={styles.italic}>{camin?.name}</Text> nu este un spital sau centru medical sau centru de recuperare 
          medicala si din punct de vedere medical se ocupa exclusiv de administrarea tratamentului 
          medical prescris de un medic specialist.
        </Text>

        <Text style={styles.listItem}>
          3. Centrul <Text style={styles.italic}>{camin?.name}</Text> nu este raspunzator si nu poate fi tras la raspundere pentru 
          serviciile medicale oferite de spitalele / centrele medicale, de stat sau private, medici de 
          familie, medici specialisti, unde ajung rezidentii sai, în mod voit sau nevoit.
        </Text>

        <Text style={styles.listItem}>
          4. Urgentele si problemele medicale ale beneficiarilor gazduiti în centru sunt directionate prin 
          apel 112 sau prin programare, catre spital si medici specialisti, Centrul <Text style={styles.italic}>{camin?.name}</Text> 
          neavând competenta medicala.
        </Text>

        <Text style={styles.listItem}>
          5. Centrul <Text style={styles.italic}>{camin?.name}</Text> nu poate fi tinut raspunzator de securitatea datelor personale ale 
          beneficiarilor, încredintate catre diferitele autoritati ca urmare a cerintelor legale, la care 
          este supusa {company?.name}.
        </Text>

        <Text style={styles.listItem}>
          6. Centrul <Text style={styles.italic}>{camin?.name}</Text> nu poate garanta îmbunatitirea starii de sanatate a beneficiarilor 
          aflati în grija si compensa la maxima diligenta pentru ca viata rezidentilor sa se desfasoare 
          în mod normal raportat la starea de sanatate si vârsta.
        </Text>

        <Text style={styles.listItem}>
          7. Beneficiarii Centrului <Text style={styles.italic}>{camin?.name}</Text> si apartinatorii acestora trebuie sa înteleaga faptul ca 
          în activitatea curenta de îngrijire a persoanelor vârstnice, în special în cazul persoanelor 
          imobilizate, pot aparea accidente ca urmare a manipularii acestor persoane de catre 
          personalul centrului. Astfel de accidente pot aparea un precadere în cazul beneficiarilor cu o 
          greutate peste medie si în situatia procedurilor firesti de îngrijire, spalare, o astfel de 
          persoana poate cadea din pat sau poate aluneca din bratele îngrijierului, se poate lovi de 
          bratele scaunului rulant sau de marginea patului, iar Centrul <Text style={styles.italic}>{camin?.name}</Text> nu poate fi tinut 
          raspunzator.
        </Text>
      </Page>

      {/* PAGINA 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.listItem}>
          8. Beneficiarii Centrului <Text style={styles.italic}>{camin?.name}</Text> si apartinatorii acestora trebuie sa înteleaga si sa 
          cunoasca faptul ca în dinamica vietii de zi cu zi în centru pot aparea situatii medicale în care se 
          pot raspândi de la un beneficiar la altul fara ca acest lucru sa poata fi controlat de catre 
          {company?.name} si personalul acesteia. În aceasta situatie intra epidemia de 
          coronavirus, gripa, raceii etc.
        </Text>

        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
