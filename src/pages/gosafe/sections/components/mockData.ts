export interface UnassignedSim {
  phoneNumber: string;
  carrier: string;
  iccid: string;
  status: string;
  signal: number;
}

export const unassignedSims: UnassignedSim[] = [
  { phoneNumber: '+84912345678', carrier: 'Viettel', iccid: '8984041122334455667', status: 'ready', signal: 4 },
  { phoneNumber: '+84987654321', carrier: 'Mobifone', iccid: '8984042233445566778', status: 'ready', signal: 3 },
  { phoneNumber: '+84909998887', carrier: 'Vinaphone', iccid: '8984043344556677889', status: 'inactive', signal: 0 },
];
