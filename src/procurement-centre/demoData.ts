export type QueueStatus = 'BOOKED' | 'CHECKED_IN' | 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'NO_SHOW';
export type PaymentStatus = 'NOT_FINALIZED' | 'ON_THE_WAY' | 'COMPLETED';

export interface Centre { id: string; name: string; location: string; district: string; crops: string[]; villages: string[]; farmersCount: number; }
export interface Farmer { id: string; name: string; mobile: string; village: string; district: string; crops: string[]; }
export interface Booking { id: string; farmerId: string; crop: string; quantity: number; date: string; slot: string; token: string; status: QueueStatus; }
export interface QueueItem extends Booking { arrival: string; wait: number; }
export interface Procurement { id: string; bookingId: string; farmerId: string; crop: string; quantity: number; grade: string; date: string; rate: number; }
export interface Payment { id: string; procurementId: string; farmerId: string; crop: string; quantity: number; amount: number; date: string; status: PaymentStatus; }
export interface CentreData { centre: Centre; farmers: Farmer[]; bookings: Booking[]; queue: QueueItem[]; procurement: Procurement[]; payments: Payment[]; }

const centreSpecs: Centre[] = [
  { id: 'PARSEONI_001', name: 'Parseoni Procurement Centre', location: 'APMC Yard, Parseoni Tehsil, Nagpur', district: 'Nagpur', crops: ['Wheat', 'Soybean', 'Paddy'], villages: ['Parseoni', 'Sawangi', 'Kandri', 'Navegaon Khairi', 'Pipla'], farmersCount: 486 },
  { id: 'RAMTEK_002', name: 'APMC Ramtek', location: 'Station Road, Mansar By-pass, Ramtek, Nagpur', district: 'Nagpur', crops: ['Paddy', 'Wheat', 'Soybean'], villages: ['Ramtek', 'Mansar', 'Khindsi', 'Deolapar', 'Bhandarbodi'], farmersCount: 624 },
  { id: 'KALAMNA_003', name: 'APMC Nagpur / Kalamna Market Yard', location: 'Kalamna Grain Market, Kamptee Road, Nagpur', district: 'Nagpur', crops: ['Wheat', 'Chana', 'Soybean', 'Paddy'], villages: ['Kamptee', 'Yerkheda', 'Kalamna', 'Kanhan', 'Bhiwapur'], farmersCount: 1284 },
  { id: 'BUTIBORI_004', name: 'Krishi Seva Kendra Nagpur', location: 'Wardha Road Sub-centre, Butibori, Nagpur', district: 'Nagpur', crops: ['Wheat', 'Soybean', 'Chana'], villages: ['Butibori', 'Gumgaon', 'Jamtha', 'Khapri', 'Takli'], farmersCount: 392 },
  { id: 'PANJARI_005', name: 'ICAR Panjari Farm Centre', location: 'Panjari Farm Campus, Wardha Road, Nagpur', district: 'Nagpur', crops: ['Wheat', 'Soybean', 'Chana', 'Paddy'], villages: ['Panjari', 'Besa', 'Beltarodi', 'Pavangaon', 'Mohgaon'], farmersCount: 318 },
  { id: 'HINGNA_006', name: 'Krishi Kranti Kendra Hingna', location: 'MIDC Phase 2, Hingna Road, Nagpur', district: 'Nagpur', crops: ['Soybean', 'Cotton', 'Tur'], villages: ['Hingna', 'Wanadongri', 'Isasani', 'Raipur', 'Digdoh'], farmersCount: 557 },
  { id: 'NASHIK_007', name: 'Nashik Taluka Agriculture Office', location: 'Govt Agri Complex, Dindori Naka, Nashik', district: 'Nashik', crops: ['Onion', 'Wheat', 'Soybean', 'Chana'], villages: ['Dindori', 'Mhasrul', 'Peth Road', 'Ozar', 'Adgaon'], farmersCount: 743 },
  { id: 'SAMBHAJINAGAR_008', name: 'Uchatam Krushi Utpann Bazar Samiti', location: 'Jalna Road Market Yard, Chhatrapati Sambhajinagar', district: 'Chhatrapati Sambhajinagar', crops: ['Cotton', 'Soybean', 'Tur', 'Wheat'], villages: ['Jalna Road', 'Waluj', 'Karmad', 'Bidkin', 'Phulambri'], farmersCount: 891 },
];

const names = ['Anil Patil','Sunita Wankhede','Prakash Deshmukh','Meena Chavan','Ramesh Borkar','Vijaya Thakre','Suresh Mahajan','Kavita Shinde','Ganesh Zade','Lata Gawande','Mohan Kadu','Asha Meshram','Dilip Raut','Nirmala Uikey','Vijay Wagh','Shobha Bhoyar','Nitin Bawane','Usha Kumbhare','Ashok Narnaware','Savita Gajbhiye','Ravi Dhurve','Manda Borkar','Rajendra Gedam','Sarita Kapse'];
const rates: Record<string, number> = { Wheat: 2425, Paddy: 2369, Soybean: 4892, Chana: 5875, Cotton: 7121, Tur: 7550, Onion: 1800 };
const statuses: QueueStatus[] = ['WAITING','CHECKED_IN','BOOKED','CALLED','PROCESSING','COMPLETED','NO_SHOW','WAITING','BOOKED','COMPLETED','CHECKED_IN','WAITING','BOOKED','COMPLETED','PROCESSING'];
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() - offset); return d.toISOString().slice(0, 10); };

export const procurementCentres = centreSpecs;
export const centreDemos: Record<string, CentreData> = Object.fromEntries(centreSpecs.map((centre, ci) => {
  const farmers: Farmer[] = names.slice(0, 20).map((name, i) => ({ id: `${centre.id}-F${String(i + 1).padStart(3, '0')}`, name: `${name}${ci ? ` ${['More','Kale','Pawar','Jadhav','Dange','Kharat','Shinde'][((i + ci) % 7)]}` : ''}`, mobile: `+91 98${String(10000000 + ci * 130000 + i * 4217).slice(0, 8)}`, village: centre.villages[(i * 3 + ci) % centre.villages.length], district: centre.district, crops: [centre.crops[i % centre.crops.length], centre.crops[(i + 1) % centre.crops.length]] }));
  const bookings: Booking[] = Array.from({ length: 18 }, (_, i) => ({ id: `BKG-${centre.id.slice(0, 3)}-${String(2600 + ci * 100 + i).slice(1)}`, farmerId: farmers[(i * 7 + ci) % farmers.length].id, crop: centre.crops[(i * 3 + ci) % centre.crops.length], quantity: 8 + ((i * 7 + ci * 5) % (ci === 2 ? 75 : 32)), date: day(i < 7 ? 0 : (i % 12) + 1), slot: ['08:00–10:00','10:00–12:00','12:00–14:00','14:00–16:00'][i % 4], token: `${centre.id.slice(0, 3)}-${String(41 + i).padStart(3, '0')}`, status: statuses[(i + ci * 2) % statuses.length] }));
  const queue: QueueItem[] = bookings.slice(0, 15).map((b, i) => ({ ...b, arrival: `${String(8 + Math.floor(i / 3)).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}`, wait: [10,20,35,45,55][(i + ci) % 5] }));
  const procurement: Procurement[] = bookings.slice(3, 16).map((b, i) => ({ id: `PRC-${centre.id.slice(0, 3)}-${String(4100 + ci * 100 + i).slice(1)}`, bookingId: b.id, farmerId: b.farmerId, crop: b.crop, quantity: Math.max(5, b.quantity - (i % 4)), grade: ['FAQ','Grade A','Grade B'][ (i + ci) % 3], date: b.date, rate: rates[b.crop] || 2000 }));
  const payments: Payment[] = procurement.slice(0, 12).map((p, i) => ({ id: `TXN-${centre.id.slice(0, 3)}-${String(7300 + ci * 100 + i).slice(1)}`, procurementId: p.id, farmerId: p.farmerId, crop: p.crop, quantity: p.quantity, amount: p.quantity * p.rate, date: p.date, status: (['COMPLETED','ON_THE_WAY','NOT_FINALIZED'] as PaymentStatus[])[(i + ci) % 3] }));
  return [centre.id, { centre, farmers, bookings, queue, procurement, payments } satisfies CentreData];
}));

export const farmerFor = (data: CentreData, id: string) => data.farmers.find(f => f.id === id)!;
export const activeQueueStatuses: QueueStatus[] = ['CHECKED_IN','WAITING','CALLED','PROCESSING'];
