import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export const PaymentUpdatesPage: React.FC = () => {
  const { lastFirestoreUpdate } = useSocket();
  const { operator } = useAuth();
  const centreId = operator?.centreId || 'centre-parseoni';

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPayments = () => {
    setLoading(true);
    api.getCentrePayments(centreId)
      .then((res) => setPayments(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (lastFirestoreUpdate && lastFirestoreUpdate.collection !== 'payments') return;
    fetchPayments();
  }, [centreId, lastFirestoreUpdate?.timestamp]);

  const handleUpdate = async (paymentId: string, newStatus: string) => {
    setUpdatingId(paymentId);
    try {
      const txRef = newStatus === 'ON_THE_WAY'
        ? `DBT-MH-PFMS-${Math.floor(100000 + Math.random() * 900000)}`
        : `UTR-RBI-${Math.floor(100000000 + Math.random() * 900000000)}`;

      await api.updatePaymentStatus(paymentId, {
        status: newStatus,
        transactionRef: txRef,
      });
      fetchPayments();
    } catch (err: any) {
      alert(err.message || 'Payment status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Finance &amp; Sanctions Desk
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Procurement Payment Updates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize DBT batches, dispatch payment processing references, and verify bank credits for farmers.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>

      {/* Payments Cards (Section 22) */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Payment Records</p>
            <p className="text-xs text-slate-400 mt-0.5">Generated procurement slips will automatically appear here for DBT processing.</p>
          </div>
        ) : (
          payments.map((p) => {
            const isCompleted = p.status === 'COMPLETED';
            const isOnTheWay = p.status === 'ON_THE_WAY';
            const isPending = p.status === 'NOT_FINALIZED' || p.status === 'PENDING';

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                      Slip: {p.slipNumber || 'SLIP-2026-001'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOnTheWay
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">
                    Farmer: {p.farmerName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>Account: •••• {p.accountLastFour || '4921'}</span>
                    {p.transactionRef && (
                      <span className="font-mono text-slate-700">Ref: {p.transactionRef}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Sanctioned Amount</span>
                    <span className="text-xl font-mono font-black text-emerald-900">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        disabled={updatingId === p.id}
                        onClick={() => handleUpdate(p.id, 'ON_THE_WAY')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch to PFMS (On the Way)</span>
                      </button>
                    )}

                    {isOnTheWay && (
                      <button
                        disabled={updatingId === p.id}
                        onClick={() => handleUpdate(p.id, 'COMPLETED')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Bank Credit</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Disbursed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
