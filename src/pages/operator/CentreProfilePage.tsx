import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Clock, Gauge, Sprout, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const CentreProfilePage: React.FC = () => {
  const { operator } = useAuth();
  const centreId = operator?.centreId || 'centre-parseoni';
  const [centre, setCentre] = useState<any>(null);

  useEffect(() => {
    api.getCentre(centreId).then((res) => setCentre(res));
  }, [centreId]);

  if (!centre) {
    return <div className="bg-white p-8 rounded-2xl animate-pulse h-64" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
          Station Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
          Centre Operational Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Parameters governing intake capacity, operating hours, and queue calculation variables.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{centre.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ACTIVE DEPOT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Station Code: PRS-WB-01 • District: {centre.district}, {centre.state}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block">Daily Intake Capacity</span>
            <strong className="text-slate-900 text-sm mt-0.5 block">
              {centre.dailyCapacity} Vehicles / Day
            </strong>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block">Working Operating Hours</span>
            <strong className="text-slate-900 text-sm mt-0.5 block font-mono">
              {centre.workingStart} – {centre.workingEnd}
            </strong>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block">Base Processing Duration</span>
            <strong className="text-slate-900 text-sm mt-0.5 block">
              {centre.averageProcessingMinutes} Minutes per Vehicle
            </strong>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-slate-400 block">Tonnage Factor (Queue Adjustment)</span>
            <strong className="text-slate-900 text-sm mt-0.5 block font-mono">
              +{centre.quantityProcessingFactor} min per Quintal
            </strong>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            Authorized Procurement Intake Commodities
          </h4>
          <div className="flex flex-wrap gap-2">
            {centre.acceptedCrops?.map((c: any) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
              >
                🌾 {c.name} ({c.category})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
