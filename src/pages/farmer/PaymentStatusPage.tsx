import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export const PaymentStatusPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyPayments()
      .then((res) => setPayments(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
          Direct Benefit Transfer
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
          Payment Status
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Direct government DBT disbursement tracking. Real-time status without speculative or unverified estimates.
        </p>
      </div>

      {/* Strict Compliance Notice Banner (Section 20 & 21) */}
      <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-600">
        <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p>
          <strong>Procurement Integrity Rule:</strong> Payment records and disbursed amounts are published strictly after physical weighment, moisture grading, and official sanction by the centre officer. KisanSetu does not display speculative or unconfirmed sums prior to authorization.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-36 bg-white rounded-3xl border border-stone-200 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center">
          <CreditCard className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-stone-800">No Active Payment Records</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Once a procurement slip is generated and sanctioned for DBT transfer, its live disbursement status will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => {
            const isCompleted = p.status === 'COMPLETED';
            const isOnTheWay = p.status === 'ON_THE_WAY';
            const isPending = p.status === 'NOT_FINALIZED' || p.status === 'PENDING';

            return (
              <div
                key={p.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOnTheWay
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {isCompleted
                          ? 'Payment Completed'
                          : isOnTheWay
                          ? 'Payment On the Way'
                          : 'Payment Not Finalized'}
                      </span>
                      <span className="font-mono text-xs text-stone-400">
                        Slip #{p.slipNumber || 'SLIP-2026-001'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900">
                      {p.centreName}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-stone-400 block">Sanctioned Amount</span>
                    {isPending ? (
                      <span className="text-xs font-semibold text-stone-500 italic">
                        Pending Centre Finalization
                      </span>
                    ) : (
                      <span className="text-2xl font-mono font-black text-emerald-900">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status-specific messaging */}
                {isPending && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                    <p className="font-semibold text-stone-800 mb-0.5">Your procurement centre has not finalized the payment yet.</p>
                    <p className="text-[11px] text-stone-500">
                      Official quality verification and deductions review are in progress. The official DBT voucher will be dispatched once verified.
                    </p>
                  </div>
                )}

                {isOnTheWay && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                      <span>Direct Benefit Transfer Dispatched to Public Financial Management System (PFMS)</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Authorized by centre accounts. Bank clearing cycle typically takes 24–48 hours to credit into your Aadhaar-linked account.
                    </p>
                    {p.transactionRef && (
                      <p className="mt-2 font-mono text-xs font-semibold">
                        DBT Batch Ref: <strong>{p.transactionRef}</strong>
                      </p>
                    )}
                  </div>
                )}

                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Direct Benefit Transfer Credited to Bank Account</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px] text-emerald-900">
                      <div>UTR Ref: <strong>{p.transactionRef}</strong></div>
                      <div>Bank Account: <strong>Ending in •••• {p.accountLastFour || '4921'}</strong></div>
                      <div>Credited On: <strong>{new Date(p.completedAt || p.updatedAt).toLocaleDateString()}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
