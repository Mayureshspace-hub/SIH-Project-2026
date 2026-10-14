import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { FarmerLayout } from './layouts/FarmerLayout';
import { OperatorLayout } from './layouts/OperatorLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { PublicCentresPage } from './pages/public/PublicCentresPage';
import { PublicCentreDetailPage } from './pages/public/PublicCentreDetailPage';
import { RoleSelectionLoginPage } from './pages/public/RoleSelectionLoginPage';
import { FarmerRegisterPage } from './pages/public/FarmerRegisterPage';
import { VerifyEmailPage } from './pages/public/VerifyEmailPage';
import { AdminLoginPage } from './pages/public/AdminLoginPage';

// Farmer Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FindCentresPage } from './pages/farmer/FindCentresPage';
import { CentreDetailPage } from './pages/farmer/CentreDetailPage';
import { BookSlotPage } from './pages/farmer/BookSlotPage';
import { LiveQueuePage } from './pages/farmer/LiveQueuePage';
import { MyBookingsPage } from './pages/farmer/MyBookingsPage';
import { ProcurementPage } from './pages/farmer/ProcurementPage';
import { PaymentStatusPage } from './pages/farmer/PaymentStatusPage';
import { NotificationsPage } from './pages/farmer/NotificationsPage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';

// Operator Pages
import { OperatorDashboard } from './pages/operator/OperatorDashboard';
import { TodayQueuePage } from './pages/operator/TodayQueuePage';
import { ProcurementSlipPage } from './pages/operator/ProcurementSlipPage';
import { PaymentUpdatesPage } from './pages/operator/PaymentUpdatesPage';
import { OperatorFarmersPage } from './pages/operator/OperatorFarmersPage';
import { OperatorBookingsPage } from './pages/operator/OperatorBookingsPage';
import { DailyReportsPage } from './pages/operator/DailyReportsPage';
import { CentreProfilePage } from './pages/operator/CentreProfilePage';
import { KnowledgeManagementPage } from './pages/operator/KnowledgeManagementPage';
import { ReferenceImageManagementPage } from './pages/operator/ReferenceImageManagementPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCentresPage } from './pages/admin/AdminCentresPage';
import { AdminOperatorsPage } from './pages/admin/AdminOperatorsPage';
import { AdminFarmersPage } from './pages/admin/AdminFarmersPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminQueuePage } from './pages/admin/AdminQueuePage';
import { AdminProcurementPage } from './pages/admin/AdminProcurementPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Flow */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/centres" element={<PublicCentresPage />} />
              <Route path="/centres/:id" element={<PublicCentreDetailPage />} />
              <Route path="/login" element={<RoleSelectionLoginPage />} />
              <Route path="/register" element={<FarmerRegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* Farmer Flow */}
            <Route element={<FarmerLayout />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/centres" element={<FindCentresPage />} />
              <Route path="/farmer/centres/:id" element={<CentreDetailPage />} />
              <Route path="/farmer/book-slot" element={<BookSlotPage />} />
              <Route path="/farmer/queue" element={<LiveQueuePage />} />
              <Route path="/farmer/bookings" element={<MyBookingsPage />} />
              <Route path="/farmer/procurement" element={<ProcurementPage />} />
              <Route path="/farmer/payments" element={<PaymentStatusPage />} />
              <Route path="/farmer/notifications" element={<NotificationsPage />} />
              <Route path="/farmer/profile" element={<FarmerProfilePage />} />
            </Route>

            {/* Operator Flow */}
            <Route element={<OperatorLayout />}>
              <Route path="/operator/dashboard" element={<OperatorDashboard />} />
              <Route path="/operator/queue" element={<TodayQueuePage />} />
              <Route path="/operator/farmers" element={<OperatorFarmersPage />} />
              <Route path="/operator/bookings" element={<OperatorBookingsPage />} />
              <Route path="/operator/procurement" element={<ProcurementSlipPage />} />
              <Route path="/operator/payments" element={<PaymentUpdatesPage />} />
              <Route path="/operator/reports" element={<DailyReportsPage />} />
              <Route path="/operator/profile" element={<CentreProfilePage />} />
              <Route path="/operator/knowledge-hub" element={<KnowledgeManagementPage />} />
              <Route path="/operator/ai-image-analysis" element={<ReferenceImageManagementPage />} />
            </Route>

            {/* Admin Flow */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/centres" element={<AdminCentresPage />} />
              <Route path="/admin/operators" element={<AdminOperatorsPage />} />
              <Route path="/admin/farmers" element={<AdminFarmersPage />} />
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/queue" element={<AdminQueuePage />} />
              <Route path="/admin/procurement" element={<AdminProcurementPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
