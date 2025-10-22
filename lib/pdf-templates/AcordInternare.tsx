/**
 * ACORD DE INTERNARE ÎN CENTRU - Template React PDF
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
  numar: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 40,
  },
  title: {
    fontSize: 16,
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
});

interface AcordInternareProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const AcordInternare: React.FC<AcordInternareProps> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} NR. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} camin={camin} />

        {/* Număr */}
        <Text style={styles.numar}>Nr. ......./...............</Text>

        {/* Titlu */}
        <Text style={styles.title}>ACORD DE INTERNARE ÎN CENTRU</Text>
        <Text style={styles.subtitle}>Anexa la contractul {contractNumber}/{contractDate}</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          <Text style={styles.bold}>{resident.beneficiarNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.beneficiarCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}</Text>, 
          eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
          valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
          în calitate de <Text style={styles.bold}>beneficiar</Text>, declar pe proprie raspundere ca sunt de acord cu internarea în cadrul {camin?.name}.
        </Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} />
      </Page>
    </Document>
  );
};
