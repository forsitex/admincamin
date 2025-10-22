/**
 * ADRESĂ BENEFICIAR CĂTRE PRIMĂRIA DE DOMICILIU - Template React PDF
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
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
  destinatar: {
    fontSize: 11,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 11,
    textAlign: 'justify',
    marginBottom: 20,
    marginTop: 40,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: 'bold',
  },
  signatureSection: {
    marginTop: 60,
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 11,
    marginBottom: 5,
    textAlign: 'center',
  },
  logoSmall: {
    width: 88,
    height: 36.5,
    marginVertical: 10,
  },
});

interface AdresaPrimarieProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const AdresaPrimarie: React.FC<AdresaPrimarieProps> = ({ resident, company, camin }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} />

        {/* Destinatar */}
        <Text style={styles.destinatar}>CATRE PRIMARIA: Romania, jud.Bucuresti, loc.Bucuresti, sector 6</Text>
        <Text style={styles.destinatar}>În atentia Domnului / Doamnei Primar</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          Prin prezenta, va aducem la cunostinta ca <Text style={styles.bold}>Dl. {resident.beneficiarNumeComplet}</Text> cu date de 
          identificare: <Text style={styles.bold}>CNP {resident.beneficiarCnp}</Text> si 
          <Text style={styles.bold}> CI seria {resident.beneficiarCiSerie}{resident.beneficiarCiNumar}, nr.{resident.beneficiarCiNumar}</Text>, 
          eliberat la data de {resident.beneficiarCiEliberatData} de catre {resident.beneficiarCiEliberatDe}, 
          valabil pâna la {resident.beneficiarCiValabilPana}, cu domiciliul în {resident.beneficiarAdresa}, 
          în calitate de <Text style={styles.bold}>beneficiar</Text>, beneficiaza de serviciile sociale oferite de {camin?.name}, 
          serviciu social licentiat al furnizorului de servicii sociale <Text style={styles.bold}>{company?.name}</Text>, 
          denumita în continuare furnizor de servicii sociale, reprezentata de catre în calitate de <Text style={styles.bold}>furnizor</Text>.
        </Text>

        <Text style={[styles.text, { marginTop: 20 }]}>Cu deosebita stima,</Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
