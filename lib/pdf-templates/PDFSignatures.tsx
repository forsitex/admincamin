/**
 * Component comun pentru semnături în documentele PDF
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
    position: 'relative',
  },
  signatureContainer: {
    position: 'relative',
    width: 100,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  signatureImageOctavian: {
    width: 70,
    height: 40,
    position: 'absolute',
    top: 0,
    left: 15,
  },
  signatureImageRaluca: {
    width: 50,
    height: 64,
    position: 'absolute',
    top: 0,
    left: 25,
  },
  stampImage: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.8,
  },
});

interface PDFSignaturesProps {
  resident: any;
  company: any;
  showStamp?: boolean;
}

export const PDFSignatures: React.FC<PDFSignaturesProps> = ({ resident, company, showStamp = false }) => {
  return (
    <View style={styles.signatures}>
      <View style={styles.signatureBlock}>
        <Text style={styles.signatureLabel}>Furnizorul de servicii sociale,</Text>
        <Text style={styles.signatureName}>{company.name}</Text>
        
        {/* Container pentru semnătură + ștampilă suprapuse */}
        <View style={styles.signatureContainer}>
          {/* Semnătură administrator */}
          {company.cui === '50780956' ? (
            <Image src="/signatures/semnatura-octavian.png" style={styles.signatureImageOctavian} />
          ) : (
            <Image src="/signatures/semnatura-raluca.png" style={styles.signatureImageRaluca} />
          )}
          
          {/* Ștampilă PESTE semnătură */}
          {showStamp && (
            <Image 
              src={company.cui === '50780956' ? '/stampila-empathy.png' : '/stampila-mobi.png'} 
              style={styles.stampImage} 
            />
          )}
        </View>
        
        <Text style={styles.signatureLabel}>{company.position},</Text>
        <Text style={styles.signatureName}>{company.representative}</Text>
      </View>

      <View style={styles.signatureBlock}>
        <Text style={styles.signatureLabel}>Beneficiarul de servicii sociale,</Text>
        <Text style={styles.signatureName}>{resident.beneficiarNumeComplet}</Text>
        <Text style={[styles.signatureLabel, { marginTop: 30 }]}>Reprezentant legal / Apartinator,</Text>
        <Text style={styles.signatureName}>{resident.apartinatorNumeComplet}</Text>
      </View>
    </View>
  );
};
