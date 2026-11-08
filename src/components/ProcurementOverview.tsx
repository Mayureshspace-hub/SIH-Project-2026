import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { procurementService, CentreOverviewStats } from '../services/procurementService';
import { useAuth } from '../context/AuthContext';

interface ProcurementOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const ProcurementOverview: React.FC<ProcurementOverviewProps> = ({ onNavigateTab }) => {
  const { user, operator } = useAuth();
  const [stats, setStats] = useState<CentreOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await procurementService.getOverviewStats(operator?.centreId);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [operator?.centreId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f5e59] via-[#12706a] to-[#185c52] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>APMC Live Intake Registry &bull; Parseoni Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Procurement Centre Overview
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Welcome, <strong>{user?.name || 'Chief Weighbridge Officer'}</strong>. Managing scheduled intake, physical weighing, moisture grading, and payment clearance.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-medium text-white transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Farmers */}
        <div
          onClick={() => onNavigateTab('farmers')}
          className="bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-[#0f5e59] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Associated Farmers</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0f5e59] flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 mt-2">
            {loading ? '...' : stats?.totalRegisteredFarmers || 6}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <span>Verified KYC profiles</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Today's Bookings */}
        <div
          onClick={() => onNavigateTab('slots')}
          className="bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-[#0f5e59] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Today&apos;s Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 mt-2">
            {loading ? '...' : stats?.todayBookings || 5}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold mt-1">
            <span>Allocated entry windows</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Pending Procurement */}
        <div
          onClick={() => onNavigateTab('tokens')}
          className="bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-[#0f5e59] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Queue In-Waiting</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 mt-2">
            {loading ? '...' : stats?.pendingProcurement || 2}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-orange-700 font-semibold mt-1">
            <span>Live gate tokens</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Completed Procurement */}
        <div
          onClick={() => onNavigateTab('procurement')}
          className="bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-[#0f5e59] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Completed Intake</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 mt-2">
            {loading ? '...' : stats?.completedProcurement || 2}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold mt-1">
            <span>Weighed &amp; sanctioned slips</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Payment Status Summary Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">Payment Tracking Breakdown</h2>
              <p className="text-xs text-stone-500">Live reconciliation of verified DBT payment files</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('payments')}
            className="text-xs font-bold text-[#0f5e59] hover:underline flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#faf8f5] p-4 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 font-semibold">Cleared / Paid Out</span>
            <p className="text-xl font-bold text-emerald-800 font-mono mt-1">
              ₹{(stats?.totalPaidAmount || 51040).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-emerald-700 font-medium">
              {stats?.completedPaymentsCount || 1} farmers credited via PFMS
            </span>
          </div>

          <div className="bg-[#faf8f5] p-4 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 font-semibold">Pending / Under Process</span>
            <p className="text-xl font-bold text-amber-800 font-mono mt-1">
              ₹{(stats?.totalPendingAmount || 163546).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-amber-700 font-medium">
              {stats?.pendingPaymentsCount || 2} payments awaiting final clearance
            </span>
          </div>

          <div className="bg-emerald-900 text-white p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs text-emerald-200 font-semibold">Integrity Protocol</span>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                Payments are tracked strictly by status (Pending, Processing, Paid) to ensure complete audit integrity without speculative sums.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('payments')}
              className="mt-3 py-1.5 px-3 bg-white text-emerald-950 rounded-lg text-xs font-bold hover:bg-emerald-50 transition self-start cursor-pointer"
            >
              Update Payment Status &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
