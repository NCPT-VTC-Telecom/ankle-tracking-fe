export interface UnassignedSim {
  phoneNumber: string;
  carrier: string;
  iccid: string;
  status: string;
  signal: number;
  balance: number;
  dataUsed: number;
  dataLimit: number;
  expiryDays: number;
  networkDelay?: number;
  ipAddress?: string;
  cellTowerId?: string;
}

export const unassignedSims: UnassignedSim[] = [
  {
    phoneNumber: '+84912345678',
    carrier: 'Viettel',
    iccid: '8984041122334455667',
    status: 'ready',
    signal: 4,
    balance: 85000,
    dataUsed: 1.2,
    dataLimit: 5.0,
    expiryDays: 45,
    networkDelay: 35,
    ipAddress: '10.128.45.92',
    cellTowerId: '452-04-12948'
  },
  {
    phoneNumber: '+84987654321',
    carrier: 'Mobifone',
    iccid: '8984042233445566778',
    status: 'ready',
    signal: 3,
    balance: 12000, // low balance
    dataUsed: 4.8,  // low data
    dataLimit: 5.0,
    expiryDays: 12,
    networkDelay: 42,
    ipAddress: '10.82.112.4',
    cellTowerId: '452-01-38291'
  },
  {
    phoneNumber: '+84909998887',
    carrier: 'Vinaphone',
    iccid: '8984043344556677889',
    status: 'inactive',
    signal: 0,
    balance: 0,
    dataUsed: 0.0,
    dataLimit: 2.0,
    expiryDays: 0,
    networkDelay: 999,
    ipAddress: '0.0.0.0',
    cellTowerId: '—'
  }
];
