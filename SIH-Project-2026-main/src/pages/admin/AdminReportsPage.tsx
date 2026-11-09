import React from 'react';
import { BarChart3, TrendingUp, Download, CheckCircle2 } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            State Analytics &amp; Forecasting
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            APMC Procurement Reports
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            District-wide intake analytics, queue efficiency comparisons, and seasonal crop distribution.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 block font-medium">Seasonal Procurement Target</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
            45,000 Quintals
          </div>
          <div className="mt-2 w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="bg-emerald-700 h-full rounded-full" style={{ width: '64%' }} />
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
            64% of Kharif 2026 Target Achieved
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 block font-medium">Average Queue Wait Time</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            18.5 Minutes
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            87% reduction compared to previous manual token season
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 block font-medium">Direct DBT Disbursement Total</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
            ₹1,03,50,000
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
            Average clearance window: 28 hours
          </span>
        </div>
      </div>

      {/* District Performance */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-stone-900">District Centre Throughput Performance</h3>
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Parseoni Procurement Centre (Nagpur)</span>
              <span className="text-emerald-800">92% Operational Efficiency • 12m avg wait</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="bg-emerald-700 h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Ramtek APMC Depot (Nagpur)</span>
              <span className="text-emerald-800">88% Operational Efficiency • 18m avg wait</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="bg-emerald-700 h-full rounded-full" style={{ width: '88%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Hingna Grain Procurement Hub (Nagpur)</span>
              <span className="text-emerald-800">85% Operational Efficiency • 22m avg wait</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="bg-emerald-700 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
