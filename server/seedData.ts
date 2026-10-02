import bcrypt from 'bcryptjs';
import {
  User,
  Farmer,
  Operator,
  ProcurementCentre,
  Crop,
  CentreCrop,
  Slot,
  Booking,
  QueueEntry,
  ProcurementRecord,
  Payment,
  Notification
} from './types';

export function getInitialSeedData() {
  const adminHash = bcrypt.hashSync('Admin@123', 8);
  const operatorHash = bcrypt.hashSync('Operator@123', 8);
  const farmerHash = bcrypt.hashSync('Farmer@123', 8);

  const users: User[] = [
    {
      id: 'usr_admin',
      name: 'Dr. Anand Verma (Director APMC)',
      email: 'admin@demo.kisansetu',
      mobile: '+91 98230 11223',
      passwordHash: adminHash,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_op_parseoni',
      name: 'Vikas Deshpande (Chief Registrar)',
      email: 'operator@parseoni.demo',
      mobile: '+91 98501 23456',
      passwordHash: operatorHash,
      role: 'OPERATOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_op_ramtek',
      name: 'Sanjay Thakre',
      email: 'operator@ramtek.demo',
      mobile: '+91 98502 34567',
      passwordHash: operatorHash,
      role: 'OPERATOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_op_nagpur',
      name: 'Mahesh Kulkarni',
      email: 'operator@nagpur.demo',
      mobile: '+91 98503 45678',
      passwordHash: operatorHash,
      role: 'OPERATOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_farmer_rajesh',
      name: 'Rajesh Patil',
      email: 'farmer@demo.com',
      mobile: '+91 97631 88442',
      passwordHash: farmerHash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_farmer_suresh',
      name: 'Suresh Deshmukh',
      email: 'suresh.deshmukh@demo.com',
      mobile: '+91 97632 11223',
      passwordHash: farmerHash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_farmer_sunita',
      name: 'Sunita Gaikwad',
      email: 'sunita.gaikwad@demo.com',
      mobile: '+91 97633 44556',
      passwordHash: farmerHash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_farmer_ramesh',
      name: 'Ramesh Shinde',
      email: 'ramesh.shinde@demo.com',
      mobile: '+91 97634 77889',
      passwordHash: farmerHash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_farmer_vilas',
      name: 'Vilasrao Kadam',
      email: 'vilas.kadam@demo.com',
      mobile: '+91 97635 99001',
      passwordHash: farmerHash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_farmer_prakash',
      name: 'Prakash Waghmare',
      email: 'prakash.w@demo.com',
      mobile: '+91 97636 12345',
      passwordHash: farmerHash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_farmer_ganesh',
      name: 'Ganesh Wankhede',
      email: 'ganesh.w@demo.com',
      mobile: '+91 97637 67890',
      passwordHash: farmerHash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const farmers: Farmer[] = [
    {
      id: 'frm_rajesh',
      userId: 'usr_farmer_rajesh',
      farmerId: 'MH-NAG-2026-0814',
      village: 'Sawangi, Parseoni',
      district: 'Nagpur',
      landArea: 6.5,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'frm_suresh',
      userId: 'usr_farmer_suresh',
      farmerId: 'MH-NAG-2026-0815',
      village: 'Bramhapuri',
      district: 'Nagpur',
      landArea: 4.2,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'frm_sunita',
      userId: 'usr_farmer_sunita',
      farmerId: 'MH-NAG-2026-0816',
      village: 'Bori Buzurg',
      district: 'Nagpur',
      landArea: 8.0,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'frm_ramesh',
      userId: 'usr_farmer_ramesh',
      farmerId: 'MH-NAG-2026-0817',
      village: 'Ghatrohana',
      district: 'Nagpur',
      landArea: 5.5,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'frm_vilas',
      userId: 'usr_farmer_vilas',
      farmerId: 'MH-NAG-2026-0818',
      village: 'Chorkhamara',
      district: 'Nagpur',
      landArea: 3.8,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'frm_prakash',
      userId: 'usr_farmer_prakash',
      farmerId: 'MH-NAG-2026-0819',
      village: 'Kanhadgaon',
      district: 'Nagpur',
      landArea: 7.2,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'frm_ganesh',
      userId: 'usr_farmer_ganesh',
      farmerId: 'MH-NAG-2026-0820',
      village: 'Singori',
      district: 'Nagpur',
      landArea: 5.0,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    },
  ];

  const centres: ProcurementCentre[] = [
    {
      id: 'ctr_parseoni',
      name: 'Parseoni Procurement Centre',
      location: 'APMC Yard, Parseoni Tehsil',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441105',
      latitude: 21.3789,
      longitude: 79.1624,
      workingStart: '09:00',
      workingEnd: '17:00',
      dailyCapacity: 45,
      averageProcessingMinutes: 10,
      quantityProcessingFactor: 1.1, // 1.1 minutes per quintal
      gracePeriodMinutes: 30,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr_ramtek',
      name: 'APMC Ramtek',
      location: 'Station Road, Mansar By-pass, Ramtek',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441106',
      latitude: 21.3962,
      longitude: 79.3284,
      workingStart: '09:00',
      workingEnd: '17:00',
      dailyCapacity: 50,
      averageProcessingMinutes: 12,
      quantityProcessingFactor: 1.2,
      gracePeriodMinutes: 30,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr_kalamna',
      name: 'APMC Nagpur / Kalamna Market Yard',
      location: 'Kalamna Grain Market, Kamptee Road, Nagpur',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '440026',
      latitude: 21.1702,
      longitude: 79.1384,
      workingStart: '08:30',
      workingEnd: '18:00',
      dailyCapacity: 80,
      averageProcessingMinutes: 8,
      quantityProcessingFactor: 0.9,
      gracePeriodMinutes: 30,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr_krishi_seva',
      name: 'Krishi Seva Kendra Nagpur',
      location: 'Wardha Road Sub-centre, Butibori, Nagpur',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441108',
      latitude: 21.0125,
      longitude: 79.0345,
      workingStart: '09:00',
      workingEnd: '16:30',
      dailyCapacity: 35,
      averageProcessingMinutes: 11,
      quantityProcessingFactor: 1.0,
      gracePeriodMinutes: 20,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr_icar_panjari',
      name: 'ICAR Panjari Farm Centre',
      location: 'Panjari Farm Campus, Wardha Road',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441108',
      latitude: 21.0543,
      longitude: 79.0521,
      workingStart: '09:30',
      workingEnd: '16:00',
      dailyCapacity: 30,
      averageProcessingMinutes: 14,
      quantityProcessingFactor: 1.3,
      gracePeriodMinutes: 30,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr_krishi_kranti',
      name: 'Krishi Kranti Kendra Hingna',
      location: 'MIDC Phase 2, Hingna Road, Nagpur',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '440028',
      latitude: 21.0945,
      longitude: 78.9832,
      workingStart: '09:00',
      workingEnd: '17:00',
      dailyCapacity: 40,
      averageProcessingMinutes: 10,
      quantityProcessingFactor: 1.0,
      gracePeriodMinutes: 25,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr_nashik',
      name: 'Nashik Taluka Agriculture Office',
      location: 'Govt Agri Complex, Dindori Naka, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422003',
      latitude: 20.0112,
      longitude: 73.7909,
      workingStart: '09:00',
      workingEnd: '17:00',
      dailyCapacity: 60,
      averageProcessingMinutes: 10,
      quantityProcessingFactor: 1.1,
      gracePeriodMinutes: 30,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr_aurangabad',
      name: 'Uchatam Krushi Utpann Bazar Samiti',
      location: 'Jalna Road Market Yard, Chhatrapati Sambhajinagar',
      district: 'Chhatrapati Sambhajinagar',
      state: 'Maharashtra',
      pincode: '431001',
      latitude: 19.8762,
      longitude: 75.3433,
      workingStart: '09:00',
      workingEnd: '17:00',
      dailyCapacity: 50,
      averageProcessingMinutes: 11,
      quantityProcessingFactor: 1.2,
      gracePeriodMinutes: 30,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const operators: Operator[] = [
    {
      id: 'op_parseoni',
      userId: 'usr_op_parseoni',
      centreId: 'ctr_parseoni',
      badgeNo: 'REG-PRS-001',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'op_ramtek',
      userId: 'usr_op_ramtek',
      centreId: 'ctr_ramtek',
      badgeNo: 'REG-RMK-002',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'op_nagpur',
      userId: 'usr_op_nagpur',
      centreId: 'ctr_kalamna',
      badgeNo: 'REG-KLM-003',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const crops: Crop[] = [
    {
      id: 'crop_paddy',
      name: 'Paddy',
      category: 'Cereal',
      unit: 'quintals',
      description: 'Grade-A and Common Kharif/Rabi paddy varieties.',
      indicativeMsp: 2300,
    },
    {
      id: 'crop_wheat',
      name: 'Wheat',
      category: 'Cereal',
      unit: 'quintals',
      description: 'Standard milling & lokwan wheat varieties.',
      indicativeMsp: 2275,
    },
    {
      id: 'crop_soybean',
      name: 'Soybean',
      category: 'Oilseed',
      unit: 'quintals',
      description: 'Yellow seed oil grade soybean with low moisture content.',
      indicativeMsp: 4892,
    },
    {
      id: 'crop_cotton',
      name: 'Cotton',
      category: 'Commercial',
      unit: 'quintals',
      description: 'Medium & Long Staple raw unginned seed cotton (Kapas).',
      indicativeMsp: 7121,
    },
    {
      id: 'crop_gram',
      name: 'Bengal Gram (Chana)',
      category: 'Pulses',
      unit: 'quintals',
      description: 'Desi and Kabuli chickpea varieties.',
      indicativeMsp: 5440,
    },
    {
      id: 'crop_pigeon_pea',
      name: 'Pigeon Pea (Tur)',
      category: 'Pulses',
      unit: 'quintals',
      description: 'Red and white tur dal pulse produce.',
      indicativeMsp: 7550,
    },
  ];

  const centreCrops: CentreCrop[] = [
    // Parseoni accepts Paddy & Soybean
    { id: 'cc_1', centreId: 'ctr_parseoni', cropId: 'crop_paddy', active: true },
    { id: 'cc_2', centreId: 'ctr_parseoni', cropId: 'crop_soybean', active: true },
    // Ramtek accepts Paddy & Bengal Gram
    { id: 'cc_3', centreId: 'ctr_ramtek', cropId: 'crop_paddy', active: true },
    { id: 'cc_4', centreId: 'ctr_ramtek', cropId: 'crop_gram', active: true },
    // Kalamna accepts Paddy, Soybean, Pigeon Pea, Cotton
    { id: 'cc_5', centreId: 'ctr_kalamna', cropId: 'crop_paddy', active: true },
    { id: 'cc_6', centreId: 'ctr_kalamna', cropId: 'crop_soybean', active: true },
    { id: 'cc_7', centreId: 'ctr_kalamna', cropId: 'crop_pigeon_pea', active: true },
    { id: 'cc_8', centreId: 'ctr_kalamna', cropId: 'crop_cotton', active: true },
    // Krishi Seva Kendra Nagpur
    { id: 'cc_9', centreId: 'ctr_krishi_seva', cropId: 'crop_wheat', active: true },
    { id: 'cc_10', centreId: 'ctr_krishi_seva', cropId: 'crop_gram', active: true },
    { id: 'cc_11', centreId: 'ctr_krishi_seva', cropId: 'crop_soybean', active: true },
    // ICAR Panjari
    { id: 'cc_12', centreId: 'ctr_icar_panjari', cropId: 'crop_soybean', active: true },
    { id: 'cc_13', centreId: 'ctr_icar_panjari', cropId: 'crop_cotton', active: true },
    { id: 'cc_14', centreId: 'ctr_icar_panjari', cropId: 'crop_wheat', active: true },
    // Krishi Kranti Hingna
    { id: 'cc_15', centreId: 'ctr_krishi_kranti', cropId: 'crop_cotton', active: true },
    { id: 'cc_16', centreId: 'ctr_krishi_kranti', cropId: 'crop_soybean', active: true },
    // Nashik
    { id: 'cc_17', centreId: 'ctr_nashik', cropId: 'crop_wheat', active: true },
    { id: 'cc_18', centreId: 'ctr_nashik', cropId: 'crop_gram', active: true },
    { id: 'cc_19', centreId: 'ctr_nashik', cropId: 'crop_pigeon_pea', active: true },
    // Aurangabad
    { id: 'cc_20', centreId: 'ctr_aurangabad', cropId: 'crop_cotton', active: true },
    { id: 'cc_21', centreId: 'ctr_aurangabad', cropId: 'crop_soybean', active: true },
    { id: 'cc_22', centreId: 'ctr_aurangabad', cropId: 'crop_gram', active: true },
  ];

  // Helper date strings
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const slots: Slot[] = [];
  const slotTimes = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
  ];

  let slotIdx = 1;
  for (const ctr of centres) {
    for (const d of [today, tomorrow, dayAfter]) {
      for (const t of slotTimes) {
        let booked = 0;
        let status: 'AVAILABLE' | 'FULL' | 'CLOSED' = 'AVAILABLE';
        
        // Setup realistic booking counts for Parseoni today
        if (ctr.id === 'ctr_parseoni' && d === today) {
          if (t.start === '09:00') { booked = 8; status = 'AVAILABLE'; }
          else if (t.start === '10:00') { booked = 10; status = 'FULL'; }
          else if (t.start === '11:00') { booked = 7; status = 'AVAILABLE'; }
          else if (t.start === '12:00') { booked = 4; status = 'AVAILABLE'; }
          else { booked = 2; status = 'AVAILABLE'; }
        } else {
          booked = Math.floor(Math.random() * 5);
        }

        slots.push({
          id: `slt_${slotIdx++}`,
          centreId: ctr.id,
          date: d,
          startTime: t.start,
          endTime: t.end,
          capacity: 10,
          booked,
          status,
        });
      }
    }
  }

  // Parseoni slot for 11:00 today
  const parseoni11Slot = slots.find(
    (s) => s.centreId === 'ctr_parseoni' && s.date === today && s.startTime === '11:00'
  ) || slots[2];

  const parseoni09Slot = slots.find(
    (s) => s.centreId === 'ctr_parseoni' && s.date === today && s.startTime === '09:00'
  ) || slots[0];

  const parseoni10Slot = slots.find(
    (s) => s.centreId === 'ctr_parseoni' && s.date === today && s.startTime === '10:00'
  ) || slots[1];

  const bookings: Booking[] = [
    // Completed early morning farmers at Parseoni
    {
      id: 'bk_021',
      bookingId: `BK-${today.replace(/-/g, '')}-0021`,
      farmerId: 'frm_suresh',
      centreId: 'ctr_parseoni',
      slotId: parseoni09Slot.id,
      cropId: 'crop_paddy',
      quantity: 14,
      tokenNumber: 'PAR-021',
      status: 'COMPLETED',
      bookedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      checkedInAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      calledAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
      processingStartedAt: new Date(Date.now() - 3600000 * 2.7).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 2.2).toISOString(),
    },
    {
      id: 'bk_022',
      bookingId: `BK-${today.replace(/-/g, '')}-0022`,
      farmerId: 'frm_sunita',
      centreId: 'ctr_parseoni',
      slotId: parseoni09Slot.id,
      cropId: 'crop_paddy',
      quantity: 20,
      tokenNumber: 'PAR-022',
      status: 'COMPLETED',
      bookedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
      checkedInAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      calledAt: new Date(Date.now() - 3600000 * 2.1).toISOString(),
      processingStartedAt: new Date(Date.now() - 3600000 * 2.0).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    },
    {
      id: 'bk_023',
      bookingId: `BK-${today.replace(/-/g, '')}-0023`,
      farmerId: 'frm_ramesh',
      centreId: 'ctr_parseoni',
      slotId: parseoni10Slot.id,
      cropId: 'crop_paddy',
      quantity: 12,
      tokenNumber: 'PAR-023',
      status: 'COMPLETED',
      bookedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      checkedInAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      calledAt: new Date(Date.now() - 3600000 * 1.3).toISOString(),
      processingStartedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 0.7).toISOString(),
    },

    // Past completed booking for Rajesh Patil (to demonstrate historical completed procurement & payment)
    {
      id: 'bk_rajesh_past',
      bookingId: 'BK-20260820-0012',
      farmerId: 'frm_rajesh',
      centreId: 'ctr_parseoni',
      slotId: parseoni09Slot.id,
      cropId: 'crop_soybean',
      quantity: 22,
      tokenNumber: 'PAR-012',
      status: 'COMPLETED',
      bookedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      checkedInAt: new Date(Date.now() - 86400000 * 14 + 3600000).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 14 + 7200000).toISOString(),
    },
  ];

  const queueEntries: QueueEntry[] = [];

  const procurements: ProcurementRecord[] = [
    {
      id: 'prc_021',
      bookingId: 'bk_021',
      farmerId: 'frm_suresh',
      centreId: 'ctr_parseoni',
      cropId: 'crop_paddy',
      deliveredQuantity: 14.2,
      acceptedQuantity: 14.0,
      qualityGrade: 'Grade A (FAQ)',
      finalRate: 2320,
      totalAmount: 32480,
      status: 'VERIFIED',
      procurementDate: new Date(Date.now() - 3600000 * 2.2).toISOString(),
    },
    {
      id: 'prc_022',
      bookingId: 'bk_022',
      farmerId: 'frm_sunita',
      centreId: 'ctr_parseoni',
      cropId: 'crop_paddy',
      deliveredQuantity: 20.0,
      acceptedQuantity: 19.5,
      qualityGrade: 'Grade A',
      finalRate: 2300,
      totalAmount: 44850,
      status: 'VERIFIED',
      procurementDate: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    },
    {
      id: 'prc_023',
      bookingId: 'bk_023',
      farmerId: 'frm_ramesh',
      centreId: 'ctr_parseoni',
      cropId: 'crop_paddy',
      deliveredQuantity: 12.0,
      acceptedQuantity: 12.0,
      qualityGrade: 'Grade B',
      finalRate: 2280,
      totalAmount: 27360,
      status: 'VERIFIED',
      procurementDate: new Date(Date.now() - 3600000 * 0.7).toISOString(),
    },
    // Past procurement record for Rajesh Patil
    {
      id: 'prc_rajesh_past',
      bookingId: 'bk_rajesh_past',
      farmerId: 'frm_rajesh',
      centreId: 'ctr_parseoni',
      cropId: 'crop_soybean',
      deliveredQuantity: 22.5,
      acceptedQuantity: 22.0,
      qualityGrade: 'Grade A Oilseed',
      finalRate: 4900,
      totalAmount: 107800,
      status: 'VERIFIED',
      procurementDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
  ];

  const payments: Payment[] = [
    // Completed payment for early morning farmer Suresh
    {
      id: 'pay_021',
      procurementId: 'prc_021',
      farmerId: 'frm_suresh',
      amount: 32480,
      paymentMethod: 'DBT Direct Bank Transfer',
      transactionId: 'DBT-2026-NAG-98842',
      status: 'COMPLETED',
      finalizedAt: new Date(Date.now() - 3600000 * 2.0).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    },
    // Payment ON THE WAY for Sunita
    {
      id: 'pay_022',
      procurementId: 'prc_022',
      farmerId: 'frm_sunita',
      amount: 44850,
      paymentMethod: 'DBT Direct Bank Transfer',
      transactionId: 'DBT-2026-NAG-98910',
      status: 'ON_THE_WAY',
      finalizedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    },
    // Payment NOT FINALIZED for Ramesh (just procured)
    {
      id: 'pay_023',
      procurementId: 'prc_023',
      farmerId: 'frm_ramesh',
      amount: 27360,
      status: 'NOT_FINALIZED',
    },
    // Completed historical payment for Rajesh Patil
    {
      id: 'pay_rajesh_past',
      procurementId: 'prc_rajesh_past',
      farmerId: 'frm_rajesh',
      amount: 107800,
      paymentMethod: 'DBT Direct Bank Transfer',
      transactionId: 'DBT-2026-NAG-81204',
      status: 'COMPLETED',
      finalizedAt: new Date(Date.now() - 86400000 * 13).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ];

  const notifications: Notification[] = [];

  return {
    users,
    farmers,
    operators,
    centres,
    crops,
    centreCrops,
    slots,
    bookings,
    queueEntries,
    procurements,
    payments,
    notifications,
  };
}
