/**
 * ANEXA NR.8 - ACORD ÎN CAZUL ÎNCHIDERII CENTRULUI
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
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
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
  italic: {
    fontStyle: 'italic',
  },
  checkbox: {
    fontSize: 11,
    marginBottom: 12,
    marginLeft: 20,
  },
});

interface Anexa8Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa8: React.FC<Anexa8Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} Nr. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader company={company} />

        <Text style={styles.title}>ANEXA Nr.8 la CONTRACTUL {contractNumber}/{contractDate}</Text>
        <Text style={styles.subtitle}>ACORD ÎN CAZUL ÎNCHIDERII CENTRULUI</Text>

        <Text style={styles.text}>
          Subsemnatul <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) a domnului 
          {resident.beneficiarNumeComplet}, rezident în cadrul Centrului <Text style={styles.italic}>{camin?.name}</Text>, 
          declar pe proprie raspundere ca, în eventualitatea închiderii centrului (oricare ar fi motivele),
        </Text>

        <Text style={styles.checkbox}>
          [ ] Ma oblig sa identific, în mod individual, un alt centru rezidential pentru domnul {resident.beneficiarNumeComplet}.
        </Text>

        <Text style={styles.checkbox}>
          [ ] Sunt de acord ca, reprezentatii Centrului <Text style={styles.italic}>{camin?.name}</Text>, sa se ocupe de identificarea si 
          transferul domnului {resident.beneficiarNumeComplet} în alt centru rezidential.
        </Text>

        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
