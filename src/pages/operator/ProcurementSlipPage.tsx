import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Scale,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const ProcurementSlipPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { operator } = useAuth();
  const centreId = operator?.centreId || 'centre-parseoni';

  const initialBookingId = searchParams.get('bookingId') || '';
  const initialFarmer = searchParams.get('farmerName') || '';
  const initialCrop = searchParams.get('cropName') || '';
  const initialQty = searchParams.get('quantity') || '';
  const initialToken = searchParams.get('tokenNumber') || '';

  const [bookingId, setBookingId] = useState(initialBookingId);
  const [deliveredQuantity, setDeliveredQuantity] = useState(initialQty);
  const [acceptedQuantity, setAcceptedQuantity] = useState(initialQty);
  const [moisturePercentage, setMoisturePercentage] = useState('12.5');
  const [grade, setGrade] = useState('A');
  const [sanctionedRate, setSanctionedRate] = useState('2300'); // Standard MSP for Paddy
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active bookings list for selection if no bookingId in URL
  const [activeBookings, setActiveBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!initialBookingId) {
      api.getCenterTodayQueue(centreId).then((res) => {
        const waiting = (res.queue || []).filter((q: any) => q.status === 'PROCESSING' || q.status === 'CALLED' || q.status === 'WAITING');
        setActiveBookings(waiting);
        if (waiting.length > 0) {
          setBookingId(waiting[0].bookingId);
          setDeliveredQuantity(String(waiting[0].quantity));
          setAcceptedQuantity(String(waiting[0].quantity));
        }
      });
    }
  }, [initialBookingId, centreId]);

  const grossValuation = (Number(acceptedQuantity) || 0) * (Number(sanctionedRate) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) {
      setError('Please select an active booking/token');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.createProcurementSlip({
        bookingId,
        deliveredQuantity: Number(deliveredQuantity),
        acceptedQuantity: Number(acceptedQuantity),
        moisturePercentage: Number(moisturePercentage),
        grade,
        sanctionedRate: Number(sanctionedRate),
      });
      setSuccessData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to issue procurement slip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
          Official APMC Logging
        </span>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
          Generate Weighment &amp; Procurement Slip
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Record certified gross weight, moisture deductions, and sanction official APMC purchase valuation.
        </p>
      </div>

      {successData ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-700" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              SLIP RECORDED &amp; DISPATCHED
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-2">
              Slip #{successData.slipNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Procurement record locked to registry. Digital voucher dispatched to farmer dashboard.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Accepted Quantity:</span>
              <strong>{successData.acceptedQuantity} Quintals</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Moisture &amp; Grade:</span>
              <strong>{successData.moisturePercentage}% (Grade {successData.grade})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sanctioned Gross:</span>
              <strong className="text-emerald-800 font-mono text-sm">
                ₹{Number(successData.grossAmount).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSuccessData(null);
                navigate('/operator/queue');
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              Return to Live Queue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking / Token Selection */}
          {!initialBookingId && activeBookings.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Token at Scale</label>
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl"
              >
                {activeBookings.map((b) => (
                  <option key={b.bookingId} value={b.bookingId}>
                    {b.tokenNumber} — {b.farmerName} ({b.cropName}, {b.quantity} qtl)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Assigned Token</span>
              <strong className="font-mono text-base text-slate-900">{initialToken}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Farmer Name</span>
              <strong className="text-base text-slate-900">{initialFarmer}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivered Gross Weight (qtl)</label>
              <input
                type="number"
                step="0.1"
                required
                value={deliveredQuantity}
                onChange={(e) => {
                  setDeliveredQuantity(e.target.value);
                  setAcceptedQuantity(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Net Accepted Weight (qtl)</label>
              <input
                type="number"
                step="0.1"
                required
                value={acceptedQuantity}
                onChange={(e) => setAcceptedQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Moisture Content (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={moisturePercentage}
                onChange={(e) => setMoisturePercentage(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quality Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full py-2 px-3 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Permissible)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sanctioned MSP Rate (₹/qtl)</label>
              <input
                type="number"
                required
                value={sanctionedRate}
                onChange={(e) => setSanctionedRate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Computed Gross Amount */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800">Computed Procurement Valuation</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">Net Accepted × Sanctioned MSP</p>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-950">
                ₹{grossValuation.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Recording & Finalizing Slip...' : 'Issue Certified Procurement Slip'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
