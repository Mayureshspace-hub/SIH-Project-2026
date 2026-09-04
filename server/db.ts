import { getInitialSeedData } from './seedData';
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
  Notification,
  BookingStatus,
  QueueStatus,
  PaymentStatus
} from './types';

class DatabaseStore {
  users: User[] = [];
  farmers: Farmer[] = [];
  operators: Operator[] = [];
  centres: ProcurementCentre[] = [];
  crops: Crop[] = [];
  centreCrops: CentreCrop[] = [];
  slots: Slot[] = [];
  bookings: Booking[] = [];
  queueEntries: QueueEntry[] = [];
  procurements: ProcurementRecord[] = [];
  payments: Payment[] = [];
  notifications: Notification[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const data = getInitialSeedData();
    this.users = data.users;
    this.farmers = data.farmers;
    this.operators = data.operators;
    this.centres = data.centres;
    this.crops = data.crops;
    this.centreCrops = data.centreCrops;
    this.slots = data.slots;
    this.bookings = data.bookings;
    this.queueEntries = data.queueEntries;
    this.procurements = data.procurements;
    this.payments = data.payments;
    this.notifications = data.notifications;
    this.recalculateCenterQueue('ctr_parseoni');
  }

  // --- Dynamic Quantity-Based Queue Calculation Engine ---
  calculateEstimatedProcessingTime(quantity: number, centre: ProcurementCentre): number {
    const base = centre.averageProcessingMinutes || 10;
    const factor = centre.quantityProcessingFactor || 1.1;
    return Math.round(base + (quantity * factor));
  }

  recalculateCenterQueue(centreId: string) {
    const centre = this.centres.find((c) => c.id === centreId);
    if (!centre) return;

    const today = new Date().toISOString().split('T')[0];

    // Find all active bookings in queue: PROCESSING, CALLED, WAITING, CHECKED_IN
    const activeBookings = this.bookings.filter(
      (b) =>
        b.centreId === centreId &&
        ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN'].includes(b.status) &&
        (b.slotId ? true : true)
    );

    // Sort order: PROCESSING first, then CALLED, then WAITING/CHECKED_IN by checkin or booking time
    activeBookings.sort((a, b) => {
      const order = { PROCESSING: 1, CALLED: 2, WAITING: 3, CHECKED_IN: 4 };
      const priorityA = order[a.status as keyof typeof order] || 99;
      const priorityB = order[b.status as keyof typeof order] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;

      const timeA = new Date(a.checkedInAt || a.bookedAt).getTime();
      const timeB = new Date(b.checkedInAt || b.bookedAt).getTime();
      return timeA - timeB;
    });

    let cumulativeWaitMinutes = 0;

    activeBookings.forEach((b, index) => {
      let qStatus: QueueStatus = 'WAITING';
      if (b.status === 'PROCESSING') qStatus = 'PROCESSING';
      else if (b.status === 'CALLED') qStatus = 'CALLED';
      else qStatus = 'WAITING';

      // For processing farmer: how much remaining?
      let currentWait = cumulativeWaitMinutes;
      const estimatedThisProcessing = this.calculateEstimatedProcessingTime(b.quantity, centre);

      if (b.status === 'PROCESSING') {
        const start = b.processingStartedAt ? new Date(b.processingStartedAt).getTime() : Date.now();
        const elapsedMinutes = Math.floor((Date.now() - start) / 60000);
        const remainingProcessing = Math.max(3, estimatedThisProcessing - elapsedMinutes);
        cumulativeWaitMinutes += remainingProcessing;
        currentWait = 0; // they are currently being processed
      } else if (b.status === 'CALLED') {
        currentWait = cumulativeWaitMinutes;
        cumulativeWaitMinutes += Math.max(5, Math.round(estimatedThisProcessing * 0.8));
      } else {
        currentWait = cumulativeWaitMinutes;
        cumulativeWaitMinutes += estimatedThisProcessing;
      }

      // Upsert QueueEntry
      let qEntry = this.queueEntries.find((q) => q.bookingId === b.id);
      if (!qEntry) {
        qEntry = {
          id: `qe_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          bookingId: b.id,
          centreId,
          date: today,
          tokenNumber: b.tokenNumber,
          queueStatus: qStatus,
          queuePosition: index + 1,
          estimatedWaitMinutes: currentWait,
          joinedAt: b.checkedInAt || b.bookedAt,
          updatedAt: new Date().toISOString(),
        };
        this.queueEntries.push(qEntry);
      } else {
        qEntry.queuePosition = index + 1;
        qEntry.queueStatus = qStatus;
        qEntry.estimatedWaitMinutes = currentWait;
        qEntry.updatedAt = new Date().toISOString();
      }
    });

    // Remove queue entries for bookings that are completed or cancelled
    this.queueEntries = this.queueEntries.filter((q) => {
      if (q.centreId !== centreId) return true;
      const b = this.bookings.find((bk) => bk.id === q.bookingId);
      return b && ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN'].includes(b.status);
    });
  }

  // --- Queue State for Socket and API ---
  getCentreQueueSnapshot(centreId: string) {
    this.recalculateCenterQueue(centreId);
    const centre = this.centres.find((c) => c.id === centreId);
    const entries = this.queueEntries
      .filter((q) => q.centreId === centreId)
      .sort((a, b) => a.queuePosition - b.queuePosition);

    const detailedEntries = entries.map((q) => {
      const booking = this.bookings.find((b) => b.id === q.bookingId);
      const farmer = booking ? this.farmers.find((f) => f.id === booking.farmerId) : null;
      const user = farmer ? this.users.find((u) => u.id === farmer.userId) : null;
      const crop = booking ? this.crops.find((c) => c.id === booking.cropId) : null;

      return {
        ...q,
        farmerName: user?.name || 'Unknown Farmer',
        village: farmer?.village || 'Unknown Village',
        cropName: crop?.name || 'Produce',
        quantity: booking?.quantity || 0,
        bookingStatus: booking?.status || 'WAITING',
        slotTime: booking ? this.getSlotTime(booking.slotId) : '',
        estimatedProcessingTime: (centre && booking) ? this.calculateEstimatedProcessingTime(booking.quantity, centre) : 15,
      };
    });

    const currentlyProcessing = detailedEntries.find((e) => e.queueStatus === 'PROCESSING') || null;
    const currentlyCalled = detailedEntries.find((e) => e.queueStatus === 'CALLED') || null;

    return {
      centreId,
      centreName: centre?.name || '',
      totalInQueue: detailedEntries.length,
      currentlyProcessing,
      currentlyCalled,
      queue: detailedEntries,
    };
  }

  getSlotTime(slotId: string): string {
    const slot = this.slots.find((s) => s.id === slotId);
    return slot ? `${slot.startTime} – ${slot.endTime}` : '';
  }

  // Find farmer's current live queue status
  getFarmerLiveQueue(farmerId: string) {
    // Find active booking for farmer
    const activeBooking = this.bookings.find(
      (b) =>
        b.farmerId === farmerId &&
        ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN', 'BOOKED'].includes(b.status)
    );

    if (!activeBooking) return null;

    const centre = this.centres.find((c) => c.id === activeBooking.centreId);
    const crop = this.crops.find((c) => c.id === activeBooking.cropId);
    const slot = this.slots.find((s) => s.id === activeBooking.slotId);

    if (centre) {
      this.recalculateCenterQueue(centre.id);
    }

    const queueSnapshot = centre ? this.getCentreQueueSnapshot(centre.id) : null;
    const farmerEntry = queueSnapshot?.queue.find((q) => q.bookingId === activeBooking.id);

    // Calculate farmers ahead: count entries in queue strictly before this farmer's position
    const farmersAhead = farmerEntry ? Math.max(0, farmerEntry.queuePosition - 1) : 0;

    return {
      booking: activeBooking,
      crop,
      centre,
      slot,
      tokenNumber: activeBooking.tokenNumber,
      status: activeBooking.status,
      queuePosition: farmerEntry ? farmerEntry.queuePosition : null,
      farmersAhead,
      estimatedWaitMinutes: farmerEntry ? farmerEntry.estimatedWaitMinutes : 0,
      currentlyProcessing: queueSnapshot?.currentlyProcessing || null,
      currentlyCalled: queueSnapshot?.currentlyCalled || null,
      totalInQueue: queueSnapshot?.totalInQueue || 0,
      centreQueue: queueSnapshot?.queue || [],
    };
  }

  // Token generator
  generateToken(centreId: string): string {
    const centre = this.centres.find((c) => c.id === centreId);
    let prefix = 'TOK';
    if (centre) {
      prefix = centre.name.substring(0, 3).toUpperCase();
      if (prefix === 'APM') prefix = 'RMK';
      if (centre.id === 'ctr_parseoni') prefix = 'PAR';
      if (centre.id === 'ctr_kalamna') prefix = 'KLM';
    }

    const count = this.bookings.filter((b) => b.centreId === centreId).length + 1;
    const token = `${prefix}-${String(count).padStart(3, '0')}`;
    return token;
  }
}

export const db = new DatabaseStore();
