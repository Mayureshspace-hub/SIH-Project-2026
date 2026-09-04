import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Scale, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DailyReportsPage: React.FC = () => {
  const { operator } = useAuth();
  const centreId = operator?.centreId || 'centre-parseoni';

  const [queueData, setQueueData] = useState<any>(null);

  useEffect(() => {
    api.getCenterTodayQueue(centreId).then((res) => {
      setQueueData(res);
    });
  }, [centreId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Centre Analytics
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Daily Operational Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Throughput velocity, average weighbridge processing cycle, and daily commodity tonnage.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Daily PDF</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 block font-medium">Daily Procured Volume</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            342.5 Quintals
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            +18% vs yesterday intake
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 block font-medium">Avg Cycle Time / Vehicle</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            14.2 Minutes
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Down from 4.5 hours historic roadside wait
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 block font-medium">Sanctioned Turnover Today</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ₹7,87,750
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            100% routed through PFMS DBT
          </span>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">Procurement Intake by Crop</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>🌾 Paddy (Dhan Grade A)</span>
              <span>240 Quintals (70%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-emerald-700 h-full rounded-full" style={{ width: '70%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>🌱 Soybean (Pili)</span>
              <span>82.5 Quintals (24%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '24%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>🌿 Bengal Gram (Chana)</span>
              <span>20 Quintals (6%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '6%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
