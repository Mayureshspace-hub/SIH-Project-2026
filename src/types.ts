export type Role = 'FARMER' | 'OPERATOR' | 'ADMIN';

export type SlotStatus = 'AVAILABLE' | 'FULL' | 'CLOSED';

export type BookingStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'WAITING'
  | 'CALLED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'RESCHEDULED';

export type QueueStatus = 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'NO_SHOW';

export type PaymentStatus = 'NOT_FINALIZED' | 'ON_THE_WAY' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
}

export interface Farmer {
  id: string;
  userId: string;
  farmerId: string;
  village: string;
  district: string;
  landArea: number;
  preferredLanguage: string;
  createdAt: string;
}

export interface Operator {
  id: string;
  userId: string;
  centreId: string;
  badgeNo: string;
  active: boolean;
  createdAt: string;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  unit: string;
  description?: string;
  indicativeMsp?: number;
}

export interface ProcurementCentre {
  id: string;
  name: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  workingStart: string;
  workingEnd: string;
  dailyCapacity: number;
  averageProcessingMinutes: number;
  quantityProcessingFactor: number;
  gracePeriodMinutes: number;
  active: boolean;
  acceptedCrops?: Crop[];
  todayQueueCount?: number;
  availableSlotsCount?: number;
  todaySlots?: Slot[];
}

export interface FarmerKnowledgePractice {
  id: string;
  centreId: string;
  farmerName: string;
  crop: string;
  fertilizers: string[];
  pesticides: string[];
  farmingPractices: string[];
  season: string;
  observedImprovement: string;
}

export interface Slot {
  id: string;
  centreId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  status: SlotStatus;
  spacesAvailable?: number;
}

export interface Booking {
  id: string;
  bookingId: string;
  farmerId: string;
  centreId: string;
  slotId: string;
  cropId: string;
  quantity: number;
  tokenNumber: string;
  status: BookingStatus;
  bookedAt: string;
  checkedInAt?: string;
  calledAt?: string;
  processingStartedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  centreName?: string;
  centreLocation?: string;
  cropName?: string;
  slotDate?: string;
  slotTime?: string;
  procurement?: ProcurementRecord;
  payment?: Payment;
}

export interface QueueItem {
  id: string;
  bookingId: string;
  centreId: string;
  date: string;
  tokenNumber: string;
  queueStatus: QueueStatus;
  queuePosition: number;
  estimatedWaitMinutes: number;
  joinedAt: string;
  updatedAt: string;
  farmerName: string;
  village: string;
  cropName: string;
  quantity: number;
  bookingStatus: BookingStatus;
  slotTime: string;
  estimatedProcessingTime: number;
}

export interface LiveQueueData {
  booking: Booking;
  crop: Crop;
  centre: ProcurementCentre;
  slot: Slot;
  tokenNumber: string;
  status: BookingStatus;
  queuePosition: number | null;
  farmersAhead: number;
  estimatedWaitMinutes: number;
  currentlyProcessing: QueueItem | null;
  currentlyCalled: QueueItem | null;
  totalInQueue: number;
  centreQueue: QueueItem[];
}

export interface ProcurementRecord {
  id: string;
  bookingId: string;
  farmerId: string;
  centreId: string;
  cropId: string;
  deliveredQuantity: number;
  acceptedQuantity: number;
  qualityGrade: string;
  finalRate: number;
  totalAmount: number;
  status: string;
  procurementDate: string;
  cropName?: string;
  centreName?: string;
  tokenNumber?: string;
  farmerName?: string;
  farmerIdCode?: string;
  paymentStatus?: PaymentStatus;
  payment?: Payment;
}

export interface Payment {
  id: string;
  procurementId: string;
  farmerId: string;
  amount: number | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  status: PaymentStatus;
  finalizedAt?: string;
  completedAt?: string;
  cropName?: string;
  acceptedQuantity?: number;
  centreName?: string;
  tokenNumber?: string;
  procurementDate?: string;
  farmerName?: string;
  farmerIdCode?: string;
}

export interface NotificationItem {
  id: string;
  farmerId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'QUEUE' | 'CALLED' | 'DELAY' | 'PROCUREMENT' | 'PAYMENT';
  read: boolean;
  createdAt: string;
}
