// Distributia rezidentilor pe camere pentru CETINEI (extras din docx)
// Format: { roomNumber: [nume rezidentii] }

export const CETINEI_DISTRIBUTION: Record<string, string[]> = {
  '1': ['Ene Rodica', 'Ene Marian'],
  '2': ['Vasile Teodor'],
  '3': ['Mușat Andrei', 'Dudea Constantin', 'Șandru Ion'],
  '4': ['Bițianu Costică', 'Capdefier Constantin'],
  '5': ['Bucur Maria', 'Văduva Maria', 'Lungan Hortenzia'],
  '6': ['Nenciu Ion', 'Neagoe Gheorghe', 'Pitorac Ilie'],
  '7': ['Ștefan Victoria', 'Răsniceru Ioana', 'Marian Ana-Maria'],
  '8': ['Gârea Maria', 'Bănică Floarea', 'Lău Ana'],
  '9': ['Popa Vasilina', 'Neagu Elena'],
  '10': ['Ghebaru Ion', 'Soare Stelian'],
  '11': ['Tudor Maria', 'Voicu Mărioara'],
  '12': ['Șuță Ioana', 'Cocoșilă Paraschiva', 'Stamate-Sichiori Constanța'],
  '13': ['IZOLATOR'],
};

export const ORHIDEELOR_DISTRIBUTION: Record<string, string[]> = {
  '1': ['Preduța Doru', 'Onija Ionel', 'Zota Neagu', 'Cițu Corneliu'],
  '2': ['Badea Otilia', 'Vultur Emilia', 'Iacob Elena'],
  '3': ['Radu Ion', 'Roman Dan-Cristian', 'Șotîrnel I0n'],
  '4': ['Stefănescu Constantin', 'Trupină Florea'],
  '5': ['Goga Aurel', 'Mihai Radu', 'Vîlcea Ion'],
  '6': ['Istrate Ghiorghița', 'Pârvu Lina', 'Niculae Maria'],
  '7': ['Perianu Ortansa', 'Darie Maria'],
  '8': ['Gologan Doina', 'Enescu Stanca Ileana', 'Cimbrescu Maria'],
  '9': ['Dumitru Victoria', 'Rădulescu Mariea', 'Costea Maria', 'Corniciuc Teodor'],
};

export const FORTUNEI_DISTRIBUTION: Record<string, string[]> = {
  '1': ['Bîrsăneanu Elena', 'Bojin Maria'],
  '2': ['Grigore Victoria'],
  '3': ['Munteanu Florin', 'Manolache Petre', 'Cojocaru Ion', 'Lăcatuș Dorin', 'Petre Dumitru'],
  '4': ['Turoi Irina', 'Mihai Elena', 'Canavea Elena'],
  '5': ['Tănăsescu Georgeta', 'Barbu Floarea'],
  '6': ['State Stana', 'Vătăjelu Mariana', 'Constantin Lucia', 'Calinescu Doina'],
  '7': ['Sipică Stănel', 'Mocănașu Vasile', 'Sipică Marian', 'Rizea Gheorghe', 'Stancu Anton'],
  '8': ['Chivu Niculina', 'Costache Florica', 'Ioniță Lenuța', 'Sima Sofica'],
  '9': ['Drăghici Maria', 'Bățăuș Elena'],
  '10': ['Pleniceanu Elena', 'Florea Eugenia', 'Nedelcu Valeria', 'Băltăreț Mariea'],
  '11': ['Veleat Elena', 'Banu Maria', 'Radian Daniel Traian'],
};

export const CLINCENI_DISTRIBUTION: Record<string, string[]> = {
  '1': ['Misăilă Jana', 'Bodea Elisabeta'],
  '2': ['Dumitrescu Maria', 'Chaborski Florea'],
  '3': ['Spătaru Ana', 'Butnaru Alexandrina', 'Nentu Maria'],
  '4': ['Oilă Nicoleta'],
  '5': ['Palangă Florea', 'Coman Cecilian'],
  '6': ['Tălpuș Luciana', 'Crângașu Ancuța', 'Mocanu Iuliana'],
  '7': ['Păun Ilinca', 'Bratu Floarea', 'Diacencu Livia'],
  '8': ['Negru Petra', 'Novac Maria', 'Dubină Iuliana'],
  '9': ['Măceșanu Tudora', 'Mihai Maria'],
  '10': ['Mărăscu Draguța', 'Parmac Vișa'],
  '11': ['Palangă Elena'],
  '12': ['Coman Aneta', 'Blada Elvira'],
  '13': ['Stoicescu Paul', 'Craifoleanu Andrei', 'Roșu Cornel'],
  '14': ['Moraru Gheorghe', 'Niculescu Iordache', 'Cutieru Ivan', 'Gorici Traian', 'Costache Florica'],
};

export const DISTRIBUTION_BY_LOCATION: Record<string, Record<string, string[]>> = {
  cetinei: CETINEI_DISTRIBUTION,
  orhideelor: ORHIDEELOR_DISTRIBUTION,
  fortunei: FORTUNEI_DISTRIBUTION,
  clinceni: CLINCENI_DISTRIBUTION,
};
