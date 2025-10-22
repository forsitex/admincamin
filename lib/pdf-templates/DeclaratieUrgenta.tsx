/**
 * DECLARAȚIE PRIVIND ASUMAREA PLANULUI DE URGENȚĂ - Template React PDF
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Resident } from '@/types/resident';
import './fonts';
import { PDFHeader } from './PDFHeader';

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
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  text: {
    fontSize: 11,
    textAlign: 'justify',
    marginBottom: 30,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: 11,
    marginBottom: 60,
  },
  signatureSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  signatureText: {
    fontSize: 11,
    marginBottom: 5,
    textAlign: 'center',
  },
});

interface DeclaratieUrgentaProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const DeclaratieUrgenta: React.FC<DeclaratieUrgentaProps> = ({ resident, company, camin }) => {
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} camin={camin} />

        {/* Titlu */}
        <Text style={styles.title}>DECLARATIE</Text>
        <Text style={styles.subtitle}>PRIVIND ASUMAREA PLANULUI DE URGENTA</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          Subsemnatul <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) în calitate de 
          reprezentant legal/apartinator al beneficiarului {resident.beneficiarNumeComplet}, îmi asum 
          responsabilitatea ca în situatia suspendarii/încetarii activitatii sau în eventualitatea retragerii 
          licentei de functionare/desfiintare a serviciului social al <Text style={styles.bold}>{camin?.name}</Text>, 
          sa preiau beneficiarul în familie pentru îngrijire, conform procedurilor si/sau planului de urgenta al 
          furnizorului.
        </Text>

        {/* Data */}
        <Text style={styles.date}>Data: {contractDate}</Text>

        {/* Semnături */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureText}>Beneficiar,</Text>
          <Text style={styles.signatureText}>{resident.beneficiarNumeComplet}</Text>
          <Text style={[styles.signatureText, { marginTop: 30 }]}>Apartinator/Reprezentant legal/conventional,</Text>
          <Text style={styles.signatureText}>{resident.apartinatorNumeComplet}</Text>
        </View>
      </Page>
    </Document>
  );
};
