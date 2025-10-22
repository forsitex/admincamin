/**
 * ANEXA NR.5 - ACORD ADMINISTRARE TRATAMENT - Template React PDF
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
    marginBottom: 20,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});

interface Anexa5Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa5: React.FC<Anexa5Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} Nr. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} />

        {/* Titlu */}
        <Text style={styles.title}>ANEXA Nr.5 la CONTRACTUL {contractNumber}/{contractDate}</Text>
        <Text style={styles.subtitle}>Acord administrare tratament</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          Subsemnatul <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) , apartinand al 
          domnului <Text style={styles.bold}>{resident.beneficiarNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.beneficiarCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}</Text>, 
          eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
          valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
          în calitate de <Text style={styles.bold}>beneficiar</Text>, rezident în cadrul centrului 
          rezidential <Text style={styles.italic}>{camin?.name}</Text>, situat în , 
          <Text style={styles.bold}> declar ca sunt de acord cu schimbarea tratamentului</Text> tratamentului 
          sau administrarea de noi medicamente în schema de tratament la recomandarea 
          medicilor, schimbari de care voi fi informat în scris sau telefonic de catre personalul autorizat al 
          centrului (asistenta medicala/ medic/ manager).
        </Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
