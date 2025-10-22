/**
 * ACORD ÎN EVENTUALITATEA ÎNCHIDERII CENTRULUI - Template React PDF
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
    fontSize: 14,
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
  checkbox: {
    fontSize: 11,
    marginBottom: 10,
    marginLeft: 20,
  },
});

interface AcordInchidereCentruProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const AcordInchidereCentru: React.FC<AcordInchidereCentruProps> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} NR. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} camin={camin} />

        {/* Titlu */}
        <Text style={styles.title}>ACORD ÎN EVENTUALITATEA ÎNCHIDERII CENTRULUI</Text>
        <Text style={styles.subtitle}>Anexa la Contractul {contractNumber}/{contractDate}</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          Subsemnatul <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de {resident.apartinatorRelatie} (denumit si apartinator) a domnului 
          <Text style={styles.bold}> {resident.beneficiarNumeComplet}</Text>, rezident în cadrul {camin?.name}, 
          declar pe proprie raspundere ca, în eventualitatea închiderii centrului (oricare ar fi motivele),
        </Text>

        <Text style={styles.checkbox}>
          [ ] Ma oblig sa identific, în mod individual, un alt centru rezidential pentru domnul {resident.beneficiarNumeComplet}.
        </Text>

        <Text style={styles.checkbox}>
          [ ] Ma oblig sa preiau personal beneficiarul {resident.beneficiarNumeComplet} pentru reintegrarea în familie.
        </Text>

        <Text style={styles.checkbox}>
          [ ] Sunt de acord ca reprezentatii {camin?.name}, sa se ocupe de identificarea si transferul domnului {resident.beneficiarNumeComplet} în alt centru rezidential.
        </Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
