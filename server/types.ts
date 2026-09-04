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
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Farmer {
  id: string;
  userId: string;
  farmerId: string; // e.g. MH-NAG-2026-0814
  village: string;
  district: string;
  landArea: number; // in acres
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
  referenceProduceImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  unit: string;
  description?: string;
  indicativeMsp?: number; // Indicative prototype reference only
}

export interface CentreCrop {
  id: string;
  centreId: string;
  cropId: string;
  active: boolean;
}

export interface Slot {
  id: string;
  centreId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  capacity: number;
  booked: number;
  status: SlotStatus;
}

export interface Booking {
  id: string;
  bookingId: string; // BK-20260903-0027
  farmerId: string;
  centreId: string;
  slotId: string;
  cropId: string;
  quantity: number; // in quintals
  tokenNumber: string; // PAR-027
  status: BookingStatus;
  bookedAt: string;
  checkedInAt?: string;
  calledAt?: string;
  processingStartedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface QueueEntry {
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
}

export interface Payment {
  id: string;
  procurementId: string;
  farmerId: string;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  status: PaymentStatus;
  finalizedAt?: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  farmerId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'QUEUE' | 'CALLED' | 'DELAY' | 'PROCUREMENT' | 'PAYMENT';
  read: boolean;
  createdAt: string;
}
