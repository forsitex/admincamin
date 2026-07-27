// Date camere extrase din fisierele DISTRIBUIRE PE CAMERE CAMINE
// Capacitate = nr max rezidentii din docx (poate fi editata ulterior)

export interface RoomData {
  roomNumber: string;
  capacity: number;
  floor: string;
  isIsolator?: boolean;
}

export const ROOMS_BY_LOCATION: Record<string, RoomData[]> = {
  cetinei: [
    { roomNumber: '1', capacity: 3, floor: 'Parter' },
    { roomNumber: '2', capacity: 2, floor: 'Parter' },
    { roomNumber: '3', capacity: 3, floor: 'Parter' },
    { roomNumber: '4', capacity: 3, floor: 'Parter' },
    { roomNumber: '5', capacity: 3, floor: 'Parter' },
    { roomNumber: '6', capacity: 3, floor: 'Parter' },
    { roomNumber: '7', capacity: 3, floor: 'Parter' },
    { roomNumber: '8', capacity: 3, floor: 'Parter' },
    { roomNumber: '9', capacity: 3, floor: 'Parter' },
    { roomNumber: '10', capacity: 3, floor: 'Parter' },
    { roomNumber: '11', capacity: 3, floor: 'Parter' },
    { roomNumber: '12', capacity: 3, floor: 'Parter' },
    { roomNumber: '13', capacity: 2, floor: 'Parter', isIsolator: true },
  ],
  orhideelor: [
    { roomNumber: '1', capacity: 4, floor: 'Parter' },
    { roomNumber: '2', capacity: 3, floor: 'Parter' },
    { roomNumber: '3', capacity: 3, floor: 'Parter' },
    { roomNumber: '4', capacity: 3, floor: 'Parter' },
    { roomNumber: '5', capacity: 3, floor: 'Parter' },
    { roomNumber: '6', capacity: 3, floor: 'Parter' },
    { roomNumber: '7', capacity: 3, floor: 'Parter' },
    { roomNumber: '8', capacity: 3, floor: 'Parter' },
    { roomNumber: '9', capacity: 6, floor: 'Parter' },
  ],
  fortunei: [
    { roomNumber: '1', capacity: 3, floor: 'Parter' },
    { roomNumber: '2', capacity: 2, floor: 'Parter' },
    { roomNumber: '3', capacity: 5, floor: 'Parter' },
    { roomNumber: '4', capacity: 4, floor: 'Parter' },
    { roomNumber: '5', capacity: 3, floor: 'Parter' },
    { roomNumber: '6', capacity: 4, floor: 'Parter' },
    { roomNumber: '7', capacity: 5, floor: 'Parter' },
    { roomNumber: '8', capacity: 4, floor: 'Parter' },
    { roomNumber: '9', capacity: 3, floor: 'Parter' },
    { roomNumber: '10', capacity: 5, floor: 'Parter' },
    { roomNumber: '11', capacity: 4, floor: 'Parter' },
  ],
  clinceni: [
    { roomNumber: '1', capacity: 3, floor: 'Parter' },
    { roomNumber: '2', capacity: 3, floor: 'Parter' },
    { roomNumber: '3', capacity: 3, floor: 'Parter' },
    { roomNumber: '4', capacity: 2, floor: 'Parter' },
    { roomNumber: '5', capacity: 3, floor: 'Parter' },
    { roomNumber: '6', capacity: 4, floor: 'Parter' },
    { roomNumber: '7', capacity: 3, floor: 'Parter' },
    { roomNumber: '8', capacity: 3, floor: 'Parter' },
    { roomNumber: '9', capacity: 3, floor: 'Parter' },
    { roomNumber: '10', capacity: 3, floor: 'Parter' },
    { roomNumber: '11', capacity: 2, floor: 'Parter' },
    { roomNumber: '12', capacity: 3, floor: 'Parter' },
    { roomNumber: '13', capacity: 3, floor: 'Parter' },
    { roomNumber: '14', capacity: 6, floor: 'Parter' },
  ],
};
