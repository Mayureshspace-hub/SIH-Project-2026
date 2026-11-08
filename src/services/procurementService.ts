/**
 * Procurement Centre Service
 * Handles data fetching, slot management, token generation, queue status,
 * procurement logging, and payment tracking scoped exclusively to the assigned centre.
 */

export interface CentreSlot {
  id: string;
  centreId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  status: 'AVAILABLE' | 'FULL' | 'CLOSED';
}

export interface CentreFarmer {
  id: string;
  name: string;
  farmerId: string;
  mobile: string;
  village: string;
  district: string;
  landArea: number;
  cropName: string;
  registeredDate: string;
  activeBookingsCount: number;
  latestBooking?: {
    id: string;
    tokenNumber: string;
    slotDate: string;
    slotTime: string;
    status: string;
    quantity: number;
  };
}

export interface CentreTokenEntry {
  id: string;
  bookingId: string;
  tokenNumber: string;
  farmerName: string;
  farmerId: string;
  mobile: string;
  cropName: string;
  quantity: number;
  slotDate: string;
  slotTime: string;
  status: 'BOOKED' | 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'NO_SHOW';
  estimatedWaitMinutes?: number;
  checkedInAt?: string;
}

export interface CentreProcurementRecord {
  id: string;
  bookingId: string;
  farmerName: string;
  farmerId: string;
  tokenNumber: string;
  cropName: string;
  deliveredQuantity: number;
  acceptedQuantity: number;
  ratePerQuintal: number;
  totalValuation: number;
  moisturePercentage: number;
  grade: string;
  date: string;
  status: 'APPROVED' | 'PENDING_WEIGHMENT' | 'REJECTED';
}

export interface CentrePaymentRecord {
  id: string;
  procurementId: string;
  farmerName: string;
  farmerId: string;
  tokenNumber: string;
  cropName: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID';
  bankName: string;
  accountEnding: string;
  transactionRef?: string;
  updatedAt: string;
}

export interface CentreOverviewStats {
  totalRegisteredFarmers: number;
  todayBookings: number;
  pendingProcurement: number;
  completedProcurement: number;
  pendingPaymentsCount: number;
  completedPaymentsCount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

// Initial realistic scoped dataset for Parseoni Centre
let mockSlots: CentreSlot[] = [
  { id: 'slt_01', centreId: 'ctr_parseoni', date: '2026-11-08', startTime: '09:00', endTime: '11:00', capacity: 15, booked: 12, status: 'AVAILABLE' },
  { id: 'slt_02', centreId: 'ctr_parseoni', date: '2026-11-08', startTime: '11:00', endTime: '13:00', capacity: 15, booked: 15, status: 'FULL' },
  { id: 'slt_03', centreId: 'ctr_parseoni', date: '2026-11-08', startTime: '13:30', endTime: '15:30', capacity: 15, booked: 8, status: 'AVAILABLE' },
  { id: 'slt_04', centreId: 'ctr_parseoni', date: '2026-11-08', startTime: '15:30', endTime: '17:30', capacity: 10, booked: 3, status: 'AVAILABLE' },
  { id: 'slt_05', centreId: 'ctr_parseoni', date: '2026-11-09', startTime: '09:00', endTime: '11:00', capacity: 15, booked: 6, status: 'AVAILABLE' },
  { id: 'slt_06', centreId: 'ctr_parseoni', date: '2026-11-09', startTime: '11:00', endTime: '13:00', capacity: 15, booked: 10, status: 'AVAILABLE' },
];

let mockFarmers: CentreFarmer[] = [
  {
    id: 'frm_01',
    name: 'Rajesh Patil',
    farmerId: 'MH-NAG-2026-0814',
    mobile: '+91 97631 88442',
    village: 'Sawangi, Parseoni',
    district: 'Nagpur',
    landArea: 6.5,
    cropName: 'Paddy (Dhan Grade-A)',
    registeredDate: '12 Oct 2026',
    activeBookingsCount: 1,
    latestBooking: {
      id: 'bkg_101',
      tokenNumber: 'PAR-027',
      slotDate: '2026-11-08',
      slotTime: '09:00 - 11:00',
      status: 'WAITING',
      quantity: 18,
    },
  },
  {
    id: 'frm_02',
    name: 'Suresh Deshmukh',
    farmerId: 'MH-NAG-2026-0815',
    mobile: '+91 97632 11223',
    village: 'Bramhapuri',
    district: 'Nagpur',
    landArea: 4.2,
    cropName: 'Soybean (JS-335)',
    registeredDate: '14 Oct 2026',
    activeBookingsCount: 1,
    latestBooking: {
      id: 'bkg_102',
      tokenNumber: 'PAR-028',
      slotDate: '2026-11-08',
      slotTime: '09:00 - 11:00',
      status: 'PROCESSING',
      quantity: 25,
    },
  },
  {
    id: 'frm_03',
    name: 'Sunita Gaikwad',
    farmerId: 'MH-NAG-2026-0816',
    mobile: '+91 97633 44556',
    village: 'Bori Buzurg',
    district: 'Nagpur',
    landArea: 8.0,
    cropName: 'Cotton (Medium Staple)',
    registeredDate: '18 Oct 2026',
    activeBookingsCount: 1,
    latestBooking: {
      id: 'bkg_103',
      tokenNumber: 'PAR-029',
      slotDate: '2026-11-08',
      slotTime: '11:00 - 13:00',
      status: 'BOOKED',
      quantity: 32,
    },
  },
  {
    id: 'frm_04',
    name: 'Ramesh Shinde',
    farmerId: 'MH-NAG-2026-0817',
    mobile: '+91 97634 77889',
    village: 'Ghatrohana',
    district: 'Nagpur',
    landArea: 5.5,
    cropName: 'Paddy (Dhan)',
    registeredDate: '22 Oct 2026',
    activeBookingsCount: 1,
    latestBooking: {
      id: 'bkg_104',
      tokenNumber: 'PAR-030',
      slotDate: '2026-11-08',
      slotTime: '11:00 - 13:00',
      status: 'BOOKED',
      quantity: 15,
    },
  },
  {
    id: 'frm_05',
    name: 'Vilasrao Kadam',
    farmerId: 'MH-NAG-2026-0818',
    mobile: '+91 97635 99001',
    village: 'Chorkhamara',
    district: 'Nagpur',
    landArea: 3.8,
    cropName: 'Bengal Gram (Chana)',
    registeredDate: '25 Oct 2026',
    activeBookingsCount: 0,
  },
  {
    id: 'frm_06',
    name: 'Prakash Waghmare',
    farmerId: 'MH-NAG-2026-0819',
    mobile: '+91 97636 12345',
    village: 'Kanhadgaon',
    district: 'Nagpur',
    landArea: 7.2,
    cropName: 'Paddy (Dhan Grade-A)',
    registeredDate: '29 Oct 2026',
    activeBookingsCount: 1,
    latestBooking: {
      id: 'bkg_105',
      tokenNumber: 'PAR-026',
      slotDate: '2026-11-08',
      slotTime: '09:00 - 11:00',
      status: 'COMPLETED',
      quantity: 22,
    },
  },
];

let mockTokens: CentreTokenEntry[] = [
  {
    id: 'tok_01',
    bookingId: 'bkg_105',
    tokenNumber: 'PAR-026',
    farmerName: 'Prakash Waghmare',
    farmerId: 'MH-NAG-2026-0819',
    mobile: '+91 97636 12345',
    cropName: 'Paddy (Dhan Grade-A)',
    quantity: 22,
    slotDate: '2026-11-08',
    slotTime: '09:00 - 11:00',
    status: 'COMPLETED',
    checkedInAt: '08:50 AM',
  },
  {
    id: 'tok_02',
    bookingId: 'bkg_102',
    tokenNumber: 'PAR-027',
    farmerName: 'Rajesh Patil',
    farmerId: 'MH-NAG-2026-0814',
    mobile: '+91 97631 88442',
    cropName: 'Paddy (Dhan Grade-A)',
    quantity: 18,
    slotDate: '2026-11-08',
    slotTime: '09:00 - 11:00',
    status: 'PROCESSING',
    estimatedWaitMinutes: 5,
    checkedInAt: '09:10 AM',
  },
  {
    id: 'tok_03',
    bookingId: 'bkg_101',
    tokenNumber: 'PAR-028',
    farmerName: 'Suresh Deshmukh',
    farmerId: 'MH-NAG-2026-0815',
    mobile: '+91 97632 11223',
    cropName: 'Soybean (JS-335)',
    quantity: 25,
    slotDate: '2026-11-08',
    slotTime: '09:00 - 11:00',
    status: 'WAITING',
    estimatedWaitMinutes: 20,
    checkedInAt: '09:25 AM',
  },
  {
    id: 'tok_04',
    bookingId: 'bkg_103',
    tokenNumber: 'PAR-029',
    farmerName: 'Sunita Gaikwad',
    farmerId: 'MH-NAG-2026-0816',
    mobile: '+91 97633 44556',
    cropName: 'Cotton',
    quantity: 32,
    slotDate: '2026-11-08',
    slotTime: '11:00 - 13:00',
    status: 'BOOKED',
    estimatedWaitMinutes: 45,
  },
  {
    id: 'tok_05',
    bookingId: 'bkg_104',
    tokenNumber: 'PAR-030',
    farmerName: 'Ramesh Shinde',
    farmerId: 'MH-NAG-2026-0817',
    mobile: '+91 97634 77889',
    cropName: 'Paddy (Dhan)',
    quantity: 15,
    slotDate: '2026-11-08',
    slotTime: '11:00 - 13:00',
    status: 'BOOKED',
    estimatedWaitMinutes: 65,
  },
];

let mockProcurements: CentreProcurementRecord[] = [
  {
    id: 'prc_01',
    bookingId: 'bkg_105',
    farmerName: 'Prakash Waghmare',
    farmerId: 'MH-NAG-2026-0819',
    tokenNumber: 'PAR-026',
    cropName: 'Paddy (Dhan Grade-A)',
    deliveredQuantity: 22,
    acceptedQuantity: 22,
    ratePerQuintal: 2320,
    totalValuation: 51040,
    moisturePercentage: 12.0,
    grade: 'A',
    date: '2026-11-08',
    status: 'APPROVED',
  },
  {
    id: 'prc_02',
    bookingId: 'bkg_102',
    farmerName: 'Rajesh Patil',
    farmerId: 'MH-NAG-2026-0814',
    tokenNumber: 'PAR-027',
    cropName: 'Paddy (Dhan Grade-A)',
    deliveredQuantity: 18,
    acceptedQuantity: 17.8,
    ratePerQuintal: 2320,
    totalValuation: 41296,
    moisturePercentage: 12.8,
    grade: 'A',
    date: '2026-11-08',
    status: 'APPROVED',
  },
];

let mockPayments: CentrePaymentRecord[] = [
  {
    id: 'pay_01',
    procurementId: 'prc_01',
    farmerName: 'Prakash Waghmare',
    farmerId: 'MH-NAG-2026-0819',
    tokenNumber: 'PAR-026',
    cropName: 'Paddy (Dhan Grade-A)',
    amount: 51040,
    status: 'PAID',
    bankName: 'State Bank of India',
    accountEnding: '4512',
    transactionRef: 'UTR-RBI-892104592',
    updatedAt: '2026-11-08 10:15 AM',
  },
  {
    id: 'pay_02',
    procurementId: 'prc_02',
    farmerName: 'Rajesh Patil',
    farmerId: 'MH-NAG-2026-0814',
    tokenNumber: 'PAR-027',
    cropName: 'Paddy (Dhan Grade-A)',
    amount: 41296,
    status: 'PROCESSING',
    bankName: 'Bank of Maharashtra',
    accountEnding: '9821',
    transactionRef: 'DBT-MH-PFMS-881290',
    updatedAt: '2026-11-08 10:45 AM',
  },
  {
    id: 'pay_03',
    procurementId: 'prc_03_sample',
    farmerName: 'Suresh Deshmukh',
    farmerId: 'MH-NAG-2026-0815',
    tokenNumber: 'PAR-028',
    cropName: 'Soybean (JS-335)',
    amount: 122250,
    status: 'PENDING',
    bankName: 'HDFC Bank',
    accountEnding: '3341',
    updatedAt: '2026-11-08 09:30 AM',
  },
];

export const procurementService = {
  // Overview
  async getOverviewStats(centreId = 'ctr_parseoni'): Promise<CentreOverviewStats> {
    const today = '2026-11-08';
    const todayBookingsCount = mockTokens.filter((t) => t.slotDate === today).length;
    const pendingProc = mockTokens.filter((t) => t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'PROCESSING').length;
    const completedProc = mockProcurements.length;

    const pendingPayments = mockPayments.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING');
    const completedPayments = mockPayments.filter((p) => p.status === 'PAID');

    return {
      totalRegisteredFarmers: mockFarmers.length,
      todayBookings: todayBookingsCount,
      pendingProcurement: pendingProc,
      completedProcurement: completedProc,
      pendingPaymentsCount: pendingPayments.length,
      completedPaymentsCount: completedPayments.length,
      totalPaidAmount: completedPayments.reduce((acc, curr) => acc + curr.amount, 0),
      totalPendingAmount: pendingPayments.reduce((acc, curr) => acc + curr.amount, 0),
    };
  },

  // Farmers
  async getFarmers(): Promise<CentreFarmer[]> {
    return [...mockFarmers];
  },

  async getFarmerDetails(farmerId: string): Promise<CentreFarmer | undefined> {
    return mockFarmers.find((f) => f.id === farmerId || f.farmerId === farmerId);
  },

  // Slots
  async getSlots(): Promise<CentreSlot[]> {
    return [...mockSlots];
  },

  async addSlot(slot: Omit<CentreSlot, 'id' | 'booked'>): Promise<CentreSlot> {
    const newSlot: CentreSlot = {
      ...slot,
      id: `slt_${Date.now()}`,
      booked: 0,
    };
    mockSlots.unshift(newSlot);
    return newSlot;
  },

  async updateSlotStatus(slotId: string, status: 'AVAILABLE' | 'FULL' | 'CLOSED'): Promise<void> {
    const s = mockSlots.find((item) => item.id === slotId);
    if (s) {
      s.status = status;
    }
  },

  async rescheduleBooking(bookingId: string, newSlotDate: string, newSlotTime: string): Promise<void> {
    const token = mockTokens.find((t) => t.bookingId === bookingId || t.id === bookingId);
    if (token) {
      token.slotDate = newSlotDate;
      token.slotTime = newSlotTime;
    }
    const farmer = mockFarmers.find((f) => f.latestBooking?.id === bookingId);
    if (farmer && farmer.latestBooking) {
      farmer.latestBooking.slotDate = newSlotDate;
      farmer.latestBooking.slotTime = newSlotTime;
      farmer.latestBooking.status = 'BOOKED';
    }
  },

  // Tokens & Queue
  async getTokens(): Promise<CentreTokenEntry[]> {
    return [...mockTokens];
  },

  async generateToken(data: {
    farmerName: string;
    farmerId: string;
    mobile: string;
    cropName: string;
    quantity: number;
    slotDate: string;
    slotTime: string;
  }): Promise<CentreTokenEntry> {
    const nextNum = mockTokens.length + 27;
    const tokenNumber = `PAR-${String(nextNum).padStart(3, '0')}`;
    const newEntry: CentreTokenEntry = {
      id: `tok_${Date.now()}`,
      bookingId: `bkg_${Date.now()}`,
      tokenNumber,
      farmerName: data.farmerName,
      farmerId: data.farmerId,
      mobile: data.mobile,
      cropName: data.cropName,
      quantity: data.quantity,
      slotDate: data.slotDate,
      slotTime: data.slotTime,
      status: 'BOOKED',
      estimatedWaitMinutes: 30,
    };
    mockTokens.push(newEntry);
    return newEntry;
  },

  async updateTokenStatus(tokenId: string, status: CentreTokenEntry['status']): Promise<void> {
    const entry = mockTokens.find((t) => t.id === tokenId || t.tokenNumber === tokenId);
    if (entry) {
      entry.status = status;
      if (status === 'WAITING' && !entry.checkedInAt) {
        entry.checkedInAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // Sync farmer record
      const farmer = mockFarmers.find((f) => f.name === entry.farmerName);
      if (farmer && farmer.latestBooking) {
        farmer.latestBooking.status = status;
      }
    }
  },

  // Procurement Records
  async getProcurementRecords(): Promise<CentreProcurementRecord[]> {
    return [...mockProcurements];
  },

  async createProcurementRecord(record: {
    bookingId: string;
    tokenNumber: string;
    farmerName: string;
    farmerId: string;
    cropName: string;
    deliveredQuantity: number;
    acceptedQuantity: number;
    ratePerQuintal: number;
    moisturePercentage: number;
    grade: string;
  }): Promise<CentreProcurementRecord> {
    const totalValuation = Math.round(record.acceptedQuantity * record.ratePerQuintal);
    const newRecord: CentreProcurementRecord = {
      id: `prc_${Date.now()}`,
      ...record,
      totalValuation,
      date: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
    };
    mockProcurements.unshift(newRecord);

    // Update token to COMPLETED
    const token = mockTokens.find((t) => t.tokenNumber === record.tokenNumber);
    if (token) {
      token.status = 'COMPLETED';
    }

    // Automatically create a corresponding payment tracking entry in PENDING status
    const newPayment: CentrePaymentRecord = {
      id: `pay_${Date.now()}`,
      procurementId: newRecord.id,
      farmerName: record.farmerName,
      farmerId: record.farmerId,
      tokenNumber: record.tokenNumber,
      cropName: record.cropName,
      amount: totalValuation,
      status: 'PENDING',
      bankName: 'State Bank of India',
      accountEnding: '****',
      updatedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    mockPayments.unshift(newPayment);

    return newRecord;
  },

  // Payment Tracking
  async getPaymentRecords(): Promise<CentrePaymentRecord[]> {
    return [...mockPayments];
  },

  async updatePaymentStatus(paymentId: string, status: 'PENDING' | 'PROCESSING' | 'PAID'): Promise<void> {
    const payment = mockPayments.find((p) => p.id === paymentId);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (status === 'PROCESSING' && !payment.transactionRef) {
        payment.transactionRef = `DBT-MH-PFMS-${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (status === 'PAID' && (!payment.transactionRef || payment.transactionRef.startsWith('DBT'))) {
        payment.transactionRef = `UTR-RBI-${Math.floor(100000000 + Math.random() * 900000000)}`;
      }
    }
  },
};
