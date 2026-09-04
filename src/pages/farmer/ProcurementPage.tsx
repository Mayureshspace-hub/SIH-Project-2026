import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileText,
  CheckCircle2,
  Download,
  Building,
  Calendar,
  Sparkles,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';

export const ProcurementPage: React.FC = () => {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlip, setActiveSlip] = useState<any | null>(null);

  useEffect(() => {
    api.getMyProcurements()
      .then((res) => {
        setProcurements(res);
        if (res.length > 0) {
          setActiveSlip(res[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
          Official Slips
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
          Procurement Records
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Authorized weighment receipts, moisture grading reports, and sanctioned intake slips.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-3xl border border-stone-200 animate-pulse h-64" />
      ) : procurements.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center">
          <Scale className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-stone-800">No Procurement Slips Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Once your produce is weighed and inspected at the procurement centre, official certified slips will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slips List (Cards) */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              Procurement Receipts ({procurements.length})
            </h3>
            {procurements.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveSlip(p)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition cursor-pointer ${
                  activeSlip?.id === p.id
                    ? 'border-emerald-700 bg-emerald-50/70 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-emerald-900">{p.slipNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Grade {p.grade}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 text-sm">{p.cropName}</h4>
                <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
                  <span>Accepted: <strong>{p.acceptedQuantity} qtl</strong></span>
                  <span className="font-mono text-[11px]">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Slip Official Voucher Preview */}
          {activeSlip && (
            <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-200">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest block">
                    GOVERNMENT OF MAHARASHTRA • APMC PROCUREMENT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-0.5">
                    Official Produce Intake Slip
                  </h2>
                  <p className="font-mono text-xs text-stone-500 mt-0.5">
                    Slip Reference: <strong>{activeSlip.slipNumber}</strong>
                  </p>
                </div>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Procurement Centre</span>
                  <strong className="text-stone-900 font-semibold mt-0.5 block">{activeSlip.centreName}</strong>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Commodity</span>
                  <strong className="text-stone-900 font-semibold mt-0.5 block">🌾 {activeSlip.cropName}</strong>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Date of Weighment</span>
                  <strong className="text-stone-900 font-semibold mt-0.5 block">
                    {new Date(activeSlip.createdAt).toLocaleString()}
                  </strong>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Gross Delivered Quantity</span>
                  <strong className="text-stone-900 font-semibold mt-0.5 block">{activeSlip.deliveredQuantity} Quintals</strong>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Net Accepted Quantity</span>
                  <strong className="text-emerald-800 font-bold text-sm mt-0.5 block">
                    {activeSlip.acceptedQuantity} Quintals
                  </strong>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Moisture &amp; Grade</span>
                  <strong className="text-stone-900 font-semibold mt-0.5 block">
                    {activeSlip.moisturePercentage}% • Grade {activeSlip.grade}
                  </strong>
                </div>
              </div>

              {/* Sanctioned Rate & Valuation */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                    Sanctioned Procurement Rate
                  </span>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Official APMC MSP: ₹{activeSlip.sanctionedRate} / quintal
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-emerald-800 block">Gross Sanctioned Value</span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-emerald-950">
                    ₹{Number(activeSlip.grossAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 border-t border-stone-200 pt-4 flex items-center justify-between">
                <span>Verified by Centre Weighbridge Officer</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tamper-Evident APMC Digital Record
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
