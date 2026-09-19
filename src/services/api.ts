const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('kisansetu_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('kisansetu_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('kisansetu_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password?: string; role?: string }) =>
    request<{ token: string; user: any; farmer: any; operator: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (farmerData: any) =>
    request<{ token: string; user: any; farmer: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(farmerData),
    }),

  getMe: () => request<{ user: any; farmer: any; operator: any }>('/auth/me'),

  // Crops
  getCrops: () => request<any[]>('/crops'),

  // Centres
  getCentres: () => request<any[]>('/centres'),
  getCentre: (id: string) => request<any>(`/centres/${id}`),
  getCentresByCrop: (cropId: string) => request<any[]>(`/centres/by-crop/${cropId}`),
  getCentreCrops: (centreId: string) => request<any[]>(`/centres/${centreId}/crops`),

  // Slots
  getSlots: (params: { centreId?: string; date?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/slots?${query}`);
  },

  // Bookings
  createBooking: (data: { centreId: string; slotId: string; cropId: string; quantity: number }) =>
    request<{ booking: any; token: string; liveQueue: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyBookings: () => request<any[]>('/bookings/my'),
  getBooking: (id: string) => request<any>(`/bookings/${id}`),
  cancelBooking: (id: string) =>
    request<{ message: string; booking: any }>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    }),
  rescheduleBooking: (id: string, newSlotId: string) =>
    request<{ message: string; booking: any }>(`/bookings/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ newSlotId }),
    }),

  // Queue
  getFarmerLiveQueue: () => request<any>('/queue/farmer/live'),
  getCentreQueue: (centreId: string) => request<any>(`/queue/centre/${centreId}`),
  getCenterTodayQueue: (centreId: string) => request<any>(`/queue/centre/${centreId}`),
  checkIn: (bookingId: string) =>
    request<any>(`/queue/${bookingId}/check-in`, {
      method: 'PATCH',
    }),
  checkInFarmer: (bookingId: string) =>
    request<any>(`/queue/${bookingId}/check-in`, {
      method: 'PATCH',
    }),
  callFarmer: (bookingId: string) =>
    request<any>(`/queue/${bookingId}/call`, {
      method: 'PATCH',
    }),
  callNextFarmer: (centreId: string) =>
    request<any>(`/queue/centre/${centreId}/call-next`, {
      method: 'POST',
    }),
  startProcessing: (bookingId: string) =>
    request<any>(`/queue/${bookingId}/start`, {
      method: 'PATCH',
    }),
  updateBookingStatus: (bookingId: string, status: string) => {
    if (status === 'CHECKED_IN') return request<any>(`/queue/${bookingId}/check-in`, { method: 'PATCH' });
    if (status === 'CALLED') return request<any>(`/queue/${bookingId}/call`, { method: 'PATCH' });
    if (status === 'PROCESSING') return request<any>(`/queue/${bookingId}/start`, { method: 'PATCH' });
    return request<any>(`/queue/${bookingId}/call`, { method: 'PATCH' });
  },
  markNoShow: (bookingId: string) =>
    request<any>(`/queue/${bookingId}/no-show`, {
      method: 'PATCH',
    }),
  broadcastDelay: (centreId: string, data: { minutes: number; reason: string }) =>
    request<any>(`/queue/${centreId}/delay`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Procurement
  completeProcurement: (data: {
    bookingId: string;
    deliveredQuantity: number;
    acceptedQuantity: number;
    qualityGrade: string;
    finalRate: number;
  }) =>
    request<any>('/procurement', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createProcurementSlip: (data: {
    bookingId: string;
    deliveredQuantity: number;
    acceptedQuantity: number;
    moisturePercentage: number;
    grade: string;
    sanctionedRate: number;
  }) =>
    request<any>('/procurement', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: data.bookingId,
        deliveredQuantity: data.deliveredQuantity,
        acceptedQuantity: data.acceptedQuantity,
        qualityGrade: `Grade ${data.grade}`,
        finalRate: data.sanctionedRate,
      }),
    }),
  getMyProcurements: () => request<any[]>('/procurement/my'),
  getCentreProcurements: (centreId: string) => request<any[]>(`/procurement/centre/${centreId}`),
  getAllProcurements: () => request<any[]>('/admin/procurements'),

  // Payments
  getMyPayments: () => request<any[]>('/payments/my'),
  getCentrePayments: (centreId: string) => request<any[]>(`/payments/centre/${centreId}`),
  getAllPayments: () => request<any[]>('/admin/payments'),
  updatePaymentStatus: (id: string, data: { status: string; transactionRef?: string }) =>
    request<any>(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  finalizePayment: (id: string, data: { paymentMethod?: string; transactionId?: string }) =>
    request<any>(`/payments/${id}/finalize`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  markPaymentComplete: (id: string) =>
    request<any>(`/payments/${id}/complete`, {
      method: 'PATCH',
    }),

  // Notifications
  getNotifications: () => request<{ notifications: any[]; unreadCount: number }>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),

  // Admin
  getAdminDashboard: () => request<any>('/admin/dashboard'),
  getAdminStats: () => request<any>('/admin/dashboard'),
  getAdminFarmers: () => request<any[]>('/admin/farmers'),
  getFarmers: () => request<any[]>('/admin/farmers'),
  getAdminOperators: () => request<any[]>('/admin/operators'),
  getOperators: () => request<any[]>('/admin/operators'),
  createOperator: (data: any) =>
    request<any>('/admin/operators', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAllBookings: (params?: { centreId?: string }) => {
    const q = params?.centreId ? `?centreId=${params.centreId}` : '';
    return request<any[]>(`/admin/bookings${q}`);
  },
  createAdminCentre: (data: any) =>
    request<any>('/admin/centres', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createCentre: (data: any) =>
    request<any>('/admin/centres', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminCentre: (id: string, data: any) =>
    request<any>(`/admin/centres/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // AI Quality Check
  analyzeProduceQuality: (data: { imageBase64: string; cropName: string }) =>
    request<any>('/quality/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  analyzeCropQuality: (imageBase64: string, cropName: string, referenceImageBase64?: string, referenceDescription?: string) =>
    request<any>('/quality/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, cropName, referenceImageBase64, referenceDescription }),
    }),
};
