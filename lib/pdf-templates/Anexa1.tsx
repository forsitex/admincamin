/**
 * ANEXA NR.1 la Contractul - Template React PDF
 * Conține: Date personale, Servicii funerare, Context epidemiologic, Stare sănătate
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
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  text: {
    fontSize: 10,
    textAlign: 'justify',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  },
});

interface Anexa1Props {
  resident: Resident;
  company: any;
  camin: any;
}

export const Anexa1: React.FC<Anexa1Props> = ({ resident, company, camin }) => {
  const contractNumber = `${resident.numarDosar} nr.${resident.numarContract}`;
  const contractDate = new Date(resident.dataInregistrare).toLocaleDateString('ro-RO');

  return (
    <Document>
      {/* PAGINA 1 */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader company={company} />

        {/* Titlu */}
        <Text style={styles.title}>ANEXA NR.1 la Contractul {contractNumber} din {contractDate}</Text>

        {/* Secțiunea 1 */}
        <Text style={styles.sectionTitle}>1. DATE CU CARACTER PERSONAL</Text>
        <Text style={styles.text}>
          Având în vedere ca, începând cu data de 25.05.2018, sunt aplicabile prevederile 
          Regulamentului U.E. nr.679/2016, al Parlamentului European si al Consiliului Uniunii Europene, 
          privind protectia persoanelor fizice în ceea ce priveste prelucrarea datelor cu caracter personal si 
          privind libera circulatie a acestor date si de abrogare a Directivei 95/46 (Regulamentul general 
          privind protectia datelor).
        </Text>

        <Text style={styles.text}>
          Având în vedere dispozitiile Regulamentul general privind protectia datelor, prin semnarea 
          prezentului contract va exprimati consimtamântul (acordul) cu privire la prelucrarea datelor 
          dumneavoastra cu caracter personal si ale beneficiarului de drept, pe care le oferiti în vederea 
          accesarii/furnizarii serviciilor Oferite de <Text style={styles.bold}>{company?.name}</Text>.
        </Text>

        <Text style={styles.text}>
          Refuzul dumneavoastra de a va da acordul cu privire de a va da acordul cu privire la 
          prelucrarea datelor cu caracter personal care va privesc, conduce la imposibilitatea de a beneficia 
          de serviciile prezentului contract.
        </Text>

        {/* Secțiunea 2 */}
        <Text style={styles.sectionTitle}>2. SERVICII FUNERARE</Text>
        <Text style={styles.text}>
          În cazul decesului survenit în încinta centrului de îngrijire, serviciile de constatare a 
          decesului si transport la camera frigorifica, vor fi efectuate de catre firma S.C. Beelsamen Arte 
          S.R.L., conform contractului încheiat cu <Text style={styles.bold}>{company?.name}</Text>.
        </Text>

        <Text style={styles.text}>
          Costurile serviciilor prestate sunt în valoare de 739,00 Lei si cuprind urmatoarele:
        </Text>

        <Text style={styles.text}>
          Constatarea decesului, sacul septic, transportul si manipularea cadavrului la camera 
          frigorifica din str. Ghidigeni, nr. 39, Bragadiru, jud. Ilfov. Pâna la ridicarea cadavrului se 
          achita o taxa de 8,33 Lei / ora, T.V.A. inclus.
        </Text>

        <Text style={styles.text}>
          Prin semnarea acestui contract, va exprimati acordul ca firma S.C. Beelsamen Arte S.R.L. 
          sa furnizeze serviciile mai sus mentionate, iar dvs. va obligati sa achitati contravaloarea 
          serviciilor de constatare si de transport, în valoare de 739,00 Lei.
        </Text>

        {/* Secțiunea 3 */}
        <Text style={styles.sectionTitle}>3. CONTEXTUL EPIDEMIOLOGIC ACTUAL</Text>
        <Text style={styles.text}>
          În contextul actual dat de aparitia virusului SARS-COV-2, internarea unui nou beneficiar 
          sau revenirea acestuia în centru dupa ce acest a parasit centrul indiferent motivul (de natura 
          personala, medicala, urgenta medicala) sau durata pentru care o face, se poate realiza doar dupa 
          ce s-a facut dovada testarii PCR SARS COV2 , având rezultat negativ, cu maxim 48 de ore anterior 
          aducerii acestuia în centru.
        </Text>

        <Text style={styles.text}>
          În cazul în care nu se poate face aceasta testare, exista optiunea ca testarea sa se faca în 
          centrul nostru prin intermediul clinicilor partenere. Beneficiarul va sta izolat într-o camera fara a 
          interactiona cu restul beneficiarilor, din momentul sosirii acestuia pâna la primirea rezultatului 
          (24-48h în zile lucratoare). În cazul acesta va oferiti acordul pentru transmiterea datelor cu 
          caracter personal solicitate de catre clinica colaboratoare, în vederea testarii. În cazul primirii 
          unui rezultat pozitiv, conducerea este obligata sa anunte autoritatile si sa respecte protocolul 
          unitatii pâna la noi indicatii primite din parte acestora.
        </Text>

        <Text style={styles.text}>
          În cazul primirii unui rezultat negativ, beneficiarul va iesi din izolator, intrând în
        </Text>
      </Page>

      {/* PAGINA 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.text}>
          colectivitate alaturi de ceilalti rezidenti ai centrului.
        </Text>

        <Text style={styles.text}>
          Centrul nostru a luat toate masurile recomandate pentru limitarea raspândirii virusului 
          SARS COV - 2 si nu poate fi tras la raspundere în eventualitatea contactarii virusului de catre 
          beneficiar.
        </Text>

        {/* Secțiunea 4 */}
        <Text style={styles.sectionTitle}>4. STAREA DE SANATATE SI DECESUL BENEFICIARILOR CENTRULUI</Text>
        <Text style={styles.text}>
          În momentul internarii unui beneficiar, apartinatorului este obligat sa prezinte istoricul 
          medical al acestuia din care sa reiasa toate diagnosticele, alergiile, rostrictiile si recomandarile 
          medicale si schema de tratament.
        </Text>

        <Text style={styles.text}>
          Personalul centrului va tine cont de acestea în îngrijirea beneficiarului, precum si de 
          recomandarile medicale ulterioare. În eventualitatea degradarii starii de sanatate a beneficiarului 
          sau decesului acestuia, unitatea nu poate fi facuta raspunzatoare.
        </Text>

        {/* Semnături */}
        <PDFSignatures resident={resident} company={company} showStamp={true} />
      </Page>
    </Document>
  );
};
