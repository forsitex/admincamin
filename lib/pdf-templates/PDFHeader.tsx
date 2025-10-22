/**
 * Component comun pentru header-ul documentelor PDF
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120, // Logo mai mic ca în Contract Principal
    height: 50, // Păstrăm raportul 352:146 ≈ 2.4:1
    marginBottom: 10,
  },
  companyName: {
    fontSize: 10,
    marginBottom: 2,
    textAlign: 'center',
  },
});

interface Company {
  name: string;
  address: string;
  cui: string;
  registrationNumber: string;
  representative: string;
  position: string;
}

interface Camin {
  name: string;
  id: string;
}

interface PDFHeaderProps {
  company: Company;
  camin?: Camin;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ company, camin }) => {
  if (!company) return null;
  
  return (
    <View style={styles.header}>
      <Image src="/logo-empathy.png" style={styles.logo} />
      <Text style={styles.companyName}>{company.name}</Text>
      {camin && <Text style={styles.companyName}>{camin.name}</Text>}
      <Text style={styles.companyName}>Adresa: {company.address}</Text>
      <Text style={styles.companyName}>Tel: 0786300500</Text>
      <Text style={styles.companyName}>E-mail:</Text>
    </View>
  );
};
