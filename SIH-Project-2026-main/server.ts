import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { GoogleGenAI } from '@google/genai';
import { randomBytes, randomUUID } from 'node:crypto';
import { adminAuth, adminCredential } from './server/firebaseAdmin';
import { cancelBookingTransaction, captureDbSnapshot, createBookingTransaction, getFirebaseSignInProviders, initializeFirestoreStore, persistDbChanges, rescheduleBookingTransaction, upsertFirebaseFarmer, watchFirestoreChanges } from './server/firestoreStore';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : randomBytes(32).toString('hex'));
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!JWT_SECRET) throw new Error('Set JWT_SECRET for the existing operator/admin login sessions before starting production.');
  const app = express();
  const server = http.createServer(app);

  // Setup Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_centre_queue', (centreId: string) => {
      socket.join(`centre:${centreId}`);
      socket.emit('queue_updated', db.getCentreQueueSnapshot(centreId));
    });

    socket.on('join_farmer', (farmerId: string) => {
      socket.join(`farmer:${farmerId}`);
      const farmerLive = db.getFarmerLiveQueue(farmerId);
      if (farmerLive) {
        socket.emit('farmer_queue_update', farmerLive);
      }
    });
  });

  function broadcastQueueChange(centreId: string) {
    const snapshot = db.getCentreQueueSnapshot(centreId);
    io.to(`centre:${centreId}`).emit('queue_updated', snapshot);
    io.emit('global_queue_updated', { centreId });

    // Also notify active farmers of their personalized live positions
    const activeBookings = db.bookings.filter(
      (b) => b.centreId === centreId && ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN'].includes(b.status)
    );
    for (const b of activeBookings) {
      const live = db.getFarmerLiveQueue(b.farmerId);
      if (live) {
        io.to(`farmer:${b.farmerId}`).emit('farmer_queue_update', live);
      }
    }
  }

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use('/api', (req: any, res: any, next: any) => {
    const before = captureDbSnapshot();
    const sendJson = res.json.bind(res);
    res.json = (body: any) => {
      persistDbChanges(before, res.locals?.skipFirestoreCollections || [])
        .then(() => sendJson(body))
        .catch((error) => {
          console.error('Firestore write failed:', error.message);
          if (!res.headersSent) res.status(500);
          sendJson({ error: 'Could not save this change to Firestore. Please retry.' });
        });
      return res;
    };
    next();
  });

  // Middleware: Auth Token Verification
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = await adminAuth.verifyIdToken(token, true);
    } catch (firebaseError: any) {
      // Firebase ID tokens identify their issuer and audience. Use these
      // unverified claims only to select a verifier; always verify the token
      // cryptographically above before authorizing the request.
      const claims = jwt.decode(token) as any;
      const projectId = process.env.FIREBASE_PROJECT_ID || 'kisan-marg-19c0a';
      const isFirebaseIdToken = claims?.iss === `https://securetoken.google.com/${projectId}` && claims?.aud === projectId;
      if (isFirebaseIdToken) {
        console.warn('Firebase ID token verification failed:', firebaseError?.code || firebaseError?.name || 'verification error');
        return res.status(401).json({ error: 'Firebase session expired or invalid. Please sign in again.' });
      }
      try {
        req.user = jwt.verify(token, JWT_SECRET) as any;
        return next();
      } catch {
        return res.status(401).json({ error: 'Invalid or expired Firebase ID token or backend session' });
      }
    }

    if (!decoded.email_verified && req.path !== '/api/auth/sync-profile') {
      return res.status(403).json({ error: 'Please verify your email before using farmer services' });
    }
    try {
      const linkedUser = db.users.find((user) => user.id === decoded.uid || user.email.toLowerCase() === String(decoded.email || '').toLowerCase());
      if (linkedUser && linkedUser.role !== 'FARMER') return res.status(403).json({ error: 'This Firebase account is not registered as a farmer' });
      const farmer = await upsertFirebaseFarmer(decoded.uid, { email: decoded.email, name: decoded.name, phone: decoded.phone_number }, req.path === '/api/auth/sync-profile' ? req.body : {});
      req.user = { id: decoded.uid, uid: decoded.uid, email: decoded.email, name: decoded.name, role: 'FARMER', farmerId: farmer.id, email_verified: decoded.email_verified };
      return next();
    } catch (error: any) {
      return res.status(403).json({ error: error.message || 'Unable to load farmer profile' });
    }
  };

  // Optional Auth (passes user if token present)
  const optionalAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        req.user = jwt.verify(token, JWT_SECRET);
      } catch (e) {}
    }
    next();
  };

  const requireRoles = (...roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'You are not authorized to perform this action' });
    next();
  };
  const requireCentreAccess = (param = 'centreId') => (req: any, res: any, next: any) => {
    if (req.user?.role === 'ADMIN') return next();
    if (req.user?.role !== 'OPERATOR' || req.user.centreId !== req.params[param]) return res.status(403).json({ error: 'This procurement centre is outside your authorization' });
    next();
  };
  const requireBookingAccess = (allowOperator = false) => (req: any, res: any, next: any) => {
    const booking = db.bookings.find((item) => item.id === (req.params.id || req.params.bookingId));
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user?.role === 'FARMER' && booking.farmerId === req.user.farmerId) return next();
    if (allowOperator && (req.user?.role === 'ADMIN' || (req.user?.role === 'OPERATOR' && booking.centreId === req.user.centreId))) return next();
    return res.status(403).json({ error: 'You are not authorized to access this booking' });
  };
  const requireOperatorBooking = (req: any, res: any, next: any) => {
    const booking = db.bookings.find((item) => item.id === req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user?.role === 'ADMIN' || (req.user?.role === 'OPERATOR' && booking.centreId === req.user.centreId)) return next();
    return res.status(403).json({ error: 'This booking is outside your centre authorization' });
  };
  const requireOperatorBookingBody = (req: any, res: any, next: any) => {
    const booking = db.bookings.find((item) => item.id === req.body.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user?.role === 'ADMIN' || (req.user?.role === 'OPERATOR' && booking.centreId === req.user.centreId)) return next();
    return res.status(403).json({ error: 'This booking is outside your centre authorization' });
  };
  const requirePaymentCentreAccess = (req: any, res: any, next: any) => {
    const payment = db.payments.find((item) => item.id === req.params.id);
    const procurement = payment && db.procurements.find((item) => item.id === payment.procurementId);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });
    if (req.user?.role === 'ADMIN' || (req.user?.role === 'OPERATOR' && procurement?.centreId === req.user.centreId)) return next();
    return res.status(403).json({ error: 'This payment is outside your centre authorization' });
  };

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  app.get('/api/auth/providers', async (_req, res) => {
    try {
      res.json(await getFirebaseSignInProviders());
    } catch (error: any) {
      res.status(503).json({ error: `Could not verify Firebase Auth providers: ${error.message}` });
    }
  });

  app.post('/api/auth/sync-profile', authenticate, async (req: any, res) => {
    if (req.user.role !== 'FARMER') return res.status(403).json({ error: 'Farmer profile required' });
    const farmer = await upsertFirebaseFarmer(req.user.uid, { email: req.user.email, name: req.body.name || req.user.name, phone: req.body.mobile }, req.body);
    res.json({ farmer });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Role check if provided
    if (role && user.role !== role) {
      return res.status(403).json({ error: `Account exists but role is ${user.role}` });
    }

    // Password verification (or bypass for quick demo logins)
    const valid = bcrypt.compareSync(password || '', user.passwordHash) || password === 'demo';
    if (!valid && password !== 'Admin@123' && password !== 'Operator@123' && password !== 'Farmer@123') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let farmer = null;
    let operator = null;

    if (user.role === 'FARMER') {
      farmer = db.farmers.find((f) => f.userId === user.id) || null;
    } else if (user.role === 'OPERATOR') {
      operator = db.operators.find((o) => o.userId === user.id) || null;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        farmerId: farmer?.id,
        operatorId: operator?.id,
        centreId: operator?.centreId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      farmer,
      operator,
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, mobile, password, village, district, landArea, preferredLanguage } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'Name, email, mobile, and password are required' });
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hash = bcrypt.hashSync(password, 8);
    const userId = `usr_farmer_${Date.now()}`;
    const newUser: any = {
      id: userId,
      name,
      email,
      mobile,
      passwordHash: hash,
      role: 'FARMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    const farmerIdCode = `MH-${(district || 'NAG').substring(0, 3).toUpperCase()}-2026-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;

    const newFarmer: any = {
      id: `frm_${Date.now()}`,
      userId: newUser.id,
      farmerId: farmerIdCode,
      village: village || 'Local Village',
      district: district || 'Nagpur',
      landArea: Number(landArea) || 5.0,
      preferredLanguage: preferredLanguage || 'en',
      createdAt: new Date().toISOString(),
    };
    db.farmers.push(newFarmer);

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: 'FARMER',
        farmerId: newFarmer.id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
      },
      farmer: newFarmer,
    });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let farmer = null;
    let operator = null;

    if (user.role === 'FARMER') {
      farmer = db.farmers.find((f) => f.userId === user.id) || null;
    } else if (user.role === 'OPERATOR') {
      operator = db.operators.find((o) => o.userId === user.id) || null;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      farmer,
      operator,
    });
  });

  // ==========================================
  // CROPS APIs
  // ==========================================

  app.get('/api/crops', (req, res) => {
    res.json(db.crops);
  });

  // ==========================================
  // PROCUREMENT CENTRES APIs
  // ==========================================

  app.get('/api/centres', (req, res) => {
    const result = db.centres.map((c) => {
      // Find accepted crops
      const cropIds = db.centreCrops.filter((cc) => cc.centreId === c.id && cc.active).map((cc) => cc.cropId);
      const acceptedCrops = db.crops.filter((cr) => cropIds.includes(cr.id));

      // Calculate today's queue count
      const activeQueueCount = db.bookings.filter(
        (b) => b.centreId === c.id && ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN'].includes(b.status)
      ).length;

      // Available slots today
      const today = new Date().toISOString().split('T')[0];
      const todaySlots = db.slots.filter((s) => s.centreId === c.id && s.date === today);
      const availableSlotsCount = todaySlots.filter((s) => s.booked < s.capacity && s.status === 'AVAILABLE').length;

      return {
        ...c,
        acceptedCrops,
        todayQueueCount: activeQueueCount,
        availableSlotsCount,
      };
    });

    res.json(result);
  });

  app.get('/api/centres/by-crop/:cropId', (req, res) => {
    const { cropId } = req.params;
    const matchingCentreIds = db.centreCrops
      .filter((cc) => cc.cropId === cropId && cc.active)
      .map((cc) => cc.centreId);

    const centres = db.centres
      .filter((c) => matchingCentreIds.includes(c.id) && c.active)
      .map((c) => {
        const cropIds = db.centreCrops.filter((cc) => cc.centreId === c.id && cc.active).map((cc) => cc.cropId);
        const acceptedCrops = db.crops.filter((cr) => cropIds.includes(cr.id));
        const activeQueueCount = db.bookings.filter(
          (b) => b.centreId === c.id && ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN'].includes(b.status)
        ).length;
        return {
          ...c,
          acceptedCrops,
          todayQueueCount: activeQueueCount,
        };
      });

    res.json(centres);
  });

  app.get('/api/centres/:id', (req, res) => {
    const centre = db.centres.find((c) => c.id === req.params.id);
    if (!centre) return res.status(404).json({ error: 'Centre not found' });

    const cropIds = db.centreCrops.filter((cc) => cc.centreId === centre.id && cc.active).map((cc) => cc.cropId);
    const acceptedCrops = db.crops.filter((cr) => cropIds.includes(cr.id));

    const today = new Date().toISOString().split('T')[0];
    const todaySlots = db.slots.filter((s) => s.centreId === centre.id && s.date === today);
    const queueSnapshot = db.getCentreQueueSnapshot(centre.id);

    res.json({
      ...centre,
      acceptedCrops,
      todaySlots,
      currentQueueCount: queueSnapshot.totalInQueue,
      queueSnapshot,
    });
  });

  app.get('/api/centres/:id/crops', (req, res) => {
    const cropIds = db.centreCrops.filter((cc) => cc.centreId === req.params.id && cc.active).map((cc) => cc.cropId);
    const crops = db.crops.filter((cr) => cropIds.includes(cr.id)).map((crop) => ({
      ...crop,
      rate: db.centreCrops.find((record) => record.centreId === req.params.id && record.cropId === crop.id)?.rate ?? null,
    }));
    res.json(crops);
  });

  app.patch('/api/centres/:id/crops/:cropId/rate', authenticate, requireCentreAccess('id'), (req: any, res) => {
    const rate = Number(req.body.rate);
    if (!Number.isFinite(rate) || rate <= 0) return res.status(400).json({ error: 'Enter a valid crop rate' });
    const cropLink = db.centreCrops.find((record) => record.centreId === req.params.id && record.cropId === req.params.cropId && record.active);
    if (!cropLink) return res.status(404).json({ error: 'Crop is not authorized at this centre' });
    cropLink.rate = rate;
    res.json({ message: 'Crop reference rate saved', cropId: cropLink.cropId, rate: cropLink.rate });
  });

  // ==========================================
  // SLOTS APIs
  // ==========================================

  app.get('/api/slots', (req, res) => {
    const { centreId, date } = req.query;
    let filtered = db.slots;
    if (centreId) filtered = filtered.filter((s) => s.centreId === centreId);
    if (date) filtered = filtered.filter((s) => s.date === date);

    // Map availability
    const enriched = filtered.map((s) => {
      const spacesAvailable = Math.max(0, s.capacity - s.booked);
      let status = s.status;
      if (spacesAvailable === 0) status = 'FULL';
      return {
        ...s,
        spacesAvailable,
        status,
      };
    });

    res.json(enriched);
  });

  // ==========================================
  // BOOKING APIs
  // ==========================================

  app.post('/api/bookings', authenticate, requireRoles('FARMER'), async (req: any, res) => {
    const { centreId, slotId, cropId, quantity } = req.body;
    const farmerId = req.user.farmerId;

    if (!farmerId) {
      return res.status(403).json({ error: 'Only registered farmers can book procurement slots' });
    }

    if (!centreId || !slotId || !cropId || !quantity) {
      return res.status(400).json({ error: 'Centre, slot, crop, and quantity are required' });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0 || qty > 500) {
      return res.status(400).json({ error: 'Please provide a valid produce quantity in quintals' });
    }

    const slot = db.slots.find((s) => s.id === slotId);
    if (!slot) return res.status(404).json({ error: 'Selected slot was not found' });

    const centre = db.centres.find((c) => c.id === centreId);
    if (!centre) return res.status(404).json({ error: 'Procurement centre not found' });

    const crop = db.crops.find((c) => c.id === cropId);
    if (!crop) return res.status(404).json({ error: 'Selected crop not found' });

    // Verify centre accepts this crop
    const accepted = db.centreCrops.some((cc) => cc.centreId === centreId && cc.cropId === cropId && cc.active);
    if (!accepted) {
      return res.status(400).json({ error: `This procurement centre does not currently accept ${crop.name}` });
    }

    const todayStr = slot.date.replace(/-/g, '');
    const newBooking: any = {
      id: `bk_${randomUUID()}`,
      bookingId: `BK-${todayStr}-${randomBytes(3).toString('hex').toUpperCase()}`,
      farmerId,
      centreId,
      slotId,
      cropId,
      quantity: qty,
      tokenNumber: '',
      status: 'BOOKED',
      bookedAt: new Date().toISOString(),
    };

    let savedBooking: any;
    try {
      savedBooking = await createBookingTransaction({ booking: newBooking, slotId, centreId, farmerId });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Could not reserve the selected slot' });
    }
    res.locals.skipFirestoreCollections = ['slots', 'bookings'];

    // Recalculate centre queue
    db.recalculateCenterQueue(centreId);
    broadcastQueueChange(centreId);

    // Create Notification
    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId,
      title: 'Slot Confirmed',
      message: `Your booking at ${centre.name} for ${crop.name} (${qty} quintals) is confirmed. Token: ${savedBooking.tokenNumber}.`,
      type: 'BOOKING',
      read: false,
      createdAt: new Date().toISOString(),
    });

    const live = db.getFarmerLiveQueue(farmerId);

    res.status(201).json({
      booking: savedBooking,
      token: savedBooking.tokenNumber,
      liveQueue: live,
    });
  });

  app.get('/api/bookings/my', authenticate, requireRoles('FARMER'), (req: any, res) => {
    const farmerId = req.user.farmerId;
    if (!farmerId) return res.status(403).json({ error: 'Farmer profile required' });

    const myBookings = db.bookings
      .filter((b) => b.farmerId === farmerId)
      .map((b) => {
        const centre = db.centres.find((c) => c.id === b.centreId);
        const crop = db.crops.find((c) => c.id === b.cropId);
        const slot = db.slots.find((s) => s.id === b.slotId);
        const procurement = db.procurements.find((p) => p.bookingId === b.id);
        const payment = procurement ? db.payments.find((py) => py.procurementId === procurement.id) : null;

        return {
          ...b,
          centreName: centre?.name || 'Procurement Centre',
          centreLocation: centre?.location || '',
          cropName: crop?.name || 'Produce',
          slotDate: slot?.date || '',
          slotTime: slot ? `${slot.startTime} – ${slot.endTime}` : '',
          procurement,
          payment,
        };
      })
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

    res.json(myBookings);
  });

  app.get('/api/bookings/:id', authenticate, requireBookingAccess(true), (req, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const centre = db.centres.find((c) => c.id === booking.centreId);
    const crop = db.crops.find((c) => c.id === booking.cropId);
    const slot = db.slots.find((s) => s.id === booking.slotId);

    res.json({
      ...booking,
      centre,
      crop,
      slot,
    });
  });

  app.patch('/api/bookings/:id/cancel', authenticate, requireRoles('FARMER'), requireBookingAccess(), async (req: any, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    let cancelled: any;
    try {
      cancelled = await cancelBookingTransaction(booking.id);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Could not cancel this booking' });
    }
    res.locals.skipFirestoreCollections = ['slots', 'bookings'];

    // Remove from queue and recalculate
    db.recalculateCenterQueue(booking.centreId);
    broadcastQueueChange(booking.centreId);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: booking.farmerId,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.tokenNumber}) has been cancelled successfully.`,
      type: 'BOOKING',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Booking successfully cancelled', booking: cancelled });
  });

  app.patch('/api/bookings/:id/reschedule', authenticate, requireRoles('FARMER'), requireBookingAccess(), async (req: any, res) => {
    const { newSlotId } = req.body;
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const newSlot = db.slots.find((s) => s.id === newSlotId);
    if (!newSlot) return res.status(404).json({ error: 'Target slot not found' });
    let updatedBooking: any;
    try {
      updatedBooking = await rescheduleBookingTransaction(booking.id, newSlotId);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Could not reschedule this booking' });
    }
    res.locals.skipFirestoreCollections = ['slots', 'bookings'];

    db.recalculateCenterQueue(booking.centreId);
    broadcastQueueChange(booking.centreId);

    res.json({ message: 'Booking rescheduled successfully', booking: updatedBooking, newSlot: db.slots.find((slot) => slot.id === newSlotId) });
  });

  // ==========================================
  // LIVE QUEUE & CENTRE OPERATIONS APIs
  // ==========================================

  app.get('/api/queue/farmer/live', authenticate, requireRoles('FARMER'), (req: any, res) => {
    const farmerId = req.user.farmerId;
    if (!farmerId) return res.status(403).json({ error: 'Farmer profile required' });

    const live = db.getFarmerLiveQueue(farmerId);
    res.json(live || { active: false, message: 'No active procurement booking in queue' });
  });

  app.get('/api/queue/centre/:centreId', authenticate, requireCentreAccess(), (req, res) => {
    const { centreId } = req.params;
    const snapshot = db.getCentreQueueSnapshot(centreId);
    res.json(snapshot);
  });

  // Centre operator or Farmer triggers arrival Check-in
  app.patch('/api/queue/:bookingId/check-in', authenticate, requireBookingAccess(true), (req: any, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'WAITING';
    booking.checkedInAt = new Date().toISOString();

    db.recalculateCenterQueue(booking.centreId);
    broadcastQueueChange(booking.centreId);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: booking.farmerId,
      title: 'Arrival Checked In',
      message: `Your arrival check-in for token ${booking.tokenNumber} is verified. You are now placed in the live queue.`,
      type: 'QUEUE',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Checked in successfully', booking });
  });

  // Centre Operator: Call Next Farmer
  app.patch('/api/queue/:bookingId/call', authenticate, requireOperatorBooking, (req: any, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'CALLED';
    booking.calledAt = new Date().toISOString();

    db.recalculateCenterQueue(booking.centreId);
    broadcastQueueChange(booking.centreId);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: booking.farmerId,
      title: 'Counter Call Ready!',
      message: `Token ${booking.tokenNumber}: Please proceed immediately to the procurement weighbridge counter.`,
      type: 'CALLED',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Farmer called to counter', booking });
  });

  // Centre Operator: Start Processing
  app.patch('/api/queue/:bookingId/start', authenticate, requireOperatorBooking, (req: any, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'PROCESSING';
    booking.processingStartedAt = new Date().toISOString();

    db.recalculateCenterQueue(booking.centreId);
    broadcastQueueChange(booking.centreId);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: booking.farmerId,
      title: 'Procurement Processing Started',
      message: `Token ${booking.tokenNumber}: Physical inspection, moisture check, and gross weighment in progress.`,
      type: 'QUEUE',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Processing started', booking });
  });

  // Centre Operator: Mark No-Show
  app.patch('/api/queue/:bookingId/no-show', authenticate, requireOperatorBooking, (req: any, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'NO_SHOW';

    db.recalculateCenterQueue(booking.centreId);
    broadcastQueueChange(booking.centreId);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: booking.farmerId,
      title: 'Marked No-Show',
      message: `Token ${booking.tokenNumber} was marked no-show due to non-attendance at the counter.`,
      type: 'QUEUE',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Marked as no-show', booking });
  });

  // Centre Operator: Broadcast delay notice
  app.post('/api/queue/:centreId/delay', authenticate, requireCentreAccess('centreId'), (req: any, res) => {
    const { minutes, reason } = req.body;
    const { centreId } = req.params;

    const activeBookings = db.bookings.filter(
      (b) => b.centreId === centreId && ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN'].includes(b.status)
    );

    for (const b of activeBookings) {
      db.notifications.push({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        farmerId: b.farmerId,
        title: 'Centre Delay Advisory',
        message: `Procurement operations delayed by ~${minutes || 20} mins: ${reason || 'Technical weighbridge recalibration'}. Estimated wait updated.`,
        type: 'DELAY',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.recalculateCenterQueue(centreId);
    broadcastQueueChange(centreId);

    res.json({ message: 'Delay broadcasted to active queue' });
  });

  // ==========================================
  // PROCUREMENT APIs
  // ==========================================

  // Centre Operator: Finalize Procurement
  app.post('/api/procurement', authenticate, requireRoles('OPERATOR', 'ADMIN'), requireOperatorBookingBody, (req: any, res) => {
    const { bookingId, deliveredQuantity, acceptedQuantity, qualityGrade, finalRate } = req.body;

    if (!bookingId || deliveredQuantity === undefined || acceptedQuantity === undefined || !finalRate) {
      return res.status(400).json({ error: 'Delivered quantity, accepted quantity, and final rate are required' });
    }

    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const delQty = Number(deliveredQuantity);
    const accQty = Number(acceptedQuantity);
    const rate = Number(finalRate);
    const totalAmount = Math.round(accQty * rate);

    booking.status = 'COMPLETED';
    booking.completedAt = new Date().toISOString();

    const newProcurement: any = {
      id: `prc_${Date.now()}`,
      bookingId: booking.id,
      farmerId: booking.farmerId,
      centreId: booking.centreId,
      cropId: booking.cropId,
      deliveredQuantity: delQty,
      acceptedQuantity: accQty,
      qualityGrade: qualityGrade || 'Grade A (FAQ)',
      finalRate: rate,
      totalAmount,
      status: 'VERIFIED',
      procurementDate: new Date().toISOString(),
    };
    db.procurements.push(newProcurement);

    // Initial Payment entry is explicitly NOT_FINALIZED per Core Principles 10, 11, 12!
    const newPayment: any = {
      id: `pay_${Date.now()}`,
      procurementId: newProcurement.id,
      farmerId: booking.farmerId,
      amount: totalAmount,
      status: 'NOT_FINALIZED',
    };
    db.payments.push(newPayment);

    // Remove from live queue & broadcast
    db.recalculateCenterQueue(booking.centreId);
    broadcastQueueChange(booking.centreId);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: booking.farmerId,
      title: 'Procurement Verified & Completed',
      message: `Your produce of ${accQty} quintals has been accepted at ${qualityGrade || 'Grade A'}. Payment verification initiated.`,
      type: 'PROCUREMENT',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      procurement: newProcurement,
      payment: newPayment,
    });
  });

  app.get('/api/procurement/my', authenticate, requireRoles('FARMER'), (req: any, res) => {
    const farmerId = req.user.farmerId;
    if (!farmerId) return res.status(403).json({ error: 'Farmer profile required' });

    const records = db.procurements
      .filter((p) => p.farmerId === farmerId)
      .map((p) => {
        const crop = db.crops.find((c) => c.id === p.cropId);
        const centre = db.centres.find((c) => c.id === p.centreId);
        const booking = db.bookings.find((b) => b.id === p.bookingId);
        const payment = db.payments.find((pay) => pay.procurementId === p.id);

        return {
          ...p,
          cropName: crop?.name || 'Produce',
          centreName: centre?.name || 'Procurement Centre',
          tokenNumber: booking?.tokenNumber || 'TOK',
          paymentStatus: payment?.status || 'NOT_FINALIZED',
          payment,
        };
      })
      .sort((a, b) => new Date(b.procurementDate).getTime() - new Date(a.procurementDate).getTime());

    res.json(records);
  });

  app.get('/api/procurement/centre/:centreId', authenticate, requireCentreAccess(), (req, res) => {
    const { centreId } = req.params;
    const records = db.procurements
      .filter((p) => p.centreId === centreId)
      .map((p) => {
        const farmer = db.farmers.find((f) => f.id === p.farmerId);
        const user = farmer ? db.users.find((u) => u.id === farmer.userId) : null;
        const crop = db.crops.find((c) => c.id === p.cropId);
        const booking = db.bookings.find((b) => b.id === p.bookingId);
        const payment = db.payments.find((pay) => pay.procurementId === p.id);

        return {
          ...p,
          farmerName: user?.name || 'Farmer',
          farmerIdCode: farmer?.farmerId || '',
          village: farmer?.village || '',
          cropName: crop?.name || 'Produce',
          tokenNumber: booking?.tokenNumber || 'TOK',
          payment,
        };
      })
      .sort((a, b) => new Date(b.procurementDate).getTime() - new Date(a.procurementDate).getTime());

    res.json(records);
  });

  // ==========================================
  // PAYMENT STATUS APIs
  // ==========================================

  app.get('/api/payments/my', authenticate, requireRoles('FARMER'), (req: any, res) => {
    const farmerId = req.user.farmerId;
    if (!farmerId) return res.status(403).json({ error: 'Farmer profile required' });

    const farmerPayments = db.payments
      .filter((p) => p.farmerId === farmerId)
      .map((p) => {
        const procurement = db.procurements.find((pr) => pr.id === p.procurementId);
        const crop = procurement ? db.crops.find((c) => c.id === procurement.cropId) : null;
        const centre = procurement ? db.centres.find((c) => c.id === procurement.centreId) : null;
        const booking = procurement ? db.bookings.find((b) => b.id === procurement.bookingId) : null;

        return {
          id: p.id,
          procurementId: p.procurementId,
          farmerId: p.farmerId,
          status: p.status,
          // CRITICAL: Amount, method, and transaction are ONLY exposed if finalized!
          amount: p.status === 'NOT_FINALIZED' ? null : p.amount,
          paymentMethod: p.status === 'NOT_FINALIZED' ? null : p.paymentMethod,
          transactionId: p.status === 'NOT_FINALIZED' ? null : p.transactionId,
          finalizedAt: p.finalizedAt,
          completedAt: p.completedAt,
          cropName: crop?.name || 'Produce',
          acceptedQuantity: procurement?.acceptedQuantity || 0,
          centreName: centre?.name || 'Procurement Centre',
          tokenNumber: booking?.tokenNumber || 'TOK',
          procurementDate: procurement?.procurementDate,
        };
      })
      .sort((a, b) => (b.finalizedAt ? 1 : -1));

    res.json(farmerPayments);
  });

  app.get('/api/payments/centre/:centreId', authenticate, requireCentreAccess(), (req, res) => {
    const { centreId } = req.params;
    const records = db.payments
      .filter((p) => {
        const proc = db.procurements.find((pr) => pr.id === p.procurementId);
        return proc && proc.centreId === centreId;
      })
      .map((p) => {
        const proc = db.procurements.find((pr) => pr.id === p.procurementId);
        const farmer = proc ? db.farmers.find((f) => f.id === proc.farmerId) : null;
        const user = farmer ? db.users.find((u) => u.id === farmer.userId) : null;
        const crop = proc ? db.crops.find((c) => c.id === proc.cropId) : null;
        const booking = proc ? db.bookings.find((b) => b.id === proc.bookingId) : null;

        return {
          ...p,
          farmerName: user?.name || 'Farmer',
          farmerIdCode: farmer?.farmerId || '',
          cropName: crop?.name || 'Produce',
          acceptedQuantity: proc?.acceptedQuantity || 0,
          tokenNumber: booking?.tokenNumber || 'TOK',
        };
      });

    res.json(records);
  });

  // Centre Operator/Admin: Finalize Payment -> ON_THE_WAY
  app.patch('/api/payments/:id/finalize', authenticate, requireRoles('FARMER'), (req: any, res) => {
    const payment = db.payments.find((p) => p.id === req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });
    if (payment.farmerId !== req.user.farmerId) return res.status(403).json({ error: 'This payment is outside your farmer profile' });

    const { paymentMethod, transactionId } = req.body;
    payment.status = 'ON_THE_WAY';
    payment.paymentMethod = paymentMethod || 'DBT Direct Bank Transfer';
    payment.transactionId =
      transactionId || `DBT-2026-NAG-${String(Math.floor(10000 + Math.random() * 90000))}`;
    payment.finalizedAt = new Date().toISOString();

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: payment.farmerId,
      title: 'Payment On the Way',
      message: `Your procurement payment of ₹${payment.amount.toLocaleString()} has been authorized and dispatched via ${
        payment.paymentMethod
      } (Txn: ${payment.transactionId}).`,
      type: 'PAYMENT',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Payment finalized and marked ON_THE_WAY', payment });
  });

  // Mark Payment as COMPLETED
  app.patch('/api/payments/:id/complete', authenticate, requireRoles('OPERATOR', 'ADMIN'), requirePaymentCentreAccess, (req: any, res) => {
    const payment = db.payments.find((p) => p.id === req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    payment.status = 'COMPLETED';
    payment.completedAt = new Date().toISOString();

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: payment.farmerId,
      title: 'Payment Credited Successfully',
      message: `Payment of ₹${payment.amount.toLocaleString()} has been confirmed credited to your Aadhaar-linked bank account.`,
      type: 'PAYMENT',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Payment marked as COMPLETED', payment });
  });

  // ==========================================
  // NOTIFICATIONS APIs
  // ==========================================

  app.get('/api/notifications', authenticate, requireRoles('FARMER'), (req: any, res) => {
    const farmerId = req.user.farmerId;
    if (!farmerId) return res.status(403).json({ error: 'Farmer profile required' });

    const list = db.notifications
      .filter((n) => n.farmerId === farmerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = list.filter((n) => !n.read).length;
    res.json({ notifications: list, unreadCount });
  });

  app.patch('/api/notifications/:id/read', authenticate, requireRoles('FARMER'), (req, res) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  app.patch('/api/notifications/read-all', authenticate, requireRoles('FARMER'), (req: any, res) => {
    const farmerId = req.user.farmerId;
    if (farmerId) {
      db.notifications.filter((n) => n.farmerId === farmerId).forEach((n) => (n.read = true));
    }
    res.json({ success: true });
  });

  // ==========================================
  // ADMIN DASHBOARD & MANAGEMENT APIs
  // ==========================================

  app.get('/api/admin/dashboard', authenticate, requireRoles('ADMIN'), (req: any, res) => {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalFarmers = db.farmers.length;
    const totalCentres = db.centres.length;
    const activeCentres = db.centres.filter((c) => c.active).length;
    const totalBookings = db.bookings.length;
    const totalCompleted = db.bookings.filter((b) => b.status === 'COMPLETED').length;
    const totalInQueue = db.bookings.filter((b) =>
      ['PROCESSING', 'CALLED', 'WAITING', 'CHECKED_IN'].includes(b.status)
    ).length;

    const totalDeliveredQuintals = db.procurements.reduce((acc, p) => acc + p.acceptedQuantity, 0);
    const totalProcurementValue = db.procurements.reduce((acc, p) => acc + p.totalAmount, 0);

    const centreStatusSummary = db.centres.map((c) => {
      const q = db.getCentreQueueSnapshot(c.id);
      return {
        id: c.id,
        name: c.name,
        location: c.location,
        active: c.active,
        queueCount: q.totalInQueue,
        processing: q.currentlyProcessing ? q.currentlyProcessing.tokenNumber : 'Idle',
      };
    });

    res.json({
      metrics: {
        totalFarmers,
        totalCentres,
        activeCentres,
        totalBookings,
        totalCompleted,
        totalInQueue,
        totalDeliveredQuintals: Math.round(totalDeliveredQuintals),
        totalProcurementValue: Math.round(totalProcurementValue),
      },
      centreStatusSummary,
    });
  });

  app.get('/api/admin/farmers', authenticate, requireRoles('ADMIN', 'OPERATOR'), (req: any, res) => {
    const farmersList = db.farmers.map((f) => {
      const user = db.users.find((u) => u.id === f.userId);
      const bookingsCount = db.bookings.filter((b) => b.farmerId === f.id).length;
      const completedCount = db.procurements.filter((p) => p.farmerId === f.id).length;

      return {
        ...f,
        name: user?.name || 'Farmer',
        email: user?.email || '',
        mobile: user?.mobile || '',
        bookingsCount,
        completedCount,
      };
    });

    if (req.user.role === 'OPERATOR') {
      const centreFarmerIds = new Set(db.bookings.filter((booking) => booking.centreId === req.user.centreId).map((booking) => booking.farmerId));
      return res.json(farmersList.filter((farmer: any) => centreFarmerIds.has(farmer.id)));
    }
    res.json(farmersList);
  });

  app.get('/api/admin/operators', authenticate, requireRoles('ADMIN'), (req: any, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const operatorsList = db.operators.map((o) => {
      const user = db.users.find((u) => u.id === o.userId);
      const centre = db.centres.find((c) => c.id === o.centreId);
      return {
        ...o,
        name: user?.name || 'Operator',
        email: user?.email || '',
        mobile: user?.mobile || '',
        centreName: centre?.name || 'Unknown Centre',
      };
    });

    res.json(operatorsList);
  });

  app.post('/api/admin/centres', authenticate, requireRoles('ADMIN'), (req: any, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const {
      name,
      location,
      district,
      state,
      pincode,
      workingStart,
      workingEnd,
      dailyCapacity,
      averageProcessingMinutes,
      quantityProcessingFactor,
      cropIds,
    } = req.body;

    if (!name || !location || !district) {
      return res.status(400).json({ error: 'Name, location, and district are required' });
    }

    const newCentre: any = {
      id: `ctr_${Date.now()}`,
      name,
      location,
      district,
      state: state || 'Maharashtra',
      pincode: pincode || '440001',
      latitude: 21.1458,
      longitude: 79.0882,
      workingStart: workingStart || '09:00',
      workingEnd: workingEnd || '17:00',
      dailyCapacity: Number(dailyCapacity) || 40,
      averageProcessingMinutes: Number(averageProcessingMinutes) || 12,
      quantityProcessingFactor: Number(quantityProcessingFactor) || 1.1,
      gracePeriodMinutes: 30,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.centres.push(newCentre);

    if (Array.isArray(cropIds)) {
      for (const crId of cropIds) {
        db.centreCrops.push({
          id: `cc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          centreId: newCentre.id,
          cropId: crId,
          active: true,
        });
      }
    }

    res.status(201).json(newCentre);
  });

  app.patch('/api/admin/centres/:id', authenticate, requireRoles('ADMIN'), (req: any, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const centre = db.centres.find((c) => c.id === req.params.id);
    if (!centre) return res.status(404).json({ error: 'Centre not found' });

    Object.assign(centre, req.body, { updatedAt: new Date().toISOString() });
    res.json(centre);
  });

  app.get('/api/admin/bookings', authenticate, requireRoles('ADMIN', 'OPERATOR'), (req: any, res) => {
    const requestedCentre = String(req.query.centreId || '');
    if (req.user.role === 'OPERATOR' && requestedCentre && requestedCentre !== req.user.centreId) return res.status(403).json({ error: 'This procurement centre is outside your authorization' });
    const centreId = req.user.role === 'OPERATOR' ? req.user.centreId : requestedCentre;
    let list = db.bookings;
    if (centreId) list = list.filter((b) => b.centreId === centreId);

    const formatted = list.map((b) => {
      const farmer = db.farmers.find((f) => f.id === b.farmerId);
      const user = farmer ? db.users.find((u) => u.id === farmer.userId) : null;
      const crop = db.crops.find((c) => c.id === b.cropId);
      const centre = db.centres.find((c) => c.id === b.centreId);
      const slot = db.slots.find((s) => s.id === b.slotId);

      return {
        ...b,
        farmerName: user?.name || 'Farmer',
        farmerMobile: user?.mobile || '',
        cropName: crop?.name || 'Crop',
        centreName: centre?.name || 'Centre',
        slotDate: slot?.date || '',
        slotTime: slot ? `${slot.startTime} - ${slot.endTime}` : '',
      };
    }).sort((a, b) => new Date(b.bookedAt || '').getTime() - new Date(a.bookedAt || '').getTime());

    res.json(req.user.role === 'OPERATOR' ? formatted.filter((booking: any) => booking.centreId === req.user.centreId) : formatted);
  });

  app.get('/api/admin/procurements', authenticate, requireRoles('ADMIN'), (req: any, res) => {
    const formatted = db.procurements.map((p) => {
      const farmer = db.farmers.find((f) => f.id === p.farmerId);
      const user = farmer ? db.users.find((u) => u.id === farmer.userId) : null;
      const crop = db.crops.find((c) => c.id === p.cropId);
      const centre = db.centres.find((c) => c.id === p.centreId);
      const booking = db.bookings.find((b) => b.id === p.bookingId);

      return {
        ...p,
        slipNumber: `SLIP-${p.id.substring(4, 10).toUpperCase()}`,
        farmerName: user?.name || 'Farmer',
        cropName: crop?.name || 'Produce',
        centreName: centre?.name || 'Centre',
        tokenNumber: booking?.tokenNumber || 'TOK',
        grossAmount: p.totalAmount,
        moisturePercentage: 12.5,
        grade: p.qualityGrade?.includes('A') ? 'A' : 'B',
        createdAt: p.procurementDate,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (req.user.role === 'OPERATOR') {
      const centreFarmerIds = new Set(db.bookings.filter((booking) => booking.centreId === req.user.centreId).map((booking) => booking.farmerId));
      return res.json(formatted.filter((farmer: any) => centreFarmerIds.has(farmer.id)));
    }
    res.json(formatted);
  });

  app.get('/api/admin/payments', authenticate, requireRoles('ADMIN'), (req: any, res) => {
    const formatted = db.payments.map((p) => {
      const procurement = db.procurements.find((pr) => pr.id === p.procurementId);
      const farmer = db.farmers.find((f) => f.id === p.farmerId);
      const user = farmer ? db.users.find((u) => u.id === farmer.userId) : null;
      const centre = procurement ? db.centres.find((c) => c.id === procurement.centreId) : null;

      return {
        ...p,
        farmerName: user?.name || 'Farmer',
        centreName: centre?.name || 'Centre',
        accountLastFour: '4921',
        transactionRef: p.transactionId || (p.status !== 'NOT_FINALIZED' ? `DBT-PFMS-${p.id.slice(-6)}` : null),
      };
    });

    res.json(formatted);
  });

  app.post('/api/admin/operators', authenticate, requireRoles('ADMIN'), (req: any, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
    const { name, email, mobile, badgeNo, centreId, password } = req.body;

    const newUser: any = {
      id: `usr_op_${Date.now()}`,
      name,
      email,
      mobile,
      passwordHash: bcrypt.hashSync(password || 'Operator@123', 8),
      role: 'OPERATOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    const newOp: any = {
      id: `op_${Date.now()}`,
      userId: newUser.id,
      centreId: centreId || db.centres[0]?.id || 'centre-parseoni',
      badgeNo: badgeNo || `REG-PRS-00${db.operators.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.operators.push(newOp);

    res.status(201).json({ ...newOp, name, email, mobile });
  });

  // Call Next Farmer in Centre
  app.post('/api/queue/centre/:centreId/call-next', authenticate, requireCentreAccess(), (req: any, res) => {
    const { centreId } = req.params;
    const waiting = db.bookings.filter(
      (b) => b.centreId === centreId && (b.status === 'WAITING' || b.status === 'CHECKED_IN')
    );

    if (waiting.length === 0) {
      return res.status(400).json({ error: 'No farmers currently waiting in queue' });
    }

    const nextBooking = waiting[0];
    nextBooking.status = 'CALLED';

    db.recalculateCenterQueue(centreId);
    broadcastQueueChange(centreId);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      farmerId: nextBooking.farmerId,
      title: 'Token Called to Weighbridge!',
      message: `Token ${nextBooking.tokenNumber} is now called! Please proceed with your vehicle to Weighbridge Platform #1 immediately.`,
      type: 'CALLED',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json(db.getCentreQueueSnapshot(centreId));
  });

  // Direct payment status updater (for operators & finance desk)
  app.patch('/api/payments/:id/status', authenticate, requireRoles('OPERATOR', 'ADMIN'), requirePaymentCentreAccess, (req: any, res) => {
    const { status, transactionRef } = req.body;
    const payment = db.payments.find((p) => p.id === req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.status = status;
    if (transactionRef) {
      payment.transactionId = transactionRef;
    }
    if (status === 'COMPLETED') {
      payment.completedAt = new Date().toISOString();
      db.notifications.push({
        id: `notif_${Date.now()}`,
        farmerId: payment.farmerId,
        title: 'Direct Benefit Transfer Credited!',
        message: `DBT Payment of ₹${payment.amount} has been successfully credited to your Aadhaar-linked bank account. Ref: ${payment.transactionId || 'PFMS'}`,
        type: 'PAYMENT',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.json(payment);
  });

  // ==========================================
  // AI QUALITY ASSISTANCE MODULE (Modular Innovation Feature)
  // ==========================================
  app.post('/api/quality/analyze', authenticate, requireRoles('FARMER'), async (req: any, res) => {
    try {
      const { imageBase64, cropName, produceType: _produceType, referenceImageBase64, referenceDescription } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Produce image is required for preliminary quality analysis' });
      }

      // Check if Gemini API key is available
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const toInlineData = (image: string) => {
          const match = image.match(/^data:(image\/[^;]+);base64,(.*)$/);
          return { mimeType: match?.[1] || 'image/jpeg', data: match?.[2] || image };
        };
        const produceImage = toInlineData(imageBase64);
        const referenceImage = referenceImageBase64 ? toInlineData(referenceImageBase64) : null;

        let response;
        let attempts = 0;
        const maxAttempts = 4;
        let lastError: any = null;

        while (attempts < maxAttempts) {
          try {
            response = await ai.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are an agricultural quality assessment advisor. Analyze this agricultural produce sample (${cropName || 'Grains'}).
${referenceImage ? `Compare it specifically with the supplied ${referenceDescription || 'procurement centre reference'} image. Treat that image as the centre's best-quality visual standard and describe the produce image's relative quality.` : ''}
Assess only visual quality and similarity to the reference. Do not infer or state moisture, impurity percentages, exact foreign-matter percentages, or procurement prices.
Provide a strictly structured JSON response in this format:
{
  "estimatedGrade": "Grade A" or "Grade B" or "Grade C",
  "visualSimilarityPercentage": 89,
  "uniformity": "High" or "Medium" or "Low",
  "visibleDamage": "Low" or "Medium" or "High",
  "discoloration": "Low" or "Medium" or "High",
  "visibleForeignMatter": "Low" or "Medium" or "High"
}`,
                    },
                    {
                      inlineData: produceImage,
                    },
                    ...(referenceImage ? [{ inlineData: referenceImage }] : []),
                  ],
                },
              ],
            });
            break;
          } catch (error: any) {
            lastError = error;
            attempts++;
            const status = error.status || (error.response && error.response.status);
            if ((status === 503 || status === 429) && attempts < maxAttempts) {
              // Exponential backoff: ~2s, ~4s, ~8s with jitter to avoid thundering herd
              const baseDelay = Math.pow(2, attempts) * 1000;
              const jitter = Math.random() * 500;
              await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
              continue;
            }
            throw error;
          }
        }

        if (!response) {
          // All retries exhausted without a successful response
          const statusCode = lastError?.status || 503;
          return res.status(statusCode === 429 ? 429 : 503).json({
            error: 'AI analysis service is temporarily unavailable due to high demand. Please try again in a few minutes.',
            retryable: true,
          });
        }

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        } else {
          throw new Error("Invalid format received from Gemini AI");
        }
      } catch (genErr: any) {
        console.error('[Quality AI] Analysis error:', genErr.name || 'Error', genErr.message || '');
        const status = genErr.status || (genErr.response && genErr.response.status);
        if (status === 503 || status === 429) {
          return res.status(status === 429 ? 429 : 503).json({
            error: 'AI analysis service is temporarily unavailable due to high demand. Please try again in a few minutes.',
            retryable: true,
          });
        }
        return res.status(500).json({
          error: 'Gemini AI analysis failed. Please try again later.',
        });
      }
    } catch (err: any) {
      console.error('[Quality AI] Unexpected error:', err.message || '');
      res.status(500).json({ error: 'Quality analysis failed. Please try again later.' });
    }
  });

  try {
    await adminCredential.getAccessToken();
    await initializeFirestoreStore();
  } catch (error: any) {
    throw new Error(`Firebase Admin/Firestore could not connect to ${process.env.FIREBASE_PROJECT_ID || 'kisan-marg-19c0a'}. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_PATH to a valid local service-account JSON file. ${error.message}`);
  }
  watchFirestoreChanges((collection) => {
    if (['bookings', 'slots', 'queue', 'procurements', 'payments'].includes(collection)) {
      for (const centre of db.centres) broadcastQueueChange(centre.id);
    }
    io.emit('firestore_updated', { collection, timestamp: Date.now() });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`KisanSetu Server & Socket.IO running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
