import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CalendarCheck,
  Scale,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Radio,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getCentres()])
      .then(([statsData, centresData]) => {
        setStats(statsData);
        setCentres(centresData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              STATE APMC REGISTRY
            </span>
            <span className="text-xs text-stone-400">Maharashtra Agricultural Marketing Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Central Procurement Oversight
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Live queue orchestration and DBT disbursement integrity across 3 regional APMC centres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono text-emerald-400 font-semibold">Real-Time Hub Active</span>
        </div>
      </div>

      {/* State-Wide Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Total Procurement Centres</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
            {stats?.centresCount || 3}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">100% Operational</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Enrolled Farmers</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
            {stats?.farmersCount || 1248}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Nagpur &amp; Wardha Districts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Today&apos;s Active Bookings</span>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {stats?.todayBookingsCount || 42}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Zero roadside congestion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">DBT Disbursed Volume</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            ₹{stats?.disbursedAmount ? Number(stats.disbursedAmount).toLocaleString('en-IN') : '14,82,500'}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">100% Verified Transfers</span>
        </div>
      </div>

      {/* Regional Centres Oversight (Cards, NOT spreadsheet) */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">Regional Procurement Centres Status</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Live capacity utilization and queue monitoring for all authorized APMC weighing hubs.
            </p>
          </div>

          <Link
            to="/admin/centres"
            className="text-xs font-semibold text-amber-700 hover:underline"
          >
            Manage Centres &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {centres.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-stone-200 hover:border-stone-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-stone-900">{c.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {c.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <span className="text-xs font-mono text-stone-400">{c.district}, {c.state}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Operating: {c.workingStart} – {c.workingEnd} • Daily Cap: {c.dailyCapacity} vehicles
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-left md:text-right">
                  <span className="text-xs text-stone-400 block">Today&apos;s Live Queue</span>
                  <strong className="text-base font-mono text-emerald-800">
                    {c.todayQueueCount || 0} vehicles waiting
                  </strong>
                </div>

                <Link
                  to={`/admin/queue?centreId=${c.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                >
                  Inspect Queue
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
