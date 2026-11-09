import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from './firebaseAdmin';
import { adminCredential } from './firebaseAdmin';
import { db } from './db';
import { getIndiaDateString } from './date';

const collections = {
  users: 'users', farmers: 'farmers', operators: 'operators', centres: 'centres',
  crops: 'crops', centreCrops: 'centreCrops', slots: 'slots', bookings: 'bookings',
  queueEntries: 'queue', procurements: 'procurements', payments: 'payments', notifications: 'notifications',
} as const;

type CollectionKey = keyof typeof collections;
type RecordValue = Record<string, any> & { id: string };
type Snapshot = Record<CollectionKey, RecordValue[]>;

function copy(value: unknown): any {
  return JSON.parse(JSON.stringify(value));
}

function readDb(): Snapshot {
  const result: Partial<Snapshot> = {};
  for (const key of Object.keys(collections) as CollectionKey[]) {
    result[key] = copy((db as any)[key] || []);
  }
  return result as Snapshot;
}

function applySnapshot(snapshot: Snapshot) {
  for (const key of Object.keys(collections) as CollectionKey[]) {
    (db as any)[key] = snapshot[key];
  }
}

function dataFromDoc(doc: QueryDocumentSnapshot): RecordValue {
  return { id: doc.id, ...doc.data() } as RecordValue;
}

export async function initializeFirestoreStore() {
  // Bootstrap each empty collection once from the app's existing demo seed data.
  // Once documents exist, Firestore is authoritative and survives process restarts.
  for (const key of Object.keys(collections) as CollectionKey[]) {
    const ref = firestore.collection(collections[key]);
    const existing = await ref.limit(1).get();
    const seed = (db as any)[key] as RecordValue[];
    if (existing.empty && seed.length) {
      for (let offset = 0; offset < seed.length; offset += 400) {
        const batch = firestore.batch();
        seed.slice(offset, offset + 400).forEach((item) => {
          if (!item?.id) return;
          batch.set(ref.doc(String(item.id)), item);
        });
        await batch.commit();
      }
    } else if (!existing.empty) {
      const all = await ref.get();
      (db as any)[key] = all.docs.map(dataFromDoc);
    }
  }
  db.recalculateCenterQueue('ctr_parseoni');
}

export function captureDbSnapshot(): Snapshot {
  return readDb();
}

export async function persistDbChanges(before: Snapshot, skip: CollectionKey[] = []) {
  for (const key of Object.keys(collections) as CollectionKey[]) {
    if (skip.includes(key)) continue;
    const oldItems = new Map((before[key] || []).map((item) => [String(item.id), item]));
    const newItems = new Map(((db as any)[key] as RecordValue[] || []).map((item) => [String(item.id), item]));
    const changes: Array<{ id: string; data?: RecordValue; remove?: boolean }> = [];
    for (const [id, data] of newItems) {
      if (!oldItems.has(id) || JSON.stringify(oldItems.get(id)) !== JSON.stringify(data)) changes.push({ id, data });
    }
    for (const id of oldItems.keys()) if (!newItems.has(id)) changes.push({ id, remove: true });
    for (let offset = 0; offset < changes.length; offset += 400) {
      const batch = firestore.batch();
      changes.slice(offset, offset + 400).forEach((change) => {
        const ref = firestore.collection(collections[key]).doc(change.id);
        if (change.remove) batch.delete(ref);
        else batch.set(ref, change.data!);
      });
      await batch.commit();
    }
  }
}

export async function createBookingTransaction(input: {
  booking: RecordValue; slotId: string; centreId: string; farmerId: string;
}) {
  const slotRef = firestore.collection('slots').doc(input.slotId);
  const bookingRef = firestore.collection('bookings').doc(input.booking.id);
  const counterRef = firestore.collection('counters').doc(`token_${input.centreId}`);
  const bookingResult = await firestore.runTransaction(async (tx) => {
    const slotDoc = await tx.get(slotRef);
    if (!slotDoc.exists) throw new Error('Selected slot was not found');
    const slot = slotDoc.data() as RecordValue;
    if (slot.centreId !== input.centreId) throw new Error('Selected slot does not belong to this centre');
    if (String(slot.date) < getIndiaDateString()) throw new Error('Past procurement dates cannot be booked');
    if (slot.status === 'CLOSED' || Number(slot.booked) >= Number(slot.capacity)) {
      throw new Error('This procurement slot is fully booked. Please select another slot.');
    }

    const farmerBookings = await tx.get(firestore.collection('bookings').where('farmerId', '==', input.farmerId));
    const duplicate = farmerBookings.docs.some((doc) => {
      const item = doc.data();
      return item.slotId === input.slotId && !['CANCELLED', 'NO_SHOW', 'RESCHEDULED'].includes(item.status);
    });
    if (duplicate) throw new Error('You already have an active booking for this slot.');

    const counterDoc = await tx.get(counterRef);
    const previousTokenNumbers = db.bookings.filter((booking) => booking.centreId === input.centreId).map((booking) => Number(String(booking.tokenNumber).split('-').pop()) || 0);
    const tokenNumber = Math.max(Number(counterDoc.data()?.lastNumber ?? 0), ...previousTokenNumbers, 0) + 1;
    const prefix = input.centreId === 'ctr_parseoni' ? 'PAR' : input.centreId === 'ctr_kalamna' ? 'KLM' : 'TOK';
    const now = new Date().toISOString();
    const slotBooked = Number(slot.booked || 0) + 1;
    const updatedSlot = { ...slot, booked: slotBooked, status: slotBooked >= Number(slot.capacity) ? 'FULL' : 'AVAILABLE' };
    const booking = { ...input.booking, tokenNumber: `${prefix}-${String(tokenNumber).padStart(3, '0')}` };
    tx.set(slotRef, updatedSlot);
    tx.set(counterRef, { lastNumber: tokenNumber, updatedAt: now }, { merge: true });
    tx.create(bookingRef, booking);
    return { booking, slot: updatedSlot };
  });

  const slotIndex = db.slots.findIndex((slot) => slot.id === input.slotId);
  if (slotIndex >= 0) db.slots[slotIndex] = bookingResult.slot as any;
  db.bookings.push(bookingResult.booking as any);
  return bookingResult.booking;
}

export async function cancelBookingTransaction(bookingId: string) {
  const bookingRef = firestore.collection('bookings').doc(bookingId);
  const result = await firestore.runTransaction(async (tx) => {
    const bookingDoc = await tx.get(bookingRef);
    if (!bookingDoc.exists) throw new Error('Booking not found');
    const booking = { id: bookingDoc.id, ...bookingDoc.data() } as RecordValue;
    if (['COMPLETED', 'PROCESSING'].includes(booking.status)) throw new Error('Cannot cancel an active or completed procurement session');
    const slotRef = firestore.collection('slots').doc(booking.slotId);
    const slotDoc = await tx.get(slotRef);
    const now = new Date().toISOString();
    const updatedBooking = { ...booking, status: 'CANCELLED', cancelledAt: now };
    let updatedSlot: RecordValue | null = null;
    if (slotDoc.exists) {
      const slot = slotDoc.data() as RecordValue;
      const booked = Math.max(0, Number(slot.booked || 0) - 1);
      updatedSlot = { ...slot, booked, status: slot.status === 'CLOSED' ? 'CLOSED' : 'AVAILABLE' };
      tx.set(slotRef, updatedSlot);
    }
    tx.set(bookingRef, updatedBooking);
    return { booking: updatedBooking, slot: updatedSlot };
  });
  const bookingIndex = db.bookings.findIndex((booking) => booking.id === bookingId);
  if (bookingIndex >= 0) db.bookings[bookingIndex] = result.booking as any;
  if (result.slot) {
    const slotIndex = db.slots.findIndex((slot) => slot.id === result.slot!.id);
    if (slotIndex >= 0) db.slots[slotIndex] = result.slot as any;
  }
  return result.booking;
}

export async function rescheduleBookingTransaction(bookingId: string, newSlotId: string) {
  const bookingRef = firestore.collection('bookings').doc(bookingId);
  const result = await firestore.runTransaction(async (tx) => {
    const bookingDoc = await tx.get(bookingRef);
    if (!bookingDoc.exists) throw new Error('Booking not found');
    const booking = { id: bookingDoc.id, ...bookingDoc.data() } as RecordValue;
    if (['COMPLETED', 'PROCESSING', 'CANCELLED', 'NO_SHOW'].includes(booking.status)) throw new Error('This booking can no longer be rescheduled');
    if (booking.slotId === newSlotId) return { booking, oldSlot: null, newSlot: null };
    const oldSlotRef = firestore.collection('slots').doc(booking.slotId);
    const newSlotRef = firestore.collection('slots').doc(newSlotId);
    const [oldSlotDoc, newSlotDoc] = await Promise.all([tx.get(oldSlotRef), tx.get(newSlotRef)]);
    if (!newSlotDoc.exists) throw new Error('Target slot not found');
    const newSlot = newSlotDoc.data() as RecordValue;
    if (newSlot.centreId !== booking.centreId || newSlot.status === 'CLOSED' || Number(newSlot.booked) >= Number(newSlot.capacity)) throw new Error('Target slot is unavailable');
    const farmerBookings = await tx.get(firestore.collection('bookings').where('farmerId', '==', booking.farmerId));
    if (farmerBookings.docs.some((doc) => doc.id !== booking.id && doc.data().slotId === newSlotId && !['CANCELLED', 'NO_SHOW', 'RESCHEDULED'].includes(doc.data().status))) {
      throw new Error('You already have an active booking for this slot.');
    }
    const updatedBooking = { ...booking, slotId: newSlotId, status: 'BOOKED' };
    const updatedNew: RecordValue = { ...newSlot, booked: Number(newSlot.booked || 0) + 1 };
    updatedNew.status = updatedNew.booked >= Number(updatedNew.capacity) ? 'FULL' : 'AVAILABLE';
    tx.set(newSlotRef, updatedNew);
    let updatedOld: RecordValue | null = null;
    if (oldSlotDoc.exists && booking.slotId !== newSlotId) {
      const oldSlot = oldSlotDoc.data() as RecordValue;
      const booked = Math.max(0, Number(oldSlot.booked || 0) - 1);
      updatedOld = { ...oldSlot, booked, status: oldSlot.status === 'CLOSED' ? 'CLOSED' : 'AVAILABLE' };
      tx.set(oldSlotRef, updatedOld);
    }
    tx.set(bookingRef, updatedBooking);
    return { booking: updatedBooking, oldSlot: updatedOld, newSlot: updatedNew };
  });
  const bookingIndex = db.bookings.findIndex((booking) => booking.id === bookingId);
  if (bookingIndex >= 0) db.bookings[bookingIndex] = result.booking as any;
  for (const updatedSlot of [result.oldSlot, result.newSlot]) {
    if (!updatedSlot) continue;
    const slotIndex = db.slots.findIndex((slot) => slot.id === updatedSlot.id);
    if (slotIndex >= 0) db.slots[slotIndex] = updatedSlot as any;
  }
  return result.booking;
}

export function watchFirestoreChanges(onChange: (collection: string) => void) {
  const unsubscribers = (Object.keys(collections) as CollectionKey[]).map((key) => {
    let initialSnapshot = true;
    return firestore.collection(collections[key]).onSnapshot((snapshot) => {
      (db as any)[key] = snapshot.docs.map(dataFromDoc);
      if (initialSnapshot) {
        initialSnapshot = false;
        return;
      }
      if (snapshot.docChanges().length) onChange(collections[key]);
    }, (error) => console.error(`Firestore listener failed for ${collections[key]}:`, error.message));
  });
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

export async function upsertFirebaseFarmer(uid: string, authUser: { email?: string; name?: string; phone?: string }, profile: any = {}) {
  const linkedUser = db.users.find((user) => user.id === uid || user.email.toLowerCase() === (authUser.email || '').toLowerCase());
  if (linkedUser && linkedUser.role !== 'FARMER') throw new Error('This account is not registered as a farmer');
  const existing = db.farmers.find((farmer) => farmer.userId === uid) || (linkedUser ? db.farmers.find((farmer) => farmer.userId === linkedUser.id) : undefined);
  if (existing) {
    const priorUserId = existing.userId;
    existing.userId = uid;
    if (profile.village) existing.village = profile.village;
    if (profile.district) existing.district = profile.district;
    if (profile.landArea != null) existing.landArea = Number(profile.landArea);
    const existingUser = linkedUser || db.users.find((user) => user.id === priorUserId);
    if (existingUser) {
      existingUser.id = uid;
      if (profile.name || authUser.name) existingUser.name = profile.name || authUser.name;
      if (profile.mobile || authUser.phone) existingUser.mobile = profile.mobile || authUser.phone;
      const batch = firestore.batch();
      batch.set(firestore.collection('users').doc(uid), existingUser, { merge: true });
      if (priorUserId !== uid) batch.delete(firestore.collection('users').doc(priorUserId));
      batch.set(firestore.collection('farmers').doc(existing.id), existing, { merge: true });
      await batch.commit();
      db.users = db.users.filter((user) => user.id === uid || user.id !== priorUserId);
      if (!db.users.includes(existingUser)) db.users.push(existingUser as any);
    } else {
      await firestore.collection('farmers').doc(existing.id).set(existing, { merge: true });
    }
    return existing;
  }

  const id = `frm_${uid}`;
  const farmer = {
    id, userId: uid,
    farmerId: `MH-${String(profile.district || 'NAG').slice(0, 3).toUpperCase()}-${uid.slice(0, 8).toUpperCase()}`,
    village: profile.village || 'Not provided', district: profile.district || 'Nagpur',
    landArea: Number(profile.landArea) || 0, preferredLanguage: profile.preferredLanguage || 'en',
    createdAt: new Date().toISOString(),
  };
  const user = { id: uid, name: authUser.name || authUser.email?.split('@')[0] || 'Farmer', email: authUser.email || '', mobile: authUser.phone || '', passwordHash: '', role: 'FARMER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const batch = firestore.batch();
  batch.set(firestore.collection('farmers').doc(id), farmer);
  batch.set(firestore.collection('users').doc(uid), user);
  await batch.commit();
  db.farmers.push(farmer as any);
  if (!db.users.some((item) => item.id === uid)) db.users.push(user as any);
  return farmer;
}

export async function getFirebaseSignInProviders() {
  const { access_token: accessToken } = await adminCredential.getAccessToken();
  const projectId = process.env.FIREBASE_PROJECT_ID || 'kisan-marg-19c0a';
  const base = `https://identitytoolkit.googleapis.com/v2/projects/${projectId}`;
  const headers = { Authorization: `Bearer ${accessToken}` };
  const [configResponse, googleResponse] = await Promise.all([
    fetch(`${base}/config`, { headers }),
    fetch(`${base}/defaultSupportedIdpConfigs/google.com`, { headers }),
  ]);
  if (!configResponse.ok) throw new Error(`Firebase Auth project config request failed (${configResponse.status})`);
  const config = await configResponse.json() as any;
  const google = googleResponse.status === 404 ? null : googleResponse.ok ? await googleResponse.json() as any : null;
  if (!google && ![200, 404].includes(googleResponse.status)) throw new Error(`Google provider config request failed (${googleResponse.status})`);
  return {
    emailPassword: Boolean(config.signIn?.email?.enabled),
    google: Boolean(google?.enabled),
  };
}

