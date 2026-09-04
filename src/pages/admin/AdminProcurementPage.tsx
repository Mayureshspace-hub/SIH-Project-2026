import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, Download, Search } from 'lucide-react';
import { api } from '../../services/api';

export const AdminProcurementPage: React.FC = () => {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllProcurements()
      .then((res) => setProcurements(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            State Audit Trail
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Procurement Records Master Log
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Certified weighbridge receipts and sanctioned produce intake across centres.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Print Audit Sheet</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-stone-200 animate-pulse" />
          ))}
        </div>
      ) : procurements.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
          <p className="text-sm font-semibold text-stone-700">No procurement slips logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {procurements.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {p.slipNumber}
                  </span>
                  <strong className="text-sm text-stone-900">{p.farmerName}</strong>
                  <span className="text-xs text-stone-500 font-medium">({p.centreName})</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Grade {p.grade}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                  <span>🌾 {p.cropName}</span>
                  <span>Gross: {p.deliveredQuantity} qtl</span>
                  <span>Accepted: <strong>{p.acceptedQuantity} qtl</strong></span>
                  <span>Moisture: {p.moisturePercentage}%</span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[11px] text-stone-400 block">Sanctioned Value</span>
                <span className="text-base font-mono font-bold text-emerald-900">
                  ₹{Number(p.grossAmount).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-400 block font-mono">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
