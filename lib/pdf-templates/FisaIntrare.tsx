/**
 * FIȘA DE INTRARE - Template React PDF
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
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 30,
    lineHeight: 1.4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  field: {
    fontSize: 10,
    marginBottom: 3,
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  dotLine: {
    fontSize: 10,
    marginBottom: 3,
  },
});

interface FisaIntrareProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const FisaIntrare: React.FC<FisaIntrareProps> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} NR. ${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      {/* PAGINA 1 */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} camin={camin} />

        {/* Titlu */}
        <Text style={styles.title}>FISA DE INTRARE</Text>
        <Text style={styles.subtitle}>{contractNumber}/{contractDate}</Text>

        {/* Date personale */}
        <View style={styles.section}>
          <Text style={styles.field}><Text style={styles.bold}>Nume: {resident.beneficiarNumeComplet.split(' ')[0]}</Text></Text>
          <Text style={styles.field}><Text style={styles.bold}>Prenume: {resident.beneficiarNumeComplet.split(' ').slice(1).join(' ')}</Text></Text>
          <Text style={styles.field}><Text style={styles.bold}>Data nasterii: {resident.beneficiarDataNasterii}</Text></Text>
          <Text style={styles.field}><Text style={styles.bold}>CNP: {resident.beneficiarCnp}</Text></Text>
          <Text style={styles.field}><Text style={styles.bold}>Adresa: {resident.beneficiarAdresa}</Text></Text>
        </View>

        {/* Proveniență */}
        <View style={styles.section}>
          <Text style={styles.field}>De unde provine: [ ] de acasa / [ ] din spital .............................................;</Text>
          <Text style={styles.field}>[ ] din alt centru ................................................................;</Text>
          <Text style={styles.field}>[ ] ALTA VARIANTA ................................................................;</Text>
        </View>

        {/* Date medicale */}
        <View style={styles.section}>
          <Text style={styles.dotLine}>Diagnostic: ..........................................................................</Text>
          <Text style={styles.dotLine}>Alergii: ............................................................................</Text>
          <Text style={styles.dotLine}>Alimentatie: ........................................................................</Text>
          <Text style={styles.dotLine}>Incontinenta: .........................................................................</Text>
          <Text style={styles.dotLine}>Mobilitate: ..........................................................................</Text>
          <Text style={styles.dotLine}>Greutate: ...........................................................................</Text>
          <Text style={styles.dotLine}>Comportament / Violenta: ............................................................</Text>
          <Text style={styles.dotLine}>Medic de familie: ...................................................................</Text>
          <Text style={styles.dotLine}>     Nume: .........................................................................</Text>
          <Text style={styles.dotLine}>     Telefon: .................... E-mail: ........................................</Text>
        </View>

        {/* Persoană contact */}
        <View style={styles.section}>
          <Text style={styles.dotLine}>Persoane de contact: ................................................................</Text>
          <Text style={styles.dotLine}>     Nume: .........................................................................</Text>
          <Text style={styles.dotLine}>     Telefon: .................... E-mail: ........................................</Text>
          <Text style={styles.dotLine}>     Adresa: ........................................................................</Text>
        </View>

        {/* Aparținător */}
        <View style={styles.section}>
          <Text style={styles.field}>
            <Text style={styles.bold}>Apartinator: {resident.apartinatorNumeComplet}</Text> cu date de identificare: 
            <Text style={styles.bold}> CNP {resident.apartinatorCnp}</Text> si <Text style={styles.bold}>CI seria {resident.apartinatorCiSerie}{resident.apartinatorCiNumar}, nr.{resident.apartinatorCiNumar}</Text>, 
            eliberat la data de {resident.apartinatorCiEliberatData} de catre {resident.apartinatorCiEliberatDe}, 
            valabil pâna la {resident.apartinatorCiValabilPana}, cu domiciliul în {resident.apartinatorAdresa}
            {' '}<Text style={styles.bold}>- telefon: {resident.apartinatorTelefon};</Text>
            {' '}<Text style={styles.bold}>- email: {resident.apartinatorEmail};</Text>
          </Text>
        </View>

        <Text style={styles.dotLine}>Semnatura apartinator: ............................................................</Text>
      </Page>

      {/* PAGINA 2 - Examen clinic */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>EXAMEN CLINIC GENERAL:</Text>

        <Text style={styles.dotLine}>Tensiune Arteriala (TA): ............................................................</Text>
        <Text style={styles.dotLine}>Puls (AV): ..........................................................................</Text>
        <Text style={styles.dotLine}>Glicemie: ...........................................................................</Text>
        <Text style={styles.dotLine}>Temperatura: ........................................................................</Text>
        <Text style={styles.dotLine}>Saturatie oxigen (SpO2): ............................................................</Text>
        <Text style={styles.dotLine}>Escare: .............................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>

        <Text style={styles.sectionTitle}>STARE GENERALA LA CAZARE ÎN CENTRU: ..........................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>
        <Text style={styles.dotLine}>...................................................................................</Text>

        <Text style={[styles.dotLine, { marginTop: 30 }]}>Nume si semnatura asistent medical: ............................................</Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
