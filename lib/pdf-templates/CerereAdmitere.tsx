/**
 * CERERE DE ADMITERE - Template React PDF
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Resident } from '@/types/resident';
import './fonts';
import { PDFHeader } from './PDFHeader';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },
  numar: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
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
  italic: {
    fontStyle: 'italic',
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  signatureBlock: {
    width: '40%',
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 40,
  },
});

interface CerereAdmitereProps {
  resident: Resident;
  company: any;
  camin: any;
}

export const CerereAdmitere: React.FC<CerereAdmitereProps> = ({ resident, company, camin }) => {
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} camin={camin} />

        {/* Număr */}
        <Text style={styles.numar}>Nr. ......./...............</Text>

        {/* Titlu */}
        <Text style={styles.title}>CERERE DE ADMITERE</Text>

        {/* Conținut */}
        <Text style={styles.text}>
          Subsemnatul {resident.apartinatorNumeComplet}, în calitate de {resident.apartinatorRelatie} al beneficiarului {resident.beneficiarNumeComplet}, 
          solicit acordarea de servicii sociale în baza încheierii unui contract, <Text style={styles.italic}>în {camin?.name}</Text>.
        </Text>

        <Text style={styles.text}>
          Mentionez ca motivul internarii este: lipsa adaptarii în cadrul acordarii serviciilor de 
          îngrijire la domiciliu / imposibilitatea familiei (reprezentantilor legali) de a putea acorda 
          îngrijirea necesara si raspunsul adecvat la nevoilor existente.
        </Text>

        {/* Semnături */}
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Data: {contractDate}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Semnatura:</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
