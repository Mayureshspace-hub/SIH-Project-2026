import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, ShieldCheck, Download } from 'lucide-react';
import { api } from '../../services/api';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllPayments()
      .then((res) => setPayments(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            PFMS Integration Desk
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Direct Benefit Transfer (DBT) Reconciliation
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Reconciliation of government MSP funds disbursed straight to Aadhaar-linked farmer bank accounts.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger</span>
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl border border-stone-200 animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
            <p className="text-sm font-semibold text-stone-700">No payment records to display</p>
          </div>
        ) : (
          payments.map((p) => {
            const isCompleted = p.status === 'COMPLETED';
            const isOnTheWay = p.status === 'ON_THE_WAY';

            return (
              <div
                key={p.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOnTheWay
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {p.status}
                    </span>
                    <strong className="text-sm text-stone-900">{p.farmerName}</strong>
                    <span className="text-xs text-stone-500">({p.centreName})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-mono">
                    <span>Slip: {p.slipNumber || 'SLIP-2026-001'}</span>
                    <span>Account: •••• {p.accountLastFour || '4921'}</span>
                    {p.transactionRef && <span>Ref: {p.transactionRef}</span>}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[11px] text-stone-400 block">Sanctioned Transfer</span>
                  <span className="text-xl font-mono font-black text-emerald-900">
                    ₹{Number(p.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
