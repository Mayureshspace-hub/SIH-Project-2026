import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Ticket,
  Scale,
  CreditCard,
  Building2,
  LogOut,
  MapPin,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProcurementOverview } from './ProcurementOverview';
import { FarmerManagement } from './FarmerManagement';
import { SlotManagement } from './SlotManagement';
import { TokenManagement } from './TokenManagement';
import { ProcurementManagement } from './ProcurementManagement';
import { PaymentTracking } from './PaymentTracking';

export type ProcurementDashboardTab =
  | 'overview'
  | 'farmers'
  | 'slots'
  | 'tokens'
  | 'procurement'
  | 'payments';

interface TabItem {
  id: ProcurementDashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortLabel: string;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { id: 'farmers', label: 'Farmer Management', shortLabel: 'Farmers', icon: Users },
  { id: 'slots', label: 'Slot Management', shortLabel: 'Slots', icon: CalendarCheck },
  { id: 'tokens', label: 'Token & Queue', shortLabel: 'Tokens', icon: Ticket },
  { id: 'procurement', label: 'Procurement Entry', shortLabel: 'Procurement', icon: Scale },
  { id: 'payments', label: 'Payment Tracking', shortLabel: 'Payments', icon: CreditCard },
];

export const ProcurementDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ProcurementDashboardTab) || 'overview';
  const [activeTab, setActiveTab] = useState<ProcurementDashboardTab>(initialTab);

  const { user, operator, logout } = useAuth();
  const navigate = useNavigate();

  // Keep search params in sync with active tab
  const handleTabChange = (tab: ProcurementDashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col font-sans">
      {/* Top Centre Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Branding & Centre Scope */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#0f5e59] to-[#0a403d] text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#f7c531]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-gray-900 tracking-tight">
                    Parseoni APMC Centre
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-[#0f5e59] border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-[#0f5e59]" />
                    Official Operator
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    Nagpur District &bull; Centre ID: <code className="font-mono text-gray-700">ctr_parseoni</code>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Operator Badge & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-gray-900">
                  {user?.name || 'Procurement In-Charge'}
                </span>
                <span className="text-[11px] text-gray-500">
                  {user?.email || 'operator@parseoni.demo'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                title="Sign out from Procurement Centre"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0f5e59] text-white shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f7c531]' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <ProcurementOverview onNavigateTab={(tab) => handleTabChange(tab as ProcurementDashboardTab)} />
        )}
        {activeTab === 'farmers' && <FarmerManagement />}
        {activeTab === 'slots' && <SlotManagement />}
        {activeTab === 'tokens' && <TokenManagement />}
        {activeTab === 'procurement' && <ProcurementManagement />}
        {activeTab === 'payments' && <PaymentTracking />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Kisan Marg Government Procurement Infrastructure &bull; Parseoni Hub</span>
          </div>
          <div>Strict Operator Access Scoped to Centre ID: ctr_parseoni</div>
        </div>
      </footer>
    </div>
  );
};
export default ProcurementDashboard;
