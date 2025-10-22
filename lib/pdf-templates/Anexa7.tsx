/**
 * ANEXA NR.7 - ACORD ÎN CAZUL SCHIMBĂRII STĂRII DE SĂNĂTATE
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
});

interface Anexa7Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa7: React.FC<Anexa7Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} Nr. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader company={company} />

        <Text style={styles.title}>ANEXA Nr.7 la CONTRACTUL {contractNumber}/{contractDate}</Text>
        <Text style={styles.subtitle}>Acord în cazul schimbarii starii de sanatate</Text>

        <Text style={styles.text}>
          În cazul în care Beneficiarul serviciilor de asistenta sociala doreste sa paraseasca Centrul 
          rezidential, pe fondul deteriorarii vizibile a starii de sanatate, Platitorul/persoana desemnata va fi 
          informat/a telefonic de îndata despre intentia Beneficiarului, precum si despre starea de sanatate 
          a acestuia.
        </Text>

        <Text style={styles.text}>
          Platitorul/persoana desemnata se obliga sa se prezinte de îndata la Centru pentru a discuta 
          cu Beneficiarul si pentru a hotarâ, împreuna cu acesta, daca persoana care primeste serviciile 
          sociale va mai ramâne, sau nu, în Centru.
        </Text>

        <Text style={styles.text}>
          În cazul în care, Platitorul/persoana desemnata nu se prezinta la Centru, dupa ce a fost 
          anunatat/a despre situatia descrisa mai sus, personalul Centrului va informa imediat Directia 
          Protectie Sociala – Serviciul Asistenta Persoane Vârstnice pentru obtinerea unor recomandari de 
          specialitate si va da eficienta opiniilor exprimate de acest serviciu.
        </Text>

        <Text style={styles.text}>
          Daca Beneficiarul devine agresiv cu sine, cu celelalte persoane sau cu personalul Centrului, 
          va fi anutat serviciul de urgenta 112.
        </Text>

        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
