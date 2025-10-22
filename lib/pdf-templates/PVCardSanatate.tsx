/**
 * PROCES VERBAL DE PREDARE-PRIMIRE - Template React PDF
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
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 80,
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 11,
    marginBottom: 5,
    textAlign: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottom: '1px solid #000',
    marginTop: 5,
  },
});

interface PVCardSanatateProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const PVCardSanatate: React.FC<PVCardSanatateProps> = ({ resident, company, camin }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} />

        {/* Titlu */}
        <Text style={styles.title}>PROCES VERBAL DE PREDARE-PRIMIRE</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          Subsemnatul <Text style={styles.bold}>{resident.apartinatorNumeComplet}</Text> cu date de identificare: 
          <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
          eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
          valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}, 
          în calitate de <Text style={styles.bold}>{resident.apartinatorRelatie}</Text> (denumit si apartinator) având calitatea 
          de reprezentant conventional, în relatia cu beneficiarul {resident.beneficiarNumeComplet}, predau pe 
          propria raspundere cardul de sanatate, apartinând domnului/STANCU Anton Stancu Anton, în 
          custodia {company?.name}, la sediul , pentru eliberarea medicamentelor, înscrierea la 
          medicul de familie, folosirea în scopuri si servicii medicale, spital, necesare pentru îngrijirea 
          beneficiarului {resident.beneficiarNumeComplet}.
        </Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
