/**
 * ANEXA NR.2 - ANGAJAMENT DE PLATĂ - Template React PDF
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
    fontSize: 11,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 50,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  text: {
    fontSize: 11,
    textAlign: 'justify',
    marginBottom: 15,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: 'bold',
  },
  warning: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  note: {
    fontSize: 10,
    marginBottom: 30,
  },
});

interface Anexa2Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa2: React.FC<Anexa2Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} Nr. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} />

        {/* Titlu */}
        <Text style={styles.title}>ANEXA Nr.2 la CONTRACTUL {contractNumber}/{contractDate}</Text>
        <Text style={styles.subtitle}>Angajament de plata</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          Subsemnatul <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) , 
          declar prin prezenta, ca ma oblig sa achit lunar, în numerar sau prin ordin de plata, cheltuielile de cazare, 
          alimentatie si servicii, pentru <Text style={styles.bold}>STANCU Anton Stancu Anton</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.beneficiarCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}</Text>, 
          eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
          valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
          în calitate de <Text style={styles.bold}>beneficiar</Text>, conform contractului {contractNumber}/{contractDate}, 
          împreuna cu cheltuielile suplimentare aferente celorlalte servicii suplimentare oferite.
        </Text>

        <Text style={styles.warning}>
          În caz de neplata la termenul stabilit în contract, îmi asum eventualele penalizari de 
          întarziere sau rezilierea contractului, împreuna cu preluarea rezidentului în termen de 5 zile.
        </Text>

        <Text style={styles.note}>
          Redactat în 2 exemplare, dintre care unul s-a înmânat partii semnatare.
        </Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
